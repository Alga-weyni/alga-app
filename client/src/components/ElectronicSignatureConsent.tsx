import { useState } from "react";
import { Info, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button, ButtonProps } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ElectronicSignatureConsentProps extends Omit<ButtonProps, 'onClick'> {
  children: React.ReactNode;
  onConsented: () => void | Promise<void>;
  action: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, any>;
  showViewTerms?: boolean;
}

export function ElectronicSignatureConsent({
  children,
  onConsented,
  action,
  relatedEntityType,
  relatedEntityId,
  metadata,
  showViewTerms = true,
  disabled,
  ...buttonProps
}: ElectronicSignatureConsentProps) {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAgree = (checked: boolean) => {
    setHasAgreed(checked);
  };

  const handleSubmit = async () => {
    if (!hasAgreed) {
      toast({
        title: "Consent Required",
        description: "You must agree to the electronic signature consent to proceed.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to proceed.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Record electronic signature
      const result = await apiRequest("POST", "/api/electronic-signature", {
        action,
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
        metadata: metadata || {},
      });

      console.log('[SIGNATURE] Recorded:', result.signatureId);

      // Execute the consented action
      await onConsented();

      toast({
        title: "✅ Signature Recorded",
        description: `Your electronic signature has been securely recorded (ID: ${result.signatureId?.substring(0, 8)}...).`,
        variant: "default",
      });
    } catch (error: any) {
      console.error('[SIGNATURE] Failed:', error);
      toast({
        title: "Signature Recording Failed",
        description: error.message || "Failed to record your electronic signature. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4" data-testid="electronic-signature-consent">
      {/* Legal Consent Notice */}
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed space-y-3">
          <p className="font-semibold">Electronic Signature Consent</p>
          <p className="text-xs">
            By clicking 'I Agree,' you consent that this action constitutes your electronic 
            signature under Ethiopian law (Proclamations No. 1072/2018 and No. 1205/2020).
          </p>
          {showViewTerms && (
            <a 
              href="/terms" 
              target="_blank"
              className="text-xs text-blue-700 dark:text-blue-300 underline hover:text-blue-900 dark:hover:text-blue-100 flex items-center gap-1"
              data-testid="link-view-terms"
            >
              <FileText className="h-3 w-3" />
              View Terms
            </a>
          )}
        </AlertDescription>
      </Alert>

      {/* Consent Checkbox */}
      <div className="flex items-start space-x-3 p-4 border rounded-lg bg-white dark:bg-gray-900">
        <Checkbox
          id="electronic-signature-agree"
          checked={hasAgreed}
          onCheckedChange={handleAgree}
          disabled={isProcessing || disabled}
          data-testid="checkbox-agree"
          className="mt-0.5"
        />
        <label
          htmlFor="electronic-signature-agree"
          className="text-sm font-medium leading-relaxed cursor-pointer select-none"
        >
          I Agree - I understand that clicking "{children}" will constitute my electronic 
          signature under Ethiopian Electronic Signature Proclamation No. 1072/2018.
        </label>
      </div>

      {/* Primary Action Button */}
      <Button
        {...buttonProps}
        onClick={handleSubmit}
        disabled={!hasAgreed || isProcessing || disabled}
        data-testid="button-submit"
        className="w-full"
      >
        {isProcessing ? "Processing..." : children}
      </Button>

      {/* Legal Reference Footer */}
      <p className="text-xs text-muted-foreground text-center">
        INSA (Information Network Security Agency) - Regulatory Authority for Electronic Signatures in Ethiopia
      </p>
    </div>
  );
}
