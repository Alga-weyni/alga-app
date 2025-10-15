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
import { Search } from "lucide-react";
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
    <section className="py-16 bg-eth-warm-tan">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-eth-brown" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
            Welcome to Ethiopia Stays
          </h2>
          <p className="text-lg text-eth-brown">
            Discover the beauty of Ethiopian hospitality
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gradient-to-r from-[#f6bd89] to-[#fca12b] rounded-2xl shadow-2xl p-4 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-end gap-3">
            <div className="flex-1 min-w-0">
              <Label htmlFor="destination" className="block text-sm font-medium text-eth-brown mb-2">
                Where
              </Label>
              <Select value={filters.destination} onValueChange={(value) => updateFilter("destination", value)}>
                <SelectTrigger className="w-full bg-white border-0 text-eth-brown">
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {ETHIOPIAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-0">
              <Label htmlFor="checkIn" className="block text-sm font-medium text-eth-brown mb-2">
                Check-in
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={filters.checkIn}
                onChange={(e) => updateFilter("checkIn", e.target.value)}
                className="w-full bg-white border-0 text-eth-brown"
                placeholder="mm/dd/yyyy"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex-1 min-w-0">
              <Label htmlFor="checkOut" className="block text-sm font-medium text-eth-brown mb-2">
                Check-out
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={filters.checkOut}
                onChange={(e) => updateFilter("checkOut", e.target.value)}
                className="w-full bg-white border-0 text-eth-brown"
                placeholder="mm/dd/yyyy"
                min={filters.checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="flex-1 min-w-0">
              <Label htmlFor="guests" className="block text-sm font-medium text-eth-brown mb-2">
                Guests
              </Label>
              <Select value={filters.guests} onValueChange={(value) => updateFilter("guests", value)}>
                <SelectTrigger className="w-full bg-white border-0 text-eth-brown">
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

            <Button
              type="submit"
              className="bg-eth-orange hover:opacity-90 text-white px-8 py-6 rounded-full font-bold border-0 flex items-center gap-2"
              data-testid="button-search-properties"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
