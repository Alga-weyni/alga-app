import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Edit, 
  Bell, 
  Lock, 
  CreditCard,
  Globe,
  CheckCircle,
  XCircle,
  Settings,
  Activity,
  Home
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phoneNumber: ""
  });

  // Fetch full profile with preferences and activity
  const { data: fullProfile } = useQuery<any>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf5f0" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>Please Sign In</h2>
          <p className="mb-4" style={{ color: "#5a4a42" }}>You need to sign in to view your profile.</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    return `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase() || "U";
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "host":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "operator":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  const openEditDialog = () => {
    setEditForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      phoneNumber: user.phoneNumber || ""
    });
    setEditDialogOpen(true);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      return await apiRequest("PUT", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "✅ Profile Updated",
        description: "Your profile has been successfully updated"
      });
      setEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive"
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      return await apiRequest("POST", '/api/profile/preferences', preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "✅ Preferences saved!",
        description: "Your preferences have been updated.",
      });
    },
  });

  const handlePreferenceChange = (key: string, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const preferences = fullProfile?.preferences || {};
  const recentActivity = fullProfile?.recentActivity || [];

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/my-alga")}
            data-testid="button-back-my-alga"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            My Alga
          </Button>
          <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
            Profile & Settings
          </h1>
          <p style={{ color: "#5a4a42" }}>
            Manage your information, preferences, and account settings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1" style={{ background: "#fff" }} data-testid="card-profile-info">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={user.profileImageUrl || ""} />
                  <AvatarFallback 
                    className="text-2xl text-white font-bold"
                    style={{ background: "#2d1405" }}
                  >
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-2xl" style={{ color: "#2d1405" }}>
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 mt-2">
                <Badge className={getRoleColor(user.role)}>
                  {user.role.toUpperCase()}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {user.bio && (
                <div>
                  <p className="text-sm" style={{ color: "#5a4a42" }}>
                    {user.bio}
                  </p>
                </div>
              )}
              <Button 
                className="w-full"
                variant="outline"
                onClick={openEditDialog}
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Account Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card style={{ background: "#fff" }} data-testid="card-contact-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
                <CardDescription>Your contact details and verification status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" style={{ color: "#5a4a42" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2d1405" }}>Email</p>
                      <p className="text-sm" style={{ color: "#5a4a42" }}>{user.email || "Not provided"}</p>
                    </div>
                  </div>
                  {user.email && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" style={{ color: "#5a4a42" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2d1405" }}>Phone Number</p>
                      <p className="text-sm" style={{ color: "#5a4a42" }}>{user.phoneNumber || "Not provided"}</p>
                    </div>
                  </div>
                  {user.phoneVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card style={{ background: "#fff" }} data-testid="card-verification">
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{ color: "#2d1405" }}>
                  <Shield className="w-5 h-5" />
                  Verification & Security
                </CardTitle>
                <CardDescription>Your identity verification and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" style={{ color: "#5a4a42" }} />
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#2d1405" }}>ID Verification</p>
                      <p className="text-sm" style={{ color: "#5a4a42" }}>
                        {user.idVerified ? "Verified" : "Not verified"}
                      </p>
                    </div>
                  </div>
                  {user.idVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Button variant="outline" size="sm" data-testid="button-verify-id">
                      Verify Now
                    </Button>
                  )}
                </div>

                {user.faydaVerified && (
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Fayda ID Verified
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          National Digital Identity verified
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs for Preferences and Activity */}
            <Tabs defaultValue="settings" className="space-y-6">
              <TabsList className="bg-white border border-[#CD7F32]/20">
                <TabsTrigger value="settings" data-testid="tab-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
                <TabsTrigger value="preferences" data-testid="tab-preferences">
                  <Bell className="w-4 h-4 mr-2" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="activity" data-testid="tab-activity">
                  <Activity className="w-4 h-4 mr-2" />
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card style={{ background: "#fff" }} data-testid="card-settings">
                  <CardHeader>
                    <CardTitle style={{ color: "#2d1405" }}>Quick Settings</CardTitle>
                    <CardDescription>Access your account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button 
                      className="w-full mb-2" 
                      onClick={() => navigate("/settings")}
                      data-testid="button-all-settings"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      View All Settings
                    </Button>
                    
                    <div className="border-t pt-2 mt-2 space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start hover:bg-gray-100"
                        data-testid="button-notifications"
                        onClick={() => navigate("/settings/notifications")}
                      >
                        <Bell className="w-4 h-4 mr-3" />
                        Notifications
                      </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start hover:bg-gray-100"
                      data-testid="button-security"
                      onClick={() => navigate("/settings/security")}
                    >
                      <Lock className="w-4 h-4 mr-3" />
                      Security & Privacy
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start hover:bg-gray-100"
                      data-testid="button-payments"
                      onClick={() => navigate("/settings/payment")}
                    >
                      <CreditCard className="w-4 h-4 mr-3" />
                      Payment Methods
                    </Button>
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start hover:bg-gray-100"
                        data-testid="button-language"
                        onClick={() => navigate("/settings/language")}
                      >
                        <Globe className="w-4 h-4 mr-3" />
                        Language & Region
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences">
                <div className="space-y-6">
                  <Card style={{ background: "#fff" }}>
                    <CardHeader>
                      <CardTitle style={{ color: "#2d1405" }}>Notification Preferences</CardTitle>
                      <CardDescription>Choose how you want to be notified</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label style={{ color: "#2d1405" }}>Email Notifications</Label>
                          <p className="text-sm" style={{ color: "#5a4a42" }}>Receive booking updates via email</p>
                        </div>
                        <Switch
                          checked={preferences.emailNotifications ?? true}
                          onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                          data-testid="switch-email-notifications"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label style={{ color: "#2d1405" }}>SMS Notifications</Label>
                          <p className="text-sm" style={{ color: "#5a4a42" }}>Get booking confirmations via SMS</p>
                        </div>
                        <Switch
                          checked={preferences.smsNotifications ?? true}
                          onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
                          data-testid="switch-sms-notifications"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label style={{ color: "#2d1405" }}>Marketing Updates</Label>
                          <p className="text-sm" style={{ color: "#5a4a42" }}>Receive special offers and news</p>
                        </div>
                        <Switch
                          checked={preferences.marketingEmails ?? false}
                          onCheckedChange={(checked) => handlePreferenceChange('marketingEmails', checked)}
                          data-testid="switch-marketing"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card style={{ background: "#fff" }}>
                    <CardHeader>
                      <CardTitle style={{ color: "#2d1405" }}>Display Preferences</CardTitle>
                      <CardDescription>Customize how you see Alga</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label style={{ color: "#2d1405" }}>Preferred Language</Label>
                        <Select
                          value={preferences.language || 'en'}
                          onValueChange={(value) => handlePreferenceChange('language', value)}
                        >
                          <SelectTrigger className="border-[#CD7F32]/20" data-testid="select-language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="am">አማርኛ (Amharic)</SelectItem>
                            <SelectItem value="ti">ትግርኛ (Tigrinya)</SelectItem>
                            <SelectItem value="om">Afaan Oromoo (Oromo)</SelectItem>
                            <SelectItem value="zh">中文 (Chinese)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label style={{ color: "#2d1405" }}>Currency</Label>
                        <Select
                          value={preferences.currency || 'ETB'}
                          onValueChange={(value) => handlePreferenceChange('currency', value)}
                        >
                          <SelectTrigger className="border-[#CD7F32]/20" data-testid="select-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>

                  <Card style={{ background: "#fff" }}>
                    <CardHeader>
                      <CardTitle style={{ color: "#2d1405" }}>Search Preferences</CardTitle>
                      <CardDescription>Help us personalize your search results</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label style={{ color: "#2d1405" }}>Save Search History</Label>
                          <p className="text-sm" style={{ color: "#5a4a42" }}>Remember searches for better recommendations</p>
                        </div>
                        <Switch
                          checked={preferences.saveSearchHistory ?? true}
                          onCheckedChange={(checked) => handlePreferenceChange('saveSearchHistory', checked)}
                          data-testid="switch-save-search"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label style={{ color: "#2d1405" }}>Show Favorites First</Label>
                          <p className="text-sm" style={{ color: "#5a4a42" }}>Prioritize similar to your favorites</p>
                        </div>
                        <Switch
                          checked={preferences.showFavoritesFirst ?? false}
                          onCheckedChange={(checked) => handlePreferenceChange('showFavoritesFirst', checked)}
                          data-testid="switch-favorites-first"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <Card style={{ background: "#fff" }}>
                  <CardHeader>
                    <CardTitle style={{ color: "#2d1405" }}>Recent Activity</CardTitle>
                    <CardDescription>Your interactions on Alga</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {recentActivity && recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity: any, index: number) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 rounded-lg"
                            style={{ background: "#faf5f0", borderColor: "#CD7F32", borderWidth: "1px" }}
                            data-testid={`activity-${index}`}
                          >
                            <div className="mt-1">
                              {activity.action === 'viewed_property' && <Home className="w-4 h-4" style={{ color: "#CD7F32" }} />}
                              {activity.action === 'made_booking' && <CheckCircle className="w-4 h-4 text-green-600" />}
                              {activity.action === 'searched' && <Globe className="w-4 h-4 text-blue-600" />}
                              {activity.action === 'chatted_lemlem' && <User className="w-4 h-4 text-purple-600" />}
                              {!['viewed_property', 'made_booking', 'searched', 'chatted_lemlem'].includes(activity.action) && (
                                <Activity className="w-4 h-4" style={{ color: "#CD7F32" }} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: "#2d1405" }}>
                                {activity.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                              </p>
                              {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                <p className="text-xs mt-1" style={{ color: "#5a4a42" }}>
                                  {JSON.stringify(activity.metadata)}
                                </p>
                              )}
                              <p className="text-xs mt-1" style={{ color: "#8a7a72" }}>
                                {new Date(activity.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Activity className="w-12 h-12 mx-auto mb-3" style={{ color: "#CD7F32", opacity: 0.3 }} />
                        <p style={{ color: "#5a4a42" }}>No activity yet</p>
                        <p className="text-sm mt-1" style={{ color: "#8a7a72" }}>Start exploring properties to see your activity here</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" style={{ background: "#fff" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#2d1405" }}>Edit Profile</DialogTitle>
            <DialogDescription style={{ color: "#5a4a42" }}>
              Update your personal information
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" style={{ color: "#2d1405" }}>First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                  placeholder="Enter first name"
                  data-testid="input-firstname"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" style={{ color: "#2d1405" }}>Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                  placeholder="Enter last name"
                  data-testid="input-lastname"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" style={{ color: "#2d1405" }}>Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={editForm.phoneNumber}
                maxLength={10}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                  setEditForm({ ...editForm, phoneNumber: value });
                }}
                placeholder="091 234 5678"
                data-testid="input-phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" style={{ color: "#2d1405" }}>Bio</Label>
              <Textarea
                id="bio"
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
                data-testid="input-bio"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              data-testid="button-cancel-edit"
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateProfileMutation.mutate(editForm)}
              disabled={updateProfileMutation.isPending}
              style={{ background: "#2d1405" }}
              data-testid="button-save-profile"
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
