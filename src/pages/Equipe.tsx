import { useEffect, useState } from 'react';
import { Users, UserPlus, TrendingUp, Building2, X } from 'lucide-react';
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
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    prenom: '',
    nom: '',
    role: 'commercial' as 'admin' | 'commercial' | 'viewer'
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError('Vous devez être connecté pour inviter un membre');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-team-member`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erreur lors de la création du membre');
      }

      setSuccess('Membre invité avec succès!');
      setFormData({
        email: '',
        password: '',
        prenom: '',
        nom: '',
        role: 'commercial'
      });

      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 2000);

      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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
          <button
            onClick={() => setShowModal(true)}
            className="px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 text-sm font-semibold flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Inviter un membre</span>
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#12121a] border border-[#1e293b] rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-[#1e293b]">
              <h3 className="text-lg font-semibold text-[#f1f5f9]">Inviter un membre</h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                  setSuccess('');
                }}
                className="text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-lg text-sm">
                  {success}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    className="w-full bg-[#1a1a24] border border-[#1e293b] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Jean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full bg-[#1a1a24] border border-[#1e293b] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#1a1a24] border border-[#1e293b] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#1a1a24] border border-[#1e293b] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#94a3b8] mb-2">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'commercial' | 'viewer' })}
                  className="w-full bg-[#1a1a24] border border-[#1e293b] rounded-lg px-4 py-2 text-[#f1f5f9] focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="commercial">Commercial</option>
                  <option value="admin">Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 px-4 py-2 bg-[#1a1a24] border border-[#1e293b] text-[#94a3b8] rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Invitation...' : 'Inviter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
