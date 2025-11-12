import { ReactNode, useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { ConsentNotice } from "@/components/consent-notice";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ConsentButtonProps extends ButtonProps {
  children: ReactNode;
  onConsentedClick?: () => void | Promise<void>;
  actionType?: "booking" | "submit" | "confirm" | "payment";
  relatedEntityType?: string;
  relatedEntityId?: string;
  requiresConsent?: boolean;
}

export function ConsentButton({
  children,
  onConsentedClick,
  actionType,
  relatedEntityType,
  relatedEntityId,
  requiresConsent = true,
  onClick,
  ...buttonProps
}: ConsentButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecordingConsent, setIsRecordingConsent] = useState(false);

  const inferActionType = (): "booking" | "submit" | "confirm" | "payment" => {
    if (actionType) return actionType;

    const childText = typeof children === "string" ? children.toLowerCase() : "";
    
    if (childText.includes("book")) return "booking";
    if (childText.includes("confirm")) return "confirm";
    if (childText.includes("pay")) return "payment";
    
    return "submit";
  };

  const getIdentificationMethod = (): string => {
    if (user?.faydaVerified) return "fayda_id";
    if (user?.phoneVerified) return "otp_phone";
    if (user?.email) return "otp_email";
    return "unknown";
  };

  const getIdentificationValue = (): string => {
    if (user?.faydaVerified && user?.faydaId) return user.faydaId;
    if (user?.phoneVerified && user?.phoneNumber) return user.phoneNumber;
    if (user?.email) return user.email;
    return "anonymous";
  };

  const getConsentText = (type: string): string => {
    switch (type) {
      case "booking":
        return "By confirming this booking, you electronically sign and agree to Alga's Terms of Service and Booking Policy. This e-signature has the same legal effect as a handwritten signature under Ethiopian Electronic Signature Proclamation No. 1072/2018.";
      case "payment":
        return "By proceeding with payment, you electronically authorize this transaction. This e-signature is legally binding under Ethiopian Electronic Signature Proclamation No. 1072/2018 and Electronic Transactions Proclamation No. 1205/2020.";
      case "confirm":
        return "By clicking confirm, you electronically sign and acknowledge your agreement. This e-signature has the same legal validity as a handwritten signature under Ethiopian law (Proclamation No. 1072/2018).";
      default:
        return "By submitting this form, you provide your electronic signature in accordance with Ethiopian Electronic Signature Proclamation No. 1072/2018, which has the same legal effect as a handwritten signature.";
    }
  };

  const recordConsent = async (type: string) => {
    if (!user) return;

    try {
      await apiRequest("POST", "/api/consent", {
        userId: user.id,
        actionType: type,
        consentText: getConsentText(type),
        legalReference: "Proclamation No. 1072/2018",
        identificationMethod: getIdentificationMethod(),
        identificationValue: getIdentificationValue(),
        relatedEntityType: relatedEntityType || null,
        relatedEntityId: relatedEntityId || null,
        consentGiven: true,
      });
    } catch (error) {
      console.error("Failed to record consent:", error);
      toast({
        title: "Consent Recording Failed",
        description: "We couldn't save your consent record. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!requiresConsent) {
      onClick?.(e);
      return;
    }

    const type = inferActionType();

    setIsRecordingConsent(true);
    
    try {
      await recordConsent(type);
      
      if (onConsentedClick) {
        await onConsentedClick();
      } else if (onClick) {
        onClick(e);
      }
    } catch (error) {
      console.error("Consent or action failed:", error);
    } finally {
      setIsRecordingConsent(false);
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        {...buttonProps}
        onClick={handleClick}
        disabled={buttonProps.disabled || isRecordingConsent}
        data-testid={`button-${inferActionType()}`}
      >
        {isRecordingConsent ? "Processing..." : children}
      </Button>
      
      {requiresConsent && (
        <ConsentNotice actionType={inferActionType()} />
      )}
    </div>
  );
}
