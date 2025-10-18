/**
 * Alga Booking Financial Calculations
 * Ethiopian Tax Compliance (ERCA)
 */

export interface BookingBreakdown {
  totalAmount: number;
  algaCommission: number;
  vatOnCommission: number;
  hostGross: number;
  hostWithholding: number;
  hostNet: number;
}

/**
 * Calculate booking financial breakdown with Ethiopian tax compliance
 * 
 * @param totalAmount - Total booking amount in ETB
 * @returns Breakdown of commission, taxes, and host payout
 * 
 * @example
 * const breakdown = calculateBookingBreakdown(10000);
 * // Returns:
 * // {
 * //   totalAmount: 10000,
 * //   algaCommission: 1200,    // 12% of total
 * //   vatOnCommission: 180,     // 15% VAT on commission
 * //   hostGross: 8800,          // Total - commission
 * //   hostWithholding: 176,     // 2% withholding from host
 * //   hostNet: 8624             // Final payout to host
 * // }
 */
export function calculateBookingBreakdown(totalAmount: number): BookingBreakdown {
  // Ethiopian Tax Rates (as of 2025)
  const COMMISSION_RATE = 0.12;      // 12% Alga service fee
  const VAT_RATE = 0.15;             // 15% VAT on commission (ERCA)
  const WITHHOLDING_RATE = 0.02;     // 2% withholding tax on host earnings

  // Calculate Alga's commission
  const algaCommission = totalAmount * COMMISSION_RATE;
  
  // Calculate VAT on commission (payable to ERCA)
  const vatOnCommission = algaCommission * VAT_RATE;
  
  // Calculate host's gross amount (before withholding)
  const hostGross = totalAmount - algaCommission;
  
  // Calculate withholding tax (deducted from host, paid to ERCA)
  const hostWithholding = hostGross * WITHHOLDING_RATE;
  
  // Calculate final net payout to host
  const hostNet = hostGross - hostWithholding;

  return {
    totalAmount: parseFloat(totalAmount.toFixed(2)),
    algaCommission: parseFloat(algaCommission.toFixed(2)),
    vatOnCommission: parseFloat(vatOnCommission.toFixed(2)),
    hostGross: parseFloat(hostGross.toFixed(2)),
    hostWithholding: parseFloat(hostWithholding.toFixed(2)),
    hostNet: parseFloat(hostNet.toFixed(2)),
  };
}

/**
 * Format Ethiopian Birr amount for display
 */
export function formatETB(amount: number): string {
  return new Intl.NumberFormat('en-ET', {
    style: 'currency',
    currency: 'ETB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate monthly totals for admin reporting
 */
export interface MonthlyFinancialSummary {
  totalBookings: number;
  totalRevenue: number;
  totalCommission: number;
  totalVAT: number;
  totalWithholding: number;
  totalHostPayouts: number;
}

export function calculateMonthlySummary(bookings: Array<{
  totalPrice: string;
  algaCommission?: string;
  vat?: string;
  withholding?: string;
  hostPayout?: string;
}>): MonthlyFinancialSummary {
  return bookings.reduce((acc, booking) => ({
    totalBookings: acc.totalBookings + 1,
    totalRevenue: acc.totalRevenue + parseFloat(booking.totalPrice || '0'),
    totalCommission: acc.totalCommission + parseFloat(booking.algaCommission || '0'),
    totalVAT: acc.totalVAT + parseFloat(booking.vat || '0'),
    totalWithholding: acc.totalWithholding + parseFloat(booking.withholding || '0'),
    totalHostPayouts: acc.totalHostPayouts + parseFloat(booking.hostPayout || '0'),
  }), {
    totalBookings: 0,
    totalRevenue: 0,
    totalCommission: 0,
    totalVAT: 0,
    totalWithholding: 0,
    totalHostPayouts: 0,
  });
}
