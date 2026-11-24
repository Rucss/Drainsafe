import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings, User, Activity, LogOut } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { getAlerts } from "@/lib/drainsafe-api";
import { toast } from "sonner";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: activeAlertCount, isError: activeAlertsError } = useQuery({
    queryKey: ["active-alert-count"],
    queryFn: async () => (await getAlerts()).filter((alert) => alert.status === "active").length,
    enabled: Boolean(user),
    refetchInterval: 30_000,
  });
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to sign out.");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-glass-border">
      <div className="container mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">DrainSafe</h1>
              <p className="text-xs text-muted-foreground">IoT Monitoring System</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/">
              <Button
                variant="ghost" 
                className={`text-foreground hover:text-primary transition-colors ${
                  isActive('/') ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button 
                variant="ghost" 
                className={`text-foreground hover:text-primary transition-colors ${
                  isActive('/dashboard') ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Live Dashboard
              </Button>
            </Link>
            <Link to="/alerts">
              <Button 
                variant="ghost" 
                className={`text-foreground hover:text-primary transition-colors ${
                  isActive('/alerts') ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Alerts
              </Button>
            </Link>
            <Link to="/reports">
              <Button 
                variant="ghost" 
                className={`text-foreground hover:text-primary transition-colors ${
                  isActive('/reports') ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Reports
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant="ghost" 
                className={`text-foreground hover:text-primary transition-colors ${
                  isActive('/settings') ? 'text-primary bg-primary/10' : ''
                }`}
              >
                Settings
              </Button>
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Button asChild size="icon" variant="ghost" className="glass-card hover:shadow-glow">
                <Link
                  to="/alerts"
                  aria-label={activeAlertsError ? "Active alert count unavailable" : `${activeAlertCount ?? 0} active alerts`}
                  title={activeAlertsError ? "Unable to load active alerts" : "Open alerts"}
                >
                  <Bell className="w-5 h-5" />
                </Link>
              </Button>
              {user && (activeAlertsError || (activeAlertCount ?? 0) > 0) && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full bg-destructive px-1 text-destructive-foreground flex items-center justify-center text-xs"
                  aria-label={activeAlertsError ? "Alert count unavailable" : `${activeAlertCount} active alerts`}
                >
                  {activeAlertsError ? "!" : activeAlertCount}
                </Badge>
              )}
            </div>
            
            <Button asChild size="icon" variant="ghost" className="glass-card hover:shadow-glow">
              <Link to="/settings" aria-label="Settings" title="Settings">
                <Settings className="w-5 h-5" />
              </Link>
            </Button>
            
            {user ? (
              <Button size="icon" variant="ghost" className="glass-card hover:shadow-glow" onClick={handleSignOut} aria-label="Sign out">
                <LogOut className="w-5 h-5" />
              </Button>
            ) : (
              <Link to="/login">
                <Button size="sm" variant="outline" className="glass-card border-glass-border">
                  <User className="w-4 h-4 mr-2" />
                  Sign in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;