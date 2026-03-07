# CLAUDE.md — Fantasy Baseball App (Codename: "Diamond")

## What This Project Is

A Sleeper-style fantasy baseball app for iOS. React Native (Expo) frontend, FastAPI backend, Supabase for auth/database/realtime/storage. The key differentiator from ESPN/Yahoo is a **weekly lineup lock mode** where managers set their lineup once per week instead of daily.

## Tech Stack

- **Frontend:** React Native with Expo SDK 52+, Expo Router (file-based routing), TypeScript strict mode
- **State Management:** Zustand (slices: auth, league, draft, roster, chat)
- **Backend:** FastAPI (Python 3.12+), pydantic v2 for schemas, pydantic-settings for config
- **Database:** Supabase (Postgres) with Row Level Security enabled on all tables
- **Realtime:** Supabase Realtime (WebSocket channels for chat, draft, live scores)
- **Auth:** Supabase Auth (email/password, Apple Sign-In, Google Sign-In)
- **Storage:** Supabase Storage (avatars, team logos)
- **Push Notifications:** Expo Push Notifications / APNs
- **Background Jobs:** APScheduler (running inside FastAPI process) for cron tasks
- **External Data:** MLB Stats API (`statsapi.mlb.com`) for scores, stats, schedules, rosters, transactions
- **Key RN Libraries:** react-native-reanimated, react-native-gesture-handler (drag-and-drop lineups), @supabase/supabase-js, expo-notifications, react-native-mmkv (local cache)

## Project Structure

```
/diamond
├── app/                          # React Native (Expo) frontend
│   ├── src/
│   │   ├── app/                  # Expo Router file-based routes
│   │   │   ├── (auth)/           # Login, signup, onboarding screens
│   │   │   ├── (tabs)/           # Main tab navigator
│   │   │   │   ├── home.tsx      # Feed, matchups overview, live scores
│   │   │   │   ├── league.tsx    # League hub, standings, settings
│   │   │   │   ├── roster.tsx    # My team, lineup management
│   │   │   │   ├── players.tsx   # Waiver wire, free agents, player search
│   │   │   │   └── chat.tsx      # League chat & DM list
│   │   │   ├── draft/            # Draft room (live snake/auction)
│   │   │   ├── trade/            # Trade proposal flows
│   │   │   └── player/[id].tsx   # Player detail card
│   │   ├── components/
│   │   │   ├── lineup/           # Drag-drop roster, weekly schedule grid, lock countdown
│   │   │   ├── draft/            # Draft board, pick timer, auto-draft queue
│   │   │   ├── matchup/         # Live scoring matchup view
│   │   │   ├── chat/            # Message bubbles, GIF picker, reactions
│   │   │   └── common/          # Button, Card, Modal, Avatar, Badge, etc.
│   │   ├── hooks/               # useLeague, useMatchup, useRealtime, useDraft, useAuth
│   │   ├── services/            # API client (fetch wrapper → FastAPI base URL)
│   │   ├── stores/              # Zustand: useAuthStore, useLeagueStore, useDraftStore, useRosterStore, useChatStore
│   │   ├── utils/               # Scoring calc helpers, date/week utils, position eligibility maps
│   │   └── types/               # TypeScript interfaces (League, Player, Roster, Matchup, Trade, etc.)
│   ├── app.json
│   ├── tsconfig.json
│   └── package.json
│
├── server/                       # FastAPI backend
│   ├── app/
│   │   ├── main.py              # FastAPI app init, CORS, lifespan (start APScheduler here)
│   │   ├── config.py            # pydantic-settings: SUPABASE_URL, SUPABASE_SERVICE_KEY, MLB_API_BASE, etc.
│   │   ├── dependencies.py      # get_current_user dependency (verify Supabase JWT from Authorization header)
│   │   ├── routers/
│   │   │   ├── leagues.py       # POST /leagues, GET /leagues/{id}, PUT /leagues/{id}/settings, POST /leagues/{id}/join
│   │   │   ├── drafts.py        # POST /drafts/{id}/start, POST /drafts/{id}/pick, GET /drafts/{id}/board
│   │   │   ├── rosters.py       # GET /rosters/me, PUT /rosters/lineup, POST /rosters/add-drop
│   │   │   ├── matchups.py      # GET /matchups/current, GET /matchups/{id}/scores
│   │   │   ├── trades.py        # POST /trades, PUT /trades/{id}/accept, PUT /trades/{id}/reject
│   │   │   ├── waivers.py       # POST /waivers/claim, GET /waivers/results
│   │   │   ├── players.py       # GET /players/search, GET /players/{mlb_id}, GET /players/{mlb_id}/stats
│   │   │   └── notifications.py # GET /notifications, PUT /notifications/preferences
│   │   ├── services/
│   │   │   ├── mlb_stats.py     # MLB Stats API client (httpx async). Endpoints: schedule, boxscore, roster, transactions
│   │   │   ├── scoring.py       # Scoring engine: calculate fantasy points from raw stats. Supports H2H categories + H2H points
│   │   │   ├── lineup_lock.py   # Weekly lock logic: determine lock time from schedule, lock lineups, handle mid-week IL
│   │   │   ├── week_calculator.py # MLB week boundaries (Mon-Sun), player weekly game counts, schedule-aware helpers
│   │   │   ├── draft_engine.py  # Draft state machine: snake order generation, pick validation, auto-draft, auction logic
│   │   │   ├── waiver_processor.py # FAAB resolution (highest bid wins, tiebreak by priority), rolling waiver updates
│   │   │   └── push.py          # Expo Push Notification sender (POST to https://exp.host/--/api/v2/push/send)
│   │   ├── models/              # Pydantic v2 schemas: LeagueCreate, RosterUpdate, TradeProposal, WaiverClaim, etc.
│   │   ├── tasks/               # APScheduler job functions
│   │   │   ├── score_updater.py    # Every 60s during game hours: poll MLB API, upsert player_game_stats, broadcast via Supabase Realtime
│   │   │   ├── lineup_locker.py    # Cron Mon ~11AM ET (or dynamic based on first pitch): lock weekly lineups
│   │   │   ├── waiver_runner.py    # Cron daily/weekly per league config: process pending waiver claims
│   │   │   ├── player_sync.py      # Cron every 6h: sync MLB rosters, IL moves, call-ups, transactions
│   │   │   ├── schedule_sync.py    # Cron weekly: update MLB schedule, recalculate weekly game counts (handles postponements/doubleheaders)
│   │   │   └── news_fetcher.py     # Cron every 30min: pull player news/transaction log from MLB API
│   │   └── utils/
│   │       └── supabase_client.py  # Supabase Python client (supabase-py) initialized with service role key for backend operations
│   ├── pyproject.toml           # uv project — all dependencies declared here
│   ├── .env.example
│   └── Dockerfile
│
├── supabase/                     # Supabase project config
│   ├── migrations/              # SQL migrations (schema + RLS policies)
│   └── seed.sql                 # Optional seed data for development
│
└── CLAUDE.md                    # This file
```

