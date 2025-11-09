import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Download
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PaymentTransaction {
  id: number;
  transactionId: string;
  paymentGateway: string;
  amount: string;
  status: string;
  reconciled: boolean;
  relatedBookingId: number | null;
  createdAt: string;
}

interface INSACompliance {
  id: number;
  complianceCategory: string;
  requirement: string;
  status: string;
  dueDate: string | null;
  completedDate: string | null;
}

export default function PaymentsComplianceTab() {
  const [gatewayFilter, setGatewayFilter] = useState<string>("all");
  const [activeSection, setActiveSection] = useState<"payments" | "insa">("payments");

  const { data: transactions } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/admin/payments/transactions"],
  });

  const { data: compliance } = useQuery<INSACompliance[]>({
    queryKey: ["/api/admin/insa/compliance"],
  });

  // Mock data until API is created
  const mockTransactions: PaymentTransaction[] = transactions || [];
  const mockCompliance: INSACompliance[] = compliance || [];

  const filteredTransactions = mockTransactions.filter(t => 
    gatewayFilter === "all" || t.paymentGateway === gatewayFilter
  );

  const unreconciledPayments = mockTransactions.filter(t => !t.reconciled).length;
  const telebirrCount = mockTransactions.filter(t => t.paymentGateway === "telebirr").length;
  const chapaCount = mockTransactions.filter(t => t.paymentGateway === "chapa").length;
  const stripeCount = mockTransactions.filter(t => t.paymentGateway === "stripe").length;
  const totalVolume = mockTransactions.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);

  const pendingINSA = mockCompliance.filter(c => c.status === "pending").length;
  const completedINSA = mockCompliance.filter(c => c.status === "completed").length;

  const exportPaymentsCSV = () => {
    if (!filteredTransactions.length) return;
    
    const headers = ["Transaction ID", "Gateway", "Amount", "Status", "Reconciled", "Booking ID", "Date"];
    const rows = filteredTransactions.map(t => [
      t.transactionId,
      t.paymentGateway,
      t.amount,
      t.status,
      t.reconciled ? "Yes" : "No",
      t.relatedBookingId || "N/A",
      new Date(t.createdAt).toLocaleDateString()
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payment-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Section Switcher */}
      <div className="flex gap-2">
        <Button
          variant={activeSection === "payments" ? "default" : "outline"}
          onClick={() => setActiveSection("payments")}
          data-testid="section-payments"
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Payment Reconciliation
        </Button>
        <Button
          variant={activeSection === "insa" ? "default" : "outline"}
          onClick={() => setActiveSection("insa")}
          data-testid="section-insa"
        >
          <Shield className="h-4 w-4 mr-2" />
          INSA Compliance Tracker
        </Button>
      </div>

      {/* Payments Section */}
      {activeSection === "payments" && (
        <>
          {/* Payment Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-[#CD7F32]" />
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ETB {totalVolume.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">All gateways</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">TeleBirr</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{telebirrCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Chapa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{chapaCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Stripe</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stripeCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Transactions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  Unreconciled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{unreconciledPayments}</div>
                <p className="text-xs text-muted-foreground mt-1">Need review</p>
              </CardContent>
            </Card>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-[#CD7F32]" />
                    Payment Transaction Reconciliation
                  </CardTitle>
                  <CardDescription>
                    Track and reconcile payments across all gateways
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportPaymentsCSV}
                  disabled={!filteredTransactions.length}
                  data-testid="button-export-payments-csv"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button
                  variant={gatewayFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGatewayFilter("all")}
                >
                  All Gateways
                </Button>
                <Button
                  variant={gatewayFilter === "telebirr" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGatewayFilter("telebirr")}
                >
                  TeleBirr ({telebirrCount})
                </Button>
                <Button
                  variant={gatewayFilter === "chapa" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGatewayFilter("chapa")}
                >
                  Chapa ({chapaCount})
                </Button>
                <Button
                  variant={gatewayFilter === "stripe" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setGatewayFilter("stripe")}
                >
                  Stripe ({stripeCount})
                </Button>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No payment transactions yet</p>
                  <p className="text-xs mt-1">Transaction tracking will appear here once payments are processed</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reconciled</TableHead>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-mono text-sm">{transaction.transactionId}</TableCell>
                        <TableCell className="capitalize">{transaction.paymentGateway}</TableCell>
                        <TableCell className="text-right font-mono">
                          ETB {parseFloat(transaction.amount).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            transaction.status === "completed" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {transaction.reconciled ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-orange-600" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {transaction.relatedBookingId ? `#${transaction.relatedBookingId}` : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString('en-ET')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* INSA Compliance Section */}
      {activeSection === "insa" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-[#CD7F32]" />
                  Total Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockCompliance.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Tracked items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedINSA}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {mockCompliance.length > 0 ? Math.round((completedINSA / mockCompliance.length) * 100) : 0}% complete
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingINSA}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#CD7F32]" />
                INSA Security Compliance Tracker
              </CardTitle>
              <CardDescription>
                Track security audit requirements and evidence (TIN: 0101809194)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockCompliance.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No compliance requirements tracked yet</p>
                  <p className="text-xs mt-1">INSA audit requirements will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Completed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCompliance.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.complianceCategory}</TableCell>
                        <TableCell>{item.requirement}</TableCell>
                        <TableCell>
                          <Badge className={
                            item.status === "completed" 
                              ? "bg-green-100 text-green-800" 
                              : item.status === "in_progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }>
                            {item.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-ET') : "N/A"}
                        </TableCell>
                        <TableCell className="text-sm">
                          {item.completedDate ? new Date(item.completedDate).toLocaleDateString('en-ET') : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
