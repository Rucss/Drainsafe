import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Activity, AlertTriangle, Droplets } from "lucide-react";
import { getAlerts, getRecentReadings, getSensors } from "@/lib/drainsafe-api";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((field) => `"${field.replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const Reports = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const [sensors, readings, alerts] = await Promise.all([
        getSensors(),
        getRecentReadings(since),
        getAlerts(),
      ]);
      return { sensors, readings, alerts };
    },
  });

  useEffect(() => setIsVisible(true), []);

  const exportReadings = () => {
    if (!data) return;
    const sensorNames = new Map(data.sensors.map((sensor) => [sensor.id, sensor.name]));
    downloadCsv("drainsafe-sensor-readings.csv", [
      ["Recorded at", "Sensor", "Flow rate (L/min)", "Water level (cm)"],
      ...data.readings.map((reading) => [
        reading.recorded_at,
        sensorNames.get(reading.sensor_id) ?? reading.sensor_id,
        reading.flow_rate?.toString() ?? "",
        reading.water_level?.toString() ?? "",
      ]),
    ]);
  };

  const exportAlerts = () => {
    if (!data) return;
    const sensorNames = new Map(data.sensors.map((sensor) => [sensor.id, sensor.name]));
    downloadCsv("drainsafe-alerts.csv", [
      ["Created at", "Sensor", "Title", "Severity", "Status", "Description"],
      ...data.alerts.map((alert) => [
        alert.created_at,
        alert.sensor_id ? sensorNames.get(alert.sensor_id) ?? alert.sensor_id : "",
        alert.title,
        alert.severity,
        alert.status,
        alert.description,
      ]),
    ]);
  };

  const onlineCount = data?.sensors.filter((sensor) => sensor.status === "online").length ?? 0;
  const activeAlerts = data?.alerts.filter((alert) => alert.status === "active").length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      <main className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reports & Analytics
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Export reports generated from your stored sensor readings and alerts
            </p>
          </div>

          {isPending && <p className="mb-6 text-center text-muted-foreground">Loading report data…</p>}
          {error && <p role="alert" className="mb-6 text-center text-destructive">{error.message}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {[
              { label: "Registered Sensors", value: data?.sensors.length ?? 0, icon: Activity },
              { label: "Sensors Online", value: onlineCount, icon: Activity },
              { label: "Readings (30 days)", value: data?.readings.length ?? 0, icon: Droplets },
              { label: "Active Alerts", value: activeAlerts, icon: AlertTriangle },
            ].map((metric) => (
              <Card key={metric.label} className="glass-card border-glass-border">
                <CardContent className="p-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <p className="text-2xl font-bold text-foreground">{isPending ? "—" : metric.value}</p>
                  </div>
                  <metric.icon className="w-6 h-6 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <FileText className="w-5 h-5 mr-2" />
                Data exports
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="glass-card rounded-lg p-5 space-y-3">
                <h2 className="font-semibold">Sensor readings</h2>
                <p className="text-sm text-muted-foreground">
                  Export readings from the last 30 days, including sensor, timestamp, flow, and water level.
                </p>
                <Button onClick={exportReadings} disabled={isPending || !data?.readings.length}>
                  <Download className="w-4 h-4 mr-2" /> Download CSV
                </Button>
              </div>
              <div className="glass-card rounded-lg p-5 space-y-3">
                <h2 className="font-semibold">Alert history</h2>
                <p className="text-sm text-muted-foreground">
                  Export recorded alerts with sensor, severity, status, and description.
                </p>
                <Button onClick={exportAlerts} disabled={isPending || !data?.alerts.length}>
                  <Download className="w-4 h-4 mr-2" /> Download CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
