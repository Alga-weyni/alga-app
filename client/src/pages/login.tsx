import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect to properties page where login dialog is available
  useEffect(() => {
    setLocation("/properties");
  }, [setLocation]);

  return null;
}
