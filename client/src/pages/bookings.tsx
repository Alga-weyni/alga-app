import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { type Booking } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";

export default function Bookings() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
        <Card className="max-w-md w-full mx-4" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
          <CardContent className="p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: "#8a6e4b" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>
              My Trips
            </h2>
            <p className="text-base mb-6" style={{ color: "#5a4a42" }}>
              Please sign in to view your bookings
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

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString()} ETB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Trips</h1>
          <p className="text-muted-foreground">View and manage your stays</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg h-32"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No trips yet</h3>
              <p className="text-muted-foreground mb-6">
                Start exploring and book your first stay!
              </p>
              <Button asChild>
                <Link to="/properties" data-testid="button-browse-properties">
                  Browse Properties
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="hover:shadow-lg transition-shadow" data-testid={`card-booking-${booking.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground" data-testid={`text-booking-id-${booking.id}`}>
                            Booking #{booking.id}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span data-testid={`text-dates-${booking.id}`}>
                                {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span data-testid={`text-guests-${booking.id}`}>{booking.guests} guests</span>
                            </div>
                          </div>
                        </div>
                        <Badge 
                          className={`${getStatusColor(booking.status)} border`}
                          data-testid={`badge-status-${booking.id}`}
                        >
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div>
                          <p className="text-2xl font-bold text-foreground" data-testid={`text-price-${booking.id}`}>
                            {formatPrice(booking.totalPrice)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Payment: <span className="font-medium">{booking.paymentStatus}</span>
                          </p>
                        </div>
                        <Button variant="outline" asChild>
                          <Link to={`/bookings/${booking.id}`} className="flex items-center gap-2" data-testid={`button-view-details-${booking.id}`}>
                            View Details
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
