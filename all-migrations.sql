-- ============================================
-- MIGRACJE BAZY DANYCH - JTS Tournament
-- ============================================

-- ============================================
-- 1. Players table
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  number integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 2. Matches table
-- ============================================
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  home_team_id uuid NOT NULL REFERENCES teams(id),
  away_team_id uuid NOT NULL REFERENCES teams(id),
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  match_date timestamptz NOT NULL,
  round integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'finished')),
  youtube_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 3. Goals table
-- ============================================
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  minute integer,
  is_own_goal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view goals"
  ON goals FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 4. Live score table
-- ============================================
CREATE TABLE IF NOT EXISTS live_score (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id),
  home_score integer DEFAULT 0,
  away_score integer DEFAULT 0,
  minute integer DEFAULT 0,
  is_live boolean DEFAULT false,
  youtube_video_id text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE live_score ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live score"
  ON live_score FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 5. Insert sample teams
-- ============================================
INSERT INTO teams (name, short_name, color, logo_letter) VALUES
  ('Orły Warszawy', 'ORL', '#e91e8c', 'O'),
  ('Zielona Siła', 'ZSI', '#22c55e', 'Z'),
  ('Czarne Błyskawice', 'CBŁ', '#374151', 'C'),
  ('Różowe Pantery', 'RPA', '#f472b6', 'R'),
  ('Leśni Wojownicy', 'LWO', '#16a34a', 'L'),
  ('Nocne Marki', 'NMA', '#111827', 'N')
ON CONFLICT DO NOTHING;

-- ============================================
-- 6. Insert sample players
-- ============================================
DO $$
DECLARE
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid; t6 uuid;
BEGIN
  SELECT id INTO t1 FROM teams WHERE short_name = 'ORL';
  SELECT id INTO t2 FROM teams WHERE short_name = 'ZSI';
  SELECT id INTO t3 FROM teams WHERE short_name = 'CBŁ';
  SELECT id INTO t4 FROM teams WHERE short_name = 'RPA';
  SELECT id INTO t5 FROM teams WHERE short_name = 'LWO';
  SELECT id INTO t6 FROM teams WHERE short_name = 'NMA';

  INSERT INTO players (team_id, name, number) VALUES
    (t1, 'Marek Kowalski', 1), (t1, 'Piotr Nowak', 7), (t1, 'Kamil Wiśniewski', 10), (t1, 'Łukasz Zając', 5), (t1, 'Tomasz Dąbrowski', 9), (t1, 'Michał Lewandowski', 11),
    (t2, 'Adam Wójcik', 1), (t2, 'Bartosz Kamiński', 8), (t2, 'Jakub Kowalczyk', 6), (t2, 'Rafał Zielński', 3), (t2, 'Szymon Szymański', 9), (t2, 'Paweł Woźniak', 2),
    (t3, 'Grzegorz Kozłowski', 1), (t3, 'Marcin Jankowski', 4), (t3, 'Robert Mazur', 7), (t3, 'Krzysztof Krawczyk', 10), (t3, 'Andrzej Piotrowki', 5), (t3, 'Wojciech Grabowski', 11),
    (t4, 'Dariusz Nowakowski', 1), (t4, 'Mateusz Pawlak', 9), (t4, 'Przemek Michalski', 6), (t4, 'Sebastian Nowicki', 3), (t4, 'Damian Adamczyk', 8), (t4, 'Konrad Dudek', 7),
    (t5, 'Artur Wieczorek', 1), (t5, 'Łukasz Sikora', 5), (t5, 'Mariusz Kaczmarek', 9), (t5, 'Maciej Kubiak', 11), (t5, 'Zbigniew Głowacki', 4), (t5, 'Krzysztof Baran', 6),
    (t6, 'Bogdan Jaworski', 1), (t6, 'Ryszard Laskowski', 7), (t6, 'Henryk Polański', 10), (t6, 'Zygmunt Borowski', 9), (t6, 'Feliks Rutkowski', 3), (t6, 'Tadeusz Ostrowski', 8)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 7. Insert sample matches
