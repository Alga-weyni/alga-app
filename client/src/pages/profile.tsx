import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
  XCircle
} from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      {/* Header */}
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/my-alga">
            <Button variant="ghost" className="mb-4" data-testid="button-back-my-alga">
              <ArrowLeft className="w-4 h-4 mr-2" />
              My Alga
            </Button>
          </Link>
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

            {/* Settings Sections */}
            <Card style={{ background: "#fff" }} data-testid="card-settings">
              <CardHeader>
                <CardTitle style={{ color: "#2d1405" }}>Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-notifications"
                  onClick={() => navigate("/settings/notifications")}
                >
                  <Bell className="w-4 h-4 mr-3" />
                  Notifications
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-security"
                  onClick={() => navigate("/settings/security")}
                >
                  <Lock className="w-4 h-4 mr-3" />
                  Security & Privacy
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-payments"
                  onClick={() => navigate("/settings/payment")}
                >
                  <CreditCard className="w-4 h-4 mr-3" />
                  Payment Methods
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  data-testid="button-language"
                  onClick={() => navigate("/settings/language")}
                >
                  <Globe className="w-4 h-4 mr-3" />
                  Language & Region
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
