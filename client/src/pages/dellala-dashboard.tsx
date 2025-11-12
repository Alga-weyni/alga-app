import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Phone,
  Users,
  Home,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AgentPerformance {
  totalCommissionEarned: string;
  totalCommissionPending: string;
  availableBalance: string;
  totalWithdrawn: string;
  totalBookings: number;
  totalPropertiesListed: number;
  lastUpdated: string;
}

interface Commission {
  id: number;
  propertyId: number;
  bookingId: number;
  commissionAmount: string;
  status: string;
  createdAt: string;
  paidAt?: string;
}

interface Withdrawal {
  id: number;
  amount: string;
  method: string;
  accountNumber: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

interface DellalaData {
  agent: {
    id: number;
    fullName: string;
    phoneNumber: string;
    telebirrAccount: string;
    status: string;
  };
  performance: AgentPerformance;
  recentCommissions: Commission[];
  recentWithdrawals: Withdrawal[];
}

export default function DellalaDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<DellalaData>({
    queryKey: ["/api/dellala/dashboard"],
  });

  const withdrawMutation = useMutation({
    mutationFn: async (withdrawalData: {
      amount: string;
      method: string;
      accountNumber: string;
    }) => {
      return await apiRequest("/api/dellala/withdraw", "POST", withdrawalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dellala/dashboard"] });
      toast({
        title: "✅ Withdrawal Requested",
        description: "Your withdrawal is being processed. You'll receive the funds within 24 hours.",
      });
    },
    onError: () => {
      toast({
        title: "❌ Withdrawal Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-40 w-full" />
          <div className="grid lg:grid-cols-4 gap-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 flex items-center justify-center">
        <Card className="max-w-md w-full border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-center text-emerald-900 dark:text-emerald-100">
              💼 Welcome to Dellala
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Join Alga's agent network and earn 5% commission on every booking for 36 months!
            </p>
            <Button
              onClick={() => setLocation("/become-agent")}
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white"
              data-testid="button-become-agent"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Start Earning Today
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { agent, performance, recentCommissions, recentWithdrawals } = data;
  const availableBalance = parseFloat(performance.availableBalance);

  const handleWithdrawal = (method: "telebirr" | "addispay") => {
    if (availableBalance < 100) {
      toast({
        title: "❌ Insufficient Balance",
        description: "Minimum withdrawal amount is 100 ETB.",
        variant: "destructive",
      });
      return;
    }

    withdrawMutation.mutate({
      amount: performance.availableBalance,
      method,
      accountNumber: agent.telebirrAccount,
    });
  };

  const earningsChartData = recentCommissions.slice(0, 7).reverse().map((c) => ({
    date: format(new Date(c.createdAt), "MMM dd"),
    amount: parseFloat(c.commissionAmount),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Agent Info */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-700 dark:to-emerald-600 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold" data-testid="text-agent-name">
                  {agent.fullName}
                </h1>
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm" data-testid="badge-agent-status">
                  {agent.status === "approved" ? "✅ Verified" : "⏳ Pending"}
                </Badge>
              </div>
              <p className="text-emerald-50 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {agent.phoneNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm mb-1">Available Balance</p>
              <p className="text-5xl font-bold" data-testid="text-available-balance">
                {availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })} ETB
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleWithdrawal("telebirr")}
            disabled={withdrawMutation.isPending || availableBalance < 100}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white h-16 text-lg"
            data-testid="button-withdraw-telebirr"
          >
            <Wallet className="mr-2 h-5 w-5" />
            {withdrawMutation.isPending ? "Processing..." : "Withdraw to Telebirr"}
          </Button>
          <Button
            onClick={() => handleWithdrawal("addispay")}
            disabled={withdrawMutation.isPending || availableBalance < 100}
            size="lg"
            variant="outline"
            className="border-2 border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 h-16 text-lg"
            data-testid="button-withdraw-addispay"
          >
            <ArrowUpRight className="mr-2 h-5 w-5" />
            {withdrawMutation.isPending ? "Processing..." : "Withdraw to Addispay"}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Lifetime Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400" data-testid="text-lifetime-earnings">
                {parseFloat(performance.totalCommissionEarned).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })} ETB
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-pending-earnings">
                {parseFloat(performance.totalCommissionPending).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })} ETB
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Total Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-400" data-testid="text-total-bookings">
                {performance.totalBookings}
              </p>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Home className="h-4 w-4 text-purple-600" />
                Active Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-400" data-testid="text-active-properties">
                {performance.totalPropertiesListed}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Chart */}
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-emerald-900 dark:text-emerald-100">
              💰 Recent Earnings (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {earningsChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={earningsChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                  <XAxis
                    dataKey="date"
                    stroke="#059669"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis
                    stroke="#059669"
                    style={{ fontSize: "12px" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #10b981",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} ETB`, "Commission"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: "#059669", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No earnings data yet. Start referring properties!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Commissions & Withdrawals */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Commissions */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Recent Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCommissions.length > 0 ? (
                  recentCommissions.slice(0, 5).map((commission) => (
                    <div
                      key={commission.id}
                      className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg"
                      data-testid={`commission-${commission.id}`}
                    >
                      <div>
                        <p className="font-semibold text-emerald-900 dark:text-emerald-100">
                          {parseFloat(commission.commissionAmount).toFixed(2)} ETB
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(commission.createdAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={commission.status === "paid" ? "default" : "secondary"}
                        className={
                          commission.status === "paid"
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-100 text-amber-800"
                        }
                        data-testid={`badge-commission-status-${commission.id}`}
                      >
                        {commission.status === "paid" ? "✅ Paid" : "⏳ Pending"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No commissions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Withdrawals */}
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader>
              <CardTitle className="text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Recent Withdrawals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentWithdrawals.length > 0 ? (
                  recentWithdrawals.slice(0, 5).map((withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg"
                      data-testid={`withdrawal-${withdrawal.id}`}
                    >
                      <div>
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          {parseFloat(withdrawal.amount).toFixed(2)} ETB
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {withdrawal.method} • {withdrawal.accountNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(withdrawal.requestedAt), "MMM dd, yyyy")}
                        </p>
                      </div>
                      <Badge
                        variant={withdrawal.status === "completed" ? "default" : "secondary"}
                        data-testid={`badge-withdrawal-status-${withdrawal.id}`}
                      >
                        {withdrawal.status === "completed" ? "✅ Completed" : "⏳ Processing"}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No withdrawals yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Banner */}
        <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Sparkles className="h-6 w-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-1">
                  💡 How Dellala Commissions Work
                </h3>
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                  You earn <strong>5% commission</strong> on every booking for properties you refer, 
                  for <strong>36 months</strong> from the first booking. Commissions are automatically 
                  credited to your available balance when guests complete payment. Withdraw anytime to 
                  Telebirr or Addispay (minimum 100 ETB).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
