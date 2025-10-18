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
 * Sign request object using SHA256 with RSA private key
 * This is the official Telebirr signing method
 */
export function signRequestObject(req: any): string {
  try {
    const privateKey = process.env.TELEBIRR_PRIVATE_KEY;
    
    if (!privateKey) {
      console.warn('[Telebirr] No private key found, using hash fallback');
      const signStr = JSON.stringify(req);
      return crypto.createHash('sha256').update(signStr).digest('hex');
    }

    // Create sign string from request object (excluding sign and sign_type)
    const { sign, sign_type, ...signData } = req;
    const signStr = JSON.stringify(signData);
    
    // Sign with RSA private key
    return signWithRSA(signStr, privateKey);
  } catch (error) {
    console.error('[Telebirr] Signing error:', error);
    const signStr = JSON.stringify(req);
    return crypto.createHash('sha256').update(signStr).digest('hex');
  }
}

/**
 * Sign request object using SHA256 with RSA (for production)
 * Requires private key from Telebirr in PEM format
 */
export function signWithRSA(data: string, privateKeyPEM: string): string {
  try {
    // Ensure the private key is in proper PEM format
    let formattedKey = privateKeyPEM.trim();
    
    // Add PEM headers if missing
    if (!formattedKey.includes('-----BEGIN')) {
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
    }
    
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    
    const signature = sign.sign(formattedKey, 'base64');
    console.log('[Telebirr] RSA signature created successfully');
    return signature;
  } catch (error) {
    console.error('[Telebirr] RSA signing error:', error);
    // Fallback to SHA256 hash for development/testing
    console.warn('[Telebirr] Using SHA256 hash fallback - this may not work in production');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
