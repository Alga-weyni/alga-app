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
        <section className="py-20 bg-[#f5ece3]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-[#e5ddd5]">
              <div className="grid md:grid-cols-2 gap-0 items-center">
                
                {/* Left Side - Content */}
                <div className="p-10 md:p-14 space-y-6">
                  <div>
                    <h3 
                      className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2d1405] mb-3" 
                      style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                      data-testid="heading-explore-map"
                    >
                      <span className="hidden md:inline">Browse All Cities</span>
                      <span className="md:hidden">Browse Cities</span>
                    </h3>
                  </div>
                  
                  <p className="text-sm md:text-base text-[#5a4a42] leading-relaxed max-w-md" data-testid="text-map-description">
                    <span className="hidden md:block">
                      From Addis Ababa to Lalibela, discover verified stays across Ethiopia's most beautiful destinations.
                    </span>
                    <span className="md:hidden">
                      Verified stays across Ethiopia's top cities.
                    </span>
                  </p>
                  
                  <Link href="/properties">
                    <Button 
                      className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all hover:shadow-md"
                      data-testid="button-explore-map"
                    >
                      <MapPin className="h-4 w-4" />
                      View All Properties
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
        <section className="py-20 bg-[#faf5f0]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-[#2d1405] mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>Featured Stays</h3>
                <p className="text-sm text-[#5a4a42]">Handpicked for you</p>
              </div>
              <Link href="/properties">
                <Button variant="outline" className="border-[#d4c4b8] text-[#2d1405] hover:bg-[#2d1405] hover:text-white hover:border-[#2d1405] transition-all">View All</Button>
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
        <section className="py-20 bg-[#f5ece3]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="text-center mb-12">
              {/* Headline - Large */}
              <h3 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#2d1405] mb-3" 
                style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}
                data-testid="heading-app-download"
              >
                Download the Alga App
              </h3>
              
              {/* Sub-headline - Medium */}
              <p className="text-base md:text-lg text-[#5a4a42]" data-testid="text-app-subheading">
                Book stays on the go
              </p>
            </div>

            {/* 4-Feature Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
              {/* Feature 1: Instant Notifications */}
              <div className="bg-white rounded-xl p-5 text-center space-y-2 border border-[#e5ddd5]" data-testid="feature-notifications">
                <div className="w-12 h-12 bg-[#2d1405]/5 rounded-full flex items-center justify-center mx-auto">
                  <Bell className="h-5 w-5 text-[#2d1405]" />
                </div>
                <h4 className="text-sm font-bold text-[#2d1405]">Instant Alerts</h4>
                <p className="text-xs text-[#5a4a42]">Real-time updates</p>
              </div>

              {/* Feature 2: Quick Booking */}
              <div className="bg-white rounded-xl p-5 text-center space-y-2 border border-[#e5ddd5]" data-testid="feature-booking">
                <div className="w-12 h-12 bg-[#2d1405]/5 rounded-full flex items-center justify-center mx-auto">
                  <Zap className="h-5 w-5 text-[#2d1405]" />
                </div>
                <h4 className="text-sm font-bold text-[#2d1405]">Quick Booking</h4>
                <p className="text-xs text-[#5a4a42]">Book in 3 taps</p>
              </div>

              {/* Feature 3: Exclusive Deals */}
              <div className="bg-white rounded-xl p-5 text-center space-y-2 border border-[#e5ddd5]" data-testid="feature-deals">
                <div className="w-12 h-12 bg-[#2d1405]/5 rounded-full flex items-center justify-center mx-auto">
                  <Gift className="h-5 w-5 text-[#2d1405]" />
                </div>
                <h4 className="text-sm font-bold text-[#2d1405]">App Deals</h4>
                <p className="text-xs text-[#5a4a42]">Exclusive offers</p>
              </div>

              {/* Feature 4: Easy Access */}
              <div className="bg-white rounded-xl p-5 text-center space-y-2 border border-[#e5ddd5]" data-testid="feature-access">
                <div className="w-12 h-12 bg-[#2d1405]/5 rounded-full flex items-center justify-center mx-auto">
                  <Key className="h-5 w-5 text-[#2d1405]" />
                </div>
                <h4 className="text-sm font-bold text-[#2d1405]">Digital Keys</h4>
                <p className="text-xs text-[#5a4a42]">Access codes</p>
              </div>
            </div>

            {/* Download CTA Buttons - Prominent */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-3">
              <Button 
                className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white px-7 py-5 min-w-[200px] flex items-center gap-2 rounded-lg transition-all hover:shadow-md"
                data-testid="button-app-store"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "The iOS app will be available shortly.",
                    duration: 3000,
                  });
                }}
              >
                <Apple className="h-5 w-5" />
                App Store
              </Button>
              
              <Button 
                className="bg-[#2d1405] hover:bg-[#3d1f0a] text-white px-7 py-5 min-w-[200px] flex items-center gap-2 rounded-lg transition-all hover:shadow-md"
                data-testid="button-google-play"
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "The Android app will be available shortly.",
                    duration: 3000,
                  });
                }}
              >
                <SiGoogleplay className="h-5 w-5" />
                Google Play
              </Button>
            </div>

            {/* Optional Note */}
            <p className="text-center text-xs text-[#5a4a42]/60" data-testid="text-app-availability">
              Available worldwide for guests and hosts
            </p>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#faf8f6] border-[#e5ddd5] hover:shadow-md transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-[#2d1405]/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="h-5 w-5 text-[#2d1405]" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#2d1405] mb-1">
                    {properties.length}
                  </h4>
                  <p className="text-sm text-[#5a4a42]">Unique Properties</p>
                </CardContent>
              </Card>

              <Card className="bg-[#faf8f6] border-[#e5ddd5] hover:shadow-md transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-[#2d1405]/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-5 w-5 text-[#2d1405]" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#2d1405] mb-1">15+</h4>
                  <p className="text-sm text-[#5a4a42]">Ethiopian Cities</p>
                </CardContent>
              </Card>

              <Card className="bg-[#faf8f6] border-[#e5ddd5] hover:shadow-md transition-shadow">
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-[#2d1405]/5 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Activity className="h-5 w-5 text-[#2d1405]" />
                  </div>
                  <h4 className="text-3xl font-bold text-[#2d1405] mb-1">100%</h4>
                  <p className="text-sm text-[#5a4a42]">Authentic Experience</p>
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
