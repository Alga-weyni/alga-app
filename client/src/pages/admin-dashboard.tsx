import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import { 
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  Mail,
  Phone,
  Shield,
  MessageSquare,
} from "lucide-react";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
        <Card className="max-w-md w-full mx-4" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
          <CardContent className="p-8 text-center">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4" style={{ color: "#8a6e4b" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>
              Admin Dashboard
            </h2>
            <p className="text-base mb-6" style={{ color: "#5a4a42" }}>
              Please sign in to access the admin dashboard
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full text-lg py-6"
              style={{ background: "#2d1405" }}
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      toast({
        title: "Signed out successfully",
        description: "You have been logged out",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Sign out failed",
        description: "Please try again",
        variant: "destructive",
      });
    },
  });

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-amber-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage your profile and access Lemlem AI Assistant
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => signOutMutation.mutate()}
              className="flex items-center gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Me Section - Profile */}
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
                <CardDescription>Your admin account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Info Display */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <User className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <Phone className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {user.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                    <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Role</p>
                      <Badge className="bg-amber-600 text-white mt-1">
                        {user.role === 'admin' ? 'Administrator' : user.role}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    onClick={() => navigate("/settings")}
                    className="w-full bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600"
                    data-testid="button-edit-profile"
                  >
                    Edit Profile Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ask Lemlem Section */}
            <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
                  <Sparkles className="h-5 w-5" />
                  Ask Lemlem AI
                </CardTitle>
                <CardDescription>Your AI assistant for Alga operations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-purple-600 dark:text-purple-400 opacity-50" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Get instant help with platform questions, user management, property verification, and more.
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-400 mb-6">
                    💬 Ask Lemlem can help you with:
                  </p>
                  <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 max-w-md mx-auto mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Platform guidance and best practices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>User and property management tips</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Troubleshooting and support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400">•</span>
                      <span>Ethiopian hospitality wisdom & proverbs</span>
                    </li>
                  </ul>
                  <Button
                    onClick={() => navigate("/help")}
                    className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
                    data-testid="button-ask-lemlem"
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Lemlem
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Access Section */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">Quick Access</CardTitle>
              <CardDescription>Jump to important sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/lemlem-insights")}
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                  data-testid="button-lemlem-insights"
                >
                  <Sparkles className="h-6 w-6 text-amber-600" />
                  <span className="font-medium">Lemlem AI Insights</span>
                  <span className="text-xs text-gray-500">View AI analytics</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/lemlem-ops")}
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                  data-testid="button-lemlem-ops"
                >
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  <span className="font-medium">Lemlem Operations</span>
                  <span className="text-xs text-gray-500">Intelligence hub</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/ai-control")}
                  className="h-auto py-4 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  data-testid="button-ai-control"
                >
                  <Shield className="h-6 w-6 text-blue-600" />
                  <span className="font-medium">AI Controls</span>
                  <span className="text-xs text-gray-500">Settings & budget</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
