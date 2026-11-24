create extension if not exists pgcrypto;

create table if not exists public.sensor_nodes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  latitude double precision,
  longitude double precision,
  status text not null default 'offline'
    check (status in ('online', 'offline', 'maintenance')),
  battery_percent smallint
    check (battery_percent between 0 and 100),
  sensor_type text not null default 'Flow + Level',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sensor_readings (
  id uuid primary key default gen_random_uuid(),
  sensor_id uuid not null references public.sensor_nodes(id) on delete cascade,
  flow_rate numeric,
  water_level numeric,
  recorded_at timestamptz not null default now(),
  check (flow_rate is null or flow_rate >= 0),
  check (water_level is null or water_level >= 0)
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  sensor_id uuid references public.sensor_nodes(id) on delete set null,
  title text not null,
  severity text not null check (severity in ('critical', 'warning', 'medium')),
  status text not null default 'active'
    check (status in ('active', 'acknowledged', 'resolved', 'maintenance')),
  description text not null default '',
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  resolved_at timestamptz
);

create table if not exists public.system_settings (
  id smallint primary key default 1 check (id = 1),
  flow_threshold numeric not null default 5.0,
  level_threshold numeric not null default 70,
  email_notifications boolean not null default true,
  sms_notifications boolean not null default false,
  auto_reports boolean not null default true,
  notification_email text not null default '',
  notification_phone text not null default '',
  escalation_time_minutes integer not null default 15,
  auto_resolve_hours integer not null default 24,
  updated_at timestamptz not null default now()
);

insert into public.system_settings (id)
values (1)
on conflict (id) do nothing;

create index if not exists sensor_readings_sensor_recorded_idx
  on public.sensor_readings (sensor_id, recorded_at desc);
create index if not exists alerts_created_at_idx
  on public.alerts (created_at desc);
create index if not exists alerts_status_idx
  on public.alerts (status);

alter table public.sensor_nodes enable row level security;
alter table public.sensor_readings enable row level security;
alter table public.alerts enable row level security;
alter table public.system_settings enable row level security;

drop policy if exists "Authenticated users can manage sensor nodes" on public.sensor_nodes;
create policy "Authenticated users can manage sensor nodes"
  on public.sensor_nodes for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated users can manage sensor readings" on public.sensor_readings;
create policy "Authenticated users can manage sensor readings"
  on public.sensor_readings for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated users can manage alerts" on public.alerts;
create policy "Authenticated users can manage alerts"
  on public.alerts for all to authenticated
  using (true) with check (true);

drop policy if exists "Authenticated users can manage system settings" on public.system_settings;
create policy "Authenticated users can manage system settings"
  on public.system_settings for all to authenticated
  using (true) with check (true);

grant usage on schema public to authenticated;
grant select, insert, update, delete
  on table public.sensor_nodes, public.sensor_readings, public.alerts, public.system_settings
  to authenticated;

