import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, CheckCircle, RefreshCw, Shield, AlertCircle, DollarSign, HelpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
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
                Everything about payment methods, refunds, and billing
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Accepted Payment Methods */}
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <CreditCard className="w-5 h-5" />
              Accepted Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#2d1405" }}>
                🇪🇹 Ethiopian Payments (via Alga Pay)
              </h3>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>📱 Telebirr</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Pay instantly using your Telebirr mobile wallet. Lower fees for Ethiopian users.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>💚 CBE Birr</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Commercial Bank of Ethiopia's mobile banking. Fast and secure for CBE customers.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>📲 M-Pesa</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Safaricom's mobile money service. Available for select Ethiopian mobile users.
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>🏦 Bank Transfers</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Direct bank transfer from any Ethiopian bank. Takes 1-2 business days to process.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: "#2d1405" }}>
                💳 International Payments
              </h3>
              <div className="space-y-3">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>💳 Visa & Mastercard (Alga Pay)</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Credit and debit cards from any country. Instant confirmation with 3D Secure protection.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>💎 American Express</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    AMEX cards accepted worldwide. Premium cards may offer travel protection.
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>🅿️ PayPal</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Pay with your PayPal balance or linked cards. Buyer protection included.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm font-medium mb-1" style={{ color: "#2d1405" }}>
                💡 Smart Tip for Ethiopians
              </p>
              <p className="text-xs" style={{ color: "#5a4a42" }}>
                Use <strong>Chapa (Telebirr or CBE Birr)</strong> to save on fees! Ethiopian payments have 40% lower transaction costs compared to international cards.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency & Pricing */}
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <DollarSign className="w-5 h-5" />
              Currency & Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2" style={{ color: "#2d1405" }}>💵 Supported Currencies</h4>
              <p className="text-sm mb-3" style={{ color: "#5a4a42" }}>
                All properties are listed in <strong>Ethiopian Birr (ETB)</strong>. International payments are automatically converted.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium mb-1" style={{ color: "#2d1405" }}>🇪🇹 Ethiopian Payments</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>Pay directly in ETB with no conversion fees</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs font-medium mb-1" style={{ color: "#2d1405" }}>🌍 International Payments</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>Converted at live exchange rates + 2.5% bank fee</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2" style={{ color: "#2d1405" }}>📊 What You Pay</h4>
              <div className="space-y-2 text-sm" style={{ color: "#5a4a42" }}>
                <div className="flex justify-between items-center">
                  <span>Property price (per night)</span>
                  <span className="font-medium">As listed</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Alga service fee</span>
                  <span className="font-medium">10% of subtotal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>VAT (Value Added Tax)</span>
                  <span className="font-medium">15% (included in service fee)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Payment processing fee</span>
                  <span className="font-medium">Varies by method</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
                  <span>Total charged</span>
                  <span>Shown at checkout</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm" style={{ color: "#2d1405" }}>
                <strong>💡 Transparency Promise:</strong> All fees are shown <u>before</u> you pay. No hidden charges or surprises!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How Payment Works */}
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
                <p className="text-sm" style={{ color: "#5a4a42" }}>Select dates, review pricing breakdown, and click "Book Now"</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                2
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Choose Payment Method</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Select Chapa (Ethiopian), Stripe (cards), or PayPal</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                3
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Complete Secure Payment</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Pay through encrypted gateway. Your card info never touches our servers</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                4
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Instant Confirmation</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Receive booking confirmation email with 6-digit access code within minutes</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700">
                5
              </div>
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Check In</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>Use your access code to check in. Host gets paid 24 hours after check-in</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Refunds & Cancellations */}
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <RefreshCw className="w-5 h-5" />
              Refunds & Cancellations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#2d1405" }}>📅 Standard Cancellation Policy</h4>
              <div className="space-y-3">
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>✅ Free Cancellation (100% refund)</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Cancel up to <strong>24 hours before</strong> check-in time. Full refund processed automatically.
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>⚠️ Partial Refund (50%)</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Cancel <strong>12-24 hours before</strong> check-in. Service fees are non-refundable.
                  </p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>❌ No Refund (0%)</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Cancel <strong>less than 12 hours</strong> before check-in or after check-in.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
              <p className="text-sm font-medium mb-1" style={{ color: "#2d1405" }}>
                ⚠️ Property-Specific Policies
              </p>
              <p className="text-xs" style={{ color: "#5a4a42" }}>
                Some properties have stricter or more flexible policies. Always check the <strong>"Cancellation Policy"</strong> section on the property page before booking.
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3" style={{ color: "#2d1405" }}>⏱️ Refund Processing Times</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#5a4a42" }}>🇪🇹 Telebirr / CBE Birr</span>
                  <span className="font-medium" style={{ color: "#2d1405" }}>1-3 business days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#5a4a42" }}>💳 Credit/Debit Cards</span>
                  <span className="font-medium" style={{ color: "#2d1405" }}>5-10 business days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#5a4a42" }}>🅿️ PayPal</span>
                  <span className="font-medium" style={{ color: "#2d1405" }}>1-3 business days</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span style={{ color: "#5a4a42" }}>🏦 Bank Transfer</span>
                  <span className="font-medium" style={{ color: "#2d1405" }}>3-7 business days</span>
                </div>
              </div>
              <p className="text-xs mt-3 text-gray-500">
                *Timing depends on your bank. We process refunds within 24 hours of approval.
              </p>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2" style={{ color: "#2d1405" }}>🔄 How to Cancel a Booking</h4>
              <ol className="space-y-2 text-sm" style={{ color: "#5a4a42" }}>
                <li>1. Go to <strong>My Bookings</strong> in your dashboard</li>
                <li>2. Find the booking you want to cancel</li>
                <li>3. Click <strong>"Cancel Booking"</strong></li>
                <li>4. Review the refund amount</li>
                <li>5. Confirm cancellation</li>
                <li>6. Receive email confirmation with refund details</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Payment Security */}
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <Shield className="w-5 h-5" />
              Payment Security & Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: "#5a4a42" }}>
              Your payment security is our top priority. We use industry-leading technology to protect every transaction.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>🔒 Bank-Level Encryption</p>
                <p className="text-xs" style={{ color: "#5a4a42" }}>
                  256-bit SSL encryption protects all payment data
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>🛡️ PCI DSS Compliant</p>
                <p className="text-xs" style={{ color: "#5a4a42" }}>
                  Certified by global payment security standards
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>🚫 Zero Card Storage</p>
                <p className="text-xs" style={{ color: "#5a4a42" }}>
                  We never store your card details on our servers
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>👁️ 24/7 Fraud Detection</p>
                <p className="text-xs" style={{ color: "#5a4a42" }}>
                  AI-powered monitoring prevents suspicious activity
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>✅ 3D Secure</p>
                <p className="text-xs" style={{ color: "#5a4a42" }}>
                  Extra verification for international card payments
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-green-600 mb-2" />
                <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>💰 Payment Hold</p>
                <p className="text-xs" style={{ color: "#5a4a42" }}>
                  Hosts receive payment only after successful check-in
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Issues & Troubleshooting */}
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <AlertCircle className="w-5 h-5" />
              Payment Issues & Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3" style={{ color: "#2d1405" }}>❌ Payment Failed? Try This:</h4>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>1. Check Your Balance</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Ensure you have sufficient funds in your account or wallet
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>2. Verify Card Details</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Double-check card number, expiry date, and CVV code
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>3. Enable Online Payments</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Contact your bank to activate online/international transactions
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>4. Try Different Payment Method</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Switch from cards to Telebirr or PayPal if one fails
                  </p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-sm mb-1" style={{ color: "#2d1405" }}>5. Clear Cache & Try Again</p>
                  <p className="text-xs" style={{ color: "#5a4a42" }}>
                    Clear browser cookies or try a different browser/device
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-sm font-medium mb-2" style={{ color: "#2d1405" }}>
                💳 Charged But Booking Failed?
              </p>
              <p className="text-xs mb-2" style={{ color: "#5a4a42" }}>
                Don't worry! This is usually a temporary authorization hold. It will be automatically released by your bank within 3-5 business days.
              </p>
              <p className="text-xs font-medium" style={{ color: "#2d1405" }}>
                If the charge doesn't disappear, contact support immediately with your transaction ID.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Common Questions (FAQ) */}
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <HelpCircle className="w-5 h-5" />
              Common Payment Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  When will I be charged?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  You're charged immediately when you confirm your booking. The host receives payment 24 hours after your check-in time to ensure everything is as expected.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Can I pay in cash when I arrive?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  No, all bookings must be paid online through our secure platform. This protects both guests and hosts and provides you with booking confirmation and access codes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Is there a deposit or security hold?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  Most properties don't require a deposit. However, some hosts may request a refundable security deposit (shown clearly at checkout). This is held separately and refunded within 7 days after checkout if there's no damage.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Why was my payment declined?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  Common reasons: insufficient funds, incorrect card details, international transactions blocked by your bank, or expired card. Contact your bank or try a different payment method.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Can I get a receipt for my booking?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  Yes! After payment, you'll receive an email with your booking confirmation and a detailed receipt showing the breakdown of all charges. You can also download receipts from your "My Bookings" page.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Are there extra fees for using credit cards?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  International cards (Stripe) have a 2.9% + ETB 10 processing fee. Ethiopian payment methods (Chapa) have lower fees of around 1.5%. All fees are shown before you confirm payment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  What if the host cancels my booking?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  If a host cancels your confirmed booking, you receive an automatic 100% refund within 3 business days, plus a ETB 500 credit for the inconvenience. We'll help you find alternative accommodation immediately.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Can I split payment with friends?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  Currently, we don't offer split payment at checkout. You'll need to settle payment arrangements privately. One person must complete the full booking payment.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Do you offer payment plans for long stays?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  For stays longer than 28 nights, we offer monthly payment plans. Contact the host or our support team before booking to arrange installment options.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-10">
                <AccordionTrigger className="text-left" style={{ color: "#2d1405" }}>
                  Is my payment information safe with Alga?
                </AccordionTrigger>
                <AccordionContent style={{ color: "#5a4a42" }}>
                  Absolutely! We never see or store your full payment details. All transactions are processed through certified payment gateways (Chapa, Stripe, PayPal) with bank-level encryption and PCI DSS compliance.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <div className="text-center pt-6 pb-4">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-lg font-semibold mb-2" style={{ color: "#2d1405" }}>
              Still Have Payment Questions? 💬
            </p>
            <p className="mb-4 text-sm" style={{ color: "#5a4a42" }}>
              Our friendly support team is here to help 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/support">
                <Button size="lg" data-testid="button-contact-support">
                  📞 Contact Support
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                onClick={() => {
                  const lemlemChat = document.querySelector('[data-lemlem-chat]') as HTMLButtonElement;
                  if (lemlemChat) lemlemChat.click();
                }}
                data-testid="button-ask-lemlem"
              >
                👵🏾 Ask Lemlem (ለምለም)
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
