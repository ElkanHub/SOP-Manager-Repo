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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string | null
          dept_id: string | null
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string | null
          dept_id?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string | null
          dept_id?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_dept_id_fkey"
            columns: ["dept_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      change_controls: {
        Row: {
          completed_at: string | null
          created_at: string | null
          delta_summary: string | null
          diff_json: Json | null
          id: string
          issued_by: string | null
          new_file_url: string
          new_version: string
          old_file_url: string
          old_version: string
          sop_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          delta_summary?: string | null
          diff_json?: Json | null
          id?: string
          issued_by?: string | null
          new_file_url: string
          new_version: string
          old_file_url: string
          old_version: string
          sop_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          delta_summary?: string | null
          diff_json?: Json | null
          id?: string
          issued_by?: string | null
          new_file_url?: string
          new_version?: string
          old_file_url?: string
          old_version?: string
          sop_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_controls_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "change_controls_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_qa: boolean | null
          name: string
          slug: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_qa?: boolean | null
          name: string
          slug: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_qa?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          approved_by: string | null
          asset_id: string
          created_at: string | null
          custom_interval_days: number | null
          dept_id: string
          frequency: string | null
          id: string
          last_serviced: string | null
          linked_sop_id: string | null
          model: string | null
          name: string
          next_due: string | null
          photo_url: string | null
          serial_number: string | null
          status: string | null
          submitted_by: string | null
        }
        Insert: {
          approved_by?: string | null
          asset_id: string
          created_at?: string | null
          custom_interval_days?: number | null
          dept_id: string
          frequency?: string | null
          id?: string
          last_serviced?: string | null
          linked_sop_id?: string | null
          model?: string | null
          name: string
          next_due?: string | null
          photo_url?: string | null
          serial_number?: string | null
          status?: string | null
          submitted_by?: string | null
        }
        Update: {
          approved_by?: string | null
          asset_id?: string
          created_at?: string | null
          custom_interval_days?: number | null
          dept_id?: string
          frequency?: string | null
          id?: string
          last_serviced?: string | null
          linked_sop_id?: string | null
          model?: string | null
          name?: string
          next_due?: string | null
          photo_url?: string | null
          serial_number?: string | null
          status?: string | null
          submitted_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_dept_id_fkey"
            columns: ["dept_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_linked_sop_id_fkey"
            columns: ["linked_sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          dept_id: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          equipment_id: string | null
          event_type: string | null
          id: string
          start_date: string
          start_time: string | null
          title: string
          visibility: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dept_id?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          equipment_id?: string | null
          event_type?: string | null
          id?: string
          start_date: string
          start_time?: string | null
          title: string
          visibility?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dept_id?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          equipment_id?: string | null
          event_type?: string | null
          id?: string
          start_date?: string
          start_time?: string | null
          title?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_dept_id_fkey"
            columns: ["dept_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      mobile_signatures: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          signature_base64: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          signature_base64?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          signature_base64?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mobile_signatures_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_acknowledgements: {
        Row: {
          acknowledged_at: string | null
          id: string
          notice_id: string
          user_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          id?: string
          notice_id: string
          user_id: string
        }
        Update: {
          acknowledged_at?: string | null
          id?: string
          notice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_acknowledgements_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notice_acknowledgements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_recipients: {
        Row: {
          id: string
          notice_id: string
          user_id: string
        }
        Insert: {
          id?: string
          notice_id: string
          user_id: string
        }
        Update: {
          id?: string
          notice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notice_recipients_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: false
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notice_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          audience: string
          author_id: string
          created_at: string | null
          deleted_at: string | null
          dept_id: string | null
          id: string
          message: string
          subject: string
        }
        Insert: {
          audience: string
          author_id: string
          created_at?: string | null
          deleted_at?: string | null
          dept_id?: string | null
          id?: string
          message: string
          subject: string
        }
        Update: {
          audience?: string
          author_id?: string
          created_at?: string | null
          deleted_at?: string | null
          dept_id?: string | null
          id?: string
          message?: string
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notices_dept_id_fkey"
            columns: ["dept_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      pm_tasks: {
        Row: {
          assigned_dept: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          due_date: string
          equipment_id: string
          id: string
          notes: string | null
          photo_url: string | null
          status: string | null
        }
        Insert: {
          assigned_dept: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date: string
          equipment_id: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          status?: string | null
        }
        Update: {
          assigned_dept?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          due_date?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pm_tasks_assigned_dept_fkey"
            columns: ["assigned_dept"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_tasks_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pm_tasks_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dept_id: string | null
          email: string
          employee_id: string | null
          full_name: string
          id: string
          job_title: string | null
          onboarding_complete: boolean | null
          phone: string | null
          role: string
          signature_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dept_id?: string | null
          email: string
          employee_id?: string | null
          full_name: string
          id: string
          job_title?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          role: string
          signature_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dept_id?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string
          id?: string
          job_title?: string | null
          onboarding_complete?: boolean | null
          phone?: string | null
          role?: string
          signature_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_dept_id_fkey"
            columns: ["dept_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_certificates: {
        Row: {
          change_control_id: string
          id: string
          ip_address: string | null
          signature_url: string
          signed_at: string | null
          user_id: string
        }
        Insert: {
          change_control_id: string
          id?: string
          ip_address?: string | null
          signature_url: string
          signed_at?: string | null
          user_id: string
        }
        Update: {
          change_control_id?: string
          id?: string
          ip_address?: string | null
          signature_url?: string
          signed_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_certificates_change_control_id_fkey"
            columns: ["change_control_id"]
            isOneToOne: false
            referencedRelation: "change_controls"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_acknowledgements: {
        Row: {
          acknowledged_at: string | null
          id: string
          sop_id: string
          user_id: string
          version: string
        }
        Insert: {
          acknowledged_at?: string | null
          id?: string
          sop_id: string
          user_id: string
          version: string
        }
        Update: {
          acknowledged_at?: string | null
          id?: string
          sop_id?: string
          user_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_acknowledgements_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_acknowledgements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_approval_comments: {
        Row: {
          action: string | null
          author_id: string
          comment: string
          created_at: string | null
          id: string
          request_id: string
        }
        Insert: {
          action?: string | null
          author_id: string
          comment: string
          created_at?: string | null
          id?: string
          request_id: string
        }
        Update: {
          action?: string | null
          author_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_approval_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_approval_comments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "sop_approval_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_approval_requests: {
        Row: {
          created_at: string | null
          id: string
          notes_to_qa: string | null
          sop_id: string
          status: string
          submitted_by: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes_to_qa?: string | null
          sop_id: string
          status?: string
          submitted_by: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes_to_qa?: string | null
          sop_id?: string
          status?: string
          submitted_by?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sop_approval_requests_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_approval_requests_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sop_versions: {
        Row: {
          created_at: string | null
          delta_summary: string | null
          diff_json: Json | null
          file_url: string
          id: string
          sop_id: string
          uploaded_by: string | null
          version: string
        }
        Insert: {
          created_at?: string | null
          delta_summary?: string | null
          diff_json?: Json | null
          file_url: string
          id?: string
          sop_id: string
          uploaded_by?: string | null
          version: string
        }
        Update: {
          created_at?: string | null
          delta_summary?: string | null
          diff_json?: Json | null
          file_url?: string
          id?: string
          sop_id?: string
          uploaded_by?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "sop_versions_sop_id_fkey"
            columns: ["sop_id"]
            isOneToOne: false
            referencedRelation: "sops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sop_versions_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sops: {
        Row: {
          approved_by: string | null
          created_at: string | null
          date_listed: string | null
          date_revised: string | null
          dept_id: string
          due_for_revision: string | null
          file_url: string | null
          id: string
          sop_number: string
          status: string
          submitted_by: string | null
          title: string
          updated_at: string | null
          version: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string | null
          date_listed?: string | null
          date_revised?: string | null
          dept_id: string
          due_for_revision?: string | null
          file_url?: string | null
          id?: string
          sop_number: string
          status?: string
          submitted_by?: string | null
          title: string
          updated_at?: string | null
          version?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string | null
          date_listed?: string | null
          date_revised?: string | null
          dept_id?: string
          due_for_revision?: string | null
          file_url?: string | null
          id?: string
          sop_number?: string
          status?: string
          submitted_by?: string | null
          title?: string
          updated_at?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "sops_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sops_dept_id_fkey"
            columns: ["dept_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sops_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
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
      calculate_next_due: {
        Args: { custom_days: number; freq: string; last_dt: string }
        Returns: string
      }
      get_user_dept_is_qa: { Args: { user_id: string }; Returns: boolean }
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
    Enums: {},
  },
} as const
