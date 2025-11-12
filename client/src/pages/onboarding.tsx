import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WelcomeOnboarding } from "@/components/onboarding/WelcomeOnboarding";
import { Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: onboardingStatus } = useQuery({
    queryKey: ["/api/onboarding/status"],
    enabled: !!user,
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (onboardingStatus?.onboardingCompleted) {
      const roleRedirects: Record<string, string> = {
        guest: "/properties",
        host: "/host-dashboard",
        dellala: "/dellala/dashboard",
        operator: "/operator/dashboard",
        admin: "/admin/dashboard",
      };
      navigate(roleRedirects[user?.role || "guest"] || "/properties");
    }
  }, [onboardingStatus, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-50 to-cream-100 dark:from-gray-900 dark:to-gray-800">
        <Loader2 className="h-8 w-8 animate-spin text-brown-600" />
      </div>
    );
  }

  const handleComplete = () => {
    const roleRedirects: Record<string, string> = {
      guest: "/properties",
      host: "/host-dashboard",
      dellala: "/dellala/dashboard",
      operator: "/operator/dashboard",
      admin: "/admin/dashboard",
    };
    navigate(roleRedirects[user.role] || "/properties");
  };

  return (
    <WelcomeOnboarding
      role={user.role as any}
      userName={user.fullName}
      onComplete={handleComplete}
    />
  );
}
