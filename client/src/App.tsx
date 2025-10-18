import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Properties from "@/pages/properties";
import PropertyDetails from "@/pages/property-details";
import HostDashboard from "@/pages/host-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import OperatorDashboard from "@/pages/operator-dashboard";
import StartHosting from "@/pages/start-hosting";
import Bookings from "@/pages/bookings";
import BookingDetails from "@/pages/booking-details";
import BookingSuccess from "@/pages/booking-success";
import BookingCancelled from "@/pages/booking-cancelled";
import Favorites from "@/pages/favorites";
import TestIDScanner from "@/pages/test-id-scanner";
import ScanIDPage from "@/pages/scan-id";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - accessible to everyone */}
      <Route path="/start-hosting" component={StartHosting} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:id" component={PropertyDetails} />
      <Route path="/booking/success" component={BookingSuccess} />
      <Route path="/booking/cancelled" component={BookingCancelled} />
      <Route path="/scan-id" component={ScanIDPage} />
      <Route path="/test-id-scanner" component={TestIDScanner} />
      
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/bookings" component={Bookings} />
          <Route path="/bookings/:id" component={BookingDetails} />
          <Route path="/favorites" component={Favorites} />
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
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
