/*
  # Add image columns to teams and sponsors tables
  
  1. Changes
    - Add `logo_url` column to teams table
    - Add `logo_url` column to sponsors table (already exists, ensure it's nullable)
    
  2. Storage
    - Images will be stored in Supabase Storage
    - URLs will reference the storage bucket
*/

-- Add logo_url to teams if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'teams' AND column_name = 'logo_url') THEN
    ALTER TABLE teams ADD COLUMN logo_url text;
  END IF;
END $$;

-- Ensure sponsors has logo_url (it should already exist from previous migration)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sponsors' AND column_name = 'logo_url') THEN
    ALTER TABLE sponsors ADD COLUMN logo_url text;
  END IF;
END $$;
