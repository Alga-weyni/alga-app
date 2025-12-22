import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { type Booking, type Property } from "@shared/schema";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Calendar, MapPin, Users, Home, CreditCard, FileText, XCircle, ArrowLeft, Star, Download, Receipt } from "lucide-react";
import jsPDF from "jspdf";
import { ReviewDialog } from "@/components/review-dialog";

export default function BookingDetails() {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
        <Card className="max-w-md w-full mx-4" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
          <CardContent className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: "#8a6e4b" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>
              Booking Details
            </h2>
            <p className="text-base mb-6" style={{ color: "#5a4a42" }}>
              Please sign in to view booking details
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

  const { data: booking, isLoading } = useQuery<Booking>({
    queryKey: [`/api/bookings/${id}`],
    enabled: !!id,
  });

  const { data: property } = useQuery<Property>({
    queryKey: [`/api/properties/${booking?.propertyId}`],
    enabled: !!booking?.propertyId,
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/bookings/${id}/status`, { status: "cancelled" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${id}`] });
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Cancellation failed",
        description: "Unable to cancel booking. Please contact support.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
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

  const canCancel = booking?.status === "pending" || booking?.status === "confirmed";

  const generateReceipt = () => {
    if (!booking || !property) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(45, 20, 5); // Dark brown
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ALGA", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Payment Receipt", pageWidth / 2, 30, { align: "center" });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Transaction Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Transaction Details", 20, 55);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const startY = 65;
    const lineHeight = 8;
    
    const details = [
      ["Transaction ID:", booking.paymentRef || `ALG-${booking.id}-${new Date(booking.createdAt || Date.now()).getTime()}`],
      ["Date:", new Date(booking.createdAt || Date.now()).toLocaleString("en-US", { 
        dateStyle: "full", 
        timeStyle: "short" 
      })],
      ["Payment Method:", (booking.paymentMethod || "ArifPay").toUpperCase()],
      ["Payment Status:", booking.paymentStatus?.toUpperCase() || "PENDING"],
      ["Booking Status:", booking.status.toUpperCase()],
    ];
    
    details.forEach((row, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(row[0], 20, startY + (index * lineHeight));
      doc.setFont("helvetica", "normal");
      doc.text(row[1], 80, startY + (index * lineHeight));
    });
    
    // Property Details
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Property Details", 20, startY + 50);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const propY = startY + 60;
    
    const propDetails = [
      ["Property:", property.title],
      ["Location:", `${property.location}, ${property.city}`],
      ["Check-in:", formatDate(booking.checkIn)],
      ["Check-out:", formatDate(booking.checkOut)],
      ["Guests:", `${booking.guests} guest(s)`],
      ["Duration:", `${days} night(s)`],
    ];
    
    propDetails.forEach((row, index) => {
      doc.setFont("helvetica", "bold");
      doc.text(row[0], 20, propY + (index * lineHeight));
      doc.setFont("helvetica", "normal");
      doc.text(row[1], 80, propY + (index * lineHeight));
    });
    
    // Payment Summary
    doc.setFillColor(240, 240, 240);
    doc.rect(15, propY + 55, pageWidth - 30, 25, 'F');
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Total Amount Paid:", 20, propY + 70);
    doc.setFontSize(16);
    doc.text(`${parseFloat(booking.totalPrice).toLocaleString()} ETB`, pageWidth - 20, propY + 70, { align: "right" });
    
    // Footer
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text("Thank you for choosing Alga for your stay!", pageWidth / 2, propY + 95, { align: "center" });
    doc.text("For support, contact: support@alga.et", pageWidth / 2, propY + 102, { align: "center" });
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, propY + 109, { align: "center" });
    
    // Download
    doc.save(`Alga-Receipt-Booking-${booking.id}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">Booking not found</h3>
              <p className="text-muted-foreground mb-6">The booking you're looking for doesn't exist.</p>
              <Button onClick={() => navigate("/bookings")}>
                Back to Bookings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const days = Math.ceil(
    (new Date(booking.checkOut).getTime() - new Date(booking.checkIn).getTime()) /
    (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-booking-title">
              Booking #{booking.id}
            </h1>
            <Badge className={`${getStatusColor(booking.status)} border text-sm px-3 py-1`} data-testid="badge-booking-status">
              {booking.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Confirmation details and information</p>
        </div>

        <div className="space-y-6">
          {/* Property Information */}
          {property && (
            <Card data-testid="card-property-info">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-foreground" data-testid="text-property-title">
                    {property.title}
                  </h3>
                  <p className="text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-4 w-4" />
                    {property.location}, {property.city}
                  </p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Property Type</p>
                    <p className="font-medium text-foreground capitalize">{property.type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price per Night</p>
                    <p className="font-medium text-foreground">{formatPrice(property.pricePerNight)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Information */}
          <Card data-testid="card-booking-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check-in</p>
                  <p className="font-semibold text-foreground" data-testid="text-checkin-date">
                    {formatDate(booking.checkIn)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check-out</p>
                  <p className="font-semibold text-foreground" data-testid="text-checkout-date">
                    {formatDate(booking.checkOut)}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {days} {days === 1 ? "night" : "nights"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Guests</p>
                  <p className="font-semibold text-foreground flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {booking.guests} {booking.guests === 1 ? "guest" : "guests"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card data-testid="card-payment-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Method</p>
                  <p className="font-semibold text-foreground capitalize" data-testid="text-payment-method">
                    {booking.paymentMethod?.replace('_', ' ') || "Not specified"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
                  <Badge variant={booking.paymentStatus === "paid" ? "default" : "secondary"} data-testid="badge-payment-status">
                    {booking.paymentStatus}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-foreground">Total Amount</span>
                <span className="text-2xl font-bold text-foreground" data-testid="text-total-price">
                  {formatPrice(booking.totalPrice)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transaction Receipt */}
          <Card data-testid="card-transaction-receipt">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Transaction Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-sm font-medium" data-testid="text-transaction-id">
                    {booking.paymentRef || `ALG-${booking.id}`}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction Date</span>
                  <span className="text-sm font-medium" data-testid="text-transaction-date">
                    {new Date(booking.createdAt || Date.now()).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Payment Provider</span>
                  <span className="text-sm font-medium capitalize" data-testid="text-payment-provider">
                    {booking.paymentMethod || "ArifPay"}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="text-lg font-bold text-foreground" data-testid="text-receipt-amount">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>
              </div>
              
              <Button 
                onClick={generateReceipt}
                className="w-full"
                variant="outline"
                data-testid="button-download-receipt"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Receipt (PDF)
              </Button>
            </CardContent>
          </Card>

          {/* Special Requests */}
          {booking.specialRequests && (
            <Card data-testid="card-special-requests">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Special Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground" data-testid="text-special-requests">{booking.specialRequests}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {booking.status === "completed" && booking.propertyId && (
            <Card data-testid="card-write-review">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Share Your Experience</h3>
                    <p className="text-sm text-muted-foreground">
                      Write a review to help other travelers
                    </p>
                  </div>
                  <ReviewDialog propertyId={booking.propertyId} bookingId={booking.id}>
                    <Button data-testid="button-write-review">
                      <Star className="mr-2 h-4 w-4" />
                      Write Review
                    </Button>
                  </ReviewDialog>
                </div>
              </CardContent>
            </Card>
          )}

          {canCancel && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Cancel Booking</h3>
                    <p className="text-sm text-muted-foreground">
                      Cancel this booking if your plans have changed
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" data-testid="button-cancel-booking">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel Booking
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. Your booking will be cancelled and you may be subject to cancellation fees.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-dialog-close">No, keep booking</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => cancelMutation.mutate()}
                          disabled={cancelMutation.isPending}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid="button-confirm-cancel"
                        >
                          {cancelMutation.isPending ? "Cancelling..." : "Yes, cancel booking"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
