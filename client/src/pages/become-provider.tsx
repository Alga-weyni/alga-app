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
  Wrench,
  Star,
  Users,
  TrendingUp,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AuthDialog from "@/components/auth-dialog-passwordless";
import { useToast } from "@/hooks/use-toast";

export default function BecomeProvider() {
  const { user } = useAuth();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Auto-redirect after login if ID not verified
  useEffect(() => {
    if (user && !user.idVerified && !authDialogOpen) {
      // User just logged in but hasn't verified ID - auto redirect
      setTimeout(() => {
        toast({
          title: "ID Verification Required",
          description: "Please verify your identity to complete your provider application.",
        });
        setLocation("/scan-id");
      }, 1000);
    } else if (user && user.idVerified && user.role === 'guest') {
      // User is verified but still a guest - show success message
      setTimeout(() => {
        toast({
          title: "Application Submitted! ✓",
          description: "An admin will review your application and approve your service provider account soon.",
          duration: 6000,
        });
      }, 500);
    }
  }, [user, setLocation, toast, authDialogOpen]);

  const handleApplyClick = () => {
    if (!user) {
      // Not logged in - open auth dialog
      setAuthDialogOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!user.idVerified) {
      // Logged in but no ID - redirect to scanner
      toast({
        title: "ID Verification Required",
        description: "Please verify your identity to complete your provider application.",
      });
      setLocation("/scan-id");
    } else if (user.role === 'guest') {
      // ID verified but still guest - show confirmation
      toast({
        title: "Application Submitted! ✓",
        description: "An admin will review your application and approve your service provider account soon.",
        duration: 6000,
      });
    } else {
      // Already approved
      toast({
        title: "Application Received!",
        description: "Your service provider application is being processed.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9e9d8] to-[#f6d8c2]">
      <Header />
      
      {/* Auth Dialog */}
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
      />
      
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
                    data-testid="heading-why-provider"
                  >
                    Why Join Alga Services?
                  </h1>
                  <p className="text-xl text-eth-brown leading-relaxed">
                    Join Ethiopia's growing network of verified service professionals and grow your business with guaranteed bookings.
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
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Earn More</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Get booked directly by property guests. 85% payout, no middleman fees.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature 2 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <ShieldCheck className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Verified Badge</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Get ID-verified and earn a trust badge that boosts your bookings by 3x.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature 3 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <CreditCard className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Fast Payments</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Get paid securely via bank transfer or mobile money within 24 hours of service completion.
                      </p>
                    </CardContent>
                  </Card>

                  {/* Feature 4 */}
                  <Card className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] border-eth-orange/20 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center mb-4">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-eth-brown mb-2">Access Customers</h3>
                      <p className="text-eth-brown/80 text-sm">
                        Reach thousands of property guests who need reliable local services.
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
                    Join Alga's trusted network and start getting bookings today.
                  </p>
                  
                  <Button
                    onClick={handleApplyClick}
                    size="lg"
                    className="bg-eth-orange hover:opacity-90 text-white rounded-xl px-10 py-4 font-bold text-lg border-0"
                    data-testid="button-apply-provider"
                  >
                    Apply as Service Provider
                  </Button>

                  {user && user.role === 'guest' && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> You're currently logged in as a guest. 
                        After ID verification, an admin will review and approve your provider account.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Stats/Benefits */}
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
                          <Wrench className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-eth-brown">Your Profile</h4>
                          <p className="text-sm text-eth-brown/70">Professional Cleaner</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white/30 rounded-lg p-3">
                          <p className="text-2xl font-bold text-eth-orange">28</p>
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
                        <TrendingUp className="h-5 w-5 text-eth-orange" />
                      </div>
                      <p className="text-3xl font-bold text-eth-brown mb-1">12,400 ETB</p>
                      <p className="text-sm text-eth-brown/60">+35% from last month</p>
                    </div>

                    <div className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] rounded-2xl p-4 shadow-lg border-2 border-eth-orange/10">
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-eth-brown">Verified Provider</span>
                      </div>
                      <ul className="space-y-2 text-sm text-eth-brown/70">
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          ID Verified
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Background Checked
                        </li>
                        <li className="flex items-center">
                          <span className="text-green-600 mr-2">✓</span>
                          Top Rated
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services You Can Offer */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-eth-brown mb-4" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Services You Can Offer
              </h2>
              <p className="text-lg text-eth-brown/70">
                Join any of our 11 service categories
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[
                "Cleaning Services",
                "Laundry Services",
                "Airport Pickup",
                "Local Tours",
                "Drivers",
                "Electricians",
                "Plumbers",
                "Carpenters",
                "Catering",
                "Welcome Packs",
                "Other Services"
              ].map((service) => (
                <div key={service} className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] rounded-lg p-4 border border-eth-orange/20 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-eth-orange rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-eth-brown">{service}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-gradient-to-b from-[#f9e9d8] to-[#f6d8c2]">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-eth-brown mb-4" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                How It Works
              </h2>
            </div>

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Apply & Verify",
                  description: "Submit your application and verify your ID. We'll review it within 24 hours."
                },
                {
                  step: "2",
                  title: "Set Your Prices",
                  description: "Create your service listing with your rates, availability, and service area."
                },
                {
                  step: "3",
                  title: "Get Bookings",
                  description: "Receive booking requests from property guests who need your services."
                },
                {
                  step: "4",
                  title: "Deliver & Get Paid",
                  description: "Complete the service, get reviewed, and receive payment within 24 hours."
                }
              ].map((item) => (
                <div key={item.step} className="flex items-start space-x-4 bg-white rounded-xl p-6 shadow-md">
                  <div className="w-12 h-12 bg-eth-orange rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-eth-brown mb-2">{item.title}</h3>
                    <p className="text-eth-brown/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button
                onClick={handleApplyClick}
                size="lg"
                className="bg-eth-orange hover:opacity-90 text-white rounded-xl px-10 py-4 font-bold text-lg border-0"
                data-testid="button-apply-provider-bottom"
              >
                Start Your Application
              </Button>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
