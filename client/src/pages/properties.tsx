import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
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
import { Filter, SlidersHorizontal, Search, Map as MapIcon, LayoutGrid, Loader2, X } from "lucide-react";
import { PROPERTY_TYPES, ETHIOPIAN_CITIES } from "@/lib/constants";
import GoogleMapView from "@/components/google-map-view";
import type { Property } from "@shared/schema";

// Top 5 popular Ethiopian cities for quick filters
const TOP_CITIES = ["Addis Ababa", "Bishoftu", "Adama", "Hawassa", "Bahir Dar"];

interface Filters {
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  maxGuests?: number;
  checkIn?: string;
  checkOut?: string;
  q?: string;
  sort?: string;
}

export default function Properties() {
  const [location] = useLocation();
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

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
    if (params.get('q')) {
      urlFilters.q = params.get('q')!;
      setKeyword(params.get('q')!);
    }
    if (params.get('sort')) urlFilters.sort = params.get('sort')!;
    
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
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const favoriteIds = new Set(favorites.map(fav => fav.id));

  const updateFilter = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setKeyword("");
  };

  const removeFilter = (key: keyof Filters) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    if (key === 'q') setKeyword("");
  };

  const handleKeywordSearch = () => {
    if (keyword.trim()) {
      updateFilter('q', keyword.trim());
    } else {
      removeFilter('q');
    }
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
          
          {/* Enhanced Search & Filters */}
          <div>
            {/* Keyword Search & Controls Bar */}
            <div className="mb-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Keyword Search */}
                <div className="flex-1 flex gap-2">
                  <Input
                    type="text"
                    placeholder="Search by name, location, or description..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleKeywordSearch()}
                    className="flex-1 bg-white border-eth-brown/20"
                    data-testid="input-keyword-search"
                  />
                  <Button
                    onClick={handleKeywordSearch}
                    className="bg-eth-brown hover:bg-eth-brown/90"
                    data-testid="button-keyword-search"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick City Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-eth-brown/60 hidden sm:inline">Quick filters:</span>
                  {TOP_CITIES.map((city) => (
                    <Button
                      key={city}
                      variant={filters.city === city ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateFilter('city', filters.city === city ? undefined : city)}
                      className={`text-xs ${
                        filters.city === city 
                          ? 'bg-eth-brown hover:bg-eth-brown/90 text-white' 
                          : 'border-eth-brown/30 text-eth-brown hover:bg-eth-brown/10'
                      }`}
                      data-testid={`button-quick-city-${city.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {city}
                    </Button>
                  ))}
                </div>

                {/* Sort Dropdown */}
                <Select value={filters.sort || 'recommended'} onValueChange={(value) => updateFilter('sort', value)}>
                  <SelectTrigger className="w-full sm:w-[200px] bg-white border-eth-brown/20">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating_desc">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="flex border border-eth-brown/30 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-eth-brown hover:bg-eth-brown/90' : 'text-eth-brown'}
                    data-testid="button-view-grid"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'map' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('map')}
                    className={viewMode === 'map' ? 'bg-eth-brown hover:bg-eth-brown/90' : 'text-eth-brown'}
                    data-testid="button-view-map"
                  >
                    <MapIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="border-eth-brown/30 text-eth-brown hover:bg-eth-brown hover:text-white"
                  data-testid="button-toggle-filters"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </Button>
              </div>

              {/* Collapsible Advanced Filters */}
              {showFilters && (
                <Card className="border-eth-brown/20">
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* City Filter */}
                      <div>
                        <Label className="text-xs font-semibold text-eth-brown mb-2 block">City</Label>
                        <Select 
                          value={filters.city || 'all'} 
                          onValueChange={(value) => updateFilter('city', value === 'all' ? undefined : value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="All cities" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All cities</SelectItem>
                            {ETHIOPIAN_CITIES.map((city) => (
                              <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Property Type Filter */}
                      <div>
                        <Label className="text-xs font-semibold text-eth-brown mb-2 block">Property Type</Label>
                        <Select 
                          value={filters.type || 'all'} 
                          onValueChange={(value) => updateFilter('type', value === 'all' ? undefined : value)}
                        >
                          <SelectTrigger className="bg-white">
                            <SelectValue placeholder="All types" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All types</SelectItem>
                            {PROPERTY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Min Price */}
                      <div>
                        <Label className="text-xs font-semibold text-eth-brown mb-2 block">Min Price (ETB)</Label>
                        <Input
                          type="number"
                          placeholder="Any"
                          value={filters.minPrice || ''}
                          onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="bg-white"
                          data-testid="input-min-price"
                        />
                      </div>

                      {/* Max Price */}
                      <div>
                        <Label className="text-xs font-semibold text-eth-brown mb-2 block">Max Price (ETB)</Label>
                        <Input
                          type="number"
                          placeholder="Any"
                          value={filters.maxPrice || ''}
                          onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="bg-white"
                          data-testid="input-max-price"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Active Filter Badges */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-eth-brown/60">Active filters:</span>
                  {filters.city && (
                    <Badge variant="secondary" className="gap-1" data-testid="badge-filter-city">
                      City: {filters.city}
                      <button onClick={() => removeFilter('city')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {filters.type && (
                    <Badge variant="secondary" className="gap-1" data-testid="badge-filter-type">
                      Type: {filters.type}
                      <button onClick={() => removeFilter('type')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {filters.minPrice && (
                    <Badge variant="secondary" className="gap-1">
                      Min: {filters.minPrice} ETB
                      <button onClick={() => removeFilter('minPrice')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {filters.maxPrice && (
                    <Badge variant="secondary" className="gap-1">
                      Max: {filters.maxPrice} ETB
                      <button onClick={() => removeFilter('maxPrice')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {filters.maxGuests && (
                    <Badge variant="secondary" className="gap-1">
                      Guests: {filters.maxGuests}+
                      <button onClick={() => removeFilter('maxGuests')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  {filters.q && (
                    <Badge variant="secondary" className="gap-1" data-testid="badge-filter-keyword">
                      "{filters.q}"
                      <button onClick={() => removeFilter('q')} className="ml-1 hover:text-destructive">×</button>
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 text-xs text-eth-brown hover:text-eth-brown/70"
                    data-testid="button-clear-filters"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Results Count & Loading State */}
            <div className="flex items-center justify-between mb-4">
              {isLoading ? (
                <div className="flex items-center gap-2 text-eth-brown">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-lg font-semibold">Searching properties...</span>
                </div>
              ) : (
                <h2 className="text-lg font-semibold text-eth-brown" style={{ fontSize: '87%' }}>
                  🏠 {properties.length} {properties.length === 1 ? 'Stay' : 'Stays'} Available
                </h2>
              )}
            </div>

            {isLoading ? (
              <PropertyGridSkeleton count={12} />
            ) : properties.length === 0 ? (
              <Card className="mt-8 border-eth-brown/20">
                <CardContent className="py-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="mb-4 text-6xl">🔍</div>
                    <h3 className="text-xl font-semibold text-eth-brown mb-2">No properties found</h3>
                    <p className="text-eth-brown/60 mb-6">
                      We couldn't find any properties matching your search criteria.
                    </p>
                    
                    {/* Suggestions */}
                    <div className="space-y-4">
                      {activeFilterCount > 0 && (
                        <Button
                          onClick={clearFilters}
                          className="bg-eth-brown hover:bg-eth-brown/90"
                          data-testid="button-clear-filters-empty"
                        >
                          Clear All Filters
                        </Button>
                      )}
                      
                      {/* City Suggestions */}
                      <div className="pt-4 border-t border-eth-brown/10">
                        <p className="text-sm text-eth-brown/60 mb-3">Try searching in popular cities:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {TOP_CITIES.map((city) => (
                            <Button
                              key={city}
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                clearFilters();
                                updateFilter('city', city);
                              }}
                              className="border-eth-brown/30 text-eth-brown hover:bg-eth-brown/10"
                              data-testid={`button-suggest-city-${city.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              {city}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : viewMode === 'map' ? (
              <>
                <GoogleMapView
                  properties={properties.map(p => ({ ...p, images: p.images || [] }))}
                  selectedPropertyId={selectedPropertyId}
                  onPropertySelect={setSelectedPropertyId}
                  height="600px"
                  zoom={11}
                />
                <p className="text-center text-sm text-eth-brown/40 mt-6 italic">
                  Explore {properties.length} verified Ethiopian stays on the map
                </p>
              </>
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
