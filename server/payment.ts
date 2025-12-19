import express from "express";
import Stripe from "stripe";
import { Chapa } from "chapa-nodejs";
// @ts-ignore - arifpay SDK has nested default export
import ArifpayPkg from "arifpay";
import axios from "axios";

// Helper function to format expire date for Arifpay (same format as SDK helper)
function getExpireDateFromDate(date: Date): string {
  return date.toISOString();
}
import { db } from './db.js';
import { bookings } from '../shared/schema.js';
import { eq } from "drizzle-orm";
import { createTelebirrService } from './services/telebirr.service.js';
import { storage } from './storage.js';

const router = express.Router();

// Initialize Chapa
const chapa = process.env.CHAPA_SECRET_KEY
  ? new Chapa({ secretKey: process.env.CHAPA_SECRET_KEY })
  : null;

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
// CHAPA PAYMENT (Ethiopian Local Payment Gateway)
// -----------------------------------------------------------------------------
router.post("/chapa/initiate", async (req, res) => {
  try {
    if (!chapa) {
      return res.status(500).json({ 
        success: false, 
        message: "Chapa is not configured. Please add CHAPA_SECRET_KEY to environment." 
      });
    }

    const { bookingId, amount, currency = "ETB" } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId and amount are required"
      });
    }

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Get guest details
    const guest = await storage.getUser(booking.guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found"
      });
    }

    // Generate unique transaction reference
    const tx_ref = `ALGA-${bookingId}-${Date.now()}`;

    const baseUrl = process.env.BASE_URL || req.get('origin') || 'http://localhost:5000';

    // Initialize Chapa payment
    const response = await chapa.initialize({
      amount: amount.toString(),
      currency,
      email: guest.email || `guest${booking.guestId}@algaapp.com`,
      first_name: guest.firstName || "Guest",
      last_name: guest.lastName || "User",
      tx_ref,
      callback_url: `${baseUrl}/api/payment/chapa/callback`,
      return_url: `${baseUrl}/booking/success?bookingId=${bookingId}`,
      customization: {
        title: "Alga Property Rental",
        description: `Booking #${bookingId} - Property Payment`
      }
    });

    console.log('[Chapa] Payment initiated:', { bookingId, tx_ref, amount });

    // Check if we have a valid response
    if (!response.data || !response.data.checkout_url) {
      throw new Error("Invalid response from Chapa: missing checkout URL");
    }

    // Update booking with payment reference
    await db.update(bookings)
      .set({ 
        paymentStatus: "pending", 
        paymentRef: tx_ref,
        paymentMethod: "chapa",
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));

    return res.status(200).json({
      success: true,
      checkout_url: response.data.checkout_url,
      tx_ref,
      message: "Chapa payment initialized successfully"
    });
  } catch (err: any) {
    console.error("[Chapa] Payment initialization error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Chapa payment initialization failed",
      error: err.toString()
    });
  }
});

// -----------------------------------------------------------------------------
// CHAPA PAYMENT CALLBACK (Webhook)
// -----------------------------------------------------------------------------
router.post("/chapa/callback", async (req, res) => {
  try {
    console.log('[Chapa] Callback received:', req.body);

    const { tx_ref, status } = req.body;

    if (!tx_ref) {
      return res.status(400).json({
        success: false,
        message: "Missing tx_ref in callback"
      });
    }

    // Find booking by payment reference
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.paymentRef, tx_ref))
      .limit(1);

    if (!booking) {
      console.error('[Chapa] Booking not found for tx_ref:', tx_ref);
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Verify payment with Chapa
    if (chapa) {
      const verification = await chapa.verify({ tx_ref });
      
      console.log('[Chapa] Verification result:', verification);

      if (verification.status === 'success' && verification.data.status === 'success') {
        // Payment successful
        await db.update(bookings)
          .set({ 
            status: "confirmed",
            paymentStatus: "paid", 
            updatedAt: new Date() 
          })
          .where(eq(bookings.id, booking.id));
        
        // Generate access code for confirmed booking
        await generateAccessCodeForBooking(booking.id);
        
        console.log(`✅ [Chapa] Payment confirmed for booking #${booking.id}`);
        
        return res.status(200).json({ 
          success: true,
          message: "Payment verified and booking confirmed"
        });
      } else {
        // Payment failed
        await db.update(bookings)
          .set({ 
            status: "cancelled",
            paymentStatus: "failed", 
            updatedAt: new Date() 
          })
          .where(eq(bookings.id, booking.id));
        
        console.log(`❌ [Chapa] Payment failed for booking #${booking.id}`);
        
        return res.status(400).json({ 
          success: false,
          message: "Payment verification failed"
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: "Chapa service not available"
    });
  } catch (err: any) {
    console.error("[Chapa] Callback error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Payment callback processing failed",
      error: err.toString()
    });
  }
});

