/*
  # Schéma CRM Eco-Locaux
  
  ## Tables créées
  
  ### 1. profiles
  Extension de auth.users pour les membres de l'équipe
  - `id` (uuid, FK vers auth.users)
  - `email` (text, unique)
  - `prenom` (text)
  - `nom` (text)
  - `role` (text) : 'admin', 'commercial', 'viewer'
  - `avatar_url` (text, nullable)
  - `telephone` (text, nullable)
  - `actif` (boolean, par défaut true)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. commerces
  Établissements prospectés
  - `id` (uuid, PK)
  - `nom` (text)
  - `type` (text) : boulangerie, restaurant, pizzeria, poissonnerie, pressing, boucherie
  - `adresse` (text)
  - `ville` (text)
  - `code_postal` (text)
  - `telephone` (text, nullable)
  - `email` (text, nullable)
  - `site_web` (text, nullable)
  - `facebook` (text, nullable)
  - `instagram` (text, nullable)
  - `linkedin` (text, nullable)
  - `note_google` (numeric, nullable)
  - `nb_avis` (integer, nullable)
  - `panier_moyen` (numeric, nullable)
  - `statut` (text) : a_contacter, rdv_pris, relance, gagne, perdu
  - `priorite` (text) : basse, normale, haute
  - `notes` (text, nullable)
  - `commercial_id` (uuid, FK vers profiles, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 3. rendez_vous
  Rendez-vous planifiés avec les commerces
  - `id` (uuid, PK)
  - `commerce_id` (uuid, FK vers commerces)
  - `commercial_id` (uuid, FK vers profiles)
  - `date` (date)
  - `heure` (time)
  - `statut` (text) : planifie, effectue, annule
  - `notes` (text, nullable)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 4. commentaires
  Historique des commentaires sur les commerces
  - `id` (uuid, PK)
  - `commerce_id` (uuid, FK vers commerces)
  - `user_id` (uuid, FK vers profiles)
  - `commentaire` (text)
  - `created_at` (timestamptz)
  
  ## Sécurité
  
  - RLS activé sur toutes les tables
  - Politiques restrictives basées sur les rôles
  - Admin : accès complet
  - Commercial : accès à ses commerces assignés
  - Viewer : lecture seule
*/

-- Table profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  prenom text NOT NULL,
  nom text NOT NULL,
  role text NOT NULL DEFAULT 'commercial' CHECK (role IN ('admin', 'commercial', 'viewer')),
  avatar_url text,
  telephone text,
  actif boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table commerces
CREATE TABLE IF NOT EXISTS commerces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  type text NOT NULL CHECK (type IN ('boulangerie', 'restaurant', 'pizzeria', 'poissonnerie', 'pressing', 'boucherie')),
  adresse text NOT NULL,
  ville text NOT NULL,
  code_postal text NOT NULL,
  telephone text,
  email text,
  site_web text,
  facebook text,
  instagram text,
  linkedin text,
  note_google numeric CHECK (note_google >= 0 AND note_google <= 5),
  nb_avis integer DEFAULT 0,
  panier_moyen numeric DEFAULT 0,
  statut text DEFAULT 'a_contacter' CHECK (statut IN ('a_contacter', 'rdv_pris', 'relance', 'gagne', 'perdu')),
  priorite text DEFAULT 'normale' CHECK (priorite IN ('basse', 'normale', 'haute')),
  notes text,
  commercial_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table rendez_vous
CREATE TABLE IF NOT EXISTS rendez_vous (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  commercial_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  heure time NOT NULL,
  statut text DEFAULT 'planifie' CHECK (statut IN ('planifie', 'effectue', 'annule')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table commentaires
CREATE TABLE IF NOT EXISTS commentaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  commerce_id uuid NOT NULL REFERENCES commerces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  commentaire text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Indexes pour performance
CREATE INDEX IF NOT EXISTS idx_commerces_commercial ON commerces(commercial_id);
CREATE INDEX IF NOT EXISTS idx_commerces_statut ON commerces(statut);
CREATE INDEX IF NOT EXISTS idx_commerces_ville ON commerces(ville);
CREATE INDEX IF NOT EXISTS idx_commerces_type ON commerces(type);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_date ON rendez_vous(date);
CREATE INDEX IF NOT EXISTS idx_rendez_vous_commercial ON rendez_vous(commercial_id);
CREATE INDEX IF NOT EXISTS idx_commentaires_commerce ON commentaires(commerce_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_commerces_updated_at ON commerces;
CREATE TRIGGER update_commerces_updated_at
  BEFORE UPDATE ON commerces
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rendez_vous_updated_at ON rendez_vous;
CREATE TRIGGER update_rendez_vous_updated_at
  BEFORE UPDATE ON rendez_vous
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, prenom, nom, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'prenom', 'Utilisateur'),
    COALESCE(NEW.raw_user_meta_data->>'nom', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'commercial')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour création automatique du profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE commerces ENABLE ROW LEVEL SECURITY;
ALTER TABLE rendez_vous ENABLE ROW LEVEL SECURITY;
ALTER TABLE commentaires ENABLE ROW LEVEL SECURITY;

-- Policies pour profiles
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies pour commerces
CREATE POLICY "Users can view all commerces"
  ON commerces FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Commercials can insert commerces"
  ON commerces FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Commercials can update assigned commerces"
  ON commerces FOR UPDATE
  TO authenticated
  USING (
    commercial_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    commercial_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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

-- Policies pour rendez_vous
CREATE POLICY "Users can view all rendez_vous"
  ON rendez_vous FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Commercials can insert rendez_vous"
  ON rendez_vous FOR INSERT
  TO authenticated
  WITH CHECK (
    commercial_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Commercials can update their rendez_vous"
  ON rendez_vous FOR UPDATE
  TO authenticated
  USING (
    commercial_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    commercial_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Commercials can delete their rendez_vous"
  ON rendez_vous FOR DELETE
  TO authenticated
  USING (
    commercial_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policies pour commentaires
CREATE POLICY "Users can view commentaires for accessible commerces"
  ON commentaires FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert commentaires"
  ON commentaires FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'commercial')
    )
  );

CREATE POLICY "Users can delete own commentaires"
  ON commentaires FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );