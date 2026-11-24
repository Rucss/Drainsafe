import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Droplets, 
  Waves, 
  AlertTriangle, 
  MapPin, 
  Activity,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, Legend } from "recharts";
import { getAlerts, getRecentReadings, getSensors } from "@/lib/drainsafe-api";

const Dashboard = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { data, isPending, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [sensors, readings, alerts] = await Promise.all([
        getSensors(),
        getRecentReadings(since),
        getAlerts(),
      ]);
      return { sensors, readings, alerts };
    },
    refetchInterval: 30_000,
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const latestReading = data?.readings[data.readings.length - 1];
  const currentSensor = data?.sensors.find((sensor) => sensor.id === latestReading?.sensor_id);
  const currentSensorIsSample = currentSensor?.name.startsWith("Sample Sensor") ?? false;
  const hasSampleData = data?.sensors.some((sensor) => sensor.name.startsWith("Sample Sensor")) ?? false;
  const sensorNames = new Map((data?.sensors ?? []).map((sensor) => [sensor.id, sensor.name]));
  const flowPoints = new Map<string, Record<string, string | number>>();
  (data?.readings ?? []).forEach((reading) => {
    if (reading.flow_rate === null) return;
    const point = flowPoints.get(reading.recorded_at) ?? {
      time: new Date(reading.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    const sensorName = sensorNames.get(reading.sensor_id) ?? "Unknown sensor";
    point[sensorName] = Number(reading.flow_rate);
    flowPoints.set(reading.recorded_at, point);
  });
  const flowData = Array.from(flowPoints.values()).slice(-48);
  const flowSensors = (data?.sensors ?? []).filter((sensor) =>
    (data?.readings ?? []).some((reading) => reading.sensor_id === sensor.id && reading.flow_rate !== null)
  );
  const flowColors = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))"];
  const latestReadingsBySensor = new Map<string, { sensor_id: string; water_level: number | null }>();
  data?.readings.forEach((reading) => latestReadingsBySensor.set(reading.sensor_id, reading));
  const levelData = data?.sensors
    .map((sensor) => ({
      drain: sensor.name,
      level: latestReadingsBySensor.get(sensor.id)?.water_level,
    }))
    .filter((reading): reading is { drain: string; level: number } => reading.level !== null && reading.level !== undefined);
  const recentAlerts = (data?.alerts ?? []).slice(0, 3).map((alert) => ({
    id: alert.id,
    time: new Date(alert.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    location: data?.sensors.find((sensor) => sensor.id === alert.sensor_id)?.name ?? "Unknown sensor",
    type: alert.title,
    severity: alert.severity,
  }));
  const currentFlow = latestReading?.flow_rate;
  const currentLevel = latestReading?.water_level;
  const hasActiveAlert = data?.alerts.some((alert) => alert.status === "active") ?? false;
  const activeAlerts = (data?.alerts ?? []).filter((alert) => alert.status === "active");
  const currentSensorReadings = (data?.readings ?? [])
    .filter((reading) => reading.sensor_id === currentSensor?.id)
    .slice()
    .reverse()
    .slice(0, 10);
  const currentSensorAlerts = (data?.alerts ?? [])
    .filter((alert) => alert.sensor_id === currentSensor?.id)
    .slice(0, 5);
  const blockageStatus = hasActiveAlert ? "Attention" : hasSampleData ? "Preview" : latestReading ? "Normal" : "No data";
  const flowProgress = Math.min(100, Math.max(0, ((currentFlow ?? 0) / 15) * 100));
  const levelProgress = Math.min(100, Math.max(0, currentLevel ?? 0));

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      <main className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {isPending && <p className="mb-6 text-center text-muted-foreground">Loading sensor data…</p>}
          {error && <p role="alert" className="mb-6 text-center text-destructive">{error.message}</p>}
          {/* Header */}
          <div className="text-center mb-8 sm:mb-16 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Live Dashboard
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {hasSampleData
                ? "Preview readings are shown here. Actual sensor data appears when a device sends measurements."
                : "Real-time monitoring data from IoT sensors across the city's drainage system"}
            </p>
          </div>

          {/* Real-time Data Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {/* Water Flow Rate */}
            <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 animate-scale-in" style={{animationDelay: '0.1s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Water Flow Rate</CardTitle>
                <Droplets className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
                  {currentFlow === null || currentFlow === undefined ? "—" : `${currentFlow} L/min`}
                  {currentFlow !== null && currentFlow !== undefined && <TrendingUp className="h-4 w-4 text-success ml-2" />}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Latest recorded flow</p>
                <div className="mt-4">
                  <Progress value={flowProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Water Level */}
            <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 animate-scale-in" style={{animationDelay: '0.2s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Water Level</CardTitle>
                <Waves className="h-5 w-5 text-secondary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold text-foreground flex items-center">
                  {currentLevel === null || currentLevel === undefined ? "—" : `${currentLevel} cm`}
                  {currentLevel !== null && currentLevel !== undefined && <Minus className="h-4 w-4 text-muted-foreground ml-2" />}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Latest recorded level</p>
                <div className="mt-4">
                  <Progress value={levelProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Blockage Status */}
            <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 animate-scale-in" style={{animationDelay: '0.3s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Blockage Status</CardTitle>
                <AlertTriangle className="h-5 w-5 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button type="button" className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="Open blockage status details">
                        <Badge className={`${hasActiveAlert ? "bg-destructive text-destructive-foreground" : hasSampleData ? "bg-amber-400/15 text-amber-200" : "status-normal"} cursor-pointer text-base sm:text-lg px-3 sm:px-4 py-2`}>
                          {blockageStatus}
                        </Badge>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle>Blockage status</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="glass-card rounded-xl p-4">
                          <p className="text-sm text-muted-foreground">Current status</p>
                          <Badge className={`mt-2 ${hasActiveAlert ? "bg-destructive text-destructive-foreground" : hasSampleData ? "bg-amber-400/15 text-amber-200" : "status-normal"}`}>
                            {blockageStatus}
                          </Badge>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                          <p className="text-sm text-muted-foreground">Active alerts</p>
                          <p className="mt-1 text-2xl font-bold">{activeAlerts.length}</p>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                          <p className="text-sm text-muted-foreground">Latest water level</p>
                          <p className="mt-1 text-lg font-semibold">
                            {currentLevel === null || currentLevel === undefined ? "No reading" : `${currentLevel} cm`}
                          </p>
                        </div>
                        <div className="glass-card rounded-xl p-4">
                          <p className="text-sm text-muted-foreground">Latest flow rate</p>
                          <p className="mt-1 text-lg font-semibold">
                            {currentFlow === null || currentFlow === undefined ? "No reading" : `${currentFlow} L/min`}
                          </p>
                        </div>
                      </div>
                      {hasSampleData && (
                        <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
                          These are preview records, not live sensor measurements.
                        </p>
                      )}
                      <div className="space-y-3">
                        <h3 className="font-semibold">Active alerts</h3>
                        {activeAlerts.length > 0 ? activeAlerts.map((alert) => (
                          <div key={alert.id} className="glass-card rounded-lg p-3">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-medium">{alert.title}</p>
                              <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>{alert.severity}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {data?.sensors.find((sensor) => sensor.id === alert.sensor_id)?.name ?? "Unknown sensor"} · {new Date(alert.created_at).toLocaleString()}
                            </p>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground">
                            {hasSampleData ? "No active alerts in the sample records." : "No active alerts are currently recorded."}
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{hasActiveAlert ? "Active alerts need attention" : "Based on recorded alerts"}</p>
                <div className="flex items-center mt-4">
                  <div className={`w-3 h-3 rounded-full mr-2 ${hasSampleData ? "bg-amber-400" : "bg-success pulse-glow"}`}></div>
                  <span className={`text-xs ${hasSampleData ? "text-amber-200" : "text-success"}`}>
                    {hasSampleData ? "Sample Data" : "System Active"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Sensor Location */}
            <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 animate-scale-in" style={{animationDelay: '0.4s'}}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sensor Location</CardTitle>
                <MapPin className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-foreground mb-2">{currentSensor?.name ?? "No recent sensor reading"}</div>
                <p className="text-xs text-muted-foreground break-all">
                  {currentSensor?.location ?? "Waiting for sensor data"}
                </p>
                {currentSensor?.latitude !== null && currentSensor?.latitude !== undefined && currentSensor.longitude !== null && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    GPS: {currentSensor.latitude}, {currentSensor.longitude}
                  </p>
                )}
                <div className="flex items-center mt-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        disabled={!currentSensor}
                        className="inline-flex items-center rounded-md text-xs text-primary transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label={`View readings for ${currentSensor?.name ?? "sensor location"}`}
                      >
                        <Activity className="h-4 w-4 mr-2 pulse-glow" />
                        {currentSensorIsSample ? "Preview data" : "View location data"}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>{currentSensor?.name ?? "Sensor location"}</DialogTitle>
                        <DialogDescription>
                          {currentSensor?.location ?? "Location details are unavailable."}
                        </DialogDescription>
                      </DialogHeader>
                      {currentSensor && (
                        <div className="space-y-5">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="glass-card rounded-xl p-4">
                              <p className="text-sm text-muted-foreground">Sensor status</p>
                              <p className="mt-1 font-semibold capitalize">{currentSensor.status}</p>
                            </div>
                            <div className="glass-card rounded-xl p-4">
                              <p className="text-sm text-muted-foreground">Battery</p>
                              <p className="mt-1 font-semibold">
                                {currentSensor.battery_percent === null ? "—" : `${currentSensor.battery_percent}%`}
                              </p>
                            </div>
                            <div className="glass-card rounded-xl p-4">
                              <p className="text-sm text-muted-foreground">Latest flow</p>
                              <p className="mt-1 font-semibold">
                                {currentSensorReadings[0]?.flow_rate === null || currentSensorReadings[0]?.flow_rate === undefined
                                  ? "—"
                                  : `${currentSensorReadings[0].flow_rate} L/min`}
                              </p>
                            </div>
                            <div className="glass-card rounded-xl p-4">
                              <p className="text-sm text-muted-foreground">Latest water level</p>
                              <p className="mt-1 font-semibold">
                                {currentSensorReadings[0]?.water_level === null || currentSensorReadings[0]?.water_level === undefined
                                  ? "—"
                                  : `${currentSensorReadings[0].water_level} cm`}
                              </p>
                            </div>
                          </div>
                          {currentSensorIsSample && (
                            <p className="rounded-lg border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
                              Sample preview readings; this is not a live sensor.
                            </p>
                          )}
                          <div className="space-y-2">
                            <h3 className="font-semibold">Recent readings</h3>
                            {currentSensorReadings.length > 0 ? (
                              <div className="max-h-56 space-y-2 overflow-y-auto">
                                {currentSensorReadings.map((reading) => (
                                  <div key={reading.id} className="glass-card grid grid-cols-3 gap-2 rounded-lg p-3 text-sm">
                                    <span className="text-muted-foreground">{new Date(reading.recorded_at).toLocaleString()}</span>
                                    <span>{reading.flow_rate === null ? "—" : `${reading.flow_rate} L/min`}</span>
                                    <span>{reading.water_level === null ? "—" : `${reading.water_level} cm`}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No readings are recorded for this location yet.</p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <h3 className="font-semibold">Recent alerts for this location</h3>
                            {currentSensorAlerts.length > 0 ? currentSensorAlerts.map((alert) => (
                              <div key={alert.id} className="glass-card rounded-lg p-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="font-medium">{alert.title}</p>
                                  <Badge className="capitalize">{alert.status}</Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{new Date(alert.created_at).toLocaleString()}</p>
                              </div>
                            )) : (
                              <p className="text-sm text-muted-foreground">No alerts are recorded for this location.</p>
                            )}
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Flow Chart */}
            <Card className="glass-card border-glass-border animate-fade-in" style={{animationDelay: '0.5s'}}>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
                  <TrendingUp className="h-5 w-5 text-primary mr-2" />
                  Water Flow Rate (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={flowData}>
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--glass))",
                          border: "1px solid hsl(var(--glass-border))",
                          borderRadius: "8px",
                          backdropFilter: "blur(20px)"
                        }}
                      />
                      <Legend />
                      {flowSensors.map((sensor, index) => (
                        <Line
                          key={sensor.id}
                          type="monotone"
                          dataKey={sensor.name}
                          stroke={flowColors[index % flowColors.length]}
                          strokeWidth={3}
                          dot={{ fill: flowColors[index % flowColors.length], strokeWidth: 2, r: 3 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Level Chart */}
            <Card className="glass-card border-glass-border animate-fade-in" style={{animationDelay: '0.6s'}}>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
                  <Waves className="h-5 w-5 text-secondary mr-2" />
                  Water Levels by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelData}>
                      <XAxis dataKey="drain" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: "hsl(var(--glass))",
                          border: "1px solid hsl(var(--glass-border))",
                          borderRadius: "8px",
                          backdropFilter: "blur(20px)"
                        }}
                      />
                      <Bar 
                        dataKey="level" 
                        fill="hsl(var(--secondary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Alerts */}
          <Card className="glass-card border-glass-border animate-fade-in" style={{animationDelay: '0.7s'}}>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
                <AlertTriangle className="h-5 w-5 text-warning mr-2" />
                Recent Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
                {recentAlerts.map((alert, index) => (
                  <div 
                    key={alert.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 glass-card rounded-lg hover:shadow-glow transition-all duration-300 animate-scale-in space-y-2 sm:space-y-0"
                    style={{animationDelay: `${0.8 + index * 0.1}s`}}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        alert.severity === 'critical' ? 'bg-destructive pulse-glow' : 'bg-warning pulse-glow'
                      }`}></div>
                      <div>
                        <div className="font-medium text-foreground">{alert.type}</div>
                        <div className="text-sm text-muted-foreground">{alert.time} | {alert.location}</div>
                      </div>
                    </div>
                    <Badge 
                      variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                      className="capitalize self-start sm:self-auto"
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                {!isPending && recentAlerts.length === 0 && (
                  <p className="text-sm text-muted-foreground">No alerts have been recorded.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;