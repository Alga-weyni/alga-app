import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Home, 
  HardDrive, 
  CreditCard, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Package,
  Shield,
  MessageSquare,
  Wifi,
  WifiOff,
  Mic,
  MicOff,
  Download,
  Brain
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SystemAlert } from "@shared/schema";
import AgentGovernanceTab from "@/components/operations/AgentGovernanceTab";
import SupplyCurationTab from "@/components/operations/SupplyCurationTab";
import HardwareDeploymentTab from "@/components/operations/HardwareDeploymentTab";
import PaymentsComplianceTab from "@/components/operations/PaymentsComplianceTab";
import MarketingGrowthTab from "@/components/operations/MarketingGrowthTab";
import INSAAuditModeTab from "@/components/operations/INSAAuditModeTab";
import AskLemlemAdminChat from "@/components/operations/AskLemlemAdminChat";
import { operationsOfflineStorage } from "@/lib/operationsOfflineStorage";
import { predictiveAnalytics, type Prediction } from "@/lib/predictiveAnalytics";
import { voiceCommands, type VoiceLanguage } from "@/lib/voiceCommands";
import { weeklyReportGenerator, type WeeklyReportData } from "@/lib/weeklyReportGenerator";
import { reportStorage } from "@/lib/reportStorage";
import { useToast } from "@/hooks/use-toast";
import lemlemOfflineStorage, { type PropertyKnowledge } from "@/lib/lemlemOfflineStorage";

interface OperationsKPI {
  activeAgents: number;
  newAgentsThisWeek: number;
  totalProperties: number;
  pendingVerification: number;
  hardwareDeployed: number;
  warrantyExpiring: number;
  unreconciledPayments: number;
  activeCampaigns: number;
  campaignConversions: number;
}

