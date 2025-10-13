import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SearchBanner from "@/components/search-banner";
import Footer from "@/components/footer";
import { Home, Star, CheckCircle } from "lucide-react";
import { FEATURED_DESTINATIONS } from "@/lib/constants";
import mountainLodgeImg from "@assets/stock_images/mountain_lodge_cabin_537ba6f4.jpg";
import boutiqueHotelImg from "@assets/stock_images/luxury_boutique_hote_429d7d7d.jpg";
import lakesideRetreatImg from "@assets/stock_images/lakeside_resort_peac_aa065d79.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-eth-green rounded-lg flex items-center justify-center">
                <Home className="text-white text-lg" />
              </div>
              <h1 className="text-xl font-bold text-neutral-dark">Ethiopia Stays</h1>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#explore" className="text-neutral-dark hover:text-eth-green transition-colors">
                Explore
              </a>
              <a href="#host" className="text-neutral-dark hover:text-eth-green transition-colors">
                Host Your Property
              </a>
              <a href="#about" className="text-neutral-dark hover:text-eth-green transition-colors">
                About Ethiopia
              </a>
            </nav>

            <Button asChild>
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Search Banner */}
      <SearchBanner />

      {/* Featured Destinations */}
      <section className="py-16" id="explore">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-neutral-dark mb-8">
            Explore Ethiopian Destinations
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURED_DESTINATIONS.map((destination) => (
              <div
                key={destination.name}
                className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
              >
                <img
                  src={destination.image}
                  alt={`${destination.name} landscape`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h4 className="text-xl font-bold">{destination.name}</h4>
                  <p className="text-sm opacity-90">{destination.description}</p>
                  <p className="text-sm font-medium mt-1">
                    From {destination.priceFrom} ETB/night
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-neutral-dark mb-4">
              Authentic Ethiopian Accommodations
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From traditional lodges in the Simien Mountains to modern hotels in Addis Ababa, 
              discover unique stays that showcase Ethiopia's rich culture and hospitality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Sample property cards */}
            {[
              {
                title: "Simien Mountain Lodge",
                location: "Simien Mountains, Gondar",
                price: "1,200",
                image: mountainLodgeImg,
                type: "Traditional Lodge",
                rating: 4.8,
              },
              {
                title: "Addis View Hotel",
                location: "Bole, Addis Ababa",
                price: "2,500",
                image: boutiqueHotelImg,
                type: "Boutique Hotel",
                rating: 4.9,
              },
              {
                title: "Blue Nile Retreat",
                location: "Lake Shore, Bahir Dar",
                price: "980",
                image: lakesideRetreatImg,
                type: "Lakeside Guesthouse",
                rating: 4.7,
              },
            ].map((property) => (
              <Card key={property.title} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">{property.type}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-eth-yellow text-eth-yellow" />
                      <span className="text-sm font-medium">{property.rating}</span>
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg text-neutral-dark mb-2">
                    {property.title}
                  </h4>
                  <p className="text-gray-600 text-sm mb-3">{property.location}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-neutral-dark">
                        {property.price} ETB
                      </span>
                      <span className="text-sm text-gray-500">/night</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="bg-eth-green hover:bg-green-700">
              <a href="/api/login">Sign In to View All Properties</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Host Banner */}
      <section className="py-16 bg-gradient-to-r from-eth-yellow to-yellow-500" id="host">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-3xl font-bold text-neutral-dark mb-4">
              Share Your Ethiopian Home
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              Join thousands of hosts earning extra income by welcoming travelers to 
              experience authentic Ethiopian hospitality.
            </p>
            <ul className="space-y-3 mb-8 text-left inline-block">
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-eth-green" />
                <span>Free listing and professional photography</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-eth-green" />
                <span>Secure payments in Ethiopian Birr</span>
              </li>
              <li className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-eth-green" />
                <span>24/7 host support in Amharic and English</span>
              </li>
            </ul>
            <div>
              <Button asChild size="lg" className="bg-eth-red hover:bg-red-700">
                <a href="/api/login">Start Hosting Today</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
