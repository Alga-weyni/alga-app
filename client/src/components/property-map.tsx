import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Navigation } from "lucide-react";

interface PropertyMapProps {
  properties?: Array<{
    id: number;
    title: string;
    latitude?: number;
    longitude?: number;
    pricePerNight: number;
    city: string;
  }>;
  selectedProperty?: number | null;
  onPropertySelect?: (propertyId: number) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export default function PropertyMap({ 
  properties = [], 
  selectedProperty,
  onPropertySelect,
  center = { lat: 9.03, lng: 38.74 }, // Addis Ababa
  zoom = 10
}: PropertyMapProps) {
  const [searchLocation, setSearchLocation] = useState('');
  const [mapCenter, setMapCenter] = useState(center);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  // Search for location (Ethiopian cities)
  const searchForLocation = (query: string) => {
    const ethiopianCities = {
      'addis ababa': { lat: 9.03, lng: 38.74 },
      'dire dawa': { lat: 9.593889, lng: 41.85194 },
      'hawassa': { lat: 7.0525, lng: 38.476944 },
      'bahir dar': { lat: 11.59364, lng: 37.39077 },
      'gondar': { lat: 12.608333, lng: 37.466667 },
      'jimma': { lat: 7.678889, lng: 36.834722 },
      'adama': { lat: 8.540556, lng: 39.266944 },
      'mekelle': { lat: 13.49667, lng: 39.475 },
      'awassa': { lat: 7.0525, lng: 38.476944 },
      'dessie': { lat: 11.13, lng: 39.63 },
      'lalibela': { lat: 12.041667, lng: 39.040833 },
      'arba minch': { lat: 6.033333, lng: 37.566667 },
      'harar': { lat: 9.310278, lng: 42.118889 },
      'axum': { lat: 14.131389, lng: 38.722778 }
    };

    const cityKey = query.toLowerCase();
    if (ethiopianCities[cityKey as keyof typeof ethiopianCities]) {
      setMapCenter(ethiopianCities[cityKey as keyof typeof ethiopianCities]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      searchForLocation(searchLocation.trim());
    }
  };

  // Ethiopian regions for different map areas
  const ethiopianRegions = [
    { name: "Addis Ababa", coords: { lat: 9.03, lng: 38.74 } },
    { name: "Oromia", coords: { lat: 8.5, lng: 39.5 } },
    { name: "Amhara", coords: { lat: 11.5, lng: 38.5 } },
    { name: "SNNP", coords: { lat: 7.0, lng: 37.5 } },
    { name: "Tigray", coords: { lat: 14.0, lng: 38.5 } },
    { name: "Somali", coords: { lat: 8.0, lng: 44.0 } },
    { name: "Afar", coords: { lat: 11.5, lng: 41.0 } },
    { name: "Dire Dawa", coords: { lat: 9.593889, lng: 41.85194 } }
  ];

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <span>Property Locations</span>
          </CardTitle>
          <CardDescription>
            Explore guesthouses across Ethiopia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Location */}
          <form onSubmit={handleSearch} className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="location-search" className="sr-only">Search Location</Label>
              <Input
                id="location-search"
                placeholder="Search Ethiopian cities (e.g., Addis Ababa, Lalibela)"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <Search className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={getCurrentLocation}
            >
              <Navigation className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Region Buttons */}
          <div className="flex flex-wrap gap-2">
            {ethiopianRegions.map((region) => (
              <Button
                key={region.name}
                variant="outline"
                size="sm"
                onClick={() => setMapCenter(region.coords)}
              >
                {region.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Map Display */}
      <Card>
        <CardContent className="p-0">
          <div className="relative w-full h-96 bg-muted rounded-lg overflow-hidden">
            {/* Placeholder Map - In production, integrate with Google Maps, Mapbox, or OpenStreetMap */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 to-yellow-100 dark:from-green-900 dark:to-yellow-900">
              <div className="text-center space-y-4">
                <MapPin className="h-16 w-16 mx-auto text-green-600" />
                <div>
                  <h3 className="text-lg font-semibold">Interactive Map</h3>
                  <p className="text-muted-foreground">
                    Showing {properties.length} properties in Ethiopia
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Center: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            {/* Property Markers Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              {properties.map((property, index) => {
                if (!property.latitude || !property.longitude) return null;
                
                // Calculate position relative to map center (simplified)
                const x = ((property.longitude - mapCenter.lng) * 100) + 50;
                const y = ((mapCenter.lat - property.latitude) * 100) + 50;
                
                if (x < 0 || x > 100 || y < 0 || y > 100) return null;
                
                return (
                  <div
                    key={property.id}
                    className="absolute pointer-events-auto cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => onPropertySelect?.(property.id)}
                  >
                    <div className={`
                      bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 p-2 min-w-32
                      ${selectedProperty === property.id ? 'border-primary' : 'border-gray-200'}
                      hover:shadow-xl transition-all duration-200
                    `}>
                      <div className="text-xs font-medium truncate">{property.title}</div>
                      <div className="text-xs text-muted-foreground">{property.city}</div>
                      <div className="text-xs font-semibold text-green-600">
                        {property.pricePerNight} ETB/night
                      </div>
                    </div>
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                      <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* User Location Marker */}
            {userLocation && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${((userLocation.lng - mapCenter.lng) * 100) + 50}%`, 
                  top: `${((mapCenter.lat - userLocation.lat) * 100) + 50}%` 
                }}
              >
                <div className="bg-blue-500 rounded-full p-2 shadow-lg">
                  <Navigation className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-200 rounded" />
                <span>Available Properties</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-white border-2 border-primary rounded" />
                <span>Selected Property</span>
              </div>
              {userLocation && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full" />
                  <span>Your Location</span>
                </div>
              )}
            </div>
            <div className="text-muted-foreground">
              {properties.length} properties shown
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}