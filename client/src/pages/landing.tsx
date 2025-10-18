import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchBanner from "@/components/search-banner";
import Footer from "@/components/footer";
import AuthDialog from "@/components/auth-dialog";
import { BackButton } from "@/components/back-button";
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
        <header className="bg-eth-warm-tan shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="text-primary-foreground text-xl" />
                </div>
                <h1 className="text-4xl font-bold text-eth-brown tracking-wide" style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: '0.08em' }}>
                  ALGA
                </h1>
              </div>

              <nav className="hidden md:flex items-center space-x-10">
                <a href="#explore" className="hover:opacity-70 transition-opacity font-medium text-lg text-eth-brown">
                  HOME
                </a>
                <a href="#services" className="hover:opacity-70 transition-opacity font-medium text-lg text-eth-brown">
                  SERVICES
                </a>
                <a href="#about" className="hover:opacity-70 transition-opacity font-medium text-lg text-eth-brown">
                  ABOUT
                </a>
                <a href="#host" className="hover:opacity-70 transition-opacity font-medium text-lg text-eth-brown">
                  CONTACT
                </a>
                <Button 
                  onClick={() => openAuthDialog("login")} 
                  className="bg-eth-orange hover:opacity-90 border-0 text-white rounded-xl px-6 py-2 font-bold"
                  data-testid="button-signin"
                >
                  SIGN IN
                </Button>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-[#f6bd89] via-[#fb9547] to-[#fb470b] py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Text and CTAs */}
              <div className="space-y-8 animate-fade-in-up">
                {/* Title */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    Welcome to Alga
                  </h1>
                  <p className="text-2xl md:text-3xl text-white/95 font-medium">
                    Experience Ethiopian stays — authentic, local, and easy to book.
                  </p>
                  <p className="text-lg md:text-xl text-white/90 max-w-xl">
                    Built for travelers, hosts, and the diaspora who believe home is where Ethiopia beats.
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    className="bg-eth-brown hover:bg-eth-brown/90 text-white rounded-xl px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    data-testid="button-download-app-hero"
                  >
                    Download the Alga App
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-2 border-white rounded-xl px-8 py-6 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    onClick={() => openAuthDialog("login")}
                    data-testid="button-explore-stays-hero"
                  >
                    Explore Stays <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>

                {/* Reassurance Line */}
                <div className="flex items-center space-x-3 text-white/95">
                  <Shield className="h-6 w-6" />
                  <p className="text-lg font-semibold">
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
                    data-testid="img-hero-phone-mockup"
                  />
                  {/* Decorative glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#fb470b]/20 to-transparent blur-3xl -z-10"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Closing Line */}
          <div className="mt-16 text-center">
            <p className="text-xl md:text-2xl text-white/95 font-medium italic px-6">
              From Axum to Arba Minch — your next stay is just a tap away.
            </p>
          </div>
        </section>

        {/* Featured Destinations */}
        <section className="py-16 bg-eth-warm-tan" id="explore">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <h3 className="text-4xl font-bold text-eth-brown mb-12" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              Explore Ethiopian Destinations
            </h3>

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
        <section className="py-16 bg-eth-warm-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-eth-brown mb-4" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Authentic Ethiopian Accommodations
              </h3>
              <p className="text-eth-brown max-w-2xl mx-auto text-lg">
                From traditional lodges in the Simien Mountains to modern hotels in Addis Ababa, 
                discover unique stays that showcase Ethiopia's rich culture and hospitality.
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
                <Card key={property.title} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-0" style={{ backgroundColor: '#d4a574' }}>
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium" style={{ color: '#3d1f0a' }}>{property.type}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4" style={{ fill: '#fb470b', color: '#fb470b' }} />
                        <span className="text-sm font-medium" style={{ color: '#3d1f0a' }}>{property.rating}</span>
                      </div>
                    </div>
                    <h4 className="font-bold text-lg mb-2" style={{ color: '#3d1f0a' }}>
                      {property.title}
                    </h4>
                    <p className="text-sm mb-3 font-medium" style={{ color: '#523419' }}>{property.location}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold" style={{ color: '#fb470b' }}>
                          {property.price} ETB
                        </span>
                        <span className="text-sm font-medium" style={{ color: '#3d1f0a' }}>/night</span>
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
                className="bg-eth-orange hover:opacity-90 border-0 text-white rounded-xl px-8 py-3 font-bold"
                data-testid="button-view-properties"
              >
                View All Properties
              </Button>
            </div>
          </div>
        </section>

        {/* Download App Section */}
        <section className="py-20 bg-gradient-to-br from-eth-orange to-[#fca12b] relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Phone Mockup */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div className="relative">
                  <img 
                    src={algaAppDownload}
                    alt="Alga Mobile App"
                    className="w-full max-w-sm h-auto drop-shadow-2xl animate-float"
                    data-testid="img-app-download-mockup"
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent blur-2xl -z-10"></div>
                </div>
              </div>

              {/* Right Side - Content */}
              <div className="space-y-8 text-white order-1 lg:order-2">
                <div className="space-y-4">
                  <h2 className="text-5xl md:text-6xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                    Book Faster with the Alga App
                  </h2>
                  <p className="text-xl md:text-2xl text-white/95">
                    Your Ethiopian adventure, now in your pocket
                  </p>
                </div>

                {/* App Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Instant Notifications</h4>
                      <p className="text-sm text-white/80">Get real-time booking updates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Quick Booking</h4>
                      <p className="text-sm text-white/80">Book in just 3 taps</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Gift className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Exclusive Deals</h4>
                      <p className="text-sm text-white/80">App-only discounts</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <QrCode className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">Easy Access</h4>
                      <p className="text-sm text-white/80">Digital access codes</p>
                    </div>
                  </div>
                </div>

                {/* Download Buttons */}
                <div className="space-y-4">
                  <p className="text-lg font-semibold">Download Now:</p>
                  <div className="flex flex-wrap gap-4">
                    {/* App Store Badge */}
                    <a 
                      href="#" 
                      className="inline-flex items-center space-x-3 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                      data-testid="link-app-store"
                    >
                      <Download className="h-6 w-6" />
                      <div className="text-left">
                        <div className="text-xs">Download on the</div>
                        <div className="text-lg font-bold">App Store</div>
                      </div>
                    </a>

                    {/* Google Play Badge */}
                    <a 
                      href="#" 
                      className="inline-flex items-center space-x-3 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
                      data-testid="link-google-play"
                    >
                      <Smartphone className="h-6 w-6" />
                      <div className="text-left">
                        <div className="text-xs">GET IT ON</div>
                        <div className="text-lg font-bold">Google Play</div>
                      </div>
                    </a>
                  </div>

                  {/* QR Code Option */}
                  <div className="pt-4 border-t border-white/20">
                    <p className="text-sm text-white/80 flex items-center space-x-2">
                      <QrCode className="h-4 w-4" />
                      <span>Or scan QR code from your phone to download instantly</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Host Banner */}
        <section className="py-20 bg-eth-warm-tan" id="host">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Side - Text Content */}
              <div className="bg-gradient-to-br from-[#f9e9d8] to-[#f6d8c2] rounded-3xl p-12 shadow-2xl border-2 border-eth-orange/20">
                <h3 className="text-4xl font-bold text-eth-brown mb-6" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Share Your Ethiopian Home
                </h3>
                <p className="text-lg text-eth-brown mb-8">
                  Join thousands of hosts earning extra income by welcoming travelers to 
                  experience authentic Ethiopian hospitality.
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6" style={{ color: '#fb470b' }} />
                    <span className="text-eth-brown text-lg">Free listing and professional photography</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6" style={{ color: '#fb470b' }} />
                    <span className="text-eth-brown text-lg">Secure payments in Ethiopian Birr</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6" style={{ color: '#fb470b' }} />
                    <span className="text-eth-brown text-lg">24/7 host support in Amharic and English</span>
                  </li>
                </ul>
                <div>
                  <Button 
                    onClick={() => openAuthDialog("register")} 
                    size="lg" 
                    className="bg-eth-orange hover:opacity-90 border-0 text-white rounded-xl px-10 py-4 font-bold text-lg"
                    data-testid="button-start-hosting"
                  >
                    START HOSTING
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
