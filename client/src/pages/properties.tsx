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
import { Filter, SlidersHorizontal } from "lucide-react";
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
        
        <SearchBanner 
          onSearch={(searchFilters) => {
            setFilters({
              city: searchFilters.destination,
              maxGuests: parseInt(searchFilters.guests),
              checkIn: searchFilters.checkIn,
              checkOut: searchFilters.checkOut,
            });
          }}
          initialFilters={{
            destination: filters.city || "",
            guests: filters.maxGuests?.toString() || "1",
            checkIn: filters.checkIn || "",
            checkOut: filters.checkOut || "",
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
          <div className="mb-6">
            <BackButton />
          </div>
          
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card className="sticky top-24 bg-white/60 backdrop-blur-sm border-eth-brown/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-eth-brown">Filters</h3>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-eth-brown hover:bg-eth-brown/10">
                      Clear all
                    </Button>
                  )}
                </div>

                <div className="space-y-6">
                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Location</Label>
                    <Select value={filters.city || "all"} onValueChange={(value) => updateFilter("city", value === "all" ? undefined : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose city..." />
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

                  <Separator />

                  {/* Property Type */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Property Type</Label>
                    <Select value={filters.type || "all"} onValueChange={(value) => updateFilter("type", value === "all" ? undefined : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All types..." />
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

                  <Separator />

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Price Range (ETB/night)</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="minPrice" className="text-xs text-gray-500">Min</Label>
                        <Input
                          id="minPrice"
                          type="number"
                          placeholder="0"
                          value={filters.minPrice || ""}
                          onChange={(e) => updateFilter("minPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="maxPrice" className="text-xs text-gray-500">Max</Label>
                        <Input
                          id="maxPrice"
                          type="number"
                          placeholder="10000"
                          value={filters.maxPrice || ""}
                          onChange={(e) => updateFilter("maxPrice", e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Guests */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Guests</Label>
                    <Select 
                      value={filters.maxGuests?.toString() || "all"} 
                      onValueChange={(value) => updateFilter("maxGuests", value === "all" ? undefined : parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Any number..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any number</SelectItem>
                        <SelectItem value="1">1 guest</SelectItem>
                        <SelectItem value="2">2 guests</SelectItem>
                        <SelectItem value="3">3 guests</SelectItem>
                        <SelectItem value="4">4 guests</SelectItem>
                        <SelectItem value="5">5+ guests</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-eth-brown" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  {filters.city ? `Properties in ${filters.city}` : 'All Properties'}
                </h2>
                <p className="text-eth-brown">
                  {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
                </p>
              </div>

              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <Badge variant="secondary">
                    {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="bg-gray-200 animate-pulse rounded-xl h-80"></div>
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-3xl">
                <Filter className="mx-auto h-12 w-12 text-eth-brown mb-4" />
                <h3 className="text-lg font-medium text-eth-brown mb-2">No properties found</h3>
                <p className="text-eth-brown mb-6">
                  Try adjusting your search criteria or remove some filters.
                </p>
                <Button onClick={clearFilters} className="bg-eth-orange hover:opacity-90 text-white">Clear all filters</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    isFavorite={favoriteIds.has(property.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
