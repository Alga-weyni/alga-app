import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-config";
import { useLocation } from "react-router-dom";
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
import { PROPERTY_TYPES, ETHIOPIAN_CITIES } from "@/lib/constants";
import { Loader2, X, Search, SlidersHorizontal } from "lucide-react";
import type { Property } from "@shared/schema";

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
  const location = useLocation();
  const [filters, setFilters] = useState<Filters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search || "");
    const urlFilters: Filters = {};

    for (const [key, value] of params.entries()) {
      urlFilters[key as keyof Filters] = isNaN(Number(value))
        ? value
        : Number(value);
    }

    setFilters(urlFilters);

    if (Object.keys(urlFilters).length > 0) {
      setHasSearched(true);
    }
  }, [location]);

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });

      return apiRequest(`/api/properties?${params.toString()}`, {
        method: "GET",
      });
    },
  });

  const { data: favorites } = useQuery<Property[]>({
    queryKey: ["/api/favorites"],
    queryFn: async () => apiRequest("/api/favorites", { method: "GET" }),
    retry: false,
  });

  const favoriteIds = new Set((favorites || []).map((f) => f.id));

  const updateFilter = (key: keyof Filters, value: any) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const clearFilters = () => {
    setFilters({});
    setKeyword("");
  };

  const removeFilter = (key: keyof Filters) => {
    const f = { ...filters };
    delete f[key];
    setFilters(f);
  };

  const handleKeywordSearch = () => {
    if (keyword.trim()) {
      updateFilter("q", keyword.trim());
    } else {
      removeFilter("q");
    }
  };

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      <SEOHead title="Stays - Alga" description="Ethiopian stays" />
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
          />
        )}

        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <BackButton />
            {hasSearched && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHasSearched(false)}
              >
                <Search className="h-4 w-4 mr-2" />
                New Search
              </Button>
            )}
          </div>

          {/* Results Header */}
          <div className="mb-4">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading properties...</span>
              </div>
            ) : (
              <h2 className="text-lg font-semibold text-eth-brown">
                {properties.length} stays available
              </h2>
            )}
          </div>

          {/* Listings */}
          {isLoading ? (
            <PropertyGridSkeleton count={12} />
          ) : properties.length === 0 ? (
            <Card className="mt-8 border-eth-brown/20">
              <CardContent className="py-12 text-center">
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {properties.map((property, index) => (
                <div key={property.id} className="animate-fade-in">
                  <PropertyCard
                    property={property}
                    isFavorite={favoriteIds.has(property.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

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
