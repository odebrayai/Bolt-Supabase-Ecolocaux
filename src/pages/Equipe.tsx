import { useEffect, useState } from 'react';
import { Users, UserPlus, TrendingUp, Building2 } from 'lucide-react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MemberWithStats extends Profile {
  commerces_count: number;
  rdv_count: number;
}

export function Equipe() {
  const [membres, setMembres] = useState<MemberWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();

    const profilesChannel = supabase
      .channel('team_profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadData();
      })
      .subscribe();

    const commercesChannel = supabase
      .channel('team_commerces_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commerces' }, () => {
        loadData();
      })
      .subscribe();

    const rdvChannel = supabase
      .channel('team_rdv_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rendez_vous' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(commercesChannel);
      supabase.removeChannel(rdvChannel);
    };
  }, []);

  const loadData = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('prenom');

      const membersWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count: commercesCount } = await supabase
            .from('commerces')
            .select('*', { count: 'exact', head: true })
            .eq('commercial_id', profile.id);

          const today = new Date();
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

          const { count: rdvCount } = await supabase
            .from('rendez_vous')
            .select('*', { count: 'exact', head: true })
            .eq('commercial_id', profile.id)
            .gte('date', startOfMonth.toISOString().split('T')[0]);

          return {
            ...profile,
            commerces_count: commercesCount || 0,
            rdv_count: rdvCount || 0,
          };
        })
      );

      setMembres(membersWithStats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      commercial: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      viewer: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return colors[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Admin',
      commercial: 'Commercial',
      viewer: 'Viewer',
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-800 rounded w-64" />
          <div className="h-96 bg-slate-800 rounded-lg" />
        </div>
      </div>
    );
  }

  const totalActifs = membres.filter(m => m.actif).length;
  const totalCommerces = membres.reduce((sum, m) => sum + m.commerces_count, 0);
  const totalRdv = membres.reduce((sum, m) => sum + m.rdv_count, 0);

  return (
    <div>
      <Header
        title="Équipe"
        subtitle={`${totalActifs} membre(s) actif(s)`}
        actions={
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 text-sm font-semibold flex items-center gap-2">
            <UserPlus className="w-4 h-4" strokeWidth={1.5} />
            Inviter un membre
          </button>
        }
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-cyan-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-cyan-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{totalActifs}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Commerciaux actifs</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-blue-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{totalCommerces}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">Commerces assignés</p>
          </div>

          <div className="bg-[#12121a] rounded-lg p-6 border border-[#1e293b] hover:border-emerald-500/30 transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-emerald-500" strokeWidth={1.5} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#f1f5f9]">{totalRdv}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8]">RDV ce mois</p>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a24] border-b border-[#1e293b]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Membre
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Commerces assignés
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    RDV ce mois
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {membres.map((membre) => (
                  <tr key={membre.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                          {membre.prenom?.[0]}{membre.nom?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-[#f1f5f9]">
                            {membre.prenom} {membre.nom}
                          </div>
                          <div className="text-xs text-[#94a3b8]">{membre.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getRoleBadgeColor(membre.role)}`}>
                        {getRoleLabel(membre.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#f1f5f9]">{membre.commerces_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#f1f5f9]">{membre.rdv_count}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${
                        membre.actif
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {membre.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
