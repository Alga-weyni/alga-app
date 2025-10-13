import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, MapPin, Users, Bed, Bath } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Property } from "@shared/schema";

interface PropertyCardProps {
  property: Property;
  isFavorite?: boolean;
}

export default function PropertyCard({ property, isFavorite = false }: PropertyCardProps) {
  const [isLiked, setIsLiked] = useState(isFavorite);
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
    if (!isAuthenticated) {
      window.location.href = "/api/login";
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

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <Link href={`/properties/${property.id}`}>
        <div className="relative">
          <img
            src={property.images?.[0] || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"}
            alt={property.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-3 right-3 bg-white/80 hover:bg-white"
            onClick={handleFavoriteClick}
            disabled={favoriteMutation.isPending}
          >
            <Heart
              className={`h-4 w-4 ${
                isLiked ? "fill-eth-red text-eth-red" : "text-gray-600"
              }`}
            />
          </Button>
        </div>

        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-xs">
              {getTypeLabel(property.type)}
            </Badge>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-eth-yellow text-eth-yellow" />
              <span className="text-sm font-medium">
                {parseFloat(property.rating || "0").toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({property.reviewCount})
              </span>
            </div>
          </div>

          <h4 className="font-semibold text-lg text-neutral-dark mb-2 line-clamp-1">
            {property.title}
          </h4>

          <div className="flex items-center text-gray-600 text-sm mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="line-clamp-1">{property.location}, {property.city}</span>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{property.maxGuests} guests</span>
            </div>
            <div className="flex items-center">
              <Bed className="h-4 w-4 mr-1" />
              <span>{property.bedrooms} bed</span>
            </div>
            <div className="flex items-center">
              <Bath className="h-4 w-4 mr-1" />
              <span>{property.bathrooms} bath</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-neutral-dark">
                {formatPrice(property.pricePerNight)}
              </span>
              <span className="text-sm text-gray-500">/night</span>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