// -----------------------------------------------------------------------------
// CHAPA PAYMENT VERIFICATION (Manual check)
// -----------------------------------------------------------------------------
router.get("/chapa/verify/:tx_ref", async (req, res) => {
  try {
    if (!chapa) {
      return res.status(500).json({ 
        success: false, 
        message: "Chapa is not configured" 
      });
    }

    const { tx_ref } = req.params;

    // Verify with Chapa
    const verification = await chapa.verify({ tx_ref });
    
    console.log('[Chapa] Manual verification for:', tx_ref, verification);

    // Find booking
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.paymentRef, tx_ref))
      .limit(1);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    if (verification.status === 'success' && verification.data.status === 'success') {
      // Update booking if not already paid
      if (booking.paymentStatus !== 'paid') {
        await db.update(bookings)
          .set({ 
            status: "confirmed",
            paymentStatus: "paid", 
            updatedAt: new Date() 
          })
          .where(eq(bookings.id, booking.id));
        
        // Generate access code
        await generateAccessCodeForBooking(booking.id);
      }

      return res.status(200).json({
        success: true,
        status: 'paid',
        booking_id: booking.id,
        message: "Payment verified successfully"
      });
    } else {
      return res.status(200).json({
        success: false,
        status: verification.data.status || 'pending',
        message: "Payment not yet completed"
      });
    }
  } catch (err: any) {
    console.error("[Chapa] Verification error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Payment verification failed",
      error: err.toString()
    });
  }
});

// -----------------------------------------------------------------------------
// ARIFPAY PAYMENT (Ethiopian Licensed Payment Gateway)
// -----------------------------------------------------------------------------

// Initialize Arifpay (SDK has nested default export structure)
const ArifpayClass = (ArifpayPkg as any).default || ArifpayPkg;
let arifpay: any = null;
try {
  if (process.env.ARIFPAY_API_KEY && ArifpayClass) {
    arifpay = new ArifpayClass(process.env.ARIFPAY_API_KEY);
    console.log('[Arifpay] ✅ Payment gateway initialized');
  }
} catch (err) {
  console.error('[Arifpay] Failed to initialize:', err);
}

// Arifpay status check
router.get("/status/arifpay", (req, res) => {
  const configured = !!arifpay;
  return res.json({
    status: configured ? 'ready' : 'not configured',
    configured,
    hasApiKey: !!process.env.ARIFPAY_API_KEY,
    message: configured 
      ? 'Arifpay service is ready to use' 
      : 'Missing ARIFPAY_API_KEY environment variable',
  });
});

