export interface Business {
  nom: string;
  adresse?: string | null;
  telephone?: string | null;
  site_web?: string | null;
  email?: string | null;
  note?: number | null;
  nombre_avis?: number | null;
  panier_moyen?: number | null;
  type?: string | null;
  statut?: string | null;
  priorite?: string | null;
}

export interface ScorePriority {
  score: number;
  category: 'max' | 'haute' | 'standard' | 'basse';
  label: string;
  emoji: string;
  colorClasses: string;
}

export interface ScoreBreakdown {
  total: number;
  noteGoogle: { score: number; max: 30 };
  nombreAvis: { score: number; max: 50 };
  completude: { score: number; max: 20 };
}

function calculateNoteGoogleScore(note?: number | null): number {
  if (!note) return 0;
  if (note >= 4.5) return 30;
  if (note >= 4.0) return 24;
  if (note >= 3.5) return 18;
  if (note >= 3.0) return 12;
  return 6;
}

function calculateNombreAvisScore(avis?: number | null): number {
  if (!avis || avis === 0) return 0;
  if (avis > 200) return 50;
  if (avis >= 100) return 43;
  if (avis >= 50) return 36;
  if (avis >= 20) return 26;
  if (avis >= 10) return 17;
  if (avis >= 5) return 10;
  return 3;
}

function calculatePanierMoyenScore(panier?: number | null): number {
  if (!panier) return 0;
  if (panier >= 40) return 5;
  if (panier >= 25) return 4;
  if (panier >= 15) return 3;
  if (panier >= 5) return 2;
  return 1;
}

function calculateCompletudeScore(business: Business): number {
  let score = 0;
  if (business.site_web) score += 6;
  if (business.telephone) score += 5;
  if (business.email) score += 4;
  score += calculatePanierMoyenScore(business.panier_moyen);
  return score;
}

export function calculateBusinessScore(business: Business): number {
  const noteScore = calculateNoteGoogleScore(business.note);
  const avisScore = calculateNombreAvisScore(business.nombre_avis);
  const completudeScore = calculateCompletudeScore(business);

  return Math.round(noteScore + avisScore + completudeScore);
}

export function getScoreBreakdown(business: Business): ScoreBreakdown {
  return {
    total: calculateBusinessScore(business),
    noteGoogle: {
      score: calculateNoteGoogleScore(business.note),
      max: 30
    },
    nombreAvis: {
      score: calculateNombreAvisScore(business.nombre_avis),
      max: 50
    },
    completude: {
      score: calculateCompletudeScore(business),
      max: 20
    }
  };
}

export function getScorePriorityDark(score: number): ScorePriority {
  if (score >= 80) {
    return {
      score,
      category: 'max',
      label: 'Priorité Urgent',
      emoji: '⭐⭐⭐⭐',
      colorClasses: 'bg-red-900/30 text-red-400 border-red-800/50'
    };
  }
  if (score >= 60) {
    return {
      score,
      category: 'haute',
      label: 'Priorité Important',
      emoji: '⭐⭐⭐',
      colorClasses: 'bg-orange-900/30 text-orange-400 border-orange-800/50'
    };
  }
  if (score >= 40) {
    return {
      score,
      category: 'standard',
      label: 'Priorité Moyenne',
      emoji: '⭐⭐',
      colorClasses: 'bg-green-900/30 text-green-400 border-green-800/50'
    };
  }
  return {
    score,
    category: 'basse',
    label: 'Priorité Basse',
    emoji: '⭐',
    colorClasses: 'bg-gray-800/30 text-gray-400 border-gray-700/50'
  };
}

export function sortByScore(businesses: Business[], ascending: boolean = false): Business[] {
  return [...businesses].sort((a, b) => {
    const scoreA = calculateBusinessScore(a);
    const scoreB = calculateBusinessScore(b);
    return ascending ? scoreA - scoreB : scoreB - scoreA;
  });
}

export function filterByScoreCategory(
  businesses: Business[],
  category: 'max' | 'haute' | 'standard' | 'basse'
): Business[] {
  return businesses.filter(business => {
    const score = calculateBusinessScore(business);
    const priority = getScorePriorityDark(score);
    return priority.category === category;
  });
}
