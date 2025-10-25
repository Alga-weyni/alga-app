import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { BackButton } from "@/components/back-button";
import { SEOHead } from "@/components/seo-head";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Star,
  MapPin,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Heart,
  Share,
  Calendar,
  CreditCard,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { PAYMENT_METHODS } from "@/lib/constants";
import StripeCheckout from "@/components/stripe-checkout";
import ChapaCheckout from "@/components/chapa-checkout";
import PropertyMiniMap from "@/components/property-mini-map";
import type { Property, Review, Booking } from "@shared/schema";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const propertyId = parseInt(id || "0");
  
  // Parse URL parameters for pre-filled booking
  const autoBook = searchParams.get('book') === 'true';
  const urlCheckIn = searchParams.get('checkIn') || "";
  const urlCheckOut = searchParams.get('checkOut') || "";
  const urlGuests = parseInt(searchParams.get('guests') || "1");

  // Scroll to top when page loads or property changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [propertyId]);

  const [bookingData, setBookingData] = useState({
    checkIn: urlCheckIn,
    checkOut: urlCheckOut,
    guests: urlGuests,
    specialRequests: "",
    paymentMethod: "",
  });

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [showChapaCheckout, setShowChapaCheckout] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });
  
  // Auto-open booking dialog if URL param is set
  useEffect(() => {
    if (autoBook && isAuthenticated && property) {
      setShowBookingDialog(true);
    }
  }, [autoBook, isAuthenticated, property]);

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/properties/${propertyId}/reviews`],
    enabled: !!propertyId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response;
    },
    onSuccess: async (booking: Booking) => {
      setShowBookingDialog(false);
      setCurrentBooking(booking);
      
      // Handle Chapa payment (embedded iframe)
      if (bookingData.paymentMethod === "chapa") {
        setShowChapaCheckout(true);
        return;
      }
      
      // Handle Stripe payment
      if (bookingData.paymentMethod === "stripe") {
        setShowStripeCheckout(true);
        return;
      }
      
      // Handle Telebirr payment
      if (bookingData.paymentMethod === "telebirr") {
        try {
          const paymentData = await apiRequest("POST", "/api/payment/telebirr", {
            bookingId: booking.id,
            amount: parseFloat(booking.totalPrice),
            customerPhone: user?.phoneNumber || "+251912345678",
          });
          
          if (paymentData.success && paymentData.redirectUrl) {
            // Redirect to Telebirr checkout
            window.location.href = paymentData.redirectUrl;
          } else {
            toast({
              title: "Payment initiation failed",
              description: paymentData.message || "Unable to start Telebirr payment. Please try another method.",
              variant: "destructive",
            });
            navigate(`/bookings/${booking.id}`);
          }
        } catch {
          toast({
            title: "Payment error",
            description: "Unable to process Telebirr payment.",
            variant: "destructive",
          });
          navigate(`/bookings/${booking.id}`);
        }
      }
      // Handle PayPal payment
      else if (bookingData.paymentMethod === "paypal") {
        try {
          const paymentData = await apiRequest("POST", "/api/payment/paypal", {
            bookingId: booking.id,
            amount: parseFloat(booking.totalPrice) / 50, // Convert ETB to USD (approximate rate)
          });
          
          if (paymentData.success && paymentData.approvalUrl) {
            // Redirect to PayPal checkout
            window.location.href = paymentData.approvalUrl;
          } else {
            toast({
              title: "Payment initiation failed",
              description: "Unable to start PayPal payment. Please try another method.",
              variant: "destructive",
            });
            navigate(`/bookings/${booking.id}`);
          }
        } catch {
          toast({
            title: "Payment error",
            description: "Unable to process PayPal payment.",
            variant: "destructive",
          });
          navigate(`/bookings/${booking.id}`);
        }
      }
      // Handle other payment methods
      else {
        toast({
          title: "Booking created successfully!",
          description: "Your booking request has been submitted. You'll receive a confirmation email soon.",
        });
        navigate(`/bookings/${booking.id}`);
      }
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Unable to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut || !bookingData.paymentMethod) {
      toast({
        title: "Missing information",
        description: "Please fill in all required booking details.",
        variant: "destructive",
      });
      return;
    }

    const days = Math.ceil(
      (new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    if (days <= 0) {
      toast({
        title: "Invalid dates",
        description: "Check-out date must be after check-in date.",
        variant: "destructive",
      });
      return;
    }

    const totalPrice = parseFloat(property!.pricePerNight) * days;

    bookingMutation.mutate({
      propertyId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalPrice,
      currency: "ETB",
      paymentMethod: bookingData.paymentMethod,
      specialRequests: bookingData.specialRequests,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-eth-warm-tan">
        <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
        <div className="flex-1 lg:ml-20">
          <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-200 rounded-xl mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex min-h-screen bg-eth-warm-tan">
        <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
        <div className="flex-1 lg:ml-20">
          <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Property not found</h2>
              <p className="text-gray-600 mb-6">
                The property you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate("/properties")}>
                Browse All Properties
              </Button>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(parseFloat(price));
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "traditional_home": return "Traditional Home";
      case "eco_lodge": return "Eco Lodge";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="flex min-h-screen bg-eth-warm-tan">
      <SEOHead
        title={`${property.title} - ${property.city} | Alga`}
        description={`${property.description.substring(0, 155)}... Book this ${getTypeLabel(property.type)} in ${property.city}, Ethiopia. From ${formatPrice(property.pricePerNight)}/night.`}
      />
      
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      <div className="flex-1 lg:ml-20">
        <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6">
          <BackButton />
        </div>
        
        {/* Image Gallery */}
        <div className="mb-6 sm:mb-8">
          {/* Main Image */}
          <div className="mb-3 sm:mb-4">
            <img
              src={property.images?.[0] || "https://images.unsplash.com/photo-1571896349842-33c89424de2d"}
              alt={property.title}
              className="w-full h-64 sm:h-96 lg:h-[500px] object-cover rounded-lg sm:rounded-xl"
              loading="lazy"
              data-testid="img-property-main"
            />
          </div>
          
          {/* All Images Grid */}
          {property.images && property.images.length > 1 && (
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-neutral-dark mb-3">
                All Photos ({property.images.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                {property.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer overflow-hidden rounded-lg border-2 border-gray-200 hover:border-eth-brown transition-colors"
                    onClick={() => window.open(image, '_blank')}
                  >
                    <img
                      src={image}
                      alt={`${property.title} ${index + 1}`}
                      className="w-full h-32 sm:h-40 object-cover"
                      loading="lazy"
                      data-testid={`img-property-${index}`}
                    />
                    {index === 0 && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-eth-brown text-white text-xs">Main</Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">View Full Size</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-4 sm:mb-6">
              <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-neutral-dark mb-1 sm:mb-2" data-testid="text-property-title">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                    <span>{property.location}, {property.city}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" data-testid="button-share">
                    <Share className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10" data-testid="button-favorite">
                    <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <Badge variant="secondary" className="text-xs sm:text-sm">{getTypeLabel(property.type)}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-eth-yellow text-eth-yellow" />
                  <span className="text-sm sm:text-base font-medium" data-testid="text-rating">
                    {parseFloat(property.rating || "0").toFixed(1)}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    ({property.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-gray-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-gray-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 text-gray-600 flex-shrink-0" />
                  <span className="text-sm sm:text-base">{property.bathrooms} bathrooms</span>
                </div>
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Description */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">About this place</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Amenities */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Amenities</h3>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                {property.amenities?.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-gray-600 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Location - Mini Map */}
            <div className="mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Location</h3>
              <PropertyMiniMap
                latitude={property.latitude}
                longitude={property.longitude}
                address={property.address}
                city={property.city}
                title={property.title}
              />
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Reviews */}
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                Reviews ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-sm sm:text-base text-gray-600">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-3 sm:pb-4">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 mr-2 sm:mr-3">
                          <AvatarFallback>
                            {review.reviewerId.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className="text-sm sm:text-base font-medium">Guest</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                                    i < review.rating
                                      ? "fill-eth-yellow text-eth-yellow"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] sm:text-xs text-gray-500">
                            {new Date(review.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm sm:text-base text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-24">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-xl sm:text-2xl">
                  {formatPrice(property.pricePerNight)}
                  <span className="text-sm sm:text-base font-normal text-gray-600">/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <Label htmlFor="checkIn" className="text-xs sm:text-sm">Check-in</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                        className="text-xs sm:text-sm h-9 sm:h-10"
                        data-testid="input-checkin"
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut" className="text-xs sm:text-sm">Check-out</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                        className="text-xs sm:text-sm h-9 sm:h-10"
                        data-testid="input-checkout"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests" className="text-xs sm:text-sm">Guests</Label>
                    <Select 
                      value={bookingData.guests.toString()} 
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, guests: parseInt(value) }))}
                    >
                      <SelectTrigger className="text-xs sm:text-sm h-9 sm:h-10" data-testid="select-guests">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(property.maxGuests)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} guest{i + 1 > 1 ? 's' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {bookingData.checkIn && bookingData.checkOut && (
                    <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2 text-xs sm:text-sm">
                        <span>
                          {formatPrice(property.pricePerNight)} x{" "}
                          {Math.ceil(
                            (new Date(bookingData.checkOut).getTime() - 
                             new Date(bookingData.checkIn).getTime()) / 
                            (1000 * 60 * 60 * 24)
                          )} nights
                        </span>
                        <span>
                          {formatPrice(
                            (parseFloat(property.pricePerNight) * 
                             Math.ceil(
                               (new Date(bookingData.checkOut).getTime() - 
                                new Date(bookingData.checkIn).getTime()) / 
                               (1000 * 60 * 60 * 24)
                             )).toString()
                          )}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center font-semibold text-sm sm:text-base">
                        <span>Total</span>
                        <span data-testid="text-total-price">
                          {formatPrice(
                            (parseFloat(property.pricePerNight) * 
                             Math.ceil(
                               (new Date(bookingData.checkOut).getTime() - 
                                new Date(bookingData.checkIn).getTime()) / 
                               (1000 * 60 * 60 * 24)
                             )).toString()
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-eth-red hover:bg-red-700 h-10 sm:h-11 text-sm sm:text-base" 
                        disabled={!bookingData.checkIn || !bookingData.checkOut}
                        data-testid="button-reserve"
                      >
                        <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Reserve
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Complete Your Booking</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="paymentMethod">Payment Method</Label>
                          <Select 
                            value={bookingData.paymentMethod} 
                            onValueChange={(value) => setBookingData(prev => ({ ...prev, paymentMethod: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose payment method..." />
                            </SelectTrigger>
                            <SelectContent>
                              {PAYMENT_METHODS.map((method) => (
                                <SelectItem key={method.id} value={method.id}>
                                  <div className="flex items-center">
                                    <span className="mr-2">{method.icon}</span>
                                    {method.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                          <Textarea
                            id="specialRequests"
                            placeholder="Any special requests or requirements..."
                            value={bookingData.specialRequests}
                            onChange={(e) => setBookingData(prev => ({ ...prev, specialRequests: e.target.value }))}
                          />
                        </div>

                        <Button 
                          onClick={handleBooking} 
                          className="w-full bg-eth-green hover:bg-green-700"
                          disabled={bookingMutation.isPending}
                        >
                          <CreditCard className="mr-2 h-4 w-4" />
                          {bookingMutation.isPending ? "Processing..." : "Confirm Booking"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <p className="text-xs text-gray-500 text-center">
                    You won't be charged yet
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
      
      {/* Stripe Payment Modal */}
      <Dialog open={showStripeCheckout} onOpenChange={setShowStripeCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-eth-brown">Secure Payment</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <StripeCheckout
              amount={parseFloat(currentBooking.totalPrice)}
              currency="usd"
              bookingId={currentBooking.id}
              onSuccess={() => {
                setShowStripeCheckout(false);
                toast({
                  title: "Payment successful!",
                  description: "Your booking has been confirmed.",
                });
                navigate(`/booking/success?bookingId=${currentBooking.id}`);
              }}
              onError={(error) => {
                toast({
                  title: "Payment failed",
                  description: error,
                  variant: "destructive",
                });
              }}
              onCancel={() => {
                setShowStripeCheckout(false);
                toast({
                  title: "Payment cancelled",
                  description: "You can retry payment from your bookings page.",
                });
                navigate(`/bookings/${currentBooking.id}`);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Chapa Payment Modal */}
      <Dialog open={showChapaCheckout} onOpenChange={setShowChapaCheckout}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-eth-brown">Chapa Payment</DialogTitle>
          </DialogHeader>
          {currentBooking && (
            <ChapaCheckout
              amount={parseFloat(currentBooking.totalPrice)}
              currency="ETB"
              bookingId={currentBooking.id}
              onSuccess={() => {
                setShowChapaCheckout(false);
                toast({
                  title: "Payment successful!",
                  description: "Your booking has been confirmed.",
                });
                navigate(`/booking/success?bookingId=${currentBooking.id}`);
              }}
              onError={(error) => {
                toast({
                  title: "Payment failed",
                  description: error,
                  variant: "destructive",
                });
              }}
              onCancel={() => {
                setShowChapaCheckout(false);
                toast({
                  title: "Payment cancelled",
                  description: "You can retry payment from your bookings page.",
                });
                navigate(`/bookings/${currentBooking.id}`);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
