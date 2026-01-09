# CRM Eco-Locaux

Application CRM de prospection commerciale pour commerces de proximité (boulangeries, restaurants, pizzerias, poissonneries, pressings, boucheries).

## Fonctionnalités

### Authentification
- Connexion sécurisée avec Supabase Auth
- Gestion des rôles (Admin, Commercial, Viewer)

### Dashboard
- Vue d'ensemble avec KPIs clés
- Total des commerces
- RDV de la semaine
- Taux de conversion
- Commerces à relancer
- Liste des derniers commerces ajoutés
- Prochains rendez-vous

### Recherche & Prospection
- Recherche de nouveaux commerces par ville ou code postal
- Filtrage par type d'établissement
- Attribution automatique aux commerciaux
- Ajout groupé au CRM

### Gestion des Commerces
- Liste complète avec filtres avancés
- Recherche par nom ou ville
- Filtres : type, statut, commercial, note
- Fiche détaillée éditable
- Statuts : À contacter, RDV pris, Relance, Gagné, Perdu
- Priorités : Basse, Normale, Haute
- Métriques Google (note, avis, panier moyen)

### Gestion d'Équipe
- Liste des membres avec statistiques
- Nombre de commerces assignés
- RDV du mois par commercial
- Indicateurs de performance

## Technologies

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Icons**: Lucide React

## Design System

### Palette de couleurs (Dark Theme)
- Background: `#0a0a0f`
- Cards: `#12121a`
- Accent primaire: `#06b6d4` (cyan)
- Success: `#10b981` (vert émeraude)
- Warning: `#f59e0b` (orange)
- Danger: `#ef4444` (rouge)

### Typographie
- Font: Inter
- Weights: 400, 500, 600, 700

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Les variables d'environnement Supabase sont déjà configurées dans `.env`

3. Lancer l'application en mode développement :
```bash
npm run dev
```

4. Build pour la production :
```bash
npm run build
```

## Utilisation

Ce compte dispose de tous les droits administrateur pour évaluer l'ensemble des fonctionnalités.

### Première connexion

Pour créer votre premier utilisateur admin, utilisez la console Supabase ou inscrivez-vous directement via l'application.

### Navigation

L'application comporte une sidebar avec les sections suivantes :
- **Dashboard** : Vue d'ensemble et statistiques
- **Recherche** : Ajouter de nouveaux commerces
- **Commerces** : Gérer les commerces existants
- **Rendez-vous** : Calendrier (à venir)
- **Équipe** : Gestion des membres
- **Statistiques** : Rapports avancés (à venir)
- **Paramètres** : Configuration (à venir)

### Workflow de prospection

1. **Recherche** : Utilisez la page Recherche pour trouver de nouveaux commerces
2. **Attribution** : Assignez les commerces à un commercial
3. **Suivi** : Mettez à jour les statuts et priorités
4. **Rendez-vous** : Planifiez des RDV avec les prospects
5. **Conversion** : Marquez les commerces comme "Gagné" une fois signés

## Structure de la base de données

### Tables principales

- **profiles** : Utilisateurs et membres de l'équipe
- **commerces** : Établissements prospectés
- **rendez_vous** : Rendez-vous planifiés
- **commentaires** : Historique des interactions

### Sécurité

- Row Level Security (RLS) activé sur toutes les tables
- Politiques basées sur les rôles
- Admin : accès complet
- Commercial : accès à ses commerces assignés
- Viewer : lecture seule

## Licence

Propriétaire - CRM Eco-Locaux 2024
