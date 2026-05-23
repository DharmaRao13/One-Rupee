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
      admin_activity_log: {
        Row: {
          action: string
          created_at: string
          id: string
          performed_by: string | null
          target: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          performed_by?: string | null
          target?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          performed_by?: string | null
          target?: string | null
        }
        Relationships: []
      }
      funnel_events: {
        Row: {
          created_at: string
          id: string
          referral_code: string | null
          session_id: string
          step: string
          tier: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code?: string | null
          session_id: string
          step: string
          tier?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string | null
          session_id?: string
          step?: string
          tier?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          order_id: string
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          currency?: string
          order_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          order_id?: string
          status?: string
        }
        Relationships: []
      }
      payment_logs: {
        Row: {
          amount: number
          created_at: string
          display_name: string | null
          id: string
          razorpay_payment_id: string | null
          status: string
          tier: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          created_at?: string
          display_name?: string | null
          id?: string
          razorpay_payment_id?: string | null
          status?: string
          tier?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          display_name?: string | null
          id?: string
          razorpay_payment_id?: string | null
          status?: string
          tier?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_ledger"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_stats: {
        Row: {
          created_at: string
          display_name: string
          id: string
          referral_code: string
          referral_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          display_name: string
          id?: string
          referral_code: string
          referral_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string
          id?: string
          referral_code?: string
          referral_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_stats_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users_ledger"
            referencedColumns: ["id"]
          },
        ]
      }
      site_stats: {
        Row: {
          id: number
          leaderboard_enabled: boolean
          payment_enabled: boolean
          total_payers: number
        }
        Insert: {
          id: number
          leaderboard_enabled?: boolean
          payment_enabled?: boolean
          total_payers?: number
        }
        Update: {
          id?: number
          leaderboard_enabled?: boolean
          payment_enabled?: boolean
          total_payers?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      users_ledger: {
        Row: {
          amount_paid: number
          badges: string[]
          created_at: string
          display_name: string
          id: string
          is_blocked: boolean
          is_verified: boolean
          notes: string | null
          payment_id: string | null
          razorpay_payment_id: string
          referral_code: string | null
          referral_count: number
          referred_by: string | null
          tier: string
          tier_payment_id: string | null
        }
        Insert: {
          amount_paid?: number
          badges?: string[]
          created_at?: string
          display_name: string
          id?: string
          is_blocked?: boolean
          is_verified?: boolean
          notes?: string | null
          payment_id?: string | null
          razorpay_payment_id: string
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          tier?: string
          tier_payment_id?: string | null
        }
        Update: {
          amount_paid?: number
          badges?: string[]
          created_at?: string
          display_name?: string
          id?: string
          is_blocked?: boolean
          is_verified?: boolean
          notes?: string | null
          payment_id?: string | null
          razorpay_payment_id?: string
          referral_code?: string | null
          referral_count?: number
          referred_by?: string | null
          tier?: string
          tier_payment_id?: string | null
        }
        Relationships: []
      }
      verified_sessions: {
        Row: {
          created_at: string
          display_name: string | null
          order_id: string
          payment_id: string
          used: boolean
          verified: boolean
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          order_id: string
          payment_id: string
          used?: boolean
          verified?: boolean
        }
        Update: {
          created_at?: string
          display_name?: string | null
          order_id?: string
          payment_id?: string
          used?: boolean
          verified?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
