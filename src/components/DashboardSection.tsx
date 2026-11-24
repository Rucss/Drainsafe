import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";

// Mock real-time data
const flowData = [
  { time: '00:00', flow: 5.2 },
  { time: '04:00', flow: 3.8 },
  { time: '08:00', flow: 7.4 },
  { time: '12:00', flow: 8.9 },
  { time: '16:00', flow: 6.1 },
  { time: '20:00', flow: 4.3 },
];

const levelData = [
  { drain: 'Drain 1', level: 45 },
  { drain: 'Drain 2', level: 78 },
  { drain: 'Drain 3', level: 32 },
  { drain: 'Drain 4', level: 89 },
  { drain: 'Drain 5', level: 23 },
];

const recentAlerts = [
  { id: 1, time: '09:14 AM', location: 'Drain No. 7', type: 'Blockage Detected', severity: 'critical' },
  { id: 2, time: '08:45 AM', location: 'Drain No. 3', type: 'High Water Level', severity: 'warning' },
  { id: 3, time: '07:30 AM', location: 'Drain No. 12', type: 'Flow Reduced', severity: 'warning' },
];

const DashboardSection = () => {
  const getCurrentFlow = () => 7.8;
  const getCurrentLevel = () => 55;
  const getBlockageStatus = () => 'Normal';
  const getSensorLocation = () => 'GPS: 40.7128, -74.0060';

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Live Dashboard
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time monitoring data from IoT sensors across the city's drainage system
          </p>
        </div>

        {/* Real-time Data Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Water Flow Rate */}
          <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Water Flow Rate</CardTitle>
              <Droplets className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground flex items-center">
                {getCurrentFlow()} L/min
                <TrendingUp className="h-4 w-4 text-success ml-2" />
              </div>
              <p className="text-xs text-success mt-2">+12% from last hour</p>
              <div className="mt-4">
                <Progress value={65} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Water Level */}
          <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Water Level</CardTitle>
              <Waves className="h-5 w-5 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground flex items-center">
                {getCurrentLevel()} cm
                <Minus className="h-4 w-4 text-muted-foreground ml-2" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Stable levels</p>
              <div className="mt-4">
                <Progress value={55} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Blockage Status */}
          <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Blockage Status</CardTitle>
              <AlertTriangle className="h-5 w-5 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                <Badge className="status-normal text-lg px-4 py-2">
                  {getBlockageStatus()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">All drains clear</p>
              <div className="flex items-center mt-4">
                <div className="w-3 h-3 bg-success rounded-full pulse-glow mr-2"></div>
                <span className="text-xs text-success">System Active</span>
              </div>
            </CardContent>
          </Card>

          {/* Sensor Location */}
          <Card className="glass-card border-glass-border hover:shadow-glow transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sensor Location</CardTitle>
              <MapPin className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium text-foreground mb-2">Main Street Drain #7</div>
              <p className="text-xs text-muted-foreground">{getSensorLocation()}</p>
              <div className="flex items-center mt-4">
                <Activity className="h-4 w-4 text-primary mr-2 pulse-glow" />
                <span className="text-xs text-primary">Live Monitoring</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Flow Chart */}
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <TrendingUp className="h-5 w-5 text-primary mr-2" />
                Water Flow Rate (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={flowData}>
                    <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "hsl(var(--glass))",
                        border: "1px solid hsl(var(--glass-border))",
                        borderRadius: "8px",
                        backdropFilter: "blur(20px)"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="flow" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Level Chart */}
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Waves className="h-5 w-5 text-secondary mr-2" />
                Water Levels by Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={levelData}>
                    <XAxis dataKey="drain" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
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
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center">
              <AlertTriangle className="h-5 w-5 text-warning mr-2" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 custom-scrollbar max-h-64 overflow-y-auto">
              {recentAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className="flex items-center justify-between p-4 glass-card rounded-lg hover:shadow-glow transition-all duration-300"
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
                    className="capitalize"
                  >
                    {alert.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default DashboardSection;