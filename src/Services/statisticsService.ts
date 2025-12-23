// Service pour récupérer les statistiques depuis Supabase
import { supabase } from '../lib/supabase';
import type { 
  StatisticsData, 
  StatisticsFilters,
  PerformanceCommercial,
  PerformanceParType,
  PerformanceParVille,
  EvolutionStatut
} from '../types/statistics';

export class StatisticsService {
  
  /**
   * Récupère toutes les statistiques en fonction des filtres
   */
  static async getStatistics(filters: StatisticsFilters): Promise<StatisticsData> {
    const [
      kpis,
      performanceCommerciaux,
      performanceParType,
      performanceParVille,
      evolutionStatuts,
      metriquesQualite,
      activiteMensuelle,
      velocite,
      objectifs
    ] = await Promise.all([
      this.getKPIs(filters),
      this.getPerformanceCommerciaux(filters),
      this.getPerformanceParType(filters),
      this.getPerformanceParVille(filters),
      this.getEvolutionStatuts(filters),
      this.getMetriquesQualite(filters),
      this.getActiviteMensuelle(filters),
      this.getVelocite(filters),
      this.getObjectifs(filters)
    ]);

    return {
      kpis,
      performance_commerciaux: performanceCommerciaux,
      performance_par_type: performanceParType,
      performance_par_ville: performanceParVille,
      evolution_statuts: evolutionStatuts,
      metriques_qualite: metriquesQualite,
      activite_mensuelle: activiteMensuelle,
      velocite,
      objectifs
    };
  }

  /**
   * KPIs principaux
   */
  private static async getKPIs(filters: StatisticsFilters) {
    const dateFilter = this.getDateFilter(filters);
    
    // Total commerces
    const { count: totalCommerces } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateFilter.start)
      .lte('created_at', dateFilter.end);

