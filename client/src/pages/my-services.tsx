import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, DollarSign, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ServiceBooking } from "@shared/schema";
import { format } from "date-fns";
import { useState } from "react";
import ServiceReviewForm from "@/components/service-review-form";

// Extended type to include runtime-added hasReviewed field from backend
type ServiceBookingWithReview = ServiceBooking & {
  hasReviewed?: boolean;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
};

export default function MyServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<ServiceBookingWithReview | null>(null);

  const { data: serviceBookings, isLoading } = useQuery<ServiceBookingWithReview[]>({
    queryKey: ["/api/my-service-bookings"],
    enabled: !!user,
  });

  const handleReviewClick = (booking: ServiceBookingWithReview) => {
    setSelectedBooking(booking);
    setReviewModalOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf5f0" }}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>Please Sign In</h2>
          <p className="mb-4" style={{ color: "#5a4a42" }}>You need to sign in to view your services.</p>
          <Button onClick={() => navigate("/login")}>Sign In</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#faf5f0" }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#2d1405" }}></div>
          <p style={{ color: "#5a4a42" }}>Loading your services...</p>
        </div>
      </div>
    );
  }

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
            My Services
          </h1>
          <p style={{ color: "#5a4a42" }}>
            {serviceBookings?.length || 0} service bookings
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!serviceBookings || serviceBookings.length === 0 ? (
          <Card style={{ background: "#fff" }}>
            <CardContent className="py-16 text-center">
              <Clock className="w-16 h-16 mx-auto mb-4" style={{ color: "#2d1405", opacity: 0.3 }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: "#2d1405" }}>
                No Services Yet
              </h3>
              <p className="mb-6" style={{ color: "#5a4a42" }}>
                You haven't booked any services yet.
              </p>
              <Link to="/services">
                <Button data-testid="button-browse-services">
                  Browse Services
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {serviceBookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="hover:shadow-md transition-shadow"
                style={{ background: "#fff" }}
                data-testid={`card-service-booking-${booking.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl mb-1" style={{ color: "#2d1405" }}>
                        {booking.serviceType.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </CardTitle>
                      <p className="text-sm" style={{ color: "#5a4a42" }}>
                        Booking #{booking.id}
                      </p>
                    </div>
                    <Badge className={statusColors[booking.status]}>
                      {booking.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm" style={{ color: "#5a4a42" }}>
                        <Calendar className="w-4 h-4" />
                        <span>
                          {format(new Date(booking.scheduledDate), "MMMM d, yyyy")}
                          {booking.scheduledTime && ` at ${booking.scheduledTime}`}
                        </span>
                      </div>
                      {booking.propertyLocation && (
                        <div className="flex items-center gap-2 text-sm" style={{ color: "#5a4a42" }}>
                          <MapPin className="w-4 h-4" />
                          <span>{booking.propertyLocation}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:text-right">
                      <div className="flex md:justify-end items-center gap-2 text-sm" style={{ color: "#5a4a42" }}>
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold" style={{ color: "#2d1405" }}>
                          ETB {parseFloat(booking.totalPrice).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-sm" style={{ color: "#5a4a42" }}>
                        Payment: {booking.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {booking.specialInstructions && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "#e5d9ce" }}>
                      <p className="text-sm font-medium mb-1" style={{ color: "#2d1405" }}>
                        Special Instructions:
                      </p>
                      <p className="text-sm" style={{ color: "#5a4a42" }}>
                        {booking.specialInstructions}
                      </p>
                    </div>
                  )}

                  {/* Review Button for Completed Services */}
                  {booking.status === "completed" && !booking.hasReviewed && (
                    <div className="mt-4 pt-4 border-t" style={{ borderColor: "#e5d9ce" }}>
                      <Button
                        onClick={() => handleReviewClick(booking)}
                        className="w-full sm:w-auto"
                        variant="outline"
                        data-testid={`button-review-${booking.id}`}
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Write a Review
                      </Button>
                    </div>
                  )}

                  {/* Already Reviewed Badge */}
                  {booking.status === "completed" && booking.hasReviewed && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm" style={{ borderColor: "#e5d9ce", color: "#86a38f" }}>
                      <Star className="w-4 h-4 fill-current" />
                      <span>You reviewed this service</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Book More Services CTA */}
            <Card style={{ background: "#86a38f" }} className="border-0">
              <CardContent className="py-8 text-center">
                <h3 className="text-xl font-bold text-white mb-2">
                  Need More Services?
                </h3>
                <p className="text-white/90 mb-4">
                  Browse our marketplace for cleaning, repairs, transport, and more
                </p>
                <Link to="/services">
                  <Button 
                    variant="secondary"
                    className="bg-white hover:bg-gray-100"
                    data-testid="button-book-more-services"
                  >
                    Browse All Services
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedBooking && (
        <ServiceReviewForm
          open={reviewModalOpen}
          onOpenChange={setReviewModalOpen}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}
