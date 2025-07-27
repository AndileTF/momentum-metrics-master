export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      csr_agent_proflie: {
        Row: {
          Agent: string | null
          agentid: string
          Email: string | null
          Profile: string | null
        }
        Insert: {
          Agent?: string | null
          agentid?: string
          Email?: string | null
          Profile?: string | null
        }
        Update: {
          Agent?: string | null
          agentid?: string
          Email?: string | null
          Profile?: string | null
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          Agent: string | null
          agentid: string | null
          "Billing Tickets": string | null
          Calls: number | null
          Date: string | null
          Email: string | null
          Group: string | null
          "Live Chat": string | null
          Profile: string | null
          "Sales Tickets": number | null
          "Social Tickets": string | null
          "Support/DNS Emails": string | null
          "Team Lead Group": string | null
          "Walk-Ins": string | null
        }
        Insert: {
          Agent?: string | null
          agentid?: string | null
          "Billing Tickets"?: string | null
          Calls?: number | null
          Date?: string | null
          Email?: string | null
          Group?: string | null
          "Live Chat"?: string | null
          Profile?: string | null
          "Sales Tickets"?: number | null
          "Social Tickets"?: string | null
          "Support/DNS Emails"?: string | null
          "Team Lead Group"?: string | null
          "Walk-Ins"?: string | null
        }
        Update: {
          Agent?: string | null
          agentid?: string | null
          "Billing Tickets"?: string | null
          Calls?: number | null
          Date?: string | null
          Email?: string | null
          Group?: string | null
          "Live Chat"?: string | null
          Profile?: string | null
          "Sales Tickets"?: number | null
          "Social Tickets"?: string | null
          "Support/DNS Emails"?: string | null
          "Team Lead Group"?: string | null
          "Walk-Ins"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_agentid_fkey"
            columns: ["agentid"]
            isOneToOne: false
            referencedRelation: "csr_agent_proflie"
            referencedColumns: ["agentid"]
          },
        ]
      }
      profile: {
        Row: {
          agentid: string | null
          avatar: string | null
          contract_type: string | null
          department: string | null
          email: string | null
          Employment_Group: string | null
          gender: string | null
          name: string | null
          post: string | null
          role: string | null
          team_lead_name: string | null
        }
        Insert: {
          agentid?: string | null
          avatar?: string | null
          contract_type?: string | null
          department?: string | null
          email?: string | null
          Employment_Group?: string | null
          gender?: string | null
          name?: string | null
          post?: string | null
          role?: string | null
          team_lead_name?: string | null
        }
        Update: {
          agentid?: string | null
          avatar?: string | null
          contract_type?: string | null
          department?: string | null
          email?: string | null
          Employment_Group?: string | null
          gender?: string | null
          name?: string | null
          post?: string | null
          role?: string | null
          team_lead_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_agentid_fkey"
            columns: ["agentid"]
            isOneToOne: false
            referencedRelation: "csr_agent_proflie"
            referencedColumns: ["agentid"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "agent"
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
      app_role: ["admin", "manager", "agent"],
    },
  },
} as const
