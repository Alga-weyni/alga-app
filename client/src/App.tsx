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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/login" component={LoginPage} />
      <Route path="/search" component={PropertySearch} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/become-host" component={BecomeHost} />
      <Route path="/become-provider" component={BecomeProvider} />
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
      
      {/* Support/Help - public */}
      <Route path="/support" component={Support} />
      
      {/* Welcome page - shown after login */}
      <Route path="/welcome" component={Welcome} />
      
      {/* My Alga - accessible to all, handles auth internally */}
      <Route path="/my-alga" component={MyAlga} />
      
      {/* Dashboard routes - accessible to all, each dashboard handles auth */}
      <Route path="/host/dashboard" component={HostDashboard} />
      <Route path="/provider/dashboard" component={ProviderDashboard} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/service-providers" component={AdminServiceProviders} />
      <Route path="/admin/providers" component={AdminServiceProviders} />
      <Route path="/operator/dashboard" component={OperatorDashboard} />
      
      {/* Protected user routes - accessible to all, each page handles auth */}
      <Route path="/bookings" component={Bookings} />
      <Route path="/bookings/:id" component={BookingDetails} />
      <Route path="/favorites" component={Favorites} />
      <Route path="/my-services" component={MyServices} />
      <Route path="/profile" component={Profile} />
      
      <Route path="/" component={Properties} />
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
