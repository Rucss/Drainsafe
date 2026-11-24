import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Shield, Zap, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/drainage-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-16 sm:py-20">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 glass-card px-4 py-2 rounded-full mb-8 mt-6">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm text-foreground">Real-time Monitoring Active</span>
            <div className="w-2 h-2 bg-success rounded-full pulse-glow"></div>
          </div>

          {/* Main Heading */}
          <h1 className="text-[clamp(3rem,7vw,5.5rem)] font-bold mb-6 pb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent leading-[1.12]">
            City Drainage
            <br />
            Monitoring System
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Prevent urban flooding with real-time IoT monitoring. 
            Detect blockages and water flow issues before they become problems.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 md:gap-12 mb-12 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">Real-time</div>
              <div className="text-sm text-muted-foreground">Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-secondary mb-2">IoT</div>
              <div className="text-sm text-muted-foreground">Sensors</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:shadow-glow text-primary-foreground px-8 py-6 text-lg rounded-full"
              >
                View Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="glass-card border-glass-border hover:shadow-glow px-8 py-6 text-lg rounded-full"
            >
              <Play className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flow Detection</h3>
              <p className="text-sm text-muted-foreground">YF-S201 sensors monitor water flow rates in real-time</p>
            </div>

            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Level Monitoring</h3>
              <p className="text-sm text-muted-foreground">JSN-SR04T ultrasonic sensors detect water levels</p>
            </div>

            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Alerts</h3>
              <p className="text-sm text-muted-foreground">ESP32 triggers immediate alerts for anomalies</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;