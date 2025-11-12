import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConsentNoticeProps {
  actionType?: "booking" | "submit" | "confirm" | "payment";
  className?: string;
}

export function ConsentNotice({ actionType = "submit", className = "" }: ConsentNoticeProps) {
  const getConsentText = () => {
    switch (actionType) {
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

  return (
    <Alert className={`bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 ${className}`} data-testid="alert-consent">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
        <strong className="font-semibold">E-Signature Consent:</strong> {getConsentText()}
      </AlertDescription>
    </Alert>
  );
}
