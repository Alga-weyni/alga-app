import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, CheckCircle, Lock, Camera, Home, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-config";
import { queryClient } from "@/lib/queryClient";

interface Lockbox {
  id: number;
  propertyId: number;
  lockboxBrand: string;
  lockboxModel: string;
  serialNumber: string;
  installationLocation: string;
  verificationStatus: string;
  verificationPhotoUrl: string | null;
  installedAt: Date | null;
  property?: {
    title: string;
    address: string;
  };
}

interface SecurityCamera {
  id: number;
  propertyId: number;
  cameraType: string;
  location: string;
  verificationStatus: string;
  verificationPhotoUrl: string | null;
  installedAt: Date | null;
  property?: {
    title: string;
    address: string;
  };
}

interface Property {
  id: number;
  title: string;
  address: string;
  hostId: string;
  status: string;
}

export default function HardwareVerificationPanel() {
  const [selectedLockbox, setSelectedLockbox] = useState<Lockbox | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<SecurityCamera | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectType, setRejectType] = useState<'lockbox' | 'camera' | null>(null);
  const { toast } = useToast();

  // Fetch pending lockboxes
  const { data: pendingLockboxes, isLoading: loadingLockboxes } = useQuery<Lockbox[]>({
    queryKey: ["/api/lockboxes/pending"],
  });

  // Fetch pending security cameras
  const { data: pendingCameras, isLoading: loadingCameras } = useQuery<SecurityCamera[]>({
    queryKey: ["/api/security-cameras/pending"],
  });

  // Fetch properties without hardware
  const { data: propertiesWithoutHardware, isLoading: loadingProperties } = useQuery<Property[]>({
    queryKey: ["/api/properties/without-hardware"],
  });

  // Verify lockbox mutation
  const verifyLockboxMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      return apiRequest("POST", `/api/lockboxes/${id}/verify`, { 
        status, 
        rejectionReason: reason || null 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lockboxes/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/without-hardware"] });
      toast({
        title: "✅ Lockbox Verified",
        description: "Hardware verification status updated successfully",
      });
      setSelectedLockbox(null);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "❌ Verification Failed",
        description: "Failed to update lockbox verification status",
        variant: "destructive",
      });
    },
  });

  // Verify camera mutation
  const verifyCameraMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      return apiRequest("POST", `/api/security-cameras/${id}/verify`, { 
        status, 
        rejectionReason: reason || null 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security-cameras/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties/without-hardware"] });
      toast({
        title: "✅ Security Camera Verified",
        description: "Hardware verification status updated successfully",
      });
      setSelectedCamera(null);
      setIsRejectDialogOpen(false);
      setRejectionReason("");
    },
    onError: () => {
      toast({
        title: "❌ Verification Failed",
        description: "Failed to update camera verification status",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (type: 'lockbox' | 'camera', id: number) => {
    if (type === 'lockbox') {
      verifyLockboxMutation.mutate({ id, status: 'verified' });
    } else {
      verifyCameraMutation.mutate({ id, status: 'verified' });
    }
  };

  const handleRejectClick = (type: 'lockbox' | 'camera', item: Lockbox | SecurityCamera) => {
    setRejectType(type);
    if (type === 'lockbox') {
      setSelectedLockbox(item as Lockbox);
    } else {
      setSelectedCamera(item as SecurityCamera);
    }
    setIsRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "❌ Rejection Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    if (rejectType === 'lockbox' && selectedLockbox) {
      verifyLockboxMutation.mutate({
        id: selectedLockbox.id,
        status: 'rejected',
        reason: rejectionReason,
      });
    } else if (rejectType === 'camera' && selectedCamera) {
      verifyCameraMutation.mutate({
        id: selectedCamera.id,
        status: 'rejected',
        reason: rejectionReason,
      });
    }
  };

  const totalPending = (pendingLockboxes?.length || 0) + (pendingCameras?.length || 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#CD7F32]" />
              Pending Lockboxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#CD7F32]">
              {loadingLockboxes ? "..." : pendingLockboxes?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting operator verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Camera className="h-4 w-4 text-[#8B4513]" />
              Pending Cameras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#8B4513]">
              {loadingCameras ? "..." : pendingCameras?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting operator verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Missing Hardware
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {loadingProperties ? "..." : propertiesWithoutHardware?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Properties without hardware</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Lockboxes */}
      {pendingLockboxes && pendingLockboxes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#CD7F32]" />
              Pending Lockbox Verifications
            </CardTitle>
            <CardDescription>
              Review lockbox installations and approve/reject hardware
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {pendingLockboxes.map((lockbox) => (
                  <div
                    key={lockbox.id}
                    className="border rounded-lg p-4 space-y-3"
                    data-testid={`lockbox-verification-${lockbox.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`text-lockbox-property-${lockbox.id}`}>
                          {lockbox.property?.title || `Property #${lockbox.propertyId}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {lockbox.property?.address}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        Pending
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Brand:</span>
                        <p className="font-medium">{lockbox.lockboxBrand}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Model:</span>
                        <p className="font-medium">{lockbox.lockboxModel}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serial:</span>
                        <p className="font-medium">{lockbox.serialNumber}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{lockbox.installationLocation}</p>
                      </div>
                    </div>

                    {lockbox.verificationPhotoUrl && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Verification Photo:</p>
                        <img
                          src={lockbox.verificationPhotoUrl}
                          alt="Lockbox verification"
                          className="w-full max-w-md rounded-lg border"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove('lockbox', lockbox.id)}
                        disabled={verifyLockboxMutation.isPending}
                        data-testid={`button-approve-lockbox-${lockbox.id}`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectClick('lockbox', lockbox)}
                        disabled={verifyLockboxMutation.isPending}
                        data-testid={`button-reject-lockbox-${lockbox.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Pending Security Cameras */}
      {pendingCameras && pendingCameras.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#8B4513]" />
              Pending Security Camera Verifications
            </CardTitle>
            <CardDescription>
              Review security camera installations and approve/reject hardware
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {pendingCameras.map((camera) => (
                  <div
                    key={camera.id}
                    className="border rounded-lg p-4 space-y-3"
                    data-testid={`camera-verification-${camera.id}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold" data-testid={`text-camera-property-${camera.id}`}>
                          {camera.property?.title || `Property #${camera.propertyId}`}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {camera.property?.address}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                        Pending
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium">{camera.cameraType}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>
                        <p className="font-medium">{camera.location}</p>
                      </div>
                    </div>

                    {camera.verificationPhotoUrl && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Verification Photo:</p>
                        <img
                          src={camera.verificationPhotoUrl}
                          alt="Security camera verification"
                          className="w-full max-w-md rounded-lg border"
                        />
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove('camera', camera.id)}
                        disabled={verifyCameraMutation.isPending}
                        data-testid={`button-approve-camera-${camera.id}`}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleRejectClick('camera', camera)}
                        disabled={verifyCameraMutation.isPending}
                        data-testid={`button-reject-camera-${camera.id}`}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Properties Without Hardware */}
      {propertiesWithoutHardware && propertiesWithoutHardware.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5 text-orange-600" />
              Properties Without Hardware
            </CardTitle>
            <CardDescription>
              These properties are missing lockbox or security cameras
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {propertiesWithoutHardware.map((property) => (
                  <div
                    key={property.id}
                    className="border rounded-lg p-3 flex items-center justify-between"
                    data-testid={`property-without-hardware-${property.id}`}
                  >
                    <div>
                      <h4 className="font-semibold text-sm">{property.title}</h4>
                      <p className="text-xs text-muted-foreground">{property.address}</p>
                    </div>
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300">
                      Missing Hardware
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalPending === 0 && !loadingLockboxes && !loadingCameras && (
        <Card>
          <CardContent className="py-12 text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold mb-2">All Hardware Verified!</h3>
            <p className="text-muted-foreground">
              No pending lockbox or security camera verifications
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rejection Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Hardware Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this {rejectType === 'lockbox' ? 'lockbox' : 'security camera'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="e.g., Photo unclear, device not visible, incorrect model, improper installation..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              data-testid="input-rejection-reason"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsRejectDialogOpen(false);
                setRejectionReason("");
              }}
              data-testid="button-cancel-rejection"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={verifyLockboxMutation.isPending || verifyCameraMutation.isPending}
              data-testid="button-confirm-rejection"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
