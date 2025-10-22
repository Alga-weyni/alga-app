import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Wrench, 
  CreditCard, 
  MessageSquare, 
  Star, 
  Settings,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Booking, ServiceBooking } from "@shared/schema";

interface DashboardCard {
  icon: React.ElementType;
  title: string;
  link: string;
  color: string;
  iconColor: string;
  visible: boolean;
}

export default function MyAlga() {
  const { user } = useAuth();
  const firstName = user?.firstName || "Guest";

  // Fetch user's bookings count
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });

  // Fetch user's service bookings count
  const { data: serviceBookings } = useQuery<ServiceBooking[]>({
    queryKey: ["/api/my-service-bookings"],
    enabled: !!user,
  });

  const cards: DashboardCard[] = [
    {
      icon: Home,
      title: "My Stays",
      link: "/bookings",
      color: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      visible: !!user,
    },
    {
      icon: Wrench,
      title: "My Services",
      link: "/my-services",
      color: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
      visible: !!user,
    },
    {
      icon: CreditCard,
      title: "Payments & Wallet",
      link: "/payments",
      color: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      visible: !!user,
    },
    {
      icon: MessageSquare,
      title: "Messages",
      link: "/messages",
      color: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      visible: !!user,
    },
    {
      icon: Star,
      title: "My Reviews",
      link: "/my-reviews",
      color: "from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      visible: !!user,
    },
    {
      icon: User,
      title: "Profile & Settings",
      link: "/profile",
      color: "from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900",
      iconColor: "text-gray-600 dark:text-gray-400",
      visible: true,
    },
  ];

  const visibleCards = cards.filter((card) => card.visible);

  const getCardBadge = (title: string) => {
    if (title === "My Stays" && bookings && bookings.length > 0) {
      return bookings.length;
    }
    if (title === "My Services" && serviceBookings && serviceBookings.length > 0) {
      return serviceBookings.length;
    }
    return null;
  };

  return (
    <div className="min-h-screen" style={{ background: "#f6f2ec" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: "#8a6e4b" }}
            >
              {firstName[0].toUpperCase()}
            </div>
            
            {/* Greeting */}
            <div>
              <h1 className="text-3xl font-bold mb-1" style={{ color: "#2d1405" }}>
                Hello, {firstName} — Welcome back to My Alga!
              </h1>
              <p className="text-lg" style={{ color: "#5a4a42" }}>
                Your home for stays, services, and memories.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleCards.map((card, index) => {
            const badge = getCardBadge(card.title);
            
            return (
              <Link key={index} href={card.link}>
                <Card 
                  className={`h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br ${card.color}`}
                  data-testid={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <CardContent className="p-8 text-center">
                    <div className="relative inline-block mb-4">
                      <div className={`p-4 rounded-2xl bg-white/80 dark:bg-black/20 ${card.iconColor}`}>
                        <card.icon className="w-10 h-10" />
                      </div>
                      {badge && (
                        <div 
                          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: "#2d1405" }}
                        >
                          {badge}
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-xl" style={{ color: "#2d1405" }}>
                      {card.title}
                    </h3>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/properties">
            <div 
              className="p-6 rounded-xl transition-all hover:shadow-lg cursor-pointer"
              style={{ background: "#86a38f" }}
              data-testid="button-browse-properties"
            >
              <h3 className="text-xl font-bold text-white mb-2">Browse Properties</h3>
              <p className="text-white/90">Discover unique stays across Ethiopia</p>
            </div>
          </Link>

          <Link href="/services">
            <div 
              className="p-6 rounded-xl transition-all hover:shadow-lg cursor-pointer"
              style={{ background: "#2d1405" }}
              data-testid="button-browse-services"
            >
              <h3 className="text-xl font-bold text-white mb-2">Browse Services</h3>
              <p className="text-white/90">Find trusted local service providers</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
