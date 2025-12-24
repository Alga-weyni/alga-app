import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Home,
  Briefcase,
  Image as ImageIcon,
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
  rejectionReason?: string | null;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    idDocumentUrl?: string | null;
  };
}

interface ServiceProvider {
  id: number;
  userId: string;
  businessName: string;
  serviceType: string;
  description: string;
  city: string;
  region: string;
  idDocumentUrl: string | null;
  verificationStatus: string;
  rejectionReason: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
  };
}

export default function AdminIdVerification() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"hosts" | "providers">("hosts");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedDocument, setSelectedDocument] = useState<PendingDocument | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [rejectionReason, setRejectionReason] = useState("");
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  const { data: documents, isLoading: isLoadingDocs } = useQuery<PendingDocument[]>({
    queryKey: ["/api/operator/pending-documents"],
  });

  const { data: serviceProviders, isLoading: isLoadingProviders } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/admin/service-providers"],
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

  const approveProviderMutation = useMutation({
    mutationFn: async (providerId: number) => {
      return apiRequest("PATCH", `/api/admin/service-providers/${providerId}/verify`, { status: "approved" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-providers"] });
      toast({
        title: "Provider Approved",
        description: "The service provider has been verified successfully.",
      });
      setActionDialogOpen(false);
      setSelectedProvider(null);
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve the provider",
        variant: "destructive",
      });
    },
  });

  const rejectProviderMutation = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: number; reason: string }) => {
      return apiRequest("PATCH", `/api/admin/service-providers/${providerId}/verify`, { 
        status: "rejected",
        rejectionReason: reason 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/service-providers"] });
      toast({
        title: "Provider Rejected",
        description: "The service provider has been notified about the rejection.",
      });
      setActionDialogOpen(false);
      setRejectionReason("");
      setSelectedProvider(null);
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject the provider",
        variant: "destructive",
      });
    },
  });

  const handleHostAction = () => {
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

  const handleProviderAction = () => {
    if (!selectedProvider) return;

    if (actionType === "approve") {
      approveProviderMutation.mutate(selectedProvider.id);
    } else {
      if (!rejectionReason.trim()) {
        toast({
          title: "Reason Required",
          description: "Please provide a reason for rejection",
          variant: "destructive",
        });
        return;
      }
      rejectProviderMutation.mutate({ providerId: selectedProvider.id, reason: rejectionReason });
    }
  };

  const openHostActionDialog = (document: PendingDocument, action: "approve" | "reject") => {
    setSelectedDocument(document);
    setSelectedProvider(null);
    setActionType(action);
    setActionDialogOpen(true);
    setRejectionReason("");
  };

  const openProviderActionDialog = (provider: ServiceProvider, action: "approve" | "reject") => {
    setSelectedProvider(provider);
    setSelectedDocument(null);
    setActionType(action);
    setActionDialogOpen(true);
    setRejectionReason("");
  };

  const openImageViewer = (imageUrl: string) => {
    if (!imageUrl) return;
    let fullUrl = imageUrl;
    if (!imageUrl.startsWith('http') && !imageUrl.startsWith('/uploads/')) {
      fullUrl = getImageUrl(imageUrl);
    }
    setViewingImage(fullUrl);
    setImageDialogOpen(true);
  };

  const getDocumentImageUrl = (url: string, fallbackUrl?: string | null): string => {
    const effectiveUrl = url && url !== '/placeholder-scanned-id' ? url : fallbackUrl;
    if (!effectiveUrl) return '';
    if (effectiveUrl.startsWith('http')) return effectiveUrl;
    if (effectiveUrl.startsWith('/uploads/')) return effectiveUrl;
    return getImageUrl(effectiveUrl);
  };

  const pendingHostDocs = documents?.filter(d => d.status === 'pending').length || 0;
  const pendingProviders = serviceProviders?.filter(p => p.verificationStatus === 'pending').length || 0;
  const approvedHostDocs = documents?.filter(d => d.status === 'approved').length || 0;
  const approvedProviders = serviceProviders?.filter(p => p.verificationStatus === 'approved').length || 0;

  const filteredDocs = documents?.filter(doc => statusFilter === 'all' || doc.status === statusFilter) || [];
  const filteredProviders = serviceProviders?.filter(p => 
    statusFilter === 'all' || p.verificationStatus === statusFilter
  ) || [];

  const DocumentImage = ({ url, fallbackUrl, alt, className }: { url: string; fallbackUrl?: string | null; alt: string; className?: string }) => {
    const [hasError, setHasError] = useState(false);
    const imageUrl = getDocumentImageUrl(url, fallbackUrl);

    if (!imageUrl || hasError) {
      return (
        <div className={`flex items-center justify-center bg-gray-200 dark:bg-gray-700 ${className}`}>
          <ImageIcon className="w-8 h-8 text-gray-400" />
          <span className="ml-2 text-xs text-gray-500">No image</span>
        </div>
      );
    }

    return (
      <img
        src={imageUrl}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  };

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
            Review and approve ID documents for host and service provider applications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingHostDocs}</p>
                  <p className="text-sm text-gray-500">Pending Host IDs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/30">
                  <Briefcase className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingProviders}</p>
                  <p className="text-sm text-gray-500">Pending Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedHostDocs}</p>
                  <p className="text-sm text-gray-500">Approved Hosts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                  <UserCheck className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{approvedProviders}</p>
                  <p className="text-sm text-gray-500">Approved Providers</p>
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
                  Verification Requests
                </CardTitle>
                <CardDescription>
                  Review uploaded ID documents for host and service provider applications
                </CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="all">All Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "hosts" | "providers")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="hosts" className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Become Host
                  {pendingHostDocs > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-yellow-100 text-yellow-800">
                      {pendingHostDocs}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="providers" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Become Service Provider
                  {pendingProviders > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-orange-100 text-orange-800">
                      {pendingProviders}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hosts">
                {isLoadingDocs ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="w-32 h-32 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    ))}
                  </div>
                ) : filteredDocs.length > 0 ? (
                  <div className="space-y-4">
                    {filteredDocs.map((document) => (
                      <div
                        key={document.id}
                        className="flex flex-col lg:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                        data-testid={`document-row-${document.id}`}
                      >
                        <div 
                          className="w-full lg:w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer relative group flex-shrink-0 border-2 border-dashed border-gray-300"
                          onClick={() => openImageViewer(getDocumentImageUrl(document.documentUrl, document.user?.idDocumentUrl))}
                        >
                          <DocumentImage 
                            url={document.documentUrl}
                            fallbackUrl={document.user?.idDocumentUrl}
                            alt="ID Document"
                            className="w-full h-full object-contain"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white" />
                            <span className="ml-2 text-white font-medium">View Full Size</span>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
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
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Email:</span> {document.user?.email || 'No email'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Phone:</span> {document.user?.phoneNumber || 'No phone'}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Document Type:</span> {document.documentType?.replace(/_/g, ' ') || 'ID Document'}
                            </p>
                            <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                              Submitted: {format(new Date(document.createdAt), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openImageViewer(getDocumentImageUrl(document.documentUrl, document.user?.idDocumentUrl))}
                            data-testid={`button-view-document-${document.id}`}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Document
                          </Button>
                          {document.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openHostActionDialog(document, 'approve')}
                                data-testid={`button-approve-${document.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openHostActionDialog(document, 'reject')}
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
                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Host Verification Requests
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending "Become Host" ID documents to review.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="providers">
                {isLoadingProviders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
                        <Skeleton className="w-32 h-32 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                        <Skeleton className="h-9 w-24" />
                      </div>
                    ))}
                  </div>
                ) : filteredProviders.length > 0 ? (
                  <div className="space-y-4">
                    {filteredProviders.map((provider) => (
                      <div
                        key={provider.id}
                        className="flex flex-col lg:flex-row gap-4 p-4 border rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                        data-testid={`provider-row-${provider.id}`}
                      >
                        <div 
                          className="w-full lg:w-48 h-48 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer relative group flex-shrink-0 border-2 border-dashed border-gray-300"
                          onClick={() => provider.idDocumentUrl && openImageViewer(provider.idDocumentUrl)}
                        >
                          {provider.idDocumentUrl ? (
                            <>
                              <DocumentImage 
                                url={provider.idDocumentUrl} 
                                alt="ID Document"
                                className="w-full h-full object-contain"
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ZoomIn className="w-8 h-8 text-white" />
                                <span className="ml-2 text-white font-medium">View Full Size</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                <p className="text-sm">No ID uploaded</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                              {provider.businessName}
                            </h3>
                            <Badge variant={
                              provider.verificationStatus === 'pending' ? 'secondary' :
                              provider.verificationStatus === 'approved' ? 'default' : 'destructive'
                            }>
                              {provider.verificationStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                              {provider.verificationStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {provider.verificationStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                              {provider.verificationStatus.charAt(0).toUpperCase() + provider.verificationStatus.slice(1)}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Service Type:</span> {provider.serviceType?.replace(/_/g, ' ')}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                              <span className="font-medium">Location:</span> {provider.city}, {provider.region}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                              <span className="font-medium">Description:</span> {provider.description}
                            </p>
                            {provider.rejectionReason && (
                              <p className="text-red-600 text-xs mt-2">
                                <span className="font-medium">Rejection Reason:</span> {provider.rejectionReason}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-row lg:flex-col gap-2 justify-end">
                          {provider.idDocumentUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openImageViewer(provider.idDocumentUrl!)}
                              data-testid={`button-view-provider-${provider.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Document
                            </Button>
                          )}
                          {provider.verificationStatus === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openProviderActionDialog(provider, 'approve')}
                                data-testid={`button-approve-provider-${provider.id}`}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => openProviderActionDialog(provider, 'reject')}
                                data-testid={`button-reject-provider-${provider.id}`}
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
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No Service Provider Requests
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      No pending "Become Service Provider" applications to review.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Approve {selectedDocument ? 'Host' : 'Service Provider'} Verification
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Reject {selectedDocument ? 'Host' : 'Service Provider'} Verification
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? selectedDocument 
                  ? `Approve ${selectedDocument.user?.firstName || 'this user'}'s ID? They will be able to list properties as a host.`
                  : `Approve ${selectedProvider?.businessName || 'this provider'}? They will be able to offer services.`
                : selectedDocument
                  ? `Reject ${selectedDocument.user?.firstName || 'this user'}'s ID verification? Please provide a reason.`
                  : `Reject ${selectedProvider?.businessName || 'this provider'}? Please provide a reason.`
              }
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {selectedDocument && (
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div 
                  className="w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border"
                  onClick={() => openImageViewer(getDocumentImageUrl(selectedDocument.documentUrl, selectedDocument.user?.idDocumentUrl))}
                >
                  <DocumentImage 
                    url={selectedDocument.documentUrl}
                    fallbackUrl={selectedDocument.user?.idDocumentUrl}
                    alt="ID Document"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-lg mb-2">
                    {selectedDocument.user?.firstName} {selectedDocument.user?.lastName}
                  </h4>
                  <p className="text-sm text-gray-500 mb-1">{selectedDocument.user?.email}</p>
                  <p className="text-sm text-gray-500 mb-1">{selectedDocument.user?.phoneNumber}</p>
                  <p className="text-sm text-gray-500">
                    Document: {selectedDocument.documentType?.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
            )}

            {selectedProvider && (
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div 
                  className="w-full md:w-64 h-64 bg-gray-100 rounded-lg overflow-hidden cursor-pointer border"
                  onClick={() => selectedProvider.idDocumentUrl && openImageViewer(selectedProvider.idDocumentUrl)}
                >
                  {selectedProvider.idDocumentUrl ? (
                    <DocumentImage 
                      url={selectedProvider.idDocumentUrl} 
                      alt="ID Document"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-lg mb-2">{selectedProvider.businessName}</h4>
                  <p className="text-sm text-gray-500 mb-1">
                    Service: {selectedProvider.serviceType?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    Location: {selectedProvider.city}, {selectedProvider.region}
                  </p>
                  <p className="text-sm text-gray-500 line-clamp-3">
                    {selectedProvider.description}
                  </p>
                </div>
              </div>
            )}

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

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={selectedDocument ? handleHostAction : handleProviderAction}
              disabled={approveMutation.isPending || rejectMutation.isPending || approveProviderMutation.isPending || rejectProviderMutation.isPending}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
              data-testid="button-confirm-action"
            >
              {(approveMutation.isPending || rejectMutation.isPending || approveProviderMutation.isPending || rejectProviderMutation.isPending) 
                ? 'Processing...' 
                : actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>ID Document - Full View</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4 overflow-auto">
            {viewingImage && (
              <img
                src={viewingImage}
                alt="ID Document Full View"
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
