import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import Properties from "@/pages/properties";
import PropertyDetails from "@/pages/property-details";
import PropertySearch from "@/pages/search";
import DiscoverPage from "@/pages/discover";
import BecomeHost from "@/pages/become-host";
import BecomeProvider from "@/pages/become-provider";
import HostDashboard from "@/pages/host-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminServiceProviders from "@/pages/admin-service-providers";
import OperatorDashboard from "@/pages/operator-dashboard";
import ProviderDashboard from "@/pages/provider-dashboard";
import Bookings from "@/pages/bookings";
import BookingDetails from "@/pages/booking-details";
import BookingSuccess from "@/pages/booking-success";
import BookingCancelled from "@/pages/booking-cancelled";
import Favorites from "@/pages/favorites";
import TestIDScanner from "@/pages/test-id-scanner";
import ScanIDPage from "@/pages/scan-id";
import Services from "@/pages/services";
import ServiceCategory from "@/pages/service-category";
import ServiceProviderDetails from "@/pages/service-provider-details";
import MyAlga from "@/pages/my-alga";
import MyServices from "@/pages/my-services";
import Profile from "@/pages/profile";
import Support from "@/pages/support";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";
import { useScrollToTop } from "@/hooks/useScrollToTop";

function AnimatedRoutes() {
  const location = useLocation();
  useScrollToTop();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public routes - accessible to everyone */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/search" element={<PropertySearch />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/become-host" element={<BecomeHost />} />
        <Route path="/become-provider" element={<BecomeProvider />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/properties/:id" element={<PropertyDetails />} />
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/booking/cancelled" element={<BookingCancelled />} />
        <Route path="/scan-id" element={<ScanIDPage />} />
        <Route path="/test-id-scanner" element={<TestIDScanner />} />
        
        {/* Service marketplace routes - public */}
        <Route path="/services" element={<Services />} />
        <Route path="/services/:type" element={<ServiceCategory />} />
        <Route path="/service-providers/:id" element={<ServiceProviderDetails />} />
        
        {/* Support/Help - public */}
        <Route path="/support" element={<Support />} />
        
        {/* Welcome page - shown after login */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* My Alga - accessible to all, handles auth internally */}
        <Route path="/my-alga" element={<MyAlga />} />
        
        {/* Dashboard routes - accessible to all, each dashboard handles auth */}
        <Route path="/host/dashboard" element={<HostDashboard />} />
        <Route path="/provider/dashboard" element={<ProviderDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/service-providers" element={<AdminServiceProviders />} />
        <Route path="/admin/providers" element={<AdminServiceProviders />} />
        <Route path="/operator/dashboard" element={<OperatorDashboard />} />
        
        {/* Protected user routes - accessible to all, each page handles auth */}
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/bookings/:id" element={<BookingDetails />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/my-services" element={<MyServices />} />
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/" element={<Properties />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AnimatedRoutes />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
