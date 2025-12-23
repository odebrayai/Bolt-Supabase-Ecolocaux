# Configuration de CRM Eco-Locaux

## Créer votre premier utilisateur

### Méthode 1 : Inscription via l'interface

1. Lancez l'application : `npm run dev`
2. Cliquez sur "Se connecter"
3. Créez un compte avec votre email et mot de passe

Lors de la première inscription, l'utilisateur est créé automatiquement avec le rôle "commercial" par défaut.

### Méthode 2 : Créer un Admin via SQL

Pour créer un utilisateur admin directement dans la base de données :

1. Allez dans Supabase Dashboard > SQL Editor
2. Exécutez cette requête en remplaçant les valeurs :

```sql
-- Créer un utilisateur admin
-- Remplacez email@example.com et le mot de passe par vos valeurs
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@crm-ecolocaux.com', -- CHANGEZ CET EMAIL
  crypt('VotreMotDePasseSecure123', gen_salt('bf')), -- CHANGEZ CE MOT DE PASSE
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"prenom":"Admin","nom":"Principal","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Le profil sera créé automatiquement via le trigger
```

### Méthode 3 : Via Supabase Auth UI

1. Allez dans Supabase Dashboard > Authentication > Users
2. Cliquez sur "Add user"
3. Entrez l'email et le mot de passe
4. Cliquez sur "Create user"
5. Le profil sera créé automatiquement

## Changer le rôle d'un utilisateur

Pour promouvoir un utilisateur au rôle admin :

```sql
-- Récupérez l'ID de l'utilisateur
SELECT id, email, prenom, nom, role FROM profiles;

-- Changez le rôle
UPDATE profiles
SET role = 'admin'
WHERE email = 'utilisateur@example.com';
```

## Données de démonstration

Pour tester l'application avec des données de démonstration, utilisez la page "Recherche" pour générer des commerces fictifs :

1. Allez dans la section "Recherche"
2. Entrez une ville (ex: "Paris")
3. Sélectionnez un type d'établissement
4. Choisissez le nombre de résultats (ex: 20)
5. Cliquez sur "Lancer la recherche"

Les commerces seront automatiquement créés avec des données simulées.

## Résolution de problèmes

### Erreur "User not found"
- Vérifiez que l'email et le mot de passe sont corrects
- Confirmez que l'utilisateur existe dans Supabase Dashboard > Authentication

### Erreur "Profile not found"
- Le profil devrait être créé automatiquement lors de l'inscription
- Vérifiez que le trigger `on_auth_user_created` est bien activé

### Les commerces ne s'affichent pas
- Vérifiez que vous avez les bonnes permissions (RLS)
- Les commerciaux ne voient que leurs commerces assignés
- Les admins voient tous les commerces

## Support

Pour toute question ou problème, consultez la documentation Supabase ou contactez le support technique.
