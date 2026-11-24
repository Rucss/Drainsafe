import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Download, 
  FileText, 
  Calendar,
  TrendingUp,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle
} from "lucide-react";

const reportsData = [
  {
    id: 1,
    title: 'Weekly Drainage Performance Report',
    period: 'Jan 8-14, 2024',
    type: 'Weekly',
    status: 'Ready',
    size: '2.4 MB',
    lastGenerated: '2024-01-15 06:00:00',
    insights: ['3 blockages detected', '92% uptime', '15% flow increase']
  },
  {
    id: 2,
    title: 'Monthly Water Flow Analysis',
    period: 'December 2023',
    type: 'Monthly',
    status: 'Ready',
    size: '8.7 MB',
    lastGenerated: '2024-01-01 00:30:00',
    insights: ['Peak flow: 12.5 L/min', '8 alerts resolved', '99.2% sensor accuracy']
  },
  {
    id: 3,
    title: 'Quarterly Infrastructure Assessment',
    period: 'Q4 2023',
    type: 'Quarterly',
    status: 'Generating',
    size: '15.2 MB',
    lastGenerated: 'In progress...',
    insights: ['Comprehensive analysis', 'Maintenance schedule', 'Cost optimization']
  },
  {
    id: 4,
    title: 'Alert Response Time Analysis',
    period: 'Last 30 days',
    type: 'Custom',
    status: 'Ready',
    size: '1.8 MB',
    lastGenerated: '2024-01-14 18:45:00',
    insights: ['Avg response: 12 min', '95% alert resolution', '3 false positives']
  }
];

const performanceMetrics = [
  { label: 'System Uptime', value: 99.2, color: 'text-success' },
  { label: 'Alert Accuracy', value: 94.8, color: 'text-primary' },
  { label: 'Response Time', value: 87.5, color: 'text-warning' },
  { label: 'Maintenance Efficiency', value: 91.3, color: 'text-accent' }
];

const ReportsSection = () => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Ready': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'Generating': return <Clock className="w-4 h-4 text-warning animate-spin" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Weekly': return <BarChart3 className="w-5 h-5 text-primary" />;
      case 'Monthly': return <TrendingUp className="w-5 h-5 text-secondary" />;
      case 'Quarterly': return <PieChart className="w-5 h-5 text-accent" />;
      default: return <FileText className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Reports & Analytics
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive reports and analytics for data-driven maintenance decisions
          </p>
        </div>

        {/* Performance Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                System Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-foreground">{metric.label}</span>
                    <span className={`text-sm font-bold ${metric.color}`}>{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-glass-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-secondary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-gradient-primary hover:shadow-glow justify-start">
                <Download className="w-4 h-4 mr-2" />
                Generate Custom Report
              </Button>
              <Button variant="outline" className="w-full glass-card border-glass-border justify-start">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Automated Report
              </Button>
              <Button variant="outline" className="w-full glass-card border-glass-border justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Export Raw Data
              </Button>
              <Button variant="outline" className="w-full glass-card border-glass-border justify-start">
                <PieChart className="w-4 h-4 mr-2" />
                View Analytics Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Reports */}
        <Card className="glass-card border-glass-border">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Available Reports
              </div>
              <Button className="bg-gradient-primary hover:shadow-glow">
                <Download className="w-4 h-4 mr-2" />
                Download All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportsData.map((report) => (
                <div 
                  key={report.id} 
                  className="glass-card p-6 rounded-lg hover:shadow-glow transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-muted/20 rounded-lg flex items-center justify-center">
                        {getTypeIcon(report.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(report.status)}
                            <Badge variant={report.status === 'Ready' ? 'default' : 'secondary'}>
                              {report.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-muted-foreground mb-3">{report.period}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">File Size:</span>
                              <span className="text-foreground font-medium">{report.size}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Generated:</span>
                              <span className="text-foreground font-medium">{report.lastGenerated}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-muted-foreground text-sm">Key Insights:</span>
                            <div className="flex flex-wrap gap-1">
                              {report.insights.map((insight, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {insight}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {report.status === 'Ready' ? (
                        <>
                          <Button size="sm" className="bg-gradient-primary hover:shadow-glow">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button size="sm" variant="outline" className="glass-card border-glass-border">
                            Preview
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          <Clock className="w-4 h-4 mr-1 animate-spin" />
                          Generating...
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default ReportsSection;