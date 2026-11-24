import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings, 
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

const sensorNodes = [
  {
    id: 1,
    name: 'Main Street Sensor',
    location: '40.7128, -74.0060',
    status: 'online',
    battery: 85,
    lastUpdate: '2024-01-15 09:15:00',
    type: 'Flow + Level'
  },
  {
    id: 2,
    name: 'Park Avenue Sensor',
    location: '40.7589, -73.9851',
    status: 'online',
    battery: 72,
    lastUpdate: '2024-01-15 09:14:45',
    type: 'Level Only'
  },
  {
    id: 3,
    name: 'Commerce St Sensor',
    location: '40.7505, -73.9934',
    status: 'maintenance',
    battery: 23,
    lastUpdate: '2024-01-14 15:30:20',
    type: 'Flow + Level'
  }
];

const SettingsSection = () => {
  const [flowThreshold, setFlowThreshold] = useState([5.0]);
  const [levelThreshold, setLevelThreshold] = useState([70]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [autoReports, setAutoReports] = useState(true);

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
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            System Settings
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Configure sensors, thresholds, notifications, and user permissions
          </p>
        </div>

        <Tabs defaultValue="sensors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 glass-card border-glass-border">
            <TabsTrigger value="sensors" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Sensors</span>
            </TabsTrigger>
            <TabsTrigger value="thresholds" className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Thresholds</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Users</span>
            </TabsTrigger>
          </TabsList>

          {/* Sensor Management */}
          <TabsContent value="sensors" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-foreground">Sensor Nodes</h3>
              <Button className="bg-gradient-primary hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add New Sensor
              </Button>
            </div>

            <div className="grid gap-6">
              {sensorNodes.map((sensor) => (
                <Card key={sensor.id} className="glass-card border-glass-border hover:shadow-glow transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                          <Activity className="w-6 h-6 text-primary" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="text-lg font-semibold text-foreground">{sensor.name}</h4>
                            <Badge className={getSensorStatusColor(sensor.status)}>
                              {sensor.status}
                            </Badge>
                            <Badge variant="outline">
                              {sensor.type}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground">{sensor.location}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Battery className={`w-4 h-4 ${getBatteryColor(sensor.battery)}`} />
                              <span className="text-foreground">{sensor.battery}% Battery</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Wifi className="w-4 h-4 text-success" />
                              <span className="text-foreground">Last: {sensor.lastUpdate}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="glass-card border-glass-border">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="glass-card border-glass-border text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Threshold Settings */}
          <TabsContent value="thresholds" className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">Alert Thresholds</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle>Water Flow Rate</CardTitle>
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

              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle>Water Level</CardTitle>
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

            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle>Response Time Settings</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="escalation-time">Alert Escalation Time (minutes)</Label>
                  <Input
                    id="escalation-time"
                    type="number"
                    defaultValue="15"
                    className="glass-card border-glass-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="auto-resolve">Auto-resolve Time (hours)</Label>
                  <Input
                    id="auto-resolve"
                    type="number"
                    defaultValue="24"
                    className="glass-card border-glass-border"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">Notification Settings</h3>
            
            <div className="grid gap-6">
              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle>Alert Notifications</CardTitle>
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

              <Card className="glass-card border-glass-border">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="admin@drainsafe.com"
                      className="glass-card border-glass-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      className="glass-card border-glass-border"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Management */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-semibold text-foreground">User Management</h3>
              <Button className="bg-gradient-primary hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            <Card className="glass-card border-glass-border">
              <CardHeader>
                <CardTitle>System Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Admin User', 'Operator', 'Maintenance Team'].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-4 glass-card rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user}</p>
                          <p className="text-sm text-muted-foreground">
                            {index === 0 ? 'Full Access' : index === 1 ? 'Monitor & Respond' : 'Maintenance Only'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={index === 0 ? 'bg-success text-success-foreground' : 'bg-primary text-primary-foreground'}>
                          {index === 0 ? 'Admin' : index === 1 ? 'Operator' : 'Technician'}
                        </Badge>
                        <Button size="sm" variant="outline" className="glass-card border-glass-border">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default SettingsSection;