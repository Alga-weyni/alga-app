import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Home,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";

interface AgentCommission {
  id: number;
  bookingId: number;
  propertyId: number;
  bookingTotal: string;
  commissionAmount: string;
  commissionRate: string;
  status: string;
  createdAt: string;
  paidAt?: string;
}

interface AgentDashboardData {
  agent: {
    id: number;
    fullName: string;
    phoneNumber: string;
    telebirrAccount: string;
    city: string;
    status: string;
    totalEarnings: string;
    totalProperties: number;
    activeProperties: number;
    referralCode: string;
    createdAt: string;
  };
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    totalProperties: number;
    activeProperties: number;
    expiredProperties: number;
    totalCommissions: number;
    recentCommissions: AgentCommission[];
  };
}

// Helper function to safely format earnings (handles string, number, or undefined)
const formatEarnings = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

export default function AgentDashboard() {
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<AgentDashboardData>({
    queryKey: ["/api/agent/dashboard"],
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-cream/30 dark:bg-gray-900 p-4">
          <div className="max-w-6xl mx-auto space-y-4">
            <Skeleton className="h-32 w-full" />
            <div className="grid md:grid-cols-4 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-cream/30 dark:bg-gray-900 p-4 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">❌ No Agent Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-medium-brown dark:text-cream/80">
                You haven't registered as an agent yet.
              </p>
              <Button
                onClick={() => navigate("/become-agent")}
                className="w-full bg-medium-brown hover:bg-dark-brown dark:bg-cream dark:hover:bg-cream/90 dark:text-dark-brown"
                data-testid="button-become-agent"
              >
                💼 Become an Agent
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { agent, stats } = data;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { label: "✅ Verified", variant: "default" as const },
      pending: { label: "⏳ Pending", variant: "secondary" as const },
      rejected: { label: "❌ Rejected", variant: "destructive" as const },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant} data-testid={`badge-status-${status}`}>{config.label}</Badge>;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-cream/30 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-dark-brown dark:text-cream mb-2">
              💼 Agent Dashboard
            </h1>
            <p className="text-medium-brown dark:text-cream/80">
              Welcome back, {agent.fullName}! 
            </p>
          </div>
          {getStatusBadge(agent.status)}
        </div>

        {/* Earnings Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-total-earnings">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-earnings">
                {formatEarnings(stats.totalEarnings)} Birr
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                All-time commissions
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-pending-earnings">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-pending-earnings">
                {formatEarnings(stats.pendingEarnings)} Birr
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                Awaiting payout
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-paid-earnings">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-paid-earnings">
                {formatEarnings(stats.paidEarnings)} Birr
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                To TeleBirr
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-active-properties">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                Active Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-medium-brown dark:text-cream" data-testid="text-active-properties">
                {stats.activeProperties}
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                of {stats.totalProperties} total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner for Pending Agents */}
        {agent.status === 'pending' && (
          <Card className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-dark-brown dark:text-cream mb-1">
                    ⏳ Account Under Review
                  </h3>
                  <p className="text-sm text-medium-brown dark:text-cream/80">
                    Your agent application is being reviewed. You'll be able to link properties and earn commissions once verified.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Referral Code Card */}
        <Card className="border-medium-brown/20 dark:border-cream/20">
          <CardHeader>
            <CardTitle className="text-lg">📣 Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-cream dark:bg-gray-800 p-4 rounded-lg">
              <div>
                <p className="text-sm text-medium-brown dark:text-cream/60 mb-1">
                  Share this code with property owners
                </p>
                <p className="text-2xl font-mono font-bold text-dark-brown dark:text-cream" data-testid="text-referral-code">
                  {agent.referralCode}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(agent.referralCode);
                }}
                data-testid="button-copy-referral"
              >
                📋 Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Commissions */}
        <Card className="border-medium-brown/20 dark:border-cream/20">
          <CardHeader>
            <CardTitle className="text-lg">💰 Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentCommissions.length === 0 ? (
              <div className="text-center py-12 text-medium-brown dark:text-cream/60">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No commissions yet. Start listing properties to earn!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentCommissions.map((commission) => (
                  <div
                    key={commission.id}
                    className="flex items-center justify-between p-4 bg-cream/50 dark:bg-gray-800 rounded-lg"
                    data-testid={`commission-${commission.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-dark-brown dark:text-cream">
                          Booking #{commission.bookingId}
                        </p>
                        {commission.status === 'paid' ? (
                          <Badge variant="default" className="text-xs" data-testid={`badge-paid-${commission.id}`}>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Paid
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs" data-testid={`badge-pending-${commission.id}`}>
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-medium-brown dark:text-cream/70">
                        <Calendar className="inline h-3 w-3 mr-1" />
                        {format(new Date(commission.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400" data-testid={`amount-${commission.id}`}>
                        +{parseFloat(commission.commissionAmount).toFixed(2)} Birr
                      </p>
                      <p className="text-xs text-medium-brown dark:text-cream/60">
                        {commission.commissionRate}% of {parseFloat(commission.bookingTotal).toFixed(2)} Birr
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="text-lg">📊 Commission Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-medium-brown dark:text-cream/80">Total Commissions:</span>
                <span className="font-semibold" data-testid="text-total-commissions">{stats.totalCommissions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-medium-brown dark:text-cream/80">Expired Properties:</span>
                <span className="font-semibold" data-testid="text-expired-properties">{stats.expiredProperties}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-medium-brown dark:text-cream/80">Member Since:</span>
                <span className="font-semibold">
                  {format(new Date(agent.createdAt), "MMM yyyy")}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="text-lg">💳 Payment Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-medium-brown dark:text-cream/80">TeleBirr Account:</span>
                <span className="font-semibold font-mono">{agent.telebirrAccount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-medium-brown dark:text-cream/80">City:</span>
                <span className="font-semibold">{agent.city}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