export default function LemlemOperationsDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState(0);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<VoiceLanguage>('am-ET');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const { toast } = useToast();

  const { data: kpiData } = useQuery<OperationsKPI>({
    queryKey: ["/api/admin/operations/kpis"],
  });

  const { data: alerts } = useQuery<SystemAlert[]>({
    queryKey: ["/api/admin/operations/alerts"],
  });

  const { data: agents } = useQuery({ queryKey: ["/api/admin/operations/agents"] });
  const { data: hardware } = useQuery({ queryKey: ["/api/admin/operations/hardware"] });
  const { data: compliance } = useQuery({ queryKey: ["/api/admin/insa/compliance"] });
  const { data: transactions } = useQuery({ queryKey: ["/api/admin/operations/payments"] });

  const activeAlerts = alerts?.filter(a => a.status === "active") || [];
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const highAlerts = activeAlerts.filter(a => a.severity === "high");

  // Setup offline detection & voice commands
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "📡 Connection Restored",
        description: "Syncing offline data...",
      });
      operationsOfflineStorage.syncPendingActions();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📡 Offline Mode",
        description: "Data will be cached locally",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Setup voice commands
    if (voiceCommands.isSupported()) {
      voiceCommands.onCommand((cmd) => {
        const parsed = voiceCommands.parseCommand(cmd.command);
        if (parsed) {
          toast({
            title: `🎤 Voice Command: ${cmd.language === 'am-ET' ? 'አማርኛ' : 'English'}`,
            description: `Executing: ${parsed.action}`,
          });
          executeVoiceAction(parsed.action);
        }
      });

      voiceCommands.onError((error) => {
        toast({
          title: "Voice Recognition Error",
          description: error,
          variant: "destructive",
        });
        setIsVoiceListening(false);
      });
    }

    // Load pending actions count
    operationsOfflineStorage.getPendingActions().then(actions => {
      setPendingActions(actions.length);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Generate predictive analytics
  useEffect(() => {
    if (agents || hardware || compliance || transactions) {
      predictiveAnalytics.generateAllPredictions({
        agents: agents as any,
        hardware: hardware as any,
        compliance: compliance as any,
        transactions: transactions as any,
      }).then(setPredictions);
    }
  }, [agents, hardware, compliance, transactions]);

  // Automatic Friday Report Generation (Ethiopian Time)
  useEffect(() => {
    const checkAndGenerateReport = async () => {
      const shouldGenerate = await reportStorage.shouldGenerateToday();
      
      if (shouldGenerate && kpiData) {
        console.log('📅 Friday detected - Auto-generating weekly report...');
        await generateWeeklyReport();
        toast({
          title: "📅 Friday Weekly Report Auto-Generated!",
          description: "Performance Pulse PDF downloaded successfully",
        });
      }
    };

    // Check on mount and every hour
    checkAndGenerateReport();
    const interval = setInterval(checkAndGenerateReport, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [kpiData]);

  const toggleVoiceListening = () => {
    if (isVoiceListening) {
      voiceCommands.stopListening();
      setIsVoiceListening(false);
    } else {
      voiceCommands.setLanguage(voiceLanguage);
      voiceCommands.startListening();
      setIsVoiceListening(true);
      
      toast({
        title: `🎤 Voice Activated`,
        description: `Listening for ${voiceLanguage === 'am-ET' ? 'Amharic' : 'English'} commands...`,
      });
    }
  };

  const toggleLanguage = () => {
    const newLang: VoiceLanguage = voiceLanguage === 'am-ET' ? 'en-US' : 'am-ET';
    setVoiceLanguage(newLang);
    voiceCommands.setLanguage(newLang);
  };

  const executeVoiceAction = (action: string) => {
    switch (action) {
      case 'top_agents':
        setActiveTab('agents');
        break;
      case 'unverified_properties':
        setActiveTab('supply');
        break;
      case 'active_alerts':
        setActiveTab('overview');
        break;
      case 'payment_summary':
        setActiveTab('payments');
        break;
      case 'weekly_report':
        generateWeeklyReport();
        break;
      case 'help':
        toast({
          title: "Voice Commands Available",
          description: "Try: 'Show top agents', 'Payment summary', 'Active alerts'",
        });
        break;
    }
  };

  const generateWeeklyReport = async () => {
    if (!kpiData) {
      toast({
        title: "Error",
        description: "KPI data not loaded yet",
        variant: "destructive",
      });
      return;
    }

    try {
      // Collect LIVE data from all sources
      const agentsData = agents as any[] || [];
      const hardwareData = hardware as any[] || [];
      const transactionsData = transactions as any[] || [];
      const campaignsData: any[] = []; // Would come from marketing query

      // Calculate live agent metrics
      const totalCommissions = agentsData.reduce((sum, a) => sum + (parseFloat(a.commissionEarned) || 0), 0);
      const topAgent = agentsData.length > 0
        ? agentsData.sort((a, b) => parseFloat(b.commissionEarned || "0") - parseFloat(a.commissionEarned || "0"))[0]
        : null;

      // Calculate live hardware metrics
      const totalInvestment = hardwareData.reduce((sum, h) => sum + (parseFloat(h.purchaseCost) || 0), 0);

      // Calculate live payment metrics
      const totalVolume = transactionsData.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

      // Calculate live marketing metrics
      const totalBudget = campaignsData.reduce((sum, c) => sum + parseFloat(c.budget || "0"), 0);
      const totalSpent = campaignsData.reduce((sum, c) => sum + parseFloat(c.spent || "0"), 0);
      const totalImpressions = campaignsData.reduce((sum, c) => sum + (c.impressions || 0), 0);

      const reportData: WeeklyReportData = {
        agents: {
          total: agentsData.length,
          active: agentsData.filter(a => a.activeProperties > 0).length,
          newThisWeek: kpiData.newAgentsThisWeek || 0,
          totalCommissions,
          topAgent: topAgent ? {
            name: topAgent.fullName || 'Unknown',
            earnings: parseFloat(topAgent.commissionEarned || "0")
          } : null,
        },
        properties: {
          total: kpiData.totalProperties || 0,
          verified: kpiData.totalProperties - kpiData.pendingVerification || 0,
          pendingVerification: kpiData.pendingVerification || 0,
          newThisWeek: 0,
        },
        hardware: {
          deployed: hardwareData.length,
          expiringWarranties: kpiData.warrantyExpiring || 0,
          totalInvestment,
        },
        payments: {
          totalVolume,
          unreconciled: kpiData.unreconciledPayments || 0,
          transactions: transactionsData.length,
        },
        marketing: {
          activeCampaigns: kpiData.activeCampaigns || 0,
          totalBudget,
          totalSpent,
          totalImpressions,
          totalConversions: kpiData.campaignConversions || 0,
        },
        alerts: {
          critical: criticalAlerts.length,
          high: highAlerts.length,
          medium: 0,
          low: 0,
          total: activeAlerts.length,
        },
      };

      // Generate PDF
      const pdf = weeklyReportGenerator.generatePDF(reportData, new Date());
      const pdfBlob = pdf.output('blob');

      // Store in IndexedDB
      await reportStorage.saveReport({
        weekEnding: new Date().toISOString().split('T')[0],
        generatedAt: new Date().toISOString(),
        pdfBlob,
        metadata: {
          totalAgents: reportData.agents.total,
          totalProperties: reportData.properties.total,
          criticalAlerts: reportData.alerts.critical,
        },
      });

      // Download
      await weeklyReportGenerator.downloadReport(reportData, new Date());

      // Cleanup old reports
      await reportStorage.cleanupOldReports();

      console.log('📄 Weekly Report generated and stored successfully');
      
      toast({
        title: "📄 Weekly Report Generated",
        description: "PDF downloaded and saved to Reports library",
      });
    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        title: "Error Generating Report",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F6BD89]/10">
      {/* Header with Offline Indicator & Voice Controls */}
      <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                Lemlem Operations Dashboard
                {predictions.length > 0 && (
                  <Badge className="bg-orange-500 text-white">
                    <Brain className="h-3 w-3 mr-1" />
                    {predictions.length} Predictions
                  </Badge>
                )}
              </h1>
              <p className="text-white/90">
                Command Center for Alga Technologies PLC
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              {/* Offline Indicator */}
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Badge className="bg-green-600">
                    <Wifi className="h-3 w-3 mr-1" />
                    Online
                  </Badge>
                ) : (
                  <Badge className="bg-red-600">
                    <WifiOff className="h-3 w-3 mr-1" />
                    Offline Mode
                  </Badge>
                )}
                {pendingActions > 0 && (
                  <Badge variant="outline" className="text-white border-white">
                    {pendingActions} pending sync
                  </Badge>
                )}
              </div>

              {/* Voice Controls */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleLanguage}
                  className="text-white border-white hover:bg-white/20"
                  disabled={!voiceCommands.isSupported()}
                  data-testid="button-toggle-language"
                >
                  {voiceLanguage === 'am-ET' ? 'አማርኛ' : 'English'}
                </Button>
                <Button
                  size="sm"
                  variant={isVoiceListening ? "default" : "outline"}
                  onClick={toggleVoiceListening}
                  className={isVoiceListening ? "bg-red-600 hover:bg-red-700" : "text-white border-white hover:bg-white/20"}
                  disabled={!voiceCommands.isSupported()}
                  data-testid="button-toggle-voice"
                >
                  {isVoiceListening ? <MicOff className="h-4 w-4 mr-1" /> : <Mic className="h-4 w-4 mr-1" />}
                  {isVoiceListening ? 'Stop' : 'Voice'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={generateWeeklyReport}
                  className="text-white border-white hover:bg-white/20"
                  data-testid="button-generate-weekly-report"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Weekly Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Critical Alerts Bar */}
        {criticalAlerts.length > 0 && (
          <Alert variant="destructive" className="mb-6" data-testid="alert-critical">
            <AlertTriangle className="h-5 w-5" />
            <AlertTitle>Critical Alerts ({criticalAlerts.length})</AlertTitle>
            <AlertDescription>
              {criticalAlerts.map(alert => alert.title).join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* KPI Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card data-testid="card-kpi-agents">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-[#CD7F32]" />
                Active Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData?.activeAgents || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                +{kpiData?.newAgentsThisWeek || 0} this week
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-kpi-properties">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4 text-[#CD7F32]" />
                Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData?.totalProperties || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpiData?.pendingVerification || 0} pending verification
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-kpi-hardware">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-[#CD7F32]" />
                Hardware
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData?.hardwareDeployed || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpiData?.warrantyExpiring || 0} warranty expiring soon
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-kpi-payments">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#CD7F32]" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {kpiData?.unreconciledPayments || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                unreconciled transactions
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-kpi-campaigns">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#CD7F32]" />
                Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpiData?.activeCampaigns || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {kpiData?.campaignConversions || 0} conversions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Predictive Analytics Alert */}
        {predictions.length > 0 && (
          <Alert className="mb-6 border-orange-500 bg-orange-50">
            <Brain className="h-5 w-5 text-orange-600" />
            <AlertTitle className="text-orange-900">
              {predictions.length} Predictive Insights Available
            </AlertTitle>
            <AlertDescription className="text-orange-800">
              {predictions.slice(0, 3).map(p => p.title).join(' • ')}
              {predictions.length > 3 && ` • +${predictions.length - 3} more`}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview" data-testid="tab-overview">
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" data-testid="tab-agents">
              Agents
            </TabsTrigger>
            <TabsTrigger value="supply" data-testid="tab-supply">
              Supply
            </TabsTrigger>
            <TabsTrigger value="hardware" data-testid="tab-hardware">
              Hardware
            </TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">
              Payments
            </TabsTrigger>
            <TabsTrigger value="marketing" data-testid="tab-marketing">
              Marketing
            </TabsTrigger>
            <TabsTrigger value="insa" data-testid="tab-insa">
              <Shield className="h-4 w-4 mr-1" />
              INSA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab alerts={activeAlerts} predictions={predictions} />
          </TabsContent>

          <TabsContent value="agents">
            <AgentGovernanceTab />
          </TabsContent>

          <TabsContent value="supply">
            <SupplyCurationTab />
          </TabsContent>

          <TabsContent value="hardware">
            <HardwareDeploymentTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsComplianceTab />
          </TabsContent>

          <TabsContent value="marketing">
            <MarketingGrowthTab />
          </TabsContent>

          <TabsContent value="insa">
            <INSAAuditModeTab />
          </TabsContent>
        </Tabs>
      </div>

      {/* INSA Compliance Footer */}
      <INSAComplianceFooter />
      
      {/* Ask Lemlem Admin Chat - Floating Widget */}
      <AskLemlemAdminChat />
    </div>
  );
}

function OverviewTab({ alerts, predictions }: { alerts: SystemAlert[], predictions: Prediction[] }) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "high": return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[#CD7F32]" />
            Active Alerts & Red Flags
          </CardTitle>
          <CardDescription>System-wide notifications requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All systems operational</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  data-testid={`alert-item-${alert.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm mt-1">{alert.description}</div>
                      <div className="text-xs mt-2 opacity-75">
                        Pillar: {alert.pillar} • Type: {alert.alertType}
                      </div>
                    </div>
                    <Badge variant="outline">{alert.severity}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Predictive Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-[#CD7F32]" />
            Predictive Analytics
          </CardTitle>
          <CardDescription>AI-powered insights and early warnings</CardDescription>
        </CardHeader>
        <CardContent>
          {predictions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No risks detected</p>
            </div>
          ) : (
            <div className="space-y-3">
              {predictions.slice(0, 5).map((prediction, idx) => (
                <div
                  key={prediction.id}
                  className={`p-3 rounded-lg border ${getSeverityColor(prediction.severity)}`}
                  data-testid={`prediction-item-${idx}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{prediction.title}</div>
                      <div className="text-sm mt-1">{prediction.description}</div>
                      <div className="text-xs mt-2 opacity-75 font-medium">
                        Recommended: {prediction.recommendedAction}
                      </div>
                      <div className="text-xs mt-1 opacity-50">
                        {prediction.confidence}% confidence • {prediction.forecastDays} day forecast
                      </div>
                    </div>
                    <Badge variant="outline">{prediction.severity}</Badge>
                  </div>
                </div>
              ))}
              {predictions.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  +{predictions.length - 5} more predictions available
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#CD7F32]" />
            Recent Activity
          </CardTitle>
          <CardDescription>Last 24 hours system activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>5 new agents verified</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-blue-500" />
              <span>12 properties approved</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <span>8 lockboxes deployed</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
              <span>23 payments reconciled</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Auto-Learning Mode Card */}
      <AutoLearningCard />
    </div>
  );
}

function AutoLearningCard() {
  const [cachedProperties, setCachedProperties] = useState<PropertyKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadCachedProperties();
  }, []);

  const loadCachedProperties = async () => {
    try {
      const cached = await lemlemOfflineStorage.getAllPropertyKnowledge();
      setCachedProperties(cached);
    } catch (error) {
      console.error('Failed to load cached properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCache = async () => {
    setLoading(true);
    await loadCachedProperties();
    toast({
      title: "✅ Cache refreshed",
      description: `${cachedProperties.length} properties with cached knowledge`,
      variant: "default",
    });
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-[#CD7F32]" />
              Lemlem Auto-Learning Mode
            </CardTitle>
            <CardDescription>
              Property-specific knowledge cached for instant offline responses
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshCache}
            data-testid="button-refresh-cache"
          >
            Refresh Cache
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertTitle>How Auto-Learning Works</AlertTitle>
          <AlertDescription className="text-sm">
            When guests ask Lemlem about a property, the system automatically caches host-provided 
            recommendations (restaurants, attractions, transportation). This enables instant offline 
            responses without API costs. Property knowledge syncs automatically when property pages load.
          </AlertDescription>
        </Alert>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading cached properties...
          </div>
        ) : cachedProperties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No properties cached yet</p>
            <p className="text-xs mt-1">Knowledge will be cached when properties are viewed</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              {cachedProperties.length} {cachedProperties.length === 1 ? 'property' : 'properties'} with cached knowledge
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {cachedProperties.slice(0, 6).map((prop) => (
                <div 
                  key={prop.propertyId}
                  className="p-3 rounded-lg border bg-white"
                  data-testid={`cached-property-${prop.propertyId}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Property #{prop.propertyId}</div>
                      <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                        {prop.restaurants && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Restaurants cached</span>
                          </div>
                        )}
                        {prop.attractions && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Attractions cached</span>
                          </div>
                        )}
                        {prop.transportation && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>Transportation cached</span>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Last synced: {new Date(prop.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {prop.synced ? 'Synced' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {cachedProperties.length > 6 && (
              <div className="text-center text-sm text-muted-foreground mt-2">
                +{cachedProperties.length - 6} more properties cached
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function INSAComplianceFooter() {
  return (
    <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white py-4 mt-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <Shield className="h-5 w-5" />
            <span>INSA Certified System</span>
            <Badge variant="outline" className="bg-white/20 text-white border-white/30">
              Audit Ready
            </Badge>
          </div>
          <div className="text-right opacity-90">
            <div>Alga One Member PLC</div>
            <div className="text-xs">TIN: 0101809194 • INSA Compliant</div>
          </div>
        </div>
      </div>
    </div>
  );
}
