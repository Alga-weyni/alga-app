import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Star, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Property } from "@shared/schema";

export function FeaturedProperties() {
  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Get top-rated properties
  const featured = properties
    .filter(p => parseFloat(p.rating || "0") >= 4.7)
    .sort((a, b) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
    .slice(0, 3);

  if (isLoading || featured.length === 0) return null;

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 
            className="text-3xl sm:text-4xl font-bold text-eth-brown mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Featured Ethiopian Stays
          </h2>
          <p className="text-eth-brown/70 text-lg">
            Handpicked accommodations across Ethiopia's most beautiful destinations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {featured.map((property) => (
            <Link 
              key={property.id} 
              href={`/properties/${property.id}`}
              className="group"
            >
              <div className="bg-cream-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={property.images?.[0] || "/api/placeholder/800/600"}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-eth-brown">{property.rating}</span>
                  </div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-xl text-eth-brown mb-2 line-clamp-1">
                    {property.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-eth-brown/70 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{property.city}, {property.region}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-eth-brown/70 mb-4">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Up to {property.maxGuests} guests</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                    <div>
                      <span className="text-2xl font-bold text-eth-brown">
                        {new Intl.NumberFormat('en-ET', {
                          style: 'currency',
                          currency: 'ETB',
                          minimumFractionDigits: 0,
                        }).format(parseFloat(property.pricePerNight))}
                      </span>
                      <span className="text-eth-brown/60 text-sm ml-1">/night</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-eth-brown hover:bg-eth-brown hover:text-white"
                      data-testid={`button-view-${property.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link href="/properties">
            <Button 
              className="bg-eth-brown hover:bg-eth-brown/90 text-white px-8 py-6 text-lg"
              data-testid="button-explore-all"
            >
              Explore All Properties
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
