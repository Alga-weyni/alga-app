import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, RefreshCw, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function PaymentsHelp() {
  return (
    <div className="min-h-screen" style={{ background: "#f6f2ec" }}>
      <Header />

      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/support">
            <Button variant="ghost" className="mb-4" data-testid="button-back-support">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Help
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8" style={{ color: "#2d1405" }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                Payments
              </h1>
              <p style={{ color: "#5a4a42" }}>
                Everything about payment methods and refunds
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <CreditCard className="w-5 h-5" />
              Accepted Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>🇪🇹 Ethiopian Payments (Chapa)</h3>
              <ul className="space-y-1 text-sm" style={{ color: "#5a4a42" }}>
                <li>• Telebirr</li>
                <li>• CBE Birr</li>
                <li>• M-Pesa</li>
                <li>• Bank transfers</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>💳 International Payments</h3>
              <ul className="space-y-1 text-sm" style={{ color: "#5a4a42" }}>
                <li>• Visa & Mastercard (via Stripe)</li>
                <li>• American Express</li>
                <li>• PayPal</li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm" style={{ color: "#2d1405" }}>
                <strong>💡 Tip:</strong> Ethiopian users pay lower fees with Chapa. International travelers can use Stripe or PayPal.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <CheckCircle className="w-5 h-5" />
              How Payment Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                1
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Book Your Stay</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Select dates and click "Book Now"</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                2
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Choose Payment Method</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Pick Chapa, Stripe, or PayPal</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                3
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Secure Payment</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Complete payment through secure gateway</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                4
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Get Confirmation</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Receive booking confirmation & access code via email</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <RefreshCw className="w-5 h-5" />
              Refunds & Cancellations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Cancellation Policy</h4>
              <ul className="space-y-2 text-sm" style={{ color: "#5a4a42" }}>
                <li>• <strong>Free cancellation:</strong> Up to 24 hours before check-in</li>
                <li>• <strong>50% refund:</strong> 12-24 hours before check-in</li>
                <li>• <strong>No refund:</strong> Less than 12 hours before check-in</li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-sm" style={{ color: "#2d1405" }}>
                <strong>⚠️ Note:</strong> Each property may have its own cancellation policy. Check the property details before booking.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Refund Timeline</h4>
              <ul className="space-y-1 text-sm" style={{ color: "#5a4a42" }}>
                <li>• Chapa/Telebirr: 3-5 business days</li>
                <li>• Credit/Debit Cards: 5-10 business days</li>
                <li>• PayPal: 1-3 business days</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <Shield className="w-5 h-5" />
              Payment Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm" style={{ color: "#5a4a42" }}>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>All payments are encrypted with bank-level security</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>We never store your card details on our servers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>PCI DSS compliant payment processing</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>24/7 fraud monitoring and protection</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <p className="mb-4" style={{ color: "#5a4a42" }}>Still have questions about payments?</p>
          <Link to="/support">
            <Button size="lg" data-testid="button-contact-support">
              Contact Support
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
