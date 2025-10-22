import { Link } from "wouter";
import { XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function BookingCancelled() {
  const searchParams = new URLSearchParams(window.location.search);
  const bookingId = searchParams.get("bookingId");

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <CardTitle className="text-3xl text-eth-brown">Payment Cancelled</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your booking payment was not completed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h3 className="font-semibold text-eth-brown mb-2">What happened?</h3>
                <p className="text-gray-700">
                  You cancelled the payment or there was an issue processing your transaction. 
                  Your booking has not been confirmed.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="font-semibold text-eth-brown mb-3">What can you do?</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Try again with the same or different payment method</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Check your payment details and try again</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-600 mr-2">•</span>
                    <span>Contact our support team if you need assistance</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-4 justify-center pt-4">
                {bookingId && (
                  <Link href={`/property/${bookingId}`}>
                    <Button className="bg-eth-orange hover:bg-eth-orange/90" data-testid="button-try-again">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Try Again
                    </Button>
                  </Link>
                )}
                <Link to="/">
                  <Button variant="outline" className="border-eth-brown text-eth-brown hover:bg-eth-light-tan" data-testid="link-home">
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