-- ============================================
DO $$
DECLARE
  t1 uuid; t2 uuid; t3 uuid; t4 uuid; t5 uuid; t6 uuid;
BEGIN
  SELECT id INTO t1 FROM teams WHERE short_name = 'ORL';
  SELECT id INTO t2 FROM teams WHERE short_name = 'ZSI';
  SELECT id INTO t3 FROM teams WHERE short_name = 'CBŁ';
  SELECT id INTO t4 FROM teams WHERE short_name = 'RPA';
  SELECT id INTO t5 FROM teams WHERE short_name = 'LWO';
  SELECT id INTO t6 FROM teams WHERE short_name = 'NMA';

  INSERT INTO matches (home_team_id, away_team_id, home_score, away_score, match_date, round, status) VALUES
    (t1, t2, 3, 1, '2026-05-03 10:00:00+00', 1, 'finished'),
    (t3, t4, 2, 2, '2026-05-03 11:00:00+00', 1, 'finished'),
    (t5, t6, 4, 0, '2026-05-03 12:00:00+00', 1, 'finished'),
    (t2, t3, 1, 3, '2026-05-10 10:00:00+00', 2, 'finished'),
    (t4, t5, 0, 2, '2026-05-10 11:00:00+00', 2, 'finished'),
    (t6, t1, 1, 2, '2026-05-10 12:00:00+00', 2, 'finished'),
    (t1, t3, 0, 0, '2026-05-17 10:00:00+00', 3, 'scheduled'),
    (t2, t4, 0, 0, '2026-05-17 11:00:00+00', 3, 'scheduled'),
    (t5, t1, 0, 0, '2026-05-24 10:00:00+00', 4, 'scheduled'),
    (t6, t2, 0, 0, '2026-05-24 11:00:00+00', 4, 'scheduled'),
    (t3, t5, 0, 0, '2026-05-31 10:00:00+00', 5, 'scheduled'),
    (t4, t6, 0, 0, '2026-05-31 11:00:00+00', 5, 'scheduled')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 8. Insert goals for finished matches
-- ============================================
DO $$
DECLARE
  m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid; m6 uuid;
  p_kowalski uuid; p_nowak uuid; p_wisniewski uuid;
  p_kaminski uuid; p_szymanski uuid;
  p_mazur uuid; p_krawczyk uuid; p_jankowski uuid;
  p_pawlak uuid;
  p_kaczmarek uuid; p_kubiak uuid; p_sikora uuid;
  p_laskowski uuid;
