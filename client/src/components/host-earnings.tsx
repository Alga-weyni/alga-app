import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface EarningsSummary {
  totalBookings: number;
  grossRevenue: number;
  algaServiceFee: number;
  vat: number;
  withholding: number;
  netPayout: number;
  bookings: Array<{
    id: number;
    propertyId: number;
    checkIn: Date;
    checkOut: Date;
    guestPaid: number;
    serviceFee: number;
    vat: number;
    withholding: number;
    yourPayout: number;
  }>;
}

export function HostEarnings() {
  const { data: earnings, isLoading } = useQuery<EarningsSummary>({
    queryKey: ["/api/host/earnings"],
  });

  const formatETB = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Earnings...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!earnings) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Bookings</CardDescription>
            <CardTitle className="text-3xl">{earnings.totalBookings}</CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Gross Revenue</CardDescription>
            <CardTitle className="text-3xl text-eth-brown">
              {formatETB(earnings.grossRevenue)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="bg-eth-brown text-white">
          <CardHeader className="pb-3">
            <CardDescription className="text-white/80 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your Net Payout
            </CardDescription>
            <CardTitle className="text-3xl">
              {formatETB(earnings.netPayout)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
          <CardDescription>
            Detailed financial breakdown for all completed bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest Paid</TableHead>
                <TableHead>Alga Service Fee (12%)</TableHead>
                <TableHead>VAT (15%)</TableHead>
                <TableHead>Withholding (2%)</TableHead>
                <TableHead className="text-right font-bold">Your Payout</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {earnings.bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No completed bookings yet
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {earnings.bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">
                        {formatETB(booking.guestPaid)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatETB(booking.serviceFee)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatETB(booking.vat)}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {formatETB(booking.withholding)}
                      </TableCell>
                      <TableCell className="text-right font-bold text-eth-brown">
                        {formatETB(booking.yourPayout)}
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {/* Total Row */}
                  <TableRow className="bg-cream-50 font-bold">
                    <TableCell>{formatETB(earnings.grossRevenue)}</TableCell>
                    <TableCell>{formatETB(earnings.algaServiceFee)}</TableCell>
                    <TableCell>{formatETB(earnings.vat)}</TableCell>
                    <TableCell>{formatETB(earnings.withholding)}</TableCell>
                    <TableCell className="text-right text-eth-brown text-lg">
                      {formatETB(earnings.netPayout)}
                    </TableCell>
                  </TableRow>
                </>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ERCA Compliance Notice */}
      <Alert className="border-eth-brown/30 bg-cream-50">
        <Info className="h-4 w-4 text-eth-brown" />
        <AlertDescription className="text-eth-brown/80">
          <strong className="text-eth-brown">Ethiopian Tax Compliance:</strong> All deductions comply with ERCA regulations. 
          VAT (15%) and withholding tax (2%) are remitted to the Ethiopian Revenue and Customs Authority on your behalf. 
          Your payout represents the final amount after all legal deductions.
        </AlertDescription>
      </Alert>

      {/* Calculation Example */}
      {earnings.bookings.length > 0 && (
        <Card className="bg-cream-50">
          <CardHeader>
            <CardTitle className="text-lg">How Payouts Are Calculated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Example: Guest pays</span>
                <span className="font-bold">10,000 ETB</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>− Alga service fee (12%)</span>
                <span>1,200 ETB</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>− VAT on service fee (15% of 1,200)</span>
                <span>180 ETB</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>− Host withholding tax (2% of 8,800)</span>
                <span>176 ETB</span>
              </div>
              <div className="border-t border-eth-brown/20 pt-2 flex justify-between text-lg font-bold text-eth-brown">
                <span>= Your payout</span>
                <span>8,624 ETB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
