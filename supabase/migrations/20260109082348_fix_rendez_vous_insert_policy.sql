/*
  # Fix rendez-vous insert policy
  
  1. Changes
    - Update INSERT policy on rendez_vous to allow authenticated users to create appointments for any commercial
    - This fixes the issue where appointments created from the Commerce page don't appear in the Appointments tab
    
  2. Security
    - Still restricts INSERT to authenticated users only
    - Validates that commercial_id references a valid user in profiles table (foreign key)
    - Commercials can still only UPDATE/DELETE their own appointments
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Commercials can insert rendez_vous" ON rendez_vous;

-- Create new INSERT policy that allows authenticated users to create appointments for any commercial
CREATE POLICY "Authenticated users can insert rendez_vous"
  ON rendez_vous
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Ensure the commercial_id exists in profiles
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = commercial_id 
      AND profiles.actif = true
    )
  );
