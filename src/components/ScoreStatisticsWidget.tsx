import { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';
import type { Business } from '../utils/scoring';
import { calculateBusinessScore, getScorePriorityDark } from '../utils/scoring';

interface ScoreStatisticsWidgetProps {
  businesses: Business[];
}

interface CategoryStats {
  count: number;
  percentage: number;
  label: string;
  emoji: string;
  colorClasses: string;
}

export function ScoreStatisticsWidget({ businesses }: ScoreStatisticsWidgetProps) {
  const stats = useMemo(() => {
    if (businesses.length === 0) {
      return {
        average: 0,
        categories: {
          max: { count: 0, percentage: 0, label: 'Priorité MAX', emoji: '🔥', colorClasses: 'bg-red-900/30 text-red-400' },
          haute: { count: 0, percentage: 0, label: 'Haute Priorité', emoji: '⚡', colorClasses: 'bg-orange-900/30 text-orange-400' },
          standard: { count: 0, percentage: 0, label: 'Standard', emoji: '✅', colorClasses: 'bg-green-900/30 text-green-400' },
          basse: { count: 0, percentage: 0, label: 'Basse Priorité', emoji: '⏸️', colorClasses: 'bg-gray-800/30 text-gray-400' }
        }
      };
    }

    const scores = businesses.map(b => calculateBusinessScore(b));
    const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

    const categories = {
      max: 0,
      haute: 0,
      standard: 0,
      basse: 0
    };

    businesses.forEach(business => {
      const score = calculateBusinessScore(business);
      const priority = getScorePriorityDark(score);
      categories[priority.category]++;
    });

    const total = businesses.length;

    return {
      average,
      categories: {
        max: {
          count: categories.max,
          percentage: Math.round((categories.max / total) * 100),
          label: 'Priorité MAX',
          emoji: '🔥',
          colorClasses: 'bg-red-900/30 text-red-400'
        },
        haute: {
          count: categories.haute,
          percentage: Math.round((categories.haute / total) * 100),
          label: 'Haute Priorité',
          emoji: '⚡',
          colorClasses: 'bg-orange-900/30 text-orange-400'
        },
        standard: {
          count: categories.standard,
          percentage: Math.round((categories.standard / total) * 100),
          label: 'Standard',
          emoji: '✅',
          colorClasses: 'bg-green-900/30 text-green-400'
        },
        basse: {
          count: categories.basse,
          percentage: Math.round((categories.basse / total) * 100),
          label: 'Basse Priorité',
          emoji: '⏸️',
          colorClasses: 'bg-gray-800/30 text-gray-400'
        }
      }
    };
  }, [businesses]);

  return (
    <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-cyan-500" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#f1f5f9]">Score de Prospection</h2>
          <p className="text-sm text-[#94a3b8]">Analyse de la base commerces</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1 flex flex-col items-center justify-center bg-[#1a1a24] rounded-lg p-6 border border-[#1e293b]">
          <div className="text-sm text-[#94a3b8] mb-2">Score Moyen</div>
          <div className="text-5xl font-bold font-mono text-cyan-400">{stats.average}</div>
          <div className="text-xs text-[#64748b] mt-1">/100</div>
        </div>

        <div className="lg:col-span-4 space-y-4">
          {Object.entries(stats.categories).map(([key, cat]) => (
            <CategoryBar key={key} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface CategoryBarProps {
  category: CategoryStats;
}

function CategoryBar({ category }: CategoryBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`
            px-2.5 py-1 rounded-full text-xs font-medium
            ${category.colorClasses}
          `}>
            <span className="mr-1.5">{category.emoji}</span>
            {category.label}
          </span>
          <span className="text-sm text-[#94a3b8]">
            {category.count} commerce{category.count > 1 ? 's' : ''}
          </span>
        </div>
        <span className="text-sm font-medium text-[#f1f5f9] font-mono">
          {category.percentage}%
        </span>
      </div>
      <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
        <div
          className={`h-full ${category.colorClasses.split(' ')[0]} rounded-full transition-all duration-500`}
          style={{ width: `${category.percentage}%` }}
          role="progressbar"
          aria-valuenow={category.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${category.label}: ${category.percentage}%`}
        />
      </div>
    </div>
  );
}
