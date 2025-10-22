import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to properties page where login dialog is available
  useEffect(() => {
    navigate("/properties");
  }, [navigate]);

  return null;
}
