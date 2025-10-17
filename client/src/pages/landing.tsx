import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchBanner from "@/components/search-banner";
import Footer from "@/components/footer";
import AuthDialog from "@/components/auth-dialog";
import { BackButton } from "@/components/back-button";
import { Star, CheckCircle, Home } from "lucide-react";
import { FEATURED_DESTINATIONS } from "@/lib/constants";
import mountainLodgeImg from "@assets/stock_images/mountain_lodge_cabin_537ba6f4.jpg";
import boutiqueHotelImg from "@assets/stock_images/luxury_boutique_hote_429d7d7d.jpg";
import lakesideRetreatImg from "@assets/stock_images/lakeside_resort_peac_aa065d79.jpg";

export default function Landing() {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const openAuthDialog = (mode: "login" | "register") => {
    setAuthMode(mode);
    setAuthDialogOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      {/* Ethiopian Pattern Sidebar */}
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-20">
        {/* Header */}
        <header className="bg-eth-warm-tan shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex justify-between items-center h-20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                  <Home className="text-primary-foreground text-xl" />
                </div>
                <h1 className="text-4xl font-bold text-eth-brown tracking-wide" style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: '0.08em' }}>
                  ETHIOPIA STAYS
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

        {/* Search Banner */}
        <SearchBanner />

        {/* Featured Destinations */}
        <section className="py-16 bg-eth-warm-tan" id="explore">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
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
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
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

        {/* Host Banner */}
        <section className="py-20 bg-eth-warm-tan" id="host">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="max-w-3xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl">
              <h3 className="text-4xl font-bold text-eth-brown mb-6" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Share Your Ethiopian Home
              </h3>
              <p className="text-lg text-eth-brown mb-8">
                Join thousands of hosts earning extra income by welcoming travelers to 
                experience authentic Ethiopian hospitality.
              </p>
              <ul className="space-y-4 mb-10 text-left inline-block">
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
