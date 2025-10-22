import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Calendar, MapPin, DollarSign, Star, TrendingUp } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

type ServiceProvider = {
  id: number;
  userId: string;
  businessName: string;
  serviceType: string;
  description: string;
  city: string;
  region: string;
  pricingModel: string;
  basePrice: string;
  verificationStatus: string;
  rejectionReason?: string;
  rating: string;
  totalJobsCompleted: number;
  createdAt: string;
};

type ServiceBooking = {
  id: number;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalPrice: string;
  propertyLocation: string;
};

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch provider profile
  const { data: provider, isLoading: providerLoading } = useQuery<ServiceProvider>({
    queryKey: ['/api/my-provider-profile'],
    enabled: !!user,
  });

  // Fetch provider bookings
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery<ServiceBooking[]>({
    queryKey: ['/api/my-provider-bookings'],
    enabled: !!user && provider?.verificationStatus === 'verified',
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-[#faf5f0]">
        <Header />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-eth-brown">Please Sign In</h2>
            <p className="text-eth-brown/70 mb-6">You need to sign in to view your provider dashboard.</p>
            <Button onClick={() => setLocation("/login")} className="bg-eth-brown hover:bg-eth-brown/90">
              Sign In
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (providerLoading) {
    return (
      <div className="min-h-screen bg-[#faf5f0]">
        <Header />
        <div className="pt-32 pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-eth-brown mx-auto mb-4"></div>
            <p className="text-eth-brown/70">Loading your dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-[#faf5f0]">
        <Header />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-eth-brown">Not a Service Provider</h2>
            <p className="text-eth-brown/70 mb-6">You haven't applied to become a service provider yet.</p>
            <Button onClick={() => setLocation("/become-provider")} className="bg-eth-brown hover:bg-eth-brown/90">
              Become a Provider
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Pending Status View
  if (provider.verificationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-[#faf5f0]">
        <Header />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
                <CardTitle className="text-3xl text-eth-brown mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Application Under Review
                </CardTitle>
                <p className="text-eth-brown/70 text-lg">
                  Your application is being reviewed by our team
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-[#faf5f0] rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#e5ddd5] pb-3">
                    <span className="text-eth-brown/70">Business Name</span>
                    <span className="font-semibold text-eth-brown" data-testid="text-business-name">{provider.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#e5ddd5] pb-3">
                    <span className="text-eth-brown/70">Service Type</span>
                    <span className="font-semibold text-eth-brown" data-testid="text-service-type">
                      {provider.serviceType.charAt(0).toUpperCase() + provider.serviceType.slice(1).replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#e5ddd5] pb-3">
                    <span className="text-eth-brown/70">Location</span>
                    <span className="font-semibold text-eth-brown" data-testid="text-location">{provider.city}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-eth-brown/70">Status</span>
                    <Badge className="bg-yellow-100 text-yellow-800" data-testid="status-pending">
                      <Clock className="h-3 w-3 mr-1" />
                      Pending Review
                    </Badge>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>⏱️ What happens next?</strong><br />
                    Our team typically reviews applications within 24 hours. You'll receive an email notification once your application has been reviewed.
                  </p>
                </div>

                <div className="text-center pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/my-alga")}
                    data-testid="button-back-dashboard"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Rejected Status View
  if (provider.verificationStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-[#faf5f0]">
        <Header />
        <div className="pt-32 pb-20 px-6">
          <div className="max-w-2xl mx-auto">
            <Card className="border-0 shadow-xl bg-white">
              <CardHeader className="text-center pb-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <CardTitle className="text-3xl text-eth-brown mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  Application Not Approved
                </CardTitle>
                <p className="text-eth-brown/70 text-lg">
                  Unfortunately, we couldn't approve your application at this time
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {provider.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-2">Reason for rejection:</p>
                    <p className="text-sm text-red-800" data-testid="text-rejection-reason">{provider.rejectionReason}</p>
                  </div>
                )}

                <div className="bg-[#faf5f0] rounded-lg p-6 space-y-4">
                  <div className="flex justify-between items-center border-b border-[#e5ddd5] pb-3">
                    <span className="text-eth-brown/70">Business Name</span>
                    <span className="font-semibold text-eth-brown">{provider.businessName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-eth-brown/70">Service Type</span>
                    <span className="font-semibold text-eth-brown">
                      {provider.serviceType.charAt(0).toUpperCase() + provider.serviceType.slice(1).replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>💡 What you can do:</strong><br />
                    You can submit a new application after addressing the concerns mentioned above. We're here to help you succeed!
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation("/my-alga")}
                    className="flex-1"
                    data-testid="button-back-dashboard"
                  >
                    Back to Dashboard
                  </Button>
                  <Button 
                    onClick={() => setLocation("/become-provider")}
                    className="flex-1 bg-eth-brown hover:bg-eth-brown/90"
                    data-testid="button-reapply"
                  >
                    Reapply
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Verified/Approved Status View - Full Dashboard
  return (
    <div className="min-h-screen bg-[#faf5f0]">
      <Header />
      <div className="pt-24 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-[#e5ddd5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-eth-brown mb-2" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                  {provider.businessName}
                </h1>
                <p className="text-eth-brown/70 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {provider.city}, {provider.region}
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800" data-testid="status-verified">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Provider
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-eth-brown/70 mb-1">Total Jobs</p>
                    <p className="text-3xl font-bold text-eth-brown" data-testid="text-total-jobs">{provider.totalJobsCompleted}</p>
                  </div>
                  <div className="w-12 h-12 bg-eth-brown/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-eth-brown" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-eth-brown/70 mb-1">Rating</p>
                    <p className="text-3xl font-bold text-eth-brown flex items-center gap-1" data-testid="text-rating">
                      {parseFloat(provider.rating).toFixed(1)} <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-eth-brown/70 mb-1">Active Bookings</p>
                    <p className="text-3xl font-bold text-eth-brown" data-testid="text-active-bookings">
                      {bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress').length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-eth-brown/70 mb-1">Hourly Rate</p>
                    <p className="text-3xl font-bold text-eth-brown" data-testid="text-hourly-rate">{provider.basePrice} ETB</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="border-0 shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-eth-brown" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>
                Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eth-brown mx-auto"></div>
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-eth-brown/30" />
                  <p className="text-eth-brown/70">No bookings yet</p>
                  <p className="text-sm text-eth-brown/50 mt-2">You'll see your upcoming jobs here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.slice(0, 5).map((booking) => (
                    <div 
                      key={booking.id} 
                      className="flex items-center justify-between p-4 bg-[#faf5f0] rounded-lg hover:bg-[#f5ece3] transition-colors"
                      data-testid={`card-booking-${booking.id}`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-eth-brown">
                          {booking.serviceType.charAt(0).toUpperCase() + booking.serviceType.slice(1).replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm text-eth-brown/70 flex items-center gap-4 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(booking.scheduledDate).toLocaleDateString()}
                          </span>
                          {booking.scheduledTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {booking.scheduledTime}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.propertyLocation}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-eth-brown">{booking.totalPrice} ETB</p>
                        <Badge 
                          variant="outline"
                          className={
                            booking.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            booking.status === 'in_progress' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            booking.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }
                        >
                          {booking.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
