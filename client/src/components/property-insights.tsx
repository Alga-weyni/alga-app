import { Building, Calendar, TrendingUp, Star, CheckCircle, AlertCircle, DollarSign, Package } from "lucide-react";
import { formatETB } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface PropertyInsightsProps {
  stats?: {
    activeListings: number;
    totalListings: number;
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalEarnings: number;
    lastPayout: number | null;
    lastPayoutDate: Date | null;
    avgRating: number;
    totalReviews: number;
    occupancyRate: number;
    pendingReviews: number;
  };
  isLoading?: boolean;
}

export default function PropertyInsights({ stats, isLoading }: PropertyInsightsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const metrics = [
    {
      icon: Building,
      label: "Active Listings",
      value: stats.activeListings,
      subtext: `${stats.totalListings} total`,
      color: "text-[#704d2a]",
      bgColor: "bg-[#704d2a]/10",
    },
    {
      icon: Calendar,
      label: "Upcoming Bookings",
      value: stats.upcomingBookings,
      subtext: `${stats.totalBookings} total`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: DollarSign,
      label: "Total Earnings",
      value: formatETB(stats.totalEarnings),
      subtext: stats.lastPayout ? `Last: ${formatETB(stats.lastPayout)}` : "No payouts yet",
      color: "text-green-600",
      bgColor: "bg-green-50",
      isLarge: true,
    },
    {
      icon: Star,
      label: "Avg Rating",
      value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—",
      subtext: `${stats.totalReviews} reviews`,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: CheckCircle,
      label: "Completed",
      value: stats.completedBookings,
      subtext: `${stats.occupancyRate}% occupancy`,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      icon: TrendingUp,
      label: "Occupancy Rate",
      value: `${stats.occupancyRate}%`,
      subtext: "Performance",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: AlertCircle,
      label: "Pending Reviews",
      value: stats.pendingReviews,
      subtext: "Action needed",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: Package,
      label: "Total Bookings",
      value: stats.totalBookings,
      subtext: "All-time",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-testid="property-insights-widget">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
          data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={`${metric.bgColor} p-2 rounded-lg`}>
                  <metric.icon className={`w-4 h-4 ${metric.color}`} />
                </div>
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {metric.label}
                </p>
              </div>
              <p className={`text-2xl font-bold ${metric.color} dark:text-white mb-1`}>
                {metric.value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {metric.subtext}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
