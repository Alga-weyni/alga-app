import type { Request, Response } from "express";
import { db } from './db';
import { bookings, serviceBookings } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Alga Pay Callback Handler
 * Receives payment confirmations from underlying processors
 * Updates booking status in database
 */
export const algaCallback = async (req: Request, res: Response) => {
  try {
    const { tx_ref, status, trx_ref } = req.body;
    const txRef = tx_ref || trx_ref; // Handle different field names

    if (!txRef) {
      console.error("❌ Callback missing tx_ref");
      return res.sendStatus(400);
    }

    // Extract order ID from tx_ref (format: ALGA-timestamp-orderId)
    const parts = txRef.split('-');
    const orderId = parts[parts.length - 1];

    if (status === "success" || status === "succeeded") {
      // Try to update property booking first
      const propertyBooking = await db
        .update(bookings)
        .set({ 
          paymentStatus: "confirmed",
          status: "confirmed" 
        })
        .where(eq(bookings.id, parseInt(orderId)))
        .returning();

      if (propertyBooking.length > 0) {
        console.log(`✅ Alga Pay confirmed property booking #${orderId}:`, txRef);
        return res.sendStatus(200);
      }

      // If not property booking, try service booking
      const serviceBooking = await db
        .update(serviceBookings)
        .set({ 
          paymentStatus: "confirmed",
          status: "confirmed" 
        })
        .where(eq(serviceBookings.id, parseInt(orderId)))
        .returning();

      if (serviceBooking.length > 0) {
        console.log(`✅ Alga Pay confirmed service booking #${orderId}:`, txRef);
        return res.sendStatus(200);
      }

      console.warn(`⚠️ No booking found for order #${orderId}`);
      return res.sendStatus(404);
    } 
    else {
      // Payment failed or cancelled
      console.log(`❌ Alga Pay failed for order #${orderId}:`, status);
      
      // Update status to failed
      await db
        .update(bookings)
        .set({ paymentStatus: "failed" })
        .where(eq(bookings.id, parseInt(orderId)));

      await db
        .update(serviceBookings)
        .set({ paymentStatus: "failed" })
        .where(eq(serviceBookings.id, parseInt(orderId)));

      return res.sendStatus(200);
    }
  } catch (error) {
    console.error("❌ Alga Pay callback error:", error);
    return res.sendStatus(500);
  }
};
