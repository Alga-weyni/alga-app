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

  // Admin: Mark booking as paid
  const markAsPaidMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/bookings/${id}/payment`, { 
        paymentStatus: "paid",
        paymentReference: `ADMIN-VERIFIED-${Date.now()}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: [`/api/bookings/${id}`] });
      toast({
        title: "Payment confirmed",
        description: "Booking has been marked as paid and confirmed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Unable to update payment status.",
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

  // Helper function to convert number to words
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
      return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThanThousand(n % 100) : '');
    };
    
    const intPart = Math.floor(num);
    const decPart = Math.round((num - intPart) * 100);
    
    let result = '';
    if (intPart >= 1000000) {
      result += convertLessThanThousand(Math.floor(intPart / 1000000)) + ' Million ';
      const remainder = intPart % 1000000;
      if (remainder >= 1000) {
        result += convertLessThanThousand(Math.floor(remainder / 1000)) + ' Thousand ';
      }
      if (remainder % 1000 > 0) {
        result += convertLessThanThousand(remainder % 1000);
      }
    } else if (intPart >= 1000) {
      result += convertLessThanThousand(Math.floor(intPart / 1000)) + ' Thousand ';
      if (intPart % 1000 > 0) {
        result += convertLessThanThousand(intPart % 1000);
      }
    } else {
      result = convertLessThanThousand(intPart);
    }
    
    if (decPart > 0) {
      result += ' & ' + convertLessThanThousand(decPart) + ' cents';
    }
    
    return result.trim();
  };

  const generateReceipt = () => {
    if (!booking || !property) return;
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 15;
    const marginRight = pageWidth - 15;
    const contentWidth = marginRight - marginLeft;
    
    // Colors
    const primaryColor = { r: 139, g: 69, b: 19 }; // Brown color for Alga branding
    const headerBg = { r: 45, g: 20, b: 5 }; // Dark brown
    
    // ============ HEADER ============
    doc.setFillColor(headerBg.r, headerBg.g, headerBg.b);
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("ALGA", pageWidth / 2, 15, { align: "center" });
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("VAT Invoice / Customer Receipt", pageWidth / 2, 25, { align: "center" });
    
    // ============ COMPANY & CUSTOMER INFO ============
    doc.setTextColor(0, 0, 0);
    let y = 45;
    
    // Left column - Company Info
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Company Address & Other Information", marginLeft, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    y += 6;
    const companyInfo = [
      ["Country:", "Ethiopia"],
      ["City:", "Addis Ababa"],
      ["Address:", "Bole Sub-City, Addis Ababa"],
      ["Email:", "info@alga.et"],
      ["Tel:", "+251 943 333 555"],
      ["TIN:", "XXXXXXXXXX"],
      ["VAT Registration No:", "ALGXXXXXX"],
      ["VAT Registration Date:", "01/01/2024"],
    ];
    companyInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, marginLeft, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, marginLeft + 35, y);
      y += 5;
    });
    
    // Right column - Customer Info
    y = 51;
    const midPoint = pageWidth / 2 + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Customer Information", midPoint, 45);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    
    const customerName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Guest' : 'Guest';
    const customerInfo = [
      ["Customer Name:", customerName],
      ["City:", property.city || "-"],
      ["Property:", property.title.substring(0, 25) + (property.title.length > 25 ? "..." : "")],
      ["Check-in:", formatDate(booking.checkIn)],
      ["Check-out:", formatDate(booking.checkOut)],
      ["Guests:", `${booking.guests} guest(s)`],
      ["Duration:", `${days} night(s)`],
    ];
    customerInfo.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, midPoint, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, midPoint + 30, y);
      y += 5;
    });
    
    // ============ PAYMENT / TRANSACTION INFORMATION ============
    y = 95;
    
    // Section header with background
    doc.setFillColor(headerBg.r, headerBg.g, headerBg.b);
    doc.rect(marginLeft, y, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Payment / Transaction Information", pageWidth / 2, y + 7, { align: "center" });
    
    // Reset colors
    doc.setTextColor(0, 0, 0);
    y += 15;
    
    // Transaction details table
    const rowHeight = 9;
    const labelWidth = 75;
    
    const total = parseFloat(booking.totalPrice);
    const stayAmount = total / 1.175;
    const vatAmount = stayAmount * 0.15;
    const serviceCharge = stayAmount * 0.025;
    
    const transactionDate = new Date(booking.createdAt || Date.now()).toLocaleString("en-US", {
      month: "2-digit",
      day: "2-digit", 
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
    
    const transactionId = booking.paymentRef || `ALG${booking.id}${Date.now().toString().slice(-6)}`;
    
    const drawTableRow = (label: string, value: string, yPos: number, highlight = false) => {
      if (highlight) {
        doc.setFillColor(245, 245, 245);
        doc.rect(marginLeft, yPos - 5, contentWidth, rowHeight, 'F');
      }
      doc.setDrawColor(200, 200, 200);
      doc.line(marginLeft, yPos + 3, marginRight, yPos + 3);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(label, marginLeft + 3, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(value, marginRight - 3, yPos, { align: "right" });
    };
    
    const rows = [
      ["Payer", customerName],
      ["Property Owner", property.hostId ? `Host #${property.hostId}` : "ALGA Host"],
      ["Payment Date & Time", transactionDate],
      ["Reference No. (VAT Invoice No)", transactionId],
      ["Reason / Type of service", `Accommodation booking via ALGA`],
      ["Stay Amount", `${stayAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB`],
      ["Service Charge (2.5%)", `${serviceCharge.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB`],
      ["15% VAT", `${vatAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB`],
      ["Total amount paid", `${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} ETB`],
    ];
    
    rows.forEach((row, index) => {
      const isLast = index === rows.length - 1;
      drawTableRow(row[0], row[1], y, isLast);
      y += rowHeight;
    });
    
    // ============ AMOUNT IN WORDS ============
    y += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Amount in Words:", marginLeft, y);
    
    doc.setDrawColor(100, 100, 100);
    doc.rect(marginLeft + 35, y - 5, 120, 12, 'S');
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`ETB ${numberToWords(total)}`, marginLeft + 38, y + 2);
    
    // ============ FOOTER ============
    y += 25;
    doc.setFillColor(headerBg.r, headerBg.g, headerBg.b);
    doc.rect(marginLeft, y, contentWidth, 18, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("The hospitality you can always rely on.", pageWidth / 2, y + 8, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("\u00A9 2025 ALGA. All rights reserved.", pageWidth / 2, y + 14, { align: "center" });
    
    // Page number
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.text("1 / 1", pageWidth / 2, y + 30, { align: "center" });
    
    // Download
    doc.save(`Alga-Receipt-${transactionId}.pdf`);
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
              
              {/* Price Breakdown */}
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-foreground mb-2">Price Breakdown</h4>
                
                {/* Stay Amount */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Stay Amount ({property ? `${formatPrice(property.pricePerNight)}/night × ${days} nights` : `${days} nights`})
                  </span>
                  <span className="text-sm font-medium" data-testid="text-stay-amount">
                    {formatPrice((parseFloat(booking.totalPrice) / 1.175).toFixed(2))}
                  </span>
                </div>
                
                {/* VAT */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    VAT (15%)
                  </span>
                  <span className="text-sm font-medium" data-testid="text-vat-amount">
                    {formatPrice((parseFloat(booking.totalPrice) / 1.175 * 0.15).toFixed(2))}
                  </span>
                </div>
                
                {/* Service Charge */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Service Charge (2.5%)
                  </span>
                  <span className="text-sm font-medium" data-testid="text-service-charge">
                    {formatPrice((parseFloat(booking.totalPrice) / 1.175 * 0.025).toFixed(2))}
                  </span>
                </div>
                
                <Separator />
                
                {/* Total */}
                <div className="flex justify-between items-center pt-1">
                  <span className="font-semibold text-foreground">Total Amount</span>
                  <span className="text-xl font-bold text-foreground" data-testid="text-total-price">
                    {formatPrice(booking.totalPrice)}
                  </span>
                </div>
              </div>
              
              {/* Admin: Mark as Paid button */}
              {user?.role === 'admin' && booking.paymentStatus === 'pending' && (
                <div className="pt-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        className="w-full bg-green-600 hover:bg-green-700"
                        data-testid="button-mark-paid"
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Mark as Paid (Admin)
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to mark this booking as paid? This will confirm the booking and generate an access code for the guest.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => markAsPaidMutation.mutate()}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Confirm Payment
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction Receipt - Only show when payment is confirmed */}
          {booking.paymentStatus === "paid" && (booking.status === "confirmed" || booking.status === "completed") && (
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
                </div>
                
                {/* Receipt Breakdown */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Stay Amount</span>
                    <span className="font-medium">{formatPrice((parseFloat(booking.totalPrice) / 1.175).toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">VAT (15%)</span>
                    <span className="font-medium">{formatPrice((parseFloat(booking.totalPrice) / 1.175 * 0.15).toFixed(2))}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Service Charge (2.5%)</span>
                    <span className="font-medium">{formatPrice((parseFloat(booking.totalPrice) / 1.175 * 0.025).toFixed(2))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-foreground">Total</span>
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
          )}

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
