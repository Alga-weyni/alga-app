import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import UniversalIDScanner from "@/components/universal-id-scanner";
import { apiRequest } from "@/lib/api-config";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Building2, Shield, AlertCircle } from "lucide-react";

interface BecomeHostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export default function BecomeHostDialog({ open, onOpenChange, user }: BecomeHostDialogProps) {
  const [step, setStep] = useState<"welcome" | "verify" | "success" | "pending">("welcome");
  const [verificationData, setVerificationData] = useState<any>(null);
  const { toast } = useToast();

  const submitHostRequestMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/host-requests", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setStep("pending");
      toast({
        title: "Request Submitted!",
        description: "Your host application is now under review by our team",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit host request",
        variant: "destructive",
      });
    },
  });

  const handleVerificationComplete = async (data: any) => {
    setVerificationData(data);
    
    // Auto-submit the host request with verification data
    await submitHostRequestMutation.mutateAsync({
      userId: user?.id,
      idData: data,
    });
  };

  const handleClose = () => {
    setStep("welcome");
    setVerificationData(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {step === "welcome" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-eth-brown" />
                Become an Alga Host
              </DialogTitle>
              <DialogDescription>
                Share your property and earn income by welcoming guests to Ethiopia
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-eth-brown/5 to-eth-brown/10 p-6 rounded-lg border border-eth-brown/20">
                  <h3 className="font-semibold text-eth-brown mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Host Benefits
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Earn extra income from your property</li>
                    <li>• Flexible hosting schedule</li>
                    <li>• Professional support team</li>
                    <li>• Secure payment processing</li>
                    <li>• Property listing verification</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Requirements
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Valid government-issued ID</li>
                    <li>• Property ownership/lease rights</li>
                    <li>• Meet safety standards</li>
                    <li>• Provide accurate listing details</li>
                    <li>• Responsive communication</li>
                  </ul>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>ID Verification Required:</strong> To ensure platform safety and trust, all hosts must complete identity verification. 
                  Your information is securely encrypted and only used for verification purposes.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  data-testid="button-cancel-host-registration"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep("verify")}
                  className="bg-eth-brown hover:bg-eth-brown/90"
                  data-testid="button-start-verification"
                >
                  Start Verification
                </Button>
              </div>
            </div>
          </>
        )}

        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle>Identity Verification</DialogTitle>
              <DialogDescription>
                Scan your ID or upload a photo to verify your identity
              </DialogDescription>
            </DialogHeader>

            <UniversalIDScanner onVerified={handleVerificationComplete} />

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setStep("welcome")}
                data-testid="button-back-to-welcome"
              >
                Back
              </Button>
            </div>
          </>
        )}

        {step === "pending" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-6 w-6" />
                Application Submitted!
              </DialogTitle>
              <DialogDescription>
                Your host application is now under review
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100/50 p-6 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">What happens next?</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Our verification team will review your ID</li>
                  <li>• Review typically takes 24-48 hours</li>
                  <li>• You'll receive an email notification</li>
                  <li>• Once approved, you can start listing properties</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll be notified via email once your verification is complete. 
                  Check your account settings to track your verification status.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button
                  onClick={handleClose}
                  className="bg-eth-brown hover:bg-eth-brown/90"
                  data-testid="button-close-success"
                >
                  Got it!
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
