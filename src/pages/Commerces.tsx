import { useEffect, useState } from 'react';
import { Search, Plus, Download, Star, Phone, MoreVertical, X } from 'lucide-react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Commerce = Database['public']['Tables']['commerces']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CommerceWithProfile extends Commerce {
  profiles?: Profile;
}

export function Commerces({ onNavigate, onSelectCommerce }: { onNavigate: (page: string) => void; onSelectCommerce: (id: string) => void }) {
  const [commerces, setCommerces] = useState<CommerceWithProfile[]>([]);
  const [filteredCommerces, setFilteredCommerces] = useState<CommerceWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterCommercial, setFilterCommercial] = useState('');
  const [commerciaux, setCommerciaux] = useState<Profile[]>([]);

  useEffect(() => {
    loadData();

    const commercesChannel = supabase
      .channel('commerces_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commerces' }, () => {
        loadData();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('commerces_profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commercesChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [commerces, searchTerm, filterType, filterStatut, filterCommercial]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id, user?.email);

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .maybeSingle();

      console.log('Current profile:', currentProfile);

      const { data: commercesData, error: commercesError } = await supabase
        .from('commerces')
        .select(`
          *,
          profiles:commercial_id (
            id,
            email,
            prenom,
            nom,
            role,
            avatar_url,
            telephone
          )
        `)
        .order('created_at', { ascending: false });

      console.log('Commerces loaded:', commercesData?.length, 'Error:', commercesError);

      if (commercesError) {
        console.error('Error loading commerces:', commercesError);
      }

      const { data: commerciauxData, error: commerciauxError } = await supabase
        .from('profiles')
        .select('*')
        .eq('actif', true)
        .in('role', ['admin', 'commercial'])
        .order('prenom');

      if (commerciauxError) {
        console.error('Error loading commerciaux:', commerciauxError);
      }

      setCommerces(commercesData || []);
      setCommerciaux(commerciauxData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...commerces];

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.ville_recherche && c.ville_recherche.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.adresse && c.adresse.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType) {
      filtered = filtered.filter(c => c.type_commerce === filterType);
    }

    if (filterStatut) {
      filtered = filtered.filter(c => c.statut === filterStatut);
    }

    if (filterCommercial) {
      filtered = filtered.filter(c => c.commercial_id === filterCommercial);
    }

    setFilteredCommerces(filtered);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatut('');
    setFilterCommercial('');
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
      gagne: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
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
      gagne: 'Gagné',
      perdu: 'Perdu',
    };
    return labels[statut] || statut;
  };

  const renderStars = (note: number | null) => {
    if (!note) return null;

    const fullStars = Math.floor(note);
    const decimal = note - fullStars;
    const hasHalfStar = decimal >= 0.4 && decimal < 0.7;
    const totalFullStars = decimal >= 0.7 ? fullStars + 1 : fullStars;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < totalFullStars) {
            return (
              <Star
                key={i}
                className="w-3 h-3 text-yellow-500 fill-yellow-500"
                strokeWidth={1.5}
              />
            );
          } else if (i === totalFullStars && hasHalfStar) {
            return (
              <div key={i} className="relative w-3 h-3">
                <Star className="w-3 h-3 text-slate-600 absolute" strokeWidth={1.5} />
                <div className="overflow-hidden absolute w-1.5 h-3">
                  <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" strokeWidth={1.5} />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={i}
                className="w-3 h-3 text-slate-600"
                strokeWidth={1.5}
              />
            );
          }
        })}
        <span className="text-xs text-[#94a3b8] ml-1">{note}/5</span>
      </div>
    );
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
        title="Commerces"
        subtitle={`${filteredCommerces.length} commerce(s)`}
        actions={
          <>
            <button className="px-4 py-2 bg-transparent border border-slate-700 text-[#f1f5f9] rounded-lg hover:bg-slate-800 transition-all duration-200 text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" strokeWidth={1.5} />
              Exporter CSV
            </button>
            <button
              onClick={() => onNavigate('recherche')}
              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Nouvelle recherche
            </button>
          </>
        }
      />

      <div className="p-8 space-y-6">
        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" strokeWidth={1.5} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="">Tous les types</option>
              <option value="boulangerie">Boulangerie</option>
              <option value="restaurant">Restaurant</option>
              <option value="pizzeria">Pizzeria</option>
              <option value="poissonnerie">Poissonnerie</option>
              <option value="pressing">Pressing</option>
              <option value="boucherie">Boucherie</option>
            </select>

            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="">Tous les statuts</option>
              <option value="a_contacter">À contacter</option>
              <option value="rdv_pris">RDV pris</option>
              <option value="relance">Relance</option>
              <option value="gagne">Gagné</option>
              <option value="perdu">Perdu</option>
            </select>

            <select
              value={filterCommercial}
              onChange={(e) => setFilterCommercial(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
            >
              <option value="">Tous les commerciaux</option>
              {commerciaux.map((commercial) => (
                <option key={commercial.id} value={commercial.id}>
                  {commercial.prenom} {commercial.nom}
                </option>
              ))}
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-slate-800 border border-slate-700 text-[#f1f5f9] rounded-lg hover:bg-slate-700 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
              Réinitialiser
            </button>
          </div>
        </div>

        <div className="bg-[#12121a] rounded-lg border border-[#1e293b] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a24] border-b border-[#1e293b]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Ville
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Note
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Commercial
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#94a3b8] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filteredCommerces.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-[#94a3b8]">
                      Aucun commerce trouvé
                    </td>
                  </tr>
                ) : (
                  filteredCommerces.map((commerce) => (
                    <tr
                      key={commerce.id}
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => onSelectCommerce(commerce.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#f1f5f9]">{commerce.nom}</div>
                      </td>
                      <td className="px-6 py-4">
                        {commerce.type_commerce ? (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getTypeColor(commerce.type_commerce)}`}>
                            {commerce.type_commerce}
                          </span>
                        ) : (
                          <span className="text-xs text-[#94a3b8]">Non défini</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-[#94a3b8]">{commerce.ville_recherche || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {commerce.telephone && (
                          <a
                            href={`tel:${commerce.telephone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2 text-sm text-cyan-500 hover:text-cyan-400 transition-colors"
                          >
                            <Phone className="w-3 h-3" strokeWidth={1.5} />
                            {commerce.telephone}
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {renderStars(commerce.note)}
                      </td>
                      <td className="px-6 py-4">
                        {commerce.profiles ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                              {commerce.profiles.prenom?.[0]}{commerce.profiles.nom?.[0]}
                            </div>
                            <span className="text-sm text-[#f1f5f9]">
                              {commerce.profiles.prenom} {commerce.profiles.nom}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-[#94a3b8]">Non assigné</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {commerce.statut ? (
                          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getStatutColor(commerce.statut)}`}>
                            {getStatutLabel(commerce.statut)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-md text-xs font-medium border bg-slate-500/10 text-slate-400 border-slate-500/20">
                            À contacter
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-[#94a3b8]" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
