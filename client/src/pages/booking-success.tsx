import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import type { AccessCode } from "@shared/schema";

export default function BookingSuccess() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    // For PayPal, confirm the payment
    const orderId = searchParams.get("token");
    if (orderId && bookingId) {
      confirmPayPalPayment(orderId, bookingId);
    }
  }, []);

  // Fetch access code for this booking
  const { data: accessCode } = useQuery<AccessCode>({
    queryKey: ["/api/bookings", bookingId, "access-code"],
    enabled: !!bookingId,
    retry: 3, // Retry a few times as code might be generating
    retryDelay: 2000, // Wait 2 seconds between retries
  });

  const confirmPayPalPayment = async (orderId: string, bookingId: string) => {
    try {
      const response = await fetch("/api/payment/confirm/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: parseInt(bookingId), orderId }),
      });

      if (!response.ok) {
        console.error("Payment confirmation failed");
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <CardTitle className="text-3xl text-eth-brown">Booking Confirmed!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your payment has been processed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Access Code Section */}
              {accessCode && (
                <div className="bg-gradient-to-r from-eth-orange/10 to-eth-brown/10 border-2 border-eth-orange rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Key className="h-8 w-8 text-eth-orange mr-3" />
                    <h3 className="text-2xl font-bold text-eth-brown">Your Access Code</h3>
                  </div>
                  <div className="bg-white rounded-lg p-6 text-center">
                    <div className="text-5xl font-mono font-bold text-eth-orange tracking-widest mb-2" data-testid="text-access-code">
                      {accessCode.code}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Valid from {new Date(accessCode.validFrom).toLocaleDateString()} to {new Date(accessCode.validTo).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-700">
                    <p className="font-semibold mb-2">📱 Use this code to access the property</p>
                    <p className="text-xs">Keep this code safe and do not share it with anyone</p>
                  </div>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-eth-brown mb-2">What's Next?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>You will receive a confirmation email with booking details</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>The host will be notified and may contact you</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Check your booking details in "My Bookings"</span>
                  </li>
                  {accessCode && (
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Use your access code to enter the property</span>
                    </li>
                  )}
                </ul>
              </div>

              {bookingId && (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">Booking Reference: #{bookingId}</p>
                  <Button 
                    onClick={() => setLocation(`/bookings/${bookingId}`)}
                    className="bg-eth-orange hover:bg-eth-orange/90"
                    data-testid="button-view-booking"
                  >
                    View Booking Details
                  </Button>
                </div>
              )}

              <div className="flex gap-4 justify-center pt-4">
                <Link href="/">
                  <Button variant="outline" className="border-eth-brown text-eth-brown hover:bg-eth-light-tan" data-testid="link-home">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/bookings">
                  <Button className="bg-eth-green hover:bg-eth-green/90" data-testid="link-my-bookings">
                    My Bookings
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
