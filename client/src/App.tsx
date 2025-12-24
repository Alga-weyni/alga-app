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
import OnboardingPage from "@/pages/onboarding";
import Properties from "@/pages/properties";
import PropertyDetails from "@/pages/property-details";
import PropertySearch from "@/pages/search";
import DiscoverPage from "@/pages/discover";
import BecomeHost from "@/pages/become-host";
import BecomeProvider from "@/pages/become-provider";
import BecomeAgent from "@/pages/become-agent";
import HostDashboard from "@/pages/host-dashboard";
import AgentDashboard from "@/pages/agent-dashboard";
import DellalaDashboard from "@/pages/dellala-dashboard";
import DellalaListProperty from "@/pages/dellala-list-property";
import OwnerPayout from "@/pages/owner-payout";
import AgentSuccess from "@/pages/agent-success";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminServiceProviders from "@/pages/admin-service-providers";
import AdminLemlemInsights from "@/pages/admin-lemlem-insights";
import AdminAIControl from "@/pages/admin-ai-control";
import AdminRolesPermissions from "@/pages/admin-roles-permissions";
import AdminAgents from "@/pages/admin-agents";
import AdminIdVerification from "@/pages/admin-id-verification";
import LemlemOperationsDashboard from "@/pages/admin/LemlemOperationsDashboard";
import LemlemOps from "@/pages/admin/LemlemOps";
import LemlemValidationMetrics from "@/pages/admin/LemlemValidationMetrics";
import ReportsArchive from "@/pages/admin/ReportsArchive";
import SignatureDashboard from "@/pages/admin/SignatureDashboard";
import AdminPayments from "@/pages/admin-payments";
import INSACompliancePage from "@/pages/insa-compliance";
import OperatorDashboard from "@/pages/operator-dashboard";
import AgentProgram from "@/pages/agent-program";
import ProviderDashboard from "@/pages/provider-dashboard";
import Bookings from "@/pages/bookings";
import BookingDetails from "@/pages/booking-details";
import BookingSuccess from "@/pages/booking-success";
import BookingCancelled from "@/pages/booking-cancelled";
import BookingError from "@/pages/booking-error";
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
import Settings from "@/pages/settings";
import Support from "@/pages/support";
import Welcome from "@/pages/welcome";
import NotFound from "@/pages/not-found";
import NotificationsSettings from "@/pages/settings/notifications";
import SecuritySettings from "@/pages/settings/security";
import PaymentSettings from "@/pages/settings/payment";
import LanguageSettings from "@/pages/settings/language";
import PaymentsHelp from "@/pages/help/payments";
import SafetyHelp from "@/pages/help/safety";
import TermsOfService from "@/pages/terms";
import { LemlemChat } from "@/components/lemlem-chat";
import PWAInstallPrompt from "@/components/pwa-install-prompt";
import OfflineIndicator from "@/components/offline-indicator";
import MobileLayout from "@/components/mobile/mobile-layout";
import MobileAuthGuard from "@/components/mobile/mobile-auth-guard";
import { isMobileApp } from "@/utils/platform";
import { Capacitor } from "@capacitor/core";
import { ProtectedRoute } from "@/components/protected-route";

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
  const isMobile = isMobileApp();
  
  useScrollToTop();

  const routes = (
    <AnimatePresence mode="sync" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes - accessible to everyone */}
        <Route path="/login" element={<AnimatedRoute><LoginPage /></AnimatedRoute>} />
        <Route path="/search" element={<AnimatedRoute><PropertySearch /></AnimatedRoute>} />
        <Route path="/discover" element={<AnimatedRoute><DiscoverPage /></AnimatedRoute>} />
        <Route path="/become-host" element={<AnimatedRoute><BecomeHost /></AnimatedRoute>} />
        <Route path="/become-provider" element={<AnimatedRoute><BecomeProvider /></AnimatedRoute>} />
        <Route path="/become-agent" element={<AnimatedRoute><BecomeAgent /></AnimatedRoute>} />
        <Route path="/agent-program" element={<AnimatedRoute><AgentProgram /></AnimatedRoute>} />
        <Route path="/properties" element={<AnimatedRoute><Properties /></AnimatedRoute>} />
        <Route path="/properties/:id" element={<AnimatedRoute><PropertyDetails /></AnimatedRoute>} />
        <Route path="/booking/success" element={<AnimatedRoute><BookingSuccess /></AnimatedRoute>} />
        <Route path="/booking/cancelled" element={<AnimatedRoute><BookingCancelled /></AnimatedRoute>} />
        <Route path="/booking/error" element={<AnimatedRoute><BookingError /></AnimatedRoute>} />
        <Route path="/scan-id" element={<AnimatedRoute><ScanIDPage /></AnimatedRoute>} />
        <Route path="/test-id-scanner" element={<AnimatedRoute><TestIDScanner /></AnimatedRoute>} />
        <Route path="/terms" element={<AnimatedRoute><TermsOfService /></AnimatedRoute>} />
        
        {/* Service marketplace routes - public */}
        <Route path="/services" element={<AnimatedRoute><Services /></AnimatedRoute>} />
        <Route path="/services/meal-support" element={<AnimatedRoute><MealSupport /></AnimatedRoute>} />
        <Route path="/services/:type" element={<AnimatedRoute><ServiceCategory /></AnimatedRoute>} />
        <Route path="/service-providers/:id" element={<AnimatedRoute><ServiceProviderDetails /></AnimatedRoute>} />
        
        {/* Support/Help/Ask Lemlem - public */}
        <Route path="/support" element={<AnimatedRoute><Support /></AnimatedRoute>} />
        <Route path="/ask-lemlem" element={<AnimatedRoute><Support /></AnimatedRoute>} />
        
        {/* Welcome page - shown after login */}
        <Route path="/welcome" element={<AnimatedRoute><Welcome /></AnimatedRoute>} />
        
        {/* Onboarding - shown for new users */}
        <Route path="/onboarding" element={<AnimatedRoute><OnboardingPage /></AnimatedRoute>} />
        
        {/* Admin routes - admin only */}
        <Route path="/admin/dashboard" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminDashboard /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/my-alga" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><MyAlga /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/service-providers" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminServiceProviders /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/providers" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminServiceProviders /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/lemlem-insights" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminLemlemInsights /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/ai-control" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminAIControl /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/roles-permissions" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminRolesPermissions /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/agents" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><AdminAgents /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/id-verification" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin", "operator"]}><AdminIdVerification /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/lemlem-ops" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><LemlemOps /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/lemlem-validation" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><LemlemValidationMetrics /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/lemlem-dashboard" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><LemlemOperationsDashboard /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/reports" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><ReportsArchive /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/signatures" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin"]}><SignatureDashboard /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/admin/payments" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin", "operator"]}><AdminPayments /></ProtectedRoute></AnimatedRoute>} />
        
        {/* Operator routes - operator only */}
        <Route path="/operator/dashboard" element={<AnimatedRoute><ProtectedRoute requiredRoles={["operator"]}><OperatorDashboard /></ProtectedRoute></AnimatedRoute>} />
        
        {/* INSA Compliance - admin and operator only */}
        <Route path="/insa-compliance" element={<AnimatedRoute><ProtectedRoute requiredRoles={["admin", "operator"]}><INSACompliancePage /></ProtectedRoute></AnimatedRoute>} />
        
        {/* Host routes - host only */}
        <Route path="/host/dashboard" element={<AnimatedRoute><ProtectedRoute requiredRoles={["host"]}><HostDashboard /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/owner/payout" element={<AnimatedRoute><ProtectedRoute requiredRoles={["host"]}><OwnerPayout /></ProtectedRoute></AnimatedRoute>} />
        
        {/* Agent/Dellala routes - any authenticated user with agent record (API checks status) */}
        <Route path="/dellala/dashboard" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><DellalaDashboard /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/dellala/list-property" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><DellalaListProperty /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/agent-dashboard" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><AgentDashboard /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/agent/success" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><AgentSuccess /></ProtectedRoute></AnimatedRoute>} />
        
        {/* Provider routes - service_provider role only */}
        <Route path="/provider/dashboard" element={<AnimatedRoute><ProtectedRoute requiredRoles={["service_provider"]}><ProviderDashboard /></ProtectedRoute></AnimatedRoute>} />
        
        {/* Authenticated user routes - all authenticated users */}
        <Route path="/bookings" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><Bookings /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/bookings/:id" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><BookingDetails /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/favorites" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><Favorites /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/my-services" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><MyServices /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/profile" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><Profile /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/settings" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><Settings /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/settings/notifications" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><NotificationsSettings /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/settings/security" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><SecuritySettings /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/settings/payment" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><PaymentSettings /></ProtectedRoute></AnimatedRoute>} />
        <Route path="/settings/language" element={<AnimatedRoute><ProtectedRoute requireAuth={true}><LanguageSettings /></ProtectedRoute></AnimatedRoute>} />
        
        {/* Help/Support detail pages - public */}
        <Route path="/help/payments" element={<AnimatedRoute><PaymentsHelp /></AnimatedRoute>} />
        <Route path="/help/safety" element={<AnimatedRoute><SafetyHelp /></AnimatedRoute>} />
        
        <Route path="/" element={<AnimatedRoute><Properties /></AnimatedRoute>} />
        <Route path="*" element={<AnimatedRoute><NotFound /></AnimatedRoute>} />
      </Routes>
    </AnimatePresence>
  );

  // Return mobile-wrapped or web version
  if (isMobile) {
    return (
      <MobileAuthGuard>
        <MobileLayout>
          {routes}
        </MobileLayout>
      </MobileAuthGuard>
    );
  }

  return routes;
}

function App() {
  const isMobile = isMobileApp();
  const isActualNativeApp = Capacitor.isNativePlatform();
  
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
          {/* Only show global Lemlem chat on web, mobile has it in layout */}
          {!isMobile && <LemlemChat />}
          <PWAInstallPrompt />
          <OfflineIndicator />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
