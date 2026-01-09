import { supabase } from '../lib/supabase';
import type {
  KPIData,
  EvolutionData,
  TypeRepartition,
  TopPerformer,
  PerformanceParType,
  PerformanceParVille,
  QualiteGoogle,
  ActiviteMensuelle,
  ObjectifsMois,
  StatisticsData
} from '../types/statistics';
import type { Database } from '../lib/database.types';

type Commerce = Database['public']['Tables']['commerces']['Row'];
type RendezVous = Database['public']['Tables']['rendez_vous']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export async function fetchStatistics(): Promise<StatisticsData> {
  const [commerces, rendezVous, profiles] = await Promise.all([
    supabase.from('commerces').select('*'),
    supabase.from('rendez_vous').select('*'),
    supabase.from('profiles').select('*')
  ]);

  const commercesData = commerces.data || [];
  const rendezVousData = rendezVous.data || [];
  const profilesData = profiles.data || [];

  return {
    kpis: calculateKPIs(commercesData),
    evolution: calculateEvolution(commercesData),
    typeRepartition: calculateTypeRepartition(commercesData),
    topPerformers: calculateTopPerformers(commercesData, profilesData),
    performanceParType: calculatePerformanceParType(commercesData),
    performanceParVille: calculatePerformanceParVille(commercesData),
    qualiteGoogle: calculateQualiteGoogle(commercesData),
    activiteMensuelle: calculateActiviteMensuelle(commercesData, rendezVousData),
    objectifsMois: calculateObjectifsMois(commercesData)
  };
}

function calculateKPIs(commerces: Commerce[]): KPIData {
  const totalCommerces = commerces.length;
  const gagnes = commerces.filter(c => c.statut === 'gagne').length;
  const tauxConversion = totalCommerces > 0 ? (gagnes / totalCommerces) * 100 : 0;

  const caPotentiel = commerces
    .filter(c => c.statut === 'gagne' && c.panier_moyen)
    .reduce((sum, c) => sum + (c.panier_moyen || 0), 0);

  const commercesActifs = commerces.filter(c =>
    c.statut === 'rdv_pris' || c.statut === 'relance' || c.statut === 'a_contacter'
  ).length;

  return {
    totalCommerces,
    tauxConversion: Math.round(tauxConversion * 10) / 10,
    caPotentiel,
    commercesActifs
  };
}

function calculateEvolution(commerces: Commerce[]): EvolutionData[] {
  const last7Days: EvolutionData[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const commercesUpToDate = commerces.filter(c => {
      const createdDate = new Date(c.created_at || '');
      return createdDate <= date;
    });

    last7Days.push({
      date: dateStr,
      a_contacter: commercesUpToDate.filter(c => c.statut === 'a_contacter').length,
      rdv_pris: commercesUpToDate.filter(c => c.statut === 'rdv_pris').length,
      relance: commercesUpToDate.filter(c => c.statut === 'relance').length,
      gagne: commercesUpToDate.filter(c => c.statut === 'gagne').length,
      perdu: commercesUpToDate.filter(c => c.statut === 'perdu').length
    });
  }

  return last7Days;
}

function calculateTypeRepartition(commerces: Commerce[]): TypeRepartition[] {
  const typeCounts = new Map<string, number>();

  commerces.forEach(c => {
    const type = c.type_commerce || 'Autre';
    typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
  });

  const total = commerces.length;

  return Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100 * 10) / 10 : 0
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateTopPerformers(commerces: Commerce[], profiles: Profile[]): TopPerformer[] {
  const performerMap = new Map<string, {
    profile: Profile;
    commerces: Commerce[];
  }>();

  commerces.forEach(c => {
    if (c.commercial_id) {
      if (!performerMap.has(c.commercial_id)) {
        const profile = profiles.find(p => p.id === c.commercial_id);
        if (profile) {
          performerMap.set(c.commercial_id, { profile, commerces: [] });
        }
      }
      performerMap.get(c.commercial_id)?.commerces.push(c);
    }
  });

  return Array.from(performerMap.entries())
    .map(([id, { profile, commerces }]) => {
      const totalCommerces = commerces.length;
      const gagnes = commerces.filter(c => c.statut === 'gagne').length;
      const tauxConversion = totalCommerces > 0 ? (gagnes / totalCommerces) * 100 : 0;
      const caPotentiel = commerces
        .filter(c => c.statut === 'gagne' && c.panier_moyen)
        .reduce((sum, c) => sum + (c.panier_moyen || 0), 0);

      return {
        id,
        nom: profile.nom,
        prenom: profile.prenom,
        totalCommerces,
        gagnes,
        tauxConversion: Math.round(tauxConversion * 10) / 10,
        caPotentiel
      };
    })
    .sort((a, b) => b.gagnes - a.gagnes)
    .slice(0, 10);
}

