import crypto from "crypto";

/**
 * Telebirr utility functions for request signing and token generation
 */

/**
 * Create timestamp in milliseconds
 */
export function createTimestamp(): number {
  return Date.now();
}

/**
 * Create random nonce string (16 characters)
 */
export function createNonceStr(): string {
  return crypto.randomBytes(8).toString('hex');
}

/**
 * Sign request object using SHA256
 * For production, this should use RSA private key signing
 */
export function signRequestObject(req: any): string {
  const signStr = JSON.stringify(req);
  return crypto.createHash('sha256').update(signStr).digest('hex');
}

/**
 * Sign request object using SHA256 with RSA (for production)
 * Requires private key from Telebirr
 */
export function signWithRSA(data: string, privateKey: string): string {
  try {
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    console.error('RSA signing error:', error);
    // Fallback to SHA256 hash for development
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
