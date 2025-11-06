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
    <section className="bg-gradient-to-b from-[#faf5f0] to-[#f5ece3] text-eth-brown py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
        <div className="text-center mb-7 sm:mb-9">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#2d1405] leading-tight" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
            Stay. Discover. Belong.<br />
            The Ethiopian Way!
          </h2>
          <p className="text-base text-[#5a4a42] max-w-3xl mx-auto leading-relaxed mb-2" style={{ fontFamily: "'Merriweather', 'Georgia', serif" }}>
            Find unique stays and experiences across Ethiopia — from city apartments to countryside lodges. Book safely, pay securely, and feel at home wherever you go.
          </p>
        </div>

        {/* Search Form */}
        <div className="flex justify-center max-w-7xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-5 w-full lg:max-w-6xl border border-[#e5ddd5]/50 hover:shadow-lg transition-all duration-300">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              {/* Destination */}
              <div className="md:col-span-1">
                <Label htmlFor="destination" className="block text-xs font-semibold text-[#5a4a42] mb-2 uppercase tracking-wide">
                  Destination
                </Label>
                <div className="relative">
                  <Select value={filters.destination} onValueChange={(value) => updateFilter("destination", value)}>
                    <SelectTrigger className="w-full h-12 bg-[#faf8f6] border-[#e5ddd5] hover:border-[#d4c4b8] transition-colors">
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      {ETHIOPIAN_CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <MapPin className="absolute right-3 top-3 h-4 w-4 text-[#8b7766] pointer-events-none" />
                </div>
              </div>

              {/* Check-in */}
              <div>
                <Label htmlFor="checkIn" className="block text-xs font-semibold text-[#5a4a42] mb-2 uppercase tracking-wide">
                  Check-in
                </Label>
                <div className="relative">
                  <Input
                    id="checkIn"
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) => updateFilter("checkIn", e.target.value)}
                    className="w-full h-12 pl-10 bg-[#faf8f6] border-[#e5ddd5] hover:border-[#d4c4b8] transition-colors"
                    min={new Date().toISOString().split('T')[0]}
                    data-testid="input-check-in"
                  />
                  <Calendar 
                    className="absolute left-3 top-3 h-4 w-4 text-[#8b7766] cursor-pointer"
                    onClick={() => document.getElementById('checkIn')?.click()}
                    data-testid="icon-check-in-calendar"
                  />
                </div>
              </div>

              {/* Check-out */}
              <div>
                <Label htmlFor="checkOut" className="block text-xs font-semibold text-[#5a4a42] mb-2 uppercase tracking-wide">
                  Check-out
                </Label>
                <div className="relative">
                  <Input
                    id="checkOut"
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) => updateFilter("checkOut", e.target.value)}
                    className="w-full h-12 pl-10 bg-[#faf8f6] border-[#e5ddd5] hover:border-[#d4c4b8] transition-colors"
                    min={filters.checkIn || new Date().toISOString().split('T')[0]}
                    data-testid="input-check-out"
                  />
                  <Calendar 
                    className="absolute left-3 top-3 h-4 w-4 text-[#8b7766] cursor-pointer"
                    onClick={() => document.getElementById('checkOut')?.click()}
                    data-testid="icon-check-out-calendar"
                  />
                </div>
              </div>

              {/* Guests */}
              <div>
                <Label htmlFor="guests" className="block text-xs font-semibold text-[#5a4a42] mb-2 uppercase tracking-wide">
                  Guests
                </Label>
                <div className="relative">
                  <Select value={filters.guests} onValueChange={(value) => updateFilter("guests", value)}>
                    <SelectTrigger className="w-full h-12 bg-[#faf8f6] border-[#e5ddd5] hover:border-[#d4c4b8] transition-colors">
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

              {/* Search Button */}
              <div>
                <Button
                  type="submit"
                  className="
                    w-full h-12 bg-[#2d1405] hover:bg-[#3d1f0a] text-white font-semibold rounded-xl
                    transition-all duration-200
                    hover:shadow-lg hover:scale-105
                  "
                  aria-label="Search properties"
                  data-testid="button-search-properties"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
