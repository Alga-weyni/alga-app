import { useState, useEffect } from "react";
import { Link } from "wouter";
import GoogleMapReact from "google-map-react";
import { MapPin, Coffee, Building2, Bus, Star } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

// Property Pin Component
const PropertyMarker = ({ property, onClick }: any) => (
  <div
    className="bg-eth-orange text-white px-3 py-1 rounded-full shadow-lg font-semibold text-sm cursor-pointer hover:scale-110 transition-transform border-2 border-white"
    onClick={() => onClick(property)}
  >
    {Number(property.pricePerNight).toLocaleString()} ETB
  </div>
);

// Amenity Pin Component
const AmenityMarker = ({ amenity }: any) => {
  const getIcon = () => {
    switch (amenity.type) {
      case "Cafe": return <Coffee className="h-3 w-3" />;
      case "Hospital": return <Building2 className="h-3 w-3" />;
      case "Transport": return <Bus className="h-3 w-3" />;
      default: return <MapPin className="h-3 w-3" />;
    }
  };

  return (
    <div className="bg-eth-brown text-white px-2 py-1 rounded shadow-md text-xs flex items-center gap-1">
      {getIcon()}
      <span className="hidden group-hover:block">{amenity.name}</span>
    </div>
  );
};

export default function DiscoverPage() {
  const [bounds, setBounds] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.0108, lng: 38.7613 }); // Addis Ababa
  const [mapZoom, setMapZoom] = useState(12);

  const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || "";

  async function fetchDiscovery() {
    if (!bounds) return;
    
    try {
      const params = new URLSearchParams({
        north: bounds.ne.lat.toString(),
        south: bounds.sw.lat.toString(),
        east: bounds.ne.lng.toString(),
        west: bounds.sw.lng.toString(),
        city: "Addis Ababa"
      });

      const res = await fetch(`/api/properties/discover?${params.toString()}`);
      const data = await res.json();
      
      setResults(data.mapResults || []);
      setRecommendations(data.recommendations || []);
      setAmenities(data.amenities || []);
    } catch (err) {
      console.error("Discovery fetch failed:", err);
    }
  }

  useEffect(() => {
    if (bounds) {
      fetchDiscovery();
    }
  }, [bounds]);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="min-h-screen flex flex-col bg-eth-warm-tan">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-eth-brown mb-4">
                Google Maps Setup Required
              </h2>
              <p className="text-gray-600 mb-4">
                To use the map-based discovery feature, you need to add a Google Maps API key.
              </p>
              <div className="bg-gray-100 p-4 rounded-md text-left">
                <p className="text-sm font-mono text-gray-800 mb-2">
                  Add to your environment:
                </p>
                <code className="text-xs bg-white px-3 py-2 rounded block">
                  VITE_GOOGLE_MAPS_KEY=your_api_key_here
                </code>
              </div>
              <Link href="/search">
                <button className="mt-6 bg-eth-orange text-white px-6 py-2 rounded-md hover:bg-eth-orange/90">
                  Use Search Instead
                </button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 relative">
        {/* Map Container */}
        <div className="h-[calc(100vh-200px)]">
          <GoogleMapReact
            bootstrapURLKeys={{ key: GOOGLE_MAPS_KEY }}
            center={mapCenter}
            zoom={mapZoom}
            onChange={(obj) => {
              setBounds(obj.bounds);
              setMapCenter(obj.center);
              setMapZoom(obj.zoom);
            }}
            options={{
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }]
                }
              ]
            }}
          >
            {/* Property Pins */}
            {results.map((property: any) => (
              <PropertyMarker
                key={property.id}
                lat={parseFloat(property.latitude || "0")}
                lng={parseFloat(property.longitude || "0")}
                property={property}
                onClick={setSelectedProperty}
              />
            ))}

            {/* Amenity Pins */}
            {amenities.map((amenity: any) => (
              <AmenityMarker
                key={amenity.id}
                lat={amenity.lat}
                lng={amenity.lng}
                amenity={amenity}
              />
            ))}
          </GoogleMapReact>
        </div>

        {/* Selected Property Card */}
        {selectedProperty && (
          <div className="absolute top-4 left-4 z-10">
            <Card className="w-80 shadow-xl">
              <CardContent className="p-0">
                <div className="relative h-40">
                  <img
                    src={selectedProperty.images?.[0] || "/placeholder.jpg"}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover rounded-t-lg"
                  />
                  <button
                    onClick={() => setSelectedProperty(null)}
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-eth-brown mb-2">
                    {selectedProperty.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedProperty.city}, {selectedProperty.region}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-eth-orange">
                      {Number(selectedProperty.pricePerNight).toLocaleString()} ETB
                    </span>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {Number(selectedProperty.rating || 0).toFixed(1)}
                    </div>
                  </div>
                  <Link href={`/property/${selectedProperty.id}`}>
                    <button className="w-full bg-eth-orange text-white py-2 rounded-md hover:bg-eth-orange/90">
                      View Details
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recommendations Panel */}
        <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 overflow-x-auto z-10">
          <div className="p-4">
            <h3 className="text-eth-brown font-semibold mb-3 flex items-center gap-2">
              <Star className="h-5 w-5 text-eth-orange" />
              Recommended for You
            </h3>
            <div className="flex gap-4">
              {recommendations.map((property: any) => (
                <Link key={property.id} href={`/property/${property.id}`}>
                  <Card className="min-w-[200px] hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="relative h-24 mb-2 rounded overflow-hidden">
                        <img
                          src={property.images?.[0] || "/placeholder.jpg"}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-semibold text-eth-brown line-clamp-1">
                        {property.title}
                      </p>
                      <p className="text-xs text-gray-600">{property.city}</p>
                      <p className="text-sm font-bold text-eth-orange mt-1">
                        {Number(property.pricePerNight).toLocaleString()} ETB
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Map Info */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-eth-brown">{results.length}</span> properties in view
          </p>
        </div>
      </main>
    </div>
  );
}
