import { useParams, Link, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Star, MapPin, DollarSign, Calendar, ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import type { ServiceProvider } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function ServiceProviderDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [location, setLocationInput] = useState("");
  const [instructions, setInstructions] = useState("");

  const { data: provider, isLoading } = useQuery<ServiceProvider>({
    queryKey: ["/api/service-providers", id],
    enabled: !!id
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("/api/service-bookings", "POST", bookingData);
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful!",
        description: "Your service request has been submitted. The provider will confirm shortly.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/my-service-bookings"] });
      setLocation("/my-alga");
    },
    onError: (error: Error) => {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please Sign In",
        description: "You need to be signed in to book a service.",
        variant: "destructive",
      });
      setLocation("/login");
      return;
    }

    if (!scheduledDate || !scheduledTime || !location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!provider) return;

    const totalPrice = parseFloat(provider.basePrice);
    const algaCommission = totalPrice * 0.15; // 15%
    const providerPayout = totalPrice * 0.85; // 85%

    bookingMutation.mutate({
      serviceProviderId: provider.id,
      serviceType: provider.serviceType,
      scheduledDate: new Date(scheduledDate).toISOString(),
      scheduledTime,
      propertyLocation: location,
      totalPrice: totalPrice.toString(),
      algaCommission: algaCommission.toFixed(2),
      providerPayout: providerPayout.toFixed(2),
      specialInstructions: instructions || undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf5f0" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#2d1405" }}></div>
          <p style={{ color: "#5a4a42" }}>Loading provider details...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf5f0" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>Provider Not Found</h2>
          <p className="mb-4" style={{ color: "#5a4a42" }}>This service provider doesn't exist or has been removed.</p>
          <Link href="/services">
            <Button>Browse Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#faf5f0" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/services/${provider.serviceType}`}>
          <Button variant="ghost" className="mb-6" data-testid="button-back-category">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {provider.serviceType}
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Provider Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card style={{ background: "#fff" }}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2" style={{ color: "#2d1405" }}>
                      {provider.businessName}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm" style={{ color: "#5a4a42" }}>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {provider.city}, {provider.region}
                      </div>
                      {provider.rating && parseFloat(provider.rating) > 0 && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-current" style={{ color: "#d4af37" }} />
                          <span className="font-medium">{parseFloat(provider.rating).toFixed(1)}</span>
                          {(provider.totalJobsCompleted || 0) > 0 && (
                            <span className="text-xs">({provider.totalJobsCompleted} jobs)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {provider.verificationStatus === "approved" && (
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium" style={{ background: "#86a38f", color: "#fff" }}>
                      <CheckCircle2 className="w-4 h-4" />
                      Verified
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>About</h3>
                  <p style={{ color: "#5a4a42" }}>{provider.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Pricing</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold" style={{ color: "#2d1405" }}>
                      ETB {parseFloat(provider.basePrice).toFixed(0)}
                    </span>
                    <span style={{ color: "#5a4a42" }}>
                      / {provider.pricingModel === "hourly" ? "hour" : "service"}
                    </span>
                  </div>
                  <p className="text-sm mt-2" style={{ color: "#5a4a42" }}>
                    Final price may vary based on service requirements
                  </p>
                </div>

                {provider.address && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: "#2d1405" }}>Service Area</h3>
                    <p style={{ color: "#5a4a42" }}>{provider.address}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4" style={{ background: "#fff" }}>
              <CardHeader>
                <CardTitle style={{ color: "#2d1405" }}>Book This Service</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="date" style={{ color: "#2d1405" }}>Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    data-testid="input-booking-date"
                  />
                </div>

                <div>
                  <Label htmlFor="time" style={{ color: "#2d1405" }}>Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    required
                    data-testid="input-booking-time"
                  />
                </div>

                <div>
                  <Label htmlFor="location" style={{ color: "#2d1405" }}>Location *</Label>
                  <Input
                    id="location"
                    type="text"
                    placeholder="City or address"
                    value={location}
                    onChange={(e) => setLocationInput(e.target.value)}
                    required
                    data-testid="input-booking-location"
                  />
                </div>

                <div>
                  <Label htmlFor="instructions" style={{ color: "#2d1405" }}>Special Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="Any specific requirements..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={3}
                    data-testid="textarea-booking-instructions"
                  />
                </div>

                <div className="pt-4 border-t" style={{ borderColor: "#e5d9ce" }}>
                  <div className="flex justify-between text-sm mb-2">
                    <span style={{ color: "#5a4a42" }}>Service Fee</span>
                    <span className="font-medium" style={{ color: "#2d1405" }}>
                      ETB {parseFloat(provider.basePrice).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-3" style={{ color: "#5a4a42" }}>
                    <span>Alga Commission (15%)</span>
                    <span>ETB {(parseFloat(provider.basePrice) * 0.15).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span style={{ color: "#2d1405" }}>Total</span>
                    <span style={{ color: "#2d1405" }}>
                      ETB {parseFloat(provider.basePrice).toFixed(2)}
                    </span>
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={bookingMutation.isPending}
                    className="w-full"
                    style={{ background: "#2d1405" }}
                    data-testid="button-book-now"
                  >
                    {bookingMutation.isPending ? "Booking..." : "Book Now"}
                  </Button>

                  <p className="text-xs text-center mt-3" style={{ color: "#5a4a42" }}>
                    Provider will confirm within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
