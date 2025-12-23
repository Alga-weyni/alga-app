import { Link } from "react-router-dom";
import { ArrowLeft, Shield, Phone, MapPin, AlertTriangle, CheckCircle, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function SafetyHelp() {
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
            <Shield className="w-8 h-8" style={{ color: "#2d1405" }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                Safety & Security
              </h1>
              <p style={{ color: "#5a4a42" }}>
                Your safety is our top priority
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <Shield className="w-5 h-5" />
              Host & Property Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>ID Verification Required</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>
                  All hosts must verify their identity with Ethiopian Digital ID or government-issued ID
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Property Inspection</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>
                  Our team reviews all property listings before approval
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold" style={{ color: "#2d1405" }}>Review System</h4>
                <p className="text-sm" style={{ color: "#5a4a42" }}>
                  Read reviews from previous guests to make informed decisions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <Phone className="w-5 h-5" />
              24/7 Emergency Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: "#5a4a42" }}>
              If you encounter any emergency during your stay, contact us immediately:
            </p>

            <div className="grid gap-3">
              <a href="tel:+251943333555" className="block">
                <div className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Phone className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-semibold" style={{ color: "#2d1405" }}>Emergency Hotline</p>
                    <p className="text-sm" style={{ color: "#5a4a42" }}>+251 943 333 555 (24/7)</p>
                  </div>
                </div>
              </a>

              <div className="flex items-center gap-3 p-4 border rounded-lg bg-red-50">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Police Emergency</p>
                  <p className="text-sm text-red-700">911 (Ethiopia)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <MapPin className="w-5 h-5" />
              Location Sharing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm" style={{ color: "#5a4a42" }}>
              Share your trip details with trusted contacts for added safety:
            </p>

            <ul className="space-y-2 text-sm" style={{ color: "#5a4a42" }}>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Property address and check-in details sent to your email</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Share your booking confirmation with family/friends</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Keep someone informed of your check-in and check-out times</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <Users className="w-5 h-5" />
              Guest Safety Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold mb-1" style={{ color: "#2d1405" }}>Before You Book</h4>
                <ul className="space-y-1 text-sm" style={{ color: "#5a4a42" }}>
                  <li>• Read property reviews carefully</li>
                  <li>• Check host verification status</li>
                  <li>• Review cancellation policy</li>
                </ul>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold mb-1" style={{ color: "#2d1405" }}>During Your Stay</h4>
                <ul className="space-y-1 text-sm" style={{ color: "#5a4a42" }}>
                  <li>• Lock doors and windows at night</li>
                  <li>• Keep valuables secure</li>
                  <li>• Report any issues immediately</li>
                  <li>• Don't share access codes with strangers</li>
                </ul>
              </div>

              <div className="border-l-4 border-orange-500 pl-4">
                <h4 className="font-semibold mb-1" style={{ color: "#2d1405" }}>Communication</h4>
                <ul className="space-y-1 text-sm" style={{ color: "#5a4a42" }}>
                  <li>• Use Alga's messaging system for host communication</li>
                  <li>• Never share personal financial information</li>
                  <li>• Report suspicious activity to our team</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
              <AlertTriangle className="w-5 h-5" />
              What to Avoid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900">Never pay outside the platform</p>
                  <p className="text-red-700">All payments must go through Alga for your protection</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900">Don't share personal details too early</p>
                  <p className="text-red-700">Wait until booking is confirmed before sharing sensitive info</p>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-red-900">Report scams immediately</p>
                  <p className="text-red-700">Contact us if anything seems suspicious or unsafe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center pt-8">
          <p className="mb-4" style={{ color: "#5a4a42" }}>Have safety concerns or questions?</p>
          <Link to="/support">
            <Button size="lg" data-testid="button-contact-support">
              Contact Support Team
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
