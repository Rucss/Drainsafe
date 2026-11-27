import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

import { getAlerts, getSensors, updateAlertStatus } from "@/lib/drainsafe-api";
import { toast } from "sonner";

const Alerts = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();
  const { data, isPending, error } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const [alerts, sensors] = await Promise.all([getAlerts(), getSensors()]);
      return { alerts, sensors };
    },
    refetchInterval: 30_000,
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "acknowledged" | "resolved" }) =>
      updateAlertStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      queryClient.invalidateQueries({ queryKey: ["active-alert-count"] });
    },
    onError: (mutationError) => toast.error(mutationError.message),
  });
  const alertsData = data?.alerts ?? [];
  const filteredAlerts = alertsData.filter((alert) => {
    const sensor = data?.sensors.find((item) => item.id === alert.sensor_id);
    const matchesSearch = `${sensor?.name ?? ""} ${sensor?.location ?? ""} ${alert.title} ${alert.description}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch
      && (filterSeverity === "all" || alert.severity === filterSeverity)
      && (filterStatus === "all" || alert.status === filterStatus);
  });
  const activeCount = alertsData.filter((alert) => alert.status === "active").length;
  const acknowledgedCount = alertsData.filter((alert) => alert.status === "acknowledged").length;
  const resolvedCount = alertsData.filter((alert) => alert.status === "resolved").length;
  const totalCount = alertsData.length;
  const hasSampleAlerts = alertsData.some((alert) => alert.title.startsWith("Sample:"));

  useEffect(() => {
    setIsVisible(true);
  }, []);

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
    <div className="min-h-screen bg-gradient-bg">
      <Header />
      
      <main className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {isPending && <p className="mb-6 text-center text-muted-foreground">Loading alerts…</p>}
          {error && <p role="alert" className="mb-6 text-center text-destructive">{error.message}</p>}
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            {hasSampleAlerts && (
              <Badge className="mb-4 border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-amber-200">
                Sample alerts · Preview only
              </Badge>
            )}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-destructive to-warning bg-clip-text text-transparent">
              Alert Management
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              {hasSampleAlerts
                ? "Preview alert records for the sample sites in India."
                : "Monitor and manage real-time alerts from the drainage monitoring system"}
            </p>
          </div>

          {/* Alert Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                    <p className="text-2xl sm:text-3xl font-bold text-destructive">{activeCount}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-destructive/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-destructive pulse-glow" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.2s'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Acknowledged</p>
                    <p className="text-2xl sm:text-3xl font-bold text-warning">{acknowledgedCount}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-warning/20 rounded-full flex items-center justify-center">
                    <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.3s'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                    <p className="text-2xl sm:text-3xl font-bold text-success">{resolvedCount}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-success/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-glass-border animate-scale-in" style={{animationDelay: '0.4s'}}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Alerts</p>
                    <p className="text-2xl sm:text-3xl font-bold text-primary">{totalCount}</p>
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="glass-card border-glass-border mb-6 sm:mb-8 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Filter className="w-5 h-5 mr-2" />
                Filter Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <Button
                    className="w-full bg-gradient-primary hover:shadow-glow"
                    onClick={() => {
                      const rows = [
                        ["Created at", "Title", "Severity", "Status", "Description"],
                        ...filteredAlerts.map((alert) => [alert.created_at, alert.title, alert.severity, alert.status, alert.description]),
                      ];
                      const csv = rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")).join("\n");
                      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
                      const link = document.createElement("a");
                      link.href = url;
                      link.download = "drainsafe-alerts.csv";
                      link.click();
                      URL.revokeObjectURL(url);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alerts List */}
          <div className="space-y-4 custom-scrollbar max-h-[600px] overflow-y-auto">
            {filteredAlerts.map((alert, index) => {
              const sensor = data?.sensors.find((item) => item.id === alert.sensor_id);
              return (
              <Card key={alert.id} className="glass-card border-glass-border hover:shadow-glow transition-all duration-300 animate-scale-in" style={{animationDelay: `${0.6 + index * 0.1}s`}}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {getStatusIcon(alert.status)}
                          <span className="text-sm font-medium capitalize">{alert.severity}</span>
                        </div>
                        <Badge className={`${getStatusColor(alert.status)} capitalize`}>
                          {alert.status}
                        </Badge>
                      </div>

                      <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{alert.title}</h3>
                      <p className="text-muted-foreground mb-4">{alert.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">{new Date(alert.created_at).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground">
                            {sensor?.location ?? "Unknown location"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 lg:ml-6">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="glass-card border-glass-border flex-1 lg:flex-none">
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
                          <DialogHeader>
                            <DialogTitle>{alert.title}</DialogTitle>
                            <DialogDescription>
                              Full details for this {alert.severity} alert.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={`${getSeverityColor(alert.severity)} capitalize`}>{alert.severity}</Badge>
                            <Badge className={`${getStatusColor(alert.status)} capitalize`}>{alert.status}</Badge>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="glass-card rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Sensor</p>
                              <p className="mt-1 font-medium">{sensor?.name ?? "Unknown sensor"}</p>
                            </div>
                            <div className="glass-card rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Location</p>
                              <p className="mt-1 font-medium">{sensor?.location ?? "Unknown location"}</p>
                            </div>
                            <div className="glass-card rounded-lg p-3">
                              <p className="text-xs text-muted-foreground">Created</p>
                              <p className="mt-1 font-medium">{new Date(alert.created_at).toLocaleString()}</p>
                            </div>
                            {alert.acknowledged_at && (
                              <div className="glass-card rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">Acknowledged</p>
                                <p className="mt-1 font-medium">{new Date(alert.acknowledged_at).toLocaleString()}</p>
                              </div>
                            )}
                            {alert.resolved_at && (
                              <div className="glass-card rounded-lg p-3">
                                <p className="text-xs text-muted-foreground">Resolved</p>
                                <p className="mt-1 font-medium">{new Date(alert.resolved_at).toLocaleString()}</p>
                              </div>
                            )}
                            {sensor?.latitude !== null && sensor?.latitude !== undefined
                              && sensor.longitude !== null && sensor.longitude !== undefined && (
                                <div className="glass-card rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">Coordinates</p>
                                  <p className="mt-1 font-medium">{sensor.latitude}, {sensor.longitude}</p>
                                </div>
                              )}
                          </div>
                          <div className="glass-card rounded-lg p-4">
                            <p className="text-sm font-medium">Description</p>
                            <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
                          </div>
                          {alert.status === "active" && (
                            <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                              This alert is active and requires attention.
                            </p>
                          )}
                        </DialogContent>
                      </Dialog>
                      {alert.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-card border-glass-border flex-1 lg:flex-none"
                          onClick={() => statusMutation.mutate({ id: alert.id, status: "acknowledged" })}
                          disabled={statusMutation.isPending}
                        >
                          Acknowledge
                        </Button>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="glass-card border-glass-border flex-1 lg:flex-none"
                          onClick={() => statusMutation.mutate({ id: alert.id, status: "resolved" })}
                          disabled={statusMutation.isPending}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              );
            })}
            {!isPending && filteredAlerts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No alerts match these filters.</p>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Alerts;