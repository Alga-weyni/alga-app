import { useLocation } from "wouter";
import UniversalIDScanner from "@/components/universal-id-scanner";
import { useToast } from "@/hooks/use-toast";

export default function ScanIDPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleVerified = (data: any) => {
    toast({
      title: "✅ Document Verified!",
      description: `Successfully verified: ${data.idNumber}`,
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
            🆔 Identity Verification
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-1">
            Required for all users - guests, hosts, and property owners
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Ethiopians: Digital ID | Foreigners: Passport, Driver's License, or National ID
          </p>
        </div>

        {/* Universal Scanner */}
        <UniversalIDScanner onVerified={handleVerified} />

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto grid md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
              🇪🇹 Ethiopian Citizens
            </h3>
            <ol className="text-sm text-green-800 dark:text-green-200 space-y-1 list-decimal list-inside">
              <li>Select "QR Scan" tab</li>
              <li>Tap "Scan Ethiopian ID QR Code"</li>
              <li>Hold QR code in front of camera</li>
              <li>Automatic verification</li>
            </ol>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
              🌍 Foreign Visitors
            </h3>
            <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
              <li>Select "Photo Upload" tab</li>
              <li>Take clear photo of your document</li>
              <li>Upload passport/license/ID</li>
              <li>Wait for verification</li>
            </ol>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 max-w-2xl mx-auto text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 All documents are encrypted and securely stored. We never share your personal information.
          </p>
        </div>
      </div>
    </div>
  );
}