// Initiate Arifpay payment
router.post("/arifpay/initiate", async (req, res) => {
  try {
    if (!arifpay) {
      return res.status(500).json({ 
        success: false, 
        message: "Arifpay is not configured. Please add ARIFPAY_API_KEY to environment." 
      });
    }

    const { bookingId, amount, paymentMethods = ['TELEBIRR'], phoneNumber } = req.body;

    if (!bookingId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: bookingId and amount are required"
      });
    }

    // Get booking details
    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    // Get guest details
    const guest = await storage.getUser(booking.guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest not found"
      });
    }

    // Get property details for description
    const property = await storage.getProperty(booking.propertyId);

    const baseUrl = process.env.BASE_URL || req.get('origin') || 'http://localhost:5000';
    // Arifpay requires numeric string nonce
    const nonce = Math.floor(Math.random() * 10000).toString();

    // Calculate expire date (24 hours from now)
    // ArifPay expects format: YYYY-MM-DDTHH:mm:ss (no milliseconds, no Z)
    const expireDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const formattedExpireDate = expireDate.toISOString().split('.')[0];

    // Create checkout session with Arifpay
    // Calculate price with 2.5% payment processing fee (customer pays the fee)
    const basePrice = Math.round(parseFloat(amount) * 100) / 100;
    const paymentFee = Math.round(basePrice * 0.025 * 100) / 100; // 2.5% fee
    const arifPayPrice = Math.round((basePrice + paymentFee) * 100) / 100;
    
    console.log('[Arifpay] Price calculation:', { basePrice, paymentFee, arifPayPrice });
    
    const checkoutData = {
      cancelUrl: `${baseUrl}/booking/cancelled?bookingId=${bookingId}`,
      errorUrl: `${baseUrl}/booking/error?bookingId=${bookingId}`,
      notifyUrl: `${baseUrl}/api/payment/arifpay/webhook`,
      successUrl: `${baseUrl}/booking/success?bookingId=${bookingId}`,
      // Use provided phone, or guest's stored phone, or placeholder as last resort
      phone: (phoneNumber || guest.phoneNumber || "0911111111").replace(/[^0-9]/g, '').slice(-10),
      email: guest.email || "guest@alga.et",
      nonce,
      expireDate: formattedExpireDate,
      paymentMethods: [],
      items: [
        {
          name: (property?.title || `Booking ${bookingId}`).slice(0, 50),
          price: arifPayPrice,
          quantity: 1
        }
      ],
      beneficiaries: [
        {
          accountNumber: "01320811436100",
          bank: "AWINETAA",
          amount: arifPayPrice
        }
      ],
      lang: "EN"
    };

    console.log('[Arifpay] Initiating payment:', { bookingId, amount, nonce, checkoutData });

    // Use sandbox mode based on environment variable or default to sandbox for safety
    // Set ARIFPAY_SANDBOX=false in production when using production API key
    const isSandbox = process.env.ARIFPAY_SANDBOX !== 'false';
    console.log('[Arifpay] Using sandbox mode:', isSandbox);
    
    // Use direct API call to get actual error messages (SDK swallows errors)
    const apiUrl = isSandbox 
      ? 'https://gateway.arifpay.net/api/sandbox/checkout/session'
      : 'https://gateway.arifpay.net/api/checkout/session';
    
    console.log('[Arifpay] Making direct API call to:', apiUrl);
    
    let session;
    try {
      const response = await axios.post(apiUrl, checkoutData, {
        headers: {
          'Content-Type': 'application/json',
          'x-arifpay-key': process.env.ARIFPAY_API_KEY || ''
        }
      });
      
      console.log('[Arifpay] API Response:', response.data);
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.msg || response.data?.message || 'Unknown ArifPay error');
      }
      
      session = response.data.data;
      console.log('[Arifpay] Session created:', session);
    } catch (createErr: any) {
      console.error('[Arifpay] Checkout create failed:', {
        status: createErr?.response?.status,
        statusText: createErr?.response?.statusText,
        responseData: createErr?.response?.data,
        errorMessage: createErr?.message
      });
      
      // Return actual error message from API
      const apiError = createErr?.response?.data;
      throw new Error(apiError?.msg || apiError?.message || apiError?.error || createErr?.message || 'ArifPay API error');
    }

    // Update booking with payment reference
    await db.update(bookings)
      .set({ 
        paymentStatus: "pending", 
        paymentRef: session.sessionId || nonce,
        paymentMethod: "arifpay",
        updatedAt: new Date()
      })
      .where(eq(bookings.id, bookingId));

    return res.status(200).json({
      success: true,
      sessionId: session.sessionId,
      paymentUrl: session.paymentUrl,
      nonce,
      message: "Arifpay payment initialized successfully"
    });
  } catch (err: any) {
    console.error("[Arifpay] Payment initialization error:", err);
    console.error("[Arifpay] Error details:", {
      name: err?.name,
      message: err?.message,
      msg: err?.msg,
      data: err?.data,
      response: err?.response?.data
    });
    return res.status(500).json({ 
      success: false, 
      message: err.message || err.msg || "Arifpay payment initialization failed",
      error: err.toString(),
      details: err?.data || err?.response?.data
    });
  }
});

