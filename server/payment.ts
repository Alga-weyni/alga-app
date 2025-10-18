import express from "express";
import Stripe from "stripe";
import { db } from "./db";
import { bookings } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createTelebirrService } from "./services/telebirr.service";
import { storage } from "./storage";

const router = express.Router();

// Helper function to generate 6-digit access code
async function generateAccessCodeForBooking(bookingId: number): Promise<string> {
  try {
    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Create access code
    await storage.createAccessCode({
      bookingId: booking.id,
      propertyId: booking.propertyId,
      guestId: booking.guestId,
      code,
      validFrom: booking.checkIn,
      validTo: booking.checkOut,
      status: "active",
    });

    console.log(`✅ Access code ${code} generated for booking #${bookingId}`);
    return code;
  } catch (error) {
    console.error(`Failed to generate access code for booking #${bookingId}:`, error);
    throw error;
  }
}

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

const telebirrService = createTelebirrService();

// -----------------------------------------------------------------------------
// TELEBIRR CONFIGURATION CHECK (Diagnostic endpoint - Public)
// -----------------------------------------------------------------------------
router.get("/status/telebirr", (req, res) => {
  const hasService = !!telebirrService;
  const config = {
    configured: hasService,
    hasBaseUrl: !!process.env.TELEBIRR_BASE_URL,
    hasFabricAppId: !!process.env.TELEBIRR_FABRIC_APP_ID,
    hasAppSecret: !!process.env.TELEBIRR_APP_SECRET,
    hasMerchantAppId: !!process.env.TELEBIRR_MERCHANT_APP_ID,
    hasPrivateKey: !!process.env.TELEBIRR_PRIVATE_KEY,
    hasShortCode: !!process.env.TELEBIRR_SHORT_CODE,
    baseUrl: process.env.TELEBIRR_BASE_URL || 'https://app.ethiotelecom.et:4443 (default)',
  };

  return res.json({
    status: hasService ? 'ready' : 'not configured',
    config,
    message: hasService 
      ? 'Telebirr service is ready to use' 
      : 'Missing required environment variables for Telebirr',
  });
});

// -----------------------------------------------------------------------------
// TELEBIRR PAYMENT - Official Implementation
// -----------------------------------------------------------------------------
router.post("/telebirr", async (req, res) => {
  try {
    const { bookingId, amount, customerPhone } = req.body;

    // Validate inputs
    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId and amount are required",
      });
    }

    // Check if Telebirr service is configured
    if (!telebirrService) {
      const missing = [];
      if (!process.env.TELEBIRR_FABRIC_APP_ID) missing.push('TELEBIRR_FABRIC_APP_ID');
      if (!process.env.TELEBIRR_APP_SECRET) missing.push('TELEBIRR_APP_SECRET');
      if (!process.env.TELEBIRR_MERCHANT_APP_ID) missing.push('TELEBIRR_MERCHANT_APP_ID');
      
      return res.status(503).json({
        success: false,
        message: `Telebirr payment service is not configured. Missing: ${missing.join(', ')}`,
        missingVars: missing,
      });
    }

    const baseUrl = process.env.BASE_URL || req.get('origin') || 'http://localhost:5000';
    
    // Create order parameters following official Telebirr format
    const orderParams = {
      outTradeNo: `ETH-STAYS-${bookingId}-${Date.now()}`,
      subject: `Ethiopia Stays Booking #${bookingId}`,
      totalAmount: amount,
      timeout: '30m', // 30 minutes timeout
      notifyUrl: `${baseUrl}/api/payment/confirm/telebirr`,
      returnUrl: `${baseUrl}/booking/success?bookingId=${bookingId}`,
      nonce: Math.random().toString(36).substring(2, 15),
    };

    console.log('[Telebirr] Initiating payment for booking:', bookingId);
    console.log('[Telebirr] Order params:', { ...orderParams, totalAmount: `${amount} ETB` });

    // Use official Telebirr SDK flow
    const result = await telebirrService.initiatePayment(orderParams);

    console.log('[Telebirr] Payment result:', JSON.stringify(result, null, 2));

    if (result.code === 0 && result.data) {
      // Update booking with payment reference
      await db.update(bookings)
        .set({ 
          paymentStatus: "pending", 
          paymentRef: result.data.trade_no || orderParams.outTradeNo,
          paymentMethod: "telebirr",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));

      console.log('[Telebirr] ✅ Payment initiated successfully');

      return res.status(200).json({
        success: true,
        message: "Telebirr transaction initiated successfully.",
        redirectUrl: result.data.checkout_url || result.data.pay_url,
        tradeNo: result.data.trade_no,
      });
    }

    console.error('[Telebirr] ❌ Payment initiation failed:', result);
    return res.status(400).json({ 
      success: false, 
      message: result.message || "Telebirr initiation failed",
      code: result.code,
      details: result 
    });
  } catch (err: any) {
    console.error("[Telebirr] ❌ Payment error:", err);
    
    // Mark booking as pending awaiting manual payment
    const { bookingId } = req.body;
    if (bookingId) {
      await db.update(bookings)
        .set({ 
          paymentStatus: "pending", 
          paymentMethod: "telebirr",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));
    }

    return res.status(500).json({ 
      success: false, 
      message: "Telebirr payment service is temporarily unavailable. Your booking has been created and is pending payment. Please contact support.",
      error: err.toString() 
    });
  }
});

