import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

interface StripeCheckoutFormProps {
  clientSecret: string;
  bookingId: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function CheckoutForm({ clientSecret, bookingId, onSuccess, onError }: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success?bookingId=${bookingId}`,
        },
      });

      if (error) {
        onError(error.message || "Payment failed");
      } else {
        onSuccess();
      }
    } catch (err: any) {
      onError(err.message || "Payment processing failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-eth-orange hover:bg-eth-orange/90"
        data-testid="button-confirm-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Pay Now"
        )}
      </Button>
    </form>
  );
}

interface StripeCheckoutProps {
  amount: number;
  currency: string;
  bookingId: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

export default function StripeCheckout({
  amount,
  currency,
  bookingId,
  onSuccess,
  onError,
  onCancel,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      const response = await fetch("/api/payment/stripe", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          amount,
          currency,
        }),
      });

      const data = await response.json();

      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        onError(data.message || "Failed to initialize payment");
      }
    } catch (err: any) {
      onError(err.message || "Payment initialization failed");
    } finally {
      setLoading(false);
    }
  };

  const options = {
    clientSecret: clientSecret || "",
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#D97706",
      },
    },
  };

  // Show configuration warning if Stripe key is missing
  if (!stripePromise) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-eth-brown">Payment Configuration Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-gray-600">
              Stripe payment integration requires configuration.
            </p>
            <p className="text-sm text-gray-500">
              Add <code className="bg-gray-100 px-2 py-1 rounded">VITE_STRIPE_PUBLIC_KEY</code> to your environment secrets.
            </p>
            <Button variant="outline" onClick={onCancel}>
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-eth-brown flex items-center justify-between">
          <span>Complete Payment</span>
          <Button variant="ghost" size="sm" onClick={onCancel} data-testid="button-cancel-payment">
            Cancel
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-eth-orange" />
            <span className="ml-3 text-gray-600">Initializing payment...</span>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <CheckoutForm
              clientSecret={clientSecret}
              bookingId={bookingId}
              onSuccess={onSuccess}
              onError={onError}
            />
          </Elements>
        ) : (
          <div className="text-center py-8 text-red-600">
            Failed to initialize payment. Please try again.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
