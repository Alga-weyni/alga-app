import { useState, useMemo } from "react";
import GoogleMapReact from "google-map-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Navigation2, Maximize2, Minimize2 } from "lucide-react";

interface Property {
  id: number;
  title: string;
  latitude?: string | null;
  longitude?: string | null;
  pricePerNight: string;
  city: string;
  rating?: string | null;
  images?: string[];
}

interface GoogleMapViewProps {
  properties: Property[];
  selectedPropertyId?: number | null;
  onPropertySelect?: (propertyId: number) => void;
  height?: string;
  zoom?: number;
  showControls?: boolean;
}

interface MarkerProps {
  lat: number;
  lng: number;
  property: Property;
  selected: boolean;
  onClick: () => void;
}

const PropertyMarker = ({ property, selected, onClick }: MarkerProps) => {
  return (
    <div 
      className="relative cursor-pointer transform -translate-x-1/2 -translate-y-full"
      onClick={onClick}
      data-testid={`map-marker-${property.id}`}
    >
      {/* Marker Pin */}
      <div className={`
        transition-all duration-200 hover:scale-110
        ${selected ? 'z-50' : 'z-10'}
      `}>
        <MapPin 
          className={`h-10 w-10 ${
            selected 
              ? 'text-eth-brown fill-eth-brown' 
              : 'text-eth-orange fill-eth-orange'
          } drop-shadow-lg`}
        />
      </div>

      {/* Property Info Card */}
      {selected && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 w-64 z-50">
          <Card className="border-eth-brown/20 shadow-xl">
            <CardContent className="p-3 space-y-2">
              {property.images && property.images[0] && (
                <img 
                  src={property.images[0]} 
                  alt={property.title}
                  className="w-full h-32 object-cover rounded-md"
                />
              )}
              <div>
                <h4 className="font-semibold text-sm text-eth-brown line-clamp-1">
                  {property.title}
                </h4>
                <p className="text-xs text-muted-foreground">{property.city}</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-eth-brown">
                    {parseFloat(property.pricePerNight).toLocaleString()} ETB
                  </span>
                  <span className="text-xs text-muted-foreground">/night</span>
                </div>
                {property.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                    <span className="text-sm font-medium">{property.rating}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default function GoogleMapView({
  properties,
  selectedPropertyId,
  onPropertySelect,
  height = "500px",
  zoom = 12,
  showControls = true,
}: GoogleMapViewProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [currentCenter, setCurrentCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Filter properties with valid coordinates
  const validProperties = useMemo(() => {
    return properties.filter(p => 
      p.latitude && p.longitude && 
      !isNaN(parseFloat(p.latitude)) && 
      !isNaN(parseFloat(p.longitude))
    );
  }, [properties]);

  // Calculate default center from properties
  const defaultCenter = useMemo(() => {
    if (currentCenter) return currentCenter;
    
    if (validProperties.length === 0) {
      // Default to Addis Ababa if no properties
      return { lat: 9.03, lng: 38.74 };
    }

    // If only one property, center on it
    if (validProperties.length === 1) {
      return {
        lat: parseFloat(validProperties[0].latitude!),
        lng: parseFloat(validProperties[0].longitude!)
      };
    }

    // Calculate center of all properties
    const sum = validProperties.reduce(
      (acc, p) => ({
        lat: acc.lat + parseFloat(p.latitude!),
        lng: acc.lng + parseFloat(p.longitude!)
      }),
      { lat: 0, lng: 0 }
    );

    return {
      lat: sum.lat / validProperties.length,
      lng: sum.lng / validProperties.length
    };
  }, [validProperties, currentCenter]);

  const handleMarkerClick = (propertyId: number) => {
    onPropertySelect?.(propertyId);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setCurrentCenter(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Show fallback if no API key
  if (!googleMapsApiKey) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <MapPin className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Map View</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Google Maps API key not configured.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Showing {validProperties.length} properties with location data
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-4">
              {validProperties.slice(0, 5).map(p => (
                <Badge key={p.id} variant="outline">
                  {p.city}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <Card className="h-full">
        <CardContent className="p-0 h-full relative">
          {/* Map Controls */}
          {showControls && (
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={getUserLocation}
                className="shadow-lg"
                data-testid="button-get-location"
              >
                <Navigation2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="shadow-lg"
                data-testid="button-toggle-fullscreen"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Property Count Badge */}
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className="shadow-lg">
              {validProperties.length} properties
            </Badge>
          </div>

          {/* Google Map */}
          <div style={{ height: isFullscreen ? '100vh' : height }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: googleMapsApiKey }}
              center={defaultCenter}
              defaultZoom={zoom}
              zoom={currentZoom}
              onChange={({ zoom, center }) => {
                setCurrentZoom(zoom);
                setCurrentCenter(center);
              }}
              options={{
                fullscreenControl: false,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
              }}
            >
              {/* Property Markers */}
              {validProperties.map((property) => (
                <PropertyMarker
                  key={property.id}
                  lat={parseFloat(property.latitude!)}
                  lng={parseFloat(property.longitude!)}
                  property={property}
                  selected={selectedPropertyId === property.id}
                  onClick={() => handleMarkerClick(property.id)}
                />
              ))}

              {/* User Location Marker */}
              {userLocation && (
                <div
                  // @ts-ignore - GoogleMapReact expects lat/lng props
                  lat={userLocation.lat}
                  lng={userLocation.lng}
                  className="transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-75" />
                    <div className="relative bg-blue-500 rounded-full p-2 shadow-lg border-2 border-white">
                      <Navigation2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
              )}
            </GoogleMapReact>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
