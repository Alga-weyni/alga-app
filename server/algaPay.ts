import type { Request, Response } from "express";
import { Chapa } from "chapa-nodejs";
import Stripe from "stripe";
// @ts-ignore - arifpay SDK has nested default export
import ArifpayPkg from "arifpay";

// Initialize payment processors (hidden from users)
const chapa = process.env.CHAPA_SECRET_KEY
  ? new Chapa({ secretKey: process.env.CHAPA_SECRET_KEY })
  : null;

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    })
  : null;

// Initialize Arifpay (SDK has nested default export structure)
const ArifpayClass = (ArifpayPkg as any).default || ArifpayPkg;
let arifpay: any = null;
try {
  if (process.env.ARIFPAY_API_KEY && ArifpayClass) {
    arifpay = new ArifpayClass(process.env.ARIFPAY_API_KEY);
  }
} catch (err) {
  console.error('[Alga Pay] Failed to initialize Arifpay:', err);
}

/**
 * Alga Pay Handler - Unified payment interface
 * Abstracts underlying payment processor from users
 * Users only see "Alga Pay" branding
 */
export const algaPayHandler = async (req: Request, res: Response) => {
  const { amount, email, orderId, method = "chapa", userId, phone } = req.body;
  
  // Validation
  if (!amount || !email || !orderId) {
    return res.status(400).json({ 
      success: false,
      error: "Missing required fields: amount, email, orderId" 
    });
  }

  try {
    const txRef = `ALGA-${Date.now()}-${orderId}`;
    const baseUrl = process.env.BASE_URL || req.get('origin') || 'http://localhost:5000';
    const callbackUrl = `${baseUrl}/api/payment-callback`;
    const returnUrl = `${baseUrl}/booking/success?orderId=${orderId}`;

    // Route to appropriate payment processor (hidden from user)
    if (method === "chapa" && chapa) {
      // Chapa for Ethiopian users
      const chapaResponse = await chapa.initialize({
        amount: amount.toString(),
        currency: "ETB",
        email,
        first_name: email.split('@')[0],
        last_name: "Guest",
        tx_ref: txRef,
        callback_url: callbackUrl,
        return_url: returnUrl,
        customization: {
          title: "Alga Payment",
          description: `Payment for order #${orderId}`,
        },
      });

      return res.json({
        success: true,
        provider: "algaPay", // Never expose "Chapa"
        txRef,
        checkoutUrl: chapaResponse.data?.checkout_url || "",
      });
    } 
    else if (method === "stripe" && stripe) {
      // Stripe for international users
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "usd",
            product_data: {
              name: "Alga Booking",
              description: `Payment for order #${orderId}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        }],
        mode: "payment",
        success_url: returnUrl,
        cancel_url: `${baseUrl}/booking/cancelled?orderId=${orderId}`,
        metadata: {
          orderId: orderId.toString(),
          txRef,
        },
      });

      return res.json({
        success: true,
        provider: "algaPay", // Never expose "Stripe"
        txRef,
        checkoutUrl: session.url,
      });
    }
    else if (method === "arifpay" && arifpay) {
      // Arif Pay for Ethiopian users (Telebirr, Awash Wallet, Cards)
      const isProduction = process.env.NODE_ENV === 'production';
      const webhookUrl = `${baseUrl}/api/payment/arifpay/webhook`;
      
      const arifpayData = {
        cancelUrl: `${baseUrl}/booking/cancelled?orderId=${orderId}`,
        successUrl: returnUrl,
        errorUrl: `${baseUrl}/booking/error?orderId=${orderId}`,
        notifyUrl: webhookUrl,
        paymentMethods: ["TELEBIRR", "CARD"],
        expireDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        items: [{
          name: `Alga Booking #${orderId}`,
          quantity: 1,
          price: amount,
          description: `Property rental payment`,
          image: "https://alga.et/logo.png",
        }],
        beneficiaries: [{
          accountNumber: process.env.ARIFPAY_MERCHANT_ACCOUNT || "01234567890123",
          bank: "COMMERCIAL_BANK_OF_ETHIOPIA",
          amount: amount,
        }],
        lang: "EN",
        nonce: txRef,
      };

      const arifpaySession: any = await arifpay.checkout.create(arifpayData, { sandbox: !isProduction });

      return res.json({
        success: true,
        provider: "algaPay", // Never expose "Arifpay"
        txRef,
        sessionId: arifpaySession?.data?.sessionId || arifpaySession?.sessionId,
        checkoutUrl: arifpaySession?.data?.paymentUrl || arifpaySession?.paymentUrl,
      });
    }
    else {
      // No payment processor configured
      return res.status(503).json({
        success: false,
        error: "Payment service temporarily unavailable",
      });
    }
  } catch (error: any) {
    console.error("❌ Alga Pay Error:", error);
    return res.status(500).json({
      success: false,
      error: "Payment processing failed. Please try again.",
    });
  }
};
