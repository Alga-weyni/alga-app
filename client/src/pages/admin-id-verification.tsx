import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { getApiUrl, getImageUrl } from "@/lib/api-config";
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
import {
  CheckCircle,
  XCircle,
  Clock,
  FileCheck,
  Eye,
  UserCheck,
  AlertCircle,
  ArrowLeft,
  ZoomIn,
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

interface PendingDocument {
  id: number;
  userId: string;
  documentType: string;
  documentUrl: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
  };
}

export default function AdminIdVerification() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedDocument, setSelectedDocument] = useState<PendingDocument | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { data: documents, isLoading } = useQuery<PendingDocument[]>({
    queryKey: ["/api/operator/pending-documents"],
  });

  const approveMutation = useMutation({
    mutationFn: async (documentId: number) => {
      const response = await fetch(getApiUrl(`/api/operator/documents/${documentId}/approve`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Approval failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operator/pending-documents"] });
      toast({
        title: "ID Verified",
        description: "The user's ID has been verified successfully. They can now become a host.",
      });
      setActionDialogOpen(false);
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to verify the document",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ documentId, reason }: { documentId: number; reason: string }) => {
      const response = await fetch(getApiUrl(`/api/operator/documents/${documentId}/reject`), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Rejection failed");
      }

      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/operator/pending-documents"] });
      toast({
        title: "Document Rejected",
        description: "The user has been notified about the rejection.",
      });
      setActionDialogOpen(false);
      setRejectionReason("");
      setSelectedDocument(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject the document",
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (!selectedDocument) return;

    if (actionType === "approve") {
      approveMutation.mutate(selectedDocument.id);
    } else {
      if (!rejectionReason.trim()) {
        toast({
          title: "Reason Required",
          description: "Please provide a reason for rejection",
          variant: "destructive",
        });
        return;
      }
      rejectMutation.mutate({ documentId: selectedDocument.id, reason: rejectionReason });
    }
  };

  const openActionDialog = (document: PendingDocument, action: "approve" | "reject") => {
    setSelectedDocument(document);
    setActionType(action);
    setActionDialogOpen(true);
    setRejectionReason("");
  };

  const openImageViewer = (imageUrl: string) => {
    setViewingImage(getImageUrl(imageUrl));
    setImageDialogOpen(true);
  };

  const pendingCount = documents?.filter(d => d.status === 'pending').length || 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ID Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve guest ID documents for host applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingCount}</p>
                  <p className="text-sm text-gray-500">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {documents?.filter(d => d.status === 'approved').length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Approved Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {documents?.filter(d => d.status === 'rejected').length || 0}
                  </p>
                  <p className="text-sm text-gray-500">Rejected</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Pending ID Documents
                </CardTitle>
                <CardDescription>
                  Review uploaded ID documents to verify users for hosting
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="all">All Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Skeleton className="w-20 h-20 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-9 w-24" />
                  </div>
                ))}
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents
                  .filter(doc => statusFilter === 'all' || doc.status === statusFilter)
                  .map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                    data-testid={`document-row-${document.id}`}
                  >
                    <div 
                      className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer relative group flex-shrink-0"
                      onClick={() => openImageViewer(document.documentUrl)}
                    >
                      <img
                        src={getImageUrl(document.documentUrl)}
                        alt="ID Document"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-id.png';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {document.user?.firstName || 'Unknown'} {document.user?.lastName || 'User'}
                        </h3>
                        <Badge variant={
                          document.status === 'pending' ? 'secondary' :
                          document.status === 'approved' ? 'default' : 'destructive'
                        }>
                          {document.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {document.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {document.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                          {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {document.user?.email || 'No email'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {document.user?.phoneNumber || 'No phone'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted: {format(new Date(document.createdAt), 'MMM d, yyyy h:mm a')}
                      </p>
                      <p className="text-xs text-gray-400">
                        Document Type: {document.documentType || 'ID Document'}
                      </p>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openImageViewer(document.documentUrl)}
                        data-testid={`button-view-document-${document.id}`}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      {document.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => openActionDialog(document, 'approve')}
                            data-testid={`button-approve-${document.id}`}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => openActionDialog(document, 'reject')}
                            data-testid={`button-reject-${document.id}`}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Pending Documents
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  All ID verification requests have been processed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approve ID Verification
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Reject ID Verification
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? `Approve ${selectedDocument?.user?.firstName || 'this user'}'s ID? They will be able to list properties as a host.`
                : `Reject ${selectedDocument?.user?.firstName || 'this user'}'s ID verification? Please provide a reason.`
              }
            </DialogDescription>
          </DialogHeader>

          {selectedDocument && (
            <div className="py-4">
              <div className="flex items-center gap-4 mb-4">
                <div 
                  className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
                  onClick={() => openImageViewer(selectedDocument.documentUrl)}
                >
                  <img
                    src={getImageUrl(selectedDocument.documentUrl)}
                    alt="ID Document"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">
                    {selectedDocument.user?.firstName} {selectedDocument.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{selectedDocument.user?.email}</p>
                  <p className="text-sm text-gray-500">{selectedDocument.user?.phoneNumber}</p>
                </div>
              </div>

              {actionType === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                  <Textarea
                    id="rejection-reason"
                    placeholder="Please explain why the document is being rejected (e.g., blurry image, document expired, not a valid ID)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    data-testid="input-rejection-reason"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={approveMutation.isPending || rejectMutation.isPending}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              data-testid="button-confirm-action"
            >
              {(approveMutation.isPending || rejectMutation.isPending) ? 'Processing...' : 
               actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ID Document</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {viewingImage && (
              <img
                src={viewingImage}
                alt="ID Document Full View"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
