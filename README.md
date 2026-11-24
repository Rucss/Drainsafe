# DrainSafe

DrainSafe monitors drainage sensor nodes, measurements, and alerts.

## Local development

Install dependencies and run the Vite development server:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` using the project URL and public publishable/anon key from Supabase. Never use a Supabase secret or service-role key in the browser.

## Supabase setup

1. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
2. Enable public sign-ups in Supabase Authentication settings if users should register from the website.
3. Configure the app's Supabase environment variables as above.
4. Add your local and deployed URLs to Supabase Authentication's redirect URL allow-list. Password reset links return to `/reset-password`.

Row-level security restricts the application tables to authenticated users. All signed-in users currently have the same access to sensor nodes, readings, alerts, and settings. With public sign-ups enabled, anyone who registers can access and modify this project data. Sensor nodes and system settings can be managed in the app. Alerts and readings are stored in Supabase; the dashboard refreshes its data every 30 seconds.

If an existing project reports `permission denied for table sensor_nodes`, run the updated `supabase/schema.sql` again. It grants the authenticated role the SQL table privileges required in addition to the row-level security policies.

The schema seeds three clearly labeled sample sensors in Mumbai, Bengaluru, and Chennai, 15 generated readings per sensor, and five sample alerts so the dashboard and alert page have preview data. These are not live measurements. The seed is safe to rerun and refreshes the sample timestamps; replace the samples with readings from your own devices before using the dashboard for real monitoring.

Users who cannot sign in can use **Forgot password?** on the login page to request a reset email and set a new password.
Registration and login use email/password with Supabase Auth. Gmail addresses work as email addresses; Google OAuth is not enabled.

## Sensor data ingestion

The `ingest-reading` Supabase Edge Function validates sensor payloads and inserts readings through a database function. The Supabase service-role key remains server-side.

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli), sign in, and link this folder to your project:
   ```powershell
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   ```
2. Generate an ingestion key in PowerShell and set it as a Supabase Function secret:
   ```powershell
   $ingestKey = node -p "require('node:crypto').randomBytes(32).toString('hex')"
   supabase secrets set "INGEST_API_KEY=$ingestKey"
   ```
   Keep this key in a trusted gateway/backend only. Do not put it in `VITE_` variables or browser code.
3. Deploy the function:
   ```powershell
   supabase functions deploy ingest-reading
   ```
4. Create a sensor in the website and get its UUID from the `sensor_nodes` table. Send a test reading from PowerShell:
   ```powershell
   $projectRef = "YOUR_PROJECT_REF"
   $body = @{
     sensor_id = "YOUR_SENSOR_UUID"
     flow_rate = 7.8
     water_level = 55
     battery_percent = 85
     status = "online"
   } | ConvertTo-Json

   Invoke-RestMethod -Method Post `
     -Uri "https://$projectRef.supabase.co/functions/v1/ingest-reading" `
     -Headers @{ "x-ingest-key" = $ingestKey } `
     -ContentType "application/json" `
     -Body $body
   ```

At least one of `flow_rate` or `water_level` is required. `battery_percent`, `status`, and an ISO `recorded_at` timestamp are optional. Successful readings appear in the dashboard on its next refresh. For production, authenticate devices individually at a trusted gateway rather than embedding the shared ingestion key in exposed hardware.

## Deploying on Vercel

Import the repository into Vercel. Use the Vite framework preset, `npm run build` as the build command, and `dist` as the output directory. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the Vercel project environment variables, then deploy. Keep `INGEST_API_KEY` in Supabase Function secrets, not in Vercel's `VITE_` variables. Add the deployed site URL to Supabase Authentication's site/redirect URL settings.