## Database Schema (Supabase/Postgres)

Apply these as Supabase migrations. RLS must be enabled on every table.

### Core Tables

- **profiles** — extends auth.users: id (uuid, PK, references auth.users), display_name, avatar_url, push_token, created_at
- **leagues** — id (uuid, PK), name, commissioner_id (FK profiles), invite_code (unique), scoring_type ('h2h_cat' | 'h2h_points' | 'roto' | 'points'), lineup_mode ('weekly' | 'daily'), roster_config (jsonb), scoring_config (jsonb), waiver_type ('faab' | 'priority' | 'free'), faab_budget (int, default 100), trade_review_period (int days), trade_review_type ('commissioner' | 'league_vote'), playoff_teams (int), max_teams (int), season_year (int), status ('pre_draft' | 'drafting' | 'in_season' | 'playoffs' | 'offseason'), settings (jsonb overflow), created_at
- **league_members** — id, league_id (FK), user_id (FK profiles), team_name, team_logo_url, is_commissioner, faab_remaining, waiver_priority, joined_at. Unique on (league_id, user_id)
- **players** — mlb_id (int, PK), full_name, team, position, eligible_positions (text[]), status ('active' | '10-day-il' | '15-day-il' | '60-day-il' | 'minors'), headshot_url, bats, throws, updated_at
- **rosters** — id, league_member_id (FK), player_mlb_id (FK players), roster_slot ('C' | '1B' | '2B' | 'SS' | '3B' | 'OF' | 'UTIL' | 'SP' | 'RP' | 'BN' | 'IL'), acquired_via, acquired_at. Unique on (league_member_id, player_mlb_id)
- **weekly_lineups** — id, league_member_id (FK), week_number, season_year, lineup (jsonb: slot→mlb_id map), locked_at, is_locked (bool), submitted_at. Unique on (league_member_id, week_number, season_year)
- **matchups** — id, league_id (FK), week_number, season_year, home_member_id (FK), away_member_id (FK), home_score (jsonb), away_score (jsonb), status ('scheduled' | 'active' | 'final'), winner_member_id
- **trades** — id, league_id (FK), proposer_member_id (FK), status ('pending' | 'accepted' | 'rejected' | 'vetoed' | 'cancelled'), proposed_at, review_deadline, processed_at
- **trade_assets** — id, trade_id (FK), from_member_id, to_member_id, player_mlb_id, faab_amount (optional)
- **waiver_claims** — id, league_id (FK), member_id (FK), player_mlb_id, drop_player_mlb_id, bid_amount, priority_rank, status, created_at
- **chat_messages** — id, channel_type ('league' | 'matchup' | 'dm' | 'trade'), channel_id, sender_id (FK profiles), content, message_type ('text' | 'gif' | 'poll' | 'system'), metadata (jsonb), created_at
- **drafts** — id, league_id (FK, unique), draft_type ('snake' | 'auction'), status ('waiting' | 'live' | 'paused' | 'complete'), current_pick, pick_time_seconds, draft_order (uuid[]), started_at, completed_at
- **draft_picks** — id, draft_id (FK), pick_number, member_id (FK), player_mlb_id, bid_amount (auction only), picked_at
- **player_game_stats** — id, player_mlb_id (FK), game_date, mlb_game_id, stat_type ('batting' | 'pitching'), stats (jsonb), fantasy_points (numeric). Unique on (player_mlb_id, mlb_game_id)
- **mlb_schedule** — id, mlb_game_id (int, unique), home_team, away_team, game_date, game_time (timestamptz), status ('scheduled' | 'live' | 'final' | 'postponed'), week_number, season_year