// -----------------------------------------------------------------------------
// TELEBIRR CONFIRMATION CALLBACK
// -----------------------------------------------------------------------------
router.post("/confirm/telebirr", async (req, res) => {
  try {
    const { reference, transactionStatus } = req.body;
    const bookingId = reference.split("-")[2]; // ETHIOPIA-STAYS-{bookingId}

    if (transactionStatus === "SUCCESS") {
      await db.update(bookings)
        .set({ 
          status: "confirmed",
          paymentStatus: "paid", 
          updatedAt: new Date() 
        })
        .where(eq(bookings.id, parseInt(bookingId)));
      
      // Generate access code for confirmed booking
      await generateAccessCodeForBooking(parseInt(bookingId));
    } else {
      await db.update(bookings)
        .set({ 
          status: "cancelled",
          paymentStatus: "failed", 
          updatedAt: new Date() 
        })
        .where(eq(bookings.id, parseInt(bookingId)));
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Telebirr confirm error:", err);
    return res.status(500).json({ success: false });
  }
});

// -----------------------------------------------------------------------------
// PAYPAL PAYMENT
// -----------------------------------------------------------------------------
router.post("/paypal", async (req, res) => {
  try {
    const { bookingId, amount } = req.body;
    const PAYPAL_BASE = process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // 1. Get OAuth token
    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization":
          "Basic " +
          Buffer.from(
            process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData: any = await tokenRes.json();
    const access_token = tokenData.access_token;

    // 2. Create order
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{ 
          amount: { 
            currency_code: "USD", 
            value: amount.toString() 
          },
          description: `Ethiopia Stays Booking #${bookingId}`
        }],
        application_context: {
          return_url: `${process.env.BASE_URL}/booking/success?bookingId=${bookingId}`,
          cancel_url: `${process.env.BASE_URL}/booking/cancelled?bookingId=${bookingId}`,
        }
      }),
    });

    const orderData: any = await orderRes.json();

    if (orderData.id) {
      await db.update(bookings)
        .set({ 
          paymentStatus: "pending", 
          paymentRef: orderData.id,
          paymentMethod: "paypal",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));

      return res.status(200).json({
        success: true,
        approvalUrl: orderData.links.find((l: any) => l.rel === "approve")?.href,
        orderId: orderData.id
      });
    }

    return res.status(400).json({ success: false, message: "PayPal order creation failed" });
  } catch (err) {
    console.error("PayPal error:", err);
    return res.status(500).json({ success: false, message: "PayPal initialization failed" });
  }
});

