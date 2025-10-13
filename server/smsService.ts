import crypto from 'crypto';

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface OTPVerification {
  phone: string;
  code: string;
  expiresAt: Date;
  attempts: number;
}

// In-memory storage for OTP codes (in production, use Redis or database)
const otpStorage = new Map<string, OTPVerification>();

export class EthioTelecomSMSService {
  private apiKey: string;
  private endpoint: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.ETHIO_TELECOM_API_KEY || '';
    this.endpoint = process.env.ETHIO_TELECOM_SMS_ENDPOINT || 'https://api.ethiotelecom.et/sms/send';
    this.senderId = process.env.ETHIO_TELECOM_SENDER_ID || 'ALGA';
  }

  // Generate 6-digit OTP code
  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send SMS via Ethio Telecom API
  private async sendSMS(phone: string, message: string): Promise<SMSResponse> {
    try {
      if (!this.apiKey) {
        console.log(`[DEV MODE] SMS to ${phone}: ${message}`);
        return { success: true, messageId: 'dev_' + Date.now() };
      }

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          sender: this.senderId,
          recipient: phone,
          message: message,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: result.messageId || result.id,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Failed to send SMS',
        };
      }
    } catch (error) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: 'Network error occurred',
      };
    }
  }

  // Send verification code to Ethiopian phone number
  async sendVerificationCode(phone: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate Ethiopian phone number format
      const cleanPhone = this.normalizeEthiopianPhone(phone);
      if (!cleanPhone) {
        return { success: false, error: 'Invalid Ethiopian phone number format' };
      }

      // Check rate limiting
      const existing = otpStorage.get(cleanPhone);
      if (existing && existing.expiresAt > new Date()) {
        const timeDiff = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000);
        if (timeDiff > 240) { // 4 minutes remaining
          return { success: false, error: 'Please wait before requesting another code' };
        }
      }

      // Generate OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Create message in English and Amharic
      const message = `Your Ethiopia Stays verification code is: ${otp}\nValid for 5 minutes.\n\nየእርስዎ የኢትዮጵያ ቁያ ማረጋገጫ ኮድ: ${otp}`;

      // Send SMS
      const smsResult = await this.sendSMS(cleanPhone, message);

      if (smsResult.success) {
        // Store OTP
        otpStorage.set(cleanPhone, {
          phone: cleanPhone,
          code: otp,
          expiresAt,
          attempts: 0,
        });

        return { success: true };
      } else {
        return { success: false, error: smsResult.error };
      }
    } catch (error) {
      console.error('Error sending verification code:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  }

  // Verify OTP code
  async verifyCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanPhone = this.normalizeEthiopianPhone(phone);
      if (!cleanPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      const stored = otpStorage.get(cleanPhone);
      if (!stored) {
        return { success: false, error: 'No verification code found. Please request a new one.' };
      }

      // Check expiration
      if (stored.expiresAt < new Date()) {
        otpStorage.delete(cleanPhone);
        return { success: false, error: 'Verification code has expired. Please request a new one.' };
      }

      // Check attempts
      if (stored.attempts >= 3) {
        otpStorage.delete(cleanPhone);
        return { success: false, error: 'Too many failed attempts. Please request a new code.' };
      }

      // Verify code
      if (stored.code === code.trim()) {
        otpStorage.delete(cleanPhone);
        return { success: true };
      } else {
        stored.attempts++;
        return { success: false, error: 'Invalid verification code. Please try again.' };
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  }

  // Normalize Ethiopian phone number to international format
  private normalizeEthiopianPhone(phone: string): string | null {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');

    // Handle different Ethiopian phone number formats
    if (digits.startsWith('251')) {
      // Already has country code
      if (digits.length === 12) {
        return '+' + digits;
      }
    } else if (digits.startsWith('0')) {
      // Local format starting with 0
      if (digits.length === 10) {
        return '+251' + digits.substring(1);
      }
    } else if (digits.length === 9) {
      // Without leading 0 or country code
      return '+251' + digits;
    }

    return null; // Invalid format
  }

  // Clean up expired OTPs (call this periodically)
  cleanupExpiredOTPs(): void {
    const now = new Date();
    const phonesToDelete: string[] = [];
    
    otpStorage.forEach((otp, phone) => {
      if (otp.expiresAt < now) {
        phonesToDelete.push(phone);
      }
    });
    
    phonesToDelete.forEach(phone => otpStorage.delete(phone));
  }
}

export const smsService = new EthioTelecomSMSService();

// Clean up expired OTPs every 10 minutes
setInterval(() => {
  smsService.cleanupExpiredOTPs();
}, 10 * 60 * 1000);