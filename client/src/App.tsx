import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/hooks/useAuth";
import { useScrollToTop } from "@/hooks/useScrollToTop";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useWebVitals } from "@/hooks/useWebVitals";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import LoginPage from "@/pages/login";
import Properties from "@/pages/properties";
import PropertyDetails from "@/pages/property-details";
import PropertySearch from "@/pages/search";
import DiscoverPage from "@/pages/discover";
import BecomeHost from "@/pages/become-host";
import BecomeProvider from "@/pages/become-provider";
import BecomeAgent from "@/pages/become-agent";
import HostDashboard from "@/pages/host-dashboard";
import AgentDashboard from "@/pages/agent-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminServiceProviders from "@/pages/admin-service-providers";
import AdminLemlemInsights from "@/pages/admin-lemlem-insights";
import AdminAIControl from "@/pages/admin-ai-control";
import AdminRolesPermissions from "@/pages/admin-roles-permissions";
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
import MealSupport from "@/pages/services/meal-support";
import MyAlga from "@/pages/my-alga";
import MyServices from "@/pages/my-services";
import Profile from "@/pages/profile";
import Support from "@/pages/support";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";
import NotificationsSettings from "@/pages/settings/notifications";
import SecuritySettings from "@/pages/settings/security";
import PaymentSettings from "@/pages/settings/payment";
import LanguageSettings from "@/pages/settings/language";
import PaymentsHelp from "@/pages/help/payments";
import SafetyHelp from "@/pages/help/safety";
import { LemlemChat } from "@/components/lemlem-chat";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import OfflineIndicator from "@/components/offline-indicator";

const pageVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  useScrollToTop();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes - accessible to everyone */}
        <Route path="/login" element={<AnimatedRoute><LoginPage /></AnimatedRoute>} />
        <Route path="/search" element={<AnimatedRoute><PropertySearch /></AnimatedRoute>} />
        <Route path="/discover" element={<AnimatedRoute><DiscoverPage /></AnimatedRoute>} />
        <Route path="/become-host" element={<AnimatedRoute><BecomeHost /></AnimatedRoute>} />
        <Route path="/become-provider" element={<AnimatedRoute><BecomeProvider /></AnimatedRoute>} />
        <Route path="/become-agent" element={<AnimatedRoute><BecomeAgent /></AnimatedRoute>} />
        <Route path="/properties" element={<AnimatedRoute><Properties /></AnimatedRoute>} />
        <Route path="/properties/:id" element={<AnimatedRoute><PropertyDetails /></AnimatedRoute>} />
        <Route path="/booking/success" element={<AnimatedRoute><BookingSuccess /></AnimatedRoute>} />
        <Route path="/booking/cancelled" element={<AnimatedRoute><BookingCancelled /></AnimatedRoute>} />
        <Route path="/scan-id" element={<AnimatedRoute><ScanIDPage /></AnimatedRoute>} />
        <Route path="/test-id-scanner" element={<AnimatedRoute><TestIDScanner /></AnimatedRoute>} />
        
        {/* Service marketplace routes - public */}
        <Route path="/services" element={<AnimatedRoute><Services /></AnimatedRoute>} />
        <Route path="/services/meal-support" element={<AnimatedRoute><MealSupport /></AnimatedRoute>} />
        <Route path="/services/:type" element={<AnimatedRoute><ServiceCategory /></AnimatedRoute>} />
        <Route path="/service-providers/:id" element={<AnimatedRoute><ServiceProviderDetails /></AnimatedRoute>} />
        
        {/* Support/Help - public */}
        <Route path="/support" element={<AnimatedRoute><Support /></AnimatedRoute>} />
        
        {/* Welcome page - shown after login */}
        <Route path="/welcome" element={<AnimatedRoute><Welcome /></AnimatedRoute>} />
        
        {/* My Alga - accessible to all, handles auth internally */}
        <Route path="/my-alga" element={<AnimatedRoute><MyAlga /></AnimatedRoute>} />
        
        {/* Dashboard routes - accessible to all, each dashboard handles auth */}
        <Route path="/host/dashboard" element={<AnimatedRoute><HostDashboard /></AnimatedRoute>} />
        <Route path="/provider/dashboard" element={<AnimatedRoute><ProviderDashboard /></AnimatedRoute>} />
        <Route path="/agent-dashboard" element={<AnimatedRoute><AgentDashboard /></AnimatedRoute>} />
        <Route path="/admin/dashboard" element={<AnimatedRoute><AdminDashboard /></AnimatedRoute>} />
        <Route path="/admin/service-providers" element={<AnimatedRoute><AdminServiceProviders /></AnimatedRoute>} />
        <Route path="/admin/providers" element={<AnimatedRoute><AdminServiceProviders /></AnimatedRoute>} />
        <Route path="/admin/lemlem-insights" element={<AnimatedRoute><AdminLemlemInsights /></AnimatedRoute>} />
        <Route path="/admin/ai-control" element={<AnimatedRoute><AdminAIControl /></AnimatedRoute>} />
        <Route path="/admin/roles-permissions" element={<AnimatedRoute><AdminRolesPermissions /></AnimatedRoute>} />
        <Route path="/operator/dashboard" element={<AnimatedRoute><OperatorDashboard /></AnimatedRoute>} />
        
        {/* Protected user routes - accessible to all, each page handles auth */}
        <Route path="/bookings" element={<AnimatedRoute><Bookings /></AnimatedRoute>} />
        <Route path="/bookings/:id" element={<AnimatedRoute><BookingDetails /></AnimatedRoute>} />
        <Route path="/favorites" element={<AnimatedRoute><Favorites /></AnimatedRoute>} />
        <Route path="/my-services" element={<AnimatedRoute><MyServices /></AnimatedRoute>} />
        <Route path="/profile" element={<AnimatedRoute><Profile /></AnimatedRoute>} />
        
        {/* Settings routes - accessible to authenticated users */}
        <Route path="/settings/notifications" element={<AnimatedRoute><NotificationsSettings /></AnimatedRoute>} />
        <Route path="/settings/security" element={<AnimatedRoute><SecuritySettings /></AnimatedRoute>} />
        <Route path="/settings/payment" element={<AnimatedRoute><PaymentSettings /></AnimatedRoute>} />
        <Route path="/settings/language" element={<AnimatedRoute><LanguageSettings /></AnimatedRoute>} />
        
        {/* Help/Support detail pages - public */}
        <Route path="/help/payments" element={<AnimatedRoute><PaymentsHelp /></AnimatedRoute>} />
        <Route path="/help/safety" element={<AnimatedRoute><SafetyHelp /></AnimatedRoute>} />
        
        <Route path="/" element={<AnimatedRoute><Properties /></AnimatedRoute>} />
        <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  // Enable keyboard shortcuts globally
  useKeyboardShortcuts();
  
  // Track Web Vitals for performance monitoring
  useWebVitals();
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
          <LemlemChat />
          <PWAInstallPrompt />
          <OfflineIndicator />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
