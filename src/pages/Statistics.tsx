import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Store,
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { StatisticsService } from '../services/statisticsService';
import { KPICard } from '../components/charts/KPICard';
import { EvolutionChart } from '../components/charts/EvolutionChart';
import { TopPerformers } from '../components/charts/TopPerformers';
import { TypeDistribution } from '../components/charts/TypeDistribution';
import type { StatisticsData, StatisticsFilters } from '../types/statistics';

export function Statistics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticsData | null>(null);
  const [filters, setFilters] = useState<StatisticsFilters>({
    periode: 'month'
  });

  useEffect(() => {
    loadStatistics();
  }, [filters]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const stats = await StatisticsService.getStatistics(filters);
      setData(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#94a3b8]">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-12 text-center">
          <p className="text-[#94a3b8]">Impossible de charger les statistiques</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#f1f5f9] mb-2">Statistiques</h1>
          <p className="text-[#94a3b8]">
            Analyse complète de vos performances commerciales
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filtre période */}
          <select
            value={filters.periode}
            onChange={(e) => setFilters({ ...filters, periode: e.target.value as any })}
            className="bg-[#12121a] border border-[#1e293b] text-[#f1f5f9] px-4 py-2 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="3months">3 derniers mois</option>
            <option value="6months">6 derniers mois</option>
            <option value="year">Cette année</option>
          </select>

          <button className="flex items-center gap-2 bg-[#12121a] border border-[#1e293b] text-[#f1f5f9] px-4 py-2 rounded-lg hover:border-cyan-500 transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>

          <button className="flex items-center gap-2 bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Commerces"
          value={data.kpis.total_commerces}
          evolution={data.kpis.total_commerces_evolution}
          icon={<Store className="w-6 h-6" />}
          color="cyan"
        />
        <KPICard
          title="Taux de Conversion"
          value={`${data.kpis.taux_conversion}%`}
          evolution={data.kpis.taux_conversion_evolution}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <KPICard
          title="CA Potentiel"
          value={formatCurrency(data.kpis.ca_potentiel)}
          evolution={data.kpis.ca_potentiel_evolution}
          icon={<DollarSign className="w-6 h-6" />}
          color="purple"
        />
        <KPICard
          title="Commerces Actifs"
          value={data.kpis.commerces_actifs}
          evolution={data.kpis.commerces_actifs_evolution}
          icon={<Users className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Graphique Évolution + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EvolutionChart data={data.evolution_statuts} />
        </div>
        <div>
          <TopPerformers performers={data.performance_commerciaux} />
        </div>
      </div>

      {/* Répartition par Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TypeDistribution data={data.performance_par_type} />
        
        {/* Tableau Performance par Type */}
        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
          <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
            Performance Détaillée par Type
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e293b]">
                  <th className="text-left text-[#94a3b8] text-sm font-medium pb-3">Type</th>
                  <th className="text-right text-[#94a3b8] text-sm font-medium pb-3">Total</th>
                  <th className="text-right text-[#94a3b8] text-sm font-medium pb-3">Conv.</th>
                  <th className="text-right text-[#94a3b8] text-sm font-medium pb-3">Panier</th>
                  <th className="text-right text-[#94a3b8] text-sm font-medium pb-3">Note</th>
                </tr>
              </thead>
              <tbody>
                {data.performance_par_type.map((type, index) => (
                  <tr 
                    key={index}
                    className="border-b border-[#1e293b] last:border-0 hover:bg-[#0a0a0f] transition-colors"
                  >
                    <td className="py-3 text-[#f1f5f9] text-sm">{type.type_etablissement}</td>
                    <td className="py-3 text-[#f1f5f9] text-sm text-right">{type.total}</td>
                    <td className="py-3 text-right">
                      <span className={`text-sm font-medium ${
                        type.taux_conversion >= 40 ? 'text-emerald-500' :
                        type.taux_conversion >= 25 ? 'text-orange-500' :
                        'text-[#f1f5f9]'
                      }`}>
                        {type.taux_conversion}%
                      </span>
                    </td>
                    <td className="py-3 text-[#f1f5f9] text-sm text-right">
                      {formatCurrency(type.panier_moyen)}
                    </td>
                    <td className="py-3 text-right">
                      <span className="text-sm text-yellow-500 font-medium">
                        {type.note_moyenne > 0 ? `${type.note_moyenne}/5` : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Performance Géographique */}
      <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
        <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
          Performance par Ville
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.performance_par_ville.map((ville, index) => (
            <div 
              key={index}
              className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1e293b] hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <h4 className="text-[#f1f5f9] font-medium">{ville.ville}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ville.potentiel === 'Élevé' ? 'bg-emerald-500/20 text-emerald-500' :
                  ville.potentiel === 'Moyen' ? 'bg-orange-500/20 text-orange-500' :
                  'bg-[#64748b]/20 text-[#64748b]'
                }`}>
                  {ville.potentiel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#64748b] text-xs">Commerces</p>
                  <p className="text-[#f1f5f9] text-lg font-semibold">{ville.nb_commerces}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#64748b] text-xs">Conversion</p>
                  <p className="text-cyan-500 text-lg font-semibold">{ville.taux_conversion}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métriques de Qualité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
          <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
            Métriques Qualité Google
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
              <div>
                <p className="text-[#64748b] text-sm mb-1">Note Moyenne</p>
                <p className="text-[#f1f5f9] text-2xl font-bold">
                  {data.metriques_qualite.note_moyenne}/5
                </p>
              </div>
              <div className="text-yellow-500">
                <BarChart3 className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
              <div>
                <p className="text-[#64748b] text-sm mb-1">Nombre d'Avis Moyen</p>
                <p className="text-[#f1f5f9] text-2xl font-bold">
                  {data.metriques_qualite.nb_avis_moyen}
                </p>
              </div>
              <div className="text-cyan-500">
                <Users className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
              <div>
                <p className="text-[#64748b] text-sm mb-1">Panier Moyen</p>
                <p className="text-[#f1f5f9] text-2xl font-bold">
                  {formatCurrency(data.metriques_qualite.panier_moyen)}
                </p>
              </div>
              <div className="text-purple-500">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
          <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
            Distribution des Priorités
          </h3>
          <div className="space-y-4">
            {/* Haute */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#f1f5f9] text-sm font-medium">Priorité Haute</span>
                <span className="text-red-500 font-bold">
                  {data.metriques_qualite.distribution_priorites.haute}
                </span>
              </div>
              <div className="w-full bg-[#0a0a0f] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(data.metriques_qualite.distribution_priorites.haute / 
                      (data.metriques_qualite.distribution_priorites.haute + 
                       data.metriques_qualite.distribution_priorites.normale + 
                       data.metriques_qualite.distribution_priorites.basse)) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Normale */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#f1f5f9] text-sm font-medium">Priorité Normale</span>
                <span className="text-orange-500 font-bold">
                  {data.metriques_qualite.distribution_priorites.normale}
                </span>
              </div>
              <div className="w-full bg-[#0a0a0f] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(data.metriques_qualite.distribution_priorites.normale / 
                      (data.metriques_qualite.distribution_priorites.haute + 
                       data.metriques_qualite.distribution_priorites.normale + 
                       data.metriques_qualite.distribution_priorites.basse)) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Basse */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#f1f5f9] text-sm font-medium">Priorité Basse</span>
                <span className="text-emerald-500 font-bold">
                  {data.metriques_qualite.distribution_priorites.basse}
                </span>
              </div>
              <div className="w-full bg-[#0a0a0f] rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(data.metriques_qualite.distribution_priorites.basse / 
                      (data.metriques_qualite.distribution_priorites.haute + 
                       data.metriques_qualite.distribution_priorites.normale + 
                       data.metriques_qualite.distribution_priorites.basse)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activité & Vélocité */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
          <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
            Activité sur 30 jours
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1e293b]">
              <p className="text-[#64748b] text-sm mb-1">Nouveaux commerces</p>
              <p className="text-[#f1f5f9] text-3xl font-bold">
                {data.activite_mensuelle.nouveaux_commerces}
              </p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1e293b]">
              <p className="text-[#64748b] text-sm mb-1">RDV planifiés</p>
              <p className="text-[#f1f5f9] text-3xl font-bold">
                {data.activite_mensuelle.rdv_planifies}
              </p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1e293b]">
              <p className="text-[#64748b] text-sm mb-1">RDV réalisés</p>
              <p className="text-[#f1f5f9] text-3xl font-bold">
                {data.activite_mensuelle.rdv_realises}
              </p>
            </div>
            <div className="p-4 bg-[#0a0a0f] rounded-lg border border-[#1e293b]">
              <p className="text-[#64748b] text-sm mb-1">Conversions</p>
              <p className="text-emerald-500 text-3xl font-bold">
                {data.activite_mensuelle.conversions}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
          <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
            Vélocité de Conversion
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
              <div>
                <p className="text-[#64748b] text-sm mb-1">À contacter → RDV pris</p>
                <p className="text-[#f1f5f9] text-2xl font-bold">
                  {data.velocite.a_contacter_vers_rdv} jours
                </p>
              </div>
              <div className="text-cyan-500">
                <Calendar className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#0a0a0f] rounded-lg">
              <div>
                <p className="text-[#64748b] text-sm mb-1">RDV pris → Gagné</p>
                <p className="text-[#f1f5f9] text-2xl font-bold">
                  {data.velocite.rdv_vers_gagne} jours
                </p>
              </div>
              <div className="text-emerald-500">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-lg border border-cyan-500/20">
              <div>
                <p className="text-[#94a3b8] text-sm mb-1 font-medium">Cycle complet</p>
                <p className="text-[#f1f5f9] text-3xl font-bold">
                  {data.velocite.cycle_complet} jours
                </p>
              </div>
              <div className="text-cyan-500">
                <BarChart3 className="w-10 h-10" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Objectifs du Mois */}
      <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
        <h3 className="text-[#f1f5f9] text-lg font-semibold mb-6">
          Objectifs du Mois
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Nouveaux commerces */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8] text-sm">Nouveaux commerces</span>
              <span className="text-[#f1f5f9] font-medium">
                {data.objectifs.nouveaux_commerces.actuel}/{data.objectifs.nouveaux_commerces.objectif}
              </span>
            </div>
            <div className="w-full bg-[#0a0a0f] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.objectifs.nouveaux_commerces.actuel / data.objectifs.nouveaux_commerces.objectif) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-[#64748b]">
              {Math.round((data.objectifs.nouveaux_commerces.actuel / data.objectifs.nouveaux_commerces.objectif) * 100)}% atteint
            </p>
          </div>

          {/* RDV à prendre */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8] text-sm">RDV à prendre</span>
              <span className="text-[#f1f5f9] font-medium">
                {data.objectifs.rdv_a_prendre.actuel}/{data.objectifs.rdv_a_prendre.objectif}
              </span>
            </div>
            <div className="w-full bg-[#0a0a0f] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.objectifs.rdv_a_prendre.actuel / data.objectifs.rdv_a_prendre.objectif) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-[#64748b]">
              {Math.round((data.objectifs.rdv_a_prendre.actuel / data.objectifs.rdv_a_prendre.objectif) * 100)}% atteint
            </p>
          </div>

          {/* Conversions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8] text-sm">Conversions</span>
              <span className="text-[#f1f5f9] font-medium">
                {data.objectifs.conversions.actuel}/{data.objectifs.conversions.objectif}
              </span>
            </div>
            <div className="w-full bg-[#0a0a0f] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.objectifs.conversions.actuel / data.objectifs.conversions.objectif) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-[#64748b]">
              {Math.round((data.objectifs.conversions.actuel / data.objectifs.conversions.objectif) * 100)}% atteint
            </p>
          </div>

          {/* CA Objectif */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#94a3b8] text-sm">CA Objectif</span>
              <span className="text-[#f1f5f9] font-medium">
                {formatCurrency(data.objectifs.ca_objectif.actuel)}/{formatCurrency(data.objectifs.ca_objectif.objectif)}
              </span>
            </div>
            <div className="w-full bg-[#0a0a0f] rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((data.objectifs.ca_objectif.actuel / data.objectifs.ca_objectif.objectif) * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs text-[#64748b]">
              {Math.round((data.objectifs.ca_objectif.actuel / data.objectifs.ca_objectif.objectif) * 100)}% atteint
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
