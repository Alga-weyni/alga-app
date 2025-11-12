import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

/**
 * Hook to check if user needs onboarding and redirect if necessary
 * Use this in dashboards and protected pages
 */
export function useOnboardingCheck() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: onboardingStatus } = useQuery({
    queryKey: ["/api/onboarding/status"],
    enabled: !!user,
  });

  useEffect(() => {
    // Skip if already on onboarding page
    if (location.pathname === "/onboarding") {
      return;
    }

    // Skip if on public pages
    const publicPages = ["/", "/properties", "/login", "/search", "/discover", "/terms", "/support"];
    if (publicPages.includes(location.pathname)) {
      return;
    }

    // Redirect to onboarding if user is authenticated but hasn't completed onboarding
    if (user && onboardingStatus && !onboardingStatus.onboardingCompleted) {
      navigate("/onboarding");
    }
  }, [user, onboardingStatus, location.pathname, navigate]);

  return {
    needsOnboarding: user && onboardingStatus && !onboardingStatus.onboardingCompleted,
    onboardingStatus,
  };
}
