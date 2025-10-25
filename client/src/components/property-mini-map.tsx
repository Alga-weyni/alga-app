import { useState, useEffect } from "react";
import { MapPin, Navigation2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCachedLocation } from "@/lib/location";

interface PropertyMiniMapProps {
  latitude: string | null;
  longitude: string | null;
  address: string | null;
  city: string;
  title: string;
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function PropertyMiniMap({
  latitude,
  longitude,
  address,
  city,
  title,
}: PropertyMiniMapProps) {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    area: string;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    // Check for cached user location
    const cached = getCachedLocation();
    if (cached) {
      setUserLocation(cached);

      // Calculate distance if property has coordinates
      if (latitude && longitude) {
        const propLat = parseFloat(latitude);
        const propLon = parseFloat(longitude);
        if (!isNaN(propLat) && !isNaN(propLon)) {
          const dist = calculateDistance(
            cached.latitude,
            cached.longitude,
            propLat,
            propLon
          );
          setDistance(dist);
        }
      }
    }
  }, [latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <Card className="border-[#e5d9ce]" data-testid="mini-map-no-location">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 text-[#5a4a42]">
            <MapPin className="w-5 h-5" style={{ color: "#2d1405" }} />
            <div>
              <p className="font-medium" style={{ color: "#2d1405" }}>
                {city}
              </p>
              {address && <p className="text-sm">{address}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const propLat = parseFloat(latitude);
  const propLon = parseFloat(longitude);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Google Maps Static API URL
  const staticMapUrl = googleMapsApiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?center=${propLat},${propLon}&zoom=14&size=600x200&markers=color:red%7C${propLat},${propLon}&key=${googleMapsApiKey}&style=feature:poi|visibility:off`
    : null;

  return (
    <Card className="border-[#e5d9ce] overflow-hidden" data-testid="mini-map">
      <CardContent className="p-0">
        {/* Static Map Image */}
        {staticMapUrl ? (
          <div className="relative">
            <img
              src={staticMapUrl}
              alt={`Map showing ${title}`}
              className="w-full h-[200px] object-cover"
              data-testid="static-map-image"
            />
            <div className="absolute top-3 left-3">
              <div
                className="px-3 py-1.5 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2"
                style={{ background: "#fff", color: "#2d1405" }}
              >
                <MapPin className="w-4 h-4" style={{ color: "#F49F0A" }} />
                {city}
              </div>
            </div>
          </div>
        ) : (
          <div
            className="h-[200px] flex items-center justify-center"
            style={{ background: "#faf5f0" }}
          >
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2" style={{ color: "#2d1405", opacity: 0.3 }} />
              <p className="text-sm" style={{ color: "#5a4a42" }}>
                Map preview unavailable
              </p>
            </div>
          </div>
        )}

        {/* Location Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4" style={{ color: "#F49F0A" }} />
                <p className="font-semibold" style={{ color: "#2d1405" }}>
                  Near {city}
                </p>
              </div>
              {address && (
                <p className="text-sm ml-6" style={{ color: "#5a4a42" }}>
                  {address}
                </p>
              )}
            </div>

            {/* Distance from User */}
            {distance !== null && userLocation && (
              <div className="shrink-0">
                <div
                  className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                  style={{ background: "#FFF6EA", color: "#2d1405" }}
                  data-testid="distance-badge"
                >
                  <Navigation2 className="w-3.5 h-3.5" style={{ color: "#F49F0A" }} />
                  {distance < 1
                    ? `${Math.round(distance * 1000)}m away`
                    : `${distance.toFixed(1)} km away`}
                </div>
                <p className="text-xs mt-1 text-right" style={{ color: "#5a4a42" }}>
                  from {userLocation.area}
                </p>
              </div>
            )}
          </div>

          {/* Open in Google Maps */}
          <a
            href={`https://www.google.com/maps?q=${propLat},${propLon}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              variant="outline"
              className="w-full"
              style={{
                borderColor: "#e5d9ce",
                color: "#2d1405",
              }}
              data-testid="button-open-maps"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Open in Google Maps
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
