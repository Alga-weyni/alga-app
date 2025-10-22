// Unified Dashboard - Auto-detects role and shows appropriate content
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Wrench, 
  Star,
  Building2,
  Calendar,
  DollarSign,
  Users,
  FileCheck,
  TrendingUp,
  Settings as SettingsIcon
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Booking, ServiceBooking, Property } from "@shared/schema";

interface DashboardCard {
  icon: React.ElementType;
  title: string;
  link: string;
  color: string;
  iconColor: string;
  count?: number;
  visible: boolean;
}

export default function MyAlga() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const firstName = user?.firstName || "Guest";

  // Fetch data based on role
  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user && (user.role === 'guest' || user.role === 'host'),
  });

  const { data: serviceBookings } = useQuery<ServiceBooking[]>({
    queryKey: ["/api/my-service-bookings"],
    enabled: !!user,
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/host/properties"],
    enabled: !!user && user.role === 'host',
  });

  // Auto-redirect admin/operator to their dashboards
  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'operator') {
      navigate('/operator/dashboard');
    }
  }, [user?.role, navigate]);

  // Define cards based on user role
  const getCardsForRole = (): DashboardCard[] => {
    const role = user?.role || 'guest';
    
    if (role === 'host') {
      return [
        {
          icon: Building2,
          title: "My Properties",
          link: "/host/dashboard",
          color: "from-blue-50 to-blue-100",
          iconColor: "text-blue-600",
          count: properties?.length || 0,
          visible: true,
        },
        {
          icon: Calendar,
          title: "My Trips",
          link: "/bookings",
          color: "from-green-50 to-green-100",
          iconColor: "text-green-600",
          count: bookings?.length || 0,
          visible: true,
        },
        {
          icon: DollarSign,
          title: "Earnings",
          link: "/host/dashboard",
          color: "from-yellow-50 to-yellow-100",
          iconColor: "text-yellow-600",
          visible: true,
        },
        {
          icon: Star,
          title: "Reviews",
          link: "/host/dashboard",
          color: "from-purple-50 to-purple-100",
          iconColor: "text-purple-600",
          visible: true,
        },
      ];
    }

    if (user?.isServiceProvider) {
      return [
        {
          icon: Home,
          title: "My Trips",
          link: "/bookings",
          color: "from-blue-50 to-blue-100",
          iconColor: "text-blue-600",
          count: bookings?.length || 0,
          visible: true,
        },
        {
          icon: Wrench,
          title: "My Services",
          link: "/provider/dashboard",
          color: "from-orange-50 to-orange-100",
          iconColor: "text-orange-600",
          count: serviceBookings?.length || 0,
          visible: true,
        },
        {
          icon: DollarSign,
          title: "Earnings",
          link: "/provider/dashboard",
          color: "from-green-50 to-green-100",
          iconColor: "text-green-600",
          visible: true,
        },
        {
          icon: Star,
          title: "Reviews",
          link: "/provider/dashboard",
          color: "from-yellow-50 to-yellow-100",
          iconColor: "text-yellow-600",
          visible: true,
        },
      ];
    }

    // Default: guest role
    return [
      {
        icon: Home,
        title: "My Trips",
        link: "/bookings",
        color: "from-blue-50 to-blue-100",
        iconColor: "text-blue-600",
        count: bookings?.length || 0,
        visible: true,
      },
      {
        icon: Wrench,
        title: "My Services",
        link: "/my-services",
        color: "from-orange-50 to-orange-100",
        iconColor: "text-orange-600",
        count: serviceBookings?.length || 0,
        visible: true,
      },
      {
        icon: Star,
        title: "Favorites",
        link: "/favorites",
        color: "from-red-50 to-red-100",
        iconColor: "text-red-600",
        visible: true,
      },
      {
        icon: SettingsIcon,
        title: "Settings",
        link: "/profile",
        color: "from-gray-50 to-gray-100",
        iconColor: "text-gray-600",
        visible: true,
      },
    ];
  };

  const cards = getCardsForRole();

  // Show login prompt for non-authenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
        <Card className="max-w-md w-full mx-4" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-md"
                style={{ background: "#8a6e4b" }}
              >
                👤
              </div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>
                Welcome to Alga
              </h2>
              <p className="text-base" style={{ color: "#5a4a42" }}>
                Please sign in to view your dashboard
              </p>
            </div>
            <Link href="/login">
              <Button 
                className="w-full text-lg py-6"
                style={{ background: "#2d1405" }}
                data-testid="button-signin"
              >
                Sign In
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f6f2ec" }}>
      {/* Warm Greeting Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar - Bigger & Friendlier */}
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-md"
              style={{ background: "#8a6e4b" }}
            >
              {firstName[0].toUpperCase()}
            </div>
            
            {/* Greeting */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-1" style={{ color: "#2d1405" }}>
                Hello, {firstName}! 👋
              </h1>
              <p className="text-base sm:text-xl" style={{ color: "#5a4a42" }}>
                Welcome back to your dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid - Bigger Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <Link key={index} href={card.link}>
              <Card 
                className={`h-full transition-all duration-200 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-0 bg-gradient-to-br ${card.color}`}
                data-testid={`card-${card.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <CardContent className="p-8 sm:p-10">
                  <div className="flex items-center gap-6">
                    {/* Icon - Bigger */}
                    <div className={`p-5 rounded-2xl bg-white/80 ${card.iconColor} shadow-md`}>
                      <card.icon className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div>
                    
                    {/* Title & Count */}
                    <div className="flex-1">
                      <h3 className="font-bold text-xl sm:text-2xl mb-1" style={{ color: "#2d1405" }}>
                        {card.title}
                      </h3>
                      {card.count !== undefined && (
                        <p className="text-3xl sm:text-4xl font-bold" style={{ color: "#8a6e4b" }}>
                          {card.count}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Actions - Bigger Buttons */}
        <div className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold mb-6" style={{ color: "#2d1405" }}>
            Explore More
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/properties">
              <Button
                size="lg"
                className="w-full h-20 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: "#86a38f" }}
                data-testid="button-browse-properties"
              >
                <Home className="mr-3 h-6 w-6" />
                Find a Place to Stay
              </Button>
            </Link>

            <Link href="/services">
              <Button
                size="lg"
                className="w-full h-20 text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: "#8a6e4b" }}
                data-testid="button-browse-services"
              >
                <Wrench className="mr-3 h-6 w-6" />
                Get Help & Services
              </Button>
            </Link>
          </div>

          {/* Become Host/Provider CTAs - Only for guests */}
          {user?.role === 'guest' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Link href="/become-host">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-lg rounded-2xl border-2 hover:shadow-lg transition-all"
                  style={{ borderColor: "#2d1405", color: "#2d1405" }}
                  data-testid="button-become-host"
                >
                  <Building2 className="mr-3 h-5 w-5" />
                  List Your Property
                </Button>
              </Link>

              <Link href="/become-provider">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full h-16 text-lg rounded-2xl border-2 hover:shadow-lg transition-all"
                  style={{ borderColor: "#2d1405", color: "#2d1405" }}
                  data-testid="button-become-provider"
                >
                  <Wrench className="mr-3 h-5 w-5" />
                  Offer a Service
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
