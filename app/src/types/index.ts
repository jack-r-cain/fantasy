// src/types/index.ts

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  push_token: string | null;
  created_at: string;
}

export type ScoringType = 'h2h_cat' | 'h2h_points' | 'roto' | 'points';
export type LineupMode = 'weekly' | 'daily';
export type WaiverType = 'faab' | 'priority' | 'free';
export type LeagueStatus = 'pre_draft' | 'drafting' | 'in_season' | 'playoffs' | 'offseason';
export type TradeReviewType = 'commissioner' | 'league_vote';

export interface RosterConfig {
  C: number;
  '1B': number;
  '2B': number;
  SS: number;
  '3B': number;
  OF: number;
  UTIL: number;
  SP: number;
  RP: number;
  BN: number;
  IL: number;
}

export interface ScoringConfig {
  // batting
  H?: number;
  '2B'?: number;
  '3B'?: number;
  HR?: number;
  RBI?: number;
  R?: number;
  SB?: number;
  BB?: number;
  K?: number;
  AVG?: number;
  OBP?: number;
  SLG?: number;
  OPS?: number;
  // pitching
  W?: number;
  L?: number;
  SV?: number;
  HLD?: number;
  ERA?: number;
  WHIP?: number;
  K9?: number;
  IP?: number;
  QS?: number;
  HA?: number;
  BBA?: number;
}

export interface League {
  id: string;
  name: string;
  commissioner_id: string;
  invite_code: string;
  scoring_type: ScoringType;
  lineup_mode: LineupMode;
  roster_config: RosterConfig;
  scoring_config: ScoringConfig;
  waiver_type: WaiverType;
  faab_budget: number;
  trade_review_period: number;
  trade_review_type: TradeReviewType;
  playoff_teams: number;
  max_teams: number;
  season_year: number;
  status: LeagueStatus;
  settings: Record<string, unknown>;
  created_at: string;
}

export interface LeagueMember {
  id: string;
  league_id: string;
  user_id: string;
  team_name: string;
  team_logo_url: string | null;
  is_commissioner: boolean;
  faab_remaining: number;
  waiver_priority: number;
  joined_at: string;
  profile?: Profile;
}

export type PlayerStatus = 'active' | '10-day-il' | '15-day-il' | '60-day-il' | 'minors';
export type RosterSlot = 'C' | '1B' | '2B' | 'SS' | '3B' | 'OF' | 'UTIL' | 'SP' | 'RP' | 'BN' | 'IL';

export interface Player {
  mlb_id: number;
  full_name: string;
  team: string;
  position: string;
  eligible_positions: RosterSlot[];
  status: PlayerStatus;
  headshot_url: string | null;
  bats: string;
  throws: string;
  updated_at: string;
}

export interface RosterEntry {
  id: string;
  league_member_id: string;
  player_mlb_id: number;
  roster_slot: RosterSlot;
  acquired_via: string;
  acquired_at: string;
  player?: Player;
}

export interface WeeklyLineup {
  id: string;
  league_member_id: string;
  week_number: number;
  season_year: number;
  lineup: Record<RosterSlot, number>;
  locked_at: string | null;
  is_locked: boolean;
  submitted_at: string | null;
}

export type MatchupStatus = 'scheduled' | 'active' | 'final';

export interface Matchup {
  id: string;
  league_id: string;
  week_number: number;
  season_year: number;
  home_member_id: string;
  away_member_id: string;
  home_score: Record<string, number> | null;
  away_score: Record<string, number> | null;
  status: MatchupStatus;
  winner_member_id: string | null;
}

export type TradeStatus = 'pending' | 'accepted' | 'rejected' | 'vetoed' | 'cancelled';

export interface Trade {
  id: string;
  league_id: string;
  proposer_member_id: string;
  status: TradeStatus;
  proposed_at: string;
  review_deadline: string | null;
  processed_at: string | null;
  assets?: TradeAsset[];
}

export interface TradeAsset {
  id: string;
  trade_id: string;
  from_member_id: string;
  to_member_id: string;
  player_mlb_id: number | null;
  faab_amount: number | null;
  player?: Player;
}

export interface WaiverClaim {
  id: string;
  league_id: string;
  member_id: string;
  player_mlb_id: number;
  drop_player_mlb_id: number | null;
  bid_amount: number;
  priority_rank: number;
  status: string;
  created_at: string;
  player?: Player;
}

export type ChannelType = 'league' | 'matchup' | 'dm' | 'trade';
export type MessageType = 'text' | 'gif' | 'poll' | 'system';

export interface ChatMessage {
  id: string;
  channel_type: ChannelType;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  metadata: Record<string, unknown> | null;
  created_at: string;
  sender?: Profile;
}

export type DraftType = 'snake' | 'auction';
export type DraftStatus = 'waiting' | 'live' | 'paused' | 'complete';

export interface Draft {
  id: string;
  league_id: string;
  draft_type: DraftType;
  status: DraftStatus;
  current_pick: number;
  pick_time_seconds: number;
  draft_order: string[];
  started_at: string | null;
  completed_at: string | null;
}

export interface DraftPick {
  id: string;
  draft_id: string;
  pick_number: number;
  member_id: string;
  player_mlb_id: number;
  bid_amount: number | null;
  picked_at: string;
  player?: Player;
  member?: LeagueMember;
}

export interface PlayerGameStats {
  id: string;
  player_mlb_id: number;
  game_date: string;
  mlb_game_id: number;
  stat_type: 'batting' | 'pitching';
  stats: Record<string, number>;
  fantasy_points: number;
}

export interface MLBGame {
  id: string;
  mlb_game_id: number;
  home_team: string;
  away_team: string;
  game_date: string;
  game_time: string;
  status: 'scheduled' | 'live' | 'final' | 'postponed';
  week_number: number;
  season_year: number;
}

// API response types
export interface ApiError {
  detail: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}
