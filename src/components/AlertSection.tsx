import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Filter,
  Download,
  Eye,
  Bell,
  CheckCircle
} from "lucide-react";

const alertsData = [
  {
    id: 1,
    timestamp: '2024-01-15 09:14:22',
    location: 'Main Street - Drain No. 7',
    type: 'Blockage Detected',
    severity: 'critical',
    status: 'active',
    description: 'Water flow reduced to 2.1 L/min, level rising to 85cm',
    coordinates: '40.7128, -74.0060'
  },
  {
    id: 2,
    timestamp: '2024-01-15 08:45:15',
    location: 'Park Avenue - Drain No. 3',
    type: 'High Water Level',
    severity: 'warning',
    status: 'acknowledged',
    description: 'Water level at 78cm, monitoring increased flow',
    coordinates: '40.7589, -73.9851'
  },
  {
    id: 3,
    timestamp: '2024-01-15 07:30:44',
    location: 'Commerce Street - Drain No. 12',
    type: 'Flow Reduction',
    severity: 'warning',
    status: 'resolved',
    description: 'Flow rate dropped to 4.2 L/min, now stabilized',
    coordinates: '40.7505, -73.9934'
  },
  {
    id: 4,
    timestamp: '2024-01-14 22:18:33',
    location: 'Industrial Zone - Drain No. 15',
    type: 'Sensor Malfunction',
    severity: 'medium',
    status: 'maintenance',
    description: 'JSN-SR04T sensor not responding, technician dispatched',
    coordinates: '40.6892, -74.0445'
  },
  {
    id: 5,
    timestamp: '2024-01-14 19:42:11',
    location: 'Residential Area - Drain No. 5',
    type: 'Water Quality Alert',
    severity: 'medium',
    status: 'resolved',
    description: 'Unusual debris detected, cleaned and operational',
    coordinates: '40.7831, -73.9712'
  }
];

const AlertSection = () => {
  const [filteredAlerts, setFilteredAlerts] = useState(alertsData);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive text-destructive-foreground';
      case 'warning': return 'bg-warning text-warning-foreground';
      case 'medium': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-destructive text-destructive-foreground pulse-glow';
      case 'acknowledged': return 'bg-warning text-warning-foreground';
      case 'resolved': return 'bg-success text-success-foreground';
      case 'maintenance': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <AlertTriangle className="w-4 h-4" />;
      case 'acknowledged': return <Eye className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Clock className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">
            Alert Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Monitor and manage real-time alerts from the drainage monitoring system
          </p>
        </div>

        {/* Alert Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-3xl font-bold text-destructive">2</p>
                </div>
                <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-destructive pulse-glow" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                  <p className="text-3xl font-bold text-warning">1</p>
                </div>
                <div className="w-12 h-12 bg-warning/20 rounded-full flex items-center justify-center">
                  <Eye className="w-6 h-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-success">2</p>
                </div>
                <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Today</p>
                  <p className="text-3xl font-bold text-primary">5</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="glass-card border-glass-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filter Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Search</label>
                <Input 
                  placeholder="Search location, type..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="glass-card border-glass-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Severity</label>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="glass-card border-glass-border">
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="glass-card border-glass-border">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="acknowledged">Acknowledged</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button className="w-full bg-gradient-primary hover:shadow-glow">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts List */}
        <div className="space-y-4 custom-scrollbar max-h-[600px] overflow-y-auto">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id} className="glass-card border-glass-border hover:shadow-glow transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                        {getStatusIcon(alert.status)}
                        <span className="text-sm font-medium capitalize">{alert.severity}</span>
                      </div>
                      <Badge className={`${getStatusColor(alert.status)} capitalize`}>
                        {alert.status}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-2">{alert.type}</h3>
                    <p className="text-muted-foreground mb-4">{alert.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{alert.timestamp}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-foreground">{alert.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <Button variant="outline" size="sm" className="glass-card border-glass-border">
                      View Details
                    </Button>
                    {alert.status === 'active' && (
                      <Button variant="outline" size="sm" className="glass-card border-glass-border">
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AlertSection;