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

        <div className="max-w-4xl mx-auto px-2 sm:px-3 pt-1 pb-2">
          <div className="mb-1 flex items-center justify-between">
            <BackButton />
            {hasSearched && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHasSearched(false)}
                className="border-eth-brown/30 text-eth-brown hover:bg-eth-brown hover:text-white h-6 text-[10px] px-2"
                data-testid="button-new-search"
              >
                <Search className="h-2.5 w-2.5 mr-1" />
                New
              </Button>
            )}
          </div>
          
        <div className="flex flex-col lg:flex-row gap-2">
          {/* Filters Sidebar */}
          <div className={`lg:w-36 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-20">
              <div className="space-y-1">
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearFilters} 
                    className="text-[8px] text-eth-brown/50 hover:text-eth-brown underline mb-0.5"
                  >
                    Clear
                  </button>
                )}

                <div className="space-y-1.5">
                  {/* Location */}
                  <div>
                    <Label className="text-[8px] font-medium text-eth-brown/40 mb-0.5 block uppercase tracking-wide">Location</Label>
                    <Select value={filters.city || "all"} onValueChange={(value) => updateFilter("city", value === "all" ? undefined : value)}>
                      <SelectTrigger className="h-6 text-[10px] border-eth-brown/10 bg-white/40">
                        <SelectValue placeholder="All" />
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
                    <Label className="text-[8px] font-medium text-eth-brown/40 mb-0.5 block uppercase tracking-wide">Type</Label>
                    <Select value={filters.type || "all"} onValueChange={(value) => updateFilter("type", value === "all" ? undefined : value)}>
                      <SelectTrigger className="h-6 text-[10px] border-eth-brown/10 bg-white/40">
                        <SelectValue placeholder="All" />
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
                    <Label className="text-[8px] font-medium text-eth-brown/40 mb-0.5 block uppercase tracking-wide">Price</Label>
                    <div className="grid grid-cols-2 gap-1">
                      <Input
                        id="minPrice"
                        type="number"
                        placeholder="Min"
                        value={filters.minPrice || ""}
                        onChange={(e) => updateFilter("minPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-6 text-[10px] px-1.5 border-eth-brown/10 bg-white/40"
                      />
                      <Input
                        id="maxPrice"
                        type="number"
                        placeholder="Max"
                        value={filters.maxPrice || ""}
                        onChange={(e) => updateFilter("maxPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-6 text-[10px] px-1.5 border-eth-brown/10 bg-white/40"
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div>
                    <Label className="text-[8px] font-medium text-eth-brown/40 mb-0.5 block uppercase tracking-wide">Guests</Label>
                    <Select 
                      value={filters.maxGuests?.toString() || "all"} 
                      onValueChange={(value) => updateFilter("maxGuests", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger className="h-6 text-[10px] border-eth-brown/10 bg-white/40">
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
            <div className="flex items-center justify-between mb-1 gap-1">
              <p className="text-[8px] text-eth-brown/40 uppercase tracking-wide font-bold">
                ⚡ {properties.length} {properties.length === 1 ? 'stay' : 'stays'}
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden border-eth-brown/20 h-5 text-[8px] px-1.5"
                data-testid="button-toggle-filters"
              >
                <SlidersHorizontal className="h-2.5 w-2.5" />
              </Button>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-eth-brown/5 animate-pulse rounded-lg h-48"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-6 px-3 bg-white/40 rounded-lg">
                <div className="max-w-xs mx-auto">
                  <div className="w-10 h-10 bg-eth-orange/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Filter className="h-5 w-5 text-eth-orange" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-eth-brown mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>
                    No stays
                  </h3>
                  
                  <p className="text-[10px] text-eth-brown/70 mb-3">
                    Adjust filters
                  </p>
                  
                  <Button 
                    onClick={clearFilters} 
                    className="bg-eth-orange hover:bg-eth-orange/90 text-white px-4 py-1.5 text-[10px]" 
                    data-testid="button-clear-filters"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                  {properties.map((property, index) => (
                    <div 
                      key={property.id}
                      className="animate-fade-in hover:scale-[1.01] transition-transform"
                      style={{ 
                        animationDelay: `${index * 20}ms`,
                        opacity: 0,
                        animation: 'fadeIn 120ms ease-out forwards'
                      }}
                    >
                      <PropertyCard
                        property={property}
                        isFavorite={favoriteIds.has(property.id)}
                      />
                    </div>
                  ))}
                </div>
                
                <p className="text-center text-[8px] text-eth-brown/25 mt-4 italic">
                  Verified by Alga
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