    // Total commerces période précédente (pour évolution)
    const { count: totalCommercesPrev } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateFilter.prevStart)
      .lte('created_at', dateFilter.prevEnd);

    // Commerces gagnés
    const { count: commercesGagnes } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'Gagné')
      .gte('created_at', dateFilter.start)
      .lte('created_at', dateFilter.end);

    // Commerces contactés
    const { count: commercesContactes } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .neq('statut', 'À contacter')
      .gte('created_at', dateFilter.start)
      .lte('created_at', dateFilter.end);

    // CA potentiel
    const { data: caData } = await supabase
      .from('commerces')
      .select('panier_moyen')
      .eq('statut', 'Gagné')
      .gte('created_at', dateFilter.start)
      .lte('created_at', dateFilter.end);

    const caPotentiel = caData?.reduce((sum, c) => sum + (c.panier_moyen || 0), 0) || 0;

    // Commerces actifs
    const { count: commercesActifs } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .in('statut', ['À contacter', 'RDV pris', 'Relance'])
      .gte('created_at', dateFilter.start)
      .lte('created_at', dateFilter.end);

    const tauxConversion = commercesContactes ? (commercesGagnes || 0) / commercesContactes * 100 : 0;

    return {
      total_commerces: totalCommerces || 0,
      total_commerces_evolution: this.calculateEvolution(totalCommerces || 0, totalCommercesPrev || 0),
      taux_conversion: Math.round(tauxConversion * 10) / 10,
      taux_conversion_evolution: 0, // À calculer si besoin
      ca_potentiel: caPotentiel,
      ca_potentiel_evolution: 0, // À calculer si besoin
      commerces_actifs: commercesActifs || 0,
      commerces_actifs_evolution: 0 // À calculer si besoin
    };
  }

  /**
   * Performance par commercial
   */
  private static async getPerformanceCommerciaux(filters: StatisticsFilters): Promise<PerformanceCommercial[]> {
    const { data, error } = await supabase
      .from('commerces')
      .select(`
        commercial_id,
        statut,
        panier_moyen,
        profiles!inner(id, nom)
      `);

    if (error || !data) return [];

    // Grouper par commercial
    const grouped = data.reduce((acc: any, commerce: any) => {
      const commercialId = commerce.commercial_id;
      if (!commercialId) return acc;

      if (!acc[commercialId]) {
        acc[commercialId] = {
          id: commercialId,
          nom: commerce.profiles?.nom || 'Inconnu',
          nb_commerces: 0,
          nb_rdv: 0,
          conversions: 0,
          ca_genere: 0
        };
      }

      acc[commercialId].nb_commerces++;
      
      if (commerce.statut === 'RDV pris') {
        acc[commercialId].nb_rdv++;
      }
      
      if (commerce.statut === 'Gagné') {
        acc[commercialId].conversions++;
        acc[commercialId].ca_genere += commerce.panier_moyen || 0;
      }

      return acc;
    }, {});

    // Convertir en tableau et calculer taux conversion
    return Object.values(grouped).map((commercial: any) => ({
      ...commercial,
      taux_conversion: commercial.nb_commerces > 0 
        ? Math.round((commercial.conversions / commercial.nb_commerces) * 1000) / 10
        : 0
    })).sort((a: any, b: any) => b.conversions - a.conversions);
  }

  /**
   * Performance par type d'établissement
   */
  private static async getPerformanceParType(filters: StatisticsFilters): Promise<PerformanceParType[]> {
    const { data, error } = await supabase
      .from('commerces')
      .select('type_etablissement, statut, panier_moyen, note_google');

    if (error || !data) return [];

    const grouped = data.reduce((acc: any, commerce) => {
      const type = commerce.type_etablissement || 'Non défini';
      
      if (!acc[type]) {
        acc[type] = {
          type_etablissement: type,
          total: 0,
          gagnes: 0,
          panier_total: 0,
          note_total: 0,
          note_count: 0
        };
      }

      acc[type].total++;
      
      if (commerce.statut === 'Gagné') {
        acc[type].gagnes++;
      }
      
      if (commerce.panier_moyen) {
        acc[type].panier_total += commerce.panier_moyen;
      }
      
      if (commerce.note_google) {
        acc[type].note_total += commerce.note_google;
        acc[type].note_count++;
      }

      return acc;
    }, {});

    return Object.values(grouped).map((type: any) => ({
      type_etablissement: type.type_etablissement,
      total: type.total,
      gagnes: type.gagnes,
      taux_conversion: type.total > 0 ? Math.round((type.gagnes / type.total) * 1000) / 10 : 0,
      panier_moyen: type.total > 0 ? Math.round(type.panier_total / type.total) : 0,
      note_moyenne: type.note_count > 0 ? Math.round((type.note_total / type.note_count) * 10) / 10 : 0
    })).sort((a, b) => b.total - a.total);
  }

  /**
   * Performance par ville
   */
  private static async getPerformanceParVille(filters: StatisticsFilters): Promise<PerformanceParVille[]> {
    const { data, error } = await supabase
      .from('commerces')
      .select('ville, statut');

    if (error || !data) return [];

    const grouped = data.reduce((acc: any, commerce) => {
      const ville = commerce.ville || 'Non défini';
      
      if (!acc[ville]) {
        acc[ville] = {
          ville,
          total: 0,
          gagnes: 0
        };
      }

      acc[ville].total++;
      if (commerce.statut === 'Gagné') {
        acc[ville].gagnes++;
      }

      return acc;
    }, {});

    return Object.values(grouped)
      .map((ville: any) => ({
        ville: ville.ville,
        nb_commerces: ville.total,
        taux_conversion: ville.total > 0 ? Math.round((ville.gagnes / ville.total) * 1000) / 10 : 0,
        potentiel: ville.total > 100 ? 'Élevé' : ville.total > 50 ? 'Moyen' : 'Faible'
      }))
      .sort((a, b) => b.nb_commerces - a.nb_commerces)
      .slice(0, 10) as PerformanceParVille[];
  }

  /**
   * Évolution des statuts sur 6 mois
   */
  private static async getEvolutionStatuts(filters: StatisticsFilters): Promise<EvolutionStatut[]> {
    // Pour simplifier, retourner des données mockées
    // Dans une vraie implémentation, faire des requêtes par mois
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
    
    return mois.map(mois => ({
      mois,
      a_contacter: Math.floor(Math.random() * 50) + 20,
      rdv_pris: Math.floor(Math.random() * 30) + 10,
      relance: Math.floor(Math.random() * 20) + 5,
      gagne: Math.floor(Math.random() * 15) + 5,
      perdu: Math.floor(Math.random() * 10) + 2
    }));
  }

  /**
   * Métriques de qualité
   */
  private static async getMetriquesQualite(filters: StatisticsFilters) {
    const { data } = await supabase
      .from('commerces')
      .select('note_google, nb_avis_google, panier_moyen, priorite');

    if (!data) return {
      note_moyenne: 0,
      nb_avis_moyen: 0,
      panier_moyen: 0,
      distribution_priorites: { haute: 0, normale: 0, basse: 0 }
    };

    const notes = data.filter(c => c.note_google).map(c => c.note_google);
    const avis = data.filter(c => c.nb_avis_google).map(c => c.nb_avis_google);
    const paniers = data.filter(c => c.panier_moyen).map(c => c.panier_moyen);

    const priorites = data.reduce((acc: any, c) => {
      if (c.priorite === 'Haute') acc.haute++;
      else if (c.priorite === 'Normale') acc.normale++;
      else if (c.priorite === 'Basse') acc.basse++;
      return acc;
    }, { haute: 0, normale: 0, basse: 0 });

    return {
      note_moyenne: notes.length > 0 ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10 : 0,
      nb_avis_moyen: avis.length > 0 ? Math.round(avis.reduce((a, b) => a + b, 0) / avis.length) : 0,
      panier_moyen: paniers.length > 0 ? Math.round(paniers.reduce((a, b) => a + b, 0) / paniers.length) : 0,
      distribution_priorites: priorites
    };
  }

  /**
   * Activité mensuelle
   */
  private static async getActiviteMensuelle(filters: StatisticsFilters) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    
    const { count: nouveaux } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    const { count: rdvPlanifies } = await supabase
      .from('rendez_vous')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth);

    const { count: conversions } = await supabase
      .from('commerces')
      .select('*', { count: 'exact', head: true })
      .eq('statut', 'Gagné')
      .gte('updated_at', startOfMonth);

    return {
      nouveaux_commerces: nouveaux || 0,
      rdv_planifies: rdvPlanifies || 0,
      rdv_realises: Math.floor((rdvPlanifies || 0) * 0.75), // Estimation 75%
      conversions: conversions || 0
    };
  }

  /**
   * Vélocité de conversion
   */
  private static async getVelocite(filters: StatisticsFilters) {
    // Mock data - nécessiterait un tracking des changements de statut
    return {
      a_contacter_vers_rdv: 5,
      rdv_vers_gagne: 12,
      cycle_complet: 17
    };
  }

  /**
   * Objectifs du mois
   */
  private static async getObjectifs(filters: StatisticsFilters) {
    const activite = await this.getActiviteMensuelle(filters);
    
    return {
      nouveaux_commerces: { actuel: activite.nouveaux_commerces, objectif: 50 },
      rdv_a_prendre: { actuel: activite.rdv_planifies, objectif: 80 },
      conversions: { actuel: activite.conversions, objectif: 25 },
      ca_objectif: { actuel: activite.conversions * 950, objectif: 100000 }
    };
  }

  /**
   * Calcul des filtres de date
   */
  private static getDateFilter(filters: StatisticsFilters) {
    const now = new Date();
    let start: Date, end: Date;

    switch (filters.periode) {
      case 'week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case '3months':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    end = now;

    // Période précédente (même durée)
    const duration = end.getTime() - start.getTime();
    const prevEnd = new Date(start.getTime() - 1);
    const prevStart = new Date(prevEnd.getTime() - duration);

    return {
      start: start.toISOString(),
      end: end.toISOString(),
      prevStart: prevStart.toISOString(),
      prevEnd: prevEnd.toISOString()
    };
  }

  /**
   * Calcul de l'évolution en pourcentage
   */
  private static calculateEvolution(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}