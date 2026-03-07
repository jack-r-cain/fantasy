-- Migration 001: Initial Schema
-- Fantasy Baseball App (Diamond)
-- Creates all core tables, indexes, and the auth trigger for auto-profile creation

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- Extends auth.users — one row per registered user.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text,
    avatar_url  text,
    push_token  text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

-- Trigger: auto-insert a profile row whenever a new auth.users row is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, avatar_url, push_token, created_at)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        NULL,
        now()
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- leagues
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leagues (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name                text        NOT NULL,
    commissioner_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    invite_code         text        NOT NULL UNIQUE,
    scoring_type        text        NOT NULL CHECK (scoring_type IN ('h2h_cat', 'h2h_points', 'roto', 'points')),
    lineup_mode         text        NOT NULL CHECK (lineup_mode IN ('weekly', 'daily')),
    roster_config       jsonb       NOT NULL DEFAULT '{}',
    scoring_config      jsonb       NOT NULL DEFAULT '{}',
    waiver_type         text        NOT NULL CHECK (waiver_type IN ('faab', 'priority', 'free')),
    faab_budget         int         NOT NULL DEFAULT 100,
    trade_review_period int,
    trade_review_type   text        CHECK (trade_review_type IN ('commissioner', 'league_vote')),
    playoff_teams       int,
    max_teams           int         NOT NULL DEFAULT 12,
    season_year         int         NOT NULL,
    status              text        NOT NULL DEFAULT 'pre_draft' CHECK (status IN ('pre_draft', 'drafting', 'in_season', 'playoffs', 'offseason')),
    settings            jsonb       NOT NULL DEFAULT '{}',
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- league_members
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.league_members (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id        uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    user_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    team_name        text        NOT NULL,
    team_logo_url    text,
    is_commissioner  bool        NOT NULL DEFAULT false,
    faab_remaining   int,
    waiver_priority  int,
    joined_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (league_id, user_id)
);

-- ---------------------------------------------------------------------------
-- players
-- Populated/maintained by the player_sync background task.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.players (
    mlb_id              int         PRIMARY KEY,
    full_name           text        NOT NULL,
    team                text,
    position            text,
    eligible_positions  text[]      NOT NULL DEFAULT '{}',
    status              text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', '10-day-il', '15-day-il', '60-day-il', 'minors')),
    headshot_url        text,
    bats                text,
    throws              text,
    updated_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- rosters
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rosters (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_member_id    uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    player_mlb_id       int         NOT NULL REFERENCES public.players(mlb_id) ON DELETE CASCADE,
    roster_slot         text        NOT NULL CHECK (roster_slot IN ('C','1B','2B','SS','3B','OF','UTIL','SP','RP','BN','IL')),
    acquired_via        text,
    acquired_at         timestamptz NOT NULL DEFAULT now(),
    UNIQUE (league_member_id, player_mlb_id)
);

-- ---------------------------------------------------------------------------
-- weekly_lineups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.weekly_lineups (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_member_id    uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    week_number         int         NOT NULL,
    season_year         int         NOT NULL,
    lineup              jsonb       NOT NULL DEFAULT '{}',
    locked_at           timestamptz,
    is_locked           bool        NOT NULL DEFAULT false,
    submitted_at        timestamptz,
    UNIQUE (league_member_id, week_number, season_year)
);

-- ---------------------------------------------------------------------------
-- matchups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.matchups (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id           uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    week_number         int         NOT NULL,
    season_year         int         NOT NULL,
    home_member_id      uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    away_member_id      uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    home_score          jsonb       NOT NULL DEFAULT '{}',
    away_score          jsonb       NOT NULL DEFAULT '{}',
    status              text        NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'final')),
    winner_member_id    uuid
);

-- ---------------------------------------------------------------------------
-- trades
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trades (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id           uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    proposer_member_id  uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    status              text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'vetoed', 'cancelled')),
    proposed_at         timestamptz NOT NULL DEFAULT now(),
    review_deadline     timestamptz,
    processed_at        timestamptz
);