BEGIN
  SELECT m.id INTO m1 FROM matches m JOIN teams ht ON m.home_team_id = ht.id WHERE ht.short_name = 'ORL' AND m.round = 1;
  SELECT m.id INTO m2 FROM matches m JOIN teams ht ON m.home_team_id = ht.id WHERE ht.short_name = 'CBŁ' AND m.round = 1;
  SELECT m.id INTO m3 FROM matches m JOIN teams ht ON m.home_team_id = ht.id WHERE ht.short_name = 'LWO' AND m.round = 1;
  SELECT m.id INTO m4 FROM matches m JOIN teams ht ON m.home_team_id = ht.id WHERE ht.short_name = 'ZSI' AND m.round = 2;
  SELECT m.id INTO m5 FROM matches m JOIN teams ht ON m.home_team_id = ht.id WHERE ht.short_name = 'RPA' AND m.round = 2;
  SELECT m.id INTO m6 FROM matches m JOIN teams ht ON m.home_team_id = ht.id WHERE ht.short_name = 'NMA' AND m.round = 2;

  SELECT p.id INTO p_kowalski FROM players p WHERE p.name = 'Marek Kowalski';
  SELECT p.id INTO p_nowak FROM players p WHERE p.name = 'Piotr Nowak';
  SELECT p.id INTO p_wisniewski FROM players p WHERE p.name = 'Kamil Wiśniewski';
  SELECT p.id INTO p_kaminski FROM players p WHERE p.name = 'Bartosz Kamiński';
  SELECT p.id INTO p_szymanski FROM players p WHERE p.name = 'Szymon Szymański';
  SELECT p.id INTO p_mazur FROM players p WHERE p.name = 'Robert Mazur';
  SELECT p.id INTO p_krawczyk FROM players p WHERE p.name = 'Krzysztof Krawczyk';
  SELECT p.id INTO p_jankowski FROM players p WHERE p.name = 'Marcin Jankowski';
  SELECT p.id INTO p_pawlak FROM players p WHERE p.name = 'Mateusz Pawlak';
  SELECT p.id INTO p_kaczmarek FROM players p WHERE p.name = 'Mariusz Kaczmarek';
  SELECT p.id INTO p_kubiak FROM players p WHERE p.name = 'Maciej Kubiak';
  SELECT p.id INTO p_sikora FROM players p WHERE p.name = 'Łukasz Sikora';
  SELECT p.id INTO p_laskowski FROM players p WHERE p.name = 'Ryszard Laskowski';

  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m1, p_nowak, (SELECT id FROM teams WHERE short_name='ORL'), 8),
    (m1, p_wisniewski, (SELECT id FROM teams WHERE short_name='ORL'), 15),
    (m1, p_nowak, (SELECT id FROM teams WHERE short_name='ORL'), 22),
    (m1, p_szymanski, (SELECT id FROM teams WHERE short_name='ZSI'), 18),
    (m2, p_mazur, (SELECT id FROM teams WHERE short_name='CBŁ'), 5),
    (m2, p_krawczyk, (SELECT id FROM teams WHERE short_name='CBŁ'), 20),
    (m2, p_pawlak, (SELECT id FROM teams WHERE short_name='RPA'), 12),
    (m2, p_pawlak, (SELECT id FROM teams WHERE short_name='RPA'), 25),
    (m3, p_kaczmarek, (SELECT id FROM teams WHERE short_name='LWO'), 3),
    (m3, p_kaczmarek, (SELECT id FROM teams WHERE short_name='LWO'), 11),
    (m3, p_kubiak, (SELECT id FROM teams WHERE short_name='LWO'), 17),
    (m3, p_sikora, (SELECT id FROM teams WHERE short_name='LWO'), 24),
    (m4, p_kaminski, (SELECT id FROM teams WHERE short_name='ZSI'), 14),
    (m4, p_mazur, (SELECT id FROM teams WHERE short_name='CBŁ'), 6),
    (m4, p_krawczyk, (SELECT id FROM teams WHERE short_name='CBŁ'), 16),
    (m4, p_jankowski, (SELECT id FROM teams WHERE short_name='CBŁ'), 23),
    (m5, p_kaczmarek, (SELECT id FROM teams WHERE short_name='LWO'), 9),
    (m5, p_kubiak, (SELECT id FROM teams WHERE short_name='LWO'), 21),
    (m6, p_laskowski, (SELECT id FROM teams WHERE short_name='NMA'), 10),
    (m6, p_nowak, (SELECT id FROM teams WHERE short_name='ORL'), 7),
    (m6, p_wisniewski, (SELECT id FROM teams WHERE short_name='ORL'), 19)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 9. Insert initial live score config
-- ============================================
INSERT INTO live_score (home_score, away_score, minute, is_live, youtube_video_id)
VALUES (0, 0, 0, false, 'dQw4w9WgXcQ')
ON CONFLICT DO NOTHING;

-- ============================================
-- 10. Cards table
-- ============================================
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  card_type text NOT NULL CHECK (card_type IN ('yellow', 'red')),
  minute integer,
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cards"
  ON cards FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 11. Clean sheets table
