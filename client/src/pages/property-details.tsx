import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { BackButton } from "@/components/back-button";
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
import type { Property, Review, Booking } from "@shared/schema";

export default function PropertyDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const propertyId = parseInt(params.id || "0");

  const [bookingData, setBookingData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    specialRequests: "",
    paymentMethod: "",
  });

  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${propertyId}`],
    enabled: !!propertyId,
  });

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: [`/api/properties/${propertyId}/reviews`],
    enabled: !!propertyId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: async (booking: Booking) => {
      setShowBookingDialog(false);
      setCurrentBooking(booking);
      
      // Handle Stripe payment
      if (bookingData.paymentMethod === "stripe") {
        setShowStripeCheckout(true);
        return;
      }
      
      // Handle Telebirr payment
      if (bookingData.paymentMethod === "telebirr") {
        try {
          const paymentResponse = await fetch("/api/payment/telebirr", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              amount: booking.totalPrice,
              customerPhone: user?.phoneNumber || "+251912345678",
            }),
          });
          
          const paymentData = await paymentResponse.json();
          
          if (paymentData.success && paymentData.redirectUrl) {
            // Redirect to Telebirr checkout
            window.location.href = paymentData.redirectUrl;
          } else {
            toast({
              title: "Payment initiation failed",
              description: "Unable to start Telebirr payment. Please try another method.",
              variant: "destructive",
            });
            setLocation(`/bookings/${booking.id}`);
          }
        } catch (error) {
          console.error("Telebirr payment error:", error);
          toast({
            title: "Payment error",
            description: "Unable to process Telebirr payment.",
            variant: "destructive",
          });
          setLocation(`/bookings/${booking.id}`);
        }
      }
      // Handle PayPal payment
      else if (bookingData.paymentMethod === "paypal") {
        try {
          const paymentResponse = await fetch("/api/payment/paypal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              bookingId: booking.id,
              amount: parseFloat(booking.totalPrice) / 50, // Convert ETB to USD (approximate rate)
            }),
          });
          
          const paymentData = await paymentResponse.json();
          
          if (paymentData.success && paymentData.approvalUrl) {
            // Redirect to PayPal checkout
            window.location.href = paymentData.approvalUrl;
          } else {
            toast({
              title: "Payment initiation failed",
              description: "Unable to start PayPal payment. Please try another method.",
              variant: "destructive",
            });
            setLocation(`/bookings/${booking.id}`);
          }
        } catch (error) {
          console.error("PayPal payment error:", error);
          toast({
            title: "Payment error",
            description: "Unable to process PayPal payment.",
            variant: "destructive",
          });
          setLocation(`/bookings/${booking.id}`);
        }
      }
      // Handle other payment methods
      else {
        toast({
          title: "Booking created successfully!",
          description: "Your booking request has been submitted. You'll receive a confirmation email soon.",
        });
        setLocation(`/bookings/${booking.id}`);
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
              <Button onClick={() => setLocation("/properties")}>
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
      <div className="ethiopian-pattern-sidebar fixed left-0 top-0 hidden lg:block"></div>
      <div className="flex-1 lg:ml-20">
        <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>
        
        {/* Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
          <div className="lg:col-span-3">
            <img
              src={property.images?.[0] || "https://images.unsplash.com/photo-1571896349842-33c89424de2d"}
              alt={property.title}
              className="w-full h-96 object-cover rounded-xl"
            />
          </div>
          <div className="space-y-4">
            {property.images?.slice(1, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.title} ${index + 2}`}
                className="w-full h-44 object-cover rounded-xl"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-neutral-dark mb-2">
                    {property.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{property.location}, {property.city}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <Badge variant="secondary">{getTypeLabel(property.type)}</Badge>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-eth-yellow text-eth-yellow" />
                  <span className="font-medium">
                    {parseFloat(property.rating || "0").toFixed(1)}
                  </span>
                  <span className="text-gray-500">
                    ({property.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-6 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-gray-600" />
                  <span>{property.maxGuests} guests</span>
                </div>
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-gray-600" />
                  <span>{property.bedrooms} bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-gray-600" />
                  <span>{property.bathrooms} bathrooms</span>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">About this place</h3>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            <Separator className="my-6" />

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-4">Amenities</h3>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities?.map((amenity) => (
                  <div key={amenity} className="flex items-center">
                    <Wifi className="h-4 w-4 mr-2 text-gray-600" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Reviews */}
            <div>
              <h3 className="text-xl font-semibold mb-4">
                Reviews ({reviews.length})
              </h3>
              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b pb-4">
                      <div className="flex items-center mb-2">
                        <Avatar className="h-8 w-8 mr-3">
                          <AvatarFallback>
                            {review.reviewerId.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <span className="font-medium mr-2">Guest</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-eth-yellow text-eth-yellow"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {formatPrice(property.pricePerNight)}
                  <span className="text-base font-normal text-gray-600">/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="checkIn">Check-in</Label>
                      <Input
                        id="checkIn"
                        type="date"
                        value={bookingData.checkIn}
                        onChange={(e) => setBookingData(prev => ({ ...prev, checkIn: e.target.value }))}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                    <div>
                      <Label htmlFor="checkOut">Check-out</Label>
                      <Input
                        id="checkOut"
                        type="date"
                        value={bookingData.checkOut}
                        onChange={(e) => setBookingData(prev => ({ ...prev, checkOut: e.target.value }))}
                        min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests">Guests</Label>
                    <Select 
                      value={bookingData.guests.toString()} 
                      onValueChange={(value) => setBookingData(prev => ({ ...prev, guests: parseInt(value) }))}
                    >
                      <SelectTrigger>
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
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
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
                      <div className="flex justify-between items-center font-semibold">
                        <span>Total</span>
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
                    </div>
                  )}

                  <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-eth-red hover:bg-red-700" 
                        size="lg"
                        disabled={!bookingData.checkIn || !bookingData.checkOut}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
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
                setLocation(`/booking/success?bookingId=${currentBooking.id}`);
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
                setLocation(`/bookings/${currentBooking.id}`);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
