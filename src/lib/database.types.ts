// Tipos generados desde el esquema de Supabase (supabase gen types typescript).
// No editar a mano: regenerar tras cada migración.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      app_settings: {
        Row: { description: string | null; key: string; updated_at: string; value: number };
        Insert: { description?: string | null; key: string; updated_at?: string; value: number };
        Update: { description?: string | null; key?: string; updated_at?: string; value?: number };
        Relationships: [];
      };
      applications: {
        Row: {
          created_at: string;
          id: string;
          message: string | null;
          offer_id: string;
          status: string;
          updated_at: string;
          worker_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message?: string | null;
          offer_id: string;
          status?: string;
          updated_at?: string;
          worker_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string | null;
          offer_id?: string;
          status?: string;
          updated_at?: string;
          worker_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "applications_offer_id_fkey";
            columns: ["offer_id"];
            isOneToOne: false;
            referencedRelation: "job_offers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "applications_worker_id_fkey";
            columns: ["worker_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_log: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          details: Json;
          entity: string;
          entity_id: string | null;
          id: number;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          details?: Json;
          entity: string;
          entity_id?: string | null;
          id?: never;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          details?: Json;
          entity?: string;
          entity_id?: string | null;
          id?: never;
        };
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      businesses: {
        Row: {
          category: string;
          created_at: string;
          description: string | null;
          floor: string | null;
          gallery_id: string | null;
          id: string;
          level: number;
          location_type: string;
          name: string;
          owner_id: string;
          slug: string;
          stand: string | null;
          updated_at: string;
          whatsapp: string;
          zone: string | null;
        };
        Insert: {
          category: string;
          created_at?: string;
          description?: string | null;
          floor?: string | null;
          gallery_id?: string | null;
          id?: string;
          level?: number;
          location_type: string;
          name: string;
          owner_id: string;
          slug: string;
          stand?: string | null;
          updated_at?: string;
          whatsapp: string;
          zone?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string;
          description?: string | null;
          floor?: string | null;
          gallery_id?: string | null;
          id?: string;
          level?: number;
          location_type?: string;
          name?: string;
          owner_id?: string;
          slug?: string;
          stand?: string | null;
          updated_at?: string;
          whatsapp?: string;
          zone?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "businesses_gallery_id_fkey";
            columns: ["gallery_id"];
            isOneToOne: false;
            referencedRelation: "galleries";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "businesses_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      formalization_evidence: {
        Row: {
          business_id: string;
          created_at: string;
          doc_number: string;
          doc_type: string;
          file_path: string;
          id: string;
          level: number;
          review_note: string | null;
          reviewed_at: string | null;
          reviewer_id: string | null;
          status: string;
        };
        Insert: {
          business_id: string;
          created_at?: string;
          doc_number: string;
          doc_type: string;
          file_path: string;
          id?: string;
          level: number;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          status?: string;
        };
        Update: {
          business_id?: string;
          created_at?: string;
          doc_number?: string;
          doc_type?: string;
          file_path?: string;
          id?: string;
          level?: number;
          review_note?: string | null;
          reviewed_at?: string | null;
          reviewer_id?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "formalization_evidence_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "formalization_evidence_reviewer_id_fkey";
            columns: ["reviewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      galleries: {
        Row: {
          address: string;
          created_at: string;
          description: string | null;
          floors: number;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          address: string;
          created_at?: string;
          description?: string | null;
          floors?: number;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          address?: string;
          created_at?: string;
          description?: string | null;
          floors?: number;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      job_offers: {
        Row: {
          business_id: string;
          contract_type: string;
          created_at: string;
          description: string;
          id: string;
          salary: number;
          schedule: string;
          status: string;
          title: string;
          updated_at: string;
          vacancies: number;
        };
        Insert: {
          business_id: string;
          contract_type: string;
          created_at?: string;
          description: string;
          id?: string;
          salary: number;
          schedule: string;
          status?: string;
          title: string;
          updated_at?: string;
          vacancies?: number;
        };
        Update: {
          business_id?: string;
          contract_type?: string;
          created_at?: string;
          description?: string;
          id?: string;
          salary?: number;
          schedule?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          vacancies?: number;
        };
        Relationships: [
          {
            foreignKeyName: "job_offers_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          active: boolean;
          business_id: string;
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          min_order: number;
          name: string;
          price_dozen: number;
          price_unit: number;
          updated_at: string;
        };
        Insert: {
          active?: boolean;
          business_id: string;
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          min_order?: number;
          name: string;
          price_dozen: number;
          price_unit: number;
          updated_at?: string;
        };
        Update: {
          active?: boolean;
          business_id?: string;
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          min_order?: number;
          name?: string;
          price_dozen?: number;
          price_unit?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_business_id_fkey";
            columns: ["business_id"];
            isOneToOne: false;
            referencedRelation: "businesses";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          gallery_id: string | null;
          id: string;
          phone: string | null;
          role: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          gallery_id?: string | null;
          id: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          gallery_id?: string | null;
          id?: string;
          phone?: string | null;
          role?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_gallery_id_fkey";
            columns: ["gallery_id"];
            isOneToOne: false;
            referencedRelation: "galleries";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      gestor_stats: { Args: never; Returns: Json };
      public_stats: { Args: never; Returns: Json };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];
export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"];
