import { createCipher, createDecipher, createHash, randomBytes } from "crypto";

// Encryption key (in production, use environment variable)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "alga-ethiopian-signature-compliance-2025";

// Encrypt sensitive data (IP address, device info)
export function encrypt(text: string): string {
  const algorithm = "aes-256-cbc";
  const key = createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = randomBytes(16);
  
  const cipher = createCipher(algorithm, key);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt sensitive data (for audit retrieval)
export function decrypt(encryptedText: string): string {
  try {
    const algorithm = "aes-256-cbc";
    const key = createHash('sha256').update(ENCRYPTION_KEY).digest();
    const [ivHex, encrypted] = encryptedText.split(':');
    
    const decipher = createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('[CRYPTO] Decryption failed:', error);
    return '[ENCRYPTED]';
  }
}

// Generate SHA-256 signature hash (user_id + action + timestamp)
export function generateSignatureHash(userId: string, action: string, timestamp: Date): string {
  const data = `${userId}|${action}|${timestamp.toISOString()}`;
  return createHash('sha256').update(data).digest('hex');
}

// Generate UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
