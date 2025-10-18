import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import PropertyCard from "@/components/property-card";
import SearchBanner from "@/components/search-banner";
import Footer from "@/components/footer";
import { BackButton } from "@/components/back-button";
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

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-2 pb-4 sm:pt-4 sm:pb-8">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
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
          
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20 bg-transparent">
              <div className="space-y-3.5">
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearFilters} 
                    className="text-xs text-eth-brown/60 hover:text-eth-brown underline underline-offset-2 transition-colors"
                  >
                    Clear filters ({activeFilterCount})
                  </button>
                )}

                <div className="space-y-4">
                  {/* Location */}
                  <div>
                    <Label className="text-xs font-medium text-eth-brown/50 mb-1.5 block uppercase tracking-wider">Location</Label>
                    <Select value={filters.city || "all"} onValueChange={(value) => updateFilter("city", value === "all" ? undefined : value)}>
                      <SelectTrigger className="h-9 text-sm border-eth-brown/10 bg-white/50 hover:bg-white hover:border-eth-brown/20 transition-all">
                        <SelectValue placeholder="All cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All cities</SelectItem>
                        {ETHIOPIAN_CITIES.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Property Type */}
                  <div>
                    <Label className="text-xs font-medium text-eth-brown/50 mb-1.5 block uppercase tracking-wider">Type</Label>
                    <Select value={filters.type || "all"} onValueChange={(value) => updateFilter("type", value === "all" ? undefined : value)}>
                      <SelectTrigger className="h-9 text-sm border-eth-brown/10 bg-white/50 hover:bg-white hover:border-eth-brown/20 transition-all">
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All types</SelectItem>
                        {PROPERTY_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-xs font-medium text-eth-brown/50 mb-1.5 block uppercase tracking-wider">Price (ETB/night)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) => updateFilter("minPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-9 text-sm border-eth-brown/10 bg-white/50 hover:bg-white hover:border-eth-brown/20 transition-all"
                      />
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) => updateFilter("maxPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-9 text-sm border-eth-brown/10 bg-white/50 hover:bg-white hover:border-eth-brown/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <Label className="text-xs font-medium text-eth-brown/50 mb-1.5 block uppercase tracking-wider">Guests</Label>
                    <Select 
                      value={filters.maxGuests?.toString() || "all"} 
                      onValueChange={(value) => updateFilter("maxGuests", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="h-9 text-sm border-eth-brown/10 bg-white/50 hover:bg-white hover:border-eth-brown/20 transition-all">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-5 gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-eth-brown truncate" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  {filters.city ? `Properties in ${filters.city}` : 'All Properties'}
                </h2>
                <p className="text-sm text-eth-brown/60 mt-0.5">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="text-xs px-2.5 py-0.5 bg-eth-orange/10 text-eth-brown border-0">
                    {activeFilterCount} active
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden border-eth-brown/20 hover:bg-eth-brown/5"
                  data-testid="button-toggle-filters"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                  Filters
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-eth-brown/5 animate-pulse rounded-2xl h-72"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 sm:py-16 px-6 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 bg-eth-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Filter className="h-8 w-8 text-eth-orange" />
                  </div>
                  
                  <h3 className="text-xl sm:text-2xl font-bold text-eth-brown mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    No stays found
                  </h3>
                  
                  <p className="text-sm sm:text-base text-eth-brown/70 mb-6 leading-relaxed">
                    No stays found — try exploring a different city or adjusting your price range.
                  </p>
                  
                  <Button 
                    onClick={clearFilters} 
                    className="
                      bg-eth-orange hover:bg-eth-orange/90 text-white px-8 py-6
                      transition-all duration-200
                      hover:shadow-lg hover:shadow-eth-orange/30
                      hover:scale-105
                    " 
                    data-testid="button-clear-filters"
                  >
                    Reset Search
                  </Button>
                  
                  <p className="text-xs text-eth-brown/50 mt-6 italic">
                    Showing verified Ethiopian stays curated by Alga.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {properties.map((property, index) => (
                    <div 
                      key={property.id}
                      className="animate-fade-in hover:scale-[1.02] transition-transform duration-200"
                      style={{ 
                        animationDelay: `${index * 40}ms`,
                        opacity: 0,
                        animation: 'fadeIn 180ms ease-out forwards'
                      }}
                    >
                      <PropertyCard
                        property={property}
                        isFavorite={favoriteIds.has(property.id)}
                      />
                    </div>
                  ))}
                </div>
                
                <p className="text-center text-xs text-eth-brown/40 mt-10 italic">
                  Verified Ethiopian stays curated by Alga
                </p>
              </>
            )}
          </div>
        </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
