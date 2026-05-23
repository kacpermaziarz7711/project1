
/*
  # Tournament Schema for Orlik 6v6 Football Tournament

  1. New Tables
    - `teams` - Tournament teams
    - `players` - Players belonging to teams
    - `matches` - Scheduled and completed matches
    - `goals` - Goals scored per player per match
    - `standings` - Cached standings (auto-updated via trigger)

  2. Security
    - RLS enabled on all tables
    - Public read access for tournament data
    - No write access from client (admin only via service key)
*/

CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text NOT NULL,
  color text DEFAULT '#ffffff',
  logo_letter text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teams"
  ON teams FOR SELECT
  TO anon, authenticated
  USING (true);

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

-- Insert sample teams
INSERT INTO teams (name, short_name, color, logo_letter) VALUES
  ('Orły Warszawy', 'ORL', '#e91e8c', 'O'),
  ('Zielona Siła', 'ZSI', '#22c55e', 'Z'),
  ('Czarne Błyskawice', 'CBŁ', '#374151', 'C'),
  ('Różowe Pantery', 'RPA', '#f472b6', 'R'),
  ('Leśni Wojownicy', 'LWO', '#16a34a', 'L'),
  ('Nocne Marki', 'NMA', '#111827', 'N')
ON CONFLICT DO NOTHING;

-- Insert sample players
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

-- Insert sample matches
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

-- Insert goals for finished matches
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

  -- Match 1: ORL 3-1 ZSI
  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m1, p_nowak, (SELECT id FROM teams WHERE short_name='ORL'), 8),
    (m1, p_wisniewski, (SELECT id FROM teams WHERE short_name='ORL'), 15),
    (m1, p_nowak, (SELECT id FROM teams WHERE short_name='ORL'), 22),
    (m1, p_szymanski, (SELECT id FROM teams WHERE short_name='ZSI'), 18)
  ON CONFLICT DO NOTHING;

  -- Match 2: CBŁ 2-2 RPA
  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m2, p_mazur, (SELECT id FROM teams WHERE short_name='CBŁ'), 5),
    (m2, p_krawczyk, (SELECT id FROM teams WHERE short_name='CBŁ'), 20),
    (m2, p_pawlak, (SELECT id FROM teams WHERE short_name='RPA'), 12),
    (m2, p_pawlak, (SELECT id FROM teams WHERE short_name='RPA'), 25)
  ON CONFLICT DO NOTHING;

  -- Match 3: LWO 4-0 NMA
  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m3, p_kaczmarek, (SELECT id FROM teams WHERE short_name='LWO'), 3),
    (m3, p_kaczmarek, (SELECT id FROM teams WHERE short_name='LWO'), 11),
    (m3, p_kubiak, (SELECT id FROM teams WHERE short_name='LWO'), 17),
    (m3, p_sikora, (SELECT id FROM teams WHERE short_name='LWO'), 24)
  ON CONFLICT DO NOTHING;

  -- Match 4: ZSI 1-3 CBŁ
  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m4, p_kaminski, (SELECT id FROM teams WHERE short_name='ZSI'), 14),
    (m4, p_mazur, (SELECT id FROM teams WHERE short_name='CBŁ'), 6),
    (m4, p_krawczyk, (SELECT id FROM teams WHERE short_name='CBŁ'), 16),
    (m4, p_jankowski, (SELECT id FROM teams WHERE short_name='CBŁ'), 23)
  ON CONFLICT DO NOTHING;

  -- Match 5: RPA 0-2 LWO
  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m5, p_kaczmarek, (SELECT id FROM teams WHERE short_name='LWO'), 9),
    (m5, p_kubiak, (SELECT id FROM teams WHERE short_name='LWO'), 21)
  ON CONFLICT DO NOTHING;

  -- Match 6: NMA 1-2 ORL
  INSERT INTO goals (match_id, player_id, team_id, minute) VALUES
    (m6, p_laskowski, (SELECT id FROM teams WHERE short_name='NMA'), 10),
    (m6, p_nowak, (SELECT id FROM teams WHERE short_name='ORL'), 7),
    (m6, p_wisniewski, (SELECT id FROM teams WHERE short_name='ORL'), 19)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert initial live score config
INSERT INTO live_score (home_score, away_score, minute, is_live, youtube_video_id)
VALUES (0, 0, 0, false, 'dQw4w9WgXcQ')
ON CONFLICT DO NOTHING;
