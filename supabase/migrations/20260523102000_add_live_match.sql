/*
  # Add live match functionality
  
  1. Changes
    - Add `is_live` column to matches table
    - Add `live_match_id` to live_score table to track current live match
*/

-- Add is_live column to matches
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'matches' AND column_name = 'is_live') THEN
    ALTER TABLE matches ADD COLUMN is_live boolean DEFAULT false;
  END IF;
END $$;

-- Add live_match_id to live_score if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'live_score' AND column_name = 'live_match_id') THEN
    ALTER TABLE live_score ADD COLUMN live_match_id uuid REFERENCES matches(id);
  END IF;
END $$;
