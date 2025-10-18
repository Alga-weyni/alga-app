import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import PropertyCard from "@/components/property-card";
import SearchBanner from "@/components/search-banner";
import Footer from "@/components/footer";
import { BackButton } from "@/components/back-button";
import { SEOHead } from "@/components/seo-head";
import { PropertyGridSkeleton } from "@/components/property-skeleton";
import { FeaturedProperties } from "@/components/featured-properties";
import { Testimonials } from "@/components/testimonials";
import { TrustSection } from "@/components/trust-section";
import { HowItWorks } from "@/components/how-it-works";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, SlidersHorizontal, Search } from "lucide-react";
import { PROPERTY_TYPES, ETHIOPIAN_CITIES } from "@/lib/constants";
import type { Property } from "@shared/schema";

interface Filters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
  checkIn?: string;
  checkOut?: string;
}

export default function Properties() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Parse URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const urlFilters: Filters = {};
    
    if (params.get('destination')) urlFilters.city = params.get('destination')!;
    if (params.get('city')) urlFilters.city = params.get('city')!;
    if (params.get('type')) urlFilters.type = params.get('type')!;
    if (params.get('minPrice')) urlFilters.minPrice = parseInt(params.get('minPrice')!);
    if (params.get('maxPrice')) urlFilters.maxPrice = parseInt(params.get('maxPrice')!);
    if (params.get('guests')) urlFilters.maxGuests = parseInt(params.get('guests')!);
    if (params.get('checkIn')) urlFilters.checkIn = params.get('checkIn')!;
    if (params.get('checkOut')) urlFilters.checkOut = params.get('checkOut')!;
    
    setFilters(urlFilters);
    
    // If there are any filters from URL, mark as searched
    if (Object.keys(urlFilters).length > 0) {
      setHasSearched(true);
    }
  }, [location]);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });
      
      const response = await fetch(`/api/properties?${params}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
  });

  const { data: favorites = [] } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
  });

  const favoriteIds = new Set(favorites.map(fav => fav.id));

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  const seoTitle = filters.city 
    ? `${filters.city} Stays - Alga` 
    : "Authentic Ethiopian Stays - Alga";
  
  const seoDescription = filters.city
    ? `Find unique stays in ${filters.city}, Ethiopia. Book traditional homes, modern hotels, and cultural guesthouses. Safe, verified, and authentically Ethiopian.`
    : "Discover unique Ethiopian accommodations from Addis Ababa to Lalibela. Book traditional homes, modern hotels, and cultural guesthouses. Safe, verified, and authentically Ethiopian.";

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      <SEOHead 
        title={seoTitle}
        description={seoDescription}
      />
      
      {/* Ethiopian Pattern Sidebar */}
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      
      {/* Main Content */}
      <div className="flex-1 lg:ml-20">
        <Header />
        
        {!hasSearched && (
          <SearchBanner 
            onSearch={(searchFilters) => {
              setFilters({
                city: searchFilters.destination,
                maxGuests: parseInt(searchFilters.guests),
                checkIn: searchFilters.checkIn,
                checkOut: searchFilters.checkOut,
              });
              setHasSearched(true);
            }}
            initialFilters={{
              destination: filters.city || "",
              guests: filters.maxGuests?.toString() || "1",
              checkIn: filters.checkIn || "",
              checkOut: filters.checkOut || "",
            }}
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mb-3 flex items-center justify-between">
            <BackButton />
            {hasSearched && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHasSearched(false)}
                className="border-eth-brown/30 text-eth-brown hover:bg-eth-brown hover:text-white"
                data-testid="button-new-search"
              >
                <Search className="h-4 w-4 mr-2" />
                New Search
              </Button>
            )}
          </div>
          
          {/* Properties Grid - Full Width */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-eth-brown" style={{ fontSize: '87%' }}>
                🏠 {properties.length} {properties.length === 1 ? 'Stay' : 'Stays'} Available
              </h2>
            </div>

            {isLoading ? (
              <PropertyGridSkeleton count={12} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {properties.map((property, index) => (
                    <div 
                      key={property.id}
                      className="animate-fade-in hover:scale-105 transition-all"
                      style={{ 
                        animationDelay: `${index * 50}ms`,
                        opacity: 0,
                        animation: 'fadeIn 300ms ease-out forwards'
                      }}
                    >
                      <PropertyCard
                        property={property}
                        isFavorite={favoriteIds.has(property.id)}
                      />
                    </div>
                  ))}
                </div>
                
                <p className="text-center text-sm text-eth-brown/40 mt-12 italic">
                  Verified Ethiopian stays curated by Alga
                </p>
              </>
            )}
          </div>
        </div>

        {/* Show featured sections only on initial page load (no search filters) */}
        {!hasSearched && (
          <>
            <FeaturedProperties />
            <HowItWorks />
            <TrustSection />
            <Testimonials />
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
