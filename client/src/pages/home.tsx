import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import SearchBanner from "@/components/search-banner";
import PropertyCard from "@/components/property-card";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Star, TrendingUp, Database, Activity } from "lucide-react";
import { FEATURED_DESTINATIONS } from "@/lib/constants";
import type { Property } from "@shared/schema";

export default function Home() {
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

        {/* Featured Destinations */}
        <section className="py-16 bg-eth-light-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <h3 className="text-4xl font-bold text-eth-brown mb-12" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
              Explore Ethiopian Destinations
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {FEATURED_DESTINATIONS.map((destination) => (
                <Link
                  key={destination.name}
                  href={`/properties?city=${encodeURIComponent(destination.name)}`}
                >
                  <div className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer">
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
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Properties */}
        <section className="py-16 bg-eth-warm-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
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

        {/* Quick Stats */}
        <section className="py-16 bg-eth-light-tan">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
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
