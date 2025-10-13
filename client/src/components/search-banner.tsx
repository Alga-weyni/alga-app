import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";
import { ETHIOPIAN_CITIES } from "@/lib/constants";

interface SearchFilters {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: string;
}

interface SearchBannerProps {
  onSearch?: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function SearchBanner({ onSearch, initialFilters }: SearchBannerProps) {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<SearchFilters>({
    destination: initialFilters?.destination || "",
    checkIn: initialFilters?.checkIn || "",
    checkOut: initialFilters?.checkOut || "",
    guests: initialFilters?.guests || "1",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSearch) {
      onSearch(filters);
    } else {
      // Navigate to properties page with search params
      const params = new URLSearchParams();
      if (filters.destination) params.set("destination", filters.destination);
      if (filters.checkIn) params.set("checkIn", filters.checkIn);
      if (filters.checkOut) params.set("checkOut", filters.checkOut);
      if (filters.guests) params.set("guests", filters.guests);
      
      setLocation(`/properties?${params.toString()}`);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <section className="bg-gradient-to-r from-background to-luxury-charcoal text-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 luxury-rich-gold">
            Discover Ethiopia's Hidden Gems
          </h2>
          <p className="text-lg opacity-90 text-foreground">
            From ancient castles in Gondar to lakeside retreats in Bahir Dar
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Destination */}
            <div className="md:col-span-1">
              <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                Where
              </Label>
              <div className="relative">
                <Select value={filters.destination} onValueChange={(value) => updateFilter("destination", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose destination..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ETHIOPIAN_CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Check-in */}
            <div>
              <Label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                Check-in
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={filters.checkIn}
                onChange={(e) => updateFilter("checkIn", e.target.value)}
                className="w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Check-out */}
            <div>
              <Label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                Check-out
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={filters.checkOut}
                onChange={(e) => updateFilter("checkOut", e.target.value)}
                className="w-full"
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Guests */}
            <div>
              <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                Guests
              </Label>
              <Select value={filters.guests} onValueChange={(value) => updateFilter("guests", value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 guest</SelectItem>
                  <SelectItem value="2">2 guests</SelectItem>
                  <SelectItem value="3">3 guests</SelectItem>
                  <SelectItem value="4">4 guests</SelectItem>
                  <SelectItem value="5">5+ guests</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto mt-6 bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold"
            size="lg"
            data-testid="button-search-properties"
          >
            <Search className="mr-2 h-4 w-4" />
            Search Properties
          </Button>
        </form>
      </div>
    </section>
  );
}
