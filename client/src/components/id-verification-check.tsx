import { useQuery } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle, Shield } from "lucide-react";

interface IDVerificationCheckProps {
  required?: boolean;
  showCard?: boolean;
}

interface User {
  idVerified?: boolean;
  idDocumentType?: string;
  idNumber?: string;
  idCountry?: string;
}

export default function IDVerificationCheck({ required = false, showCard = true }: IDVerificationCheckProps) {
  const [, setLocation] = useLocation();
  
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  if (isLoading) return null;

  const isVerified = user?.idVerified;

  if (!required && isVerified) return null;

  if (isVerified) {
    return showCard ? (
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
              ID Verified ✓
            </h4>
            <p className="text-sm text-green-800 dark:text-green-200">
              {user.idDocumentType === 'ethiopian_id' 
                ? '🇪🇹 Ethiopian Digital ID verified' 
                : `🌍 ${user.idDocumentType === 'passport' ? 'Passport' : user.idDocumentType === 'drivers_license' ? "Driver's License" : 'ID'} verified`}
            </p>
            {user.idNumber && (
              <p className="text-xs text-green-700 dark:text-green-300 mt-1 font-mono">
                ID: {user.idNumber}
              </p>
            )}
          </div>
        </div>
      </Card>
    ) : null;
  }

  return (
    <Alert variant="destructive" className="border-orange-500 bg-orange-50 dark:bg-orange-900/20">
      <AlertCircle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-900 dark:text-orange-100">
        {required ? '🔒 ID Verification Required' : '⚠️ ID Not Verified'}
      </AlertTitle>
      <AlertDescription className="text-orange-800 dark:text-orange-200">
        {required ? (
          <p className="mb-3">
            You must verify your identity to {window.location.pathname.includes('booking') ? 'complete bookings' : 'access this feature'}.
            This is required for all users - guests, hosts, and property owners.
          </p>
        ) : (
          <p className="mb-3">
            Complete ID verification to unlock all features and increase trust with other users.
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => setLocation('/scan-id')}
            className="bg-orange-600 hover:bg-orange-700"
            size="sm"
            data-testid="button-verify-now"
          >
            <Shield className="w-4 h-4 mr-2" />
            Verify ID Now
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
