import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

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