create or replace function public.ingest_sensor_reading(
  p_sensor_id uuid,
  p_flow_rate numeric,
  p_water_level numeric,
  p_battery_percent smallint,
  p_status text,
  p_recorded_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  reading_id uuid;
begin
  if p_flow_rate is null and p_water_level is null then
    raise exception 'At least one sensor measurement is required'
      using errcode = '22023';
  end if;

  if p_flow_rate is not null and p_flow_rate < 0 then
    raise exception 'Flow rate must be non-negative'
      using errcode = '22023';
  end if;

  if p_water_level is not null and p_water_level < 0 then
    raise exception 'Water level must be non-negative'
      using errcode = '22023';
  end if;

  if p_battery_percent is not null and p_battery_percent not between 0 and 100 then
    raise exception 'Battery percentage must be between 0 and 100'
      using errcode = '22023';
  end if;

  if p_status is not null and p_status not in ('online', 'offline', 'maintenance') then
    raise exception 'Invalid sensor status'
      using errcode = '22023';
  end if;

  update public.sensor_nodes
  set battery_percent = coalesce(p_battery_percent, battery_percent),
      status = coalesce(p_status, status),
      updated_at = now()
  where id = p_sensor_id;

  if not found then
    raise exception 'Sensor not found'
      using errcode = 'P0002';
  end if;

  insert into public.sensor_readings (
    sensor_id,
    flow_rate,
    water_level,
    recorded_at
  )
  values (
    p_sensor_id,
    p_flow_rate,
    p_water_level,
    coalesce(p_recorded_at, now())
  )
  returning id into reading_id;

  return reading_id;
end;
$function$;

revoke all on function public.ingest_sensor_reading(uuid, numeric, numeric, smallint, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.ingest_sensor_reading(uuid, numeric, numeric, smallint, text, timestamptz)
  to service_role;

insert into public.sensor_nodes (
  id,
  name,
  location,
  latitude,
  longitude,
  status,
  battery_percent,
  sensor_type
)
values
  ('00000000-0000-4000-8000-000000000001', 'Sample Sensor 01', 'Sample Site 01, Mumbai, Maharashtra, India', 19.0760, 72.8777, 'maintenance', 84, 'Sample flow + level'),
  ('00000000-0000-4000-8000-000000000002', 'Sample Sensor 02', 'Sample Site 02, Bengaluru, Karnataka, India', 12.9716, 77.5946, 'maintenance', 67, 'Sample flow + level'),
  ('00000000-0000-4000-8000-000000000003', 'Sample Sensor 03', 'Sample Site 03, Chennai, Tamil Nadu, India', 13.0827, 80.2707, 'maintenance', 92, 'Sample flow + level')
on conflict (id) do update
set name = excluded.name,
    location = excluded.location,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    status = excluded.status,
    battery_percent = excluded.battery_percent,
    sensor_type = excluded.sensor_type,
    updated_at = now();

with sample_sensors (sensor_id, flow_base, level_base, flow_step, level_step) as (
  values
    ('00000000-0000-4000-8000-000000000001'::uuid, 4.2::numeric, 31::numeric, 2, 5),
    ('00000000-0000-4000-8000-000000000002'::uuid, 6.1::numeric, 43::numeric, 3, 7),
    ('00000000-0000-4000-8000-000000000003'::uuid, 3.4::numeric, 54::numeric, 4, 9)
),
sample_readings as (
  select
    sensor_id,
    flow_base,
    level_base,
    flow_step,
    level_step,
    sample_index
  from sample_sensors
  cross join generate_series(0, 14) as samples(sample_index)
)
insert into public.sensor_readings (
  id,
  sensor_id,
  flow_rate,
  water_level,
  recorded_at
)
select
  md5(sensor_id::text || '-sample-reading-' || sample_index::text)::uuid,
  sensor_id,
  round(flow_base + mod(sample_index * flow_step, 7)::numeric * 0.35, 2),
  level_base + mod(sample_index * level_step, 36),
  now() - ((14 - sample_index) * interval '90 minutes')
from sample_readings
on conflict (id) do update
set flow_rate = excluded.flow_rate,
    water_level = excluded.water_level,
    recorded_at = excluded.recorded_at;

insert into public.alerts (
  id,
  sensor_id,
  title,
  severity,
  status,
  description,
  created_at,
  acknowledged_at,
  resolved_at
)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Sample: Elevated water level', 'critical', 'active', 'Preview-only simulated elevated water level alert for Sample Sensor 01.', now() - interval '45 minutes', null, null),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000002', 'Sample: Flow variation', 'medium', 'resolved', 'Preview alert record for Sample Sensor 02.', now() - interval '2 hours', null, now() - interval '90 minutes'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000003', 'Sample: Sensor inspection', 'medium', 'acknowledged', 'Preview alert record for Sample Sensor 03.', now() - interval '3 hours', now() - interval '2 hours', null),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Sample: Possible blockage', 'critical', 'active', 'Preview-only simulated low flow alert indicating a possible blockage at Sample Sensor 01.', now() - interval '5 hours', null, null),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000002', 'Sample: Water level check', 'warning', 'resolved', 'Preview alert record for Sample Sensor 02.', now() - interval '7 hours', null, now() - interval '6 hours')
on conflict (id) do update
set sensor_id = excluded.sensor_id,
    title = excluded.title,
    severity = excluded.severity,
    status = excluded.status,
    description = excluded.description,
    created_at = excluded.created_at,
    acknowledged_at = excluded.acknowledged_at,
    resolved_at = excluded.resolved_at;
