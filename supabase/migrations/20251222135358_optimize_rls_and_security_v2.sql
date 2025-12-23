/*
  # Optimisation RLS et correction des problèmes de sécurité

  1. Corrections de performance RLS
    - Optimise toutes les politiques RLS en utilisant (select auth.uid())
    - Supprime les politiques dupliquées
    
  2. Nettoyage des index inutilisés
    - Supprime les index non utilisés pour réduire l'overhead
    
  3. Sécurité des fonctions
    - Corrige le search_path de la fonction update_updated_at_column
    - Recrée les triggers associés
*/

-- ============================================================================
-- 1. NETTOYAGE DES POLITIQUES DUPLIQUÉES
-- ============================================================================

-- Supprimer toutes les anciennes politiques de la table profiles
DROP POLICY IF EXISTS "Profiles visibles par tous les users authentifiés" ON profiles;
DROP POLICY IF EXISTS "Users peuvent modifier leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Admins peuvent tout faire sur profiles" ON profiles;

-- Supprimer toutes les anciennes politiques de la table commerces
DROP POLICY IF EXISTS "Commerces visibles par tous les users authentifiés" ON commerces;
DROP POLICY IF EXISTS "Users authentifiés peuvent créer des commerces" ON commerces;
DROP POLICY IF EXISTS "Users peuvent modifier les commerces" ON commerces;
DROP POLICY IF EXISTS "Admins peuvent supprimer les commerces" ON commerces;
DROP POLICY IF EXISTS "Allow inserts from service" ON commerces;
DROP POLICY IF EXISTS "Allow updates from service" ON commerces;

-- ============================================================================
-- 2. RECRÉER LES POLITIQUES OPTIMISÉES POUR PROFILES
-- ============================================================================

-- Politique SELECT optimisée
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Politique UPDATE optimisée
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

-- Politique admin pour INSERT/DELETE optimisée
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 3. RECRÉER LES POLITIQUES OPTIMISÉES POUR COMMERCES
-- ============================================================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Admins can view all commerces" ON commerces;
DROP POLICY IF EXISTS "Commerciaux can view their assigned commerces" ON commerces;
DROP POLICY IF EXISTS "Admins can insert commerces" ON commerces;
DROP POLICY IF EXISTS "Admins and assigned commerciaux can update commerces" ON commerces;
DROP POLICY IF EXISTS "Admins can delete commerces" ON commerces;

-- Politique SELECT optimisée
CREATE POLICY "View commerces policy"
  ON commerces FOR SELECT
  TO authenticated
  USING (
    commercial_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Politique INSERT optimisée
CREATE POLICY "Insert commerces policy"
  ON commerces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Politique UPDATE optimisée
CREATE POLICY "Update commerces policy"
  ON commerces FOR UPDATE
  TO authenticated
  USING (
    commercial_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    commercial_id = (select auth.uid()) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- Politique DELETE optimisée
CREATE POLICY "Delete commerces policy"
  ON commerces FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- 4. SUPPRIMER LES INDEX INUTILISÉS
-- ============================================================================

DROP INDEX IF EXISTS idx_profiles_role;
DROP INDEX IF EXISTS idx_profiles_actif;
DROP INDEX IF EXISTS idx_commerces_type;
DROP INDEX IF EXISTS idx_commerces_statut;
DROP INDEX IF EXISTS idx_commerces_ville;
DROP INDEX IF EXISTS idx_commerces_place_id;
DROP INDEX IF EXISTS idx_rdv_date;
DROP INDEX IF EXISTS idx_rdv_commerce;
DROP INDEX IF EXISTS idx_rdv_statut;
DROP INDEX IF EXISTS idx_historique_commerce;
DROP INDEX IF EXISTS idx_historique_type;
DROP INDEX IF EXISTS idx_historique_date;

-- ============================================================================
-- 5. CORRIGER LA FONCTION UPDATE_UPDATED_AT_COLUMN
-- ============================================================================

-- Supprimer la fonction avec CASCADE pour supprimer aussi les triggers
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Recréer la fonction avec un search_path sécurisé
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = ''
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recréer les triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_commerces_updated_at
  BEFORE UPDATE ON commerces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rdv_updated_at
  BEFORE UPDATE ON rdv
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();