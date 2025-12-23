// Types pour les statistiques du CRM Eco-Locaux

export interface KPICard {
  title: string;
  value: string | number;
  evolution?: number;
  icon: string;
  color: 'cyan' | 'green' | 'orange' | 'purple';
}

export interface PerformanceCommercial {
  id: string;
  nom: string;
  nb_commerces: number;
  nb_rdv: number;
  conversions: number;
  taux_conversion: number;
  ca_genere: number;
}

export interface PerformanceParType {
  type_etablissement: string;
  total: number;
  gagnes: number;
  taux_conversion: number;
  panier_moyen: number;
  note_moyenne: number;
}

export interface PerformanceParVille {
  ville: string;
  nb_commerces: number;
  taux_conversion: number;
  potentiel: 'Élevé' | 'Moyen' | 'Faible';
}

export interface EvolutionStatut {
  mois: string;
  a_contacter: number;
  rdv_pris: number;
  relance: number;
  gagne: number;
  perdu: number;
}

export interface MetriquesQualite {
  note_moyenne: number;
  nb_avis_moyen: number;
  panier_moyen: number;
  distribution_priorites: {
    haute: number;
    normale: number;
    basse: number;
  };
}

export interface ActiviteMensuelle {
  nouveaux_commerces: number;
  rdv_planifies: number;
  rdv_realises: number;
  conversions: number;
}

export interface VelociteConversion {
  a_contacter_vers_rdv: number; // en jours
  rdv_vers_gagne: number; // en jours
  cycle_complet: number; // en jours
}

export interface ObjectifsMois {
  nouveaux_commerces: { actuel: number; objectif: number };
  rdv_a_prendre: { actuel: number; objectif: number };
  conversions: { actuel: number; objectif: number };
  ca_objectif: { actuel: number; objectif: number };
}

export interface StatisticsData {
  kpis: {
    total_commerces: number;
    total_commerces_evolution: number;
    taux_conversion: number;
    taux_conversion_evolution: number;
    ca_potentiel: number;
    ca_potentiel_evolution: number;
    commerces_actifs: number;
    commerces_actifs_evolution: number;
  };
  performance_commerciaux: PerformanceCommercial[];
  performance_par_type: PerformanceParType[];
  performance_par_ville: PerformanceParVille[];
  evolution_statuts: EvolutionStatut[];
  metriques_qualite: MetriquesQualite;
  activite_mensuelle: ActiviteMensuelle;
  velocite: VelociteConversion;
  objectifs: ObjectifsMois;
}

export interface StatisticsFilters {
  periode: 'week' | 'month' | '3months' | '6months' | 'year' | 'custom';
  date_debut?: string;
  date_fin?: string;
  commercial_id?: string;
  types?: string[];
  villes?: string[];
  statuts?: string[];
}