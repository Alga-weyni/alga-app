import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Calendar,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface PropertyWithOwner {
  property: {
    id: number;
    title: string;
    location: string;
    city: string;
    pricePerNight: string;
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
  };
  owner: {
    fullName: string;
    phoneNumber: string;
    email: string;
    paymentAccount: string;
    paymentMethod: string;
  };
  commission: {
    ratePercentage: number;
    estimatedPerNight: number;
    durationMonths: number;
  };
}

export default function AgentSuccess() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<PropertyWithOwner>({
    queryKey: ["/api/agent/property-details"],
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">📋 No Property Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 dark:text-gray-300 mb-4">
                No property assigned yet. Please contact support.
              </p>
              <Button
                onClick={() => navigate("/")}
                className="w-full"
              >
                Go Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { property, owner, commission } = data;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Header */}
          <Card className="border-green-500 dark:border-green-400 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
                <h1 className="text-4xl font-bold mb-3">
                  🎉 Congratulations!
                </h1>
                <p className="text-xl text-green-50 mb-2">
                  You're now an official Alga Dellala Agent!
                </p>
                <p className="text-green-100">
                  Start earning 5% commission on every booking for the next {commission.durationMonths} months
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Commission Estimate */}
          <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
                    Your Commission Per Night
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    Earn {commission.ratePercentage}% on every booking
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
                    {commission.estimatedPerNight.toFixed(2)} Birr
                  </div>
                  <Badge className="mt-1 bg-emerald-600 text-white">
                    Per Night
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property You'll Be Promoting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-2xl font-bold text-dark-brown dark:text-cream mb-2" data-testid="text-property-title">
                  {property.title}
                </p>
                <div className="flex items-center gap-2 text-medium-brown dark:text-cream/80">
                  <MapPin className="h-4 w-4" />
                  <span>{property.location}, {property.city}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60">Price Per Night</p>
                  <p className="text-xl font-semibold text-dark-brown dark:text-cream" data-testid="text-price">
                    {parseFloat(property.pricePerNight).toFixed(2)} Birr
                  </p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60">Bedrooms</p>
                  <p className="text-xl font-semibold text-dark-brown dark:text-cream">
                    {property.bedrooms}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60">Max Guests</p>
                  <p className="text-xl font-semibold text-dark-brown dark:text-cream">
                    {property.maxGuests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Property Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-medium-brown dark:text-cream/80">Full Name</span>
                  <span className="font-semibold text-dark-brown dark:text-cream" data-testid="text-owner-name">
                    {owner.fullName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-medium-brown dark:text-cream/60" />
                    <span className="text-medium-brown dark:text-cream/80">Phone Number</span>
                  </div>
                  <span className="font-semibold text-dark-brown dark:text-cream" data-testid="text-owner-phone">
                    {owner.phoneNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-medium-brown dark:text-cream/60" />
                    <span className="text-medium-brown dark:text-cream/80">Email</span>
                  </div>
                  <span className="font-semibold text-dark-brown dark:text-cream" data-testid="text-owner-email">
                    {owner.email}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-medium-brown dark:text-cream/60" />
                    <span className="text-medium-brown dark:text-cream/80">Payment Account ({owner.paymentMethod})</span>
                  </div>
                  <span className="font-semibold text-dark-brown dark:text-cream font-mono" data-testid="text-payment-account">
                    {owner.paymentAccount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-2">💡 How Your Commission Works</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>You earn <strong>5% commission</strong> on every booking made for this property</li>
                    <li>Commission continues for <strong>{commission.durationMonths} months</strong> from the first booking</li>
                    <li>Payments are sent automatically to your payment account</li>
                    <li>No ongoing work required - just list once and earn!</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Continue Button */}
          <Button
            onClick={() => navigate("/properties")}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6"
            data-testid="button-continue"
          >
            Continue to Property Listing
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </>
  );
}
