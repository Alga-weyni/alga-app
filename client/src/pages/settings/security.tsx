import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock, Shield, Eye, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

export default function SecuritySettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  if (!user) {
    navigate("/");
    return null;
  }

  const handleChangePassword = () => {
    toast({
      title: "Change Password",
      description: "Password change feature coming soon.",
    });
  };

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your security preferences have been updated.",
    });
  };

  return (
    <>
      <Header />
      <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/settings")}
            data-testid="button-back-settings"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Settings
          </Button>
          <div className="flex items-center gap-3">
            <Lock className="w-8 h-8" style={{ color: "#2d1405" }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                Security & Privacy
              </h1>
              <p style={{ color: "#5a4a42" }}>
                Keep your account secure and manage your privacy
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card style={{ background: "#fff" }} data-testid="card-authentication">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Authentication</CardTitle>
            <CardDescription>Manage your login credentials</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium" style={{ color: "#2d1405" }}>Password</p>
                <p className="text-sm text-muted-foreground">
                  Last changed: Never (OTP login)
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={handleChangePassword}
                data-testid="button-change-password"
              >
                Set Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5" style={{ color: "#5a4a42" }} />
                <div>
                  <p className="font-medium" style={{ color: "#2d1405" }}>Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add extra layer of security
                  </p>
                </div>
              </div>
              <Switch
                id="two-factor"
                checked={twoFactorEnabled}
                onCheckedChange={setTwoFactorEnabled}
                data-testid="switch-two-factor"
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }} data-testid="card-login-activity">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Login Activity</CardTitle>
            <CardDescription>Monitor account access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5" style={{ color: "#5a4a42" }} />
                <Label htmlFor="login-alerts" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium" style={{ color: "#2d1405" }}>Login Alerts</span>
                  <span className="text-sm text-muted-foreground">
                    Get notified of new logins to your account
                  </span>
                </Label>
              </div>
              <Switch
                id="login-alerts"
                checked={loginAlerts}
                onCheckedChange={setLoginAlerts}
                data-testid="switch-login-alerts"
              />
            </div>

            <Button variant="outline" className="w-full" data-testid="button-view-login-history">
              <Eye className="w-4 h-4 mr-2" />
              View Login History
            </Button>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }} data-testid="card-privacy">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Privacy</CardTitle>
            <CardDescription>Control your data and visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full" data-testid="button-download-data">
              Download My Data
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              data-testid="button-delete-account"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} data-testid="button-save-security">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
