import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, XCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/api-config";

interface ChapaCheckoutProps {
  amount: number;
  currency?: string;
  bookingId: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function ChapaCheckout({
  amount,
  currency = "ETB",
  bookingId,
  onSuccess,
  onError,
  onCancel,
}: ChapaCheckoutProps) {
  const [loading, setLoading] = useState(true);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [txRef, setTxRef] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const verificationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializePayment();
    
    // Listen for messages from iframe (Chapa callback)
    window.addEventListener('message', handleIframeMessage);
    
    return () => {
      window.removeEventListener('message', handleIframeMessage);
      if (verificationIntervalRef.current) {
        clearInterval(verificationIntervalRef.current);
      }
    };
  }, []);

  const handleIframeMessage = (event: MessageEvent) => {
    // Security: Only accept messages from Chapa domain
    if (!event.origin.includes('chapa.co')) {
      return;
    }

    console.log('[Chapa] Received message from iframe:', event.data);

    if (event.data.status === 'success') {
      handlePaymentComplete();
    } else if (event.data.status === 'failed') {
      onError("Payment was not completed");
    }
  };

  const initializePayment = async () => {
    try {
      setLoading(true);
      const response: any = await apiRequest("POST", "/api/payment/chapa/initiate", {
        bookingId,
        amount,
        currency,
      });

      if (response.success && response.checkout_url) {
        setCheckoutUrl(response.checkout_url);
        setTxRef(response.tx_ref);
        
        // Start polling for payment verification
        startVerificationPolling(response.tx_ref);
      } else {
        throw new Error(response.message || "Failed to initialize Chapa payment");
      }
    } catch (error: any) {
      console.error('[Chapa] Initialization error:', error);
      onError(error.message || "Failed to initialize payment");
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
      const response: any = await apiRequest("GET", `/api/payment/chapa/verify/${tx_ref}`);

      if (response.success && response.status === 'paid') {
        handlePaymentComplete();
      }
    } catch (error) {
      console.error('[Chapa] Verification error:', error);
      // Don't show error to user, just continue polling
    }
  };

  const handlePaymentComplete = () => {
    if (paymentCompleted) return; // Prevent duplicate handling
    
    setPaymentCompleted(true);
    setVerifying(false);
    
    // Stop polling
    if (verificationIntervalRef.current) {
      clearInterval(verificationIntervalRef.current);
    }

    // Show success message for 2 seconds then callback
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (loading) {
    return (
      <Card className="border-eth-brown/20">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-eth-brown mb-4" />
          <p className="text-sm text-muted-foreground">Initializing Chapa payment...</p>
        </CardContent>
      </Card>
    );
  }

  if (paymentCompleted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">Payment Successful!</h3>
          <p className="text-sm text-green-700">Your booking has been confirmed.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-eth-brown">Complete Your Payment</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Secure payment powered by Chapa
        </p>
        <div className="mt-2 p-3 bg-eth-cream/50 rounded-lg border border-eth-brown/20">
          <p className="text-2xl font-bold text-eth-brown">
            {amount.toLocaleString()} {currency}
          </p>
        </div>
      </div>

      {/* Embedded Chapa Iframe */}
      {checkoutUrl && (
        <Card className="border-eth-brown/20 overflow-hidden">
          <div className="relative" style={{ paddingBottom: '75%', minHeight: '500px' }}>
            <iframe
              ref={iframeRef}
              src={checkoutUrl}
              className="absolute top-0 left-0 w-full h-full border-0"
              title="Chapa Payment"
              allow="payment"
              sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation"
              data-testid="iframe-chapa-checkout"
            />
          </div>
        </Card>
      )}

      {/* Loading indicator while verifying */}
      {verifying && (
        <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
          <span className="text-sm text-blue-900">Verifying payment...</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-eth-brown/20 hover:bg-eth-brown/5"
          data-testid="button-cancel-payment"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancel Payment
        </Button>
        
        <Button
          onClick={async () => {
            if (txRef) {
              setVerifying(true);
              await verifyPayment(txRef);
              setVerifying(false);
            }
          }}
          className="flex-1 bg-eth-brown hover:bg-eth-brown/90"
          disabled={verifying}
          data-testid="button-verify-payment"
        >
          {verifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              I've Completed Payment
            </>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-xs text-blue-900">
          💡 <strong>Tip:</strong> After completing payment in the window above, click "I've Completed Payment" to verify your transaction.
        </p>
      </div>
    </div>
  );
}
