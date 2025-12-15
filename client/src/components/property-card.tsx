import { useState, memo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, Users, Bed, Bath, Wifi, Utensils, Car } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { getApiUrl, getImageUrl } from "@/lib/api-config";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
}

function PropertyCard({ property, isFavorite = false }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        return apiRequest("DELETE", `/api/favorites/${property.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { propertyId: property.id });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isLiked ? "Removed from favorites" : "Added to favorites",
        description: isLiked 
          ? "Property removed from your favorites list"
          : "Property added to your favorites list",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent card click
    if (!isAuthenticated) {
      window.location.href = getApiUrl("/api/login");
      return;
    }
    favoriteMutation.mutate();
  };

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "traditional_home": return "Traditional Home";
      case "eco_lodge": return "Eco Lodge";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  // Show top 3 amenities with icons
  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-3.5 w-3.5" />;
    if (lower.includes('restaurant') || lower.includes('breakfast') || lower.includes('meals')) 
      return <Utensils className="h-3.5 w-3.5" />;
    if (lower.includes('parking') || lower.includes('shuttle')) 
      return <Car className="h-3.5 w-3.5" />;
    return null;
  };

  const topAmenities = (property.amenities || []).slice(0, 3);

  const handleCardClick = () => {
    navigate(`/properties/${property.id}`);
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group cursor-pointer" 
      data-testid={`card-property-${property.id}`}
      onClick={handleCardClick}
    >
      <div className="relative">
          <img
            src={getImageUrl(property.images?.[0]) || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={`${property.title} in ${property.city} - ${property.type} accommodation`}
            loading="lazy"
            className="w-full h-40 sm:h-56 object-cover group-hover:scale-105 transition-transform duration-300"
            data-testid={`img-property-${property.id}`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600";
            }}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/80 hover:bg-white h-8 w-8 sm:h-10 sm:w-10"
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
            data-testid={`button-favorite-${property.id}`}
          >
            <Heart
              className={`h-4 w-4 sm:h-5 sm:w-5 ${
                isLiked ? "fill-eth-red text-eth-red" : "text-gray-600"
              }`}
            />
          </Button>
        </div>

        <CardContent className="p-2.5 sm:p-5">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <Badge variant="secondary" className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2">
              {getTypeLabel(property.type)}
            </Badge>
            <div className="flex items-center space-x-0.5 sm:space-x-1">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-eth-yellow text-eth-yellow" />
              <span className="text-xs sm:text-sm font-medium">
                {parseFloat(property.rating || "0").toFixed(1)}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500">
                ({property.reviewCount})
              </span>
            </div>
          </div>

          <h4 className="font-semibold text-sm sm:text-lg text-neutral-dark mb-1 sm:mb-2 line-clamp-1" data-testid={`text-title-${property.id}`}>
            {property.title}
          </h4>

          <div className="flex items-center text-gray-600 text-xs sm:text-sm mb-1.5 sm:mb-3">
            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{property.location}, {property.city}</span>
          </div>

          <div className="flex items-center flex-wrap gap-1.5 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
            <div className="flex items-center whitespace-nowrap">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
              <span className="hidden xs:inline">{property.maxGuests} guests</span>
              <span className="xs:hidden">{property.maxGuests}</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <Bed className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
              <span className="hidden xs:inline">{property.bedrooms} bed</span>
              <span className="xs:hidden">{property.bedrooms}</span>
            </div>
            <div className="flex items-center whitespace-nowrap">
              <Bath className="h-3 w-3 sm:h-4 sm:w-4 mr-0.5 sm:mr-1 flex-shrink-0" />
              <span className="hidden xs:inline">{property.bathrooms} bath</span>
              <span className="xs:hidden">{property.bathrooms}</span>
            </div>
          </div>

          {topAmenities.length > 0 && (
            <div className="hidden sm:flex items-center gap-2 mb-3 pb-3 border-b border-gray-100">
              {topAmenities.map((amenity, index) => {
                const icon = getAmenityIcon(amenity);
                return icon ? (
                  <div 
                    key={index} 
                    className="flex items-center gap-1 text-xs text-eth-brown/70"
                    title={amenity}
                  >
                    {icon}
                    <span className="truncate max-w-[80px]">{amenity}</span>
                  </div>
                ) : null;
              }).filter(Boolean)}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm sm:text-lg font-bold text-neutral-dark" data-testid={`text-price-${property.id}`}>
                {formatPrice(property.pricePerNight)}
              </span>
              <span className="text-[10px] sm:text-sm text-gray-500">/night</span>
            </div>
          </div>
        </CardContent>
    </Card>
  );
}


export default memo(PropertyCard);
