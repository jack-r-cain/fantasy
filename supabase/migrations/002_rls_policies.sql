-- Migration 002: Row Level Security Policies
-- Fantasy Baseball App (Diamond)
-- Enables RLS on all tables and defines access control policies.
-- The backend uses the Supabase service role key which bypasses RLS entirely.

-- ---------------------------------------------------------------------------
-- Helper: reusable function to check league membership
-- Returns true if the calling auth user is a member of the given league.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_league_member(p_league_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.league_members lm
        WHERE lm.league_id = p_league_id
          AND lm.user_id = auth.uid()
    );
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (id = auth.uid());

-- Any authenticated user can update their own profile
CREATE POLICY "profiles_update_own"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Profiles are inserted automatically by the trigger (SECURITY DEFINER),
-- but we allow insert so the trigger's SECURITY DEFINER context can write.
CREATE POLICY "profiles_insert_own"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- leagues
-- ---------------------------------------------------------------------------
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

-- Members can read their leagues
CREATE POLICY "leagues_select_members"
    ON public.leagues FOR SELECT
    TO authenticated
    USING (public.is_league_member(id));

-- Any authenticated user can create a league
CREATE POLICY "leagues_insert_authenticated"
    ON public.leagues FOR INSERT
    TO authenticated
    WITH CHECK (commissioner_id = auth.uid());

-- Only the commissioner can update league settings
CREATE POLICY "leagues_update_commissioner"
    ON public.leagues FOR UPDATE
    TO authenticated
    USING (commissioner_id = auth.uid())
    WITH CHECK (commissioner_id = auth.uid());

-- ---------------------------------------------------------------------------
-- league_members
-- ---------------------------------------------------------------------------
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

-- Members can read all rows in leagues they belong to
CREATE POLICY "league_members_select_same_league"
    ON public.league_members FOR SELECT
    TO authenticated
    USING (public.is_league_member(league_id));

-- Authenticated users can join a league (insert their own membership row)
CREATE POLICY "league_members_insert_self"
    ON public.league_members FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- A member can update only their own membership row (team name, logo, etc.)
CREATE POLICY "league_members_update_own"
    ON public.league_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- players
-- Writable only by service role; all authenticated users can read.
-- ---------------------------------------------------------------------------
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_authenticated"
    ON public.players FOR SELECT
    TO authenticated
    USING (true);

-- No INSERT / UPDATE / DELETE policies for regular users.
-- The backend service role bypasses RLS to sync player data.

-- ---------------------------------------------------------------------------
-- rosters
-- ---------------------------------------------------------------------------
ALTER TABLE public.rosters ENABLE ROW LEVEL SECURITY;

-- All members of the same league can read all rosters in that league
CREATE POLICY "rosters_select_league_members"
    ON public.rosters FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            JOIN public.league_members my_lm
                ON my_lm.league_id = lm.league_id
               AND my_lm.user_id = auth.uid()
            WHERE lm.id = rosters.league_member_id
        )
    );

-- Only the owning user can insert roster entries for their league_member row
CREATE POLICY "rosters_insert_owner"
    ON public.rosters FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = league_member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Only the owning user can update their roster
CREATE POLICY "rosters_update_owner"
    ON public.rosters FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = league_member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Only the owning user can drop (delete) a player from their roster
CREATE POLICY "rosters_delete_owner"
    ON public.rosters FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = league_member_id
              AND lm.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- weekly_lineups
-- ---------------------------------------------------------------------------
ALTER TABLE public.weekly_lineups ENABLE ROW LEVEL SECURITY;

-- League members can read all weekly lineups in their league
CREATE POLICY "weekly_lineups_select_league_members"
    ON public.weekly_lineups FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            JOIN public.league_members my_lm
                ON my_lm.league_id = lm.league_id
               AND my_lm.user_id = auth.uid()
            WHERE lm.id = weekly_lineups.league_member_id
        )
    );

-- Only the owning user can insert/submit their lineup
CREATE POLICY "weekly_lineups_insert_owner"
    ON public.weekly_lineups FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = league_member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Only the owning user can update their lineup (before lock)
CREATE POLICY "weekly_lineups_update_owner"
    ON public.weekly_lineups FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = league_member_id
              AND lm.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- matchups
-- ---------------------------------------------------------------------------
ALTER TABLE public.matchups ENABLE ROW LEVEL SECURITY;

-- Only league members can read matchups for their league
CREATE POLICY "matchups_select_league_members"
    ON public.matchups FOR SELECT
    TO authenticated
    USING (public.is_league_member(league_id));

-- Matchups are created/updated only by the service role (backend scheduler).

-- ---------------------------------------------------------------------------
-- trades
-- ---------------------------------------------------------------------------
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- All league members can see trades in their league
CREATE POLICY "trades_select_league_members"
    ON public.trades FOR SELECT
    TO authenticated
    USING (public.is_league_member(league_id));

