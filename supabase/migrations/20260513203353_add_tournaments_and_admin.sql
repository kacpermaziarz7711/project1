
/*
  # Add tournaments, auth, and admin infrastructure

  1. New Tables
    - `tournaments` - Multiple tournament/competition support
    - `admin_users` - Whitelist of user ids that can access admin
    - `tournament_teams` - Junction: teams in a tournament
    - `tournament_players` - Junction: players in a tournament team

  2. Changes
    - Add `tournament_id` column to matches, goals, cards, clean_sheets, live_score, live_events

  3. Security
    - RLS on all new tables
    - Admin-only write policies
    - Public read on tournament data
*/

-- Admin users table (create first since other policies reference it)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admin can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- Tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  season text NOT NULL DEFAULT '2026',
  format text NOT NULL DEFAULT 'league' CHECK (format IN ('league', 'knockout', 'group_knockout')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'finished')),
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments"
  ON tournaments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage tournaments"
  ON tournaments FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Tournament teams junction
CREATE TABLE IF NOT EXISTS tournament_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  group_name text DEFAULT 'A',
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, team_id)
);

ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament teams"
  ON tournament_teams FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage tournament teams"
  ON tournament_teams FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Tournament players junction
CREATE TABLE IF NOT EXISTS tournament_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, player_id)
);

ALTER TABLE tournament_players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament players"
  ON tournament_players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can manage tournament players"
  ON tournament_players FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Add tournament_id to existing tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'tournament_id') THEN
    ALTER TABLE matches ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'goals' AND column_name = 'tournament_id') THEN
    ALTER TABLE goals ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cards' AND column_name = 'tournament_id') THEN
    ALTER TABLE cards ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clean_sheets' AND column_name = 'tournament_id') THEN
    ALTER TABLE clean_sheets ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_score' AND column_name = 'tournament_id') THEN
    ALTER TABLE live_score ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_events' AND column_name = 'tournament_id') THEN
    ALTER TABLE live_events ADD COLUMN tournament_id uuid REFERENCES tournaments(id);
  END IF;
END $$;

-- Update live_events policies
DROP POLICY IF EXISTS "Authenticated users can insert live events" ON live_events;
DROP POLICY IF EXISTS "Authenticated users can delete live events" ON live_events;

CREATE POLICY "Admin can insert live events"
  ON live_events FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can delete live events"
  ON live_events FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can update live events"
  ON live_events FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Admin policies for teams, players, matches, goals, cards, clean_sheets, live_score
CREATE POLICY "Admin can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage players"
  ON players FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage matches"
  ON matches FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage goals"
  ON goals FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage cards"
  ON cards FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage clean_sheets"
  ON clean_sheets FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admin can manage live_score"
  ON live_score FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid()));

-- Insert default tournament
INSERT INTO tournaments (name, slug, season, format, status, settings)
VALUES ('Jaworznicki Turniej Szostek 2026', 'jts-2026', '2026', 'league', 'active', '{"points_win": 3, "points_draw": 1, "points_loss": 0, "match_duration": 25}')
ON CONFLICT DO NOTHING;

-- Link existing data to the tournament
DO $$
DECLARE
  t_id uuid;
  team_rec RECORD;
  player_rec RECORD;
BEGIN
  SELECT id INTO t_id FROM tournaments WHERE slug = 'jts-2026';
  IF t_id IS NULL THEN RETURN; END IF;

  FOR team_rec IN SELECT id FROM teams LOOP
    INSERT INTO tournament_teams (tournament_id, team_id)
    VALUES (t_id, team_rec.id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  FOR player_rec IN SELECT id, team_id FROM players LOOP
    INSERT INTO tournament_players (tournament_id, team_id, player_id)
    VALUES (t_id, player_rec.team_id, player_rec.id)
    ON CONFLICT DO NOTHING;
  END LOOP;

  UPDATE matches SET tournament_id = t_id WHERE tournament_id IS NULL;
  UPDATE goals SET tournament_id = t_id WHERE tournament_id IS NULL;
  UPDATE cards SET tournament_id = t_id WHERE tournament_id IS NULL;
  UPDATE clean_sheets SET tournament_id = t_id WHERE tournament_id IS NULL;
END $$;
