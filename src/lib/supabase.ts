import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Team = {
  id: string;
  name: string;
  short_name: string;
  color: string;
  logo_letter: string;
};

export type Player = {
  id: string;
  team_id: string;
  name: string;
  number: number;
  teams?: Team;
};

export type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  match_date: string;
  round: number;
  status: 'scheduled' | 'live' | 'finished';
  youtube_url: string | null;
  home_team?: Team;
  away_team?: Team;
};

export type Goal = {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  minute: number;
  is_own_goal: boolean;
  players?: Player;
  teams?: Team;
};

export type LiveScore = {
  id: string;
  match_id: string | null;
  current_match_id: string | null;
  home_score: number;
  away_score: number;
  minute: number;
  is_live: boolean;
  youtube_video_id: string;
  updated_at: string;
};

export type LiveEvent = {
  id: string;
  match_id: string;
  event_type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'period_start' | 'period_end' | 'other';
  minute: number;
  player_name: string;
  team_side: 'home' | 'away';
  description: string;
  created_at: string;
};

export type StandingRow = {
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  points: number;
};

export type TopScorer = {
  player: Player;
  team: Team;
  goals: number;
};

export type SiteContent = {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
};

export type Sponsor = {
  id: string;
  name: string;
  tier: 'title' | 'gold' | 'silver' | 'bronze';
  logo_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};
