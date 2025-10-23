import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BackButton } from "@/components/back-button";
import { CheckCircle, XCircle, Clock, Building2, MapPin, Mail, Phone, DollarSign } from "lucide-react";

type ServiceProvider = {
  id: number;
  userId: string;
  businessName: string;
  serviceType: string;
  description: string;
  city: string;
  region: string;
  pricingModel: string;
  basePrice: string;
  verificationStatus: string;
  rejectionReason?: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
};

export default function AdminServiceProviders() {
  const { toast } = useToast();
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [basePrice, setBasePrice] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  // Fetch all service providers
  const { data: allProviders = [], isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ['/api/service-providers'],
  });

  const pendingProviders = allProviders.filter(p => p.verificationStatus === 'pending');
  const verifiedProviders = allProviders.filter(p => p.verificationStatus === 'verified');
  const rejectedProviders = allProviders.filter(p => p.verificationStatus === 'rejected');

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, basePrice }: { id: number; basePrice: string }) => {
      return apiRequest('POST', `/api/admin/service-providers/${id}/approve`, { basePrice });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-providers'] });
      toast({
        title: "Provider Approved",
        description: "Service provider has been approved and notified via email.",
      });
      setApprovalDialogOpen(false);
      setSelectedProvider(null);
      setBasePrice("");
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve provider",
        variant: "destructive",
      });
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      return apiRequest('POST', `/api/admin/service-providers/${id}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-providers'] });
      toast({
        title: "Provider Rejected",
        description: "Service provider has been rejected and notified via email.",
      });
      setRejectionDialogOpen(false);
      setSelectedProvider(null);
      setRejectionReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject provider",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setBasePrice("");
    setApprovalDialogOpen(true);
  };

  const handleReject = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setRejectionReason("");
    setRejectionDialogOpen(true);
  };

  const confirmApproval = () => {
    if (!selectedProvider || !basePrice) return;
    approveMutation.mutate({ id: selectedProvider.id, basePrice });
  };

  const confirmRejection = () => {
    if (!selectedProvider || !rejectionReason) return;
    rejectMutation.mutate({ id: selectedProvider.id, reason: rejectionReason });
  };

  const formatServiceType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
  };

  const renderProviderCard = (provider: ServiceProvider) => (
    <Card key={provider.id} className="border-[#e5ddd5]" data-testid={`card-provider-${provider.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl text-[#2d1405]" data-testid={`text-business-name-${provider.id}`}>
              {provider.businessName}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              {formatServiceType(provider.serviceType)}
            </CardDescription>
          </div>
          <Badge 
            variant={
              provider.verificationStatus === 'verified' ? 'default' :
              provider.verificationStatus === 'rejected' ? 'destructive' : 
              'secondary'
            }
            data-testid={`status-verification-${provider.id}`}
          >
            {provider.verificationStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
            {provider.verificationStatus === 'verified' && <CheckCircle className="h-3 w-3 mr-1" />}
            {provider.verificationStatus === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
            {provider.verificationStatus.charAt(0).toUpperCase() + provider.verificationStatus.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-[#5a4a42] leading-relaxed" data-testid={`text-description-${provider.id}`}>
            {provider.description}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#e5ddd5]">
          <div className="flex items-center gap-2 text-sm text-[#5a4a42]">
            <MapPin className="h-4 w-4" />
            <span data-testid={`text-city-${provider.id}`}>{provider.city}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5a4a42]">
            <DollarSign className="h-4 w-4" />
            <span data-testid={`text-price-${provider.id}`}>{provider.basePrice} ETB/{provider.pricingModel}</span>
          </div>
        </div>

        {provider.user && (
          <div className="grid grid-cols-1 gap-2 pt-2 border-t border-[#e5ddd5]">
            <div className="flex items-center gap-2 text-sm text-[#5a4a42]">
              <Mail className="h-4 w-4" />
              <span data-testid={`text-email-${provider.id}`}>{provider.user.email}</span>
            </div>
            {provider.user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm text-[#5a4a42]">
                <Phone className="h-4 w-4" />
                <span data-testid={`text-phone-${provider.id}`}>{provider.user.phoneNumber}</span>
              </div>
            )}
          </div>
        )}

        {provider.rejectionReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm font-semibold text-red-900 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-700">{provider.rejectionReason}</p>
          </div>
        )}
      </CardContent>

      {provider.verificationStatus === 'pending' && (
        <CardFooter className="flex gap-2 border-t border-[#e5ddd5] pt-4">
          <Button
            onClick={() => handleApprove(provider)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            data-testid={`button-approve-${provider.id}`}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={() => handleReject(provider)}
            variant="destructive"
            className="flex-1"
            data-testid={`button-reject-${provider.id}`}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#faf5f0] pt-24 pb-12">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d1405] mx-auto"></div>
            <p className="mt-4 text-[#5a4a42]">Loading applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5f0] pt-24 pb-12">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#2d1405] mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Service Provider Verification
          </h1>
          <p className="text-lg text-[#5a4a42]">
            Review and approve service provider applications
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="pending" data-testid="tab-pending">
              Pending ({pendingProviders.length})
            </TabsTrigger>
            <TabsTrigger value="verified" data-testid="tab-verified">
              Verified ({verifiedProviders.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              Rejected ({rejectedProviders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingProviders.length === 0 ? (
              <Card className="border-[#e5ddd5]">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-[#8b7a72] mx-auto mb-4" />
                  <p className="text-[#5a4a42]">No pending applications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingProviders.map(renderProviderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            {verifiedProviders.length === 0 ? (
              <Card className="border-[#e5ddd5]">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-[#8b7a72] mx-auto mb-4" />
                  <p className="text-[#5a4a42]">No verified providers yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {verifiedProviders.map(renderProviderCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            {rejectedProviders.length === 0 ? (
              <Card className="border-[#e5ddd5]">
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 text-[#8b7a72] mx-auto mb-4" />
                  <p className="text-[#5a4a42]">No rejected applications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rejectedProviders.map(renderProviderCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Approval Dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent data-testid="dialog-approve">
            <DialogHeader>
              <DialogTitle>Approve Service Provider</DialogTitle>
              <DialogDescription>
                Set the base price for {selectedProvider?.businessName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (ETB per hour)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  placeholder="500.00"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  data-testid="input-base-price"
                />
                <p className="text-sm text-[#8b7a72]">
                  This will be the starting hourly rate for this service provider
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApprovalDialogOpen(false)}
                data-testid="button-cancel-approve"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmApproval}
                disabled={!basePrice || approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-confirm-approve"
              >
                {approveMutation.isPending ? "Approving..." : "Approve & Notify"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
          <DialogContent data-testid="dialog-reject">
            <DialogHeader>
              <DialogTitle>Reject Service Provider</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting {selectedProvider?.businessName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">Rejection Reason</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="Please provide a clear reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  data-testid="input-rejection-reason"
                />
                <p className="text-sm text-[#8b7a72]">
                  This will be sent to the applicant via email
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRejectionDialogOpen(false)}
                data-testid="button-cancel-reject"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRejection}
                disabled={!rejectionReason || rejectMutation.isPending}
                variant="destructive"
                data-testid="button-confirm-reject"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject & Notify"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
