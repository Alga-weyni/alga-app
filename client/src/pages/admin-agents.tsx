import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { SimplePagination } from "@/components/SimplePagination";
import {
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
  Home,
  Filter,
  FileText,
  Eye,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface Agent {
  id: number;
  userId: string;
  fullName: string;
  phoneNumber: string;
  telebirrAccount: string;
  city: string;
  subCity: string | null;
  businessName: string | null;
  idNumber: string | null;
  idDocumentUrl: string | null;
  status: string;
  totalEarnings: string;
  totalProperties: number;
  activeProperties: number;
  referralCode: string;
  createdAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
}

interface AgentsResponse {
  agents: Agent[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminAgents() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 15;
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [verificationAction, setVerificationAction] = useState<"verify" | "reject">("verify");
  const [rejectionReason, setRejectionReason] = useState("");
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, cityFilter]);

  const { data, isLoading } = useQuery<AgentsResponse>({
    queryKey: ["/api/admin/agents", page, statusFilter, cityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (cityFilter !== "all") params.append("city", cityFilter);
      
      const response = await fetch(`/api/admin/agents?${params.toString()}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch agents');
      }
      return response.json();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async ({ agentId, status, rejectionReason }: { agentId: number; status: string; rejectionReason?: string }) => {
      const response = await fetch(getApiUrl(`/api/admin/agents/${agentId}/verify`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, rejectionReason }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Verification failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/agents"] });
      toast({
        title: "✅ Agent Updated",
        description: verificationAction === "verify" ? "Agent has been verified successfully" : "Agent application has been rejected",
      });
      setVerificationDialogOpen(false);
      setRejectionReason("");
      setSelectedAgent(null);
    },
    onError: (error: any) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update agent status",
        variant: "destructive",
      });
    },
  });

  const handleVerify = (agent: Agent, action: "verify" | "reject") => {
    setSelectedAgent(agent);
    setVerificationAction(action);
    setVerificationDialogOpen(true);
  };

  const handleConfirmVerification = () => {
    if (!selectedAgent) return;

    if (verificationAction === "reject" && !rejectionReason.trim()) {
      toast({
        title: "❌ Rejection Reason Required",
        description: "Please provide a reason for rejecting this application",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate({
      agentId: selectedAgent.id,
      status: verificationAction === "verify" ? "verified" : "rejected",
      rejectionReason: verificationAction === "reject" ? rejectionReason : undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { label: "✅ Verified", variant: "default" as const, icon: CheckCircle },
      pending: { label: "⏳ Pending", variant: "secondary" as const, icon: Clock },
      rejected: { label: "❌ Rejected", variant: "destructive" as const, icon: XCircle },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className="gap-1" data-testid={`badge-${status}`}>
        <config.icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const agents = data?.agents || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  
  const stats = {
    total: total,
    verified: agents.filter(a => a.status === "verified").length,
    pending: agents.filter(a => a.status === "pending").length,
    rejected: agents.filter(a => a.status === "rejected").length,
    totalEarnings: agents.reduce((sum, a) => sum + parseFloat(a.totalEarnings || "0"), 0),
    totalProperties: agents.reduce((sum, a) => sum + (a.totalProperties || 0), 0),
  };

  const cities = ["all", ...Array.from(new Set(agents.map(a => a.city)))];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream/30 dark:bg-gray-900 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/30 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-dark-brown dark:text-cream mb-2">
            👥 Agent Management
          </h1>
          <p className="text-medium-brown dark:text-cream/80">
            Verify and manage Delala agent applications
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-total-agents">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-dark-brown dark:text-cream" data-testid="text-total-agents">
                {stats.total}
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                {stats.verified} verified, {stats.pending} pending
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-total-properties">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                Total Properties
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400" data-testid="text-total-properties">
                {stats.totalProperties}
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                Listed by agents
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-total-earnings">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-total-earnings">
                {(typeof stats.totalEarnings === 'number' ? stats.totalEarnings : parseFloat(stats.totalEarnings || '0')).toFixed(2)} Birr
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                All-time commissions
              </p>
            </CardContent>
          </Card>

          <Card className="border-medium-brown/20 dark:border-cream/20" data-testid="card-pending">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400" data-testid="text-pending">
                {stats.pending}
              </div>
              <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                Awaiting verification
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-medium-brown/20 dark:border-cream/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger data-testid="select-status-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <Label>City</Label>
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger data-testid="select-city-filter">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map(city => (
                      <SelectItem key={city} value={city}>
                        {city === "all" ? "All Cities" : city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Table */}
        <Card className="border-medium-brown/20 dark:border-cream/20">
          <CardHeader>
            <CardTitle>Agent Applications</CardTitle>
            <CardDescription>
              {total} agents found {totalPages > 1 && `(Page ${page} of ${totalPages})`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>ID Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Earnings</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-medium-brown dark:text-cream/60 py-12">
                        No agents found matching your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent) => (
                      <TableRow key={agent.id} data-testid={`row-agent-${agent.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-dark-brown dark:text-cream">
                              {agent.fullName}
                            </p>
                            {agent.businessName && (
                              <p className="text-xs text-medium-brown dark:text-cream/60">
                                {agent.businessName}
                              </p>
                            )}
                            <p className="text-xs text-medium-brown dark:text-cream/60 font-mono">
                              {agent.referralCode}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{agent.phoneNumber}</p>
                            <p className="text-xs text-medium-brown dark:text-cream/60">
                              TeleBirr: {agent.telebirrAccount}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{agent.city}</p>
                            {agent.subCity && (
                              <p className="text-xs text-medium-brown dark:text-cream/60">
                                {agent.subCity}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {agent.idDocumentUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setViewingDocument({ url: agent.idDocumentUrl!, name: agent.fullName });
                                setDocumentDialogOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              data-testid={`button-view-doc-${agent.id}`}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View ID
                            </Button>
                          ) : (
                            <span className="text-xs text-medium-brown/60 dark:text-cream/40">
                              Not uploaded
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(agent.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-semibold">{agent.activeProperties}</p>
                            <p className="text-xs text-medium-brown dark:text-cream/60">
                              of {agent.totalProperties} active
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {parseFloat(agent.totalEarnings || '0').toFixed(2)} Birr
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {format(new Date(agent.createdAt), "MMM d, yyyy")}
                          </p>
                        </TableCell>
                        <TableCell>
                          {agent.status === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleVerify(agent, "verify")}
                                data-testid={`button-verify-${agent.id}`}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerify(agent, "reject")}
                                data-testid={`button-reject-${agent.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {agent.status === "rejected" && agent.rejectionReason && (
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {agent.rejectionReason}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <SimplePagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent data-testid="dialog-verification">
          <DialogHeader>
            <DialogTitle>
              {verificationAction === "verify" ? "✅ Verify Agent" : "❌ Reject Application"}
            </DialogTitle>
            <DialogDescription>
              {selectedAgent && (
                <>
                  {verificationAction === "verify" 
                    ? `Are you sure you want to verify ${selectedAgent.fullName}? They will be able to start listing properties and earning commissions.`
                    : `Please provide a reason for rejecting ${selectedAgent.fullName}'s application.`
                  }
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {verificationAction === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g., Invalid TeleBirr account, incomplete information, etc."
                rows={4}
                data-testid="textarea-rejection-reason"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setVerificationDialogOpen(false);
                setRejectionReason("");
              }}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              variant={verificationAction === "verify" ? "default" : "destructive"}
              onClick={handleConfirmVerification}
              disabled={verifyMutation.isPending}
              data-testid="button-confirm"
            >
              {verifyMutation.isPending ? "Processing..." : (verificationAction === "verify" ? "Verify Agent" : "Reject Application")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ID Document View Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-2xl" data-testid="dialog-document-view">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              ID Document - {viewingDocument?.name}
            </DialogTitle>
            <DialogDescription>
              Review this document before approving the agent application.
            </DialogDescription>
          </DialogHeader>

          {viewingDocument && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                {viewingDocument.url.toLowerCase().endsWith('.pdf') ? (
                  <div className="p-8 text-center">
                    <FileText className="h-16 w-16 mx-auto text-medium-brown dark:text-cream/60 mb-4" />
                    <p className="text-sm text-medium-brown dark:text-cream/60 mb-4">
                      PDF document uploaded
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => window.open(viewingDocument.url, '_blank')}
                      data-testid="button-open-pdf"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open PDF in New Tab
                    </Button>
                  </div>
                ) : (
                  <img 
                    src={viewingDocument.url} 
                    alt="ID Document"
                    className="w-full h-auto max-h-[60vh] object-contain"
                  />
                )}
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(viewingDocument.url, '_blank')}
                  data-testid="button-open-fullsize"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Size
                </Button>
                <Button
                  onClick={() => setDocumentDialogOpen(false)}
                  data-testid="button-close-document"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
