/*
  # Migration des données de statut pour rendez_vous
  
  1. Description
    - Met à jour les valeurs de statut existantes dans la table rendez_vous
    - Convertit les anciennes valeurs sans accents vers les nouvelles valeurs avec accents
    - Assure la cohérence des données avec le schéma actuel
    
  2. Changements
    - 'planifie' → 'planifié'
    - 'effectue' → 'effectué'
    - 'annule' → 'annulé'
    
  3. Sécurité
    - Cette migration est idempotente et peut être exécutée plusieurs fois sans danger
    - Ne modifie que les colonnes statut de la table rendez_vous
*/

-- Mettre à jour les valeurs de statut existantes
UPDATE rendez_vous 
SET statut = 'planifié' 
WHERE statut = 'planifie';

UPDATE rendez_vous 
SET statut = 'effectué' 
WHERE statut = 'effectue';

UPDATE rendez_vous 
SET statut = 'annulé' 
WHERE statut = 'annule';