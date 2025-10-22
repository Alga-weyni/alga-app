import { Link } from "wouter";
import { 
  Sparkles, 
  Wrench, 
  Car, 
  Shirt, 
  Zap, 
  Droplet, 
  UtensilsCrossed, 
  Map, 
  Camera, 
  Trees 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContextualTooltip, useContextualTooltip } from "@/components/contextual-tooltip";

const serviceCategories = [
  {
    type: "cleaning",
    icon: Sparkles,
    title: "Cleaning",
    description: "Professional cleaning during or after your stay",
    color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
    iconColor: "text-blue-600 dark:text-blue-400"
  },
  {
    type: "laundry",
    icon: Shirt,
    title: "Laundry",
    description: "Laundry and garment care services",
    color: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
    iconColor: "text-purple-600 dark:text-purple-400"
  },
  {
    type: "airport_pickup",
    icon: Car,
    title: "Transport",
    description: "Airport pickup, daily drivers, and tour cars",
    color: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
    iconColor: "text-green-600 dark:text-green-400"
  },
  {
    type: "electrical",
    icon: Zap,
    title: "Electrical",
    description: "Electrical repairs and installations",
    color: "from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  {
    type: "plumbing",
    icon: Droplet,
    title: "Plumbing",
    description: "Plumbing fixes and maintenance",
    color: "from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900",
    iconColor: "text-cyan-600 dark:text-cyan-400"
  },
  {
    type: "driver",
    icon: Car,
    title: "Driver Services",
    description: "Personal drivers and transportation",
    color: "from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900",
    iconColor: "text-indigo-600 dark:text-indigo-400"
  },
  {
    type: "meal_support",
    icon: UtensilsCrossed,
    title: "Meal Support",
    description: "Local cooks and meal delivery partners",
    color: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
    iconColor: "text-orange-600 dark:text-orange-400"
  },
  {
    type: "local_guide",
    icon: Map,
    title: "Local Guides",
    description: "City tours and cultural experiences",
    color: "from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900",
    iconColor: "text-pink-600 dark:text-pink-400"
  },
  {
    type: "photography",
    icon: Camera,
    title: "Photography",
    description: "Professional photos and listing optimization",
    color: "from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900",
    iconColor: "text-rose-600 dark:text-rose-400"
  },
  {
    type: "landscaping",
    icon: Trees,
    title: "Landscaping",
    description: "Outdoor maintenance and beautification",
    color: "from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900",
    iconColor: "text-emerald-600 dark:text-emerald-400"
  },
  {
    type: "welcome_pack",
    icon: Wrench,
    title: "Welcome Pack",
    description: "Curated welcome amenities for guests",
    color: "from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900",
    iconColor: "text-amber-600 dark:text-amber-400"
  }
];

export default function Services() {
  const { showTooltip, handleDismiss } = useContextualTooltip('services-page');

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      {/* Contextual Tooltip */}
      {showTooltip && (
        <ContextualTooltip
          message="Need help at home? Tap a service below to find trusted local providers."
          emoji="💡"
          duration={5000}
          onDismiss={handleDismiss}
        />
      )}

      {/* Header with Provider CTA */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Provider CTA Banner - Top Right */}
          <div className="flex justify-end mb-4">
            <Link to="/become-provider">
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: "#2d1405" }}
                data-testid="banner-become-provider"
              >
                <Wrench className="h-4 w-4" />
                <span className="hidden sm:inline">Want to join Alga as a service provider?</span>
                <span className="sm:hidden">Become a Provider</span>
                <span className="ml-1">→</span>
              </div>
            </Link>
          </div>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3" style={{ color: "#2d1405" }}>
              Alga Services Marketplace
            </h1>
            <p className="text-lg" style={{ color: "#5a4a42" }}>
              Professional services for guests, hosts, and homeowners across Ethiopia
            </p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceCategories.map((service) => (
            <Link 
              key={service.type} 
              href={`/services/${service.type}`}
              data-testid={`link-service-${service.type}`}
            >
              <Card 
                className={`h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br ${service.color}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-white/80 dark:bg-black/20 ${service.iconColor}`}>
                      <service.icon className="w-8 h-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1" style={{ color: "#2d1405" }}>
                        {service.title}
                      </h3>
                      <p className="text-sm" style={{ color: "#5a4a42" }}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
