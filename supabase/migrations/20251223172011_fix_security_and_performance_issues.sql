/*
  # Fix Security and Performance Issues

  ## Performance Improvements
  
  1. **Add Missing Foreign Key Indexes**
     - Add index on `commentaires.user_id` to improve foreign key query performance
     - Add index on `rendez_vous.commerce_id` to improve foreign key query performance
  
  2. **Optimize RLS Policies**
     - Replace `auth.uid()` with `(select auth.uid())` in all RLS policies to prevent re-evaluation per row
     - This significantly improves query performance at scale
  
  3. **Remove Unused Indexes**
     - Drop `idx_commerces_statut` (not being used)
     - Drop `idx_commerces_type` (not being used)
  
  4. **Fix Function Search Path**
     - Make `update_updated_at_column` function immutable to search_path changes
  
  ## Security Improvements
  
  - Optimized RLS policies maintain same security while improving performance
  - All policies still enforce proper authentication and authorization rules
*/

-- ============================================================================
-- 1. ADD MISSING FOREIGN KEY INDEXES
-- ============================================================================

-- Index for commentaires.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_commentaires_user_id 
ON public.commentaires(user_id);

-- Index for rendez_vous.commerce_id foreign key
CREATE INDEX IF NOT EXISTS idx_rendez_vous_commerce_id 
ON public.rendez_vous(commerce_id);

-- ============================================================================
-- 2. OPTIMIZE RLS POLICIES - Replace auth.uid() with (select auth.uid())
-- ============================================================================

-- Drop and recreate profiles policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Admins can insert profiles"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (select auth.uid())
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (select auth.uid()))
WITH CHECK (id = (select auth.uid()));

-- Drop and recreate commentaires policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Users can insert commentaires" ON public.commentaires;
DROP POLICY IF EXISTS "Users can delete own commentaires" ON public.commentaires;

CREATE POLICY "Users can insert commentaires"
ON public.commentaires
FOR INSERT
TO authenticated
WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own commentaires"
ON public.commentaires
FOR DELETE
TO authenticated
USING (user_id = (select auth.uid()));

-- Drop and recreate rendez_vous policies with optimized auth.uid() calls
DROP POLICY IF EXISTS "Commercials can insert rendez_vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Commercials can update their rendez_vous" ON public.rendez_vous;
DROP POLICY IF EXISTS "Commercials can delete their rendez_vous" ON public.rendez_vous;

CREATE POLICY "Commercials can insert rendez_vous"
ON public.rendez_vous
FOR INSERT
TO authenticated
WITH CHECK (commercial_id = (select auth.uid()));

CREATE POLICY "Commercials can update their rendez_vous"
ON public.rendez_vous
FOR UPDATE
TO authenticated
USING (commercial_id = (select auth.uid()))
WITH CHECK (commercial_id = (select auth.uid()));

CREATE POLICY "Commercials can delete their rendez_vous"
ON public.rendez_vous
FOR DELETE
TO authenticated
USING (commercial_id = (select auth.uid()));

-- ============================================================================
-- 3. REMOVE UNUSED INDEXES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_commerces_statut;
DROP INDEX IF EXISTS public.idx_commerces_type;

-- ============================================================================
-- 4. FIX FUNCTION SEARCH PATH
-- ============================================================================

-- Recreate the function with SECURITY DEFINER and explicit search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;