-- ---------------------------------------------------------------------------
-- trade_assets
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.trade_assets (
    id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id        uuid    NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
    from_member_id  uuid    NOT NULL,
    to_member_id    uuid    NOT NULL,
    player_mlb_id   int,
    faab_amount     int
);

-- ---------------------------------------------------------------------------
-- waiver_claims
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.waiver_claims (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id           uuid        NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
    member_id           uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    player_mlb_id       int         NOT NULL,
    drop_player_mlb_id  int,
    bid_amount          int,
    priority_rank       int,
    status              text        NOT NULL DEFAULT 'pending',
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- chat_messages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_type    text        NOT NULL CHECK (channel_type IN ('league', 'matchup', 'dm', 'trade')),
    channel_id      text        NOT NULL,
    sender_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content         text,
    message_type    text        NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'gif', 'poll', 'system')),
    metadata        jsonb       NOT NULL DEFAULT '{}',
    created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- drafts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.drafts (
    id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    league_id           uuid        NOT NULL UNIQUE REFERENCES public.leagues(id) ON DELETE CASCADE,
    draft_type          text        NOT NULL CHECK (draft_type IN ('snake', 'auction')),
    status              text        NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'live', 'paused', 'complete')),
    current_pick        int         NOT NULL DEFAULT 1,
    pick_time_seconds   int         NOT NULL DEFAULT 90,
    draft_order         uuid[]      NOT NULL DEFAULT '{}',
    started_at          timestamptz,
    completed_at        timestamptz
);

-- ---------------------------------------------------------------------------
-- draft_picks
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.draft_picks (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    draft_id        uuid        NOT NULL REFERENCES public.drafts(id) ON DELETE CASCADE,
    pick_number     int         NOT NULL,
    member_id       uuid        NOT NULL REFERENCES public.league_members(id) ON DELETE CASCADE,
    player_mlb_id   int         NOT NULL,
    bid_amount      int,
    picked_at       timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- player_game_stats
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.player_game_stats (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    player_mlb_id   int         NOT NULL REFERENCES public.players(mlb_id) ON DELETE CASCADE,
    game_date       date        NOT NULL,
    mlb_game_id     int         NOT NULL,
    stat_type       text        NOT NULL CHECK (stat_type IN ('batting', 'pitching')),
    stats           jsonb       NOT NULL DEFAULT '{}',
    fantasy_points  numeric     NOT NULL DEFAULT 0,
    UNIQUE (player_mlb_id, mlb_game_id)
);

-- ---------------------------------------------------------------------------
-- mlb_schedule
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mlb_schedule (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    mlb_game_id     int         NOT NULL UNIQUE,
    home_team       text        NOT NULL,
    away_team       text        NOT NULL,
    game_date       date        NOT NULL,
    game_time       timestamptz,
    status          text        NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'final', 'postponed')),
    week_number     int         NOT NULL,
    season_year     int         NOT NULL
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rosters_league_member_id
    ON public.rosters (league_member_id);

CREATE INDEX IF NOT EXISTS idx_matchups_league_week_season
    ON public.matchups (league_id, week_number, season_year);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel
    ON public.chat_messages (channel_type, channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_player_game_stats_player_date
    ON public.player_game_stats (player_mlb_id, game_date);

CREATE INDEX IF NOT EXISTS idx_weekly_lineups_member_week
    ON public.weekly_lineups (league_member_id, week_number);

CREATE INDEX IF NOT EXISTS idx_mlb_schedule_week_season
    ON public.mlb_schedule (week_number, season_year);

CREATE INDEX IF NOT EXISTS idx_mlb_schedule_home_team_date
    ON public.mlb_schedule (home_team, game_date);

CREATE INDEX IF NOT EXISTS idx_mlb_schedule_away_team_date
    ON public.mlb_schedule (away_team, game_date);
