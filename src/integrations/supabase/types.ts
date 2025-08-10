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
      announcements: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          audience: Database["public"]["Enums"]["announcement_audience"]
          author_id: string
          content: string
          created_at: string | null
          expires_at: string | null
          id: string
          is_published: boolean | null
          priority: number | null
          target_class_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          audience: Database["public"]["Enums"]["announcement_audience"]
          author_id: string
          content: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: number | null
          target_class_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          audience?: Database["public"]["Enums"]["announcement_audience"]
          author_id?: string
          content?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: number | null
          target_class_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_target_class_id_fkey"
            columns: ["target_class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          academic_year: string
          created_at: string | null
          grade_level: number
          id: string
          name: string
          section: string | null
          teacher_id: string | null
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          grade_level: number
          id?: string
          name: string
          section?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          grade_level?: number
          id?: string
          name?: string
          section?: string | null
          teacher_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
          agentid: string
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
          agentid: string
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
          agentid?: string
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
      exams: {
        Row: {
          class_id: string | null
          created_at: string | null
          duration_minutes: number | null
          exam_date: string
          id: string
          instructions: string | null
          name: string
          status: Database["public"]["Enums"]["exam_status"] | null
          subject_id: string | null
          teacher_id: string | null
          total_marks: number
          updated_at: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          exam_date: string
          id?: string
          instructions?: string | null
          name: string
          status?: Database["public"]["Enums"]["exam_status"] | null
          subject_id?: string | null
          teacher_id?: string | null
          total_marks: number
          updated_at?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          exam_date?: string
          id?: string
          instructions?: string | null
          name?: string
          status?: Database["public"]["Enums"]["exam_status"] | null
          subject_id?: string | null
          teacher_id?: string | null
          total_marks?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exams_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_structures: {
        Row: {
          academic_year: string
          amount: number
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          grade_level: number | null
          id: string
          is_mandatory: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          amount: number
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          grade_level?: number | null
          id?: string
          is_mandatory?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          amount?: number
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          grade_level?: number | null
          id?: string
          is_mandatory?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fee_structures_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          fee_structure_id: string | null
          id: string
          invoice_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          fee_structure_id?: string | null
          id?: string
          invoice_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          fee_structure_id?: string | null
          id?: string
          invoice_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_fee_structure_id_fkey"
            columns: ["fee_structure_id"]
            isOneToOne: false
            referencedRelation: "fee_structures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          academic_year: string
          created_at: string | null
          created_by: string | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          paid_amount: number | null
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          created_by?: string | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_amount?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_amount?: number | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          received_by: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          received_by?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
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
      users: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
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
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      is_admin_or_headmaster: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      announcement_audience:
        | "all"
        | "parents"
        | "students"
        | "teachers"
        | "specific_class"
      app_role: "admin" | "manager" | "agent"
      exam_status: "draft" | "scheduled" | "completed" | "published"
      payment_method: "bank_transfer" | "cash" | "online_gateway" | "cheque"
      payment_status: "paid" | "partially_paid" | "unpaid" | "overdue"
      user_role: "admin" | "headmaster" | "teacher" | "student" | "parent"
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
      announcement_audience: [
        "all",
        "parents",
        "students",
        "teachers",
        "specific_class",
      ],
      app_role: ["admin", "manager", "agent"],
      exam_status: ["draft", "scheduled", "completed", "published"],
      payment_method: ["bank_transfer", "cash", "online_gateway", "cheque"],
      payment_status: ["paid", "partially_paid", "unpaid", "overdue"],
      user_role: ["admin", "headmaster", "teacher", "student", "parent"],
    },
  },
} as const
