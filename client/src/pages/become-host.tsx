import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { 
  DollarSign, 
  ShieldCheck, 
  CreditCard, 
  Headphones,
  UserCheck,
  Home,
  Camera,
  Banknote
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthDialog from "@/components/auth-dialog-passwordless";
import { useToast } from "@/hooks/use-toast";

export default function BecomeHost() {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auto-redirect after login if ID not verified
  useEffect(() => {
    if (user && !user.idVerified && !authDialogOpen) {
      // User just logged in but hasn't verified ID - auto redirect
      setTimeout(() => {
        toast({
          title: "ID Verification Required",
          description: "Please verify your identity to complete your host application.",
        });
        navigate("/scan-id");
      }, 1000);
    } else if (user && user.idVerified && user.role === 'guest') {
      // User is verified but still a guest - show success message
      setTimeout(() => {
        toast({
          title: "Application Submitted! ✓",
          description: "An admin will review your application and upgrade your account to host status soon.",
          duration: 6000,
        });
      }, 500);
    }
  }, [user, navigate, toast, authDialogOpen]);

  const handleApplyClick = () => {
    if (!user) {
      // Not logged in - open auth dialog
      setAuthDialogOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!user.idVerified) {
      // Logged in but no ID - redirect to scanner
      toast({
        title: "ID Verification Required",
        description: "Please verify your identity to complete your host application.",
      });
      navigate("/scan-id");
    } else if (user.role === 'guest') {
      // ID verified but still guest - show confirmation
      toast({
        title: "Application Submitted! ✓",
        description: "An admin will review your application and upgrade your account to host status soon.",
        duration: 6000,
      });
    } else if (user.role === 'host') {
      // Already a host
      toast({
        title: "You're Already a Host!",
        description: "You can manage your properties from your host dashboard.",
      });
      navigate("/host/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9e9d8] to-[#f6d8c2]">
      <Header />
      
      <div className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="space-y-8">
                <div>
                  <h1 
                    className="text-5xl md:text-6xl font-bold text-eth-brown mb-6 leading-tight"
                    style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                    data-testid="heading-why-host"
                  >
                    Why Host with Alga?
                  </h1>
                  <p className="text-xl text-eth-brown leading-relaxed">
                    Join a growing community of guesthouse owners across Ethiopia earning income by sharing authentic local stays.
                  </p>
                </div>

                {/* Key Features Grid */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Feature 1 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Earn Extra Income</h3>
                      <p className="text-eth-brown/80 text-sm">
                        List your property and start earning from day one.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature 2 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Verified Guests</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Every guest is verified with a valid ID or passport — Ethiopian or international.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature 3 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Secure Payments</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Receive safe payments through Ethiopian banks and mobile money services like Telebirr and CBE Birr.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature 4 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <Headphones className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">24/7 Local Support</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Our bilingual team is always ready to assist you — in Amharic or English.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Call to Action */}
                <div className="bg-gradient-to-br from-eth-orange/10 to-eth-orange/5 rounded-2xl p-8 border-2 border-eth-orange/20">
                  <h3 className="text-2xl font-bold text-eth-brown mb-3" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    Ready to Get Started?
                  </h3>
                  <p className="text-eth-brown mb-6">
                    Apply to become a host and welcome travelers from across Ethiopia and around the globe.
                  </p>
                  
                  <Button
                    onClick={handleApplyClick}
                    size="lg"
                    className="bg-eth-orange hover:opacity-90 text-white rounded-xl px-10 py-4 font-bold text-lg border-0"
                    data-testid="button-apply-host"
                  >
                    Apply to Become a Host
                  </Button>

                  {user && user.role === 'guest' && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You're currently logged in as a guest. 
                        To start hosting, an admin will need to upgrade your account to a host account.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Image/Illustration */}
              <div className="relative">
                <div className="bg-gradient-to-br from-eth-orange/20 to-eth-orange/10 rounded-3xl p-8 shadow-2xl">
                  {/* Ethiopian pattern background */}
                  <div className="absolute inset-0 opacity-5 rounded-3xl" style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, #3d1f0a 35px, #3d1f0a 70px),
                                     repeating-linear-gradient(-45deg, transparent, transparent 35px, #3d1f0a 35px, #3d1f0a 70px)`
                  }}></div>
                  
                  {/* Content */}
                  <div className="relative space-y-6">
                    <div className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] rounded-2xl p-6 shadow-lg border-2 border-eth-orange/10">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-16 h-16 bg-eth-orange rounded-full flex items-center justify-center">
                          <Home className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-eth-brown">Your Property</h4>
                          <p className="text-sm text-eth-brown/70">Traditional Ethiopian Home</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/30 rounded-lg p-3">
                          <p className="text-2xl font-bold text-eth-orange">12</p>
                          <p className="text-xs text-eth-brown">Bookings</p>
                        </div>
                        <div className="bg-white/30 rounded-lg p-3">
                          <p className="text-2xl font-bold text-eth-orange">4.9★</p>
                          <p className="text-xs text-eth-brown">Rating</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] rounded-2xl p-6 shadow-lg border-2 border-eth-orange/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-eth-brown font-medium">Monthly Earnings</span>
                        <Banknote className="h-5 w-5 text-eth-orange" />
                      </div>
                      <p className="text-3xl font-bold text-eth-brown mb-1">18,500 ETB/month</p>
                      <p className="text-sm text-green-600 font-medium">↑ Up 23% from last month</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-eth-warm-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              <h2 
                className="text-4xl md:text-5xl font-bold text-eth-brown mb-4"
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                data-testid="heading-how-it-works"
              >
                How It Works
              </h2>
              <p className="text-lg text-eth-brown max-w-2xl mx-auto">
                Start hosting in three simple steps:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="relative">
                <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-eth-orange rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                      1
                    </div>
                    <div className="w-16 h-16 bg-eth-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-eth-orange" />
                    </div>
                    <h3 className="text-xl font-bold text-eth-brown mb-3">Create Your Account</h3>
                    <p className="text-eth-brown/80">
                      Sign up with your phone or email and verify your identity.
                    </p>
                  </CardContent>
                </Card>
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-eth-orange/30"></div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-eth-orange rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                      2
                    </div>
                    <div className="w-16 h-16 bg-eth-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Camera className="h-8 w-8 text-eth-orange" />
                    </div>
                    <h3 className="text-xl font-bold text-eth-brown mb-3">List Your Property</h3>
                    <p className="text-eth-brown/80">
                      Add photos, descriptions, and pricing.
                    </p>
                  </CardContent>
                </Card>
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-eth-orange/30"></div>
              </div>

              {/* Step 3 */}
              <div>
                <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg h-full">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-eth-orange rounded-full flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold">
                      3
                    </div>
                    <div className="w-16 h-16 bg-eth-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-eth-orange" />
                    </div>
                    <h3 className="text-xl font-bold text-eth-brown mb-3">Start Earning</h3>
                    <p className="text-eth-brown/80">
                      Welcome verified guests and receive payments directly to your bank or wallet.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-12">
              <p className="text-lg text-eth-brown mb-6">
                Get Started Today — turn your space into opportunity with Alga.
              </p>
              <Button
                onClick={handleApplyClick}
                size="lg"
                className="bg-eth-orange hover:opacity-90 text-white rounded-xl px-10 py-4 font-bold text-lg border-0"
                data-testid="button-apply-host-bottom"
              >
                Apply to Become a Host
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultMode="register"
      />
    </div>
  );
}
