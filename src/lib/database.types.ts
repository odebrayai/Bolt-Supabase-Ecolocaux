export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          prenom: string
          nom: string
          role: 'admin' | 'commercial' | 'viewer'
          avatar_url: string | null
          telephone: string | null
          actif: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          prenom: string
          nom: string
          role?: 'admin' | 'commercial' | 'viewer'
          avatar_url?: string | null
          telephone?: string | null
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          prenom?: string
          nom?: string
          role?: 'admin' | 'commercial' | 'viewer'
          avatar_url?: string | null
          telephone?: string | null
          actif?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      commerces: {
        Row: {
          id: string
          nom: string
          adresse: string | null
          telephone: string | null
          email: string | null
          site_web: string | null
          place_id: string | null
          url_google_maps: string | null
          note: number | null
          nombre_avis: number | null
          panier_moyen: number | null
          type_commerce: string | null
          categorie: string | null
          contact_nom: string | null
          contact_poste: string | null
          linkedin: string | null
          facebook: string | null
          instagram: string | null
          enrichi_gemini: boolean | null
          scoring_ia: number | null
          statut: string | null
          commercial_id: string | null
          priorite: string | null
          notes_internes: string | null
          ville_recherche: string | null
          date_scraping: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          nom: string
          adresse?: string | null
          telephone?: string | null
          email?: string | null
          site_web?: string | null
          place_id?: string | null
          url_google_maps?: string | null
          note?: number | null
          nombre_avis?: number | null
          panier_moyen?: number | null
          type_commerce?: string | null
          categorie?: string | null
          contact_nom?: string | null
          contact_poste?: string | null
          linkedin?: string | null
          facebook?: string | null
          instagram?: string | null
          enrichi_gemini?: boolean | null
          scoring_ia?: number | null
          statut?: string | null
          commercial_id?: string | null
          priorite?: string | null
          notes_internes?: string | null
          ville_recherche?: string | null
          date_scraping?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          nom?: string
          adresse?: string | null
          telephone?: string | null
          email?: string | null
          site_web?: string | null
          place_id?: string | null
          url_google_maps?: string | null
          note?: number | null
          nombre_avis?: number | null
          panier_moyen?: number | null
          type_commerce?: string | null
          categorie?: string | null
          contact_nom?: string | null
          contact_poste?: string | null
          linkedin?: string | null
          facebook?: string | null
          instagram?: string | null
          enrichi_gemini?: boolean | null
          scoring_ia?: number | null
          statut?: string | null
          commercial_id?: string | null
          priorite?: string | null
          notes_internes?: string | null
          ville_recherche?: string | null
          date_scraping?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      rendez_vous: {
        Row: {
          id: string
          commerce_id: string
          commercial_id: string
          date: string
          heure: string
          statut: 'planifié' | 'confirmé' | 'reporté' | 'effectué' | 'annulé'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          commerce_id: string
          commercial_id: string
          date: string
          heure: string
          statut?: 'planifié' | 'confirmé' | 'reporté' | 'effectué' | 'annulé'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          commerce_id?: string
          commercial_id?: string
          date?: string
          heure?: string
          statut?: 'planifié' | 'confirmé' | 'reporté' | 'effectué' | 'annulé'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      commentaires: {
        Row: {
          id: string
          commerce_id: string
          user_id: string
          commentaire: string
          created_at: string
        }
        Insert: {
          id?: string
          commerce_id: string
          user_id: string
          commentaire: string
          created_at?: string
        }
        Update: {
          id?: string
          commerce_id?: string
          user_id?: string
          commentaire?: string
          created_at?: string
        }
      }
    }
  }
}
