/*
  # Activer les souscriptions Realtime

  1. Configuration
    - Active la réplication Realtime pour les tables profiles, commerces et rendez_vous
    - Permet à l'application de recevoir les changements en temps réel via Supabase Realtime

  2. Tables concernées
    - profiles: pour synchroniser les membres de l'équipe
    - commerces: pour synchroniser les commerces
    - rendez_vous: pour synchroniser les rendez-vous

  3. Bénéfices
    - Les changements dans Supabase se reflètent automatiquement dans l'interface
    - Pas besoin de recharger manuellement les pages
    - Synchronisation en temps réel entre tous les utilisateurs
*/

-- Active la publication Realtime pour la table profiles
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;

-- Active la publication Realtime pour la table commerces
ALTER PUBLICATION supabase_realtime ADD TABLE commerces;

-- Active la publication Realtime pour la table rendez_vous
ALTER PUBLICATION supabase_realtime ADD TABLE rendez_vous;

-- Active la publication Realtime pour la table commentaires
ALTER PUBLICATION supabase_realtime ADD TABLE commentaires;