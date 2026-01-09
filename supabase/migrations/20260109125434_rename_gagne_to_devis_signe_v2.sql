/*
  # Renommer le statut 'gagne' en 'devis_signe'

  1. Modifications
    - Supprimer l'ancien CHECK constraint sur la colonne statut
    - Mettre à jour toutes les lignes existantes avec statut 'gagne' vers 'devis_signe'
    - Ajouter un nouveau CHECK constraint avec 'devis_signe' au lieu de 'gagne'
  
  2. Sécurité
    - Aucun changement aux politiques RLS
    - Les données existantes sont préservées avec le nouveau nom de statut
*/

-- Supprimer l'ancien constraint d'abord
ALTER TABLE commerces DROP CONSTRAINT IF EXISTS commerces_statut_check;

-- Mettre à jour les données existantes
UPDATE commerces 
SET statut = 'devis_signe' 
WHERE statut = 'gagne';

-- Ajouter le nouveau constraint avec le nouveau nom
ALTER TABLE commerces 
ADD CONSTRAINT commerces_statut_check 
CHECK (statut IN ('a_contacter', 'rdv_pris', 'relance', 'devis_signe', 'perdu'));
