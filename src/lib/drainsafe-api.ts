import { requireSupabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type SensorInsert = Database["public"]["Tables"]["sensor_nodes"]["Insert"];
type SensorUpdate = Database["public"]["Tables"]["sensor_nodes"]["Update"];

export async function getSensors() {
  const { data, error } = await requireSupabase()
    .from("sensor_nodes")
    .select("*")
    .order("name");

  if (error) throw error;
  return data;
}

export async function createSensor(sensor: SensorInsert) {
  const { data, error } = await requireSupabase()
    .from("sensor_nodes")
    .insert(sensor)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSensor(id: string, sensor: SensorUpdate) {
  const { data, error } = await requireSupabase()
    .from("sensor_nodes")
    .update({ ...sensor, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSensor(id: string) {
  const { error } = await requireSupabase()
    .from("sensor_nodes")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getRecentReadings(since: string) {
  const { data, error } = await requireSupabase()
    .from("sensor_readings")
    .select("*")
    .gte("recorded_at", since)
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAlerts() {
  const { data, error } = await requireSupabase()
    .from("alerts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) throw error;
  return data;
}

export async function updateAlertStatus(
  id: string,
  status: "acknowledged" | "resolved"
) {
  const now = new Date().toISOString();
  const { data, error } = await requireSupabase()
    .from("alerts")
    .update({
      status,
      acknowledged_at: status === "acknowledged" ? now : undefined,
      resolved_at: status === "resolved" ? now : undefined,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSystemSettings() {
  const { data, error } = await requireSupabase()
    .from("system_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw error;
  return data;
}

export async function saveSystemSettings(
  settings: {
    flow_threshold: number;
    level_threshold: number;
    email_notifications: boolean;
    sms_notifications: boolean;
    auto_reports: boolean;
    notification_email: string;
    notification_phone: string;
    escalation_time_minutes: number;
    auto_resolve_hours: number;
  }
) {
  const { data, error } = await requireSupabase()
    .from("system_settings")
    .upsert({ id: 1, ...settings, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}
