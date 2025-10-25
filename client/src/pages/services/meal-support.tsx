import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star, Clock, DollarSign, Phone, Check, ChefHat, Store } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { formatETB } from "@/lib/formatCurrency";

interface MealProvider {
  id: number;
  userId: string;
  businessName: string;
  description: string;
  serviceType: string;
  basePrice: string;
  currency: string;
  city: string;
  region: string;
  address: string;
  latitude: string;
  longitude: string;
  providerType: string; // home_cook or restaurant
  cuisine: string;
  specialties: string[];
  deliveryRadiusKm: number;
  portfolioImages: string[];
  rating: string;
  totalJobsCompleted: number;
  verificationStatus: string;
  isActive: boolean;
}

export default function MealSupportPage() {
  const [selectedType, setSelectedType] = useState<"all" | "home_cook" | "restaurant">("all");
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; neighborhood?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Get user's GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        () => {
          setLocationLoading(false);
        }
      );
    }
  }, []);
  
  const { data: providers, isLoading } = useQuery<MealProvider[]>({
    queryKey: ["/api/service-providers", { serviceType: "meal_support" }],
  });

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Filter providers by GPS (5km radius) and type
  const filteredProviders = providers?.filter(provider => {
    // Filter by provider type
    if (selectedType !== "all" && provider.providerType !== selectedType) {
      return false;
    }

    // Filter by GPS if location is available
    if (userLocation?.latitude && userLocation?.longitude && provider.latitude && provider.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(provider.latitude),
        parseFloat(provider.longitude)
      );
      
      // Check if within provider's delivery radius (default 5km)
      const maxDistance = provider.deliveryRadiusKm || 5;
      return distance <= maxDistance;
    }

    // If no GPS, show all
    return true;
  }).sort((a, b) => {
    // Sort by rating first, then by jobs completed
    const ratingDiff = parseFloat(b.rating) - parseFloat(a.rating);
    if (ratingDiff !== 0) return ratingDiff;
    return b.totalJobsCompleted - a.totalJobsCompleted;
  }) || [];

  return (
    <div className="min-h-screen bg-[#f6f2ec]">
      <Header />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#CD7F32] to-[#F49F0A] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center justify-center gap-3">
              <ChefHat className="w-12 h-12" />
              Meal Support
            </h1>
            <p className="text-xl mb-2">
              Delicious meals delivered to your door 🍲
            </p>
            <p className="text-white/90">
              Choose from authentic Ethiopian home cooks or local restaurants
            </p>
            
            {userLocation?.latitude && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">
                  Showing providers within 5km of {userLocation.neighborhood || "your location"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as any)} className="mb-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">All Providers</TabsTrigger>
            <TabsTrigger value="home_cook">Home Cooks</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurants</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#CD7F32] border-r-transparent"></div>
            <p className="mt-4 text-[#5a4a42]">Loading meal providers...</p>
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredProviders.length === 0 && (
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold mb-2" style={{ color: "#2d1405" }}>
                No providers found nearby
              </h3>
              <p className="text-sm" style={{ color: "#5a4a42" }}>
                We're expanding our network of meal providers. Check back soon or try a different filter.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Provider Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProviders.map((provider) => {
            const distance = userLocation?.latitude && userLocation?.longitude && provider.latitude && provider.longitude
              ? calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  parseFloat(provider.latitude),
                  parseFloat(provider.longitude)
                )
              : null;

            return (
              <Card 
                key={provider.id} 
                className="hover:shadow-xl transition-all cursor-pointer"
                data-testid={`meal-provider-${provider.id}`}
              >
                {/* Provider Image */}
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {provider.portfolioImages?.[0] ? (
                    <img
                      src={provider.portfolioImages[0]}
                      alt={provider.businessName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#CD7F32]/20 to-[#F49F0A]/20 flex items-center justify-center">
                      {provider.providerType === "home_cook" ? (
                        <ChefHat className="w-16 h-16 text-[#CD7F32]" />
                      ) : (
                        <Store className="w-16 h-16 text-[#CD7F32]" />
                      )}
                    </div>
                  )}
                  
                  {/* Verified Badge */}
                  {provider.verificationStatus === "approved" && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-lg">
                      <Check className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                  
                  {/* Provider Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-white/95 text-[#2d1405] font-semibold"
                    >
                      {provider.providerType === "home_cook" ? "🏠 Home Cook" : "🍴 Restaurant"}
                    </Badge>
                  </div>

                  {/* Distance Badge */}
                  {distance && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {distance.toFixed(1)} km away
                    </div>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="text-xl" style={{ color: "#2d1405" }}>
                    {provider.businessName}
                  </CardTitle>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{parseFloat(provider.rating).toFixed(1)}</span>
                      <span className="text-gray-500">({provider.totalJobsCompleted} orders)</span>
                    </div>
                  </div>

                  {/* Cuisine Type */}
                  {provider.cuisine && (
                    <Badge variant="outline" className="w-fit mt-2">
                      {provider.cuisine}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-[#5a4a42] line-clamp-2">
                    {provider.description}
                  </p>

                  {/* Specialties */}
                  {provider.specialties && provider.specialties.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-[#2d1405] mb-2">Popular Dishes:</p>
                      <div className="flex flex-wrap gap-2">
                        {provider.specialties.slice(0, 3).map((dish, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {dish}
                          </Badge>
                        ))}
                        {provider.specialties.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{provider.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Pricing */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-[#CD7F32]" />
                      <span className="font-semibold text-[#2d1405]">
                        From {formatETB(parseFloat(provider.basePrice))}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{provider.deliveryRadiusKm || 5}km radius</span>
                    </div>
                  </div>

                  {/* Order Button */}
                  <Button 
                    className="w-full bg-[#CD7F32] hover:bg-[#b36f2c]"
                    data-testid={`button-order-${provider.id}`}
                    onClick={() => {
                      // TODO: Open order modal
                      alert(`Order from ${provider.businessName} - Coming soon!`);
                    }}
                  >
                    Order Now
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* How It Works */}
        <Card className="mt-12 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl text-center" style={{ color: "#2d1405" }}>
              How Meal Support Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#CD7F32]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-[#CD7F32]">1</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Browse Providers</h3>
                <p className="text-sm text-gray-600">Choose from home cooks or restaurants near you</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#CD7F32]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-[#CD7F32]">2</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Place Order</h3>
                <p className="text-sm text-gray-600">Select your dishes and checkout securely</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#CD7F32]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-[#CD7F32]">3</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Fast Delivery</h3>
                <p className="text-sm text-gray-600">Meals delivered fresh to your door</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-[#CD7F32]/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-[#CD7F32]">4</span>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Enjoy & Review</h3>
                <p className="text-sm text-gray-600">Savor your meal and share your experience</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
