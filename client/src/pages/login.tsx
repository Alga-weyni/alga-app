import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get the page to redirect to after login (from query param)
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If authenticated, redirect based on role or returnTo
    if (isAuthenticated && user) {
      let redirectPath: string;
      
      // If returnTo is specified, go there first (for cases like become-provider)
      if (returnTo) {
        redirectPath = returnTo;
      } else {
        // Role-based redirect
        const role = user.role;
        
        if (role === "admin") {
          redirectPath = "/admin/dashboard";
        } else if (role === "operator") {
          redirectPath = "/operator/dashboard";
        } else if (role === "host") {
          redirectPath = "/host/dashboard";
        } else if (role === "agent") {
          redirectPath = "/agent-dashboard";
        } else if (role === "service_provider") {
          redirectPath = "/provider/dashboard";
        } else {
          // Guest users see properties
          redirectPath = "/properties";
        }
      }
      
      // Use hard navigation to ensure session is established
      window.location.href = redirectPath;
    } else {
      // Not authenticated - go to properties page with login prompt
      window.location.href = "/properties";
    }
  }, [isAuthenticated, user, isLoading, returnTo]);

  return null;
}
