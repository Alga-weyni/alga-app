import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Bell, Mail, MessageSquare, Calendar } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function NotificationsSettings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [bookingUpdates, setBookingUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [reminders, setReminders] = useState(true);

  if (!user) {
    navigate("/");
    return null;
  }

  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      <div className="border-b" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate("/profile")}
            data-testid="button-back-profile"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
          <div className="flex items-center gap-3">
            <Bell className="w-8 h-8" style={{ color: "#2d1405" }} />
            <div>
              <h1 className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                Notifications
              </h1>
              <p style={{ color: "#5a4a42" }}>
                Manage how you receive updates and alerts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Card style={{ background: "#fff" }} data-testid="card-notification-channels">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>Notification Channels</CardTitle>
            <CardDescription>Choose how you want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5" style={{ color: "#5a4a42" }} />
                <Label htmlFor="email-notifications" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium" style={{ color: "#2d1405" }}>Email Notifications</span>
                  <span className="text-sm text-muted-foreground">Receive updates via email</span>
                </Label>
              </div>
              <Switch
                id="email-notifications"
                checked={emailNotifications}
                onCheckedChange={setEmailNotifications}
                data-testid="switch-email-notifications"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" style={{ color: "#5a4a42" }} />
                <Label htmlFor="sms-notifications" className="flex flex-col gap-1 cursor-pointer">
                  <span className="font-medium" style={{ color: "#2d1405" }}>SMS Notifications</span>
                  <span className="text-sm text-muted-foreground">Receive updates via text message</span>
                </Label>
              </div>
              <Switch
                id="sms-notifications"
                checked={smsNotifications}
                onCheckedChange={setSmsNotifications}
                data-testid="switch-sms-notifications"
              />
            </div>
          </CardContent>
        </Card>

        <Card style={{ background: "#fff" }} data-testid="card-notification-types">
          <CardHeader>
            <CardTitle style={{ color: "#2d1405" }}>What to Notify Me About</CardTitle>
            <CardDescription>Select the types of updates you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="booking-updates" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium" style={{ color: "#2d1405" }}>Booking Updates</span>
                <span className="text-sm text-muted-foreground">
                  Confirmations, cancellations, and status changes
                </span>
              </Label>
              <Switch
                id="booking-updates"
                checked={bookingUpdates}
                onCheckedChange={setBookingUpdates}
                data-testid="switch-booking-updates"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reminders" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium" style={{ color: "#2d1405" }}>Reminders</span>
                <span className="text-sm text-muted-foreground">
                  Check-in reminders and upcoming trip alerts
                </span>
              </Label>
              <Switch
                id="reminders"
                checked={reminders}
                onCheckedChange={setReminders}
                data-testid="switch-reminders"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="promotions" className="flex flex-col gap-1 cursor-pointer">
                <span className="font-medium" style={{ color: "#2d1405" }}>Promotions & Offers</span>
                <span className="text-sm text-muted-foreground">
                  Special deals and exclusive offers
                </span>
              </Label>
              <Switch
                id="promotions"
                checked={promotions}
                onCheckedChange={setPromotions}
                data-testid="switch-promotions"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} data-testid="button-save-notifications">
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