### Key Indexes

- rosters(league_member_id)
- matchups(league_id, week_number, season_year)
- chat_messages(channel_type, channel_id, created_at DESC)
- player_game_stats(player_mlb_id, game_date)
- weekly_lineups(league_member_id, week_number)
- mlb_schedule(week_number, season_year)
- mlb_schedule(home_team, game_date) and mlb_schedule(away_team, game_date)

### RLS Policy Patterns

- League data: viewable only by league members (user_id in league_members for that league_id)
- Roster writes: only the owning user can modify their roster
- Chat reads: user must be a member of the channel's league
- All backend service-role operations bypass RLS (use SUPABASE_SERVICE_KEY)

## Supabase Realtime Channels

|Channel                    |Purpose                                    |Payload                                 |
|---------------------------|-------------------------------------------|----------------------------------------|
|`league:{league_id}:scores`|Live score updates during games            |`{ matchup_id, home_score, away_score }`|
|`league:{league_id}:chat`  |League-wide chat                           |`{ message }`                           |
|`matchup:{matchup_id}:chat`|Matchup trash talk                         |`{ message }`                           |
|`draft:{draft_id}`         |Draft picks, timer events, turn alerts     |`{ event_type, pick, timer }`           |
|`dm:{user1_id}_{user2_id}` |Direct messages (IDs sorted alphabetically)|`{ message }`                           |
|`trade:{trade_id}`         |Trade status changes                       |`{ status, trade }`                     |

## Weekly Lineup Lock Logic (★ Key Feature)

This is the main differentiator. Implementation details:

1. **MLB weeks run Monday–Sunday.** `week_calculator.py` maps any date to its week number + boundaries.
1. **Lock time is dynamic:** Query `mlb_schedule` for the earliest game_time where week_number matches and (home_team or away_team) has a player on any roster in the league. Lock happens at that first pitch time, NOT a static cron.
1. **Pre-lock UI shows:** For each rostered player, query their team's games for the week from `mlb_schedule`. Display game count, opponents, and home/away in a schedule grid.
1. **On lock:** The `lineup_locker` task sets `is_locked = true` on all `weekly_lineups` for that week. If a manager didn't submit, auto-generate from their current `rosters` table (starters stay in starting slots, bench stays on bench).
1. **Mid-week IL exception (commissioner setting in `leagues.settings`):** If a locked starter goes on IL (detected by `player_sync` comparing player status changes), allow a one-time swap: move IL player to IL slot, promote one bench player. Log the transaction in chat as a system message.
1. **Scoring for weekly mode:** Accumulate all `player_game_stats` for locked starters across the full Mon–Sun week. The matchup score updates in real-time as games are played.
1. **Schedule disruptions:** `schedule_sync` runs weekly but also checks for postponements. If a game is postponed, the player's game count for that week decreases. If a makeup game is added to the same week, it increases. The lineup is already locked, so this just affects scoring totals (no re-lock needed).

