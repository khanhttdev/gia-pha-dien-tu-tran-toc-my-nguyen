export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string;
          created_at: string;
          id: string;
          new_data: Json | null;
          old_data: Json | null;
          record_id: string;
          table_name: string;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id: string;
          table_name: string;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string;
          id?: string;
          new_data?: Json | null;
          old_data?: Json | null;
          record_id?: string;
          table_name?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          author_id: string;
          content: string;
          contribution_id: string;
          created_at: string | null;
          id: string;
        };
        Insert: {
          author_id: string;
          content: string;
          contribution_id: string;
          created_at?: string | null;
          id?: string;
        };
        Update: {
          author_id?: string;
          content?: string;
          contribution_id?: string;
          created_at?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_contribution_id_fkey";
            columns: ["contribution_id"];
            isOneToOne: false;
            referencedRelation: "contributions";
            referencedColumns: ["id"];
          },
        ];
      };
      contacts: {
        Row: {
          address: string | null;
          created_at: string | null;
          email: string | null;
          facebook: string | null;
          id: string;
          is_public: boolean | null;
          member_id: string;
          notes: string | null;
          phone: string | null;
          updated_at: string | null;
          zalo: string | null;
        };
        Insert: {
          address?: string | null;
          created_at?: string | null;
          email?: string | null;
          facebook?: string | null;
          id?: string;
          is_public?: boolean | null;
          member_id: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          zalo?: string | null;
        };
        Update: {
          address?: string | null;
          created_at?: string | null;
          email?: string | null;
          facebook?: string | null;
          id?: string;
          is_public?: boolean | null;
          member_id?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string | null;
          zalo?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      contributions: {
        Row: {
          author_id: string | null;
          content: string;
          created_at: string | null;
          id: string;
          proposed_data: Json | null;
          reviewed_at: string | null;
          reviewed_by: string | null;
          status: string | null;
          target_member: string | null;
          type: string | null;
        };
        Insert: {
          author_id?: string | null;
          content: string;
          created_at?: string | null;
          id?: string;
          proposed_data?: Json | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string | null;
          target_member?: string | null;
          type?: string | null;
        };
        Update: {
          author_id?: string | null;
          content?: string;
          created_at?: string | null;
          id?: string;
          proposed_data?: Json | null;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          status?: string | null;
          target_member?: string | null;
          type?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contributions_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributions_reviewed_by_fkey";
            columns: ["reviewed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contributions_target_member_fkey";
            columns: ["target_member"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          event_date: string;
          event_time: string | null;
          id: string;
          location: string | null;
          title: string;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          event_date: string;
          event_time?: string | null;
          id?: string;
          location?: string | null;
          title: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          event_date?: string;
          event_time?: string | null;
          id?: string;
          location?: string | null;
          title?: string;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      funds: {
        Row: {
          amount: number;
          created_at: string | null;
          created_by: string | null;
          description: string;
          id: string;
          member_id: string | null;
          transaction_date: string;
          transaction_type: string;
          updated_at: string | null;
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          created_by?: string | null;
          description: string;
          id?: string;
          member_id?: string | null;
          transaction_date?: string;
          transaction_type: string;
          updated_at?: string | null;
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          created_by?: string | null;
          description?: string;
          id?: string;
          member_id?: string | null;
          transaction_date?: string;
          transaction_type?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funds_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      media: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          person_ids: string[] | null;
          title: string;
          type: string | null;
          uploaded_by: string | null;
          url: string;
          year: number | null;
          category: string | null;
          transcription: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          person_ids?: string[] | null;
          title: string;
          type?: string | null;
          uploaded_by?: string | null;
          url: string;
          year?: number | null;
          category?: string | null;
          transcription?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          person_ids?: string[] | null;
          title?: string;
          type?: string | null;
          uploaded_by?: string | null;
          url?: string;
          year?: number | null;
          category?: string | null;
          transcription?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "media_uploaded_by_fkey";
            columns: ["uploaded_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      members: {
        Row: {
          birth_order: number | null;
          created_at: string | null;
          father_id: string | null;
          full_name: string;
          gender: string;
          generation_level: number;
          id: string;
          metadata: Json | null;
          mother_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          birth_order?: number | null;
          created_at?: string | null;
          father_id?: string | null;
          full_name: string;
          gender?: string;
          generation_level?: number;
          id?: string;
          metadata?: Json | null;
          mother_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          birth_order?: number | null;
          created_at?: string | null;
          father_id?: string | null;
          full_name?: string;
          gender?: string;
          generation_level?: number;
          id?: string;
          metadata?: Json | null;
          mother_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "members_father_id_fkey";
            columns: ["father_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "members_mother_id_fkey";
            columns: ["mother_id"];
            isOneToOne: false;
            referencedRelation: "spouses";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          body: string | null;
          created_at: string | null;
          data: Json | null;
          id: string;
          is_read: boolean | null;
          title: string;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          body?: string | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          title: string;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          body?: string | null;
          created_at?: string | null;
          data?: Json | null;
          id?: string;
          is_read?: boolean | null;
          title?: string;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          linked_member: string | null;
          role: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          linked_member?: string | null;
          role?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          linked_member?: string | null;
          role?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_linked_member_fkey";
            columns: ["linked_member"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
      push_subscriptions: {
        Row: {
          auth_key: string;
          created_at: string | null;
          endpoint: string;
          id: string;
          p256dh: string;
          user_id: string;
        };
        Insert: {
          auth_key: string;
          created_at?: string | null;
          endpoint: string;
          id?: string;
          p256dh: string;
          user_id: string;
        };
        Update: {
          auth_key?: string;
          created_at?: string | null;
          endpoint?: string;
          id?: string;
          p256dh?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      spouses: {
        Row: {
          created_at: string | null;
          full_name: string;
          id: string;
          member_id: string;
          metadata: Json | null;
          role_type: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          full_name: string;
          id?: string;
          member_id: string;
          metadata?: Json | null;
          role_type?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          full_name?: string;
          id?: string;
          member_id?: string;
          metadata?: Json | null;
          role_type?: string | null;
          status?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "spouses_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_user: { Args: { target_user_id: string }; Returns: undefined };
      get_admin_users: {
        Args: never;
        Returns: Database["public"]["CompositeTypes"]["admin_user_data"][];
        SetofOptions: {
          from: "*";
          to: "admin_user_data";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      get_demographic_stats: { Args: never; Returns: Json };
      get_family_tree: {
        Args: { root_id?: string };
        Returns: {
          birth_order: number;
          depth: number;
          father_id: string;
          full_name: string;
          gender: string;
          generation_level: number;
          id: string;
          metadata: Json;
          mother_id: string;
        }[];
      };
      get_fund_balance: { Args: never; Returns: number };
      is_accountant: { Args: never; Returns: boolean };
      is_admin: { Args: never; Returns: boolean };
      set_user_role: {
        Args: { new_role: string; target_user_id: string };
        Returns: undefined;
      };
      set_user_status: {
        Args: { new_status: string; target_user_id: string };
        Returns: undefined;
      };
      set_user_active_status: {
        Args: { target_user_id: string; new_status: boolean };
        Returns: undefined;
      };
      admin_create_user: {
        Args: {
          new_email: string;
          new_password: string;
          new_role: string;
          new_active?: boolean;
        };
        Returns: string;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      admin_user_data: {
        id: string | null;
        email: string | null;
        role: string | null;
        created_at: string | null;
        is_active: boolean | null;
        status: string | null;
      };
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
  ? R
  : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I;
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I;
  }
  ? I
  : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U;
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U;
  }
  ? U
  : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
