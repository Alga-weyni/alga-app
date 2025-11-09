import { useState } from "react";
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
  MessageSquare
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SystemAlert } from "@shared/schema";
import AgentGovernanceTab from "@/components/operations/AgentGovernanceTab";
import SupplyCurationTab from "@/components/operations/SupplyCurationTab";
import HardwareDeploymentTab from "@/components/operations/HardwareDeploymentTab";
import PaymentsComplianceTab from "@/components/operations/PaymentsComplianceTab";
import MarketingGrowthTab from "@/components/operations/MarketingGrowthTab";
import AskLemlemAdminChat from "@/components/operations/AskLemlemAdminChat";

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

  const { data: kpiData } = useQuery<OperationsKPI>({
    queryKey: ["/api/admin/operations/kpis"],
  });

  const { data: alerts } = useQuery<SystemAlert[]>({
    queryKey: ["/api/admin/operations/alerts"],
  });

  const activeAlerts = alerts?.filter(a => a.status === "active") || [];
  const criticalAlerts = activeAlerts.filter(a => a.severity === "critical");
  const highAlerts = activeAlerts.filter(a => a.severity === "high");

  return (
    <div className="min-h-screen bg-[#F6BD89]/10">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5B4032] to-[#CD7F32] text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Lemlem Operations Dashboard
              </h1>
              <p className="text-white/90">
                Command Center for Alga Technologies PLC
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm opacity-90">Offline-Ready System</div>
              <div className="text-xs opacity-75">Last Sync: Just now</div>
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

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
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
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab alerts={activeAlerts} />
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
        </Tabs>
      </div>

      {/* INSA Compliance Footer */}
      <INSAComplianceFooter />
      
      {/* Ask Lemlem Admin Chat - Floating Widget */}
      <AskLemlemAdminChat />
    </div>
  );
}

function OverviewTab({ alerts }: { alerts: SystemAlert[] }) {
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
    </div>
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
