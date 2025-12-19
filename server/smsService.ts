import crypto from 'crypto';
import twilio from 'twilio';

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

const otpStorage = new Map<string, OTPVerification>();

const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export class SMSService {
  private twilioPhone: string;
  private ethioApiKey: string;
  private ethioEndpoint: string;
  private senderId: string;

  constructor() {
    this.twilioPhone = process.env.TWILIO_PHONE_NUMBER || '';
    this.ethioApiKey = process.env.ETHIO_TELECOM_API_KEY || '';
    this.ethioEndpoint = process.env.ETHIO_TELECOM_SMS_ENDPOINT || 'https://api.ethiotelecom.et/sms/send';
    this.senderId = process.env.ETHIO_TELECOM_SENDER_ID || 'ALGA';
  }

  private generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  private async sendViaTwilio(phone: string, message: string): Promise<SMSResponse> {
    if (!twilioClient || !this.twilioPhone) {
      console.log('[SMS] Twilio not configured, skipping SMS');
      return { success: false, error: 'Twilio not configured' };
    }

    try {
      const result = await twilioClient.messages.create({
        from: this.twilioPhone,
        to: phone,
        body: message,
      });

      console.log(`[SMS] ✅ Twilio SMS sent to ${phone}, SID: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error: any) {
      console.error('[SMS] ❌ Twilio error:', error.message);
      return { success: false, error: error.message || 'Twilio SMS failed' };
    }
  }

  private async sendViaEthioTelecom(phone: string, message: string): Promise<SMSResponse> {
    if (!this.ethioApiKey) {
      console.log('[SMS] EthioTelecom not configured');
      return { success: false, error: 'EthioTelecom not configured' };
    }

    try {
      const response = await fetch(this.ethioEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.ethioApiKey}`,
        },
        body: JSON.stringify({
          sender: this.senderId,
          recipient: phone,
          message: message,
        }),
      });

      const result = await response.json() as { messageId?: string; id?: string; error?: string };

      if (response.ok) {
        console.log(`[SMS] ✅ EthioTelecom SMS sent to ${phone}`);
        return { success: true, messageId: result.messageId || result.id };
      } else {
        return { success: false, error: result.error || 'Failed to send SMS' };
      }
    } catch (error: any) {
      console.error('[SMS] ❌ EthioTelecom error:', error.message);
      return { success: false, error: 'Network error occurred' };
    }
  }

  private async sendSMS(phone: string, message: string): Promise<SMSResponse> {
    const isTestMode = process.env.OTP_MODE === 'test';
    
    if (isTestMode) {
      console.log(`[SMS-TEST] Would send to ${phone}: ${message}`);
      return { success: true, messageId: 'test_' + Date.now() };
    }

    if (twilioClient && this.twilioPhone) {
      return this.sendViaTwilio(phone, message);
    }

    if (this.ethioApiKey) {
      return this.sendViaEthioTelecom(phone, message);
    }

    console.log('[SMS] No SMS provider configured - development mode');
    return { success: true, messageId: 'dev_' + Date.now() };
  }

  async sendOtp(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanPhone = this.normalizePhone(phone);
      if (!cleanPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      const message = `Your Alga verification code is: ${otp}\nValid for 5 minutes.\n\nየእርስዎ የአልጋ ማረጋገጫ ኮድ: ${otp}`;

      const smsResult = await this.sendSMS(cleanPhone, message);
      return smsResult.success ? { success: true } : { success: false, error: smsResult.error };
    } catch (error) {
      console.error('[SMS] Error sending OTP:', error);
      return { success: false, error: 'Failed to send OTP' };
    }
  }

  async sendVerificationCode(phone: string): Promise<{ success: boolean; otp?: string; error?: string }> {
    try {
      const cleanPhone = this.normalizePhone(phone);
      if (!cleanPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      const existing = otpStorage.get(cleanPhone);
      if (existing && existing.expiresAt > new Date()) {
        const timeDiff = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000);
        if (timeDiff > 240) {
          return { success: false, error: 'Please wait before requesting another code' };
        }
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      const message = `Your Alga verification code is: ${otp}\nValid for 5 minutes.\n\nየእርስዎ የአልጋ ማረጋገጫ ኮድ: ${otp}`;

      const smsResult = await this.sendSMS(cleanPhone, message);

      if (smsResult.success) {
        otpStorage.set(cleanPhone, {
          phone: cleanPhone,
          code: otp,
          expiresAt,
          attempts: 0,
        });

        return { success: true, otp };
      } else {
        return { success: false, error: smsResult.error };
      }
    } catch (error) {
      console.error('[SMS] Error sending verification code:', error);
      return { success: false, error: 'Failed to send verification code' };
    }
  }

  async verifyCode(phone: string, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      const cleanPhone = this.normalizePhone(phone);
      if (!cleanPhone) {
        return { success: false, error: 'Invalid phone number format' };
      }

      const stored = otpStorage.get(cleanPhone);
      if (!stored) {
        return { success: false, error: 'No verification code found. Please request a new one.' };
      }

      if (stored.expiresAt < new Date()) {
        otpStorage.delete(cleanPhone);
        return { success: false, error: 'Verification code has expired. Please request a new one.' };
      }

      if (stored.attempts >= 3) {
        otpStorage.delete(cleanPhone);
        return { success: false, error: 'Too many failed attempts. Please request a new code.' };
      }

      if (stored.code === code.trim()) {
        otpStorage.delete(cleanPhone);
        return { success: true };
      } else {
        stored.attempts++;
        return { success: false, error: 'Invalid verification code. Please try again.' };
      }
    } catch (error) {
      console.error('[SMS] Error verifying code:', error);
      return { success: false, error: 'Failed to verify code' };
    }
  }

  private normalizePhone(phone: string): string | null {
    const digits = phone.replace(/\D/g, '');

    if (digits.startsWith('251')) {
      if (digits.length === 12) {
        return '+' + digits;
      }
    } else if (digits.startsWith('0')) {
      if (digits.length === 10) {
        return '+251' + digits.substring(1);
      }
    } else if (digits.length === 9) {
      return '+251' + digits;
    }

    if (digits.length >= 10 && digits.length <= 15) {
      return '+' + digits;
    }

    return null;
  }

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

export const smsService = new SMSService();

setInterval(() => {
  smsService.cleanupExpiredOTPs();
}, 10 * 60 * 1000);
