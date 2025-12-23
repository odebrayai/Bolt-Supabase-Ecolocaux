export interface KPIData {
  totalCommerces: number;
  tauxConversion: number;
  caPotentiel: number;
  commercesActifs: number;
}

export interface EvolutionData {
  date: string;
  a_contacter: number;
  rdv_pris: number;
  relance: number;
  gagne: number;
  perdu: number;
}

export interface TypeRepartition {
  type: string;
  count: number;
  percentage: number;
}

export interface TopPerformer {
  id: string;
  nom: string;
  prenom: string;
  totalCommerces: number;
  gagnes: number;
  tauxConversion: number;
  caPotentiel: number;
}

export interface PerformanceParType {
  type: string;
  total: number;
  gagnes: number;
  tauxConversion: number;
  caMoyen: number;
}

export interface PerformanceParVille {
  ville: string;
  total: number;
  gagnes: number;
  tauxConversion: number;
}

export interface QualiteGoogle {
  moyenneNote: number;
  totalAvis: number;
  commercesAvecAvis: number;
  pourcentageAvecAvis: number;
}

export interface ActiviteMensuelle {
  rdvPlanifies: number;
  rdvEffectues: number;
  nouveauxCommerces: number;
  commercesGagnes: number;
}

export interface ObjectifsMois {
  objectifCommerces: number;
  realisationCommerces: number;
  objectifConversion: number;
  realisationConversion: number;
  objectifCA: number;
  realisationCA: number;
}

export interface StatisticsData {
  kpis: KPIData;
  evolution: EvolutionData[];
  typeRepartition: TypeRepartition[];
  topPerformers: TopPerformer[];
  performanceParType: PerformanceParType[];
  performanceParVille: PerformanceParVille[];
  qualiteGoogle: QualiteGoogle;
  activiteMensuelle: ActiviteMensuelle;
  objectifsMois: ObjectifsMois;
}
