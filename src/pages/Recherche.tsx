import { useState, useEffect } from 'react';
import { MapPin, Rocket, Search } from 'lucide-react';
import { Header } from '../components/Header';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function Recherche() {
  const [ville, setVille] = useState('');
  const [type, setType] = useState('');
  const [nombre, setNombre] = useState(10);
  const [commercialId, setCommercialId] = useState('');
  const [commerciaux, setCommerciaux] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCommerciaux();
  }, []);

  const loadCommerciaux = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('actif', true)
        .in('role', ['admin', 'commercial'])
        .order('prenom');

      setCommerciaux(data || []);
    } catch (error) {
      console.error('Error loading commerciaux:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      setMessage('Recherche en cours via n8n...');

      const n8nResponse = await fetch('https://n8n.srv1194290.hstgr.cloud/webhook/eco-locaux/recherche', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ville: ville,
          type: type,
          max_results: nombre
        })
      });

      if (!n8nResponse.ok) {
        throw new Error(`Erreur n8n: ${n8nResponse.statusText}`);
      }

      const commercesData = await n8nResponse.json();
      console.log('Data from n8n:', commercesData);

      if (!commercesData || commercesData.length === 0) {
        throw new Error('Aucun commerce trouvé pour cette recherche');
      }

      setMessage(`${commercesData.length} commerce(s) trouvé(s), import en cours...`);

      const commercesWithCommercial = commercesData.map((commerce: any) => ({
        ...commerce,
        commercial_id: commercialId || null,
      }));

      console.log('Data to import:', commercesWithCommercial);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être connecté pour importer des commerces');
      }

      const importResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/import-commerces`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(commercesWithCommercial)
      });

      if (!importResponse.ok) {
        const errorText = await importResponse.text();
        let errorMessage = 'Erreur lors de l\'import';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorText;
        } catch {
          errorMessage = errorText;
        }
        console.error('Import error:', errorMessage);
        throw new Error(errorMessage);
      }

      const result = await importResponse.json();

      if (!result.success) {
        console.error('Import failed:', result.error);
        throw new Error(result.error || 'Erreur lors de l\'import');
      }

      setMessage(`✓ ${result.data.length} ${type}(s) à ${ville} ajouté(s) avec succès au CRM !`);
      setVille('');
      setType('');
      setNombre(10);
      setCommercialId('');
    } catch (error: any) {
      setMessage(`Erreur : ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        title="Nouvelle recherche"
        subtitle="Recherchez de nouveaux commerces à prospecter"
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#12121a] rounded-lg border border-[#1e293b] p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Search className="w-6 h-6 text-cyan-500" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[#f1f5f9]">Nouvelle recherche</h2>
                <p className="text-sm text-[#94a3b8]">Trouvez des commerces à ajouter à votre CRM</p>
              </div>
            </div>

            {message && (
              <div className={`mb-6 p-4 rounded-lg border ${
                message.includes('Erreur')
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                  Ville ou Code Postal
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" strokeWidth={1.5} />
                  <input
                    id="ville"
                    type="text"
                    value={ville}
                    onChange={(e) => setVille(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] placeholder-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                    placeholder="Paris, Lyon, 75001..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                  Type d'établissement
                </label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                >
                  <option value="">Sélectionnez un type</option>
                  <option value="boulangerie">Boulangerie</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="pizzeria">Pizzeria</option>
                  <option value="poissonnerie">Poissonnerie</option>
                  <option value="pressing">Pressing</option>
                  <option value="boucherie">Boucherie</option>
                </select>
              </div>

              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                  Nombre de résultats
                </label>
                <input
                  id="nombre"
                  type="number"
                  min="1"
                  max="50"
                  value={nombre}
                  onChange={(e) => setNombre(Number(e.target.value))}
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
                <p className="text-xs text-[#94a3b8] mt-2">Maximum 50 résultats</p>
              </div>

              <div>
                <label htmlFor="commercial" className="block text-sm font-medium text-[#f1f5f9] mb-2">
                  Assigner à (optionnel)
                </label>
                <select
                  id="commercial"
                  value={commercialId}
                  onChange={(e) => setCommercialId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-[#f1f5f9] focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                >
                  <option value="">Aucun commercial</option>
                  {commerciaux.map((commercial) => (
                    <option key={commercial.id} value={commercial.id}>
                      {commercial.prenom} {commercial.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/25 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket className="w-5 h-5" strokeWidth={1.5} />
                {loading ? 'Recherche en cours...' : 'Lancer la recherche'}
              </button>

              <p className="text-xs text-center text-[#94a3b8]">
                Les résultats seront automatiquement ajoutés à votre CRM
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
