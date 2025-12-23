/*
  # Correction des problèmes RLS et d'authentification

  1. Corrections de sécurité
    - Active RLS sur la table commerces
    - Ajoute les politiques RLS manquantes pour commerces
    
  2. Corrections du trigger de profil
    - Corrige le trigger qui crée automatiquement un profil lors de l'inscription
    - Gère les erreurs de manière appropriée
*/

-- Activer RLS sur la table commerces
ALTER TABLE commerces ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table commerces
DROP POLICY IF EXISTS "Admins can view all commerces" ON commerces;
CREATE POLICY "Admins can view all commerces"
  ON commerces FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Commerciaux can view their assigned commerces" ON commerces;
CREATE POLICY "Commerciaux can view their assigned commerces"
  ON commerces FOR SELECT
  TO authenticated
  USING (
    commercial_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can insert commerces" ON commerces;
CREATE POLICY "Admins can insert commerces"
  ON commerces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins and assigned commerciaux can update commerces" ON commerces;
CREATE POLICY "Admins and assigned commerciaux can update commerces"
  ON commerces FOR UPDATE
  TO authenticated
  USING (
    commercial_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    commercial_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete commerces" ON commerces;
CREATE POLICY "Admins can delete commerces"
  ON commerces FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Correction du trigger de création de profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, actif)
  VALUES (
    NEW.id,
    NEW.email,
    'commercial',
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log l'erreur mais ne bloque pas la création de l'utilisateur
    RAISE WARNING 'Erreur lors de la création du profil pour %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();