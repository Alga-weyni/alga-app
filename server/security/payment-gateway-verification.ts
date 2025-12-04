/**
 * INSA Security: Payment Gateway Callback Verification System
 * 
 * This module ensures that payment status changes can ONLY occur through
 * verified callbacks from payment gateways (Telebirr, Chapa, Stripe, PayPal).
 * 
 * Security Features:
 * 1. Digital signature verification using HMAC-SHA256
 * 2. Timestamp validation to prevent replay attacks
 * 3. Nonce tracking to prevent duplicate processing
 * 4. Gateway-specific verification logic
 * 5. Comprehensive audit logging
 */

import crypto from 'crypto';

// ==================== PAYMENT VERIFICATION TYPES ====================

interface PaymentVerificationResult {
  verified: boolean;
  gateway: string;
  transactionId?: string;
  bookingReference?: string;
  amount?: number;
  currency?: string;
  error?: string;
  timestamp: Date;
}

interface GatewayCallbackPayload {
  gateway: 'telebirr' | 'chapa' | 'stripe' | 'paypal';
  signature: string;
  timestamp: number;
  nonce: string;
  data: {
    transactionId: string;
    bookingReference: string;
    amount: number;
    currency: string;
    status: 'success' | 'failed' | 'pending';
    payerAccount?: string;
    metadata?: Record<string, any>;
  };
}

interface VerifiedPayment {
  id: string;
  gateway: string;
  transactionId: string;
  bookingReference: string;
  amount: number;
  currency: string;
  verifiedAt: Date;
  signatureHash: string;
  ipAddress: string;
}

// ==================== IN-MEMORY STORES ====================

// Store verified payments (in production, use Redis or database)
const verifiedPayments = new Map<string, VerifiedPayment>();

// Store used nonces to prevent replay attacks (5 minute expiry)
const usedNonces = new Map<string, number>();

// Clean up expired nonces every minute
setInterval(() => {
  const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
  const entries = Array.from(usedNonces.entries());
  for (const [nonce, timestamp] of entries) {
    if (timestamp < fiveMinutesAgo) {
      usedNonces.delete(nonce);
    }
  }
}, 60 * 1000);

// ==================== SIGNATURE VERIFICATION ====================

/**
 * Get the signing secret for a specific gateway
 */
function getGatewaySecret(gateway: string): string | null {
  switch (gateway) {
    case 'telebirr':
      return process.env.TELEBIRR_APP_SECRET || null;
    case 'chapa':
      return process.env.CHAPA_WEBHOOK_SECRET || null;
    case 'stripe':
      return process.env.STRIPE_WEBHOOK_SECRET || null;
    case 'paypal':
      return process.env.PAYPAL_WEBHOOK_ID || null;
    default:
      return null;
  }
}

/**
 * Generate HMAC-SHA256 signature for payload verification
 */