-- Only league members can propose a trade (insert)
CREATE POLICY "trades_insert_league_member"
    ON public.trades FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_league_member(league_id)
        AND EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = proposer_member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Trade participants (proposer or any member involved) can update status
-- Kept broad here; fine-grained enforcement done in the FastAPI layer.
CREATE POLICY "trades_update_participant"
    ON public.trades FOR UPDATE
    TO authenticated
    USING (public.is_league_member(league_id));

-- ---------------------------------------------------------------------------
-- trade_assets
-- ---------------------------------------------------------------------------
ALTER TABLE public.trade_assets ENABLE ROW LEVEL SECURITY;

-- League members can read trade assets for trades in their league
CREATE POLICY "trade_assets_select_league_members"
    ON public.trade_assets FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.trades t
            WHERE t.id = trade_assets.trade_id
              AND public.is_league_member(t.league_id)
        )
    );

-- Only league members can insert trade assets (when proposing a trade)
CREATE POLICY "trade_assets_insert_league_member"
    ON public.trade_assets FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.trades t
            WHERE t.id = trade_id
              AND public.is_league_member(t.league_id)
        )
    );

-- ---------------------------------------------------------------------------
-- waiver_claims
-- ---------------------------------------------------------------------------
ALTER TABLE public.waiver_claims ENABLE ROW LEVEL SECURITY;

-- Members can only read their own waiver claims
CREATE POLICY "waiver_claims_select_own"
    ON public.waiver_claims FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Members can submit their own waiver claims
CREATE POLICY "waiver_claims_insert_own"
    ON public.waiver_claims FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Members can cancel (update) their own pending claims
CREATE POLICY "waiver_claims_update_own"
    ON public.waiver_claims FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = member_id
              AND lm.user_id = auth.uid()
        )
    );

-- Members can delete their own pending claims
CREATE POLICY "waiver_claims_delete_own"
    ON public.waiver_claims FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.league_members lm
            WHERE lm.id = member_id
              AND lm.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Channel membership check:
--   'league'  → user must be a member of that league
--   'matchup' → user must be a member of the league that owns that matchup
--   'trade'   → user must be a member of the league that owns that trade
--   'dm'      → channel_id is "{uid1}_{uid2}" sorted; user must be one of them
CREATE POLICY "chat_messages_select_channel_members"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (
        CASE channel_type
            WHEN 'league' THEN
                public.is_league_member(channel_id::uuid)
            WHEN 'matchup' THEN
                EXISTS (
                    SELECT 1
                    FROM public.matchups m
                    WHERE m.id = channel_id::uuid
                      AND public.is_league_member(m.league_id)
                )
            WHEN 'trade' THEN
                EXISTS (
                    SELECT 1
                    FROM public.trades t
                    WHERE t.id = channel_id::uuid
                      AND public.is_league_member(t.league_id)
                )
            WHEN 'dm' THEN
                (auth.uid()::text = split_part(channel_id, '_', 1)
                 OR auth.uid()::text = split_part(channel_id, '_', 2))
            ELSE false
        END
    );

-- Users can only insert messages where they are the sender
CREATE POLICY "chat_messages_insert_sender"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (sender_id = auth.uid());

-- ---------------------------------------------------------------------------
-- drafts
-- ---------------------------------------------------------------------------
ALTER TABLE public.drafts ENABLE ROW LEVEL SECURITY;

-- League members can read draft state
CREATE POLICY "drafts_select_league_members"
    ON public.drafts FOR SELECT
    TO authenticated
    USING (public.is_league_member(league_id));

-- Drafts are created and mutated only by the service role (backend).

-- ---------------------------------------------------------------------------
-- draft_picks
-- ---------------------------------------------------------------------------
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;

-- League members can read all picks in their league's draft
CREATE POLICY "draft_picks_select_league_members"
    ON public.draft_picks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.drafts d
            WHERE d.id = draft_picks.draft_id
              AND public.is_league_member(d.league_id)
        )
    );

-- Draft picks are inserted only by the service role (backend draft engine).

-- ---------------------------------------------------------------------------
-- player_game_stats
-- ---------------------------------------------------------------------------
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read player stats
CREATE POLICY "player_game_stats_select_authenticated"
    ON public.player_game_stats FOR SELECT
    TO authenticated
    USING (true);

-- Stats are written only by the service role (score_updater task).

-- ---------------------------------------------------------------------------
-- mlb_schedule
-- ---------------------------------------------------------------------------
ALTER TABLE public.mlb_schedule ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read the MLB schedule
CREATE POLICY "mlb_schedule_select_authenticated"
    ON public.mlb_schedule FOR SELECT
    TO authenticated
    USING (true);

-- Schedule is written only by the service role (schedule_sync task).
