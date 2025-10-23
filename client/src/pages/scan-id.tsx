import { useNavigate } from "react-router-dom";
import UniversalIDScanner from "@/components/universal-id-scanner";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ScanIDPage() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2]">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-eth-brown mb-2">
            🆔 Identity Verification
          </h1>
          <p className="text-eth-brown mb-1">
            Required for all users - guests, hosts, and property owners
          </p>
          <p className="text-sm text-eth-brown/70">
            Ethiopians & Diaspora with Yellow Card: Digital ID (QR) | Foreign Visitors: Passport, Driver's License, or National ID
          </p>
        </div>

        {/* Universal Scanner */}
        <UniversalIDScanner onVerified={handleVerified} />

        {/* Instructions */}
        <div className="mt-8 max-w-2xl mx-auto grid md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-2 border-eth-orange/30 rounded-lg p-4 shadow-lg">
            <h3 className="font-semibold text-sm text-eth-brown mb-2 flex items-center gap-2">
              🇪🇹 Ethiopian Citizens & Diaspora
            </h3>
            <p className="text-xs text-eth-brown/80 mb-2 italic">
              Have a Yellow Card (Ethiopian Digital ID)? Use this option, even if you carry an international passport.
            </p>
            <ol className="text-sm text-eth-brown space-y-1 list-decimal list-inside">
              <li>Select "QR Scan" tab</li>
              <li>Tap "Scan Ethiopian ID QR Code"</li>
              <li>Hold QR code in front of camera</li>
              <li>Automatic verification</li>
            </ol>
          </div>

          <div className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-2 border-eth-orange/30 rounded-lg p-4 shadow-lg">
            <h3 className="font-semibold text-sm text-eth-brown mb-2 flex items-center gap-2">
              🌍 Foreign Visitors
            </h3>
            <ol className="text-sm text-eth-brown space-y-1 list-decimal list-inside">
              <li>Select "Photo Upload" tab</li>
              <li>Take clear photo of your document</li>
              <li>Upload passport/license/ID</li>
              <li>Wait for verification</li>
            </ol>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 max-w-2xl mx-auto text-center">
          <p className="text-xs text-eth-brown/70">
            🔒 All documents are encrypted and securely stored. We never share your personal information.
          </p>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