// -----------------------------------------------------------------------------
// PAYPAL CONFIRMATION (After user approval)
// -----------------------------------------------------------------------------
router.post("/confirm/paypal", async (req, res) => {
  try {
    const { bookingId, orderId } = req.body;
    
    const PAYPAL_BASE = process.env.NODE_ENV === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Get OAuth token
    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization":
          "Basic " +
          Buffer.from(
            process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });
    const tokenData: any = await tokenRes.json();
    const access_token = tokenData.access_token;

    // Capture the order
    const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    const captureData: any = await captureRes.json();

    if (captureData.status === "COMPLETED") {
      await db.update(bookings)
        .set({ 
          status: "confirmed",
          paymentStatus: "paid", 
          updatedAt: new Date() 
        })
        .where(eq(bookings.id, bookingId));
      
      // Generate access code for confirmed booking
      await generateAccessCodeForBooking(bookingId);
      
      return res.status(200).json({ success: true, message: "Payment confirmed" });
    } else {
      return res.status(400).json({ success: false, message: "Payment capture failed" });
    }
  } catch (err) {
    console.error("PayPal confirm error:", err);
    return res.status(500).json({ success: false, message: "Payment confirmation failed" });
  }
});

// -----------------------------------------------------------------------------
// STRIPE PAYMENT (Global Credit Cards, CNY, USD, etc.)
// -----------------------------------------------------------------------------
router.post("/stripe", async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ 
        success: false, 
        message: "Stripe is not configured. Please add STRIPE_SECRET_KEY to environment." 
      });
    }

    const { bookingId, amount, currency = "usd" } = req.body;

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      description: `Ethiopia Stays Booking #${bookingId}`,
      metadata: { 
        bookingId: bookingId.toString(),
        platform: "Ethiopia Stays"
      },
    });

    // Update booking with payment reference
    await db.update(bookings)
      .set({ 
        paymentStatus: "pending", 
        paymentRef: paymentIntent.id,
        paymentMethod: "stripe",
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));

    return res.status(200).json({ 
      success: true, 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (err: any) {
    console.error("Stripe payment error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Stripe payment initialization failed" 
    });
  }
});

// -----------------------------------------------------------------------------
// STRIPE WEBHOOK (Payment confirmation)
// -----------------------------------------------------------------------------
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).send("Stripe not configured");
      }

      const sig = req.headers["stripe-signature"];
      if (!sig) {
        return res.status(400).send("Missing stripe-signature header");
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: any) {
        console.log("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const bookingId = parseInt(paymentIntent.metadata.bookingId);

          console.log(`✅ Payment succeeded for booking #${bookingId}`);

          // Update booking status to confirmed and paid
          await db.update(bookings)
            .set({ 
              status: "confirmed",
              paymentStatus: "paid", 
              updatedAt: new Date() 
            })
            .where(eq(bookings.id, bookingId));
          
          // Generate access code for confirmed booking
          await generateAccessCodeForBooking(bookingId);
          break;

        case "payment_intent.payment_failed":
          const failedIntent = event.data.object as Stripe.PaymentIntent;
          const failedBookingId = parseInt(failedIntent.metadata.bookingId);

          console.log(`❌ Payment failed for booking #${failedBookingId}`);

          // Update booking status to failed
          await db.update(bookings)
            .set({ 
              status: "cancelled",
              paymentStatus: "failed", 
              updatedAt: new Date() 
            })
            .where(eq(bookings.id, failedBookingId));
          break;

        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (err) {
      console.error("Stripe webhook error:", err);
      return res.status(500).send("Webhook handler failed");
    }
  }
);

// -----------------------------------------------------------------------------
// EXPORT ROUTER
// -----------------------------------------------------------------------------
export default router;
