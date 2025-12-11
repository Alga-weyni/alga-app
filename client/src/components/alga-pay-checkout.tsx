import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, XCircle, CheckCircle2, CreditCard } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AlgaPayCheckoutProps {
  amount: number;
  currency?: string;
  bookingId: number;
  method?: "chapa" | "stripe" | "arifpay"; // Internal routing only
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

/**
 * Alga Pay Checkout Component
 * White-labeled payment experience
 * Users only see "Alga Pay" branding
 */
export default function AlgaPayCheckout({
  amount,
  currency = "ETB",
  bookingId,
  method = "chapa",
  onSuccess,
  onError,
  onCancel,
}: AlgaPayCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializePayment();
    
    return () => {
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      // Call Alga Pay unified endpoint
      const response: any = await apiRequest("POST", "/api/alga-pay", {
        orderId: bookingId,
        amount,
        method,
        email: "guest@alga.app", // Will be replaced with actual user email
      });

      if (response.success && response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        setTxRef(response.txRef);
        
        // Start polling for payment verification
        startVerificationPolling(response.txRef);
      } else {
        throw new Error("Failed to initialize Alga Pay");
      }
    } catch (error: any) {
      console.error('[Alga Pay] Initialization error:', error);
      onError(error.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const startVerificationPolling = (tx_ref: string) => {
    // Poll every 3 seconds to check payment status
    verificationIntervalRef.current = setInterval(async () => {
      await verifyPayment(tx_ref);
    }, 3000);
  };

  const verifyPayment = async (tx_ref: string) => {
    try {
      // Check booking payment status
      const response: any = await apiRequest("GET", `/api/bookings/${bookingId}`);
      
      if (response.paymentStatus === 'confirmed') {
        handlePaymentComplete();
      }
    } catch (error) {
      // Silent fail, continue polling
    }
  };

  const handlePaymentComplete = () => {
    if (paymentCompleted) return;
    
    setPaymentCompleted(true);
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
    }
    
    // Small delay to show success state
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#CD7F32]" />
          <p className="text-lg font-medium text-[#2d1405]">
            Preparing secure Alga Pay checkout...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (paymentCompleted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-[#2d1405]">Payment Successful!</h3>
          <p className="text-center text-gray-600">
            Your payment has been processed securely through Alga Pay.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Alga Pay Branding */}
      <div className="bg-gradient-to-r from-[#CD7F32] to-[#2d1405] p-6 rounded-t-lg">
        <div className="flex items-center gap-3 text-white">
          <CreditCard className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Alga Pay</h2>
            <p className="text-sm text-white/90">Secure Payment Gateway</p>
          </div>
        </div>
      </div>

      {/* Payment iframe */}
      <Card className="border-t-0 rounded-t-none">
        <CardContent className="p-0">
          {checkoutUrl ? (
            <iframe
              ref={iframeRef}
              src={checkoutUrl}
              className="w-full h-[600px] border-0"
              title="Alga Pay Secure Checkout"
              allow="payment"
            />
          ) : (
            <div className="flex items-center justify-center h-[600px]">
              <XCircle className="w-12 h-12 text-red-500" />
              <p className="ml-3 text-gray-600">Failed to load payment form</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button 
          variant="outline" 
          onClick={onCancel}
          data-testid="button-cancel-payment"
        >
          Cancel Payment
        </Button>
        <p className="text-sm text-gray-500">
          Powered by Alga Pay • Secure & Encrypted
        </p>
      </div>
    </div>
  );
}
