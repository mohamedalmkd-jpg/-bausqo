export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_id: string
          available_from: string | null
          created_at: string
          id: string
          job_id: string
          message: string
          status: string
        }
        Insert: {
          applicant_id?: string
          available_from?: string | null
          created_at?: string
          id?: string
          job_id: string
          message: string
          status?: string
        }
        Update: {
          applicant_id?: string
          available_from?: string | null
          created_at?: string
          id?: string
          job_id?: string
          message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          guest_id: string
          id: string
          job_id: string | null
          owner_id: string
          recipient_id: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          guest_id: string
          id?: string
          job_id?: string | null
          owner_id: string
          recipient_id?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          guest_id?: string
          id?: string
          job_id?: string | null
          owner_id?: string
          recipient_id?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          availability: string | null
          budget_max: number | null
          budget_min: number | null
          city: string
          compensation: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_type: string
          created_at: string
          deal_strength: string
          description: string
          duration: string | null
          end_date: string | null
          experience_level: string | null
          id: string
          latitude: number | null
          longitude: number | null
          media_paths: string[]
          owner_id: string
          postal_code: string | null
          published_at: string | null
          qualifications: string | null
          radius_km: number
          requirements: string | null
          starts_on: string | null
          state: string | null
          status: string
          title: string
          trade: string
          updated_at: string
          visibility: string
          visibility_tier: string
          workers_needed: number
        }
        Insert: {
          availability?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city: string
          compensation?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string
          created_at?: string
          deal_strength?: string
          description: string
          duration?: string | null
          end_date?: string | null
          experience_level?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          media_paths?: string[]
          owner_id?: string
          postal_code?: string | null
          published_at?: string | null
          qualifications?: string | null
          radius_km?: number
          requirements?: string | null
          starts_on?: string | null
          state?: string | null
          status?: string
          title: string
          trade: string
          updated_at?: string
          visibility?: string
          visibility_tier?: string
          workers_needed?: number
        }
        Update: {
          availability?: string | null
          budget_max?: number | null
          budget_min?: number | null
          city?: string
          compensation?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contract_type?: string
          created_at?: string
          deal_strength?: string
          description?: string
          duration?: string | null
          end_date?: string | null
          experience_level?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          media_paths?: string[]
          owner_id?: string
          postal_code?: string | null
          published_at?: string | null
          qualifications?: string | null
          radius_km?: number
          requirements?: string | null
          starts_on?: string | null
          state?: string | null
          status?: string
          title?: string
          trade?: string
          updated_at?: string
          visibility?: string
          visibility_tier?: string
          workers_needed?: number
        }
        Relationships: [
          {
            foreignKeyName: "jobs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
          status?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          conversation_id: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          conversation_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_type: string
          auth_provider: string | null
          avatar_url: string | null
          bio: string
          city: string
          company_name: string
          created_at: string
          display_name: string
          id: string
          onboarding_completed: boolean
          phone: string | null
          postal_code: string | null
          trade: string
        }
        Insert: {
          account_type?: string
          auth_provider?: string | null
          avatar_url?: string | null
          bio?: string
          city?: string
          company_name?: string
          created_at?: string
          display_name?: string
          id: string
          onboarding_completed?: boolean
          phone?: string | null
          postal_code?: string | null
          trade?: string
        }
        Update: {
          account_type?: string
          auth_provider?: string | null
          avatar_url?: string | null
          bio?: string
          city?: string
          company_name?: string
          created_at?: string
          display_name?: string
          id?: string
          onboarding_completed?: boolean
          phone?: string | null
          postal_code?: string | null
          trade?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_searches: {
        Row: {
          city: string
          created_at: string
          id: string
          label: string
          query: string
          user_id: string
        }
        Insert: {
          city?: string
          created_at?: string
          id?: string
          label: string
          query?: string
          user_id?: string
        }
        Update: {
          city?: string
          created_at?: string
          id?: string
          label?: string
          query?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      search_logs: {
        Row: {
          accepted: number
          created_at: string
          duplicates: number
          duration_ms: number | null
          error: string | null
          id: number
          location: string | null
          ok: boolean
          provider: string
          query: string
          received: number
          rejected: number
          result_count: number
        }
        Insert: {
          accepted?: number
          created_at?: string
          duplicates?: number
          duration_ms?: number | null
          error?: string | null
          id?: number
          location?: string | null
          ok?: boolean
          provider: string
          query?: string
          received?: number
          rejected?: number
          result_count?: number
        }
        Update: {
          accepted?: number
          created_at?: string
          duplicates?: number
          duration_ms?: number | null
          error?: string | null
          id?: number
          location?: string | null
          ok?: boolean
          provider?: string
          query?: string
          received?: number
          rejected?: number
          result_count?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          plan: string
          status: string
          updated_at: string
          user_id: string
          valid_until: string | null
        }
        Insert: {
          plan?: string
          status?: string
          updated_at?: string
          user_id: string
          valid_until?: string | null
        }
        Update: {
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          sender_id: string
          ticket_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          sender_id?: string
          ticket_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_replies_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          body: string
          created_at: string
          id: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          status?: string
          subject: string
          user_id?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          role: string
          user_id: string
        }
        Insert: {
          role: string
          user_id: string
        }
        Update: {
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_plan: { Args: never; Returns: string }
      has_role: { Args: { _role: string; _user_id: string }; Returns: boolean }
      in_conversation: { Args: { conversation: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      plan_rank: { Args: { p: string }; Returns: number }
      search_jobs: {
        Args: {
          search_city?: string
          search_text?: string
          search_trade?: string
        }
        Returns: {
          availability: string | null
          budget_max: number | null
          budget_min: number | null
          city: string
          compensation: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contract_type: string
          created_at: string
          deal_strength: string
          description: string
          duration: string | null
          end_date: string | null
          experience_level: string | null
          id: string
          latitude: number | null
          longitude: number | null
          media_paths: string[]
          owner_id: string
          postal_code: string | null
          published_at: string | null
          qualifications: string | null
          radius_km: number
          requirements: string | null
          starts_on: string | null
          state: string | null
          status: string
          title: string
          trade: string
          updated_at: string
          visibility: string
          visibility_tier: string
          workers_needed: number
        }[]
        SetofOptions: {
          from: "*"
          to: "jobs"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      set_application_status: {
        Args: { new_status: string; target_application: string }
        Returns: undefined
      }
      start_conversation: {
        Args: { other_user: string; target_job: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
