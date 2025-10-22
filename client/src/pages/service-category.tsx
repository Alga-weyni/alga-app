import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, Clock, DollarSign, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { ServiceProvider } from "@shared/schema";
import ProviderBadge from "@/components/provider-badge";
import { ETHIOPIAN_CITIES } from "@/lib/constants";

const serviceTitles: Record<string, string> = {
  cleaning: "Cleaning Services",
  laundry: "Laundry Services",
  airport_pickup: "Transport & Airport Pickup",
  electrical: "Electrical Services",
  plumbing: "Plumbing Services",
  driver: "Driver Services",
  meal_support: "Meal Support & Catering",
  local_guide: "Local Guides & Tours",
  photography: "Photography Services",
  landscaping: "Landscaping & Gardening",
  welcome_pack: "Welcome Pack Services"
};

export default function ServiceCategory() {
  const { type } = useParams<{ type: string }>();
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");

  const { data: providers, isLoading } = useQuery<ServiceProvider[]>({
    queryKey: ["/api/service-providers", type, cityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.append("serviceType", type);
      if (cityFilter !== "all") params.append("city", cityFilter);
      params.append("verificationStatus", "approved");
      
      const response = await fetch(`/api/service-providers?${params}`);
      if (!response.ok) throw new Error("Failed to fetch providers");
      return response.json();
    }
  });

  // Sort providers
  const sortedProviders = providers ? [...providers].sort((a, b) => {
    if (sortBy === "rating") {
      return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    } else if (sortBy === "price_low") {
      return parseFloat(a.basePrice) - parseFloat(b.basePrice);
    } else if (sortBy === "price_high") {
      return parseFloat(b.basePrice) - parseFloat(a.basePrice);
    }
    return 0;
  }) : [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf5f0" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#2d1405" }}></div>
          <p style={{ color: "#5a4a42" }}>Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/services">
            <Button variant="ghost" className="mb-4" data-testid="button-back-services">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Services
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#2d1405" }}>
            {serviceTitles[type || ""] || "Service Providers"}
          </h1>
          <p style={{ color: "#5a4a42" }}>
            {sortedProviders.length} verified providers available
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 rounded-lg" style={{ background: "#fff" }}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2" style={{ color: "#2d1405" }}>
              City
            </label>
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger data-testid="select-city-filter">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cities</SelectItem>
                {ETHIOPIAN_CITIES.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-2" style={{ color: "#2d1405" }}>
              Sort By
            </label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Providers Grid */}
        {sortedProviders.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-lg" style={{ background: "#fff" }}>
            <Sparkles className="w-16 h-16 mx-auto mb-4" style={{ color: "#2d1405", opacity: 0.3 }} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: "#2d1405" }}>
              No providers found
            </h3>
            <p style={{ color: "#5a4a42" }}>
              Try adjusting your filters or check back later for new providers.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((provider) => (
              <Link key={provider.id} href={`/service-providers/${provider.id}`}>
                <Card 
                  className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                  style={{ background: "#fff" }}
                  data-testid={`card-provider-${provider.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-lg" style={{ color: "#2d1405" }}>
                        {provider.businessName}
                      </h3>
                      {provider.rating && parseFloat(provider.rating) > 0 && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "#faf5f0" }}>
                          <Star className="w-4 h-4 fill-current" style={{ color: "#d4af37" }} />
                          <span className="font-medium text-sm" style={{ color: "#2d1405" }}>
                            {parseFloat(provider.rating).toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mb-3">
                      <ProviderBadge provider={provider} size="sm" />
                    </div>

                    <p className="text-sm mb-4 line-clamp-2" style={{ color: "#5a4a42" }}>
                      {provider.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#5a4a42" }}>
                        <MapPin className="w-4 h-4" />
                        <span>{provider.city}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm" style={{ color: "#5a4a42" }}>
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold" style={{ color: "#2d1405" }}>
                          ETB {parseFloat(provider.basePrice).toFixed(0)}
                        </span>
                        <span>/ {provider.pricingModel === "hourly" ? "hour" : "service"}</span>
                      </div>

                      {(provider.totalJobsCompleted || 0) > 0 && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: "#5a4a42" }}>
                          <Clock className="w-4 h-4" />
                          <span>{provider.totalJobsCompleted} jobs completed</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
