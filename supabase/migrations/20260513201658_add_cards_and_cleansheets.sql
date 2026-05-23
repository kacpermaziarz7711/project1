
/*
  # Add cards and clean sheets tracking

  1. New Tables
    - `cards` - Yellow and red cards per player per match
    - `clean_sheets` - Goalkeeper clean sheets per match

  2. Security
    - RLS enabled on all tables
    - Public read access
*/

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

-- Insert sample cards data
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

  -- Yellow cards
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

  -- Clean sheets for goalkeepers (matches where team conceded 0)
  INSERT INTO clean_sheets (match_id, player_id, team_id) VALUES
    (m3, (SELECT id FROM players WHERE name = 'Artur Wieczorek'), t_lwo)
  ON CONFLICT DO NOTHING;
END $$;
