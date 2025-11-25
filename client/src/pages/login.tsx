import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get the page to redirect to after login (from query param)
  const returnTo = searchParams.get("returnTo");

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return;

    // If authenticated, redirect based on role or returnTo
    if (isAuthenticated && user) {
      // If returnTo is specified, go there first (for cases like become-provider)
      if (returnTo) {
        navigate(returnTo, { replace: true });
        return;
      }
      
      const role = user.role;
      
      if (role === "admin") {
        navigate("/admin/dashboard", { replace: true });
      } else if (role === "operator") {
        navigate("/operator/dashboard", { replace: true });
      } else if (role === "host") {
        navigate("/host/dashboard", { replace: true });
      } else if (role === "agent") {
        navigate("/agent-dashboard", { replace: true });
      } else if (role === "service_provider") {
        navigate("/provider/dashboard", { replace: true });
      } else {
        // Guest users see properties
        navigate("/properties", { replace: true });
      }
    } else {
      // Not authenticated - show login dialog on properties page
      navigate("/properties", { replace: true });
    }
  }, [isAuthenticated, user, isLoading, navigate, returnTo]);

  return null;
}