export function generateSignature(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify HMAC-SHA256 signature from payment gateway
 */
export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = generateSignature(payload, secret);
  
  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Verify Telebirr-specific callback signature
 * Telebirr uses SHA256WithRSA for signing
 */
function verifyTelebirrSignature(payload: any, signature: string): boolean {
  const publicKey = process.env.TELEBIRR_PUBLIC_KEY;
  
  if (!publicKey) {
    console.warn('[PaymentVerification] No Telebirr public key configured');
    return false;
  }
  
  try {
    // Format public key if needed
    let formattedKey = publicKey.trim();
    if (!formattedKey.includes('-----BEGIN')) {
      formattedKey = `-----BEGIN PUBLIC KEY-----\n${formattedKey}\n-----END PUBLIC KEY-----`;
    }
    
    // Create verification object
    const verify = crypto.createVerify('SHA256');
    verify.update(JSON.stringify(payload));
    verify.end();
    
    return verify.verify(formattedKey, signature, 'base64');
  } catch (error) {
    console.error('[PaymentVerification] Telebirr signature verification error:', error);
    return false;
  }
}

// ==================== CALLBACK VERIFICATION ====================

/**
 * Verify payment gateway callback with comprehensive security checks
 */
export async function verifyPaymentCallback(
  payload: GatewayCallbackPayload,
  ipAddress: string
): Promise<PaymentVerificationResult> {
  const startTime = Date.now();
  
  // Step 1: Validate required fields
  if (!payload.gateway || !payload.signature || !payload.timestamp || !payload.nonce || !payload.data) {
    return {
      verified: false,
      gateway: payload.gateway || 'unknown',
      error: 'Missing required fields in callback payload',
      timestamp: new Date(),
    };
  }
  
  // Step 2: Check timestamp validity (5 minute window)
  const callbackAge = Date.now() - payload.timestamp;
  const MAX_CALLBACK_AGE = 5 * 60 * 1000; // 5 minutes
  
  if (callbackAge < 0 || callbackAge > MAX_CALLBACK_AGE) {
    console.warn(`[PaymentVerification] Callback timestamp out of range: ${callbackAge}ms`);
    return {
      verified: false,
      gateway: payload.gateway,
      error: 'Callback timestamp out of valid range (possible replay attack)',
      timestamp: new Date(),
    };
  }
  
  // Step 3: Check nonce uniqueness (prevent replay)
  if (usedNonces.has(payload.nonce)) {
    console.warn(`[PaymentVerification] Duplicate nonce detected: ${payload.nonce}`);
    return {
      verified: false,
      gateway: payload.gateway,
      error: 'Duplicate nonce detected (replay attack prevented)',
      timestamp: new Date(),
    };
  }
  
  // Step 4: Get gateway secret
  const secret = getGatewaySecret(payload.gateway);
  if (!secret) {
    return {
      verified: false,
      gateway: payload.gateway,
      error: `Gateway ${payload.gateway} not configured or missing secret`,
      timestamp: new Date(),
    };
  }
  
  // Step 5: Verify signature based on gateway type
  let signatureValid = false;
  const signaturePayload = JSON.stringify({
    timestamp: payload.timestamp,
    nonce: payload.nonce,
    data: payload.data,
  });
  
  if (payload.gateway === 'telebirr') {
    signatureValid = verifyTelebirrSignature(
      { timestamp: payload.timestamp, nonce: payload.nonce, data: payload.data },
      payload.signature
    );
    
    // Fallback to HMAC for development/testing
    if (!signatureValid) {
      signatureValid = verifySignature(signaturePayload, payload.signature, secret);
    }
  } else {
    signatureValid = verifySignature(signaturePayload, payload.signature, secret);
  }
  
  if (!signatureValid) {
    console.warn(`[PaymentVerification] Invalid signature for ${payload.gateway} callback`);
    return {
      verified: false,
      gateway: payload.gateway,
      transactionId: payload.data?.transactionId,
      error: 'Invalid digital signature - callback rejected',
      timestamp: new Date(),
    };
  }
  
  // Step 6: Mark nonce as used
  usedNonces.set(payload.nonce, Date.now());
  
  // Step 7: Store verified payment
  const verificationId = crypto.randomUUID();
  const verifiedPayment: VerifiedPayment = {
    id: verificationId,
    gateway: payload.gateway,
    transactionId: payload.data.transactionId,
    bookingReference: payload.data.bookingReference,
    amount: payload.data.amount,
    currency: payload.data.currency,
    verifiedAt: new Date(),
    signatureHash: crypto.createHash('sha256').update(payload.signature).digest('hex'),
    ipAddress,
  };
  
  verifiedPayments.set(verificationId, verifiedPayment);
  
  // Also store by transaction ID for lookup
  verifiedPayments.set(`txn:${payload.data.transactionId}`, verifiedPayment);
  verifiedPayments.set(`ref:${payload.data.bookingReference}`, verifiedPayment);
  
  console.log(`[PaymentVerification] ✅ Payment verified: ${payload.data.transactionId} (${Date.now() - startTime}ms)`);
  
  return {
    verified: true,
    gateway: payload.gateway,
    transactionId: payload.data.transactionId,
    bookingReference: payload.data.bookingReference,
    amount: payload.data.amount,
    currency: payload.data.currency,
    timestamp: new Date(),
  };
}

// ==================== VERIFICATION LOOKUP ====================

/**
 * Check if a payment has been verified through gateway callback
 */
export function isPaymentVerified(transactionIdOrBookingRef: string): VerifiedPayment | null {
  // Try direct transaction ID lookup
  let payment = verifiedPayments.get(`txn:${transactionIdOrBookingRef}`);
  if (payment) return payment;
  
  // Try booking reference lookup
  payment = verifiedPayments.get(`ref:${transactionIdOrBookingRef}`);
  if (payment) return payment;
  
  return null;
}

/**
 * Get verification status for a booking
 */
export function getPaymentVerificationStatus(bookingReference: string): {
  verified: boolean;
  payment?: VerifiedPayment;
  message: string;
} {
  const payment = verifiedPayments.get(`ref:${bookingReference}`);
  
  if (payment) {
    return {
      verified: true,
      payment,
      message: `Payment verified via ${payment.gateway} at ${payment.verifiedAt.toISOString()}`,
    };
  }
  
  return {
    verified: false,
    message: 'No verified payment found for this booking. Payment must be confirmed through official payment gateway callback.',
  };
}

// ==================== SIGNATURE GENERATION FOR TESTING ====================

/**
 * Generate a test callback payload with valid signature (for development/testing only)
 */
export function generateTestCallback(
  gateway: 'telebirr' | 'chapa' | 'stripe' | 'paypal',
  transactionId: string,
  bookingReference: string,
  amount: number,
  currency: string = 'ETB'
): GatewayCallbackPayload | null {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    console.error('[PaymentVerification] Test callback generation not allowed in production');
    return null;
  }
  
  const secret = getGatewaySecret(gateway);
  if (!secret) {
    console.error(`[PaymentVerification] No secret configured for ${gateway}`);
    return null;
  }
  
  const timestamp = Date.now();
  const nonce = crypto.randomBytes(16).toString('hex');
  const data = {
    transactionId,
    bookingReference,
    amount,
    currency,
    status: 'success' as const,
  };
  
  const signaturePayload = JSON.stringify({ timestamp, nonce, data });
  const signature = generateSignature(signaturePayload, secret);
  
  return {
    gateway,
    signature,
    timestamp,
    nonce,
    data,
  };
}

// ==================== CLEANUP ====================

/**
 * Clear old verified payments (call periodically)
 */
export function cleanupVerifiedPayments(maxAgeHours: number = 24): number {
  const cutoff = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
  let cleaned = 0;
  
  const entries = Array.from(verifiedPayments.entries());
  for (const [key, payment] of entries) {
    if (payment.verifiedAt < cutoff) {
      verifiedPayments.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
}

// Clean up old payments every hour
setInterval(() => {
  const cleaned = cleanupVerifiedPayments(24);
  if (cleaned > 0) {
    console.log(`[PaymentVerification] Cleaned up ${cleaned} old verified payments`);
  }
}, 60 * 60 * 1000);

export type { GatewayCallbackPayload, PaymentVerificationResult, VerifiedPayment };