## Background Job Schedule

All jobs are APScheduler tasks started in FastAPI's lifespan handler.

- `score_updater`: interval 60s, only active during MLB game hours (roughly 11 AM – 1 AM ET, Mar–Oct)
- `lineup_locker`: dynamic trigger based on earliest Monday game time per league per week
- `waiver_runner`: cron, time depends on league config (daily at 3 AM ET, or weekly on Wednesday)
- `player_sync`: interval every 6 hours
- `schedule_sync`: cron, every Monday at 6 AM ET
- `news_fetcher`: interval every 30 minutes

## FastAPI Auth Pattern

Every protected endpoint uses a `get_current_user` dependency that:

1. Reads `Authorization: Bearer <token>` header
1. Decodes and verifies the Supabase JWT (using `SUPABASE_JWT_SECRET`)
1. Returns the user's UUID from the JWT `sub` claim
1. Raises 401 if invalid/expired

## Python Tooling

- **Package manager:** [uv](https://github.com/astral-sh/uv) — all dependencies in `server/pyproject.toml`
- **Run server locally:** `cd server && uv run uvicorn app.main:app --reload`
- **Install deps:** `cd server && uv sync`
- **Install with dev deps:** `cd server && uv sync --dev`
- **Run tests:** `cd server && uv run pytest`
- **Lint/format:** `cd server && uv run ruff check . && uv run ruff format .`

## MLB Stats API Usage

Base URL: `https://statsapi.mlb.com/api/v1`

Key endpoints:

- `/schedule?date=YYYY-MM-DD&sportId=1` — daily game schedule
- `/game/{gamePk}/boxscore` — full box score with player stats
- `/game/{gamePk}/linescore` — live score summary
- `/teams/{teamId}/roster?rosterType=active` — current 26-man roster
- `/people/{personId}` — player bio/details
- `/transactions?startDate=...&endDate=...` — IL moves, trades, call-ups

Rate limit ~10 req/s. Use httpx async client with concurrency limits. Cache schedule data aggressively (it changes infrequently).

## Coding Conventions

- **TypeScript (frontend):** strict mode, no `any`, use interfaces over types for objects, barrel exports from component directories
- **Python (backend):** type hints on all function signatures, async endpoints, pydantic v2 models for all request/response bodies, raise HTTPException with clear status codes and detail messages
- **Naming:** snake_case for Python and SQL, camelCase for TypeScript, PascalCase for React components and Pydantic models
- **Error handling:** FastAPI returns structured `{ "detail": "..." }` errors. Frontend services should catch and surface these in toast notifications.
- **Environment variables:** Never hardcode secrets. Frontend uses Expo's `EXPO_PUBLIC_` prefix for client-safe vars. Backend uses pydantic-settings loading from `.env`.

## Build Order (What to Implement First)

When building features, follow this dependency order:

1. **Supabase migrations** — create all tables, indexes, RLS policies
1. **FastAPI skeleton** — main.py, config, auth dependency, health check endpoint ✅
1. **Auth flow** — Supabase Auth signup/login on frontend, JWT verification on backend ✅ (backend auth dependency done)
1. **Player sync** — `player_sync` task + `players` table population from MLB API (everything else depends on player data)
1. **League CRUD** — create/join/settings on both frontend and backend
1. **Roster management** — add/drop players, basic lineup setting
1. **Weekly lineup system** — `week_calculator`, `mlb_schedule` sync, weekly lineup submission + lock
1. **Draft engine** — state machine on backend, draft room UI with Realtime
1. **Scoring engine** — stats ingestion, fantasy point calculation, matchup scoring
1. **Waivers** — FAAB bidding, claim queue, processing job
1. **Trades** — proposal flow, review period, commissioner tools
1. **Chat** — Realtime channels, message persistence, GIF support
1. **Push notifications** — Expo Push integration, notification preferences
1. **Standings, playoffs, polish** — bracket generation, season archive, performance tuning