-- ============================================
CREATE TABLE IF NOT EXISTS clean_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id),
  team_id uuid NOT NULL REFERENCES teams(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE clean_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view clean sheets"
  ON clean_sheets FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- 12. Insert sample cards data
-- ============================================
DO $$
DECLARE
  m1 uuid; m2 uuid; m3 uuid; m4 uuid; m5 uuid; m6 uuid;
  p_zajac uuid; p_wisniewski uuid; p_zielinski uuid; p_wozniak uuid;
  p_mazur uuid; p_nowicki uuid; p_sikora uuid; p_krawczyk uuid;
  p_laskowski uuid; p_pawlak uuid;
  t_orl uuid; t_zsi uuid; t_cbl uuid; t_rpa uuid; t_lwo uuid; t_nma uuid;
BEGIN
  SELECT id INTO t_orl FROM teams WHERE short_name = 'ORL';
  SELECT id INTO t_zsi FROM teams WHERE short_name = 'ZSI';
  SELECT id INTO t_cbl FROM teams WHERE short_name = 'CBŁ';
  SELECT id INTO t_rpa FROM teams WHERE short_name = 'RPA';
  SELECT id INTO t_lwo FROM teams WHERE short_name = 'LWO';
  SELECT id INTO t_nma FROM teams WHERE short_name = 'NMA';

  SELECT id INTO m1 FROM matches m WHERE m.home_team_id = t_orl AND m.round = 1;
  SELECT id INTO m2 FROM matches m WHERE m.home_team_id = t_cbl AND m.round = 1;
  SELECT id INTO m3 FROM matches m WHERE m.home_team_id = t_lwo AND m.round = 1;
  SELECT id INTO m4 FROM matches m WHERE m.home_team_id = t_zsi AND m.round = 2;
  SELECT id INTO m5 FROM matches m WHERE m.home_team_id = t_rpa AND m.round = 2;
  SELECT id INTO m6 FROM matches m WHERE m.home_team_id = t_nma AND m.round = 2;

  SELECT id INTO p_zajac FROM players WHERE name = 'Łukasz Zając';
  SELECT id INTO p_wisniewski FROM players WHERE name = 'Kamil Wiśniewski';
  SELECT id INTO p_zielinski FROM players WHERE name = 'Rafał Zielński';
  SELECT id INTO p_wozniak FROM players WHERE name = 'Paweł Woźniak';
  SELECT id INTO p_mazur FROM players WHERE name = 'Robert Mazur';
  SELECT id INTO p_nowicki FROM players WHERE name = 'Sebastian Nowicki';
  SELECT id INTO p_sikora FROM players WHERE name = 'Łukasz Sikora';
  SELECT id INTO p_krawczyk FROM players WHERE name = 'Krzysztof Krawczyk';
  SELECT id INTO p_laskowski FROM players WHERE name = 'Ryszard Laskowski';
  SELECT id INTO p_pawlak FROM players WHERE name = 'Mateusz Pawlak';

  INSERT INTO cards (match_id, player_id, team_id, card_type, minute, reason) VALUES
    (m1, p_zajac, t_orl, 'yellow', 12, 'Faul'),
    (m1, p_wozniak, t_zsi, 'yellow', 20, 'Niesportowe zachowanie'),
    (m2, p_mazur, t_cbl, 'yellow', 8, 'Faul taktyczny'),
    (m2, p_nowicki, t_rpa, 'yellow', 16, 'Faul'),
    (m3, p_sikora, t_lwo, 'yellow', 22, 'Protest'),
    (m4, p_krawczyk, t_cbl, 'yellow', 10, 'Faul'),
    (m5, p_pawlak, t_rpa, 'red', 18, 'Druga zolta kartka'),
    (m6, p_laskowski, t_nma, 'yellow', 14, 'Faul')
  ON CONFLICT DO NOTHING;

  INSERT INTO clean_sheets (match_id, player_id, team_id) VALUES
    (m3, (SELECT id FROM players WHERE name = 'Artur Wieczorek'), t_lwo)
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 13. Add current_match_id to live_score
-- ============================================
ALTER TABLE live_score ADD COLUMN IF NOT EXISTS current_match_id uuid REFERENCES matches(id);

-- ============================================
-- 14. Live events table
-- ============================================
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

-- ============================================
-- 15. Admin users table
-- ============================================
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

-- ============================================
-- 16. Tournaments table
-- ============================================
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

-- ============================================
-- 17. Tournament teams junction
-- ============================================
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

-- ============================================
-- 18. Tournament players junction
-- ============================================
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

-- ============================================
-- 19. Add tournament_id to existing tables
-- ============================================
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

-- ============================================
-- 20. Update live_events policies
-- ============================================
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

-- ============================================
-- 21. Admin policies for all tables
-- ============================================
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

-- ============================================
-- 22. Insert default tournament
-- ============================================
INSERT INTO tournaments (name, slug, season, format, status, settings)
VALUES ('Jaworznicki Turniej Szostek 2026', 'jts-2026', '2026', 'league', 'active', '{"points_win": 3, "points_draw": 1, "points_loss": 0, "match_duration": 25}')
ON CONFLICT DO NOTHING;

-- ============================================
-- 23. Link existing data to the tournament
-- ============================================
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

-- ============================================
-- 24. Site content table
-- ============================================
CREATE TABLE IF NOT EXISTS site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  tier text NOT NULL DEFAULT 'bronze',
  logo_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read site content"
  ON site_content FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON site_content FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update site content"
  ON site_content FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can read sponsors"
  ON sponsors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert sponsors"
  ON sponsors FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can update sponsors"
  ON sponsors FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can delete sponsors"
  ON sponsors FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid())
  );