function calculatePerformanceParType(commerces: Commerce[]): PerformanceParType[] {
  const typeMap = new Map<string, Commerce[]>();

  commerces.forEach(c => {
    const type = c.type_commerce || 'Autre';
    if (!typeMap.has(type)) {
      typeMap.set(type, []);
    }
    typeMap.get(type)?.push(c);
  });

  return Array.from(typeMap.entries())
    .map(([type, commercesList]) => {
      const total = commercesList.length;
      const gagnes = commercesList.filter(c => c.statut === 'gagne').length;
      const tauxConversion = total > 0 ? (gagnes / total) * 100 : 0;
      const caMoyen = gagnes > 0
        ? commercesList
            .filter(c => c.statut === 'gagne' && c.panier_moyen)
            .reduce((sum, c) => sum + (c.panier_moyen || 0), 0) / gagnes
        : 0;

      return {
        type,
        total,
        gagnes,
        tauxConversion: Math.round(tauxConversion * 10) / 10,
        caMoyen: Math.round(caMoyen)
      };
    })
    .sort((a, b) => b.total - a.total);
}

function calculatePerformanceParVille(commerces: Commerce[]): PerformanceParVille[] {
  const villeMap = new Map<string, Commerce[]>();

  commerces.forEach(c => {
    const ville = c.ville_recherche || 'Non spécifié';
    if (!villeMap.has(ville)) {
      villeMap.set(ville, []);
    }
    villeMap.get(ville)?.push(c);
  });

  return Array.from(villeMap.entries())
    .map(([ville, commercesList]) => {
      const total = commercesList.length;
      const gagnes = commercesList.filter(c => c.statut === 'gagne').length;
      const tauxConversion = total > 0 ? (gagnes / total) * 100 : 0;

      return {
        ville,
        total,
        gagnes,
        tauxConversion: Math.round(tauxConversion * 10) / 10
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

function calculateQualiteGoogle(commerces: Commerce[]): QualiteGoogle {
  const commercesAvecNote = commerces.filter(c => c.note !== null && c.note !== undefined);
  const totalAvis = commerces.reduce((sum, c) => sum + (c.nombre_avis || 0), 0);
  const moyenneNote = commercesAvecNote.length > 0
    ? commercesAvecNote.reduce((sum, c) => sum + (c.note || 0), 0) / commercesAvecNote.length
    : 0;

  return {
    moyenneNote: Math.round(moyenneNote * 10) / 10,
    totalAvis,
    commercesAvecAvis: commercesAvecNote.length,
    pourcentageAvecAvis: commerces.length > 0
      ? Math.round((commercesAvecNote.length / commerces.length) * 100 * 10) / 10
      : 0
  };
}

function calculateActiviteMensuelle(commerces: Commerce[], rendezVous: RendezVous[]): ActiviteMensuelle {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const rdvCeMois = rendezVous.filter(r => {
    const rdvDate = new Date(r.date);
    return rdvDate >= firstDayOfMonth;
  });

  const commercesCeMois = commerces.filter(c => {
    const createdDate = new Date(c.created_at || '');
    return createdDate >= firstDayOfMonth;
  });

  return {
    rdvPlanifies: rdvCeMois.filter(r => r.statut === 'planifié' || r.statut === 'confirmé').length,
    rdvEffectues: rdvCeMois.filter(r => r.statut === 'effectué').length,
    nouveauxCommerces: commercesCeMois.length,
    commercesGagnes: commercesCeMois.filter(c => c.statut === 'gagne').length
  };
}

function calculateObjectifsMois(commerces: Commerce[]): ObjectifsMois {
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const commercesCeMois = commerces.filter(c => {
    const createdDate = new Date(c.created_at || '');
    return createdDate >= firstDayOfMonth;
  });

  const gagnesCeMois = commercesCeMois.filter(c => c.statut === 'gagne').length;
  const tauxConversionCeMois = commercesCeMois.length > 0
    ? (gagnesCeMois / commercesCeMois.length) * 100
    : 0;

  const caCeMois = commercesCeMois
    .filter(c => c.statut === 'gagne' && c.panier_moyen)
    .reduce((sum, c) => sum + (c.panier_moyen || 0), 0);

  return {
    objectifCommerces: 50,
    realisationCommerces: commercesCeMois.length,
    objectifConversion: 25,
    realisationConversion: Math.round(tauxConversionCeMois * 10) / 10,
    objectifCA: 50000,
    realisationCA: caCeMois
  };
}
