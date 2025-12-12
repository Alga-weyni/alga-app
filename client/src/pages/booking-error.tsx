import { Link } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function BookingError() {
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-10 w-10 text-orange-600" />
              </div>
              <CardTitle className="text-3xl text-eth-brown">Payment Error</CardTitle>
              <CardDescription className="text-lg mt-2">
                There was an issue processing your payment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-eth-brown mb-2">What happened?</h3>
                <p className="text-gray-700">
                  We encountered an error while processing your payment. 
                  This could be due to a network issue, insufficient funds, or a temporary problem with the payment system.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-eth-brown mb-3">What can you do?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Check your internet connection and try again</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Verify your payment details are correct</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Try a different payment method</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Contact support if the problem persists</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                <Link to="/bookings">
                  <Button className="bg-eth-orange hover:bg-eth-orange/90" data-testid="button-view-bookings">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="border-eth-brown text-eth-brown hover:bg-eth-light-tan" data-testid="link-home">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
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
