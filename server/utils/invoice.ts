import { jsPDF } from "jspdf";

interface InvoiceBooking {
  id: number;
  guestName: string;
  propertyName: string;
  createdAt: Date;
  totalAmount: number;
  algaCommission: number;
  vat: number;
  withholding: number;
  hostPayout: number;
}

interface InvoiceOptions {
  algaTIN?: string;
  hostTIN?: string;
}

/**
 * Generate ERCA-compliant invoice PDF for booking
 * @param booking - Booking details with financial breakdown
 * @param options - Optional TIN numbers for ERCA compliance
 * @returns Base64 encoded PDF data URI
 */
export async function generateInvoice(
  booking: InvoiceBooking,
  options: InvoiceOptions = {}
): Promise<string> {
  const { algaTIN = "ALGA-TIN-12345", hostTIN = "N/A" } = options;
  
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Alga Booking Invoice", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Ethiopian Rental & Booking Platform", 20, 28);
  doc.text("ERCA Tax Compliant Invoice", 20, 34);

  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, 40, 190, 40);

  // Booking Information
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Booking Details", 20, 50);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Booking ID: ${booking.id}`, 20, 60);
  doc.text(`Guest: ${booking.guestName}`, 20, 68);
  doc.text(`Property: ${booking.propertyName}`, 20, 76);
  doc.text(
    `Invoice Date: ${new Date(booking.createdAt).toLocaleDateString('en-ET', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`,
    20,
    84
  );

  // Separator line
  doc.setLineWidth(0.5);
  doc.line(20, 92, 190, 92);

  // Financial Breakdown
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Financial Breakdown", 20, 102);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  
  const lineHeight = 8;
  let yPos = 112;
  
  doc.text(`Gross Booking Amount:`, 20, yPos);
  doc.text(`${booking.totalAmount.toFixed(2)} ETB`, 150, yPos, { align: "right" });
  
  yPos += lineHeight;
  doc.text(`Alga Commission (12%):`, 20, yPos);
  doc.text(`${booking.algaCommission.toFixed(2)} ETB`, 150, yPos, { align: "right" });
  
  yPos += lineHeight;
  doc.text(`VAT on Commission (15%):`, 20, yPos);
  doc.text(`${booking.vat.toFixed(2)} ETB`, 150, yPos, { align: "right" });
  
  yPos += lineHeight;
  doc.text(`Withholding Tax (2%):`, 20, yPos);
  doc.text(`${booking.withholding.toFixed(2)} ETB`, 150, yPos, { align: "right" });
  
  // Separator line
  yPos += 4;
  doc.setLineWidth(0.3);
  doc.line(20, yPos, 160, yPos);
  
  yPos += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Net Host Payout:`, 20, yPos);
  doc.text(`${booking.hostPayout.toFixed(2)} ETB`, 150, yPos, { align: "right" });

  // Tax Information
  yPos += 15;
  doc.setLineWidth(0.5);
  doc.line(20, yPos, 190, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("ERCA Tax Information", 20, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Alga Platform TIN: ${algaTIN}`, 20, yPos);
  
  yPos += 8;
  doc.text(`Host TIN: ${hostTIN}`, 20, yPos);
  
  yPos += 12;
  doc.setFont("helvetica", "italic");
  doc.text("All taxes calculated and remitted per Ethiopian Revenue and Customs Authority (ERCA) regulation.", 20, yPos, {
    maxWidth: 170
  });

  // Footer
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Alga - Stay. Discover. Belong — The Ethiopian Way!",
    105,
    280,
    { align: "center" }
  );

  return doc.output("datauristring");
}
