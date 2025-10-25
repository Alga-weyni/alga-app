import { useParams, Link } from "react-router-dom";
import Header from "@/components/header";
import { SEOHead } from "@/components/seo-head";
import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, Clock, DollarSign, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import type { ServiceProvider } from "@shared/schema";
import ProviderBadge from "@/components/provider-badge";
import { ETHIOPIAN_CITIES } from "@/lib/constants";
import LocationPicker from "@/components/location-picker";

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
  welcome_pack: "Welcome Pack Services",
  self_care: "Self-Care at Home"
};

const selfCareSpecialties = [
  "Hair Styling",
  "Pedicure",
  "Manicure",
  "Waxing",
  "Upper Lip",
  "Facial",
  "Massage",
  "Eyebrow Shaping",
];

const timeSlotOptions = [
  { value: "all", label: "Anytime" },
  { value: "now", label: "Available Now" },
  { value: "today_am", label: "Today Morning (8AM-12PM)" },
  { value: "today_pm", label: "Today Afternoon (12PM-6PM)" },
  { value: "today_evening", label: "Today Evening (6PM-10PM)" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "this_week", label: "This Week" },
];

export default function ServiceCategory() {
  const { type } = useParams<{ type: string }>();
  const [cityFilter, setCityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("rating");
  
  // Self-Care specific filters
  const [selfCareSpecialty, setSelfCareSpecialty] = useState<string>("all");
  const [selfCareTimeSlot, setSelfCareTimeSlot] = useState<string>("all");
  const [neighborhoodSearch, setNeighborhoodSearch] = useState<string>("");

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
      <Header />
      
      {/* Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/services">
            <Button variant="ghost" className="mb-4" data-testid="button-back-services">
              <ArrowLeft className="w-4 h-4 mr-2" />
              All Services
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#2d1405" }}>
            {serviceTitles[type || ""] || "Service Providers"} {type === "self_care" && "💅"}
          </h1>
          <p style={{ color: "#5a4a42" }}>
            {type === "self_care" 
              ? "Let the beauty come to you — trusted professionals at your doorstep" 
              : `${sortedProviders.length} verified providers available`
            }
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Self-Care Specific Filters */}
        {type === "self_care" && (
          <div className="mb-6 p-6 rounded-xl shadow-lg border-2 border-[#F49F0A]/20" style={{ background: "#FFF6EA" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "#2d1405" }}>
              ✨ Find Your Perfect Beauty Professional
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Specialty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2d1405" }}>
                  What service do you need?
                </label>
                <Select value={selfCareSpecialty} onValueChange={setSelfCareSpecialty}>
                  <SelectTrigger data-testid="select-selfcare-specialty">
                    <SelectValue placeholder="All services" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {selfCareSpecialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty.toLowerCase().replace(/\s+/g, '_')}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Neighborhood Search with GPS */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2d1405" }}>
                  Your area (e.g., Bole, Sarbet)
                </label>
                <LocationPicker
                  value={neighborhoodSearch}
                  onChange={setNeighborhoodSearch}
                  placeholder="Enter your neighborhood"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#2d1405" }}>
                  When do you need them?
                </label>
                <Select value={selfCareTimeSlot} onValueChange={setSelfCareTimeSlot}>
                  <SelectTrigger data-testid="select-time-slot">
                    <SelectValue placeholder="Anytime" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlotOptions.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Standard Filters */}
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
              {type === "self_care" ? "No beauty professionals found yet in your area" : "No providers found"}
            </h3>
            <p style={{ color: "#5a4a42" }}>
              {type === "self_care" 
                ? "💇‍♀️ We're onboarding mobile beauty experts near you. Check back soon!" 
                : "Try adjusting your filters or check back later for new providers."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((provider) => (
              <Link key={provider.id} to={`/service-providers/${provider.id}`}>
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
