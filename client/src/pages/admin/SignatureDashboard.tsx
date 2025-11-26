import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getApiUrl } from "@/lib/api-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { Search, Download, ShieldCheck, Unlock, AlertCircle, CheckCircle2, Filter, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConsentLog {
  id: number;
  signatureId: string;
  userId: string;
  action: string;
  timestamp: string;
  verified: boolean;
  signatureHash: string;
  otpId: string | null;
  faydaId: string | null;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
}

export default function SignatureDashboard() {
  const { toast } = useToast();
  
  // Filters
  const [userId, setUserId] = useState("");
  const [action, setAction] = useState("");
  const [verified, setVerified] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals
  const [decryptModalOpen, setDecryptModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  
  // Selected data
  const [selectedSignatureId, setSelectedSignatureId] = useState<string>("");
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [verifyResult, setVerifyResult] = useState<any>(null);
  const [exportFormat, setExportFormat] = useState("csv");
  
  // Auto-close timer for decrypt modal
  const [modalTimer, setModalTimer] = useState<number | null>(null);
  
  // Alert banner state
  const [bannerDismissed, setBannerDismissed] = useState(false);
  
  // Fetch unresolved alerts count
  const { data: alertsData } = useQuery({
    queryKey: ["/api/admin/signatures/alerts"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/admin/signatures/alerts?resolved=false&limit=100"), {
        credentials: "include",
      });
      if (!res.ok) return { total: 0, alerts: [] };
      return res.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });
  
  const unresolvedCount = alertsData?.total || 0;
  
  // Acknowledge all alerts mutation
  const acknowledgeAllMutation = useMutation({
    mutationFn: async () => {
      const alertIds = alertsData?.alerts?.map((alert: any) => alert.id) || [];
      if (alertIds.length === 0) return;
      await apiRequest("POST", "/api/admin/signatures/alerts/acknowledge", { alertIds });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/signatures/alerts"] });
      toast({
        title: "Alerts Acknowledged",
        description: `${unresolvedCount} alert(s) have been acknowledged`,
      });
      setBannerDismissed(true);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to acknowledge alerts",
        variant: "destructive",
      });
    },
  });
  
  // Build query params
  const queryParams = new URLSearchParams();
  if (userId) queryParams.append("userId", userId);
  if (action) queryParams.append("action", action);
  if (verified) queryParams.append("verified", verified);
  if (startDate) queryParams.append("startDate", startDate);
  if (endDate) queryParams.append("endDate", endDate);
  queryParams.append("page", String(page));
  queryParams.append("pageSize", String(pageSize));
  
  // Fetch signature logs
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/signatures", queryParams.toString()],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/admin/signatures?${queryParams.toString()}`), {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch signature logs");
      return res.json();
    },
  });
  
  // Verify signature integrity
  const verifyMutation = useMutation({
    mutationFn: async (signatureId: string) => {
      const res = await apiRequest("POST", `/api/admin/signatures/verify/${signatureId}`);
      return res;
    },
    onSuccess: (data) => {
      setVerifyResult(data);
      setVerifyModalOpen(true);
      toast({
        title: data.isValid ? "Signature Valid" : "Signature Invalid",
        description: data.message,
        variant: data.isValid ? "default" : "destructive",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify signature",
        variant: "destructive",
      });
    },
  });
  
  // Decrypt audit info
  const decryptMutation = useMutation({
    mutationFn: async (signatureId: string) => {
      const res = await fetch(getApiUrl(`/api/admin/signatures/decrypt/${signatureId}`), {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to decrypt");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setDecryptedData(data);
      setDecryptModalOpen(true);
      
      // Auto-close after 30 seconds
      const timer = window.setTimeout(() => {
        setDecryptModalOpen(false);
        setDecryptedData(null);
      }, 30000);
      
      setModalTimer(timer);
    },
    onError: (error: any) => {
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt audit information",
        variant: "destructive",
      });
    },
  });
  
  // Export signatures
  const exportMutation = useMutation({
    mutationFn: async (format: string) => {
      const filters: any = {};
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (verified) filters.verified = verified === 'true';
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      const res = await fetch(getApiUrl("/api/admin/signatures/export"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ format, filters }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Export failed");
      }
      
      // Download file
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("Content-Disposition")?.split("filename=")[1]?.replace(/"/g, "") || `export.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    },
    onSuccess: () => {
      setExportModalOpen(false);
      toast({
        title: "Export Successful",
        description: "Signature logs have been exported successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export signature logs",
        variant: "destructive",
      });
    },
  });
  
  const handleDecrypt = (signatureId: string) => {
    setSelectedSignatureId(signatureId);
    decryptMutation.mutate(signatureId);
  };
  
  const handleVerify = (signatureId: string) => {
    setSelectedSignatureId(signatureId);
    verifyMutation.mutate(signatureId);
  };
  
  const handleExport = () => {
    exportMutation.mutate(exportFormat);
  };
  
  const handleCloseDecryptModal = () => {
    if (modalTimer) {
      clearTimeout(modalTimer);
      setModalTimer(null);
    }
    setDecryptModalOpen(false);
    setDecryptedData(null);
  };
  
  const filteredLogs = data?.logs?.filter((log: ConsentLog) => {
    if (!searchTerm) return true;
    return (
      log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.signatureId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];
  
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2" data-testid="title-dashboard">
          Signature Dashboard
        </h1>
        <p className="text-muted-foreground">
          View and verify electronic signature consent logs (INSA Compliance)
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Compliant with Proclamation No. 1072/2018 & No. 1205/2020 – Alga Technologies PLC © 2025
        </p>
      </div>
      
      {/* Integrity Alert Banner */}
      {unresolvedCount > 0 && !bannerDismissed && (
        <Alert variant="destructive" className="mb-6" data-testid="alert-banner">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="flex items-center justify-between">
            <span>🚨 Signature Integrity Alert</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBannerDismissed(true)}
              className="h-6 w-6 p-0"
              data-testid="button-dismiss-banner"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertTitle>
          <AlertDescription>
            <div className="mt-2 mb-4">
              <strong>{unresolvedCount}</strong> unresolved signature failure(s) detected in the last 24 hours.
              Potential tampering or data integrity issues require immediate attention.
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setVerified("false");
                  setBannerDismissed(true);
                }}
                className="bg-background"
                data-testid="button-view-failed"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                View Failed Only
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setExportFormat("pdf");
                  setExportModalOpen(true);
                }}
                className="bg-background"
                data-testid="button-export-failures"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Failures (PDF)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => acknowledgeAllMutation.mutate()}
                disabled={acknowledgeAllMutation.isPending}
                className="bg-background"
                data-testid="button-acknowledge-all"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {acknowledgeAllMutation.isPending ? "Acknowledging..." : "Acknowledge All"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5" />
          <h2 className="font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">User ID</label>
            <Input
              placeholder="Filter by user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              data-testid="input-filter-userId"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Action</label>
            <Select value={action || "all"} onValueChange={(val) => setAction(val === "all" ? "" : val)}>
              <SelectTrigger data-testid="select-filter-action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="booking">Booking</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="confirm">Confirm</SelectItem>
                <SelectItem value="submit">Submit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Verification Status</label>
            <Select value={verified || "all"} onValueChange={(val) => setVerified(val === "all" ? "" : val)}>
              <SelectTrigger data-testid="select-filter-verified">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="true">Verified</SelectItem>
                <SelectItem value="false">Not Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              data-testid="input-filter-startDate"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              data-testid="input-filter-endDate"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search signatures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setUserId("");
              setAction("");
              setVerified("");
              setStartDate("");
              setEndDate("");
              setSearchTerm("");
              setPage(1);
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
          
          <Button
            onClick={() => setExportModalOpen(true)}
            data-testid="button-export"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </Card>
      
      {/* Results Summary */}
      <div className="mb-4 text-sm text-muted-foreground">
        Total: {data?.total || 0} records | Showing page {page} of {data?.totalPages || 1}
      </div>
      
      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Signature Hash</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading signature logs...
                </TableCell>
              </TableRow>
            ) : filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No signature logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log: ConsentLog) => (
                <TableRow key={log.id} data-testid={`row-signature-${log.id}`}>
                  <TableCell className="font-mono text-xs">{log.id}</TableCell>
                  <TableCell className="font-mono text-xs">{log.userId.substring(0, 20)}...</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    {log.verified ? (
                      <Badge className="bg-green-500">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Not Verified
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.signatureHash.substring(0, 20)}...
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVerify(log.signatureId)}
                        data-testid={`button-verify-${log.id}`}
                      >
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecrypt(log.signatureId)}
                        data-testid={`button-decrypt-${log.id}`}
                      >
                        <Unlock className="h-3 w-3 mr-1" />
                        Decrypt
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          data-testid="button-prev-page"
        >
          Previous
        </Button>
        
        <span className="text-sm text-muted-foreground">
          Page {page} of {data?.totalPages || 1}
        </span>
        
        <Button
          variant="outline"
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= (data?.totalPages || 1)}
          data-testid="button-next-page"
        >
          Next
        </Button>
      </div>
      
      {/* Decrypt Modal */}
      <Dialog open={decryptModalOpen} onOpenChange={handleCloseDecryptModal}>
        <DialogContent className="select-none" data-testid="modal-decrypt">
          <DialogHeader>
            <DialogTitle>Decrypted Audit Information</DialogTitle>
            <DialogDescription>
              This modal will auto-close in 30 seconds for security. Read-only view.
            </DialogDescription>
          </DialogHeader>
          
          {decryptedData && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID:</label>
                <p className="font-mono text-sm">{decryptedData.userId}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">IP Address:</label>
                <p className="font-mono text-sm">{decryptedData.ipAddress}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Device Info:</label>
                <p className="font-mono text-sm text-wrap break-words">{decryptedData.deviceInfo}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Session Verification:</label>
                <div className="flex gap-2 mt-1">
                  <Badge variant={decryptedData.sessionInfo.verified ? "default" : "secondary"}>
                    {decryptedData.sessionInfo.verified ? "Verified" : "Not Verified"}
                  </Badge>
                  {decryptedData.sessionInfo.faydaId && (
                    <Badge variant="outline">Fayda ID: {decryptedData.sessionInfo.faydaId}</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={handleCloseDecryptModal} data-testid="button-close-decrypt">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Verify Modal */}
      <Dialog open={verifyModalOpen} onOpenChange={setVerifyModalOpen}>
        <DialogContent data-testid="modal-verify">
          <DialogHeader>
            <DialogTitle>Signature Verification Result</DialogTitle>
            <DialogDescription>
              SHA-256 hash integrity check
            </DialogDescription>
          </DialogHeader>
          
          {verifyResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {verifyResult.isValid ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
                <span className={`font-semibold ${verifyResult.isValid ? 'text-green-500' : 'text-red-500'}`}>
                  {verifyResult.message}
                </span>
              </div>
              
              <div>
                <label className="text-sm font-medium">Original Hash:</label>
                <p className="font-mono text-xs break-all">{verifyResult.originalHash}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Recomputed Hash:</label>
                <p className="font-mono text-xs break-all">{verifyResult.recomputedHash}</p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setVerifyModalOpen(false)} data-testid="button-close-verify">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Modal */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent data-testid="modal-export">
          <DialogHeader>
            <DialogTitle>Export Signature Logs</DialogTitle>
            <DialogDescription>
              Choose export format. Current filters will be applied.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Export Format</label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger data-testid="select-export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="pdf">PDF (INSA-Ready Report)</SelectItem>
                  <SelectItem value="json">JSON (Developer Format)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• Maximum 10,000 records per export</p>
              <p>• Rate limit: 100 exports per day</p>
              <p>• All exports are logged for audit trail</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setExportModalOpen(false)} data-testid="button-cancel-export">
              Cancel
            </Button>
            <Button onClick={handleExport} disabled={exportMutation.isPending} data-testid="button-confirm-export">
              {exportMutation.isPending ? "Exporting..." : "Export"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
