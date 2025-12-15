import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  DollarSign,
  Eye,
  FileCheck,
  AlertCircle,
  TrendingUp,
  Calendar,
  Filter
} from "lucide-react";
import { format } from "date-fns";

interface PaymentTransaction {
  id: number;
  transactionId: string;
  paymentGateway: string;
  transactionType: string;
  amount: string;
  currency: string;
  status: string;
  relatedBookingId?: number;
  relatedAgentId?: number;
  payerUserId?: string;
  recipientUserId?: string;
  gatewayResponse?: any;
  reconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  payer?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  unreconciledCount: number;
}

export default function AdminPayments() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [reconcileNotes, setReconcileNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gatewayFilter, setGatewayFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Redirect if not admin
  if (user && user.role !== 'admin' && user.role !== 'operator') {
    navigate('/');
    return null;
  }

  const { data: transactions = [], isLoading } = useQuery<PaymentTransaction[]>({
    queryKey: ['/api/admin/payment-transactions'],
  });

  const { data: stats } = useQuery<PaymentStats>({
    queryKey: ['/api/admin/payment-transactions/stats'],
  });

  const reconcileMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: number; notes: string }) => {
      return apiRequest('PATCH', `/api/admin/payment-transactions/${id}/reconcile`, { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions/stats'] });
      toast({
        title: "Transaction Reconciled",
        description: "Payment has been marked as reconciled.",
      });
      setReconcileDialogOpen(false);
      setSelectedTransaction(null);
      setReconcileNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Reconciliation Failed",
        description: error.message || "Failed to reconcile payment",
        variant: "destructive",
      });
    },
  });

  const filteredTransactions = transactions.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (gatewayFilter !== "all" && t.paymentGateway !== gatewayFilter) return false;
    if (typeFilter !== "all" && t.transactionType !== typeFilter) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1" />Refunded</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getGatewayBadge = (gateway: string) => {
    const colors: Record<string, string> = {
      arifpay: "bg-purple-100 text-purple-800",
      chapa: "bg-green-100 text-green-800",
      telebirr: "bg-orange-100 text-orange-800",
      stripe: "bg-blue-100 text-blue-800",
      paypal: "bg-indigo-100 text-indigo-800",
      cbe: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[gateway] || "bg-gray-100 text-gray-800"}>{gateway.toUpperCase()}</Badge>;
  };

  const formatAmount = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: currency || 'ETB',
      minimumFractionDigits: 2,
    }).format(parseFloat(amount));
  };

  const handleViewDetails = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setDetailsDialogOpen(true);
  };

  const handleReconcile = (transaction: PaymentTransaction) => {
    setSelectedTransaction(transaction);
    setReconcileNotes("");
    setReconcileDialogOpen(true);
  };

  const confirmReconcile = () => {
    if (!selectedTransaction) return;
    reconcileMutation.mutate({ id: selectedTransaction.id, notes: reconcileNotes });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf8f4] to-[#f5ebe0]">
      <Header />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <BackButton />
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-[#2d1810]" data-testid="text-page-title">Payment Control</h1>
            <p className="text-[#5a4a42] mt-1">Monitor and manage all ArifPay transactions</p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/payment-transactions'] })}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#8b7355]" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Total</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-total-transactions">{stats?.totalTransactions || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Total Amount</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-total-amount">{formatAmount(String(stats?.totalAmount || 0), 'ETB')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Pending</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-pending-count">{stats?.pendingCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Completed</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-completed-count">{stats?.completedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Failed</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-failed-count">{stats?.failedCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Unreconciled</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-unreconciled-count">{stats?.unreconciledCount || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-[#e5ddd5] mb-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#5a4a42]" />
                <span className="text-sm font-medium text-[#2d1810]">Filters:</span>
              </div>
              <div className="flex-1 flex flex-wrap gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={gatewayFilter} onValueChange={setGatewayFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-gateway-filter">
                    <SelectValue placeholder="Gateway" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gateways</SelectItem>
                    <SelectItem value="arifpay">ArifPay</SelectItem>
                    <SelectItem value="chapa">Chapa</SelectItem>
                    <SelectItem value="telebirr">Telebirr</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]" data-testid="select-type-filter">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="booking">Booking</SelectItem>
                    <SelectItem value="commission">Commission</SelectItem>
                    <SelectItem value="refund">Refund</SelectItem>
                    <SelectItem value="payout">Payout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="border-[#e5ddd5]">
          <CardHeader>
            <CardTitle className="text-[#2d1810]">Payment Transactions</CardTitle>
            <CardDescription>All payment transactions across gateways</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-[#8b7355]" />
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-[#5a4a42]">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reconciled</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                        <TableCell className="font-mono text-sm" data-testid={`text-txn-id-${transaction.id}`}>
                          {transaction.transactionId.substring(0, 12)}...
                        </TableCell>
                        <TableCell>{getGatewayBadge(transaction.paymentGateway)}</TableCell>
                        <TableCell className="capitalize">{transaction.transactionType}</TableCell>
                        <TableCell className="font-semibold" data-testid={`text-amount-${transaction.id}`}>
                          {formatAmount(transaction.amount, transaction.currency)}
                        </TableCell>
                        <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                        <TableCell>
                          {transaction.reconciled ? (
                            <Badge className="bg-green-100 text-green-800">
                              <FileCheck className="h-3 w-3 mr-1" />Yes
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">No</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-[#5a4a42]">
                          {format(new Date(transaction.createdAt), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleViewDetails(transaction)}
                              data-testid={`button-view-${transaction.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {!transaction.reconciled && transaction.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-green-600 border-green-300"
                                onClick={() => handleReconcile(transaction)}
                                data-testid={`button-reconcile-${transaction.id}`}
                              >
                                <FileCheck className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>Complete transaction information</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Transaction ID</Label>
                    <p className="font-mono text-sm" data-testid="text-detail-txn-id">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Gateway</Label>
                    <p>{getGatewayBadge(selectedTransaction.paymentGateway)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Type</Label>
                    <p className="capitalize">{selectedTransaction.transactionType}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Status</Label>
                    <p>{getStatusBadge(selectedTransaction.status)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Amount</Label>
                    <p className="text-lg font-bold" data-testid="text-detail-amount">
                      {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Created</Label>
                    <p>{format(new Date(selectedTransaction.createdAt), 'PPpp')}</p>
                  </div>
                  {selectedTransaction.relatedBookingId && (
                    <div>
                      <Label className="text-xs text-[#5a4a42]">Related Booking</Label>
                      <p>#{selectedTransaction.relatedBookingId}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Reconciled</Label>
                    <p>{selectedTransaction.reconciled ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                {selectedTransaction.gatewayResponse && (
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Gateway Response</Label>
                    <pre className="mt-1 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(selectedTransaction.gatewayResponse, null, 2)}
                    </pre>
                  </div>
                )}
                {selectedTransaction.notes && (
                  <div>
                    <Label className="text-xs text-[#5a4a42]">Notes</Label>
                    <p className="text-sm">{selectedTransaction.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reconcile Dialog */}
        <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reconcile Transaction</DialogTitle>
              <DialogDescription>Mark this transaction as reconciled with banking records</DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-[#5a4a42]">Transaction: {selectedTransaction.transactionId}</p>
                  <p className="text-lg font-bold">{formatAmount(selectedTransaction.amount, selectedTransaction.currency)}</p>
                </div>
                <div>
                  <Label htmlFor="notes">Reconciliation Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={reconcileNotes}
                    onChange={(e) => setReconcileNotes(e.target.value)}
                    placeholder="Add any notes about this reconciliation..."
                    className="mt-1"
                    data-testid="input-reconcile-notes"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setReconcileDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={confirmReconcile}
                disabled={reconcileMutation.isPending}
                data-testid="button-confirm-reconcile"
              >
                {reconcileMutation.isPending ? 'Processing...' : 'Confirm Reconciliation'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
