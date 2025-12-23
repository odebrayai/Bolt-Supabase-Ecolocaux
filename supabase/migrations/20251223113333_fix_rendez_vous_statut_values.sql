/*
  # Fix rendez_vous statut values

  1. Changes
    - Drop the old CHECK constraint on statut column
    - Add new CHECK constraint with correct values including accents
    - Add new statut values: 'confirmé', 'reporté' to match frontend expectations
  
  2. Security
    - No changes to RLS policies
*/

-- Drop the old constraint if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage 
    WHERE table_name = 'rendez_vous' AND constraint_name LIKE '%statut%'
  ) THEN
    ALTER TABLE rendez_vous DROP CONSTRAINT IF EXISTS rendez_vous_statut_check;
  END IF;
END $$;

-- Add the new constraint with correct values
ALTER TABLE rendez_vous 
ADD CONSTRAINT rendez_vous_statut_check 
CHECK (statut IN ('planifié', 'confirmé', 'reporté', 'effectué', 'annulé'));
