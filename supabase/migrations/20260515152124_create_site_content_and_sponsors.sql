/*
  # Create site content and sponsors tables

  1. New Tables
    - `site_content`
      - `id` (uuid, primary key)
      - `key` (text, unique) - content identifier like 'about_tournament', 'about_us'
      - `value` (text) - the actual content text
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `sponsors`
      - `id` (uuid, primary key)
      - `name` (text) - sponsor name
      - `tier` (text) - 'title', 'gold', 'silver', 'bronze'
      - `logo_url` (text, nullable) - optional logo image URL
      - `sort_order` (integer) - display order
      - `is_active` (boolean) - whether to show on site
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Anyone can read (public content)
    - Only authenticated admins can write

  3. Seed Data
    - Default content entries for tournament description, about us, stats
    - Default sponsors matching current hardcoded values
*/

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

-- Seed site content
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

-- Seed sponsors
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
