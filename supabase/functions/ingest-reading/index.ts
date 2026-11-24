import { createClient } from "npm:@supabase/supabase-js@2";

type NormalizedReading = {
  sensor_id: string;
  flow_rate: number | null;
  water_level: number | null;
  battery_percent: number | null;
  status: "online" | "offline" | "maintenance" | null;
  recorded_at: string;
};

const jsonHeaders = { "Content-Type": "application/json" };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: jsonHeaders });
}

function hasValidKey(supplied: string, expected: string) {
  const encoder = new TextEncoder();
  const suppliedBytes = encoder.encode(supplied);
  const expectedBytes = encoder.encode(expected);
  let mismatch = suppliedBytes.length ^ expectedBytes.length;
  const length = Math.max(suppliedBytes.length, expectedBytes.length);

  for (let index = 0; index < length; index += 1) {
    mismatch |= (suppliedBytes[index] ?? 0) ^ (expectedBytes[index] ?? 0);
  }

  return mismatch === 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function validateReading(value: unknown): { data: NormalizedReading } | { error: string } {
  if (!isObject(value) || typeof value.sensor_id !== "string" || !uuidPattern.test(value.sensor_id)) {
    return { error: "A valid sensor_id UUID is required" };
  }

  const flowRate = value.flow_rate;
  const waterLevel = value.water_level;
  if (flowRate != null && !isNonNegativeNumber(flowRate)) {
    return { error: "flow_rate must be a non-negative number" };
  }
  if (waterLevel != null && !isNonNegativeNumber(waterLevel)) {
    return { error: "water_level must be a non-negative number" };
  }
  if (flowRate == null && waterLevel == null) {
    return { error: "Provide at least one of flow_rate or water_level" };
  }

  const batteryPercent = value.battery_percent;
  if (
    batteryPercent != null
    && (typeof batteryPercent !== "number" || !Number.isInteger(batteryPercent) || batteryPercent < 0 || batteryPercent > 100)
  ) {
    return { error: "battery_percent must be an integer from 0 to 100" };
  }

  const status = value.status;
  if (
    status != null
    && status !== "online"
    && status !== "offline"
    && status !== "maintenance"
  ) {
    return { error: "status must be online, offline, or maintenance" };
  }

  let recordedAt: string;
  if (value.recorded_at === undefined) {
    recordedAt = new Date().toISOString();
  } else if (typeof value.recorded_at === "string" && !Number.isNaN(Date.parse(value.recorded_at))) {
    recordedAt = new Date(value.recorded_at).toISOString();
  } else {
    return { error: "recorded_at must be a valid date string" };
  }

  return {
    data: {
      sensor_id: value.sensor_id,
      flow_rate: flowRate ?? null,
      water_level: waterLevel ?? null,
      battery_percent: batteryPercent ?? null,
      status: status ?? null,
      recorded_at: recordedAt,
    },
  };
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  const ingestKey = Deno.env.get("INGEST_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!ingestKey || ingestKey.length < 32 || !supabaseUrl || !serviceRoleKey) {
    console.error("Sensor ingestion function is missing required secrets.");
    return jsonResponse(500, { error: "Sensor ingestion is not configured" });
  }

  const suppliedKey = request.headers.get("x-ingest-key") ?? "";
  if (!hasValidKey(suppliedKey, ingestKey)) {
    return jsonResponse(401, { error: "Unauthorized" });
  }

  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse(415, { error: "Content-Type must be application/json" });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: "Request body must be valid JSON" });
  }

  const validated = validateReading(payload);
  if ("error" in validated) return jsonResponse(400, { error: validated.error });
  const reading = validated.data;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: readingId, error } = await supabase.rpc("ingest_sensor_reading", {
    p_sensor_id: reading.sensor_id,
    p_flow_rate: reading.flow_rate,
    p_water_level: reading.water_level,
    p_battery_percent: reading.battery_percent,
    p_status: reading.status,
    p_recorded_at: reading.recorded_at,
  });

  if (error) {
    console.error("Sensor reading insert failed:", error);
    return error.code === "P0002"
      ? jsonResponse(404, { error: "Sensor not found" })
      : jsonResponse(500, { error: "Could not save sensor reading" });
  }

  return jsonResponse(201, { id: readingId, sensor_id: reading.sensor_id, recorded_at: reading.recorded_at });
});
