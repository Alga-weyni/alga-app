import { Home, CreditCard, Calendar, CheckCircle } from "lucide-react";

interface HostBannerProps {
  hostName?: string | null;
}

/**
 * Professional Host Banner Component
 * Displays welcome message and Alga Pay branding at top of host dashboard
 */
export default function HostBanner({ hostName }: HostBannerProps) {
  return (
    <div
      className="relative overflow-hidden rounded-lg mb-6 shadow-lg"
      style={{
        background: "linear-gradient(90deg, #704d2a 0%, #e0ad60 100%)",
      }}
      data-testid="host-banner"
    >
      {/* Main Content */}
      <div className="relative z-10 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Welcome Section */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Home className="w-6 h-6 text-white" />
            <h2 className="text-2xl font-bold text-white m-0">
              Welcome, {hostName || "Host"}! 🏠
            </h2>
          </div>
          <p className="text-white/90 text-sm md:text-base m-0 max-w-2xl">
            Manage your properties, track <span className="font-semibold">Alga Pay</span> payouts, and monitor guest bookings here.
          </p>
        </div>

        {/* Portal Badge */}
        <div className="flex flex-col items-end gap-2">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
            <span className="font-semibold text-white text-sm md:text-base">
              Alga Host Portal
            </span>
          </div>
          <div className="flex items-center gap-3 text-white/80 text-xs flex-wrap">
            <div className="flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Real-time Bookings</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Easy Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />
      <div 
        className="absolute bottom-0 left-0 w-40 h-40 rounded-full blur-3xl opacity-10"
        style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }}
      />
    </div>
  );
}
