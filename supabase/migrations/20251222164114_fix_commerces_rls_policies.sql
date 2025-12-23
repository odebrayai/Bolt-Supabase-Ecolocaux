/*
  # Correction des politiques RLS pour la table commerces
  
  1. Problème identifié
    - Une politique "Users can view all commerces" permet à tous les utilisateurs de voir tous les commerces
    - Les commerciaux ne devraient voir QUE les commerces qui leur sont assignés
    - Seuls les admins devraient voir tous les commerces
    
  2. Solution
    - Supprimer toutes les politiques existantes sur commerces
    - Recréer des politiques strictes et claires :
      * SELECT : Admins voient tout, commerciaux voient uniquement leurs commerces assignés
      * INSERT : Admins et commerciaux peuvent créer des commerces
      * UPDATE : Admins peuvent tout modifier, commerciaux peuvent modifier leurs commerces assignés
      * DELETE : Seuls les admins peuvent supprimer
      
  3. Sécurité
    - Les commerciaux n'ont accès qu'aux données qui leur sont explicitement assignées
    - Les admins conservent un accès complet
*/

-- ============================================================================
-- 1. SUPPRIMER TOUTES LES POLITIQUES EXISTANTES SUR COMMERCES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view all commerces" ON commerces;
DROP POLICY IF EXISTS "Admins can view all commerces" ON commerces;
DROP POLICY IF EXISTS "Commerciaux can view their assigned commerces" ON commerces;
DROP POLICY IF EXISTS "Commercials can insert commerces" ON commerces;
DROP POLICY IF EXISTS "Admins can insert commerces" ON commerces;
DROP POLICY IF EXISTS "Commercials can update assigned commerces" ON commerces;
DROP POLICY IF EXISTS "Admins and assigned commerciaux can update commerces" ON commerces;
DROP POLICY IF EXISTS "Admins can delete commerces" ON commerces;
DROP POLICY IF EXISTS "View commerces policy" ON commerces;
DROP POLICY IF EXISTS "Insert commerces policy" ON commerces;
DROP POLICY IF EXISTS "Update commerces policy" ON commerces;
DROP POLICY IF EXISTS "Delete commerces policy" ON commerces;

-- ============================================================================
-- 2. CRÉER LES NOUVELLES POLITIQUES STRICTES
-- ============================================================================

-- Politique SELECT : Admins voient tout, commerciaux voient leurs commerces
CREATE POLICY "Commerciaux view assigned commerces only"
  ON commerces FOR SELECT
  TO authenticated
  USING (
    -- L'utilisateur est un admin
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
    OR
    -- OU le commerce est assigné au commercial connecté
    commercial_id = (SELECT auth.uid())
  );

-- Politique INSERT : Admins et commerciaux peuvent créer
CREATE POLICY "Admins and commerciaux can insert commerces"
  ON commerces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role IN ('admin', 'commercial')
    )
  );

-- Politique UPDATE : Admins tout modifier, commerciaux leurs commerces
CREATE POLICY "Admins and commerciaux can update commerces"
  ON commerces FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
    OR
    commercial_id = (SELECT auth.uid())
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
    OR
    commercial_id = (SELECT auth.uid())
  );

-- Politique DELETE : Seuls les admins peuvent supprimer
CREATE POLICY "Only admins can delete commerces"
  ON commerces FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (SELECT auth.uid())
      AND profiles.role = 'admin'
    )
  );
