import { useState, useEffect, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Activity,
  Bell,
  Shield,
  Users,
  Wifi,
  Battery,
  AlertTriangle
} from "lucide-react";
import {
  createSensor,
  deleteSensor,
  getSensors,
  getSystemSettings,
  saveSystemSettings,
  updateSensor,
} from "@/lib/drainsafe-api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Database } from "@/lib/database.types";

type SensorRow = Database["public"]["Tables"]["sensor_nodes"]["Row"];
type SensorStatus = SensorRow["status"];
type SensorFormInput = Omit<Database["public"]["Tables"]["sensor_nodes"]["Insert"], "id" | "created_at" | "updated_at">;

const Settings = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [flowThreshold, setFlowThreshold] = useState([5.0]);
  const [levelThreshold, setLevelThreshold] = useState([70]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoReports, setAutoReports] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notificationPhone, setNotificationPhone] = useState("");
  const [escalationTime, setEscalationTime] = useState(15);
  const [autoResolveTime, setAutoResolveTime] = useState(24);
  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<SensorRow | null>(null);
  const [sensorForm, setSensorForm] = useState({
    name: "",
    location: "",
    sensor_type: "Flow + Level",
    status: "offline" as SensorStatus,
    battery_percent: "",
    latitude: "",
    longitude: "",
  });
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const [sensors, settings] = await Promise.all([getSensors(), getSystemSettings()]);
      return { sensors, settings };
    },
  });
  const saveMutation = useMutation({
    mutationFn: saveSystemSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved.");
    },
    onError: (saveError) => toast.error(saveError.message),
  });
  const sensorMutation = useMutation({
    mutationFn: ({ id, sensor }: { id: string | null; sensor: SensorFormInput }) =>
      id ? updateSensor(id, sensor) : createSensor(sensor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      setSensorDialogOpen(false);
      toast.success(editingSensor ? "Sensor updated." : "Sensor added.");
    },
    onError: (sensorError) => toast.error(sensorError.message),
  });
  const deleteSensorMutation = useMutation({
    mutationFn: deleteSensor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Sensor deleted.");
    },
    onError: (sensorError) => toast.error(sensorError.message),
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    if (!data?.settings) return;
    setFlowThreshold([data.settings.flow_threshold]);
    setLevelThreshold([data.settings.level_threshold]);
    setEmailNotifications(data.settings.email_notifications);
    setSmsNotifications(data.settings.sms_notifications);
    setAutoReports(data.settings.auto_reports);
    setNotificationEmail(data.settings.notification_email);
    setNotificationPhone(data.settings.notification_phone);
    setEscalationTime(data.settings.escalation_time_minutes);
    setAutoResolveTime(data.settings.auto_resolve_hours);
  }, [data?.settings]);

  const openSensorDialog = (sensor?: SensorRow) => {
    setEditingSensor(sensor ?? null);
    setSensorForm({
      name: sensor?.name ?? "",
      location: sensor?.location ?? "",
      sensor_type: sensor?.sensor_type ?? "Flow + Level",
      status: sensor?.status ?? "offline",
      battery_percent: sensor?.battery_percent?.toString() ?? "",
      latitude: sensor?.latitude?.toString() ?? "",
      longitude: sensor?.longitude?.toString() ?? "",
    });
    setSensorDialogOpen(true);
  };

  const handleSensorSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sensorMutation.mutate({
      id: editingSensor?.id ?? null,
      sensor: {
        name: sensorForm.name.trim(),
        location: sensorForm.location.trim(),
        sensor_type: sensorForm.sensor_type.trim(),
        status: sensorForm.status,
        battery_percent: sensorForm.battery_percent === "" ? null : Number(sensorForm.battery_percent),
        latitude: sensorForm.latitude === "" ? null : Number(sensorForm.latitude),
        longitude: sensorForm.longitude === "" ? null : Number(sensorForm.longitude),
      },
    });
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-success text-success-foreground';
      case 'offline': return 'bg-destructive text-destructive-foreground';
      case 'maintenance': return 'bg-warning text-warning-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-success';
    if (level > 20) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      <main className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {isPending && <p className="mb-6 text-center text-muted-foreground">Loading settings…</p>}
          {error && <p role="alert" className="mb-6 text-center text-destructive">{error.message}</p>}
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              System Settings
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Configure sensors, thresholds, notifications, and user permissions
            </p>
          </div>

          <Tabs defaultValue="sensors" className="space-y-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 glass-card border-glass-border">
              <TabsTrigger value="sensors" className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Sensors</span>
              </TabsTrigger>
              <TabsTrigger value="thresholds" className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Thresholds</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            </TabsList>

            {/* Sensor Management */}
            <TabsContent value="sensors" className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Sensor Nodes</h3>
                <Button className="bg-gradient-primary hover:shadow-glow" onClick={() => openSensorDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Sensor
                </Button>
              </div>

              <div className="grid gap-4 sm:gap-6">
                {(data?.sensors ?? []).map((sensor, index) => (
                  <Card key={sensor.id} className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 animate-scale-in" style={{animationDelay: `${0.1 + index * 0.1}s`}}>
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                        <div className="flex items-start space-x-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-foreground">{sensor.name}</h4>
                              <Badge className={getSensorStatusColor(sensor.status)}>
                                {sensor.status}
                              </Badge>
                              <Badge variant="outline">
                                {sensor.sensor_type}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground break-all">{sensor.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Battery className={`w-4 h-4 flex-shrink-0 ${getBatteryColor(sensor.battery_percent ?? 0)}`} />
                                <span className="text-foreground">{sensor.battery_percent ?? "—"}% Battery</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Wifi className="w-4 h-4 text-success flex-shrink-0" />
                                <span className="text-foreground">Updated: {new Date(sensor.updated_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 lg:ml-4">
                          <Button size="sm" variant="outline" className="glass-card border-glass-border" onClick={() => openSensorDialog(sensor)} aria-label={`Edit ${sensor.name}`}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="glass-card border-glass-border text-destructive hover:text-destructive"
                            aria-label={`Delete ${sensor.name}`}
                            onClick={() => {
                              if (window.confirm(`Delete ${sensor.name}? Its stored readings will also be deleted.`)) {
                                deleteSensorMutation.mutate(sensor.id);
                              }
                            }}
                            disabled={deleteSensorMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {!isPending && data?.sensors.length === 0 && (
                  <p className="text-muted-foreground">No sensor nodes are registered yet.</p>
                )}
              </div>
            </TabsContent>

            {/* Threshold Settings */}
            <TabsContent value="thresholds" className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Alert Thresholds</h3>
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.1s'}}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Water Flow Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        Minimum Flow Rate Alert: {flowThreshold[0]} L/min
                      </Label>
                      <Slider
                        value={flowThreshold}
                        onValueChange={setFlowThreshold}
                        max={15}
                        min={1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>1 L/min</span>
                        <span>15 L/min</span>
                      </div>
                    </div>
                    
                    <div className="p-4 glass-card rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Alert will trigger when flow rate drops below this threshold, 
                        indicating potential blockage.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.2s'}}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Water Level</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label className="text-base font-medium mb-4 block">
                        Maximum Water Level Alert: {levelThreshold[0]} cm
                      </Label>
                      <Slider
                        value={levelThreshold}
                        onValueChange={setLevelThreshold}
                        max={100}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>10 cm</span>
                        <span>100 cm</span>
                      </div>
                    </div>
                    
                    <div className="p-4 glass-card rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Alert will trigger when water level rises above this threshold, 
                        indicating potential overflow risk.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="glass-card border-glass-border animate-fade-in" style={{animationDelay: '0.3s'}}>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Response Time Settings</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="escalation-time">Alert Escalation Time (minutes)</Label>
                    <Input
                      id="escalation-time"
                      type="number"
                      value={escalationTime}
                      onChange={(event) => setEscalationTime(Number(event.target.value))}
                      className="glass-card border-glass-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="auto-resolve">Auto-resolve Time (hours)</Label>
                    <Input
                      id="auto-resolve"
                      type="number"
                      value={autoResolveTime}
                      onChange={(event) => setAutoResolveTime(Number(event.target.value))}
                      className="glass-card border-glass-border"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Notification Settings</h3>
              
              <div className="grid gap-6">
                <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.1s'}}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Alert Notifications</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive alerts via email</p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Automated Reports</Label>
                        <p className="text-sm text-muted-foreground">Generate weekly reports automatically</p>
                      </div>
                      <Switch
                        checked={autoReports}
                        onCheckedChange={setAutoReports}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.2s'}}>
                  <CardHeader>
                    <CardTitle className="text-lg sm:text-xl">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={notificationEmail}
                        onChange={(event) => setNotificationEmail(event.target.value)}
                        className="glass-card border-glass-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={notificationPhone}
                        onChange={(event) => setNotificationPhone(event.target.value)}
                        className="glass-card border-glass-border"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">DrainSafe Operations</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  The DrainSafe Operations Portal helps our team monitor drainage networks, review system alerts, and coordinate maintenance to help protect communities from flooding. For account assistance, contact your DrainSafe administrator.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Dialog open={sensorDialogOpen} onOpenChange={setSensorDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingSensor ? "Edit sensor" : "Add sensor"}</DialogTitle>
                <DialogDescription>Save sensor details to the Supabase database.</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSensorSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="sensor-name">Name</Label>
                  <Input id="sensor-name" required value={sensorForm.name} onChange={(event) => setSensorForm({ ...sensorForm, name: event.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sensor-location">Location</Label>
                  <Input id="sensor-location" required value={sensorForm.location} onChange={(event) => setSensorForm({ ...sensorForm, location: event.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sensor-type">Sensor type</Label>
                    <Input id="sensor-type" required value={sensorForm.sensor_type} onChange={(event) => setSensorForm({ ...sensorForm, sensor_type: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-status">Status</Label>
                    <select
                      id="sensor-status"
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      value={sensorForm.status}
                      onChange={(event) => {
                        const status = event.target.value;
                        if (status === "online" || status === "offline" || status === "maintenance") {
                          setSensorForm({ ...sensorForm, status });
                        }
                      }}
                    >
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="sensor-battery">Battery %</Label>
                    <Input id="sensor-battery" type="number" min="0" max="100" value={sensorForm.battery_percent} onChange={(event) => setSensorForm({ ...sensorForm, battery_percent: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-latitude">Latitude</Label>
                    <Input id="sensor-latitude" type="number" step="any" value={sensorForm.latitude} onChange={(event) => setSensorForm({ ...sensorForm, latitude: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sensor-longitude">Longitude</Label>
                    <Input id="sensor-longitude" type="number" step="any" value={sensorForm.longitude} onChange={(event) => setSensorForm({ ...sensorForm, longitude: event.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-gradient-primary" disabled={sensorMutation.isPending}>
                    {sensorMutation.isPending ? "Saving…" : "Save sensor"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-gradient-primary hover:shadow-glow"
              onClick={() => saveMutation.mutate({
                flow_threshold: flowThreshold[0],
                level_threshold: levelThreshold[0],
                email_notifications: emailNotifications,
                sms_notifications: smsNotifications,
                auto_reports: autoReports,
                notification_email: notificationEmail,
                notification_phone: notificationPhone,
                escalation_time_minutes: escalationTime,
                auto_resolve_hours: autoResolveTime,
              })}
              disabled={saveMutation.isPending || isPending || Boolean(error)}
            >
              {saveMutation.isPending ? "Saving…" : "Save Settings"}
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Settings;