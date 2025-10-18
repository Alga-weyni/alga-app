import express from "express";
import Stripe from "stripe";
import { db } from "./db";
import { bookings } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-11-20.acacia",
    })
  : null;

// -----------------------------------------------------------------------------
// TELEBIRR PAYMENT
// -----------------------------------------------------------------------------
router.post("/telebirr", async (req, res) => {
  try {
    const { bookingId, amount, customerPhone } = req.body;

    const payload = {
      appid: process.env.TELEBIRR_APP_ID,
      appkey: process.env.TELEBIRR_API_KEY,
      nonce: Math.random().toString(36).substring(2, 15),
      amount,
      msisdn: customerPhone,
      reference: `ETHIOPIA-STAYS-${bookingId}`,
      callbackUrl: `${process.env.BASE_URL}/api/payment/confirm/telebirr`,
    };

    const response = await fetch("https://api.telebirr.com/payments/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data: any = await response.json();
    if (data?.status === "SUCCESS") {
      await db.update(bookings)
        .set({ 
          paymentStatus: "pending", 
          paymentRef: data.transactionId,
          paymentMethod: "telebirr",
          updatedAt: new Date()
        })
        .where(eq(bookings.id, bookingId));
      return res.status(200).json({
        success: true,
        message: "Telebirr transaction initiated.",
        redirectUrl: data.checkoutUrl,
      });
    }

    return res.status(400).json({ success: false, message: "Telebirr initiation failed", data });
  } catch (err) {
    console.error("Telebirr error:", err);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
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
