import { useLocation } from "wouter";
import SimpleIDScanner from "@/components/simple-id-scanner";
import { useToast } from "@/hooks/use-toast";

export default function ScanIDPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleVerified = (data: any) => {
    toast({
      title: "ID Verified!",
      description: `Successfully verified Ethiopian ID: ${data.idNumber}`,
    });

    // Optional: Redirect after verification
    // setTimeout(() => setLocation("/"), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eth-cream via-white to-eth-cream/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-eth-brown dark:text-white mb-2">
            Ethiopian ID Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Scan your Ethiopian Digital ID QR code for instant verification
          </p>
        </div>

        {/* Scanner */}
        <SimpleIDScanner onVerified={handleVerified} />

        {/* Instructions */}
        <div className="mt-8 max-w-md mx-auto">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">
              How to scan:
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Tap "Scan Ethiopian ID" button</li>
              <li>Allow camera access when prompted</li>
              <li>Hold your ID's QR code in front of camera</li>
              <li>Wait for automatic verification</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
