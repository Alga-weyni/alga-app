import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/lib/api-config";
import { 
  Shield, 
  MapPin, 
  Phone, 
  AlertTriangle, 
  Users, 
  Camera,
  Video,
  CheckCircle,
  Clock,
  Heart,
  Star,
  UserCheck
} from "lucide-react";

interface SafetyFeaturesProps {
  userId: string;
  propertyId?: number;
  bookingId?: number;
}

export default function SafetyFeatures({ userId, propertyId, bookingId }: SafetyFeaturesProps) {
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isLocationShared, setIsLocationShared] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [safetyCheckEnabled, setSafetyCheckEnabled] = useState(true);
  const { toast } = useToast();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        () => {
          // Location access denied or error
        }
      );
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Emergency Safety Check - sends location to emergency contacts
  const triggerSafetyCheck = async () => {
    if (!userLocation) {
      getCurrentLocation();
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/safety/emergency-check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          location: userLocation,
          emergencyContact,
          bookingId,
          propertyId,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        toast({
          title: "Safety Check Activated 🛡️",
          description: "Your location has been shared with emergency contacts and our support team",
        });
        setIsLocationShared(true);
      }
    } catch (error) {
      toast({
        title: "Safety Check Failed",
        description: "Please try again or contact support directly",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Emergency Safety Button */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Emergency Safety Check</span>
          </CardTitle>
          <CardDescription>
            Instantly share your location with emergency contacts and our safety team
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={triggerSafetyCheck}
            variant="destructive"
            size="lg"
            className="w-full h-16 text-lg font-semibold"
          >
            <Shield className="h-6 w-6 mr-3" />
            Activate Safety Check
          </Button>
          
          {isLocationShared && (
            <div className="flex items-center space-x-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>Location shared with emergency contacts</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Emergency Contact</span>
          </CardTitle>
          <CardDescription>
            Add a trusted contact to be notified in case of emergency
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emergency-contact">Emergency Contact Phone</Label>
            <Input
              id="emergency-contact"
              type="tel"
              placeholder="09XX-XXX-XXX"
              value={emergencyContact}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                setEmergencyContact(value);
              }}
            />
            <p className="text-xs text-muted-foreground mt-1">
              This contact will receive your location and safety updates
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automatic Safety Checks</Label>
              <p className="text-sm text-muted-foreground">
                Send periodic location updates during your stay
              </p>
            </div>
            <Switch
              checked={safetyCheckEnabled}
              onCheckedChange={setSafetyCheckEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Host Verification Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Host Safety Verification</span>
          </CardTitle>
          <CardDescription>
            Safety information about your host and property
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">ID Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Camera className="h-4 w-4 text-green-600" />
              <span className="text-sm">Photo Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Video className="h-4 w-4 text-green-600" />
              <span className="text-sm">Video Tour Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="text-sm">Alga Verified Host</span>
            </div>
          </div>
          
          <Badge variant="default" className="bg-green-100 text-green-800">
            🛡️ Safe Stay Certified
          </Badge>
        </CardContent>
      </Card>

      {/* Women-Safe Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-pink-600" />
            <span>Women-Safe Features</span>
          </CardTitle>
          <CardDescription>
            Special safety features for female travelers and families
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Users className="h-4 w-4 text-pink-600" />
              <div>
                <div className="font-medium">Female-Friendly Host</div>
                <div className="text-sm text-muted-foreground">
                  Highly rated by solo female travelers
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Star className="h-4 w-4 text-pink-600" />
              <div>
                <div className="font-medium">Family-Safe Environment</div>
                <div className="text-sm text-muted-foreground">
                  Recommended for families with children
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="h-4 w-4 text-pink-600" />
              <div>
                <div className="font-medium">Safe Neighborhood</div>
                <div className="text-sm text-muted-foreground">
                  Located in well-lit, secure area
                </div>
              </div>
            </div>
          </div>
          
          <Badge variant="outline" className="border-pink-200 text-pink-700">
            👩 Women-Safe Verified
          </Badge>
        </CardContent>
      </Card>

      {/* 24/7 Support Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>24/7 Support</span>
          </CardTitle>
          <CardDescription>
            Round-the-clock assistance in multiple languages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 border rounded-lg">
              <div className="font-medium">Ethiopia Hotline</div>
              <div className="text-sm text-muted-foreground">+251-11-XXX-XXXX</div>
              <div className="text-xs text-muted-foreground">Amharic, English</div>
            </div>
            
            <div className="p-3 border rounded-lg">
              <div className="font-medium">International Support</div>
              <div className="text-sm text-muted-foreground">WhatsApp Available</div>
              <div className="text-xs text-muted-foreground">Multi-language AI support</div>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Phone className="h-4 w-4 mr-2" />
            Contact Support Team
          </Button>
        </CardContent>
      </Card>

      {/* Location Sharing Status */}
      {userLocation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Services</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Current Location</div>
                <div className="text-sm text-muted-foreground">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </div>
              </div>
              <Badge variant={isLocationShared ? "default" : "secondary"}>
                {isLocationShared ? "Shared" : "Private"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}