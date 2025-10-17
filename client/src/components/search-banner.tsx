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
import { Search, MapPin, Calendar } from "lucide-react";
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
      if (filters.destination) params.set("city", filters.destination);
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
    <section className="bg-eth-warm-tan text-eth-brown py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-8">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-eth-brown" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
            Welcome to Ethiopia Stays
          </h2>
          <p className="text-xl font-normal tracking-wide text-eth-brown">
            Discover the beauty of Ethiopian hospitality
          </p>
        </div>

        {/* Search Form */}
        <div className="flex justify-center max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 w-full lg:max-w-4xl border border-eth-brown/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              {/* Destination */}
              <div className="md:col-span-1">
                <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Where
                </Label>
                <div className="relative">
                  <Select value={filters.destination} onValueChange={(value) => updateFilter("destination", value)}>
                    <SelectTrigger className="w-full" style={{ backgroundColor: '#f6bd89', border: 'none' }}>
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
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-600 pointer-events-none" />
                </div>
              </div>

              {/* Check-in */}
              <div>
                <Label htmlFor="checkIn" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in
                </Label>
                <div className="relative">
                  <Input
                    id="checkIn"
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => updateFilter("checkIn", e.target.value)}
                    className="w-full pl-10"
                    style={{ backgroundColor: '#f6bd89', border: 'none' }}
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="input-check-in"
                  />
                  <Calendar 
                    className="absolute left-3 top-3 h-4 w-4 cursor-pointer" 
                    style={{ color: '#fca12b' }}
                    onClick={() => document.getElementById('checkIn')?.click()}
                    data-testid="icon-check-in-calendar"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div>
                <Label htmlFor="checkOut" className="block text-sm font-medium text-gray-700 mb-2">
                  Check-out
                </Label>
                <div className="relative">
                  <Input
                    id="checkOut"
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => updateFilter("checkOut", e.target.value)}
                    className="w-full pl-10"
                    style={{ backgroundColor: '#f6bd89', border: 'none' }}
                    min={filters.checkIn || new Date().toISOString().split('T')[0]}
                    data-testid="input-check-out"
                  />
                  <Calendar 
                    className="absolute left-3 top-3 h-4 w-4 cursor-pointer" 
                    style={{ color: '#fca12b' }}
                    onClick={() => document.getElementById('checkOut')?.click()}
                    data-testid="icon-check-out-calendar"
                  />
                </div>
              </div>

              {/* Guests with Search Button */}
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label htmlFor="guests" className="block text-sm font-medium text-gray-700 mb-2">
                    Guests
                  </Label>
                  <div className="relative">
                    <Select value={filters.guests} onValueChange={(value) => updateFilter("guests", value)}>
                      <SelectTrigger className="w-full" style={{ backgroundColor: '#f6bd89', border: 'none' }}>
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
                  className="bg-eth-orange hover:opacity-90 text-white p-3 font-bold border-0 rounded-xl"
                  size="icon"
                  aria-label="Search properties"
                  data-testid="button-search-properties"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
