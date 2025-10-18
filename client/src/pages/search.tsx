import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Search, MapPin, Home, Loader2 } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function PropertySearch() {
  // State Variables
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("recommended");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch Properties
  async function fetchProperties() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (city) params.append("city", city);
      if (type && type !== "all") params.append("type", type);
      if (min) params.append("minPrice", min);
      if (max) params.append("maxPrice", max);
      if (sort) params.append("sort", sort);
      if (search) params.append("q", search);

      const res = await fetch(`/api/properties/search?${params.toString()}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Auto-refresh when filters change
  useEffect(() => {
    fetchProperties();
  }, [city, type, min, max, sort, search]);

  return (
    <div className="min-h-screen flex flex-col bg-eth-warm-tan">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-eth-brown mb-2">
            Find Your Perfect Ethiopian Stay 🌿
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Search from {results.length} properties across Ethiopia
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6 sm:mb-8 bg-white">
          <CardContent className="pt-4 sm:pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {/* Keyword Search */}
              <div className="xl:col-span-2">
                <label className="block text-sm font-medium text-eth-brown mb-1">
                  Keyword Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Traditional house, eco lodge..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    data-testid="input-search-keyword"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-eth-brown mb-1">
                  City
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Addis Ababa, Lalibela..."
                    className="pl-10"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    data-testid="input-search-city"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-eth-brown mb-1">
                  Property Type
                </label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger data-testid="select-property-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="hotel">Hotel</SelectItem>
                    <SelectItem value="guesthouse">Guesthouse</SelectItem>
                    <SelectItem value="traditional_home">Traditional Home</SelectItem>
                    <SelectItem value="eco_lodge">Eco Lodge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="flex gap-2 xl:col-span-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-eth-brown mb-1">
                    Min Price (ETB)
                  </label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={min}
                    onChange={(e) => setMin(e.target.value)}
                    data-testid="input-min-price"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-eth-brown mb-1">
                    Max Price (ETB)
                  </label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={max}
                    onChange={(e) => setMax(e.target.value)}
                    data-testid="input-max-price"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-eth-brown mb-1">
                  Sort By
                </label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="price_asc">Lowest Price</SelectItem>
                    <SelectItem value="price_desc">Highest Price</SelectItem>
                    <SelectItem value="rating_desc">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-eth-orange" />
            <span className="ml-3 text-eth-brown">Loading properties...</span>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-20">
            <Home className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No properties found.</p>
            <p className="text-gray-500 text-sm mt-2">Try adjusting your search filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((property: any) => (
              <Link key={property.id} href={`/property/${property.id}`}>
                <Card 
                  className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                  data-testid={`card-property-${property.id}`}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={property.images?.[0] || "/placeholder.jpg"}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3 bg-eth-orange text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ {Number(property.rating || 0).toFixed(1)}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-eth-brown mb-1 line-clamp-1">
                      {property.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center mb-2">
                      <MapPin className="h-3 w-3 mr-1" />
                      {property.city}, {property.region}
                    </p>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {property.description}
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div>
                        <span className="text-2xl font-bold text-eth-orange">
                          {Number(property.pricePerNight).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-600"> ETB</span>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">{property.maxGuests}</span> guests
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
