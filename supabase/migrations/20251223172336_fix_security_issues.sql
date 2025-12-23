/*
  # Fix Security Issues

  ## Changes Made
  
  1. **Remove Unused Indexes**
     - Drop `idx_commentaires_user_id` (unused index on commentaires table)
     - Drop `idx_rendez_vous_commerce_id` (unused index on rendez_vous table)
  
  2. **Fix Multiple Permissive Policies on profiles**
     - Remove separate "Admins can update all profiles" and "Users can update own profile" policies
     - Create single combined policy that allows both scenarios
     - This eliminates the security warning about multiple permissive policies
  
  ## Security Benefits
  
  - Removing unused indexes improves INSERT/UPDATE performance
  - Single UPDATE policy is clearer and easier to audit
  - Combined policy maintains same access control logic
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_commentaires_user_id;
DROP INDEX IF EXISTS idx_rendez_vous_commerce_id;

-- Fix multiple permissive policies on profiles table
-- Drop the existing UPDATE policies
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create a single combined UPDATE policy
CREATE POLICY "Users can update own profile, admins can update all"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
