import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import SearchBanner from "@/components/search-banner";
import PropertyCard from "@/components/property-card";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Star, TrendingUp, Database, Activity, Bell, Zap, Gift, Key, Apple, MapPin } from "lucide-react";
import { SiGoogleplay } from "react-icons/si";
import type { Property } from "@shared/schema";
import mobileAppMockup from "@/assets/ethiopia-stays-mobile-mockup.png";

export default function Home() {
  const { toast } = useToast();
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const { data: favorites = [] } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
  });

  const favoriteIds = new Set(favorites.map(fav => fav.id));

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      {/* Ethiopian Pattern Sidebar */}
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-20">
        <Header />
        <SearchBanner />

        {/* Explore by Map Section */}
        <section className="py-16 bg-eth-light-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="bg-gradient-to-r from-eth-warm-tan to-eth-light-tan rounded-3xl shadow-xl overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0 items-center">
                
                {/* Left Side - Content */}
                <div className="p-8 md:p-12 space-y-6">
                  <div>
                    <h3 
                      className="text-3xl md:text-4xl lg:text-5xl font-bold text-eth-brown mb-4" 
                      style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                      data-testid="heading-explore-map"
                    >
                      <span className="hidden md:inline">Explore Ethiopian Stays by Map</span>
                      <span className="md:hidden">Explore by Map</span>
                    </h3>
                    <div className="w-20 h-1 bg-eth-orange rounded-full"></div>
                  </div>
                  
                  <p className="text-base md:text-lg text-eth-brown/80 leading-relaxed" data-testid="text-map-description">
                    <span className="hidden md:block">
                      Discover authentic homes, guesthouses, and city escapes across Ethiopia — from Addis to Axum. 
                      Zoom in, explore local stays, and experience Ethiopian hospitality wherever you go.
                    </span>
                    <span className="md:hidden">
                      Find verified stays across Ethiopia — from Addis to Axum.
                    </span>
                  </p>
                  
                  <Link href="/properties">
                    <Button 
                      className="bg-eth-orange hover:bg-eth-orange/90 text-white text-lg px-8 py-6 flex items-center gap-2"
                      data-testid="button-explore-map"
                    >
                      <MapPin className="h-5 w-5" />
                      Explore Map View
                    </Button>
                  </Link>
                </div>

                {/* Right Side - Map Visual */}
                <div className="relative h-64 md:h-full min-h-[300px] bg-eth-brown/10">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      {/* Decorative Map Pins */}
                      <div className="relative w-64 h-64">
                        {/* Center pin - Addis Ababa */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce">
                          <div className="w-16 h-16 bg-eth-orange rounded-full flex items-center justify-center shadow-lg">
                            <MapPin className="h-8 w-8 text-white" />
                          </div>
                          <p className="text-center text-xs font-semibold text-eth-brown mt-2">Addis Ababa</p>
                        </div>
                        
                        {/* Other pins */}
                        <div className="absolute top-12 left-16 opacity-70">
                          <div className="w-10 h-10 bg-eth-gold rounded-full flex items-center justify-center shadow-md">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-center text-xs text-eth-brown/70 mt-1">Lalibela</p>
                        </div>
                        
                        <div className="absolute top-8 right-20 opacity-70">
                          <div className="w-10 h-10 bg-eth-green rounded-full flex items-center justify-center shadow-md">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-center text-xs text-eth-brown/70 mt-1">Axum</p>
                        </div>
                        
                        <div className="absolute bottom-16 left-20 opacity-70">
                          <div className="w-10 h-10 bg-eth-orange/70 rounded-full flex items-center justify-center shadow-md">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-center text-xs text-eth-brown/70 mt-1">Bahir Dar</p>
                        </div>
                        
                        <div className="absolute bottom-12 right-16 opacity-70">
                          <div className="w-10 h-10 bg-eth-gold/80 rounded-full flex items-center justify-center shadow-md">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <p className="text-center text-xs text-eth-brown/70 mt-1">Gondar</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-eth-warm-tan/30 to-transparent pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 bg-eth-warm-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-4xl font-bold text-eth-brown" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>Featured Stays</h3>
              <Link href="/properties">
                <Button variant="outline" className="border-eth-brown text-eth-brown hover:bg-eth-brown hover:text-white">View All Properties</Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-3xl">
                <Database className="mx-auto h-12 w-12 text-eth-brown mb-4" />
                <h4 className="text-lg font-medium text-eth-brown mb-2">No properties available yet</h4>
                <p className="text-eth-brown">
                  New properties are coming soon. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.slice(0, 6).map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favoriteIds.has(property.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Mobile App Download Section */}
        <section className="py-20 bg-gradient-to-br from-eth-light-tan to-eth-warm-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              {/* Headline - Large */}
              <h3 
                className="text-5xl md:text-6xl font-bold text-eth-brown mb-4" 
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                data-testid="heading-app-download"
              >
                Book Faster with the Alga App
              </h3>
              
              {/* Sub-headline - Medium */}
              <p className="text-xl md:text-2xl text-eth-brown/80" data-testid="text-app-subheading">
                Your next Ethiopian stay — just a tap away.
              </p>
            </div>

            {/* 4-Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {/* Feature 1: Instant Notifications */}
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center space-y-3" data-testid="feature-notifications">
                <div className="w-14 h-14 bg-eth-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="h-7 w-7 text-eth-orange" />
                </div>
                <h4 className="text-lg font-bold text-eth-brown">Instant Notifications</h4>
                <p className="text-sm text-eth-brown/70">Get alerts in real time</p>
              </div>

              {/* Feature 2: Quick Booking */}
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center space-y-3" data-testid="feature-booking">
                <div className="w-14 h-14 bg-eth-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-7 w-7 text-eth-orange" />
                </div>
                <h4 className="text-lg font-bold text-eth-brown">Quick Booking</h4>
                <p className="text-sm text-eth-brown/70">Book in 3 taps</p>
              </div>

              {/* Feature 3: Exclusive Deals */}
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center space-y-3" data-testid="feature-deals">
                <div className="w-14 h-14 bg-eth-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <Gift className="h-7 w-7 text-eth-orange" />
                </div>
                <h4 className="text-lg font-bold text-eth-brown">Exclusive Deals</h4>
                <p className="text-sm text-eth-brown/70">App-only offers</p>
              </div>

              {/* Feature 4: Easy Access */}
              <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 text-center space-y-3" data-testid="feature-access">
                <div className="w-14 h-14 bg-eth-orange/10 rounded-full flex items-center justify-center mx-auto">
                  <Key className="h-7 w-7 text-eth-orange" />
                </div>
                <h4 className="text-lg font-bold text-eth-brown">Easy Access</h4>
                <p className="text-sm text-eth-brown/70">Digital access codes</p>
              </div>
            </div>

            {/* Download CTA Buttons - Prominent */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <Button 
                className="bg-eth-brown hover:bg-eth-brown/90 text-white text-lg px-8 py-6 min-w-[220px] flex items-center gap-3"
                data-testid="button-app-store"
                onClick={() => {
                  toast({
                    title: "📱 Coming to iOS!",
                    description: "The Alga app will be available on the App Store soon. Book now on our website!",
                    duration: 5000,
                  });
                }}
              >
                <Apple className="h-6 w-6" />
                App Store
              </Button>
              
              <Button 
                className="bg-eth-orange hover:bg-eth-orange/90 text-white text-lg px-8 py-6 min-w-[220px] flex items-center gap-3"
                data-testid="button-google-play"
                onClick={() => {
                  toast({
                    title: "📱 Coming to Android!",
                    description: "The Alga app will be available on Google Play soon. Book now on our website!",
                    duration: 5000,
                  });
                }}
              >
                <SiGoogleplay className="h-6 w-6" />
                Google Play
              </Button>
            </div>

            {/* Optional Note */}
            <p className="text-center text-sm text-eth-brown/60" data-testid="text-app-availability">
              Available for guests and hosts worldwide
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-16 bg-eth-light-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-eth-brown/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-eth-orange/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Star className="h-6 w-6 text-eth-orange" />
                  </div>
                  <h4 className="text-2xl font-bold text-eth-brown mb-2">
                    {properties.length}
                  </h4>
                  <p className="text-eth-brown">Unique Properties</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-eth-brown/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-eth-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-6 w-6 text-eth-gold" />
                  </div>
                  <h4 className="text-2xl font-bold text-eth-brown mb-2">15+</h4>
                  <p className="text-eth-brown">Ethiopian Cities</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-eth-brown/20">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-eth-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-6 w-6 text-eth-green" />
                  </div>
                  <h4 className="text-2xl font-bold text-eth-brown mb-2">100%</h4>
                  <p className="text-eth-brown">Authentic Experience</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
