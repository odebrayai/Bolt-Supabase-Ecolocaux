import { useEffect, useState } from 'react';
import { Building2, TrendingUp, DollarSign, Activity, Calendar, Target, Trophy } from 'lucide-react';
import { Header } from '../components/Header';
import { EvolutionLineChart } from '../components/charts/EvolutionLineChart';
import { TypeDonutChart } from '../components/charts/TypeDonutChart';
import { fetchStatistics } from '../services/statisticsService';
import type { StatisticsData } from '../types/statistics';

export function Statistiques() {
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await fetchStatistics();
      setData(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-12 text-center">
          <p className="text-[#94a3b8]">Erreur lors du chargement des statistiques</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      <Header title="Statistiques avancées" subtitle="Vue d'ensemble des performances" />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-cyan-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-cyan-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{data.kpis.totalCommerces}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Total commerces</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-emerald-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{data.kpis.tauxConversion}%</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Taux de conversion</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-amber-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-amber-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{formatCurrency(data.kpis.caPotentiel)}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">CA potentiel</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-blue-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{data.kpis.commercesActifs}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Commerces actifs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Évolution des statuts (7 derniers jours)</h2>
            <EvolutionLineChart data={data.evolution} />
          </div>

          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Répartition par type de commerce</h2>
            <TypeDonutChart data={data.typeRepartition} />
          </div>
        </div>

        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-[#f1f5f9]">Top Performers</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#94a3b8]">Rang</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[#94a3b8]">Commercial</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Commerces</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Gagnés</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Taux</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">CA potentiel</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-[#94a3b8]">
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : (
                  data.topPerformers.map((performer, index) => (
                    <tr key={performer.id} className="border-b border-[#1e293b] hover:bg-[#1a1a24] transition-colors">
                      <td className="py-3 px-4">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                          ${index === 0 ? 'bg-amber-500/10 text-amber-500' : ''}
                          ${index === 1 ? 'bg-slate-500/10 text-slate-400' : ''}
                          ${index === 2 ? 'bg-orange-500/10 text-orange-500' : ''}
                          ${index > 2 ? 'bg-[#1e293b] text-[#94a3b8]' : ''}
                        `}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#f1f5f9]">
                        {performer.prenom} {performer.nom}
                      </td>
                      <td className="py-3 px-4 text-right text-[#f1f5f9]">{performer.totalCommerces}</td>
                      <td className="py-3 px-4 text-right text-emerald-400">{performer.gagnes}</td>
                      <td className="py-3 px-4 text-right text-[#f1f5f9]">{performer.tauxConversion}%</td>
                      <td className="py-3 px-4 text-right text-amber-400">{formatCurrency(performer.caPotentiel)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Performance par type de commerce</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e293b]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#94a3b8]">Type</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Total</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Taux</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">CA moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {data.performanceParType.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-[#94a3b8]">
                        Aucune donnée disponible
                      </td>
                    </tr>
                  ) : (
                    data.performanceParType.map((perf) => (
                      <tr key={perf.type} className="border-b border-[#1e293b] hover:bg-[#1a1a24] transition-colors">
                        <td className="py-3 px-4 text-[#f1f5f9]">{perf.type}</td>
                        <td className="py-3 px-4 text-right text-[#f1f5f9]">{perf.total}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`
                            ${perf.tauxConversion >= 30 ? 'text-emerald-400' : ''}
                            ${perf.tauxConversion >= 20 && perf.tauxConversion < 30 ? 'text-blue-400' : ''}
                            ${perf.tauxConversion < 20 ? 'text-orange-400' : ''}
                          `}>
                            {perf.tauxConversion}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-amber-400">{formatCurrency(perf.caMoyen)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Performance par ville (Top 10)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e293b]">
                    <th className="text-left py-3 px-4 text-sm font-medium text-[#94a3b8]">Ville</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Total</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Gagnés</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-[#94a3b8]">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {data.performanceParVille.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-[#94a3b8]">
                        Aucune donnée disponible
                      </td>
                    </tr>
                  ) : (
                    data.performanceParVille.map((perf) => (
                      <tr key={perf.ville} className="border-b border-[#1e293b] hover:bg-[#1a1a24] transition-colors">
                        <td className="py-3 px-4 text-[#f1f5f9]">{perf.ville}</td>
                        <td className="py-3 px-4 text-right text-[#f1f5f9]">{perf.total}</td>
                        <td className="py-3 px-4 text-right text-emerald-400">{perf.gagnes}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`
                            ${perf.tauxConversion >= 30 ? 'text-emerald-400' : ''}
                            ${perf.tauxConversion >= 20 && perf.tauxConversion < 30 ? 'text-blue-400' : ''}
                            ${perf.tauxConversion < 20 ? 'text-orange-400' : ''}
                          `}>
                            {perf.tauxConversion}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-blue-500" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold text-[#f1f5f9]">Activité du mois</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#94a3b8]">RDV planifiés</span>
                  <span className="text-xl font-semibold text-blue-400">{data.activiteMensuelle.rdvPlanifies}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#94a3b8]">RDV effectués</span>
                  <span className="text-xl font-semibold text-emerald-400">{data.activiteMensuelle.rdvEffectues}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#94a3b8]">Nouveaux commerces</span>
                  <span className="text-xl font-semibold text-cyan-400">{data.activiteMensuelle.nouveauxCommerces}</span>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-[#94a3b8]">Commerces gagnés</span>
                  <span className="text-xl font-semibold text-emerald-400">{data.activiteMensuelle.commercesGagnes}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              <h2 className="text-lg font-semibold text-[#f1f5f9]">Objectifs du mois</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#94a3b8]">Nouveaux commerces</span>
                  <span className="text-sm font-semibold text-[#f1f5f9]">
                    {data.objectifsMois.realisationCommerces} / {data.objectifsMois.objectifCommerces}
                  </span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((data.objectifsMois.realisationCommerces / data.objectifsMois.objectifCommerces) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#94a3b8]">Taux de conversion</span>
                  <span className="text-sm font-semibold text-[#f1f5f9]">
                    {data.objectifsMois.realisationConversion}% / {data.objectifsMois.objectifConversion}%
                  </span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((data.objectifsMois.realisationConversion / data.objectifsMois.objectifConversion) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[#94a3b8]">CA potentiel</span>
                  <span className="text-sm font-semibold text-[#f1f5f9]">
                    {formatCurrency(data.objectifsMois.realisationCA)} / {formatCurrency(data.objectifsMois.objectifCA)}
                  </span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min((data.objectifsMois.realisationCA / data.objectifsMois.objectifCA) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
