import { useState, useEffect } from "react";
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimplePagination } from "@/components/SimplePagination";
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

interface TransactionsResponse {
  transactions: PaymentTransaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface BookingData {
  id: number;
  propertyId: number;
  userId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: string;
  status: string;
  paymentStatus: string;
  paymentMethod?: string;
  paymentRef?: string;
  createdAt: string;
  property?: {
    title: string;
    city: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
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
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);
  const [revenueDetailsOpen, setRevenueDetailsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 15;

  // Redirect if not admin
  if (user && user.role !== 'admin' && user.role !== 'operator') {
    navigate('/');
    return null;
  }

  const { data: transactionsData, isLoading } = useQuery<TransactionsResponse>({
    queryKey: ['/api/admin/payment-transactions', page, statusFilter, gatewayFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: statusFilter,
        gateway: gatewayFilter,
        type: typeFilter,
      });
      const response = await fetch(`/api/admin/payment-transactions?${params}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    },
  });

  const transactions = transactionsData?.transactions || [];
  const totalPages = transactionsData?.totalPages || 1;

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, gatewayFilter, typeFilter]);

  const { data: stats } = useQuery<PaymentStats>({
    queryKey: ['/api/admin/payment-transactions/stats'],
  });

  // Fetch all bookings for admin
  const { data: allBookings = [], isLoading: bookingsLoading } = useQuery<BookingData[]>({
    queryKey: ['/api/admin/bookings'],
  });

  // Filter for pending payment bookings
  const pendingPaymentBookings = allBookings.filter(b => b.paymentStatus === 'pending');
  const paidBookings = allBookings.filter(b => b.paymentStatus === 'paid');
  
  // Calculate booking-based stats (in addition to transaction stats)
  const bookingStats = {
    totalBookings: allBookings.length,
    totalBookingAmount: allBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0),
    pendingPaymentCount: pendingPaymentBookings.length,
    pendingPaymentAmount: pendingPaymentBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0),
    paidCount: paidBookings.length,
    paidAmount: paidBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0),
  };

  // State for viewing booking details
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [bookingDetailsOpen, setBookingDetailsOpen] = useState(false);

  // Mark booking as paid mutation
  const markAsPaidMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      console.log('[MARK-PAID] Attempting to mark booking as paid:', bookingId);
      const response = await apiRequest('PATCH', `/api/bookings/${bookingId}/payment`, {
        paymentStatus: 'paid',
        paymentReference: `ADMIN-VERIFIED-${Date.now()}`
      });
      console.log('[MARK-PAID] Response:', response);
      return response;
    },
    onSuccess: (data) => {
      console.log('[MARK-PAID] Success:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Payment Confirmed",
        description: "Booking has been marked as paid and confirmed.",
      });
      setMarkingPaidId(null);
      setBookingDetailsOpen(false);
    },
    onError: (error: any) => {
      console.error('[MARK-PAID] Error:', error);
      toast({
        title: "Failed to Mark as Paid",
        description: error.message || "Could not update payment status. Please check console for details.",
        variant: "destructive",
      });
      setMarkingPaidId(null);
    },
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

        {/* Stats Cards - Booking-based payments */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#8b7355]" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Total Bookings</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-total-transactions">{bookingStats.totalBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="border-[#e5ddd5] cursor-pointer hover:border-green-400 hover:shadow-md transition-all"
            onClick={() => setRevenueDetailsOpen(true)}
            data-testid="card-total-revenue"
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Total Revenue</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-total-amount">{formatAmount(String(bookingStats.paidAmount), 'ETB')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Pending Payments</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-pending-count">{bookingStats.pendingPaymentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Pending Amount</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-pending-amount">{formatAmount(String(bookingStats.pendingPaymentAmount), 'ETB')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#e5ddd5]">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-[#5a4a42]">Paid Bookings</p>
                  <p className="text-xl font-bold text-[#2d1810]" data-testid="text-completed-count">{bookingStats.paidCount}</p>
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

        {/* Pending Bookings Section */}
        <Card className="border-[#e5ddd5] mb-6">
          <CardHeader className="bg-yellow-50 border-b border-yellow-200">
            <CardTitle className="text-[#2d1810] flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Payment Bookings
              {pendingPaymentBookings.length > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800 ml-2">{pendingPaymentBookings.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Bookings awaiting payment confirmation - mark as paid when payment is verified</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#8b7355]" />
              </div>
            ) : pendingPaymentBookings.length === 0 ? (
              <div className="text-center py-8 text-[#5a4a42]">
                <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-500 opacity-70" />
                <p className="font-medium">All bookings are paid!</p>
                <p className="text-sm mt-1">No pending payments at this time</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Guest</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPaymentBookings.map((booking) => (
                      <TableRow key={booking.id} data-testid={`row-pending-booking-${booking.id}`}>
                        <TableCell className="font-mono font-semibold" data-testid={`text-booking-id-${booking.id}`}>
                          #{booking.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {booking.user?.firstName} {booking.user?.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{booking.user?.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[150px] truncate" title={booking.property?.title}>
                            {booking.property?.title || `Property #${booking.propertyId}`}
                          </div>
                          <div className="text-xs text-gray-500">{booking.property?.city}</div>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div>{format(new Date(booking.checkIn), 'MMM d')}</div>
                          <div className="text-xs text-gray-500">to {format(new Date(booking.checkOut), 'MMM d, yyyy')}</div>
                        </TableCell>
                        <TableCell className="font-semibold text-[#2d1810]" data-testid={`text-booking-amount-${booking.id}`}>
                          {formatAmount(booking.totalPrice, 'ETB')}
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Clock className="h-3 w-3 mr-1" />
                            {booking.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedBooking(booking);
                              setBookingDetailsOpen(true);
                            }}
                            data-testid={`button-view-details-${booking.id}`}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
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
            ) : transactions.length === 0 ? (
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
                    {transactions.map((transaction) => (
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

        {/* Pagination - Always visible */}
        <SimplePagination
          page={page}
          limit={limit}
          total={transactionsData?.total || 0}
          onPageChange={setPage}
        />

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

        {/* Booking Details Dialog */}
        <Dialog open={bookingDetailsOpen} onOpenChange={setBookingDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-[#8b7355]" />
                Booking #{selectedBooking?.id} - Payment Details
              </DialogTitle>
              <DialogDescription>
                Review all booking and payment information before confirming payment
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                {/* Guest Information */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">👤</span> Guest Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-blue-700">Name:</span>
                      <p className="font-medium">{selectedBooking.user?.firstName} {selectedBooking.user?.lastName}</p>
                    </div>
                    <div>
                      <span className="text-blue-700">Email:</span>
                      <p className="font-medium">{selectedBooking.user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Property Information */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <span className="text-lg">🏠</span> Property
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-green-700">Property:</span>
                      <p className="font-medium">{selectedBooking.property?.title || `Property #${selectedBooking.propertyId}`}</p>
                    </div>
                    <div>
                      <span className="text-green-700">Location:</span>
                      <p className="font-medium">{selectedBooking.property?.city || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-purple-700">Check-in:</span>
                      <p className="font-medium">{format(new Date(selectedBooking.checkIn), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <span className="text-purple-700">Check-out:</span>
                      <p className="font-medium">{format(new Date(selectedBooking.checkOut), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <span className="text-purple-700">Guests:</span>
                      <p className="font-medium">{selectedBooking.guests} guest(s)</p>
                    </div>
                    <div>
                      <span className="text-purple-700">Booking Status:</span>
                      <p className="font-medium">{selectedBooking.status}</p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" /> Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-yellow-700">Total Amount:</span>
                      <p className="font-bold text-lg text-[#2d1810]">{formatAmount(selectedBooking.totalPrice, 'ETB')}</p>
                    </div>
                    <div>
                      <span className="text-yellow-700">Payment Status:</span>
                      <Badge className={selectedBooking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                    {selectedBooking.paymentMethod && (
                      <div>
                        <span className="text-yellow-700">Payment Method:</span>
                        <p className="font-medium">{selectedBooking.paymentMethod}</p>
                      </div>
                    )}
                    {selectedBooking.paymentRef && (
                      <div>
                        <span className="text-yellow-700">Payment Reference:</span>
                        <p className="font-mono text-xs">{selectedBooking.paymentRef}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-yellow-700">Booked On:</span>
                      <p className="font-medium">{format(new Date(selectedBooking.createdAt), 'MMM d, yyyy h:mm a')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingDetailsOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Revenue Details Dialog */}
        <Dialog open={revenueDetailsOpen} onOpenChange={setRevenueDetailsOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Revenue Breakdown
              </DialogTitle>
              <DialogDescription>
                Detailed breakdown of all paid bookings and revenue
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-green-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-800">{formatAmount(String(bookingStats.paidAmount), 'ETB')}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">Paid Bookings</p>
                  <p className="text-2xl font-bold text-blue-800">{bookingStats.paidCount}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-xs text-yellow-700">Pending Revenue</p>
                  <p className="text-2xl font-bold text-yellow-800">{formatAmount(String(bookingStats.pendingPaymentAmount), 'ETB')}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-700">Average Booking</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {bookingStats.paidCount > 0 
                      ? formatAmount(String(bookingStats.paidAmount / bookingStats.paidCount), 'ETB')
                      : 'ETB 0.00'
                    }
                  </p>
                </div>
              </div>

              {/* Paid Bookings List */}
              <div className="border rounded-lg">
                <div className="bg-green-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Paid Bookings ({bookingStats.paidCount})
                  </h3>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Property</TableHead>
                        <TableHead>Dates</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBookings
                        .filter((b: BookingData) => b.paymentStatus === 'paid')
                        .map((booking: BookingData) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-mono text-sm">#{booking.id}</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{booking.user?.firstName} {booking.user?.lastName}</p>
                                <p className="text-xs text-gray-500">{booking.user?.email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium truncate max-w-[150px]">{booking.property?.title}</p>
                                <p className="text-xs text-gray-500">{booking.property?.city}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">
                                {format(new Date(booking.checkIn), 'MMM d')} - {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                              </p>
                            </TableCell>
                            <TableCell className="text-right font-semibold text-green-700">
                              {formatAmount(booking.totalPrice, 'ETB')}
                            </TableCell>
                          </TableRow>
                        ))}
                      {allBookings.filter((b: BookingData) => b.paymentStatus === 'paid').length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                            No paid bookings yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRevenueDetailsOpen(false)}>
                Close
              </Button>
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
