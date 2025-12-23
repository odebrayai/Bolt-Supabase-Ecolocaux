import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CommerceInput {
  nom: string;
  type?: 'boulangerie' | 'restaurant' | 'pizzeria' | 'poissonnerie' | 'pressing' | 'boucherie';
  type_commerce?: 'boulangerie' | 'restaurant' | 'pizzeria' | 'poissonnerie' | 'pressing' | 'boucherie';
  adresse?: string;
  ville?: string;
  ville_recherche?: string;
  code_postal?: string;
  telephone?: string;
  email?: string;
  site_web?: string;
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  note_google?: number;
  note?: number;
  nb_avis?: number;
  nombre_avis?: number;
  panier_moyen?: number;
  statut?: string;
  priorite?: string;
  notes?: string;
  notes_internes?: string;
  commercial_id?: string;
  place_id?: string;
  url_google_maps?: string;
  categorie?: string;
  contact_nom?: string;
  contact_poste?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const body = await req.json();
    const commerces: CommerceInput[] = Array.isArray(body) ? body : [body];

    console.log('Received data:', JSON.stringify(commerces.slice(0, 2), null, 2));

    if (commerces.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No data provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const validTypes = ['boulangerie', 'restaurant', 'pizzeria', 'poissonnerie', 'pressing', 'boucherie'];

    const normalizeStatut = (statut?: string): string => {
      if (!statut) return 'a_contacter';
      const normalized = statut.toLowerCase().trim()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '_');

      const statutMap: Record<string, string> = {
        'a_contacter': 'a_contacter',
        'rdv_pris': 'rdv_pris',
        'relance': 'relance',
        'gagne': 'gagne',
        'perdu': 'perdu',
      };

      return statutMap[normalized] || 'a_contacter';
    };

    const normalizePriorite = (priorite?: string): string => {
      if (!priorite) return 'normale';
      const normalized = priorite.toLowerCase().trim();

      const prioriteMap: Record<string, string> = {
        'basse': 'basse',
        'normale': 'normale',
        'haute': 'haute',
      };

      return prioriteMap[normalized] || 'normale';
    };

    const parseNumericValue = (value: any): number | null => {
      if (value === null || value === undefined || value === '') return null;

      if (typeof value === 'number') return value;

      if (typeof value === 'string') {
        const cleaned = value.replace(/[€$\s,]/g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? null : parsed;
      }

      return null;
    };

    const mappedCommerces = commerces.map((commerce) => {
      const rawType = commerce.type_commerce || commerce.type;
      const typeValue = rawType ? rawType.toLowerCase().trim() : null;
      const villeValue = commerce.ville_recherche || commerce.ville;
      const noteValue = parseNumericValue(commerce.note ?? commerce.note_google);
      const nombreAvisValue = parseNumericValue(commerce.nombre_avis ?? commerce.nb_avis);
      const panierMoyenValue = parseNumericValue(commerce.panier_moyen);
      const notesValue = commerce.notes_internes || commerce.notes;
      const statutValue = normalizeStatut(commerce.statut);
      const prioriteValue = normalizePriorite(commerce.priorite);

      if (!commerce.nom) {
        throw new Error('Missing required field: nom');
      }

      if (typeValue && !validTypes.includes(typeValue)) {
        throw new Error(`Invalid type: ${typeValue}. Must be one of: ${validTypes.join(', ')}`);
      }

      if (noteValue !== null && (noteValue < 0 || noteValue > 5)) {
        throw new Error('note must be between 0 and 5');
      }

      return {
        nom: commerce.nom,
        type_commerce: typeValue || null,
        adresse: commerce.adresse || null,
        ville_recherche: villeValue || null,
        telephone: commerce.telephone || null,
        email: commerce.email || null,
        site_web: commerce.site_web || null,
        facebook: commerce.facebook || null,
        instagram: commerce.instagram || null,
        linkedin: commerce.linkedin || null,
        note: noteValue,
        nombre_avis: nombreAvisValue,
        panier_moyen: panierMoyenValue,
        statut: statutValue,
        priorite: prioriteValue,
        notes_internes: notesValue || null,
        commercial_id: commerce.commercial_id || null,
        place_id: commerce.place_id || null,
        url_google_maps: commerce.url_google_maps || null,
        categorie: commerce.categorie || null,
        contact_nom: commerce.contact_nom || null,
        contact_poste: commerce.contact_poste || null,
        date_scraping: new Date().toISOString(),
      };
    });

    const { data, error } = await supabaseAdmin
      .from('commerces')
      .insert(mappedCommerces)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${data.length} commerce(s) imported successfully`,
        data: data
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});