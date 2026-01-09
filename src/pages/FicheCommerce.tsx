import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Save, MapPin, Phone, Mail, Globe, Star, Calendar, Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../lib/database.types';

type Commerce = Database['public']['Tables']['commerces']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface RendezVous {
  id: string;
  date: string;
  heure: string;
  statut: string;
  notes: string;
  commercial: {
    prenom: string;
    nom: string;
  };
}

interface Props {
  commerceId: string;
  onBack: () => void;
}

export function FicheCommerce({ commerceId, onBack }: Props) {
  const { user } = useAuth();
  const [commerce, setCommerce] = useState<Commerce | null>(null);
  const [commerciaux, setCommerciaux] = useState<Profile[]>([]);
  const [rendezVous, setRendezVous] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showRdvForm, setShowRdvForm] = useState(false);
  const [newRdv, setNewRdv] = useState({
    date: '',
    heure: '',
    commercial_id: '',
    statut: 'planifié',
    notes: ''
  });
  const rdvSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();

    const commerceChannel = supabase
      .channel(`commerce_${commerceId}_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'commerces', filter: `id=eq.${commerceId}` }, () => {
        loadData();
      })
      .subscribe();

    const rdvChannel = supabase
      .channel(`commerce_${commerceId}_rdv_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rendez_vous', filter: `commerce_id=eq.${commerceId}` }, () => {
        loadData();
      })
      .subscribe();

    const profilesChannel = supabase
      .channel(`commerce_${commerceId}_profiles_changes`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(commerceChannel);
      supabase.removeChannel(rdvChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [commerceId]);

  const loadData = async () => {
    try {
      const { data: commerceData } = await supabase
        .from('commerces')
        .select('*')
        .eq('id', commerceId)
        .maybeSingle();

      const { data: commerciauxData } = await supabase
        .from('profiles')
        .select('*')
        .eq('actif', true)
        .in('role', ['admin', 'commercial'])
        .order('prenom');

      const { data: rdvData } = await supabase
        .from('rendez_vous')
        .select(`
          id,
          date,
          heure,
          statut,
          notes,
          commercial:profiles(prenom, nom)
        `)
        .eq('commerce_id', commerceId)
        .order('date', { ascending: true })
        .order('heure', { ascending: true });

      setCommerce(commerceData);
      setCommerciaux(commerciauxData || []);
      setRendezVous(rdvData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!commerce) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('commerces')
        .update(commerce)
        .eq('id', commerceId);

      if (error) throw error;

      setMessage('Modifications enregistrées avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof Commerce, value: any) => {
    if (commerce) {
      setCommerce({ ...commerce, [field]: value });

      if (field === 'statut' && value === 'rdv_pris' && !showRdvForm) {
        setShowRdvForm(true);
        setTimeout(() => {
          rdvSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  };

  const handleCreateRdv = async () => {
    if (!newRdv.date || !newRdv.heure || !newRdv.commercial_id) {
      setMessage('Erreur : Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const { error } = await supabase
        .from('rendez_vous')
        .insert({
          commerce_id: commerceId,
          commercial_id: newRdv.commercial_id,
          date: newRdv.date,
          heure: newRdv.heure,
          statut: newRdv.statut,
          notes: newRdv.notes || null
        });

      if (error) throw error;

      setMessage('Rendez-vous créé avec succès !');
      setShowRdvForm(false);
      setNewRdv({
        date: '',
        heure: '',
        commercial_id: '',
        statut: 'planifié',
        notes: ''
      });
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    }
  };

  if (loading || !commerce) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
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
        title={commerce.nom}
        subtitle={`${commerce.type_commerce || 'Commerce'} - ${commerce.ville_recherche || 'Non renseigné'}`}
        actions={
          <button
            onClick={onBack}
            className="px-4 py-2 bg-transparent border border-slate-700 text-[#f1f5f9] rounded-lg hover:bg-slate-800 transition-all duration-200 text-sm font-medium flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            Retour
          </button>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8">
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.includes('Erreur')
              ? 'bg-red-500/10 border-red-500/20 text-red-400'
              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
              <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Informations générales</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Nom</label>
                  <input
                    type="text"
                    value={commerce.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Type</label>
                    <input
                      type="text"
                      value={commerce.type_commerce || ''}
                      onChange={(e) => updateField('type_commerce', e.target.value)}
                      placeholder="Ex: boulangerie, restaurant..."
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={commerce.telephone || ''}
                      onChange={(e) => updateField('telephone', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Adresse</label>
                  <input
                    type="text"
                    value={commerce.adresse || ''}
                    onChange={(e) => updateField('adresse', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Ville de recherche</label>
                    <input
                      type="text"
                      value={commerce.ville_recherche || ''}
                      onChange={(e) => updateField('ville_recherche', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Catégorie</label>
                    <input
                      type="text"
                      value={commerce.categorie || ''}
                      onChange={(e) => updateField('categorie', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Email</label>
                    <input
                      type="email"
                      value={commerce.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Site web</label>
                    <input
                      type="url"
                      value={commerce.site_web || ''}
                      onChange={(e) => updateField('site_web', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Facebook</label>
                    <input
                      type="url"
                      value={commerce.facebook || ''}
                      onChange={(e) => updateField('facebook', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Instagram</label>
                    <input
                      type="url"
                      value={commerce.instagram || ''}
                      onChange={(e) => updateField('instagram', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">LinkedIn</label>
                    <input
                      type="url"
                      value={commerce.linkedin || ''}
                      onChange={(e) => updateField('linkedin', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Nom du contact</label>
                    <input
                      type="text"
                      value={commerce.contact_nom || ''}
                      onChange={(e) => updateField('contact_nom', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Poste du contact</label>
                    <input
                      type="text"
                      value={commerce.contact_poste || ''}
                      onChange={(e) => updateField('contact_poste', e.target.value)}
                      className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
              <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Notes internes</h2>
              <textarea
                value={commerce.notes_internes || ''}
                onChange={(e) => updateField('notes_internes', e.target.value)}
                rows={6}
                placeholder="Ajoutez vos notes internes ici..."
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
              <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Statut & Suivi</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Statut</label>
                  <select
                    value={commerce.statut || 'a_contacter'}
                    onChange={(e) => updateField('statut', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  >
                    <option value="a_contacter">À contacter</option>
                    <option value="rdv_pris">RDV pris</option>
                    <option value="relance">Relance</option>
                    <option value="gagne">Gagné</option>
                    <option value="perdu">Perdu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Priorité</label>
                  <select
                    value={commerce.priorite || 'normale'}
                    onChange={(e) => updateField('priorite', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  >
                    <option value="basse">Basse</option>
                    <option value="normale">Normale</option>
                    <option value="haute">Haute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Commercial assigné</label>
                  <select
                    value={commerce.commercial_id || ''}
                    onChange={(e) => updateField('commercial_id', e.target.value || null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  >
                    <option value="">Non assigné</option>
                    {commerciaux.map((commercial) => (
                      <option key={commercial.id} value={commercial.id}>
                        {commercial.prenom} {commercial.nom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
              <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Métriques Google</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Note Google</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={commerce.note || ''}
                    onChange={(e) => updateField('note', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Nombre d'avis</label>
                  <input
                    type="number"
                    min="0"
                    value={commerce.nombre_avis || ''}
                    onChange={(e) => updateField('nombre_avis', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Panier moyen</label>
                  <input
                    type="text"
                    value={commerce.panier_moyen || ''}
                    onChange={(e) => updateField('panier_moyen', e.target.value)}
                    placeholder="Ex: 15-25€"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Scoring IA</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={commerce.scoring_ia || ''}
                    onChange={(e) => updateField('scoring_ia', e.target.value ? Number(e.target.value) : null)}
                    placeholder="Score de 0 à 100"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">URL Google Maps</label>
                  <input
                    type="url"
                    value={commerce.url_google_maps || ''}
                    onChange={(e) => updateField('url_google_maps', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#f1f5f9] mb-2">Place ID</label>
                  <input
                    type="text"
                    value={commerce.place_id || ''}
                    onChange={(e) => updateField('place_id', e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div ref={rdvSectionRef} className="bg-[#12121a] rounded-lg border border-[#1e293b] p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#f1f5f9]">Rendez-vous</h2>
                <button
                  onClick={() => setShowRdvForm(!showRdvForm)}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20 transition-all duration-200 text-sm font-medium flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Nouveau
                </button>
              </div>

              {showRdvForm && (
                <div className="mb-4 p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-1">Date</label>
                    <input
                      type="date"
                      value={newRdv.date}
                      onChange={(e) => setNewRdv({ ...newRdv, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-1">Heure</label>
                    <input
                      type="time"
                      value={newRdv.heure}
                      onChange={(e) => setNewRdv({ ...newRdv, heure: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-1">Commercial</label>
                    <select
                      value={newRdv.commercial_id}
                      onChange={(e) => setNewRdv({ ...newRdv, commercial_id: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    >
                      <option value="">Sélectionner...</option>
                      {commerciaux.map((commercial) => (
                        <option key={commercial.id} value={commercial.id}>
                          {commercial.prenom} {commercial.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-1">Statut</label>
                    <select
                      value={newRdv.statut}
                      onChange={(e) => setNewRdv({ ...newRdv, statut: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                    >
                      <option value="planifié">Planifié</option>
                      <option value="confirmé">Confirmé</option>
                      <option value="reporté">Reporté</option>
                      <option value="effectué">Effectué</option>
                      <option value="annulé">Annulé</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#f1f5f9] mb-1">Notes</label>
                    <textarea
                      value={newRdv.notes}
                      onChange={(e) => setNewRdv({ ...newRdv, notes: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500"
                      placeholder="Notes optionnelles..."
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateRdv}
                      className="flex-1 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all duration-200 text-sm font-medium"
                    >
                      Créer
                    </button>
                    <button
                      onClick={() => setShowRdvForm(false)}
                      className="px-3 py-2 bg-slate-700 text-[#f1f5f9] rounded-lg hover:bg-slate-600 transition-all duration-200 text-sm font-medium"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {rendezVous.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">Aucun rendez-vous planifié</p>
                ) : (
                  rendezVous.map((rdv) => (
                    <div key={rdv.id} className="p-3 bg-slate-900/50 border border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-[#f1f5f9] mb-1">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span className="font-medium">
                          {new Date(rdv.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-gray-400">{rdv.heure.substring(0, 5)}</span>
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        {rdv.commercial?.prenom} {rdv.commercial?.nom}
                      </div>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        rdv.statut === 'planifié' ? 'bg-blue-500/20 text-blue-400' :
                        rdv.statut === 'confirmé' ? 'bg-green-500/20 text-green-400' :
                        rdv.statut === 'reporté' ? 'bg-yellow-500/20 text-yellow-400' :
                        rdv.statut === 'annulé' ? 'bg-red-500/20 text-red-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {rdv.statut}
                      </span>
                      {rdv.notes && (
                        <p className="mt-2 text-xs text-gray-400">{rdv.notes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 mt-6 bg-[#0a0a0f]/80 backdrop-blur-xl border-t border-[#1e293b] p-6 flex justify-end gap-3">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-transparent border border-slate-700 text-[#f1f5f9] rounded-lg hover:bg-slate-800 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-200 font-semibold flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" strokeWidth={1.5} />
            {saving ? 'Enregistrement...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
}
