
/*
  # Add live match events tracking

  1. New Tables
    - `live_events` - Real-time match events (goals, cards, etc.) during live match
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `event_type` (text: goal, yellow_card, red_card, substitution, period_start, period_end)
      - `minute` (integer)
      - `player_name` (text) - free text input for flexibility
      - `team_side` (text: home, away)
      - `description` (text) - additional info
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled
    - Public read access
    - Authenticated users can insert (for admin control)

  3. Changes to live_score
    - Add `current_match_id` column to link live_score to a specific match
*/

ALTER TABLE live_score ADD COLUMN IF NOT EXISTS current_match_id uuid REFERENCES matches(id);

CREATE TABLE IF NOT EXISTS live_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN ('goal', 'yellow_card', 'red_card', 'substitution', 'period_start', 'period_end', 'other')),
  minute integer NOT NULL DEFAULT 0,
  player_name text DEFAULT '',
  team_side text NOT NULL CHECK (team_side IN ('home', 'away')),
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live events"
  ON live_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert live events"
  ON live_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete live events"
  ON live_events FOR DELETE
  TO authenticated
  USING (true);