// Arifpay webhook callback
router.post("/arifpay/webhook", async (req, res) => {
  try {
    console.log('[Arifpay] Webhook received:', req.body);

    const { sessionId, transactionId, status, nonce } = req.body;

    // Find booking by payment reference (sessionId or nonce)
    const paymentRef = sessionId || nonce;
    
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.paymentRef, paymentRef))
      .limit(1);

    if (!booking) {
      // Try to extract booking ID from nonce (ALGA-{bookingId}-{timestamp})
      const parts = nonce?.split('-');
      if (parts && parts[1]) {
        const bookingId = parseInt(parts[1]);
        const [foundBooking] = await db.select()
          .from(bookings)
          .where(eq(bookings.id, bookingId))
          .limit(1);
        
        if (foundBooking) {
          await processArifpayResult(foundBooking.id, status, transactionId);
          return res.status(200).json({ success: true });
        }
      }
      
      console.error('[Arifpay] Booking not found for ref:', paymentRef);
      return res.status(404).json({
        success: false,
        message: "Booking not found"
      });
    }

    await processArifpayResult(booking.id, status, transactionId);

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("[Arifpay] Webhook error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Webhook processing failed"
    });
  }
});

// Helper function to process Arifpay result
async function processArifpayResult(bookingId: number, status: string, transactionId?: string) {
  if (status === 'SUCCESS' || status === 'COMPLETED') {
    await db.update(bookings)
      .set({ 
        status: "confirmed",
        paymentStatus: "paid",
        paymentRef: transactionId || bookings.paymentRef,
        updatedAt: new Date() 
      })
      .where(eq(bookings.id, bookingId));
    
    // Generate access code for confirmed booking
    await generateAccessCodeForBooking(bookingId);
    
    console.log(`✅ [Arifpay] Payment confirmed for booking #${bookingId}`);
  } else if (status === 'FAILED' || status === 'CANCELLED') {
    await db.update(bookings)
      .set({ 
        status: "cancelled",
        paymentStatus: "failed", 
        updatedAt: new Date() 
      })
      .where(eq(bookings.id, bookingId));
    
    console.log(`❌ [Arifpay] Payment failed for booking #${bookingId}`);
  }
}

// Fetch Arifpay session status
router.get("/arifpay/status/:sessionId", async (req, res) => {
  try {
    if (!arifpay) {
      return res.status(500).json({ 
        success: false, 
        message: "Arifpay is not configured" 
      });
    }

    const { sessionId } = req.params;

    const isSandbox = process.env.NODE_ENV !== 'production';
    const session = await arifpay.checkout.fetch(sessionId, { sandbox: isSandbox });

    console.log('[Arifpay] Session status:', session);

    // Find booking
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.paymentRef, sessionId))
      .limit(1);

    // Process based on status (use any type for flexible SDK response)
    const txn = session.transaction as any;
    const txnStatus = txn?.status || txn?.transactionStatus;
    
    if (txnStatus === 'SUCCESS' || txnStatus === 'COMPLETED') {
      if (booking && booking.paymentStatus !== 'paid') {
        await processArifpayResult(booking.id, 'SUCCESS', String(txn?.id || txn?.transactionId || ''));
      }
      
      return res.status(200).json({
        success: true,
        status: 'paid',
        session,
        message: "Payment completed successfully"
      });
    }

    return res.status(200).json({
      success: true,
      status: txnStatus || 'pending',
      session,
      message: "Session fetched successfully"
    });
  } catch (err: any) {
    console.error("[Arifpay] Status check error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch session status"
    });
  }
});

// Cancel Arifpay session
router.post("/arifpay/cancel/:sessionId", async (req, res) => {
  try {
    if (!arifpay) {
      return res.status(500).json({ 
        success: false, 
        message: "Arifpay is not configured" 
      });
    }

    const { sessionId } = req.params;

    const isSandbox = process.env.NODE_ENV !== 'production';
    const result = await arifpay.checkout.cancel(sessionId, { sandbox: isSandbox });

    console.log('[Arifpay] Session cancelled:', result);

    // Update booking
    const [booking] = await db.select()
      .from(bookings)
      .where(eq(bookings.paymentRef, sessionId))
      .limit(1);

    if (booking) {
      await db.update(bookings)
        .set({ 
          status: "cancelled",
          paymentStatus: "cancelled", 
          updatedAt: new Date() 
        })
        .where(eq(bookings.id, booking.id));
    }

    return res.status(200).json({
      success: true,
      message: "Session cancelled successfully"
    });
  } catch (err: any) {
    console.error("[Arifpay] Cancel error:", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to cancel session"
    });
  }
});

// -----------------------------------------------------------------------------
// EXPORT ROUTER
// -----------------------------------------------------------------------------
export default router;
