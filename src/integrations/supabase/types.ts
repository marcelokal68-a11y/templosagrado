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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_history: {
        Row: {
          content: string
          created_at: string
          id: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          need: string | null
          philosophy: string | null
          religion: string | null
          role: string
          topic: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          need?: string | null
          philosophy?: string | null
          religion?: string | null
          role: string
          topic?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          need?: string | null
          philosophy?: string | null
          religion?: string | null
          role?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          affiliation_type: string
          affiliation_value: string
          ended_at: string | null
          id: string
          started_at: string
          user_id: string
        }
        Insert: {
          affiliation_type: string
          affiliation_value: string
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id: string
        }
        Update: {
          affiliation_type?: string
          affiliation_value?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_verse_cache: {
        Row: {
          cache_date: string
          created_at: string
          id: string
          language: string
          religion: string
          verse_data: Json
        }
        Insert: {
          cache_date: string
          created_at?: string
          id?: string
          language?: string
          religion: string
          verse_data: Json
        }
        Update: {
          cache_date?: string
          created_at?: string
          id?: string
          language?: string
          religion?: string
          verse_data?: Json
        }
        Relationships: []
      }
      free_access_emails: {
        Row: {
          created_at: string
          email: string
          note: string | null
        }
        Insert: {
          created_at?: string
          email: string
          note?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          note?: string | null
        }
        Relationships: []
      }
      guest_chat_usage: {
        Row: {
          anon_id: string
          created_at: string
          period_start: string
          questions_limit: number
          questions_used: number
          updated_at: string
        }
        Insert: {
          anon_id: string
          created_at?: string
          period_start?: string
          questions_limit?: number
          questions_used?: number
          updated_at?: string
        }
        Update: {
          anon_id?: string
          created_at?: string
          period_start?: string
          questions_limit?: number
          questions_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      invite_links: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          label: string | null
          max_uses: number | null
          questions_limit: number
          times_used: number
        }
        Insert: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number | null
          questions_limit?: number
          times_used?: number
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          label?: string | null
          max_uses?: number | null
          questions_limit?: number
          times_used?: number
        }
        Relationships: []
      }
      invite_redemptions: {
        Row: {
          id: string
          invite_id: string
          redeemed_at: string
          user_id: string
        }
        Insert: {
          id?: string
          invite_id: string
          redeemed_at?: string
          user_id: string
        }
        Update: {
          id?: string
          invite_id?: string
          redeemed_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invite_redemptions_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "invite_links"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          chunk_index: number
          content: string
          created_at: string
          embedding: string | null
          id: string
          metadata: Json | null
          source_id: string
          token_count: number | null
        }
        Insert: {
          chunk_index: number
          content: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id: string
          token_count?: number | null
        }
        Update: {
          chunk_index?: number
          content?: string
          created_at?: string
          embedding?: string | null
          id?: string
          metadata?: Json | null
          source_id?: string
          token_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "knowledge_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_sources: {
        Row: {
          author: string | null
          chunk_count: number
          created_at: string
          created_by: string | null
          error_message: string | null
          file_path: string | null
          id: string
          language: string
          original_url: string | null
          religion: string | null
          source_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          chunk_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          language?: string
          original_url?: string | null
          religion?: string | null
          source_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          chunk_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string | null
          id?: string
          language?: string
          original_url?: string | null
          religion?: string | null
          source_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      moderation_flags: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      parasha_cache: {
        Row: {
          created_at: string
          id: string
          name_en: string | null
          name_he: string | null
          torah_ref: string | null
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_he?: string | null
          torah_ref?: string | null
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          name_en?: string | null
          name_he?: string | null
          torah_ref?: string | null
          week_start?: string
        }
        Relationships: []
      }
      prayer_comments: {
        Row: {
          content: string
          created_at: string
          display_name: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_reactions: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          post_id: string
          reason: string
          reporter_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          post_id: string
          reason: string
          reporter_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          post_id?: string
          reason?: string
          reporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_reports_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_wall_posts: {
        Row: {
          content: string
          created_at: string
          display_name: string | null
          id: string
          is_anonymous: boolean
          is_public: boolean
          philosophy: string | null
          religion: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_public?: boolean
          philosophy?: string | null
          religion?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_anonymous?: boolean
          is_public?: boolean
          philosophy?: string | null
          religion?: string | null
          user_id?: string
        }
        Relationships: []
      }
      prayers: {
        Row: {
          created_at: string
          generated_text: string | null
          id: string
          intention: string
          name: string | null
          religion: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          generated_text?: string | null
          id?: string
          intention: string
          name?: string | null
          religion?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          generated_text?: string | null
          id?: string
          intention?: string
          name?: string | null
          religion?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          chat_tone: string
          created_at: string
          display_name: string | null
          id: string
          is_pro: boolean
          is_subscriber: boolean
          latitude: number | null
          longitude: number | null
          memory_enabled: boolean
          mp_subscription_id: string | null
          preferred_language: string
          preferred_religion: string | null
          questions_limit: number
          questions_period_start: string
          questions_used: number
          subscription_id: string | null
          trial_ends_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_tone?: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_pro?: boolean
          is_subscriber?: boolean
          latitude?: number | null
          longitude?: number | null
          memory_enabled?: boolean
          mp_subscription_id?: string | null
          preferred_language?: string
          preferred_religion?: string | null
          questions_limit?: number
          questions_period_start?: string
          questions_used?: number
          subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_tone?: string
          created_at?: string
          display_name?: string | null
          id?: string
          is_pro?: boolean
          is_subscriber?: boolean
          latitude?: number | null
          longitude?: number | null
          memory_enabled?: boolean
          mp_subscription_id?: string | null
          preferred_language?: string
          preferred_religion?: string | null
          questions_limit?: number
          questions_period_start?: string
          questions_used?: number
          subscription_id?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tts_usage: {
        Row: {
          count: number
          created_at: string
          id: string
          month_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          id?: string
          month_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          id?: string
          month_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memory: {
        Row: {
          category: string
          created_at: string
          fact: string
          id: string
          source_message: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          fact: string
          id?: string
          source_message?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          fact?: string
          id?: string
          source_message?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      prayer_reactions_public: {
        Row: {
          created_at: string | null
          id: string | null
          post_id: string | null
          reaction_type: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prayer_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prayer_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "prayer_wall_posts_public"
            referencedColumns: ["id"]
          },
        ]
      }
      prayer_wall_posts_public: {
        Row: {
          content: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          is_anonymous: boolean | null
          is_public: boolean | null
          philosophy: string | null
          religion: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          display_name?: never
          id?: string | null
          is_anonymous?: boolean | null
          is_public?: boolean | null
          philosophy?: string | null
          religion?: string | null
          user_id?: never
        }
        Update: {
          content?: string | null
          created_at?: string | null
          display_name?: never
          id?: string | null
          is_anonymous?: boolean | null
          is_public?: boolean | null
          philosophy?: string | null
          religion?: string | null
          user_id?: never
        }
        Relationships: []
      }
    }
    Functions: {
      decrement_invite_usage: {
        Args: { _invite_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_subscriber: { Args: { _user_id: string }; Returns: boolean }
      match_knowledge:
        | {
            Args: {
              filter_religion?: string
              match_count?: number
              query_embedding: string
              similarity_threshold?: number
            }
            Returns: {
              chunk_id: string
              content: string
              similarity: number
              source_author: string
              source_id: string
              source_religion: string
              source_title: string
            }[]
          }
        | {
            Args: {
              filter_religion?: string
              match_count?: number
              query_embedding: string
              similarity_threshold?: number
              strict_match?: boolean
            }
            Returns: {
              chunk_id: string
              content: string
              similarity: number
              source_author: string
              source_id: string
              source_religion: string
              source_title: string
            }[]
          }
      reset_questions_if_period_elapsed: {
        Args: { _user_id: string }
        Returns: undefined
      }
      sync_free_access_profiles: { Args: never; Returns: undefined }
      try_consume_guest_question: {
        Args: { _anon_id: string }
        Returns: {
          allowed: boolean
          quota_limit: number
          remaining: number
        }[]
      }
      try_consume_question: {
        Args: { _user_id: string }
        Returns: {
          allowed: boolean
          quota_limit: number
          remaining: number
        }[]
      }
      try_redeem_invite_link: {
        Args: { _code: string }
        Returns: {
          invite_id: string
          ok: boolean
          questions_limit: number
          reason: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
