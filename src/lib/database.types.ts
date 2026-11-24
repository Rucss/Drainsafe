export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      sensor_nodes: {
        Row: {
          id: string;
          name: string;
          location: string;
          latitude: number | null;
          longitude: number | null;
          status: "online" | "offline" | "maintenance";
          battery_percent: number | null;
          sensor_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          location: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: "online" | "offline" | "maintenance";
          battery_percent?: number | null;
          sensor_type?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          location?: string;
          latitude?: number | null;
          longitude?: number | null;
          status?: "online" | "offline" | "maintenance";
          battery_percent?: number | null;
          sensor_type?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sensor_readings: {
        Row: {
          id: string;
          sensor_id: string;
          flow_rate: number | null;
          water_level: number | null;
          recorded_at: string;
        };
        Insert: {
          id?: string;
          sensor_id: string;
          flow_rate?: number | null;
          water_level?: number | null;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          sensor_id?: string;
          flow_rate?: number | null;
          water_level?: number | null;
          recorded_at?: string;
        };
        Relationships: [];
      };
      alerts: {
        Row: {
          id: string;
          sensor_id: string | null;
          title: string;
          severity: "critical" | "warning" | "medium";
          status: "active" | "acknowledged" | "resolved" | "maintenance";
          description: string;
          created_at: string;
          acknowledged_at: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          sensor_id?: string | null;
          title: string;
          severity: "critical" | "warning" | "medium";
          status?: "active" | "acknowledged" | "resolved" | "maintenance";
          description: string;
          created_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          sensor_id?: string | null;
          title?: string;
          severity?: "critical" | "warning" | "medium";
          status?: "active" | "acknowledged" | "resolved" | "maintenance";
          description?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
        };
        Relationships: [];
      };
      system_settings: {
        Row: {
          id: number;
          flow_threshold: number;
          level_threshold: number;
          email_notifications: boolean;
          sms_notifications: boolean;
          auto_reports: boolean;
          notification_email: string;
          notification_phone: string;
          escalation_time_minutes: number;
          auto_resolve_hours: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          flow_threshold?: number;
          level_threshold?: number;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          auto_reports?: boolean;
          notification_email?: string;
          notification_phone?: string;
          escalation_time_minutes?: number;
          auto_resolve_hours?: number;
          updated_at?: string;
        };
        Update: {
          flow_threshold?: number;
          level_threshold?: number;
          email_notifications?: boolean;
          sms_notifications?: boolean;
          auto_reports?: boolean;
          notification_email?: string;
          notification_phone?: string;
          escalation_time_minutes?: number;
          auto_resolve_hours?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      ingest_sensor_reading: {
        Args: {
          p_sensor_id: string;
          p_flow_rate: number | null;
          p_water_level: number | null;
          p_battery_percent: number | null;
          p_status: "online" | "offline" | "maintenance" | null;
          p_recorded_at?: string;
        };
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
