import { Button } from "@/components/ui/button";
import { Activity, Github, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative py-16 px-6 glass-card border-t border-glass-border">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">DrainSafe</h3>
                <p className="text-sm text-muted-foreground">IoT Monitoring</p>
              </div>
            </div>
            <p className="text-muted-foreground">
              Preventing urban flooding through intelligent IoT-based drainage monitoring 
              and real-time alert systems.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Quick Links</h4>
            <div className="flex flex-col items-start gap-2">
              <Button asChild variant="ghost" className="h-auto whitespace-nowrap p-0 text-muted-foreground hover:text-primary justify-start">
                <Link to="/dashboard">Live Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" className="h-auto whitespace-nowrap p-0 text-muted-foreground hover:text-primary justify-start">
                <Link to="/alerts">Alert Management</Link>
              </Button>
              <Button asChild variant="ghost" className="h-auto whitespace-nowrap p-0 text-muted-foreground hover:text-primary justify-start">
                <Link to="/reports">System Reports</Link>
              </Button>
              <Button asChild variant="ghost" className="h-auto whitespace-nowrap p-0 text-muted-foreground hover:text-primary justify-start">
                <Link to="/settings">Settings</Link>
              </Button>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">support@drainsafe.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Smart City Operations Center</span>
              </div>
            </div>
          </div>

          {/* Legal & Source */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-foreground">Resources</h4>
            <div className="flex flex-col items-start gap-2">
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start">
                Privacy Policy
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start">
                Terms of Service
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start flex items-center">
                <Github className="w-4 h-4 mr-2" />
                Source Code
              </Button>
              <Button variant="ghost" className="h-auto p-0 text-muted-foreground hover:text-primary justify-start">
                Documentation
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-glass-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 DrainSafe IoT Monitoring System. All rights reserved.
          </p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">
            Built with ESP32, React, and smart city technologies
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;