-- ============================================
-- 25. Seed site content
-- ============================================
INSERT INTO site_content (key, value) VALUES
  ('tournament_name', 'JAWORZNICKI TURNIEJ SZOSTEK'),
  ('tournament_subtitle', 'JTS &bull; OD 2024 ROKU &bull; JAWORZNO'),
  ('about_tournament', 'Jaworznicki Turniej Szostek to amatorski turniej pilki noznej rozgrywany na boisku Orlik w Jaworznie. Szesc druzyn walczy o tytul mistrza w formacie ligowym - kazdy z kazdym. Mecze trwaja 2x12 minut, a punkty przyznawane sa za zwyciestwo (3), remis (1) i porazke (0). Turniej laczyc pasje do pilki noznej ze spolecznoscia lokalna.'),
  ('about_us', 'Jestesmy grupa pasjonatow pilki noznej z Jaworzna. Od 2024 roku organizujemy ten turniej aby dac mozliwosc rywalizacji lokalnym druzynom i zawodnikom. Naszym celem jest promowanie sportu, fair play i spolecznosciowego ducha rywalizacji na boisku Orlik w sercu Jaworzna.'),
  ('stat_teams', '6'),
  ('stat_rounds', '5'),
  ('stat_matches', '15'),
  ('stat_duration', '2x12'),
  ('stat_teams_label', 'DRUZYNY'),
  ('stat_rounds_label', 'KOLEJKI'),
  ('stat_matches_label', 'MECZE'),
  ('stat_duration_label', 'MINUTY'),
  ('live_button_text', 'OGLADAJ TRANSMISJE NA ZYWO'),
  ('live_button_active_text', 'TRANSMISJA NA ZYWO - AKTYWNA'),
  ('footer_text', 'ORLIK &bull; JAWORZNO &bull; 2026')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 26. Seed sponsors
-- ============================================
INSERT INTO sponsors (name, tier, sort_order) VALUES
  ('FIRMA JAWORZNO', 'title', 0),
  ('SPORT SHOP', 'gold', 1),
  ('ORLIK ARENA', 'gold', 2),
  ('BUD-MAR', 'gold', 3),
  ('MECHANIKA', 'silver', 4),
  ('AUTO-SERWIS', 'silver', 5),
  ('ELEKTRO', 'silver', 6),
  ('PIZZERIA', 'silver', 7),
  ('KIOSK', 'bronze', 8),
  ('FIRMA A', 'bronze', 9),
  ('FIRMA B', 'bronze', 10),
  ('FIRMA C', 'bronze', 11),
  ('FIRMA D', 'bronze', 12)
ON CONFLICT DO NOTHING;
