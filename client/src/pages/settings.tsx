import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Globe,
  Briefcase,
  Home,
  ArrowRight,
  Settings as SettingsIcon,
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate("/");
    return null;
  }

  const settingsSections = [
    {
      title: "Personal Information",
      description: "Phone number, email, name, profile photo",
      icon: User,
      path: "/profile",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Banking & Payments",
      description: "Chapa, TeleBirr, bank account details",
      icon: CreditCard,
      path: "/settings/payment",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      sensitiveIcon: Shield,
    },
    {
      title: "Security",
      description: "Password, 2FA, login devices",
      icon: Shield,
      path: "/settings/security",
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950",
      sensitiveIcon: Shield,
    },
    {
      title: "Notifications",
      description: "Booking alerts, email preferences",
      icon: Bell,
      path: "/settings/notifications",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Language & Region",
      description: "Choose your preferred language",
      icon: Globe,
      path: "/settings/language",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ];

  // Role-specific sections
  const roleSpecificSections = [];
  
  if (user.role === "host" || user.role === "admin") {
    roleSpecificSections.push({
      title: "Host Settings",
      description: "Payout account, property notifications",
      icon: Home,
      path: "/host/dashboard",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 dark:bg-indigo-950",
    });
  }

  // Check if user is an agent
  const checkAgent = async () => {
    try {
      const response = await fetch("/api/dellala/dashboard");
      if (response.ok) {
        roleSpecificSections.push({
          title: "Agent Settings",
          description: "Commission payout, team info",
          icon: Briefcase,
          path: "/dellala/dashboard",
          color: "text-emerald-600",
          bgColor: "bg-emerald-50 dark:bg-emerald-950",
        });
      }
    } catch (error) {
      // User is not an agent
    }
  };

  checkAgent();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#FAF5F0] dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SettingsIcon className="w-10 h-10 text-eth-brown dark:text-cream" />
              <h1 className="text-4xl font-bold text-eth-brown dark:text-cream">
                Settings
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account, preferences, and security settings
            </p>
          </div>

          {/* General Settings */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold text-eth-brown dark:text-cream mb-4">
              General Settings
            </h2>
            <div className="grid gap-4">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const SensitiveIcon = section.sensitiveIcon;
                return (
                  <Card
                    key={section.path}
                    className="cursor-pointer hover:shadow-lg transition-shadow border-eth-brown/20 dark:border-gray-700"
                    onClick={() => navigate(section.path)}
                    data-testid={`card-settings-${section.path.replace(/\//g, "-")}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${section.bgColor}`}>
                            <Icon className={`w-6 h-6 ${section.color}`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-eth-brown dark:text-cream flex items-center gap-2">
                              {section.title}
                              {SensitiveIcon && (
                                <Shield className="w-4 h-4 text-amber-600" title="Requires OTP verification" />
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {section.description}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Role-Specific Settings */}
          {roleSpecificSections.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-eth-brown dark:text-cream mb-4">
                Role-Specific Settings
              </h2>
              <div className="grid gap-4">
                {roleSpecificSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Card
                      key={section.path}
                      className="cursor-pointer hover:shadow-lg transition-shadow border-eth-brown/20 dark:border-gray-700"
                      onClick={() => navigate(section.path)}
                      data-testid={`card-settings-${section.path.replace(/\//g, "-")}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${section.bgColor}`}>
                              <Icon className={`w-6 h-6 ${section.color}`} />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-eth-brown dark:text-cream">
                                {section.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {section.description}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Security Notice */}
          <Card className="mt-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Security Notice
                  </h4>
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    Changes to sensitive information (phone number, email, payment details) require OTP verification 
                    and password confirmation to keep your account secure.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
