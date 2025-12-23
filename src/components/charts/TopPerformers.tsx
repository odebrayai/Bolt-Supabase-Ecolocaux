import { Trophy, TrendingUp } from 'lucide-react';
import type { PerformanceCommercial } from '../../types/statistics';

interface TopPerformersProps {
  performers: PerformanceCommercial[];
}

export function TopPerformers({ performers }: TopPerformersProps) {
  const topThree = performers.slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h3 className="text-[#f1f5f9] text-lg font-semibold">Top Performers</h3>
      </div>

      <div className="space-y-4">
        {topThree.map((performer, index) => (
          <div 
            key={performer.id}
            className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg border border-[#1e293b] hover:border-cyan-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                ${index === 0 ? 'bg-yellow-500/20 text-yellow-500' : ''}
                ${index === 1 ? 'bg-gray-400/20 text-gray-400' : ''}
                ${index === 2 ? 'bg-orange-600/20 text-orange-600' : ''}
                ${index > 2 ? 'bg-cyan-500/20 text-cyan-500' : ''}
              `}>
                {index + 1}
              </div>
              
              <div>
                <p className="text-[#f1f5f9] font-medium">{performer.nom}</p>
                <p className="text-[#64748b] text-sm">{performer.nb_commerces} commerces</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-[#f1f5f9] font-semibold">
                  {performer.taux_conversion}%
                </span>
              </div>
              <p className="text-[#64748b] text-sm">
                {formatCurrency(performer.ca_genere)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {performers.length === 0 && (
        <div className="text-center py-8">
          <p className="text-[#64748b]">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}