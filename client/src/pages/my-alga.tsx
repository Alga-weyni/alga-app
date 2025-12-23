// Unified Dashboard - Auto-detects role and shows appropriate content
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "@/components/header";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useOnboardingCheck } from "@/hooks/useOnboardingCheck";
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
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const firstName = user?.firstName || "Guest";

  // Check if user needs onboarding - redirects automatically if needed
  useOnboardingCheck();

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      // Clear all cached queries first
      queryClient.clear();
      // Show toast before navigation
      toast({
        title: "Signed out",
        description: "You've been signed out successfully",
      });
      // Small delay to ensure toast shows, then hard reload to clear all state
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    },
    onError: () => {
      // Even on error, clear local state and redirect
      queryClient.clear();
      window.location.href = "/";
    },
  });

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

  // Check if user is also registered as an agent (for hosts who are also agents)
  const { data: agentData } = useQuery<{ agent: any }>({
    queryKey: ["/api/agent/dashboard"],
    enabled: !!user && (user.role === 'host' || user.role === 'agent'),
  });
  
  const isAlsoAgent = !!agentData?.agent;

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
    
    // Host role (whether or not they are also an agent - agent dashboard is accessed separately)
    // The agent dashboard is accessed via /agent-dashboard, not mixed here
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

    if (role === 'agent') {
      return [
        {
          icon: Building2,
          title: "Agent Dashboard",
          link: "/agent-dashboard",
          color: "from-emerald-50 to-emerald-100",
          iconColor: "text-emerald-600",
          visible: true,
        },
        {
          icon: Home,
          title: "Add Property",
          link: "/dellala/list-property",
          color: "from-blue-50 to-blue-100",
          iconColor: "text-blue-600",
          visible: true,
        },
        {
          icon: DollarSign,
          title: "My Earnings",
          link: "/dellala/dashboard",
          color: "from-green-50 to-green-100",
          iconColor: "text-green-600",
          visible: true,
        },
        {
          icon: Calendar,
          title: "My Trips",
          link: "/bookings",
          color: "from-purple-50 to-purple-100",
          iconColor: "text-purple-600",
          count: bookings?.length || 0,
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
        icon: DollarSign,
        title: "Earnings",
        link: "/dellala/dashboard",
        color: "from-green-50 to-green-100",
        iconColor: "text-green-600",
        visible: true,
      },
      {
        icon: Star,
        title: "Reviews",
        link: "/my-reviews",
        color: "from-yellow-50 to-yellow-100",
        iconColor: "text-yellow-600",
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
            <Link to="/login">
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
      <Header />
      
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
            <div className="flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold mb-1" style={{ color: "#2d1405" }}>
                Hello, {firstName}! 👋
              </h1>
              <p className="text-base sm:text-xl" style={{ color: "#5a4a42" }}>
                Welcome back to your dashboard
              </p>
            </div>

            {/* Sign Out Button - Mobile Only */}
            <button
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="md:hidden flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
              style={{ color: "#2d1405" }}
              data-testid="button-signout-mobile"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Agent Dashboard Banner - For hosts who are also agents */}
      {user?.role === 'host' && isAlsoAgent && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <Link to="/agent-dashboard">
            <Card 
              className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-xl transition-all cursor-pointer border-0"
              data-testid="banner-agent-dashboard"
            >
              <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white/20">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">Agent Dashboard</h3>
                    <p className="text-sm sm:text-base text-white/80">
                      View your Delala commissions and referred properties
                    </p>
                  </div>
                </div>
                <div className="text-2xl">→</div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      {/* Dashboard Grid - Bigger Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map((card, index) => (
            <Link key={index} to={card.link}>
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
            <Link to="/properties">
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

            <Link to="/services">
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
              <Link to="/become-host">
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

              <Link to="/become-provider">
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
