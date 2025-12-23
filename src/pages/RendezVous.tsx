import { useEffect, useState } from 'react';
import { Calendar, Clock, User, MapPin, Filter } from 'lucide-react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface RendezVous {
  id: string;
  date: string;
  heure: string;
  statut: string;
  notes: string;
  commercial_id: string;
  commerce: {
    nom: string;
    adresse: string;
  };
  commercial: {
    prenom: string;
    nom: string;
  };
}

type Profile = {
  id: string;
  prenom: string;
  nom: string;
  role: string;
};

export default function RendezVous() {
  const { user, profile } = useAuth();
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterCommercial, setFilterCommercial] = useState<string>('all');
  const [commerciaux, setCommerciaux] = useState<Profile[]>([]);

  useEffect(() => {
    loadRendezVous();
    loadCommerciaux();

    const rdvChannel = supabase
      .channel('rendez_vous_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rendez_vous' }, () => {
        loadRendezVous();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadCommerciaux();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(rdvChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [user, profile]);

  async function loadRendezVous() {
    try {
      setLoading(true);
      let query = supabase
        .from('rendez_vous')
        .select(`
          id,
          date,
          heure,
          statut,
          notes,
          commercial_id,
          commerce:commerces(nom, adresse),
          commercial:profiles(prenom, nom)
        `)
        .order('date', { ascending: true })
        .order('heure', { ascending: true });

      if (profile?.role === 'commercial') {
        query = query.eq('commercial_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRendezVous(data || []);
    } catch (error) {
      console.error('Erreur chargement RDVs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCommerciaux() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, prenom, nom, role')
        .eq('actif', true)
        .in('role', ['admin', 'commercial'])
        .order('prenom');

      if (error) throw error;
      setCommerciaux(data || []);
    } catch (error) {
      console.error('Erreur chargement commerciaux:', error);
    }
  }

  const filteredRendezVous = rendezVous.filter(rdv => {
    const matchStatut = filterStatut === 'all' || rdv.statut === filterStatut;
    const matchCommercial = filterCommercial === 'all' || rdv.commercial_id === filterCommercial;
    return matchStatut && matchCommercial;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'planifié': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'confirmé': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'reporté': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'annulé': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'effectué': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const formatHeure = (heureStr: string) => {
    return heureStr.substring(0, 5);
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

  return (
    <div>
      <Header
        title="Rendez-vous"
        subtitle={`${filteredRendezVous.length} rendez-vous`}
        actions={
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-[#94a3b8]" strokeWidth={1.5} />
            <select
              value={filterCommercial}
              onChange={(e) => setFilterCommercial(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="all">Toute l'équipe</option>
              {commerciaux.map((commercial) => (
                <option key={commercial.id} value={commercial.id}>
                  {commercial.prenom} {commercial.nom}
                </option>
              ))}
            </select>
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="all">Tous les statuts</option>
              <option value="planifié">Planifié</option>
              <option value="confirmé">Confirmé</option>
              <option value="reporté">Reporté</option>
              <option value="effectué">Effectué</option>
              <option value="annulé">Annulé</option>
            </select>
          </div>
        }
      />

      <div className="p-8 space-y-6">

        {filteredRendezVous.length === 0 ? (
          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-12">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-[#94a3b8]" strokeWidth={1.5} />
              <h3 className="mt-4 text-lg font-semibold text-[#f1f5f9]">Aucun rendez-vous</h3>
              <p className="mt-2 text-sm text-[#94a3b8]">
                {filterStatut === 'all'
                  ? 'Aucun rendez-vous prévu pour le moment.'
                  : `Aucun rendez-vous avec le statut "${filterStatut}".`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRendezVous.map((rdv) => (
              <div
                key={rdv.id}
                className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6 hover:border-cyan-500/30 transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center text-[#f1f5f9]">
                        <Calendar className="w-5 h-5 mr-2 text-cyan-400" strokeWidth={1.5} />
                        <span className="font-medium">{formatDate(rdv.date)}</span>
                      </div>
                      <div className="flex items-center text-[#f1f5f9]">
                        <Clock className="w-5 h-5 mr-2 text-cyan-400" strokeWidth={1.5} />
                        <span>{formatHeure(rdv.heure)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatutColor(rdv.statut)}`}>
                        {rdv.statut}
                      </span>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 mr-2 text-[#94a3b8] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <div className="font-medium text-[#f1f5f9]">{rdv.commerce?.nom || 'Commerce inconnu'}</div>
                        <div className="text-sm text-[#94a3b8]">{rdv.commerce?.adresse || ''}</div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#94a3b8]" strokeWidth={1.5} />
                      <span className="text-[#f1f5f9]">
                        {rdv.commercial?.prenom} {rdv.commercial?.nom}
                      </span>
                    </div>

                    {rdv.notes && (
                      <div className="mt-3 pt-3 border-t border-[#1e293b]">
                        <p className="text-sm text-[#94a3b8]">{rdv.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
