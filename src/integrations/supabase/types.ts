export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      Agents: {
        Row: {
          Agent: string | null
          agentid: string
          avatar: string | null
          Email: string | null
        }
        Insert: {
          Agent?: string | null
          agentid?: string
          avatar?: string | null
          Email?: string | null
        }
        Update: {
          Agent?: string | null
          agentid?: string
          avatar?: string | null
          Email?: string | null
        }
        Relationships: []
      }
      "Daily Stats": {
        Row: {
          Agent: string
          agentid: string
          "Billing Tickets": number | null
          Calls: number | null
          Date: string | null
          Email: string | null
          Group: string | null
          "Helpdesk ticketing": number | null
          "Live Chat": number | null
          "Sales Tickets": number | null
          "Social Tickets": number | null
          "Support/DNS Emails": number | null
          "Team Lead Group": string | null
          "Total Issues handled": number | null
          "Walk-Ins": number | null
        }
        Insert: {
          Agent: string
          agentid: string
          "Billing Tickets"?: number | null
          Calls?: number | null
          Date?: string | null
          Email?: string | null
          Group?: string | null
          "Helpdesk ticketing"?: number | null
          "Live Chat"?: number | null
          "Sales Tickets"?: number | null
          "Social Tickets"?: number | null
          "Support/DNS Emails"?: number | null
          "Team Lead Group"?: string | null
          "Total Issues handled"?: number | null
          "Walk-Ins"?: number | null
        }
        Update: {
          Agent?: string
          agentid?: string
          "Billing Tickets"?: number | null
          Calls?: number | null
          Date?: string | null
          Email?: string | null
          Group?: string | null
          "Helpdesk ticketing"?: number | null
          "Live Chat"?: number | null
          "Sales Tickets"?: number | null
          "Social Tickets"?: number | null
          "Support/DNS Emails"?: number | null
          "Team Lead Group"?: string | null
          "Total Issues handled"?: number | null
          "Walk-Ins"?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Daily Stats_duplicate_agentid_fkey"
            columns: ["agentid"]
            isOneToOne: false
            referencedRelation: "Agents"
            referencedColumns: ["agentid"]
          },
        ]
      }
      daily_stats: {
        Row: {
          created_at: string | null
          date: string
          id: number
          notes: string | null
          row_identifier: string
          value: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: never
          notes?: string | null
          row_identifier: string
          value?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: never
          notes?: string | null
          row_identifier?: string
          value?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
