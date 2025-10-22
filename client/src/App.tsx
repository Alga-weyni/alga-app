import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import Properties from "@/pages/properties";
import PropertyDetails from "@/pages/property-details";
import PropertySearch from "@/pages/search";
import DiscoverPage from "@/pages/discover";
import BecomeHost from "@/pages/become-host";
import HostDashboard from "@/pages/host-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import OperatorDashboard from "@/pages/operator-dashboard";
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
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/login" component={LoginPage} />
      <Route path="/search" component={PropertySearch} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/become-host" component={BecomeHost} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetails} />
      <Route path="/booking/success" component={BookingSuccess} />
      <Route path="/booking/cancelled" component={BookingCancelled} />
      <Route path="/scan-id" component={ScanIDPage} />
      <Route path="/test-id-scanner" component={TestIDScanner} />
      
      {/* Service marketplace routes - public */}
      <Route path="/services" component={Services} />
      <Route path="/services/:type" component={ServiceCategory} />
      <Route path="/service-providers/:id" component={ServiceProviderDetails} />
      
      <Route path="/" component={Properties} />
      
      {!isLoading && isAuthenticated && (
        <>
          <Route path="/bookings" component={Bookings} />
          <Route path="/bookings/:id" component={BookingDetails} />
          <Route path="/favorites" component={Favorites} />
          <Route path="/my-alga" component={MyAlga} />
          <Route path="/my-services" component={MyServices} />
          <Route path="/host/dashboard" component={HostDashboard} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/operator/dashboard" component={OperatorDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
