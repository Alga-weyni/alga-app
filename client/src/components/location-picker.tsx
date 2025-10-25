import { useState, useEffect } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCachedLocation, cacheLocation, reverseGeocode, getCurrentLocation } from "@/lib/location";

interface LocationPickerProps {
  value: string;
  onChange: (area: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationPicker({ value, onChange, placeholder = "Enter your area (e.g., Bole, Sarbet)", className = "" }: LocationPickerProps) {
  const [loading, setLoading] = useState(false);
  const [hasCache, setHasCache] = useState(false);

  // Check for cached location on mount
  useEffect(() => {
    const cached = getCachedLocation();
    if (cached && !value) {
      onChange(cached.area);
      setHasCache(true);
    }
  }, []);

  const handleUseLocation = async () => {
    setLoading(true);
    
    try {
      // First check cache
      const cached = getCachedLocation();
      if (cached) {
        onChange(cached.area);
        setLoading(false);
        return;
      }

      // Get GPS position
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;

      // Reverse geocode (API call - minimized via caching)
      const { area, city } = await reverseGeocode(latitude, longitude);

      // Cache the result for 24 hours
      cacheLocation({
        latitude,
        longitude,
        area,
        city,
        timestamp: Date.now(),
      });

      onChange(area);
      setHasCache(true);
    } catch (error: any) {
      if (error.code === 1) {
        // User denied permission
        alert('📍 Location access denied. Please enter your area manually.');
      } else if (error.code === 2) {
        // Position unavailable
        alert('📍 Unable to determine your location. Please enter your area manually.');
      } else if (error.code === 3) {
        // Timeout
        alert('📍 Location request timed out. Please try again or enter manually.');
      } else {
        alert('📍 Could not get your location. Please enter your area manually.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 rounded-lg border border-[#e5d9ce] focus:outline-none focus:ring-2 focus:ring-[#F49F0A] bg-white"
        data-testid="input-location-picker"
      />
      <Button
        type="button"
        onClick={handleUseLocation}
        disabled={loading}
        variant="outline"
        className="shrink-0"
        style={{
          borderColor: "#e5d9ce",
          color: "#2d1405",
          background: hasCache ? "#FFF6EA" : "#fff",
        }}
        data-testid="button-use-location"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Finding...
          </>
        ) : (
          <>
            <MapPin className="w-4 h-4 mr-2" />
            {hasCache ? "📍 Saved" : "Use GPS"}
          </>
        )}
      </Button>
    </div>
  );
}
