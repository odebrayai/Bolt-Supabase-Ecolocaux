import { useEffect, useState } from 'react';
import { Building2, Calendar, TrendingUp, AlertCircle, MapPin, Phone, Star } from 'lucide-react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';
import { ScoreStatisticsWidget } from '../components/ScoreStatisticsWidget';

type Commerce = Database['public']['Tables']['commerces']['Row'];
type RendezVous = Database['public']['Tables']['rendez_vous']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CommerceWithProfile extends Commerce {
  profiles?: Profile;
}

interface RendezVousWithData extends RendezVous {
  commerces?: Commerce;
  profiles?: Profile;
}

export function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalCommerces: 0,
    rdvThisWeek: 0,
    tauxConversion: 0,
    aRelancer: 0,
  });
  const [recentCommerces, setRecentCommerces] = useState<CommerceWithProfile[]>([]);
  const [allCommerces, setAllCommerces] = useState<Commerce[]>([]);
  const [upcomingRdv, setUpcomingRdv] = useState<RendezVousWithData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();

    const commercesChannel = supabase
      .channel('dashboard_commerces_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commerces' }, () => {
        loadDashboardData();
      })
      .subscribe();

    const rdvChannel = supabase
      .channel('dashboard_rdv_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rendez_vous' }, () => {
        loadDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commercesChannel);
      supabase.removeChannel(rdvChannel);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: commerces } = await supabase
        .from('commerces')
        .select('*');

      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const { data: rdv } = await supabase
        .from('rendez_vous')
        .select('*')
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .lte('date', endOfWeek.toISOString().split('T')[0]);

      const totalCommerces = commerces?.length || 0;
      const rdvThisWeek = rdv?.length || 0;
      const gagnes = commerces?.filter(c => c.statut === 'devis_signe').length || 0;
      const tauxConversion = totalCommerces > 0 ? Math.round((gagnes / totalCommerces) * 100) : 0;
      const aRelancer = commerces?.filter(c => c.statut === 'relance').length || 0;

      setStats({
        totalCommerces,
        rdvThisWeek,
        tauxConversion,
        aRelancer,
      });

      setAllCommerces(commerces || []);

      const { data: recent } = await supabase
        .from('commerces')
        .select('*, profiles(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentCommerces(recent || []);

      const { data: upcoming } = await supabase
        .from('rendez_vous')
        .select('*, commerces(*), profiles(*)')
        .gte('date', today.toISOString().split('T')[0])
        .order('date', { ascending: true })
        .order('heure', { ascending: true })
        .limit(5);

      setUpcomingRdv(upcoming || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      boulangerie: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      restaurant: 'bg-red-500/10 text-red-400 border-red-500/20',
      pizzeria: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      poissonnerie: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      pressing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      boucherie: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    };
    return colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      devis_signe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      rdv_pris: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      relance: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      a_contacter: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      perdu: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return colors[statut] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      a_contacter: 'À contacter',
      rdv_pris: 'RDV pris',
      relance: 'Relance',
      devis_signe: 'Devis Signé',
      perdu: 'Perdu',
    };
    return labels[statut] || statut;
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-800 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title={`Bonjour ${profile?.prenom}`} subtitle="Voici votre tableau de bord" />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-cyan-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-cyan-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{stats.totalCommerces}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Total commerces</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-blue-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{stats.rdvThisWeek}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">RDV cette semaine</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-emerald-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{stats.tauxConversion}%</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Taux de conversion</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-orange-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{stats.aRelancer}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">À relancer</p>
          </div>
        </div>

        <ScoreStatisticsWidget businesses={allCommerces} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Derniers commerces ajoutés</h2>
            <div className="space-y-3">
              {recentCommerces.length === 0 ? (
                <p className="text-sm text-[#94a3b8] py-8 text-center">Aucun commerce pour le moment</p>
              ) : (
                recentCommerces.map((commerce) => (
                  <div
                    key={commerce.id}
                    className="p-4 bg-[#1a1a24] rounded-lg border border-[#1e293b] hover:border-cyan-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-[#f1f5f9]">{commerce.nom}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-3 h-3 text-[#94a3b8]" strokeWidth={1.5} />
                          <span className="text-xs text-[#94a3b8]">{commerce.ville}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(commerce.type)}`}>
                        {commerce.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatutColor(commerce.statut)}`}>
                        {getStatutLabel(commerce.statut)}
                      </span>
                      {commerce.note_google && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" strokeWidth={1.5} />
                          <span className="text-xs text-[#f1f5f9]">{commerce.note_google}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
            <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Prochains rendez-vous</h2>
            <div className="space-y-3">
              {upcomingRdv.length === 0 ? (
                <p className="text-sm text-[#94a3b8] py-8 text-center">Aucun rendez-vous planifié</p>
              ) : (
                upcomingRdv.map((rdv) => (
                  <div
                    key={rdv.id}
                    className="p-4 bg-[#1a1a24] rounded-lg border border-[#1e293b] hover:border-blue-500/30 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-[#f1f5f9]">{rdv.commerces?.nom}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-[#94a3b8]" strokeWidth={1.5} />
                          <span className="text-xs text-[#94a3b8]">
                            {new Date(rdv.date).toLocaleDateString('fr-FR')} à {rdv.heure}
                          </span>
                        </div>
                      </div>
                    </div>
                    {rdv.profiles && (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                          {rdv.profiles.prenom?.[0]}{rdv.profiles.nom?.[0]}
                        </div>
                        <span className="text-xs text-[#94a3b8]">
                          {rdv.profiles.prenom} {rdv.profiles.nom}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
