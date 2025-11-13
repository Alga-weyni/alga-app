import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const location = useLocation();
  const { toast } = useToast();

  // Get active tab from URL search params, default to 'me'
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'me';

  // Handle tab navigation
  const handleTabChange = (value: string) => {
    navigate(`/admin/dashboard?tab=${value}`);
  };

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
                Manage your profile and access Lemlem AI
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

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="me" data-testid="tab-me">
                <User className="h-4 w-4 mr-2" />
                Me
              </TabsTrigger>
              <TabsTrigger value="lemlem" data-testid="tab-lemlem">
                <Sparkles className="h-4 w-4 mr-2" />
                Ask Lemlem
              </TabsTrigger>
            </TabsList>

            {/* Me Tab */}
            <TabsContent value="me">
              <Card className="border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                    <User className="h-5 w-5" />
                    My Profile
                  </CardTitle>
                  <CardDescription>Your admin account information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
            </TabsContent>

            {/* Ask Lemlem Tab */}
            <TabsContent value="lemlem">
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
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
