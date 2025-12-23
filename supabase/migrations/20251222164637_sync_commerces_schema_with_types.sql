/*
  # Synchroniser le schéma de la table commerces avec les types TypeScript
  
  1. Problème identifié
    - Le schéma de la base de données ne correspond pas aux types TypeScript
    - Différences de noms de colonnes :
      * `type` devrait être `type_commerce`
      * `ville` devrait être `ville_recherche`
      * `note_google` devrait être `note`
      * `nb_avis` devrait être `nombre_avis`
      * `notes` devrait être `notes_internes`
    
  2. Solution
    - Renommer les colonnes pour correspondre aux types TypeScript
    - Ajouter les colonnes manquantes du schéma TypeScript
    - Supprimer les colonnes inutiles
    
  3. Sécurité
    - Aucune donnée à perdre car la table est vide
*/

-- ============================================================================
-- 1. RENOMMER LES COLONNES EXISTANTES
-- ============================================================================

DO $$ 
BEGIN
  -- Renommer type en type_commerce
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'type'
  ) THEN
    ALTER TABLE commerces RENAME COLUMN type TO type_commerce;
  END IF;

  -- Renommer ville en ville_recherche
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'ville'
  ) THEN
    ALTER TABLE commerces RENAME COLUMN ville TO ville_recherche;
  END IF;

  -- Renommer note_google en note
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'note_google'
  ) THEN
    ALTER TABLE commerces RENAME COLUMN note_google TO note;
  END IF;

  -- Renommer nb_avis en nombre_avis
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'nb_avis'
  ) THEN
    ALTER TABLE commerces RENAME COLUMN nb_avis TO nombre_avis;
  END IF;

  -- Renommer notes en notes_internes
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'notes'
  ) THEN
    ALTER TABLE commerces RENAME COLUMN notes TO notes_internes;
  END IF;
END $$;

-- ============================================================================
-- 2. SUPPRIMER LES CONTRAINTES NOT NULL INAPPROPRIÉES
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' 
    AND column_name = 'type_commerce' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE commerces ALTER COLUMN type_commerce DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' 
    AND column_name = 'adresse' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE commerces ALTER COLUMN adresse DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' 
    AND column_name = 'ville_recherche' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE commerces ALTER COLUMN ville_recherche DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' 
    AND column_name = 'code_postal' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE commerces ALTER COLUMN code_postal DROP NOT NULL;
  END IF;
END $$;

-- ============================================================================
-- 3. AJOUTER LES COLONNES MANQUANTES
-- ============================================================================

DO $$ 
BEGIN
  -- Ajouter place_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'place_id'
  ) THEN
    ALTER TABLE commerces ADD COLUMN place_id text;
  END IF;

  -- Ajouter url_google_maps
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'url_google_maps'
  ) THEN
    ALTER TABLE commerces ADD COLUMN url_google_maps text;
  END IF;

  -- Ajouter categorie
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'categorie'
  ) THEN
    ALTER TABLE commerces ADD COLUMN categorie text;
  END IF;

  -- Ajouter contact_nom
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'contact_nom'
  ) THEN
    ALTER TABLE commerces ADD COLUMN contact_nom text;
  END IF;

  -- Ajouter contact_poste
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'contact_poste'
  ) THEN
    ALTER TABLE commerces ADD COLUMN contact_poste text;
  END IF;

  -- Ajouter enrichi_gemini
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'enrichi_gemini'
  ) THEN
    ALTER TABLE commerces ADD COLUMN enrichi_gemini boolean DEFAULT false;
  END IF;

  -- Ajouter scoring_ia
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'scoring_ia'
  ) THEN
    ALTER TABLE commerces ADD COLUMN scoring_ia numeric(3, 2);
  END IF;

  -- Ajouter date_scraping
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'date_scraping'
  ) THEN
    ALTER TABLE commerces ADD COLUMN date_scraping timestamptz;
  END IF;
END $$;

-- ============================================================================
-- 4. SUPPRIMER LA COLONNE CODE_POSTAL SI ELLE N'EST PAS UTILISÉE
-- ============================================================================

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'commerces' AND column_name = 'code_postal'
  ) THEN
    ALTER TABLE commerces DROP COLUMN code_postal;
  END IF;
END $$;
