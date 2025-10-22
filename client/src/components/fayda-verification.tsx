import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FaydaVerificationProps {
  onSuccess?: () => void;
  showStatus?: boolean;
}

interface FaydaStatus {
  verified: boolean;
  faydaId: string | null;
  verifiedAt: string | null;
}

export default function FaydaVerification({ onSuccess, showStatus = true }: FaydaVerificationProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [faydaId, setFaydaId] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // Check current verification status
  const { data: status, isLoading: statusLoading } = useQuery<FaydaStatus>({
    queryKey: ["/api/fayda/status"],
    enabled: showStatus,
  });

  // Verify Fayda ID mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/fayda/verify", {
        faydaId,
        dateOfBirth,
      });
    },
    onSuccess: (data) => {
      toast({
        title: "✓ Verification Successful",
        description: "Your Fayda ID has been verified successfully!",
      });
      
      // Invalidate queries to refresh user data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/fayda/status"] });
      
      // Clear form
      setFaydaId("");
      setDateOfBirth("");
      
      // Call success callback
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Unable to verify Fayda ID. Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate format
    if (!/^\d{12}$/.test(faydaId)) {
      toast({
        title: "Invalid Format",
        description: "Fayda ID must be exactly 12 digits",
        variant: "destructive",
      });
      return;
    }

    verifyMutation.mutate();
  };

  // If already verified, show status
  if (showStatus && !statusLoading && status?.verified) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle2 className="h-5 w-5" />
            Fayda ID Verified
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Fayda ID:</span>
            <Badge variant="outline" className="font-mono">
              {status.faydaId}
            </Badge>
          </div>
          {status.verifiedAt && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Verified on:</span>
              <span className="text-sm">
                {new Date(status.verifiedAt).toLocaleDateString()}
              </span>
            </div>
          )}
          <p className="text-xs text-green-600 mt-3">
            Your identity is verified using Ethiopia's National Digital ID system.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-eth-brown">
          <Shield className="h-5 w-5" />
          Fayda ID Verification
        </CardTitle>
        <CardDescription>
          Verify your identity using Ethiopia's National Digital ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50/50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              <strong>What is Fayda ID?</strong> Ethiopia's official 12-digit National Digital ID. 
              Required for all hosts and guests on Alga. Learn more at{" "}
              <a 
                href="https://id.gov.et" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline"
              >
                id.gov.et
              </a>
            </AlertDescription>
          </Alert>

          {/* Fayda ID Input */}
          <div>
            <Label htmlFor="faydaId" className="text-sm font-semibold">
              Fayda ID Number *
            </Label>
            <Input
              id="faydaId"
              type="text"
              placeholder="Enter 12-digit Fayda ID"
              value={faydaId}
              onChange={(e) => {
                // Only allow digits
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 12) {
                  setFaydaId(value);
                }
              }}
              maxLength={12}
              className="font-mono text-base"
              required
              data-testid="input-fayda-id"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your 12-digit National ID number from the Fayda system
            </p>
          </div>

          {/* Date of Birth (Optional for additional verification) */}
          <div>
            <Label htmlFor="dateOfBirth" className="text-sm font-semibold">
              Date of Birth <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              data-testid="input-dob"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Adding your date of birth improves verification accuracy
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-eth-brown hover:bg-eth-brown/90"
            disabled={verifyMutation.isPending || faydaId.length !== 12}
            data-testid="button-verify-fayda"
          >
            {verifyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Verify Fayda ID
              </>
            )}
          </Button>

          {/* Security Note */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-gray-600">
                <strong>Privacy & Security:</strong> Your Fayda ID is verified through Ethiopia's 
                National ID Program (NIDP). All data is encrypted and handled according to the 
                Digital Identification Proclamation 1284/2023.
              </div>
            </div>
          </div>

          {/* Development Mode Notice */}
          {import.meta.env.DEV && (
            <Alert className="border-yellow-200 bg-yellow-50/50">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-xs text-yellow-800">
                <strong>Development Mode:</strong> Running in sandbox mode. Any 12-digit number 
                will be accepted for testing purposes.
              </AlertDescription>
            </Alert>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
