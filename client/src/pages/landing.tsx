import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import SearchBanner from "@/components/search-banner";
import Footer from "@/components/footer";
import AuthDialog from "@/components/auth-dialog-passwordless";
import { BackButton } from "@/components/back-button";
import { useToast } from "@/hooks/use-toast";
import { Star, CheckCircle, Home, ArrowRight, Shield, Bell, Zap, Gift, QrCode, Smartphone, Download } from "lucide-react";
import { FEATURED_DESTINATIONS } from "@/lib/constants";
import mountainLodgeImg from "@assets/stock_images/mountain_lodge_cabin_537ba6f4.jpg";
import boutiqueHotelImg from "@assets/stock_images/luxury_boutique_hote_429d7d7d.jpg";
import lakesideRetreatImg from "@assets/stock_images/lakeside_resort_peac_aa065d79.jpg";
import mobileAppMockup from "@/assets/ethiopia-stays-mobile-mockup.png";
import algaMobileHero from "@assets/alga mobile app image _1760805527089.jpeg";
import algaAppDownload from "@assets/alga mobile app image _1760806950707.jpeg";

export default function Landing() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      navigate("/");
      toast({
        title: "Signed Out",
        description: "See you soon! 👋",
      });
    },
  });

  const openAuthDialog = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      {/* Ethiopian Pattern Sidebar */}
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-20">
        {/* Header */}
        <header className="bg-white border-b border-[#e5ddd5] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center space-x-3 cursor-pointer">
                <div className="w-10 h-10 bg-[#2d1405] rounded-lg flex items-center justify-center">
                  <Home className="text-white text-base" />
                </div>
                <h1 className="text-2xl font-bold text-[#2d1405]" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Alga
                </h1>
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-sm font-medium text-[#5a4a42] hover:text-[#2d1405] transition-colors">
                  Home
                </Link>
                <Link to="/properties" className="text-sm font-medium text-[#5a4a42] hover:text-[#2d1405] transition-colors">
                  Properties
                </Link>
                <a href="#about" className="text-sm font-medium text-[#5a4a42] hover:text-[#2d1405] transition-colors">
                  About
                </a>
                <a href="#contact" className="text-sm font-medium text-[#5a4a42] hover:text-[#2d1405] transition-colors">
                  Contact
                </a>
                {isAuthenticated ? (
                  <Button 
                    onClick={() => logoutMutation.mutate()}
                    disabled={logoutMutation.isPending}
                    variant="outline"
                    className="border-[#2d1405] text-[#2d1405] hover:bg-[#2d1405] hover:text-white rounded-lg px-6 py-2 text-sm font-medium transition-all"
                    data-testid="button-signout"
                  >
                    {logoutMutation.isPending ? "..." : "Sign out"}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => openAuthDialog("login")} 
                    className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white rounded-lg px-6 py-2 text-sm font-medium transition-all hover:shadow-md"
                    data-testid="button-signin"
                  >
                    Sign In
                  </Button>
                )}
              </nav>
              
              {/* Mobile Sign Out Button */}
              {isAuthenticated && (
                <Button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="md:hidden border-[#2d1405] text-[#2d1405] hover:bg-[#2d1405] hover:text-white text-sm"
                  data-testid="button-signout-mobile"
                >
                  {logoutMutation.isPending ? "..." : "Sign out"}
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#faf5f0] to-[#f5ece3] py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Text and CTAs */}
              <div className="space-y-8 animate-fade-in-up">
                {/* Title */}
                <div className="space-y-6">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#2d1405] leading-tight" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    Welcome to Alga
                  </h1>
                  <p className="text-lg md:text-xl text-[#5a4a42] max-w-lg leading-relaxed">
                    Experience Ethiopian stays — authentic, local, and easy to book.
                  </p>
                  <p className="text-base text-[#5a4a42]/80 max-w-xl">
                    Built for travelers, hosts, and the diaspora who believe home is where Ethiopia beats.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    size="lg"
                    className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white rounded-lg px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    onClick={() => {
                      toast({
                        title: "Coming Soon",
                        description: "The Alga mobile app will be available shortly.",
                        duration: 3000,
                      });
                    }}
                    data-testid="button-download-app-hero"
                  >
                    Download the App
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-[#d4c4b8] text-[#2d1405] hover:bg-[#2d1405] hover:text-white hover:border-[#2d1405] rounded-lg px-8 py-6 text-base font-medium transition-all duration-200"
                    onClick={() => openAuthDialog("login")}
                    data-testid="button-explore-stays-hero"
                  >
                    Explore Stays <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                {/* Reassurance Line */}
                <div className="flex items-center space-x-2 text-[#5a4a42]">
                  <Shield className="h-5 w-5" />
                  <p className="text-sm font-medium">
                    Secure Telebirr Payments • 100% Ethiopian
                  </p>
                </div>
              </div>

              {/* Right Side - Phone Mockup */}
              <div className="relative flex justify-center lg:justify-end animate-fade-in-right">
                <div className="relative w-full max-w-md lg:max-w-lg">
                  <img 
                    src={algaMobileHero}
                    alt="Alga Mobile App"
                    className="w-full h-auto drop-shadow-2xl animate-float"
                    loading="lazy"
                    data-testid="img-hero-phone-mockup"
                  />
                  {/* Decorative glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fb470b]/20 to-transparent blur-3xl -z-10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Line - Artistic Italian Tagline */}
          <div className="mt-20 text-center">
            <p 
              className="text-2xl md:text-3xl lg:text-4xl text-[#5a4a42] font-light italic px-6 leading-relaxed tracking-wide"
              style={{ 
                fontFamily: "'Playfair Display', 'Georgia', serif",
                fontStyle: 'italic',
                letterSpacing: '0.02em'
              }}
            >
              From Axum to Arba Minch — your next stay is just a tap away.
            </p>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="py-20 bg-[#faf5f0]" id="explore">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-[#2d1405] mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Top Ethiopian Destinations
              </h3>
              <p className="text-sm text-[#5a4a42]">Explore Ethiopia's most beautiful cities</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURED_DESTINATIONS.map((destination) => (
                <div
                  key={destination.name}
                  className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
                >
                  <img
                    src={destination.image}
                    alt={`${destination.name} landscape`}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 text-white">
                    <h4 className="text-xl font-bold">{destination.name}</h4>
                    <p className="text-sm">{destination.description}</p>
                    <p className="text-sm font-medium mt-1">
                      From {destination.priceFrom} ETB/night
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties Preview */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-[#2d1405] mb-3" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Authentic Ethiopian Accommodations
              </h3>
              <p className="text-[#5a4a42] max-w-2xl mx-auto text-base">
                From traditional lodges in the Simien Mountains to modern hotels in Addis Ababa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
              {[
                {
                  title: "Simien Mountain Lodge",
                  location: "Simien Mountains, Gondar",
                  price: "1,200",
                  image: mountainLodgeImg,
                  type: "Traditional Lodge",
                  rating: 4.8,
                },
                {
                  title: "Addis View Hotel",
                  location: "Bole, Addis Ababa",
                  price: "2,500",
                  image: boutiqueHotelImg,
                  type: "Boutique Hotel",
                  rating: 4.9,
                },
                {
                  title: "Blue Nile Retreat",
                  location: "Lake Shore, Bahir Dar",
                  price: "980",
                  image: lakesideRetreatImg,
                  type: "Lakeside Guesthouse",
                  rating: 4.7,
                },
              ].map((property) => (
                <Card key={property.title} className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border border-[#e5ddd5]">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#5a4a42] uppercase tracking-wide">{property.type}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 fill-[#2d1405] text-[#2d1405]" />
                        <span className="text-sm font-medium text-[#2d1405]">{property.rating}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg mb-2 text-[#2d1405]">
                      {property.title}
                    </h4>
                    <p className="text-sm mb-3 text-[#5a4a42]">{property.location}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-bold text-[#2d1405]">
                          {property.price} ETB
                        </span>
                        <span className="text-sm text-[#5a4a42]">/night</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button 
                onClick={() => openAuthDialog("login")} 
                size="lg" 
                className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white rounded-lg px-8 py-3 font-medium transition-all hover:shadow-lg"
                data-testid="button-view-properties"
              >
                View All Properties
              </Button>
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section className="py-20 bg-[#f5ece3] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Side - Phone Mockup */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div className="relative">
                  <img 
                    src={algaAppDownload}
                    alt="Alga Mobile App"
                    className="w-full max-w-sm h-auto drop-shadow-lg"
                    data-testid="img-app-download-mockup"
                  />
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="space-y-8 order-1 lg:order-2">
                <div className="space-y-4">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-[#2d1405]" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    Download the Alga App
                  </h2>
                  <p className="text-lg md:text-xl text-[#5a4a42]">
                    Book stays on the go
                  </p>
                </div>

                {/* App Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#2d1405]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-[#2d1405]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#2d1405]">Instant Alerts</h4>
                      <p className="text-sm text-[#5a4a42]">Real-time updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#2d1405]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-[#2d1405]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#2d1405]">Quick Booking</h4>
                      <p className="text-sm text-[#5a4a42]">Book in 3 taps</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#2d1405]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="h-5 w-5 text-[#2d1405]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#2d1405]">App Deals</h4>
                      <p className="text-sm text-[#5a4a42]">Exclusive offers</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[#2d1405]/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-5 w-5 text-[#2d1405]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#2d1405]">Digital Keys</h4>
                      <p className="text-sm text-[#5a4a42]">Access codes</p>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-3">
                    {/* App Store Badge */}
                    <button 
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "The iOS app will be available shortly.",
                          duration: 3000,
                        });
                      }}
                      className="inline-flex items-center space-x-2 bg-[#2d1405] hover:bg-[#3d1f0a] text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-md"
                      data-testid="link-app-store"
                    >
                      <Download className="h-5 w-5" />
                      <div className="text-left">
                        <div className="text-sm">App Store</div>
                      </div>
                    </button>

                    {/* Google Play Badge */}
                    <button 
                      onClick={() => {
                        toast({
                          title: "Coming Soon",
                          description: "The Android app will be available shortly.",
                          duration: 3000,
                        });
                      }}
                      className="inline-flex items-center space-x-2 bg-[#2d1405] hover:bg-[#3d1f0a] text-white px-6 py-3 rounded-lg font-medium transition-all hover:shadow-md"
                      data-testid="link-google-play"
                    >
                      <Smartphone className="h-5 w-5" />
                      <div className="text-left">
                        <div className="text-sm">Google Play</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Host Banner */}
        <section className="py-20 bg-white" id="host">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="bg-[#faf8f6] rounded-2xl p-10 border border-[#e5ddd5]">
                <h3 className="text-3xl md:text-4xl font-bold text-[#2d1405] mb-4" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Share Your Ethiopian Home
                </h3>
                <p className="text-base text-[#5a4a42] mb-8">
                  Join thousands of hosts earning extra income while welcoming travelers from around the world.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#2d1405]" />
                    <span className="text-[#5a4a42] text-sm">Free listing and professional photography</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#2d1405]" />
                    <span className="text-[#5a4a42] text-sm">Secure payments in Ethiopian Birr</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-[#2d1405]" />
                    <span className="text-[#5a4a42] text-sm">24/7 host support in Amharic and English</span>
                  </li>
                </ul>
                <div>
                  <Button 
                    onClick={() => navigate("/become-host")} 
                    size="lg" 
                    className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white rounded-lg px-8 py-3 font-medium transition-all hover:shadow-lg"
                    data-testid="button-start-hosting"
                  >
                    Start Hosting
                  </Button>
                </div>
              </div>

              {/* Right Side - iPhone Mockup */}
              <div className="flex justify-center items-center">
                <div className="relative w-full flex justify-center">
                  <img 
                    src={mobileAppMockup}
                    alt="Ethiopia Stays Mobile App"
                    className="w-full max-w-[300px] h-auto drop-shadow-2xl"
                    data-testid="img-mobile-mockup"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultMode={authMode}
      />
    </div>
  );
}
