import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/header";
import {
  DollarSign,
  Home,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Percent,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface OwnerPayoutData {
  owner: {
    id: string;
    fullName: string;
    phoneNumber: string;
    email: string;
  };
  property: {
    id: number;
    title: string;
    location: string;
    city: string;
    pricePerNight: string;
  };
  earnings: {
    totalBookings: number;
    expectedOccupancy: number;
    grossRevenue: number;
    vat: number;
    platformFee: number;
    agentCommission: number;
    totalDeductions: number;
    netPayout: number;
  };
}

export default function OwnerPayout() {
  const { data, isLoading } = useQuery<OwnerPayoutData>({
    queryKey: ["/api/owner/payout"],
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-cream/30 dark:bg-gray-900 p-4">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-40 w-full" />
            <div className="grid md:grid-cols-3 gap-4">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-cream/30 dark:bg-gray-900 p-4 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">📊 Owner Payout Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-medium-brown dark:text-cream/80">
                No property data available. Please add a property first.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const { owner, property, earnings } = data;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-cream/30 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-dark-brown dark:text-cream mb-2">
              💰 Owner Payout Dashboard
            </h1>
            <p className="text-medium-brown dark:text-cream/80">
              Your rental income breakdown and payout summary
            </p>
          </div>

          {/* Owner Information */}
          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Owner Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1">Full Name</p>
                  <p className="font-semibold text-dark-brown dark:text-cream" data-testid="text-owner-name">
                    {owner.fullName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Phone Number
                  </p>
                  <p className="font-semibold text-dark-brown dark:text-cream" data-testid="text-owner-phone">
                    {owner.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Email
                  </p>
                  <p className="font-semibold text-dark-brown dark:text-cream" data-testid="text-owner-email">
                    {owner.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Property Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1">Property Name</p>
                  <p className="font-semibold text-dark-brown dark:text-cream" data-testid="text-property-title">
                    {property.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Location
                  </p>
                  <p className="font-semibold text-dark-brown dark:text-cream" data-testid="text-property-location">
                    {property.location}, {property.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-medium-brown dark:text-cream/60 mb-1 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Price Per Night
                  </p>
                  <p className="font-semibold text-dark-brown dark:text-cream" data-testid="text-price-per-night">
                    {parseFloat(property.pricePerNight).toFixed(2)} Birr
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Summary Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-medium-brown/20 dark:border-cream/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-dark-brown dark:text-cream" data-testid="text-total-bookings">
                  {earnings.totalBookings}
                </div>
                <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                  Completed rentals
                </p>
              </CardContent>
            </Card>

            <Card className="border-medium-brown/20 dark:border-cream/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Expected Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-dark-brown dark:text-cream" data-testid="text-occupancy">
                  {earnings.expectedOccupancy}%
                </div>
                <p className="text-xs text-medium-brown dark:text-cream/60 mt-1">
                  Average utilization
                </p>
              </CardContent>
            </Card>

            <Card className="border-medium-brown/20 dark:border-cream/20 bg-green-50 dark:bg-green-900/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  Gross Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-gross-revenue">
                  {earnings.grossRevenue.toFixed(2)} Birr
                </div>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Before deductions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Deductions Breakdown */}
          <Card className="border-medium-brown/20 dark:border-cream/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Deductions Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* VAT */}
                <div className="flex justify-between items-center pb-3 border-b border-medium-brown/10 dark:border-cream/10">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-medium-brown dark:text-cream/60" />
                    <span className="text-medium-brown dark:text-cream/80">VAT (15%)</span>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400" data-testid="text-vat">
                    -{earnings.vat.toFixed(2)} Birr
                  </span>
                </div>

                {/* Platform Fee */}
                <div className="flex justify-between items-center pb-3 border-b border-medium-brown/10 dark:border-cream/10">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-medium-brown dark:text-cream/60" />
                    <span className="text-medium-brown dark:text-cream/80">Platform Fee (10%)</span>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400" data-testid="text-platform-fee">
                    -{earnings.platformFee.toFixed(2)} Birr
                  </span>
                </div>

                {/* Agent Commission */}
                <div className="flex justify-between items-center pb-3 border-b border-medium-brown/10 dark:border-cream/10">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-medium-brown dark:text-cream/60" />
                    <span className="text-medium-brown dark:text-cream/80">Agent Commission (5%)</span>
                  </div>
                  <span className="font-semibold text-red-600 dark:text-red-400" data-testid="text-agent-commission">
                    -{earnings.agentCommission.toFixed(2)} Birr
                  </span>
                </div>

                {/* Total Deductions */}
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-dark-brown dark:text-cream">
                    Total Deductions
                  </span>
                  <span className="font-bold text-lg text-red-600 dark:text-red-400" data-testid="text-total-deductions">
                    -{earnings.totalDeductions.toFixed(2)} Birr
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Net Payout - Highlighted */}
          <Card className="border-green-500 dark:border-green-400 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-green-700 dark:text-green-300 mb-1">
                    Your Net Payout
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
                    After all deductions (VAT, platform fee, agent commission)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-green-700 dark:text-green-300" data-testid="text-net-payout">
                    {earnings.netPayout.toFixed(2)} Birr
                  </div>
                  <Badge className="mt-2 bg-green-600 text-white">
                    ✅ Ready for payout
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Note */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-semibold mb-1">💡 How Your Payout is Calculated</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Gross Revenue = Total booking amount from all rentals</li>
                    <li>VAT (15%) = Government tax automatically deducted</li>
                    <li>Platform Fee (10%) = Alga service fee for hosting and payments</li>
                    <li>Agent Commission (5%) = Paid to the agent who referred your property</li>
                    <li>Net Payout = What you receive after all deductions</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
