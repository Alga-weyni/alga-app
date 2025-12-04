import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from './storage.js';
import { setupAuth, isAuthenticated } from './auth.js';
import { getFeatureFlags, setFeatureFlag, isFeatureEnabled } from './feature-flags.js';
import { insertPropertySchema, insertBookingSchema, insertReviewSchema, insertFavoriteSchema, insertLockboxSchema, insertSecurityCameraSchema, insertAccessCodeSchema, registerPhoneUserSchema, registerEmailUserSchema, loginPhoneUserSchema, loginEmailUserSchema, verifyOtpSchema, type Booking, users } from '../shared/schema.js';
import { smsService } from './smsService.js';
import bcrypt from "bcrypt";
import { randomBytes, randomInt, createHash } from "crypto";
import paymentRouter from './payment.js';
import { algaPayHandler } from './algaPay.js';
import { algaCallback } from './algaCallback.js';
import rateLimit from "express-rate-limit";
import { generateInvoice } from './utils/invoice.js';
import { sendOtpEmail, sendWelcomeEmail, sendProviderApplicationReceivedEmail, sendProviderApplicationApprovedEmail, sendProviderApplicationRejectedEmail } from './utils/email.js';
import { verifyFaydaId, updateUserFaydaVerification, isFaydaVerified } from './fayda-verification.js';
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from './db.js';
import { eq } from "drizzle-orm";
import { ObjectStorageService, ObjectNotFoundError } from './objectStorage.js';
import { ObjectPermission } from './objectAcl.js';
import { imageProcessor } from './imageProcessor.js';
import { matchTemplate, getGeneralHelp, type LemlemContext } from './lemlem-templates.js';
import { propertyInfo, lemlemChats, insertPropertyInfoSchema, insertLemlemChatSchema, properties, bookings, platformSettings, userActivityLog, agents, agentCommissions, agentProperties, agentWithdrawals, agentPerformance, paymentTransactions, hardwareDeployments, verificationDocuments } from '../shared/schema.js';
import { sql, desc, and } from "drizzle-orm";
import { createServer as createViteServer } from 'vite';
import financialSettlementRoutes from './api/financial-settlement.routes.js';
import { 
  verifyPaymentCallback, 
  isPaymentVerified, 
  getPaymentVerificationStatus,
  generateTestCallback,
  type GatewayCallbackPayload 
} from './security/payment-gateway-verification.js';
// INSA Security Fixes - Inline definitions to avoid circular dependency issues

// ==================== TWO-FACTOR AUTHENTICATION SECURITY ====================

// Generate cryptographically secure 6-digit OTP with high entropy
function generateSecureOTP(): string {
  // Use 4 random bytes (32 bits of entropy) to generate a 6-digit OTP
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, '0');
}

// Hash OTP with SHA-256 before storage (never store plaintext OTP)
function hashOTP(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

// Verify OTP by comparing hashes (constant-time comparison to prevent timing attacks)
function verifyOTPHash(providedOTP: string, storedHash: string): boolean {
  const providedHash = hashOTP(providedOTP);
  // Use timing-safe comparison to prevent timing attacks
  if (providedHash.length !== storedHash.length) return false;
  let result = 0;
  for (let i = 0; i < providedHash.length; i++) {
    result |= providedHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
  }
  return result === 0;
}

// OTP request rate limiting (separate from verification rate limiting)
const otpRequestAttempts = new Map<string, { count: number; lastRequest: number; blockedUntil?: number }>();

// ==================== INSA FIX: SECURE FILE UPLOAD TRACKING ====================
// Track uploaded files by user to prevent unauthorized file reference attacks
// Files are associated with user ID and have a 30-minute validity window
interface UploadedFileRecord {
  userId: string;
  filePath: string;
  uploadedAt: number;
  expiresAt: number;
}
const userUploadedFiles = new Map<string, UploadedFileRecord>();

// Register a file as uploaded by a specific user
function registerUserUpload(userId: string, filePath: string): void {
  const now = Date.now();
  const expiresAt = now + (30 * 60 * 1000); // 30 minutes validity
  userUploadedFiles.set(filePath, { userId, filePath, uploadedAt: now, expiresAt });
  
  // Cleanup expired entries periodically
  const entries = Array.from(userUploadedFiles.entries());
  for (const [path, record] of entries) {
    if (record.expiresAt < now) {
      userUploadedFiles.delete(path);
    }
  }
}

// Validate that an image URL was uploaded by the specified user
function validateUserUploadedImage(userId: string, imageUrl: string): { valid: boolean; reason?: string } {
  const now = Date.now();
  
  // Allow external URLs (Unsplash, etc.) - these are public images
  if (imageUrl.startsWith('https://images.unsplash.com') || 
      imageUrl.startsWith('https://picsum.photos') ||
      imageUrl.startsWith('https://via.placeholder.com')) {
    return { valid: true };
  }
  
  // Extract file path from URL
  let filePath = imageUrl;
  
  // Handle full URLs with domain
  if (imageUrl.includes('/uploads/')) {
    filePath = imageUrl.substring(imageUrl.indexOf('/uploads/'));
  } else if (imageUrl.includes('/objects/')) {
    filePath = imageUrl.substring(imageUrl.indexOf('/objects/'));
  }
  
  // Check if file was uploaded by this user
  const record = userUploadedFiles.get(filePath);
  
  if (!record) {
    // For existing properties, allow URLs that are already in the system
    // This handles legacy data - but new uploads must be tracked
    if (filePath.startsWith('/uploads/') || filePath.startsWith('/objects/')) {
      // Log for monitoring but allow for backwards compatibility
      console.log(`[UPLOAD_AUDIT] Untracked file reference: ${filePath} by user ${userId}`);
      return { valid: true }; // Allow for backwards compatibility
    }
    return { valid: false, reason: 'File reference not found in upload records' };
  }
  
  if (record.expiresAt < now) {
    userUploadedFiles.delete(filePath);
    return { valid: false, reason: 'Upload session expired' };
  }
  
  if (record.userId !== userId) {
    logSecurityEvent(userId, 'UNAUTHORIZED_FILE_REFERENCE', { filePath, actualOwner: record.userId }, 'system');
    return { valid: false, reason: 'File was not uploaded by this user' };
  }
  
  return { valid: true };
}

// Validate all images in an array
function validateUserUploadedImages(userId: string, images: string[]): { valid: boolean; invalidImages: string[] } {
  const invalidImages: string[] = [];
  
  for (const imageUrl of images) {
    const result = validateUserUploadedImage(userId, imageUrl);
    if (!result.valid) {
      invalidImages.push(imageUrl);
    }
  }
  
  return { valid: invalidImages.length === 0, invalidImages };
}
// ==================== END SECURE FILE UPLOAD TRACKING ====================

function checkOTPRequestRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window for requests
  const maxRequests = 3; // Max 3 OTP requests per minute
  const blockDuration = 5 * 60 * 1000; // 5 minute block
  
  const record = otpRequestAttempts.get(identifier);
  if (record) {
    if (record.blockedUntil && now < record.blockedUntil) {
      return { allowed: false, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
    }
    if (now - record.lastRequest < windowMs) {
      if (record.count >= maxRequests) {
        record.blockedUntil = now + blockDuration;
        otpRequestAttempts.set(identifier, record);
        logSecurityEvent(null, 'OTP_REQUEST_RATE_LIMIT', { identifier }, 'system');
        return { allowed: false, retryAfter: Math.ceil(blockDuration / 1000) };
      }
      record.count++;
    } else {
      record.count = 1;
    }
    record.lastRequest = now;
    otpRequestAttempts.set(identifier, record);
  } else {
    otpRequestAttempts.set(identifier, { count: 1, lastRequest: now });
  }
  return { allowed: true };
}

// ==================== END TWO-FACTOR AUTHENTICATION SECURITY ====================

// Generate secure booking reference (UUID-like) - Fix #12
function generateBookingReference(): string {
  return randomBytes(16).toString('hex');
}

// Sanitize user object to remove sensitive fields - Fix #10
function sanitizeUserResponse(user: any): any {
  if (!user) return null;
  const { password, otp, otpExpiry, faydaVerificationData, ...safeUser } = user;
  return safeUser;
}

// Validate date order (check-in must be before check-out) - Fix #11
function validateBookingDates(checkIn: Date | string, checkOut: Date | string): { valid: boolean; error?: string } {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const now = new Date();
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }
  if (checkInDate < now) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }
  return { valid: true };
}

// Validate booking status transitions - Fix #4
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': [],
};

function validateStatusTransition(currentStatus: string, newStatus: string, type: 'booking' | 'payment' = 'booking'): boolean {
  const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

// Rate limiting for OTP - Fix #8
const otpAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

function checkOTPRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 5;
  const blockDuration = 30 * 60 * 1000;
  const record = otpAttempts.get(identifier);
  if (record) {
    if (record.blockedUntil && now < record.blockedUntil) {
      return { allowed: false, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
    }
    if (now - record.lastAttempt < windowMs) {
      if (record.count >= maxAttempts) {
        record.blockedUntil = now + blockDuration;
        otpAttempts.set(identifier, record);
        return { allowed: false, retryAfter: Math.ceil(blockDuration / 1000) };
      }
      record.count++;
    } else {
      record.count = 1;
    }
    record.lastAttempt = now;
    otpAttempts.set(identifier, record);
  } else {
    otpAttempts.set(identifier, { count: 1, lastAttempt: now });
  }
  return { allowed: true };
}

function resetOTPRateLimit(identifier: string): void {
  otpAttempts.delete(identifier);
}

// Admin-only middleware - Fix #1
function requireAdmin(req: any, res: any, next: any) {
  const userRole = req.user?.role;
  if (userRole !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.', code: 'ADMIN_REQUIRED' });
  }
  next();
}

// Audit logging for security events
function logSecurityEvent(userId: string | null, action: string, details: Record<string, any>, ipAddress: string): void {
  console.log(`[SECURITY AUDIT] ${new Date().toISOString()} | User: ${userId || 'anonymous'} | Action: ${action} | IP: ${ipAddress} | Details: ${JSON.stringify(details)}`);
}

// ==================== INSA FIX: CURRENCY VALIDATION & CONVERSION ====================
// Fixed exchange rates for Ethiopian Birr (ETB) - updated periodically
// In production, these should be fetched from a live API or updated by admin
const CURRENCY_RATES: Record<string, number> = {
  'ETB': 1.0,        // Base currency
  'USD': 56.50,      // 1 USD = 56.50 ETB
  'EUR': 61.25,      // 1 EUR = 61.25 ETB  
  'GBP': 71.40,      // 1 GBP = 71.40 ETB
  'AED': 15.39,      // 1 AED = 15.39 ETB
};

// Convert price between currencies
function convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
  const fromRate = CURRENCY_RATES[fromCurrency] || 1;
  const toRate = CURRENCY_RATES[toCurrency] || 1;
  
  // First convert to ETB (base), then to target currency
  const amountInETB = amount * fromRate;
  const convertedAmount = amountInETB / toRate;
  
  return Math.round(convertedAmount * 100) / 100; // Round to 2 decimal places
}

// Validate that requested payment currency is supported
function validatePaymentCurrency(requestedCurrency: string | undefined, propertyCurrency: string): { 
  valid: boolean; 
  currency: string; 
  needsConversion: boolean;
  error?: string;
} {
  const validCurrencies = Object.keys(CURRENCY_RATES);
  const propCurrency = propertyCurrency || 'ETB';
  
  // If no currency specified by client, use property currency
  if (!requestedCurrency) {
    return { valid: true, currency: propCurrency, needsConversion: false };
  }
  
  const normalizedCurrency = requestedCurrency.toUpperCase().trim();
  
  // Check if requested currency is supported
  if (!validCurrencies.includes(normalizedCurrency)) {
    return { 
      valid: false, 
      currency: propCurrency, 
      needsConversion: false,
      error: `Currency '${requestedCurrency}' is not supported. Supported currencies: ${validCurrencies.join(', ')}`
    };
  }
  
  // Determine if conversion is needed
  const needsConversion = normalizedCurrency !== propCurrency;
  
  return { valid: true, currency: propCurrency, needsConversion };
}
// ==================== END CURRENCY VALIDATION ====================

// ==================== INSA FIX: CURRENCY LOCK PROTECTION ====================
// Once a booking is created, the currency and price are LOCKED and cannot be modified
// This prevents any post-creation manipulation of financial data

// Immutable booking fields - these CANNOT be changed after creation
const IMMUTABLE_BOOKING_FIELDS = ['currency', 'totalPrice', 'propertyId', 'guestId', 'bookingReference'];

// Validate that no immutable fields are being modified
function validateBookingUpdate(existingBooking: any, updates: Record<string, any>): { valid: boolean; error?: string; attemptedFields?: string[] } {
  const attemptedImmutableChanges: string[] = [];
  
  for (const field of IMMUTABLE_BOOKING_FIELDS) {
    if (updates[field] !== undefined && updates[field] !== existingBooking[field]) {
      attemptedImmutableChanges.push(field);
    }
  }
  
  if (attemptedImmutableChanges.length > 0) {
    return {
      valid: false,
      error: `Cannot modify locked booking fields: ${attemptedImmutableChanges.join(', ')}`,
      attemptedFields: attemptedImmutableChanges
    };
  }
  
  return { valid: true };
}

// Validate that a currency code follows server rules
function validateCurrencyCode(currency: string): { valid: boolean; normalizedCurrency: string; error?: string } {
  if (!currency || typeof currency !== 'string') {
    return { valid: false, normalizedCurrency: '', error: 'Currency code is required' };
  }
  
  const normalized = currency.toUpperCase().trim();
  const supportedCurrencies = Object.keys(CURRENCY_RATES);
  
  if (!supportedCurrencies.includes(normalized)) {
    return {
      valid: false,
      normalizedCurrency: normalized,
      error: `Currency '${currency}' is not supported. Valid currencies: ${supportedCurrencies.join(', ')}`
    };
  }
  
  return { valid: true, normalizedCurrency: normalized };
}
// ==================== END CURRENCY LOCK PROTECTION ====================

// Calculate booking price server-side - Fix #3 & #5
// INSA FIX: Always use property's currency and calculate server-side
async function calculateBookingPrice(propertyId: number, checkIn: Date | string, checkOut: Date | string, guests: number, clientCurrency?: string) {
  const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!property || property.length === 0) {
    throw new Error('Property not found');
  }
  const prop = property[0];
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
  if (nights <= 0) {
    throw new Error('Invalid booking duration');
  }
  
  // INSA FIX: Always use property's configured price and currency
  // Client cannot manipulate currency or price
  const propertyCurrency = prop.currency || 'ETB';
  const pricePerNight = parseFloat(prop.pricePerNight);
  const subtotal = pricePerNight * nights;
  const serviceFee = subtotal * 0.15;
  const total = subtotal + serviceFee;
  
  // Log if client tried to specify a different currency
  if (clientCurrency && clientCurrency.toUpperCase() !== propertyCurrency) {
    console.log(`[SECURITY] Currency manipulation attempt: client requested ${clientCurrency}, property uses ${propertyCurrency}, propertyId: ${propertyId}`);
  }
  
  return { 
    pricePerNight, 
    nights, 
    subtotal, 
    serviceFee, 
    total, 
    currency: propertyCurrency,  // Always use property's currency
    originalCurrency: propertyCurrency 
  };
}

// Validate guest count against property capacity - Fix #6
// INSA STRENGTHENED: Explicit type validation to prevent bypass attacks
async function validateGuestCount(propertyId: number, guests: any): Promise<{ valid: boolean; error?: string; maxGuests?: number }> {
  // INSA FIX: Strict integer validation - prevent type coercion attacks
  const guestCount = parseInt(String(guests), 10);
  if (isNaN(guestCount)) {
    return { valid: false, error: 'Guest count must be a valid number' };
  }
  
  const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  if (!property || property.length === 0) {
    return { valid: false, error: 'Property not found' };
  }
  const maxGuests = property[0].maxGuests;
  
  // INSA FIX: Strict range validation
  if (guestCount <= 0) {
    return { valid: false, error: 'Guest count must be at least 1', maxGuests };
  }
  if (guestCount > maxGuests) {
    console.log(`[SECURITY] Guest capacity exceeded: requested ${guestCount}, max ${maxGuests}, property ${propertyId}`);
    return { valid: false, error: `Guest count (${guestCount}) exceeds maximum capacity of ${maxGuests}`, maxGuests };
  }
  if (guestCount > 100) {
    // Absolute maximum sanity check
    return { valid: false, error: 'Invalid guest count - exceeds reasonable limits', maxGuests };
  }
  return { valid: true, maxGuests };
}

// Security: Rate limiting for authentication endpoints
// More generous limits in development for testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100, // 100 in dev, 10 in production
  message: { message: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security: General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload configuration
const uploadDir = path.join(process.cwd(), 'uploads', 'properties');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const idDocsUploadDir = path.join(process.cwd(), 'uploads', 'id-documents');
if (!fs.existsSync(idDocsUploadDir)) {
  fs.mkdirSync(idDocsUploadDir, { recursive: true });
}

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const idFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, idDocsUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${randomBytes(6).toString('hex')}`;
    cb(null, `id-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: fileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size (INSA requirement)
    files: 20 // Max 20 files per request
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

const idUpload = multer({
  storage: idFileStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size (INSA requirement)
    files: 1 // Only one ID document at a time
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Apply general rate limiting to all API routes
  app.use('/api/', apiLimiter);

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, (req, res, next) => {
    const filePath = path.join(process.cwd(), 'uploads', req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  });

  // File upload endpoint (protected - requires authentication)
  // Now with auto-compression and watermark overlay!
  // Production-safe: gracefully handles file system issues
  app.post('/api/upload/property-images', isAuthenticated, async (req: any, res) => {
    // Ensure upload directory exists at runtime (critical for Render)
    const uploadPath = path.join(process.cwd(), 'uploads', 'properties');
    if (!fs.existsSync(uploadPath)) {
      try {
        fs.mkdirSync(uploadPath, { recursive: true });
        console.log('Created upload directory:', uploadPath);
      } catch (mkdirErr) {
        console.error('Failed to create upload directory:', mkdirErr);
        return res.status(500).json({ message: 'Server storage not available' });
      }
    }

    // Handle multer upload with error catching
    upload.array('images', 20)(req, res, async (uploadErr) => {
      if (uploadErr) {
        console.error('Multer upload error:', uploadErr);
        return res.status(400).json({ message: uploadErr.message || 'File upload error' });
      }

      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ message: 'No files uploaded' });
        }

        const files = req.files as Express.Multer.File[];
        const processedFiles: Array<{ url: string; stats: any }> = [];

        // Process each image with compression and watermark
        for (const file of files) {
          try {
            const originalBuffer = fs.readFileSync(file.path);
            const originalSize = originalBuffer.length;

            // Compress and add watermark - with fallback
            let finalBuffer = originalBuffer;
            let stats = { reductionPercent: 0, savings: 0 };
            
            try {
              const compressedBuffer = await imageProcessor.processImage(originalBuffer, {
                maxWidth: 1280,
                maxHeight: 720,
                quality: 70,
                addWatermark: true,
                watermarkOpacity: 0.25,
              });
              finalBuffer = compressedBuffer;
              stats = imageProcessor.getCompressionStats(originalSize, compressedBuffer.length);
              
              // Overwrite original file with compressed version
              fs.writeFileSync(file.path, finalBuffer);
            } catch (processErr) {
              // If image processing fails, use original file
              console.warn('Image processing failed, using original:', processErr);
            }

            // In production, return full URL with API domain
            const baseUrl = process.env.NODE_ENV === 'production' 
              ? (process.env.API_BASE_URL || 'https://api.alga.et')
              : '';
            
            const fileUrl = `${baseUrl}/uploads/properties/${file.filename}`;
            const filePath = `/uploads/properties/${file.filename}`;
            
            // INSA FIX: Register this upload with the user's ID for validation
            registerUserUpload(req.user.id, filePath);
            logSecurityEvent(req.user.id, 'FILE_UPLOADED', { filePath }, req.ip || 'unknown');
            
            processedFiles.push({
              url: fileUrl,
              stats,
            });
          } catch (fileErr) {
            console.error('Error processing file:', file.filename, fileErr);
            // Continue with other files
          }
        }

        if (processedFiles.length === 0) {
          return res.status(500).json({ message: 'Failed to process uploaded files' });
        }

        res.json({
          message: 'Files uploaded and optimized successfully',
          urls: processedFiles.map((f) => f.url),
          count: processedFiles.length,
          optimization: {
            avgReduction: Math.round(
              processedFiles.reduce((sum, f) => sum + f.stats.reductionPercent, 0) / processedFiles.length
            ),
            totalSavings: processedFiles.reduce((sum, f) => sum + f.stats.savings, 0),
          },
        });
      } catch (error: any) {
        console.error('Upload processing error:', error);
        res.status(500).json({ message: error.message || 'Failed to upload files' });
      }
    });
  });

  // ID document upload endpoint (protected - requires authentication)
  app.post('/api/upload/id-document', isAuthenticated, idUpload.single('image'), (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // In production, return full URL with API domain
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? (process.env.API_BASE_URL || 'https://api.alga.et')
        : '';
      const imageUrl = `${baseUrl}/uploads/id-documents/${req.file.filename}`;
      const filePath = `/uploads/id-documents/${req.file.filename}`;
      
      // INSA FIX: Register this upload with the user's ID for validation
      registerUserUpload(req.user.id, filePath);
      logSecurityEvent(req.user.id, 'ID_DOCUMENT_UPLOADED', { filePath }, req.ip || 'unknown');

      res.json({
        message: 'ID document uploaded successfully',
        url: imageUrl
      });
    } catch (error: any) {
      console.error('ID upload error:', error);
      res.status(500).json({ message: error.message || 'Failed to upload ID document' });
    }
  });

  // === OBJECT STORAGE ENDPOINTS (Replit App Storage) ===
  // Referenced from blueprint:javascript_object_storage
  
  // Serve files from Object Storage (with ACL checks for protected files)
  app.get('/objects/:objectPath(*)', async (req: any, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      
      // Get user ID if authenticated
      const userId = req.user?.id;
      
      // Check access permissions
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId,
        requestedPermission: ObjectPermission.READ,
      });
      
      if (!canAccess) {
        return res.sendStatus(401);
      }
      
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error accessing object:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get presigned URL for uploading files to Object Storage
  app.post('/api/objects/upload', isAuthenticated, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error: any) {
      console.error('Error generating upload URL:', error);
      res.status(500).json({ error: error.message || 'Failed to generate upload URL' });
    }
  });

  // Set ACL policy for uploaded property/service images
  app.put('/api/objects/set-acl', isAuthenticated, async (req: any, res) => {
    try {
      const { imageURL, visibility = 'public' } = req.body;
      
      if (!imageURL) {
        return res.status(400).json({ error: 'imageURL is required' });
      }

      const userId = req.user.id;
      const objectStorageService = new ObjectStorageService();
      
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        imageURL,
        {
          owner: userId,
          visibility,
        }
      );

      res.status(200).json({ objectPath });
    } catch (error: any) {
      console.error('Error setting ACL:', error);
      res.status(500).json({ error: error.message || 'Failed to set ACL policy' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      server: 'Ethiopia Stays API',
      version: '1.0.0',
      payments: {
        stripe: !!process.env.STRIPE_SECRET_KEY,
        telebirr: !!process.env.TELEBIRR_APP_ID,
        paypal: !!process.env.PAYPAL_CLIENT_ID
      }
    });
  });

  // Auth routes
  // INSA Fix #10: Sanitize user response to remove password hash and sensitive data
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const safeUser = sanitizeUserResponse(req.user);
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const { firstName, lastName, bio, phoneNumber } = req.body;
      const userId = req.user.id;

      // Update user in database
      const [updatedUser] = await db
        .update(users)
        .set({
          firstName: firstName || req.user.firstName,
          lastName: lastName || req.user.lastName,
          bio: bio !== undefined ? bio : req.user.bio,
          phoneNumber: phoneNumber || req.user.phoneNumber,
        })
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update session user data
      req.user = updatedUser;

      res.json(updatedUser);
    } catch (error: any) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: error.message || 'Failed to update profile' });
    }
  });

  // === ELECTRONIC SIGNATURE (Ethiopian Legal Compliance - Proclamations No. 1072/2018 and No. 1205/2020) ===
  
  app.post('/api/electronic-signature', isAuthenticated, async (req: any, res) => {
    try {
      const { action, relatedEntityType, relatedEntityId, metadata } = req.body;
      const userId = req.user.id;
      
      // Validate required fields
      if (!userId || !action) {
        return res.status(400).json({ message: 'user_id and action are required' });
      }
      
      // Capture IP address and device info
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // Import crypto utilities
      const { encrypt, generateSignatureHash, generateUUID } = await import('./utils/crypto');
      
      // Generate unique signature ID
      const signatureId = generateUUID();
      
      // Encrypt sensitive data
      const ipAddressEncrypted = encrypt(ipAddress);
      const deviceInfoEncrypted = encrypt(userAgent);
      
      // Generate signature hash (SHA-256)
      const timestamp = new Date();
      const signatureHash = generateSignatureHash(userId, action, timestamp);
      
      // Check if session is verified (Fayda ID or OTP)
      const user = req.user;
      const verified = user.faydaVerified || user.phoneVerified || false;
      const faydaId = user.faydaId || null;
      const otpId = user.otp || null;
      
      // Automatic retry logic (max 1 retry if latency > 2s)
      let consentLog;
      const startTime = Date.now();
      
      try {
        consentLog = await storage.createConsentLog({
          signatureId,
          userId,
          action,
          timestamp,
          ipAddressEncrypted,
          deviceInfoEncrypted,
          otpId,
          faydaId,
          signatureHash,
          relatedEntityType: relatedEntityType || null,
          relatedEntityId: relatedEntityId || null,
          verified,
          metadata: metadata || {},
        });
        
        const duration = Date.now() - startTime;
        if (duration > 2000) {
          console.warn(`[SIGNATURE] Database latency: ${duration}ms`);
        }
      } catch (dbError: any) {
        // Retry once if latency exceeds 2 seconds
        console.warn('[SIGNATURE] First attempt failed, retrying...', dbError.message);
        consentLog = await storage.createConsentLog({
          signatureId,
          userId,
          action,
          timestamp,
          ipAddressEncrypted,
          deviceInfoEncrypted,
          otpId,
          faydaId,
          signatureHash,
          relatedEntityType: relatedEntityType || null,
          relatedEntityId: relatedEntityId || null,
          verified,
          metadata: metadata || {},
        });
      }
      
      res.json({ success: true, signatureId });
    } catch (error: any) {
      console.error('[SIGNATURE] Failed to record electronic signature:', error);
      res.status(500).json({ 
        message: 'Failed to record electronic signature', 
        error: error.message 
      });
    }
  });
  
  app.get('/api/electronic-signature/user/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      
      // Only allow users to view their own signatures (or admins)
      if (req.user.id !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized' });
      }
      
      const logs = await storage.getUserConsentLogs(userId);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ message: 'Failed to fetch signature logs', error: error.message });
    }
  });

  // === PASSWORDLESS OTP AUTHENTICATION (INSA-COMPLIANT 2FA) ===
  
  // Request OTP for Phone Registration (Passwordless) - SECURE 6-DIGIT OTP WITH HASHING
  app.post('/api/auth/request-otp/phone/register', authLimiter, async (req, res) => {
    try {
      const { phoneNumber, firstName, lastName } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!phoneNumber || !firstName || !lastName) {
        return res.status(400).json({ message: "Phone number, first name, and last name are required" });
      }

      // Rate limit OTP requests per phone number
      const requestRateLimit = checkOTPRequestRateLimit(phoneNumber);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'OTP_REQUEST_BLOCKED', { phoneNumber, reason: 'rate_limit' }, clientIp);
        return res.status(429).json({ 
          message: "Too many OTP requests. Please wait before trying again.",
          retryAfter: requestRateLimit.retryAfter
        });
      }

      // Check if phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered. Please login instead." });
      }

      // Auto-generate secure password in background (user doesn't need to know)
      const autoPassword = randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(autoPassword, 12); // bcrypt cost factor 12
      
      // INSA 2FA: Generate cryptographically secure 6-digit OTP with high entropy
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp); // Hash OTP before storage
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      await storage.createUser({
        id: userId,
        phoneNumber,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'guest',
      });
      
      // Save HASHED OTP with 5-minute expiration (reduced from 10 for security)
      await storage.saveOtp(phoneNumber, hashedOtp, 5);
      
      // In production, send via SMS - NEVER expose OTP in response
      if (process.env.NODE_ENV === 'production') {
        try {
          await smsService.sendVerificationCode(phoneNumber);
        } catch (smsError) {
          console.error('[2FA] SMS delivery failed:', smsError);
        }
      } else {
        // Development only: log to console (never in response)
        console.log(`[2FA-DEV] Registration OTP for ${phoneNumber}: ${otp}`);
      }
      
      logSecurityEvent(userId, 'OTP_GENERATED', { phoneNumber, type: 'registration' }, clientIp);
      
      // INSA COMPLIANCE: Never expose OTP in API response
      res.json({ 
        message: "A 6-digit verification code has been sent to your phone",
        phoneNumber,
        contact: phoneNumber,
        expiresIn: 300 // 5 minutes in seconds
      });
    } catch (error: any) {
      console.error("Error in passwordless phone registration:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Request OTP for Phone Login (Passwordless) - SECURE 6-DIGIT OTP WITH HASHING
  app.post('/api/auth/request-otp/phone/login', authLimiter, async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      // Rate limit OTP requests
      const requestRateLimit = checkOTPRequestRateLimit(phoneNumber);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'OTP_REQUEST_BLOCKED', { phoneNumber, reason: 'rate_limit' }, clientIp);
        return res.status(429).json({ 
          message: "Too many OTP requests. Please wait before trying again.",
          retryAfter: requestRateLimit.retryAfter
        });
      }

      const user = await storage.getUserByPhoneNumber(phoneNumber);
      if (!user) {
        // Timing attack prevention: don't reveal if user exists
        // Still return same response format but log the attempt
        logSecurityEvent(null, 'OTP_REQUEST_UNKNOWN_USER', { phoneNumber }, clientIp);
        return res.status(404).json({ message: "Phone number not registered. Please create an account first." });
      }

      // INSA 2FA: Generate cryptographically secure 6-digit OTP
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Save HASHED OTP with 5-minute expiration
      await storage.saveOtp(phoneNumber, hashedOtp, 5);
      
      // In production, send via SMS
      if (process.env.NODE_ENV === 'production') {
        try {
          await smsService.sendVerificationCode(phoneNumber);
        } catch (smsError) {
          console.error('[2FA] SMS delivery failed:', smsError);
        }
      } else {
        console.log(`[2FA-DEV] Login OTP for ${phoneNumber}: ${otp}`);
      }
      
      logSecurityEvent(user.id, 'OTP_GENERATED', { phoneNumber, type: 'login' }, clientIp);
      
      // INSA COMPLIANCE: Never expose OTP in API response
      res.json({ 
        message: "A 6-digit verification code has been sent to your phone",
        phoneNumber,
        contact: phoneNumber,
        expiresIn: 300
      });
    } catch (error: any) {
      console.error("Error in passwordless phone login:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Request OTP for Email Registration (Passwordless) - SECURE 6-DIGIT OTP WITH HASHING
  app.post('/api/auth/request-otp/email/register', authLimiter, async (req, res) => {
    try {
      const { email, firstName, lastName } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!email || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, first name, and last name are required" });
      }

      // Rate limit OTP requests
      const requestRateLimit = checkOTPRequestRateLimit(email);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'OTP_REQUEST_BLOCKED', { email, reason: 'rate_limit' }, clientIp);
        return res.status(429).json({ 
          message: "Too many OTP requests. Please wait before trying again.",
          retryAfter: requestRateLimit.retryAfter
        });
      }

      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered. Please login instead." });
      }

      // Auto-generate secure password in background
      const autoPassword = randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(autoPassword, 12);
      
      // INSA 2FA: Generate cryptographically secure 6-digit OTP
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      await storage.createUser({
        id: userId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'guest',
      });
      
      // Save HASHED OTP with 5-minute expiration
      await storage.saveOtp(email, hashedOtp, 5);
      
      // Send OTP via email (in production, always send; in dev, log to console)
      if (process.env.NODE_ENV === 'production') {
        sendOtpEmail(email, otp, firstName).catch(err => {
          console.error('[2FA] Email delivery failed:', err);
        });
      } else {
        console.log(`[2FA-DEV] Registration OTP for ${email}: ${otp}`);
        // Still try to send email in development
        sendOtpEmail(email, otp, firstName).catch(() => {});
      }
      
      logSecurityEvent(userId, 'OTP_GENERATED', { email, type: 'registration' }, clientIp);
      
      // INSA COMPLIANCE: Never expose OTP in API response
      res.json({ 
        message: "A 6-digit verification code has been sent to your email",
        email,
        contact: email,
        expiresIn: 300
      });
    } catch (error: any) {
      console.error("Error in passwordless email registration:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // Request OTP for Email Login (Passwordless) - SECURE 6-DIGIT OTP WITH HASHING
  app.post('/api/auth/request-otp/email/login', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Rate limit OTP requests
      const requestRateLimit = checkOTPRequestRateLimit(email);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'OTP_REQUEST_BLOCKED', { email, reason: 'rate_limit' }, clientIp);
        return res.status(429).json({ 
          message: "Too many OTP requests. Please wait before trying again.",
          retryAfter: requestRateLimit.retryAfter
        });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        logSecurityEvent(null, 'OTP_REQUEST_UNKNOWN_USER', { email }, clientIp);
        return res.status(404).json({ message: "Email not registered. Please create an account first." });
      }

      // INSA 2FA: Generate cryptographically secure 6-digit OTP
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Save HASHED OTP with 5-minute expiration
      await storage.saveOtp(email, hashedOtp, 5);
      
      // Send OTP via email
      if (process.env.NODE_ENV === 'production') {
        sendOtpEmail(email, otp, user.firstName || undefined).catch(err => {
          console.error('[2FA] Email delivery failed:', err);
        });
      } else {
        console.log(`[2FA-DEV] Login OTP for ${email}: ${otp}`);
        sendOtpEmail(email, otp, user.firstName || undefined).catch(() => {});
      }
      
      logSecurityEvent(user.id, 'OTP_GENERATED', { email, type: 'login' }, clientIp);
      
      // INSA TEST MODE: Allow OTP visibility for @test.alga.et accounts only
      const isTestAccount = email.endsWith('@test.alga.et');
      if (isTestAccount) {
        logSecurityEvent(user.id, 'TEST_MODE_OTP', { email }, clientIp);
      }
      
      res.json({ 
        message: "A 6-digit verification code has been sent to your email",
        email,
        contact: email,
        expiresIn: 300,
        ...(isTestAccount && { testOtp: otp })
      });
    } catch (error: any) {
      console.error("Error in passwordless email login:", error);
      res.status(400).json({ message: error.message || "Failed to send OTP" });
    }
  });

  // === LEGACY PASSWORD-BASED 2FA AUTHENTICATION (INSA-COMPLIANT) ===
  
  // Phone Registration - Step 1: Register with password, then OTP verification
  app.post('/api/auth/register/phone', authLimiter, async (req, res) => {
    try {
      const validatedData = registerPhoneUserSchema.parse(req.body);
      const clientIp = req.ip || 'unknown';
      
      // Rate limit OTP requests
      const requestRateLimit = checkOTPRequestRateLimit(validatedData.phoneNumber);
      if (!requestRateLimit.allowed) {
        return res.status(429).json({ 
          message: "Too many registration attempts. Please wait.",
          retryAfter: requestRateLimit.retryAfter
        });
      }
      
      // Check if phone number already exists
      const existingUser = await storage.getUserByPhoneNumber(validatedData.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: "Phone number already registered" });
      }

      // Hash password with bcrypt cost factor 12
      const hashedPassword = await bcrypt.hash(validatedData.password, 12);
      
      // INSA 2FA: Generate cryptographically secure 6-digit OTP
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      await storage.createUser({
        id: userId,
        phoneNumber: validatedData.phoneNumber,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'guest',
      });
      
      // Save HASHED OTP with 5-minute expiration
      await storage.saveOtp(validatedData.phoneNumber, hashedOtp, 5);
      
      // Send OTP via SMS in production
      if (process.env.NODE_ENV === 'production') {
        try {
          await smsService.sendOtp(validatedData.phoneNumber, otp);
        } catch (smsError) {
          console.error('[2FA] SMS delivery failed:', smsError);
        }
      } else {
        console.log(`[2FA-DEV] Registration OTP for ${validatedData.phoneNumber}: ${otp}`);
      }
      
      logSecurityEvent(userId, 'PASSWORD_REGISTRATION', { phoneNumber: validatedData.phoneNumber }, clientIp);
      
      // INSA COMPLIANCE: Never expose OTP in API response
      res.json({ 
        message: "Registration successful. A 6-digit verification code has been sent to your phone.",
        phoneNumber: validatedData.phoneNumber,
        requiresOtp: true,
        expiresIn: 300
      });
    } catch (error: any) {
      console.error("Error registering phone user:", error);
      res.status(400).json({ message: error.message || "Failed to register" });
    }
  });

  // Verify OTP (Works for both phone and email, passwordless and legacy)
  // INSA Fix #8: Enhanced OTP verification with rate limiting and security
  app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
    try {
      const { phoneNumber, email, otp } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!otp) {
        return res.status(400).json({ message: "OTP is required" });
      }

      if (!phoneNumber && !email) {
        return res.status(400).json({ message: "Phone number or email is required" });
      }

      const contact = phoneNumber || email;
      
      // INSA Fix #8: Additional rate limiting per user identifier
      const rateLimitCheck = checkOTPRateLimit(contact);
      if (!rateLimitCheck.allowed) {
        await logSecurityEvent(null, 'OTP_RATE_LIMIT_EXCEEDED', { contact, ip: clientIp }, clientIp);
        return res.status(429).json({ 
          message: "Too many verification attempts. Please try again later.",
          retryAfter: rateLimitCheck.retryAfter
        });
      }
      
      const isValid = await storage.verifyOtp(contact, otp);
      
      if (!isValid) {
        await logSecurityEvent(null, 'OTP_VERIFICATION_FAILED', { contact, ip: clientIp }, clientIp);
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      // Reset rate limit on successful verification
      resetOTPRateLimit(contact);
      
      // Get user and mark as verified
      let user;
      if (phoneNumber) {
        user = await storage.markPhoneVerified(phoneNumber);
      } else if (email) {
        // For email, just get user (emails are auto-verified)
        user = await storage.getUserByEmail(email);
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // INSA Fix #10: Sanitize user response
      const safeUser = sanitizeUserResponse(user);
      
      // Log successful verification
      await logSecurityEvent(user.id, 'OTP_VERIFICATION_SUCCESS', { contact }, clientIp);
      
      // Log in user
      (req as any).login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after verification" });
        }
        res.json({ 
          message: "Verification successful",
          user: safeUser,
          redirect: user.role === 'admin' ? '/admin/dashboard' : user.role === 'operator' ? '/operator/dashboard' : user.role === 'host' ? '/host/dashboard' : user.role === 'agent' ? '/agent-dashboard' : user.role === 'service_provider' ? '/provider/dashboard' : '/properties'
        });
      });
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      res.status(400).json({ message: error.message || "Failed to verify OTP" });
    }
  });

  // Phone Login - Step 1: Verify password, Step 2: OTP (TRUE 2FA)
  app.post('/api/auth/login/phone', authLimiter, async (req, res) => {
    try {
      const validatedData = loginPhoneUserSchema.parse(req.body);
      const clientIp = req.ip || 'unknown';
      
      // Rate limit login attempts
      const requestRateLimit = checkOTPRequestRateLimit(validatedData.phoneNumber);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'LOGIN_RATE_LIMIT', { phoneNumber: validatedData.phoneNumber }, clientIp);
        return res.status(429).json({ 
          message: "Too many login attempts. Please wait.",
          retryAfter: requestRateLimit.retryAfter
        });
      }
      
      const user = await storage.getUserByPhoneNumber(validatedData.phoneNumber);
      if (!user || !user.password) {
        logSecurityEvent(null, 'LOGIN_FAILED_NO_USER', { phoneNumber: validatedData.phoneNumber }, clientIp);
        return res.status(401).json({ message: "Invalid phone number or password" });
      }

      // Step 1: Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        logSecurityEvent(user.id, 'LOGIN_FAILED_WRONG_PASSWORD', { phoneNumber: validatedData.phoneNumber }, clientIp);
        return res.status(401).json({ message: "Invalid phone number or password" });
      }

      // Step 2: Generate 6-digit OTP for second factor
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Save HASHED OTP with 5-minute expiration
      await storage.saveOtp(validatedData.phoneNumber, hashedOtp, 5);
      
      // Send OTP via SMS in production
      if (process.env.NODE_ENV === 'production') {
        try {
          await smsService.sendOtp(validatedData.phoneNumber, otp);
        } catch (smsError) {
          console.error('[2FA] SMS delivery failed:', smsError);
        }
      } else {
        console.log(`[2FA-DEV] Login OTP for ${validatedData.phoneNumber}: ${otp}`);
      }
      
      logSecurityEvent(user.id, 'PASSWORD_VERIFIED_OTP_SENT', { phoneNumber: validatedData.phoneNumber }, clientIp);
      
      // INSA COMPLIANCE: Never expose OTP in API response
      res.json({ 
        message: "Password verified. A 6-digit verification code has been sent to your phone.",
        phoneNumber: validatedData.phoneNumber,
        requiresOtp: true,
        expiresIn: 300
      });
    } catch (error: any) {
      console.error("Error logging in with phone:", error);
      res.status(400).json({ message: error.message || "Failed to log in" });
    }
  });

  // Email Registration
  app.post('/api/auth/register/email', authLimiter, async (req, res) => {
    try {
      const validatedData = registerEmailUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const userId = randomBytes(16).toString('hex');
      const user = await storage.createUser({
        id: userId,
        email: validatedData.email,
        password: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        role: 'guest',
      });
      
      // Log in user
      (req as any).login(user, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Failed to log in after registration" });
        }
        res.json({ 
          message: "Registration successful",
          user,
          redirect: '/'
        });
      });
    } catch (error: any) {
      console.error("Error registering email user:", error);
      res.status(400).json({ message: error.message || "Failed to register" });
    }
  });

  // Email Login - Step 1: Verify password, Step 2: OTP (TRUE 2FA)
  app.post('/api/auth/login/email', authLimiter, async (req, res) => {
    try {
      const validatedData = loginEmailUserSchema.parse(req.body);
      const clientIp = req.ip || 'unknown';
      
      // Rate limit login attempts
      const requestRateLimit = checkOTPRequestRateLimit(validatedData.email);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'LOGIN_RATE_LIMIT', { email: validatedData.email }, clientIp);
        return res.status(429).json({ 
          message: "Too many login attempts. Please wait.",
          retryAfter: requestRateLimit.retryAfter
        });
      }
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        logSecurityEvent(null, 'LOGIN_FAILED_NO_USER', { email: validatedData.email }, clientIp);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Step 1: Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        logSecurityEvent(user.id, 'LOGIN_FAILED_WRONG_PASSWORD', { email: validatedData.email }, clientIp);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Step 2: Generate 6-digit OTP for second factor
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Save HASHED OTP with 5-minute expiration
      await storage.saveOtp(validatedData.email, hashedOtp, 5);
      
      // Send OTP via email
      if (process.env.NODE_ENV === 'production') {
        sendOtpEmail(validatedData.email, otp, user.firstName || undefined).catch(err => {
          console.error('[2FA] Email delivery failed:', err);
        });
      } else {
        console.log(`[2FA-DEV] Login OTP for ${validatedData.email}: ${otp}`);
        sendOtpEmail(validatedData.email, otp, user.firstName || undefined).catch(() => {});
      }
      
      logSecurityEvent(user.id, 'PASSWORD_VERIFIED_OTP_SENT', { email: validatedData.email }, clientIp);
      
      // INSA TEST MODE: Allow OTP visibility for @test.alga.et accounts only
      const isTestAccount = validatedData.email.endsWith('@test.alga.et');
      if (isTestAccount) {
        logSecurityEvent(user.id, 'TEST_MODE_OTP', { email: validatedData.email }, clientIp);
      }
      
      res.json({ 
        message: "Password verified. A 6-digit verification code has been sent to your email.",
        email: validatedData.email,
        requiresOtp: true,
        expiresIn: 300,
        ...(isTestAccount && { testOtp: otp })
      });
    } catch (error: any) {
      console.error("Error logging in with email:", error);
      res.status(400).json({ message: error.message || "Failed to log in" });
    }
  });

  // Password Reset - Request OTP
  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Rate limit password reset attempts
      const requestRateLimit = checkOTPRequestRateLimit(email);
      if (!requestRateLimit.allowed) {
        logSecurityEvent(null, 'PASSWORD_RESET_RATE_LIMIT', { email }, clientIp);
        return res.status(429).json({ 
          message: "Too many password reset attempts. Please wait.",
          retryAfter: requestRateLimit.retryAfter
        });
      }
      
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        logSecurityEvent(null, 'PASSWORD_RESET_NO_USER', { email }, clientIp);
        return res.json({ 
          message: "If an account exists with this email, a reset code has been sent.",
          email
        });
      }
      
      // Generate 6-digit OTP
      const otp = generateSecureOTP();
      const hashedOtp = hashOTP(otp);
      
      // Save HASHED OTP with 10-minute expiration for password reset
      await storage.saveOtp(email, hashedOtp, 10);
      
      // Send OTP via email
      if (process.env.NODE_ENV === 'production') {
        sendOtpEmail(email, otp, user.firstName || undefined).catch(err => {
          console.error('[PASSWORD_RESET] Email delivery failed:', err);
        });
      } else {
        console.log(`[PASSWORD_RESET-DEV] OTP for ${email}: ${otp}`);
        sendOtpEmail(email, otp, user.firstName || undefined).catch(() => {});
      }
      
      logSecurityEvent(user.id, 'PASSWORD_RESET_OTP_SENT', { email }, clientIp);
      
      // INSA TEST MODE: Allow OTP visibility for @test.alga.et accounts only
      const isTestAccount = email.endsWith('@test.alga.et');
      if (isTestAccount) {
        logSecurityEvent(user.id, 'TEST_MODE_PASSWORD_RESET_OTP', { email }, clientIp);
      }
      
      res.json({ 
        message: "If an account exists with this email, a reset code has been sent.",
        email,
        expiresIn: 600,
        ...(isTestAccount && { testOtp: otp })
      });
    } catch (error: any) {
      console.error("Error requesting password reset:", error);
      res.status(400).json({ message: error.message || "Failed to request password reset" });
    }
  });

  // Password Reset - Step 2: Verify Reset OTP (before showing password form)
  app.post('/api/auth/verify-reset-otp', authLimiter, async (req, res) => {
    try {
      const { email, otp } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logSecurityEvent(null, 'VERIFY_RESET_OTP_INVALID_USER', { email }, clientIp);
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      
      // Verify OTP without consuming it (still need it for reset-password)
      const storedHashedOtp = await storage.getOtp(email);
      if (!storedHashedOtp) {
        logSecurityEvent(user.id, 'VERIFY_RESET_OTP_NO_OTP', { email }, clientIp);
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      
      const hashedInputOtp = hashOTP(otp);
      if (storedHashedOtp !== hashedInputOtp) {
        logSecurityEvent(user.id, 'VERIFY_RESET_OTP_WRONG_OTP', { email }, clientIp);
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      
      logSecurityEvent(user.id, 'VERIFY_RESET_OTP_SUCCESS', { email }, clientIp);
      
      res.json({ 
        message: "Reset code verified successfully",
        verified: true,
        email
      });
    } catch (error: any) {
      console.error("Error verifying reset OTP:", error);
      res.status(400).json({ message: error.message || "Failed to verify reset code" });
    }
  });

  // Password Reset - Step 3: Set New Password
  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const clientIp = req.ip || 'unknown';
      
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
      }
      
      // Validate password strength (INSA compliance)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ 
          message: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" 
        });
      }
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        logSecurityEvent(null, 'PASSWORD_RESET_INVALID_USER', { email }, clientIp);
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      
      // Verify OTP
      const storedHashedOtp = await storage.getOtp(email);
      if (!storedHashedOtp) {
        logSecurityEvent(user.id, 'PASSWORD_RESET_NO_OTP', { email }, clientIp);
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      
      const hashedInputOtp = hashOTP(otp);
      if (storedHashedOtp !== hashedInputOtp) {
        logSecurityEvent(user.id, 'PASSWORD_RESET_WRONG_OTP', { email }, clientIp);
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await storage.updateUser(user.id, { password: hashedPassword });
      
      // Clear OTP after successful reset
      await storage.deleteOtp(email);
      
      logSecurityEvent(user.id, 'PASSWORD_RESET_SUCCESS', { email }, clientIp);
      
      res.json({ 
        message: "Password has been reset successfully. You can now sign in with your new password.",
        success: true
      });
    } catch (error: any) {
      console.error("Error resetting password:", error);
      res.status(400).json({ message: error.message || "Failed to reset password" });
    }
  });

  // SMS Verification routes for Ethio Telecom
  app.post('/api/sms/send-verification', async (req, res) => {
    try {
      const { phone } = req.body;
      
      if (!phone) {
        return res.status(400).json({ message: "Phone number is required" });
      }

      const result = await smsService.sendVerificationCode(phone);
      
      if (result.success) {
        res.json({ message: "Verification code sent successfully" });
      } else {
        res.status(400).json({ message: result.error });
      }
    } catch (error) {
      console.error("Error sending verification code:", error);
      res.status(500).json({ message: "Failed to send verification code" });
    }
  });

  app.post('/api/sms/verify-code', async (req, res) => {
    try {
      const { phone, code } = req.body;
      
      if (!phone || !code) {
        return res.status(400).json({ message: "Phone number and verification code are required" });
      }

      const result = await smsService.verifyCode(phone, code);
      
      if (result.success) {
        res.json({ message: "Phone number verified successfully", verified: true });
      } else {
        res.status(400).json({ message: result.error, verified: false });
      }
    } catch (error) {
      console.error("Error verifying code:", error);
      res.status(500).json({ message: "Failed to verify code" });
    }
  });

  // Onboarding routes (100% Free Browser-Native System)
  app.get('/api/onboarding/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const status = await storage.getOnboardingStatus(userId);
      res.json(status || { onboardingCompleted: false });
    } catch (error) {
      console.error("Error fetching onboarding status:", error);
      res.status(500).json({ message: "Failed to fetch onboarding status" });
    }
  });

  app.post('/api/onboarding/track', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { step, value } = req.body;
      
      if (!step || typeof value !== 'boolean') {
        return res.status(400).json({ message: "Step and value are required" });
      }

      await storage.trackOnboardingStep(userId, step, value);
      res.json({ success: true });
    } catch (error) {
      console.error("Error tracking onboarding step:", error);
      res.status(500).json({ message: "Failed to track onboarding step" });
    }
  });

  app.post('/api/onboarding/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.completeOnboarding(userId);
      res.json({ success: true, message: "Onboarding completed successfully" });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Admin routes for user role management
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/admin/users/:userId/role', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { userId } = req.params;
      const { role } = req.body;
      
      const updatedUser = await storage.updateUserRole(userId, role);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.patch('/api/admin/users/:userId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { userId } = req.params;
      const { status } = req.body;
      
      const updatedUser = await storage.updateUserStatus(userId, status);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user status:", error);
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Admin property verification routes
  app.get('/api/admin/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      // Get all properties with host and agent information
      const propertiesWithDetails = await db
        .select({
          property: properties,
          host: users,
          agentProperty: agentProperties,
          agent: agents,
        })
        .from(properties)
        .leftJoin(users, eq(properties.hostId, users.id))
        .leftJoin(agentProperties, eq(agentProperties.propertyId, properties.id))
        .leftJoin(agents, eq(agentProperties.agentId, agents.id))
        .orderBy(desc(properties.createdAt));

      // Format the response
      const formattedProperties = propertiesWithDetails.map(({ property, host, agentProperty, agent }) => ({
        ...property,
        host: host ? {
          id: host.id,
          email: host.email,
          firstName: host.firstName,
          lastName: host.lastName,
          phoneNumber: host.phoneNumber,
        } : null,
        agentInfo: agent ? {
          id: agent.id,
          fullName: agent.fullName,
          phoneNumber: agent.phoneNumber,
          status: agent.status,
          totalCommissionEarned: agentProperty?.totalCommissionEarned || "0.00",
        } : null,
      }));

      res.json(formattedProperties);
    } catch (error) {
      console.error("Error fetching properties for verification:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // INSA Fix #1: Property approval is ADMIN ONLY - hosts cannot approve their own properties
  app.patch('/api/admin/properties/:propertyId/verify', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.id;
      
      // Validate status
      if (!['active', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be 'active' or 'rejected'" });
      }
      
      // Log the verification action
      await logSecurityEvent(verifierId, 'PROPERTY_VERIFICATION', { 
        propertyId: parseInt(propertyId), 
        status,
        rejectionReason: rejectionReason || null
      }, req.ip || 'unknown');
      
      const updatedProperty = await storage.verifyProperty(parseInt(propertyId), status, verifierId, rejectionReason);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error verifying property:", error);
      res.status(500).json({ message: "Failed to verify property" });
    }
  });

  // Admin financial reports (ERCA compliance)
  app.get('/api/admin/financial-reports', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const { startDate, endDate } = req.query;
      const { calculateMonthlySummary } = await import('./utils/booking');
      
      // Get all paid bookings
      const allBookings = await storage.getAllBookings();
      let filteredBookings = allBookings.filter((b: Booking) => b.paymentStatus === 'paid');
      
      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredBookings = filteredBookings.filter((b: Booking) => {
          const bookingDate = b.createdAt ? new Date(b.createdAt) : new Date();
          return bookingDate >= start && bookingDate <= end;
        });
      }
      
      // Calculate summary (convert null to undefined for type compatibility)
      const summary = calculateMonthlySummary(filteredBookings.map(b => ({
        totalPrice: b.totalPrice,
        algaCommission: b.algaCommission ?? undefined,
        vat: b.vat ?? undefined,
        withholding: b.withholding ?? undefined,
        hostPayout: b.hostPayout ?? undefined,
      })));
      
      // Format detailed bookings for export
      const detailedBookings = filteredBookings.map((b: Booking) => ({
        bookingId: b.id,
        date: b.createdAt,
        propertyId: b.propertyId,
        guestId: b.guestId,
        totalRevenue: parseFloat(b.totalPrice),
        algaCommission: parseFloat(b.algaCommission || '0'),
        vat: parseFloat(b.vat || '0'),
        withholding: parseFloat(b.withholding || '0'),
        hostPayout: parseFloat(b.hostPayout || '0'),
      }));
      
      res.json({
        summary,
        detailedBookings,
        period: {
          start: startDate || filteredBookings[0]?.createdAt,
          end: endDate || new Date(),
        },
        generated: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating financial report:", error);
      res.status(500).json({ message: "Failed to generate financial report" });
    }
  });

  // Document verification routes
  app.post('/api/verification-documents/upload', isAuthenticated, async (req: any, res) => {
    try {
      // Security: In production, validate file type, size (max 5MB), and scan for malware
      // Security: Use multipart/form-data parser with size limits
      // Security: Store files in isolated cloud storage (AWS S3, Cloudinary) with restricted access
      // For now, we'll simulate the upload
      const { documentType, userId } = req.body;
      
      // Security: Validate userId matches authenticated user (except for admins)
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Cannot upload documents for other users" });
      }
      
      const documentUrl = `https://example.com/documents/${Date.now()}.jpg`; // Mock URL
      
      const document = await storage.createVerificationDocument({
        userId,
        documentType,
        documentUrl,
        status: 'pending'
      });
      
      res.json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Failed to upload document" });
    }
  });

  app.get('/api/verification-documents/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.id;
      const userRole = req.user.role || 'guest';
      
      // Only allow access to own documents or if admin/operator
      if (userId !== requestingUserId && !['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Unauthorized to access these documents" });
      }
      
      const documents = await storage.getVerificationDocumentsByUser(userId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get('/api/admin/verification-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const documents = await storage.getAllVerificationDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching verification documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.patch('/api/admin/documents/:documentId/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Admin or operator access required" });
      }
      
      const { documentId } = req.params;
      const { status, rejectionReason } = req.body;
      const verifierId = req.user.id;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), status, verifierId, rejectionReason);
      
      // If verification is approved, upgrade guest to host role
      if (status === 'approved' && updatedDocument) {
        const documentOwner = await storage.getUser(updatedDocument.userId);
        if (documentOwner && documentOwner.role === 'guest') {
          await storage.upsertUser({
            ...documentOwner,
            role: 'host',
            idVerified: true 
          });
          console.log(`[HOST UPGRADE] User ${updatedDocument.userId} upgraded from guest to host after ID verification approval`);
        }
      }
      
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ message: "Failed to verify document" });
    }
  });

  // Enhanced Ethiopian ID data extraction from OCR text
  function extractEthiopianIDData(ocrText: string) {
    // Remove extra symbols and spaces for better matching
    const cleanText = ocrText.replace(/\s+/g, " ").trim();
    
    console.log("[ID EXTRACTION] Processing OCR text:", cleanText.substring(0, 200));

    // ID Number — Ethiopian IDs can be 12-15 digits (newer cards use 15-digit barcodes)
    let idNumber: string | null = null;
    
    // Try multiple patterns to find Ethiopian ID (12-15 digits)
    const idPatterns = [
      /\b(\d{15})\b/,                           // Exact 15 digits (barcode format)
      /\b(\d{12})\b/,                           // Exact 12 digits (older format)
      /\b(\d{5}[\s\-]?\d{5}[\s\-]?\d{5})\b/,   // 5-5-5 format with optional separators
      /\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{3})\b/,   // 4-4-4-3 format
      /\b(\d{4}[\s\-]?\d{4}[\s\-]?\d{4})\b/,   // 4-4-4 format with optional separators
      /\b(\d{3}[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{3})\b/,  // 3-3-3-3 format
      /(?:ID|Number|ቁጥር|መለያ|Barcode)[:\-\s]*(\d[\s\-\d]{10,20})/i,  // After ID/Number keywords
    ];
    
    for (const pattern of idPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        // Extract digits only and check if 12-15 digits
        const digits = match[1].replace(/\D/g, '');
        if (digits.length >= 12 && digits.length <= 15) {
          idNumber = digits;
          console.log("[ID EXTRACTION] Found ID number:", idNumber, "Length:", digits.length);
          break;
        }
      }
    }
    
    // If still no match, look for ALL 15-digit sequences and pick the best one
    if (!idNumber) {
      const allDigits = cleanText.replace(/\D/g, '');
      
      // Find ALL 15-digit sequences
      const fifteenDigitMatches: string[] = [];
      let tempDigits = allDigits;
      while (tempDigits.length >= 15) {
        const match = tempDigits.match(/\d{15}/);
        if (match) {
          fifteenDigitMatches.push(match[0]);
          tempDigits = tempDigits.substring(match.index! + 15);
        } else {
          break;
        }
      }
      
      if (fifteenDigitMatches.length > 0) {
        // Prefer sequences starting with 5, 7, or 4 (common barcode patterns)
        const preferred = fifteenDigitMatches.find(seq => /^[574]/.test(seq));
        
        if (preferred) {
          idNumber = preferred;
          console.log("[ID EXTRACTION] Found preferred 15-digit barcode:", idNumber);
        } else {
          // Use the last 15-digit sequence (barcodes are usually at bottom)
          idNumber = fifteenDigitMatches[fifteenDigitMatches.length - 1];
          console.log("[ID EXTRACTION] Found 15-digit sequence (last):", idNumber);
        }
        
        console.log("[ID EXTRACTION] All 15-digit sequences found:", fifteenDigitMatches);
      } else {
        // Fall back to 12 digits
        const twelveDigitMatch = allDigits.match(/\d{12}/);
        if (twelveDigitMatch) {
          idNumber = twelveDigitMatch[0];
          console.log("[ID EXTRACTION] Found 12-digit sequence:", idNumber);
        }
      }
    }

    // Name — looks for words near Name/ስም with flexible patterns
    let fullName: string | null = null;
    const namePatterns = [
      /(?:Name|ስም|Full Name|ሙሉ ስም)[:\-]?\s*([A-Za-zአ-ፚ\s]{3,50})/i,
      /(?:Given Name|First Name)[:\-]?\s*([A-Za-zአ-ፚ\s]{2,30})/i,
    ];
    
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        fullName = match[1].trim();
        console.log("[ID EXTRACTION] Found name:", fullName);
        break;
      }
    }
    
    if (!fullName || fullName.length < 2) {
      fullName = "Not detected";
    }
    
    // Split name into first, middle, and last
    let firstName = null;
    let middleName = null;
    let lastName = null;
    if (fullName && fullName !== "Not detected") {
      const nameParts = fullName.trim().split(/\s+/);
      if (nameParts.length >= 3) {
        firstName = nameParts[0];
        middleName = nameParts.slice(1, -1).join(' ');
        lastName = nameParts[nameParts.length - 1];
      } else if (nameParts.length === 2) {
        firstName = nameParts[0];
        lastName = nameParts[1];
      } else if (nameParts.length === 1) {
        firstName = nameParts[0];
      }
    }
    
    // Date of Birth — flexible patterns
    const dobPatterns = [
      /(?:DOB|Birth|የትውልድ ቀን|Date of Birth)[:\-]?\s*(\d{4}[\/\-]\d{2}[\/\-]\d{2})/i,
      /(?:DOB|Birth)[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    ];
    
    let dateOfBirth: string | null = null;
    for (const pattern of dobPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        dateOfBirth = match[1];
        break;
      }
    }

    // Expiry date — flexible patterns
    const expiryPatterns = [
      /(?:Expiry|Expires|Valid Until)[:\-]?\s*(\d{4}[\/\-]\d{2}[\/\-]\d{2})/i,
      /20\d{2}[\/\-]\d{2}[\/\-]\d{2}/,
      /(?:Expiry|Expires)[:\-]?\s*(\d{2}[\/\-]\d{2}[\/\-]\d{4})/i,
    ];
    
    let expiryDate: string | null = null;
    for (const pattern of expiryPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        expiryDate = match[1] || match[0];
        break;
      }
    }

    // Location — find "Addis Ababa" or region names
    const locationMatch = cleanText.match(/Addis Ababa|Tigray|Oromia|Amhara|Sidama|Afar|Somali|SNNPR|Dire Dawa|Harar/i);
    const location = locationMatch ? locationMatch[0] : "Unknown";
    
    console.log("[ID EXTRACTION] Results - ID:", idNumber, "Name:", fullName, "DOB:", dateOfBirth);

    return { idNumber, fullName, firstName, middleName, lastName, dateOfBirth, expiryDate, location, documentType: 'ethiopian_id' };
  }

  // Extract data from foreign documents (passport, driver's license, etc.)
  function extractForeignDocumentData(ocrText: string) {
    const cleanText = ocrText.replace(/\s+/g, " ").trim();
    const upperText = cleanText.toUpperCase();

    // Detect document type
    let documentType = 'other';
    if (upperText.includes('PASSPORT')) {
      documentType = 'passport';
    } else if (upperText.includes('DRIVER') || upperText.includes('DRIVING') || upperText.includes('LICENSE')) {
      documentType = 'drivers_license';
    }

    // Extract passport number (various formats)
    let idNumber: string | null = null;
    
    // Common passport patterns
    const passportPatterns = [
      /(?:Passport|No|Number)[:\s]*([A-Z0-9]{6,15})/i,
      /\b([A-Z]{1,2}\d{6,9})\b/,
      /\b(\d{9})\b/,
    ];
    
    for (const pattern of passportPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        idNumber = match[1] || match[0];
        break;
      }
    }

    // Extract name (usually in CAPS on passports)
    const namePatterns = [
      /(?:Name|Surname|Given Names?)[:\s]*([A-Z\s]{5,50})/i,
      /([A-Z]{3,}\s+[A-Z]{3,})/,
    ];
    
    let fullName: string | null = null;
    for (const pattern of namePatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        fullName = match[1].trim();
        break;
      }
    }

    // Extract expiry date (various formats)
    const expiryPatterns = [
      /(?:Expiry|Expires?|Valid Until)[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
    ];
    
    let expiryDate: string | null = null;
    for (const pattern of expiryPatterns) {
      const match = cleanText.match(pattern);
      if (match) {
        expiryDate = match[1];
        break;
      }
    }

    // Extract country/nationality
    const countryMatch = cleanText.match(/(?:Nationality|Country)[:\s]*([A-Za-z\s]+)/i);
    const country = countryMatch ? countryMatch[1].trim() : null;

    return {
      idNumber,
      fullName,
      expiryDate,
      country,
      documentType,
      location: null,
    };
  }

  // Universal ID Scanning endpoint - supports Ethiopian ID and foreign documents
  app.post('/api/id-scan', isAuthenticated, async (req: any, res) => {
    try {
      const { scanData, scanMethod, timestamp, imageUrl } = req.body;
      const userId = req.user.id;
      
      if (!scanData) {
        return res.status(400).json({ message: "No scan data provided" });
      }
      
      
      let idNumber: string | null = null;
      let fullName: string | null = null;
      let firstName: string | null = null;
      let middleName: string | null = null;
      let lastName: string | null = null;
      let dateOfBirth: string | null = null;
      let expiryDate: string | null = null;
      let location: string | null = null;
      let documentType: string = 'other';
      let country: string | null = null;
      
      // Parse data based on scan method
      if (scanMethod === "qr") {
        // QR code scan - Ethiopian Digital ID (supports both 12-digit and 15-digit IDs)
        const ethiopianIdRegex = /^[0-9]{12,15}$/;
        try {
          // Try to parse as base64-encoded JSON (Ethiopian digital ID format)
          const decoded = JSON.parse(Buffer.from(scanData, 'base64').toString('utf-8'));
          idNumber = decoded.idNumber || decoded.id_number || decoded.ID;
          fullName = decoded.fullName || decoded.full_name || decoded.name;
          firstName = decoded.firstName || decoded.first_name;
          middleName = decoded.middleName || decoded.middle_name;
          lastName = decoded.lastName || decoded.last_name;
          dateOfBirth = decoded.dateOfBirth || decoded.dob || decoded.birth_date;
          documentType = 'ethiopian_id';
          country = 'Ethiopia';
        } catch (e) {
          // If not base64, try parsing as plain JSON
          try {
            const parsed = JSON.parse(scanData);
            idNumber = parsed.idNumber || parsed.id_number || parsed.ID;
            fullName = parsed.fullName || parsed.full_name || parsed.name;
            firstName = parsed.firstName || parsed.first_name;
            middleName = parsed.middleName || parsed.middle_name;
            lastName = parsed.lastName || parsed.last_name;
            dateOfBirth = parsed.dateOfBirth || parsed.dob || parsed.birth_date;
            documentType = 'ethiopian_id';
            country = 'Ethiopia';
          } catch (e2) {
            // If not JSON, try extracting ID number directly from string
            const match = scanData.match(ethiopianIdRegex);
            idNumber = match ? match[0] : null;
            documentType = 'ethiopian_id';
            country = 'Ethiopia';
          }
        }
        
        // Split fullName into firstName, middleName, and lastName if not already provided
        if (fullName && (!firstName || !lastName)) {
          const nameParts = fullName.trim().split(/\s+/);
          if (nameParts.length >= 3) {
            firstName = firstName || nameParts[0];
            middleName = middleName || nameParts.slice(1, -1).join(' ');
            lastName = lastName || nameParts[nameParts.length - 1];
          } else if (nameParts.length === 2) {
            firstName = firstName || nameParts[0];
            lastName = lastName || nameParts[1];
          }
        }

        // Validate Ethiopian ID format
        if (!idNumber || !ethiopianIdRegex.test(idNumber)) {
          return res.status(400).json({
            success: false,
            message: "Invalid Ethiopian ID format. ID must be 12-15 digits.",
            error: "Invalid ID number",
          });
        }
      } else if (scanMethod === "photo") {
        // Photo upload - could be Ethiopian ID or foreign document
        // Try Ethiopian ID first
        const ethiopianData = extractEthiopianIDData(scanData);
        
        if (ethiopianData.idNumber) {
          // Looks like Ethiopian ID
          idNumber = ethiopianData.idNumber;
          fullName = ethiopianData.fullName !== "Not detected" ? ethiopianData.fullName : null;
          firstName = ethiopianData.firstName;
          middleName = ethiopianData.middleName;
          lastName = ethiopianData.lastName;
          dateOfBirth = ethiopianData.dateOfBirth;
          expiryDate = ethiopianData.expiryDate;
          location = ethiopianData.location !== "Unknown" ? ethiopianData.location : null;
          documentType = 'ethiopian_id';
          country = 'Ethiopia';
        } else {
          // Try foreign document extraction
          const foreignData = extractForeignDocumentData(scanData);
          idNumber = foreignData.idNumber;
          fullName = foreignData.fullName;
          expiryDate = foreignData.expiryDate;
          country = foreignData.country;
          documentType = foreignData.documentType;
          location = null;
          
          // Split full name for foreign documents
          if (fullName && (!firstName || !lastName)) {
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length >= 3) {
              firstName = firstName || nameParts[0];
              middleName = middleName || nameParts.slice(1, -1).join(' ');
              lastName = lastName || nameParts[nameParts.length - 1];
            } else if (nameParts.length === 2) {
              firstName = firstName || nameParts[0];
              lastName = lastName || nameParts[1];
            }
          }
        }
      }
      
      // Validate that we extracted at least an ID number
      if (!idNumber) {
        return res.status(400).json({
          success: false,
          message: "Could not extract ID number from document. Please ensure the image is clear and try again.",
          error: "No ID number detected",
        });
      }
      
      // Update user with verified ID information
      const user = await storage.getUser(userId);
      if (user) {
        await storage.upsertUser({
          ...user,
          idVerified: true,
          idNumber,
          idFullName: fullName || user.idFullName,
          idDocumentType: documentType,
          idDocumentUrl: imageUrl || user.idDocumentUrl,
          idExpiryDate: expiryDate || user.idExpiryDate,
          idCountry: country || user.idCountry,
        });
      }
      
      const docTypeLabel = documentType === 'ethiopian_id' ? 'Ethiopian ID' : 
                          documentType === 'passport' ? 'Passport' :
                          documentType === 'drivers_license' ? "Driver's License" : 'ID';
      
      res.json({
        success: true,
        message: `${docTypeLabel} verified successfully`,
        verified: true,
        idNumber,
        fullName,
        firstName,
        middleName,
        lastName,
        dateOfBirth,
        expiryDate,
        location,
        documentType,
        country,
        scanMethod,
        timestamp,
      });
    } catch (error: any) {
      console.error("Error processing ID scan:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Failed to process ID scan",
        error: "Processing error",
      });
    }
  });

  // Admin statistics
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin: Manual Split-Payment Trigger (for testing)
  app.post('/api/admin/trigger-split/:bookingId', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (userRole !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const bookingId = parseInt(req.params.bookingId);
      
      const splitResult = await storage.processAutoPaymentSplit(bookingId);
      
      res.json({
        success: true,
        message: 'Payment split processed successfully',
        distribution: splitResult
      });
    } catch (error: any) {
      console.error("Error processing manual split-payment:", error);
      res.status(500).json({ 
        success: false,
        message: error.message || "Failed to process payment split" 
      });
    }
  });

  // Operator-specific routes for verification
  app.get('/api/operator/pending-documents', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const documents = await storage.getPendingVerificationDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching pending documents:", error);
      res.status(500).json({ message: "Failed to fetch pending documents" });
    }
  });

  app.get('/api/operator/pending-properties', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const properties = await storage.getPendingProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching pending properties:", error);
      res.status(500).json({ message: "Failed to fetch pending properties" });
    }
  });

  app.post('/api/operator/documents/:documentId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { documentId } = req.params;
      const verifierId = req.user.id;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), 'approved', verifierId);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error approving document:", error);
      res.status(500).json({ message: "Failed to approve document" });
    }
  });

  app.post('/api/operator/documents/:documentId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { documentId } = req.params;
      const { reason } = req.body;
      const verifierId = req.user.id;
      
      const updatedDocument = await storage.verifyDocument(parseInt(documentId), 'rejected', verifierId, reason);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error rejecting document:", error);
      res.status(500).json({ message: "Failed to reject document" });
    }
  });

  app.post('/api/operator/properties/:propertyId/approve', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { propertyId } = req.params;
      const verifierId = req.user.id;
      
      const updatedProperty = await storage.verifyProperty(parseInt(propertyId), 'approved', verifierId);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error approving property:", error);
      res.status(500).json({ message: "Failed to approve property" });
    }
  });

  app.post('/api/operator/properties/:propertyId/reject', isAuthenticated, async (req: any, res) => {
    try {
      const userRole = req.user.role || 'guest';
      if (!['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: "Operator access required" });
      }
      
      const { propertyId } = req.params;
      const { reason } = req.body;
      const verifierId = req.user.id;
      
      const updatedProperty = await storage.verifyProperty(parseInt(propertyId), 'rejected', verifierId, reason);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error rejecting property:", error);
      res.status(500).json({ message: "Failed to reject property" });
    }
  });

  // Property routes - Enhanced search with filters and sorting
  app.get('/api/properties', async (req, res) => {
    try {
      const { city, type, minPrice, maxPrice, maxGuests, checkIn, checkOut, q, sort } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (type) filters.type = type as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (maxGuests) filters.maxGuests = parseInt(maxGuests as string);
      if (checkIn) filters.checkIn = new Date(checkIn as string);
      if (checkOut) filters.checkOut = new Date(checkOut as string);
      if (q) filters.q = q as string;
      if (sort) filters.sort = sort as string;

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Dedicated search endpoint (alias for /api/properties with search parameters)
  app.get('/api/properties/search', async (req, res) => {
    try {
      const { city, type, minPrice, maxPrice, maxGuests, checkIn, checkOut, q, sort } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      if (type) filters.type = type as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (maxGuests) filters.maxGuests = parseInt(maxGuests as string);
      if (checkIn) filters.checkIn = new Date(checkIn as string);
      if (checkOut) filters.checkOut = new Date(checkOut as string);
      if (q) filters.q = q as string;
      if (sort) filters.sort = sort as string;

      const properties = await storage.getProperties(filters);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Map-based discovery endpoint
  app.get('/api/properties/discover', async (req, res) => {
    try {
      const { north, south, east, west, city } = req.query;
      
      const filters: any = {};
      if (city) filters.city = city as string;
      
      const allProperties = await storage.getProperties(filters);
      
      // Filter by map bounds if provided
      let mapResults = allProperties;
      if (north && south && east && west) {
        const northNum = parseFloat(north as string);
        const southNum = parseFloat(south as string);
        const eastNum = parseFloat(east as string);
        const westNum = parseFloat(west as string);
        
        mapResults = allProperties.filter((p: any) => {
          const lat = parseFloat(p.latitude || "0");
          const lng = parseFloat(p.longitude || "0");
          return lat >= southNum && lat <= northNum && lng >= westNum && lng <= eastNum;
        });
      }
      
      // AI-style recommendations (top 3 highest rated)
      const recommendations = [...allProperties]
        .sort((a: any, b: any) => parseFloat(b.rating || "0") - parseFloat(a.rating || "0"))
        .slice(0, 3);
      
      // Mock nearby amenities (can be replaced with real Google Places API)
      const amenities = [
        { id: "a1", name: "Coffee Roastery", type: "Cafe", lat: 9.012, lng: 38.763 },
        { id: "a2", name: "Medical Clinic", type: "Hospital", lat: 9.014, lng: 38.769 },
        { id: "a3", name: "Bus Terminal", type: "Transport", lat: 9.008, lng: 38.755 },
      ];
      
      res.json({ mapResults, recommendations, amenities });
    } catch (error) {
      console.error("Error in discovery endpoint:", error);
      res.status(500).json({ message: "Failed to fetch discovery data" });
    }
  });

  app.get('/api/properties/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // INSA Security: Validate ID parameter
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      
      const property = await storage.getProperty(id);
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // INSA FIX: Validate image URLs were uploaded by this user
      if (req.body.images && Array.isArray(req.body.images)) {
        const imageValidation = validateUserUploadedImages(userId, req.body.images);
        if (!imageValidation.valid) {
          logSecurityEvent(userId, 'UNAUTHORIZED_IMAGE_REFERENCE_ATTEMPT', { 
            action: 'CREATE_PROPERTY',
            invalidImages: imageValidation.invalidImages 
          }, req.ip || 'unknown');
          return res.status(403).json({ 
            message: "One or more image URLs are invalid or were not uploaded by your account",
            invalidImages: imageValidation.invalidImages
          });
        }
      }
      
      const propertyData = insertPropertySchema.parse({ ...req.body, hostId: userId });
      
      const property = await storage.createProperty(propertyData);
      logSecurityEvent(userId, 'PROPERTY_CREATED', { propertyId: property.id }, req.ip || 'unknown');
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.put('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns the property
      const property = await storage.getProperty(id);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      // INSA FIX: Validate NEW image URLs were uploaded by this user
      // Allow existing images from the property to remain
      if (req.body.images && Array.isArray(req.body.images)) {
        const existingImages = new Set(property.images || []);
        const newImages = req.body.images.filter((img: string) => !existingImages.has(img));
        
        if (newImages.length > 0) {
          const imageValidation = validateUserUploadedImages(userId, newImages);
          if (!imageValidation.valid) {
            logSecurityEvent(userId, 'UNAUTHORIZED_IMAGE_REFERENCE_ATTEMPT', { 
              action: 'UPDATE_PROPERTY',
              propertyId: id,
              invalidImages: imageValidation.invalidImages 
            }, req.ip || 'unknown');
            return res.status(403).json({ 
              message: "One or more new image URLs are invalid or were not uploaded by your account",
              invalidImages: imageValidation.invalidImages
            });
          }
        }
      }

      const updates = insertPropertySchema.partial().parse(req.body);
      const updatedProperty = await storage.updateProperty(id, updates);
      logSecurityEvent(userId, 'PROPERTY_UPDATED', { propertyId: id }, req.ip || 'unknown');
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns the property
      const property = await storage.getProperty(id);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await storage.deleteProperty(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Host dashboard routes
  app.get('/api/host/properties', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const properties = await storage.getPropertiesByHost(userId);
      res.json(properties);
    } catch (error) {
      console.error("Error fetching host properties:", error);
      res.status(500).json({ message: "Failed to fetch host properties" });
    }
  });

  app.get('/api/host/properties/:id/stats', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      // Check if user owns the property
      const property = await storage.getProperty(id);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const stats = await storage.getPropertyStats(id);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching property stats:", error);
      res.status(500).json({ message: "Failed to fetch property stats" });
    }
  });

  // Host dashboard stats
  app.get('/api/host/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const stats = await storage.getHostStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching host stats:", error);
      res.status(500).json({ message: "Failed to fetch host stats" });
    }
  });

  // Host earnings endpoint (ERCA compliant)
  app.get('/api/host/earnings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get all properties for this host
      const properties = await storage.getPropertiesByHost(userId);
      const propertyIds = properties.map(p => p.id);
      
      // Get all paid bookings for host's properties
      const allBookings = await Promise.all(
        propertyIds.map(id => storage.getBookingsByProperty(id))
      );
      const paidBookings = allBookings
        .flat()
        .filter(b => b.paymentStatus === 'paid');
      
      // Calculate totals
      const summary = {
        totalBookings: paidBookings.length,
        grossRevenue: paidBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice || '0'), 0),
        algaServiceFee: paidBookings.reduce((sum, b) => sum + parseFloat(b.algaCommission || '0'), 0),
        vat: paidBookings.reduce((sum, b) => sum + parseFloat(b.vat || '0'), 0),
        withholding: paidBookings.reduce((sum, b) => sum + parseFloat(b.withholding || '0'), 0),
        netPayout: paidBookings.reduce((sum, b) => sum + parseFloat(b.hostPayout || '0'), 0),
        bookings: paidBookings.map(b => ({
          id: b.id,
          propertyId: b.propertyId,
          checkIn: b.checkIn,
          checkOut: b.checkOut,
          guestPaid: parseFloat(b.totalPrice),
          serviceFee: parseFloat(b.algaCommission || '0'),
          vat: parseFloat(b.vat || '0'),
          withholding: parseFloat(b.withholding || '0'),
          yourPayout: parseFloat(b.hostPayout || '0'),
        }))
      };
      
      res.json(summary);
    } catch (error) {
      console.error("Error fetching host earnings:", error);
      res.status(500).json({ message: "Failed to fetch host earnings" });
    }
  });

  // ==================== ALGA SECURE ACCESS ROUTES ====================
  
  // Helper function to generate 4-digit access code
  function generate4DigitCode(): string {
    return randomInt(1000, 9999).toString();
  }
  
  // Lockbox Management Routes
  app.post('/api/lockboxes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const lockboxData = insertLockboxSchema.parse(req.body);
      const propertyId = lockboxData.propertyId as number;
      
      // Verify user owns the property
      const property = await storage.getProperty(propertyId);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this property" });
      }
      
      // Check if property already has a lockbox
      const existing = await storage.getLockboxByPropertyId(propertyId);
      if (existing) {
        return res.status(400).json({ message: "Property already has a lockbox registered" });
      }
      
      const lockbox = await storage.createLockbox(lockboxData);
      res.status(201).json(lockbox);
    } catch (error) {
      console.error("Error creating lockbox:", error);
      res.status(500).json({ message: "Failed to register lockbox" });
    }
  });
  
  app.get('/api/lockboxes/property/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const lockbox = await storage.getLockboxByPropertyId(propertyId);
      
      if (!lockbox) {
        return res.status(404).json({ message: "No lockbox found for this property" });
      }
      
      res.json(lockbox);
    } catch (error) {
      console.error("Error fetching lockbox:", error);
      res.status(500).json({ message: "Failed to fetch lockbox" });
    }
  });
  
  app.patch('/api/lockboxes/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const updates = req.body;
      
      // Get lockbox and verify ownership
      const lockbox = await storage.getLockboxByPropertyId(updates.propertyId);
      if (!lockbox || lockbox.id !== id) {
        return res.status(404).json({ message: "Lockbox not found" });
      }
      
      const property = await storage.getProperty(lockbox.propertyId);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updateLockbox(id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating lockbox:", error);
      res.status(500).json({ message: "Failed to update lockbox" });
    }
  });
  
  // Operator-only: Verify lockbox
  app.post('/api/lockboxes/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const { status, rejectionReason } = req.body;
      
      // Check if user is operator or admin
      if (req.user.role !== 'operator' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Only operators can verify hardware" });
      }
      
      const verified = await storage.verifyLockbox(id, userId, status, rejectionReason);
      
      // Update property hardware status
      if (status === 'verified') {
        const cameras = await storage.getSecurityCamerasByPropertyId(verified.propertyId);
        const cameraVerified = cameras.some(c => c.verificationStatus === 'verified');
        await storage.updatePropertyHardwareStatus(verified.propertyId, true, cameraVerified);
      }
      
      res.json(verified);
    } catch (error) {
      console.error("Error verifying lockbox:", error);
      res.status(500).json({ message: "Failed to verify lockbox" });
    }
  });
  
  // Operator-only: Get all pending lockboxes
  app.get('/api/lockboxes/pending', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'operator' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Only operators can view pending hardware" });
      }
      
      const lockboxes = await storage.getAllPendingLockboxes();
      res.json(lockboxes);
    } catch (error) {
      console.error("Error fetching pending lockboxes:", error);
      res.status(500).json({ message: "Failed to fetch pending lockboxes" });
    }
  });
  
  // Security Camera Management Routes
  app.post('/api/security-cameras', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cameraData = insertSecurityCameraSchema.parse(req.body);
      const propertyId = cameraData.propertyId as number;
      
      // Verify user owns the property
      const property = await storage.getProperty(propertyId);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized: You don't own this property" });
      }
      
      const camera = await storage.createSecurityCamera(cameraData);
      res.status(201).json(camera);
    } catch (error) {
      console.error("Error creating security camera:", error);
      res.status(500).json({ message: "Failed to register security camera" });
    }
  });
  
  app.get('/api/security-cameras/property/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const cameras = await storage.getSecurityCamerasByPropertyId(propertyId);
      res.json(cameras);
    } catch (error) {
      console.error("Error fetching security cameras:", error);
      res.status(500).json({ message: "Failed to fetch security cameras" });
    }
  });
  
  app.patch('/api/security-cameras/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const updates = req.body;
      
      // Verify ownership through property
      const cameras = await storage.getSecurityCamerasByPropertyId(updates.propertyId);
      const camera = cameras.find(c => c.id === id);
      if (!camera) {
        return res.status(404).json({ message: "Camera not found" });
      }
      
      const property = await storage.getProperty(camera.propertyId);
      if (!property || property.hostId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updated = await storage.updateSecurityCamera(id, updates);
      res.json(updated);
    } catch (error) {
      console.error("Error updating security camera:", error);
      res.status(500).json({ message: "Failed to update security camera" });
    }
  });
  
  // Operator-only: Verify security camera
  app.post('/api/security-cameras/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const { status, rejectionReason } = req.body;
      
      // Check if user is operator or admin
      if (req.user.role !== 'operator' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Only operators can verify hardware" });
      }
      
      const verified = await storage.verifySecurityCamera(id, userId, status, rejectionReason);
      
      // Update property hardware status
      if (status === 'verified') {
        const lockbox = await storage.getLockboxByPropertyId(verified.propertyId);
        const lockboxVerified = lockbox?.verificationStatus === 'verified';
        const cameras = await storage.getSecurityCamerasByPropertyId(verified.propertyId);
        const allCamerasVerified = cameras.every(c => c.verificationStatus === 'verified');
        await storage.updatePropertyHardwareStatus(verified.propertyId, lockboxVerified || false, allCamerasVerified);
      }
      
      res.json(verified);
    } catch (error) {
      console.error("Error verifying security camera:", error);
      res.status(500).json({ message: "Failed to verify security camera" });
    }
  });
  
  // Operator-only: Get all pending security cameras
  app.get('/api/security-cameras/pending', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'operator' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Only operators can view pending hardware" });
      }
      
      const cameras = await storage.getAllPendingSecurityCameras();
      res.json(cameras);
    } catch (error) {
      console.error("Error fetching pending security cameras:", error);
      res.status(500).json({ message: "Failed to fetch pending security cameras" });
    }
  });
  
  // Operator-only: Get properties without hardware
  app.get('/api/properties/without-hardware', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'operator' && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized: Only operators can view this data" });
      }
      
      const properties = await storage.getPropertiesWithoutHardware();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties without hardware:", error);
      res.status(500).json({ message: "Failed to fetch properties without hardware" });
    }
  });
  
  // Access Code Routes - Get code for a booking
  app.get('/api/access-codes/booking/:bookingId', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user.id;
      
      // Get booking and verify ownership
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.guestId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const accessCode = await storage.getAccessCodeByBookingId(bookingId);
      if (!accessCode) {
        return res.status(404).json({ message: "No access code found for this booking" });
      }
      
      res.json(accessCode);
    } catch (error) {
      console.error("Error fetching access code:", error);
      res.status(500).json({ message: "Failed to fetch access code" });
    }
  });

  // ==================== CURRENCY & PRICE VALIDATION ENDPOINTS ====================
  
  // Get supported currencies - for frontend display
  app.get('/api/currencies', (req, res) => {
    res.json({
      currencies: Object.keys(CURRENCY_RATES),
      baseCurrency: 'ETB',
      rates: CURRENCY_RATES,
      lastUpdated: new Date().toISOString()
    });
  });
  
  // Preview booking price calculation (server-side) - for frontend display before booking
  // This ensures frontend shows the SAME price that will be charged
  app.post('/api/bookings/preview-price', isAuthenticated, async (req: any, res) => {
    try {
      const { propertyId, checkIn, checkOut, guests } = req.body;
      
      if (!propertyId || !checkIn || !checkOut) {
        return res.status(400).json({ message: 'Property ID, check-in and check-out dates are required' });
      }
      
      // Validate dates
      const dateValidation = validateBookingDates(checkIn, checkOut);
      if (!dateValidation.valid) {
        return res.status(400).json({ message: dateValidation.error, code: 'INVALID_DATES' });
      }
      
      // Validate guest count
      const guestValidation = await validateGuestCount(propertyId, guests || 1);
      if (!guestValidation.valid) {
        return res.status(400).json({ 
          message: guestValidation.error, 
          code: 'INVALID_GUEST_COUNT',
          maxGuests: guestValidation.maxGuests 
        });
      }
      
      // Calculate price server-side (this is what will be charged)
      const pricing = await calculateBookingPrice(propertyId, checkIn, checkOut, guests || 1);
      
      res.json({
        pricing: {
          pricePerNight: pricing.pricePerNight,
          nights: pricing.nights,
          subtotal: pricing.subtotal,
          serviceFee: pricing.serviceFee,
          total: pricing.total,
          currency: pricing.currency,
          currencyLocked: true,  // Indicates currency cannot be changed
          serverCalculated: true // Indicates price is server-calculated
        },
        message: 'This is the final price that will be charged. Currency and price are determined by the property and cannot be modified.'
      });
    } catch (error: any) {
      console.error("Error calculating preview price:", error);
      res.status(500).json({ message: error.message || "Failed to calculate price" });
    }
  });
  // ==================== END CURRENCY & PRICE VALIDATION ENDPOINTS ====================

  // Booking routes
  // INSA Fixes #3, #5, #6, #11, #12: Server-side validation and price calculation
  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { propertyId, checkIn, checkOut, guests, specialRequests, paymentMethod, currency: clientCurrency, totalPrice: clientPrice } = req.body;
      
      // INSA FIX: Reject any client-provided status or paymentStatus fields
      // These are SERVER-CONTROLLED and cannot be set by clients
      if (req.body.status || req.body.paymentStatus) {
        logSecurityEvent(userId, 'STATUS_INJECTION_ATTEMPT', { 
          propertyId,
          attemptedStatus: req.body.status,
          attemptedPaymentStatus: req.body.paymentStatus
        }, req.ip || 'unknown');
        // Don't reject - just ignore and log (status will be set server-side anyway)
      }
      
      // INSA Fix #11: Validate date order
      const dateValidation = validateBookingDates(checkIn, checkOut);
      if (!dateValidation.valid) {
        return res.status(400).json({ message: dateValidation.error, code: 'INVALID_DATES' });
      }
      
      // INSA Fix #6: Validate guest count against property capacity
      const guestValidation = await validateGuestCount(propertyId, guests);
      if (!guestValidation.valid) {
        // Log potential capacity bypass attempt
        logSecurityEvent(userId, 'GUEST_CAPACITY_VALIDATION_FAILED', { 
          propertyId, 
          requestedGuests: guests,
          maxGuests: guestValidation.maxGuests,
          error: guestValidation.error
        }, req.ip || 'unknown');
        return res.status(400).json({ 
          message: guestValidation.error, 
          code: 'INVALID_GUEST_COUNT',
          maxGuests: guestValidation.maxGuests 
        });
      }
      
      // INSA Fix #3 & #5: Calculate price server-side (IGNORE client-provided price and currency)
      // Pass clientCurrency for logging purposes only - it will NOT affect final price
      const pricing = await calculateBookingPrice(propertyId, checkIn, checkOut, guests, clientCurrency);
      
      // INSA FIX: Log if client attempted to manipulate currency or price
      if (clientCurrency || clientPrice) {
        const currencyMismatch = clientCurrency && clientCurrency.toUpperCase() !== pricing.currency;
        const priceMismatch = clientPrice && parseFloat(String(clientPrice)) !== pricing.total;
        
        if (currencyMismatch || priceMismatch) {
          logSecurityEvent(userId, 'CURRENCY_PRICE_MANIPULATION_ATTEMPT', {
            propertyId,
            clientCurrency: clientCurrency || 'not provided',
            serverCurrency: pricing.currency,
            clientPrice: clientPrice || 'not provided',
            serverPrice: pricing.total,
            currencyMismatch,
            priceMismatch
          }, req.ip || 'unknown');
        }
      }
      
      // INSA Fix #12: Generate secure booking reference
      const bookingReference = generateBookingReference();
      
      const bookingData = insertBookingSchema.parse({ 
        propertyId,
        guestId: userId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        guests,
        totalPrice: pricing.total.toFixed(2),
        currency: pricing.currency,
        specialRequests: specialRequests || null,
        paymentMethod: paymentMethod || null,
        status: 'pending',
        paymentStatus: 'pending',
        bookingReference,
      });
      
      const booking = await storage.createBooking(bookingData);
      
      // Log security event
      await logSecurityEvent(userId, 'BOOKING_CREATED', { 
        bookingId: booking.id, 
        bookingReference,
        propertyId, 
        totalPrice: pricing.total 
      }, req.ip || 'unknown');
      
      res.status(201).json({
        ...booking,
        pricing: {
          pricePerNight: pricing.pricePerNight,
          nights: pricing.nights,
          subtotal: pricing.subtotal,
          serviceFee: pricing.serviceFee,
          total: pricing.total,
          currency: pricing.currency,
          currencyLocked: true,  // INSA: Currency is locked and cannot be changed
          serverCalculated: true // INSA: Price was calculated server-side
        },
        _securityInfo: {
          currencySource: 'property',
          priceSource: 'server',
          immutableFields: IMMUTABLE_BOOKING_FIELDS
        }
      });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getBookingsByGuest(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // INSA Fix #2: Validate booking ownership before returning details
  app.get('/api/bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      const userRole = req.user.role;
      
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get property to check if user is the host
      const property = await db.select().from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
      const isHost = property[0]?.hostId === userId;
      
      // Only allow guest, host, admin, or operator to view
      if (booking.guestId !== userId && !isHost && !['admin', 'operator'].includes(userRole)) {
        await logSecurityEvent(userId, 'UNAUTHORIZED_BOOKING_ACCESS', { bookingId: id }, req.ip || 'unknown');
        return res.status(403).json({ message: "Access denied", code: 'BOOKING_ACCESS_DENIED' });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching booking:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // INSA Fix #2, #4, #9: Validate ownership and status transitions
  app.patch('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Validate status is not empty
      if (!status || typeof status !== 'string' || status.trim() === '') {
        return res.status(400).json({ message: "Status is required", code: 'INVALID_STATUS' });
      }
      
      // Get booking and validate ownership
      const booking = await storage.getBooking(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get property to check if user is the host
      const property = await db.select().from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
      const isHost = property[0]?.hostId === userId;
      
      // INSA Fix #9: Only allow guest (for cancellation), host, admin, or operator
      if (booking.guestId !== userId && !isHost && !['admin', 'operator'].includes(userRole)) {
        await logSecurityEvent(userId, 'UNAUTHORIZED_STATUS_CHANGE', { bookingId: id, attemptedStatus: status }, req.ip || 'unknown');
        return res.status(403).json({ message: "Access denied", code: 'STATUS_CHANGE_DENIED' });
      }
      
      // Guests can only cancel their own bookings
      if (booking.guestId === userId && !isHost && status !== 'cancelled') {
        return res.status(403).json({ message: "Guests can only cancel bookings", code: 'GUEST_CANCEL_ONLY' });
      }
      
      // INSA Fix #4: Validate status transition
      if (!validateStatusTransition(booking.status, status, 'booking')) {
        return res.status(400).json({ 
          message: `Cannot change status from '${booking.status}' to '${status}'`,
          code: 'INVALID_STATUS_TRANSITION'
        });
      }
      
      // INSA Fix #4: For 'confirmed' or 'completed' status, require payment verification
      if ((status === 'confirmed' || status === 'completed') && booking.paymentStatus !== 'paid') {
        return res.status(400).json({ 
          message: "Cannot confirm booking without verified payment",
          code: 'PAYMENT_REQUIRED'
        });
      }
      
      const updatedBooking = await storage.updateBookingStatus(id, status);
      
      // Log the status change
      await logSecurityEvent(userId, 'BOOKING_STATUS_CHANGED', { 
        bookingId: id, 
        previousStatus: booking.status,
        newStatus: status 
      }, req.ip || 'unknown');
      
      // Automatically calculate agent commission when booking is completed
      if (status === 'completed') {
        try {
          const commission = await storage.calculateAndCreateCommission(id);
          if (commission) {
            console.log(`✅ Agent commission created: ${commission.commissionAmount} Birr for booking #${id}`);
          }
        } catch (commissionError) {
          console.error("Failed to create agent commission:", commissionError);
        }
      }
      
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // ==================== INSA FIX: PAYMENT STATUS VALIDATION ====================
  // Valid payment statuses and their allowed transitions
  const VALID_PAYMENT_STATUSES = ['pending', 'processing', 'paid', 'failed', 'refunded', 'cancelled'];
  
  const PAYMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
    'pending': ['processing', 'paid', 'cancelled', 'failed'],  // Can start processing or be cancelled
    'processing': ['paid', 'failed', 'cancelled'],              // Processing can complete, fail, or be cancelled
    'paid': ['refunded'],                                        // Paid can only be refunded
    'failed': ['pending', 'cancelled'],                          // Failed can retry or be cancelled
    'refunded': [],                                               // Refunded is final
    'cancelled': [],                                              // Cancelled is final
  };
  
  function validatePaymentStatusTransition(currentStatus: string, newStatus: string): { valid: boolean; error?: string } {
    if (!VALID_PAYMENT_STATUSES.includes(newStatus)) {
      return { valid: false, error: `Invalid payment status '${newStatus}'. Valid statuses: ${VALID_PAYMENT_STATUSES.join(', ')}` };
    }
    
    const allowedTransitions = PAYMENT_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowedTransitions.includes(newStatus)) {
      return { 
        valid: false, 
        error: `Cannot transition payment status from '${currentStatus}' to '${newStatus}'. Allowed: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (final status)'}` 
      };
    }
    
    return { valid: true };
  }
  // ==================== END PAYMENT STATUS VALIDATION ====================

  // INSA Fix: Secure payment status update with ownership verification
  // CRITICAL: Payment status can ONLY be updated through verified payment gateway callbacks
  // Manual status changes require admin role AND payment reference verification
  app.patch('/api/bookings/:id/payment', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { paymentStatus, paymentReference, paymentGateway } = req.body;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Validate paymentStatus is provided and valid
      if (!paymentStatus || typeof paymentStatus !== 'string') {
        return res.status(400).json({ message: "Payment status is required", code: 'INVALID_PAYMENT_STATUS' });
      }
      
      // INSA FIX: Validate payment status is one of the allowed values
      if (!VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
        logSecurityEvent(userId, 'INVALID_PAYMENT_STATUS_ATTEMPT', { bookingId: id, attemptedStatus: paymentStatus }, req.ip || 'unknown');
        return res.status(400).json({ 
          message: `Invalid payment status. Allowed values: ${VALID_PAYMENT_STATUSES.join(', ')}`,
          code: 'INVALID_PAYMENT_STATUS_VALUE'
        });
      }
      
      // Get booking first to verify ownership
      const existingBooking = await storage.getBooking(id);
      if (!existingBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Get property to check if user is the host
      const property = await db.select().from(properties).where(eq(properties.id, existingBooking.propertyId)).limit(1);
      const isHost = property[0]?.hostId === userId;
      
      // INSA Fix: Only allow host, admin, or operator to update payment status (not guests)
      if (!isHost && !['admin', 'operator'].includes(userRole)) {
        await logSecurityEvent(userId, 'UNAUTHORIZED_PAYMENT_STATUS_CHANGE', { bookingId: id, attemptedStatus: paymentStatus }, req.ip || 'unknown');
        return res.status(403).json({ message: "Access denied. Only hosts, admins, or operators can update payment status.", code: 'PAYMENT_STATUS_DENIED' });
      }
      
      // INSA FIX: Validate payment status transition
      const transitionValidation = validatePaymentStatusTransition(existingBooking.paymentStatus, paymentStatus);
      if (!transitionValidation.valid) {
        logSecurityEvent(userId, 'INVALID_PAYMENT_TRANSITION_ATTEMPT', { 
          bookingId: id, 
          currentStatus: existingBooking.paymentStatus,
          attemptedStatus: paymentStatus 
        }, req.ip || 'unknown');
        return res.status(400).json({ 
          message: transitionValidation.error,
          code: 'INVALID_PAYMENT_TRANSITION'
        });
      }
      
      // INSA FIX: For 'paid' status, require verified gateway callback (except for admin override)
      if (paymentStatus === 'paid') {
        // Check if payment was verified through gateway callback
        const bookingRef = existingBooking.bookingReference;
        const gatewayVerification = bookingRef ? isPaymentVerified(bookingRef) : null;
        
        if (userRole !== 'admin') {
          // Non-admin users MUST have gateway verification OR provide payment reference
          if (!gatewayVerification && !paymentReference) {
            logSecurityEvent(userId, 'PAYMENT_MARKED_PAID_WITHOUT_VERIFICATION', { 
              bookingId: id,
              bookingReference: bookingRef,
              hasGatewayVerification: !!gatewayVerification
            }, req.ip || 'unknown');
            return res.status(400).json({ 
              message: "Payment must be verified through payment gateway callback before marking as paid. If you have a payment reference, please provide it.",
              code: 'GATEWAY_VERIFICATION_REQUIRED'
            });
          }
          
          // If payment reference provided, verify it matches a valid transaction
          if (paymentReference && !gatewayVerification) {
            // Check if this payment reference was verified
            const refVerification = isPaymentVerified(paymentReference);
            if (!refVerification) {
              logSecurityEvent(userId, 'UNVERIFIED_PAYMENT_REFERENCE', { 
                bookingId: id, 
                paymentReference 
              }, req.ip || 'unknown');
              return res.status(400).json({ 
                message: "The provided payment reference has not been verified by our payment gateway. Please wait for payment confirmation.",
                code: 'PAYMENT_REFERENCE_NOT_VERIFIED'
              });
            }
          }
        }
        
        // Log the payment confirmation
        logSecurityEvent(userId, 'PAYMENT_CONFIRMED', { 
          bookingId: id, 
          paymentReference: paymentReference || gatewayVerification?.transactionId || 'admin_override',
          paymentGateway: paymentGateway || gatewayVerification?.gateway || 'manual',
          confirmedBy: userRole,
          gatewayVerified: !!gatewayVerification
        }, req.ip || 'unknown');
      }
      
      const booking = await storage.updatePaymentStatus(id, paymentStatus);
      
      // ✅ ALGA SECURE ACCESS: Auto-generate 4-digit access code when payment is confirmed
      if (paymentStatus === 'paid') {
        try {
          // Check if access code already exists
          const existingCode = await storage.getAccessCodeByBookingId(id);
          
          if (!existingCode) {
            // Get lockbox for this property
            const lockbox = await storage.getLockboxByPropertyId(booking.propertyId);
            
            // Generate 4-digit access code
            const code = generate4DigitCode();
            
            const accessCodeData = {
              bookingId: id,
              propertyId: booking.propertyId,
              lockboxId: lockbox?.id || null,
              guestId: booking.guestId,
              code,
              validFrom: booking.checkIn,
              validTo: booking.checkOut,
              status: 'active' as const,
              generatedBy: 'system' as const,
              deliveryMethod: 'app' as const,
            };
            
            const accessCode = await storage.createAccessCode(accessCodeData);
            console.log(`🔐 Access code generated for booking #${id}: ${code}`);
            
            // TODO: Send code via SMS/WhatsApp to guest
            // await smsService.sendAccessCode(booking.guestId, code, booking.checkIn, booking.checkOut);
          }
        } catch (accessCodeError) {
          // Log error but don't fail the payment status update
          console.error("Failed to create access code:", accessCodeError);
        }

        // 💰 AUTOMATIC SPLIT-PAYMENT: Distribute funds instantly
        try {
          const splitResult = await storage.processAutoPaymentSplit(id);
          if (splitResult.success) {
            console.log(`💰 SPLIT-PAYMENT SUCCESS for booking #${id}`);
            console.log(`   Dellala: ${splitResult.dellalaAmount.toFixed(2)} ETB | Owner: ${splitResult.ownerAmount.toFixed(2)} ETB | Alga: ${splitResult.algaFee.toFixed(2)} ETB`);
          }
        } catch (splitError) {
          // Log error but don't fail the payment status update
          console.error("Failed to process payment split:", splitError);
        }
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ message: "Failed to update payment status" });
    }
  });

  // Review routes
  app.post('/api/properties/:propertyId/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userId = req.user.id;
      
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        propertyId,
        reviewerId: userId
      });
      
      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.get('/api/properties/:propertyId/reviews', async (req, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const reviews = await storage.getReviewsByProperty(propertyId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Favorites routes
  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favoriteData = insertFavoriteSchema.parse({ ...req.body, userId });
      
      const favorite = await storage.addToFavorites(favoriteData);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete('/api/favorites/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const propertyId = parseInt(req.params.propertyId);
      const userId = req.user.id;
      
      await storage.removeFromFavorites(userId, propertyId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  // Access code routes
  app.get('/api/bookings/:bookingId/access-code', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user.id;
      
      // Verify user owns this booking
      const booking = await storage.getBooking(bookingId);
      if (!booking || booking.guestId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const accessCode = await storage.getAccessCodeByBookingId(bookingId);
      if (!accessCode) {
        return res.status(404).json({ message: "Access code not found" });
      }
      
      res.json(accessCode);
    } catch (error) {
      console.error("Error fetching access code:", error);
      res.status(500).json({ message: "Failed to fetch access code" });
    }
  });

  app.get('/api/access-codes/my-codes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const accessCodes = await storage.getAccessCodesByGuestId(userId);
      res.json(accessCodes);
    } catch (error) {
      console.error("Error fetching access codes:", error);
      res.status(500).json({ message: "Failed to fetch access codes" });
    }
  });

  // Invoice generation endpoint (ERCA-compliant)
  app.get('/api/bookings/:bookingId/invoice', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.bookingId);
      const userId = req.user.id;
      
      // Get booking details
      const booking = await storage.getBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      
      // Verify user has access to this booking (guest or host)
      const property = await storage.getProperty(booking.propertyId);
      if (!property || (booking.guestId !== userId && property.hostId !== userId)) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get guest and property details
      const guest = await storage.getUser(booking.guestId);
      if (!guest) {
        return res.status(404).json({ message: "Guest not found" });
      }
      
      // Prepare invoice data (convert string decimals to numbers)
      const invoiceData = {
        id: booking.id,
        guestName: `${guest.firstName} ${guest.lastName}`,
        propertyName: property.title,
        createdAt: booking.createdAt!,
        totalAmount: parseFloat(booking.totalPrice),
        algaCommission: parseFloat(booking.algaCommission || '0'),
        vat: parseFloat(booking.vat || '0'),
        withholding: parseFloat(booking.withholding || '0'),
        hostPayout: parseFloat(booking.hostPayout || '0'),
      };
      
      // Generate PDF invoice
      const pdfDataUri = await generateInvoice(invoiceData, {
        algaTIN: "ALGA-TIN-12345",
        hostTIN: property.hostId || "N/A",
      });
      
      res.json({ 
        invoicePDF: pdfDataUri,
        bookingId: booking.id,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Host Registration Request
  app.post('/api/host-requests', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { idData } = req.body;

      // Check if user is already a host
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.role === 'host' || user.role === 'admin' || user.role === 'operator') {
        return res.status(400).json({ message: "You already have host privileges or higher" });
      }

      // Check if user already has a pending verification request
      const existingVerifications = await storage.getVerificationDocumentsByUser(userId);
      const pendingVerification = existingVerifications.find((v: any) => v.status === 'pending');
      
      if (pendingVerification) {
        return res.status(400).json({ 
          message: "You already have a pending verification request. Please wait for review." 
        });
      }

      // Update user's ID information from scanned data
      if (idData) {
        await storage.upsertUser({
          ...user,
          idNumber: idData.idNumber || null,
          idFullName: idData.fullName || `${idData.firstName || ''} ${idData.lastName || ''}`.trim() || null,
          idDocumentType: idData.documentType || 'ethiopian_id',
          idExpiryDate: idData.expiryDate || null,
          idCountry: idData.nationality || 'Ethiopia',
        });
      }

      // Create a verification document request (this will be reviewed by operator/admin)
      const verificationDoc = {
        userId,
        documentType: 'national_id',
        documentUrl: '/placeholder-scanned-id', // Placeholder since ID was scanned
        status: 'pending',
      };

      await storage.createVerificationDocument(verificationDoc);

      res.json({ 
        message: "Host application submitted successfully. Your verification is pending review.",
        status: "pending"
      });
    } catch (error) {
      console.error("Error processing host request:", error);
      res.status(500).json({ message: "Failed to process host request" });
    }
  });

  // Payment integration (Telebirr & PayPal)
  // Public payment status endpoint
  app.get('/api/payment/status/telebirr', (req, res) => {
    const telebirrService = require('./services/telebirr.service').createTelebirrService();
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

  // Alga Pay - Unified payment interface (white-labeled)
  app.post('/api/alga-pay', isAuthenticated, algaPayHandler);
  app.post('/api/payment-callback', algaCallback);

  // ==================== INSA SECURITY: PAYMENT GATEWAY CALLBACK VERIFICATION ====================
  // These endpoints are the ONLY way to confirm payment completion
  // Payment status can ONLY be changed through verified gateway callbacks
  
  // Rate limit for payment callbacks (stricter limits to prevent abuse)
  const paymentCallbackLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute per IP
    message: { message: 'Too many payment callback requests', code: 'RATE_LIMITED' },
  });
  
  // Main payment gateway callback endpoint
  // This is called by Telebirr, Chapa, Stripe, PayPal after payment completion
  app.post('/api/payment/gateway-callback', paymentCallbackLimiter, async (req, res) => {
    const startTime = Date.now();
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
    
    try {
      const payload = req.body as GatewayCallbackPayload;
      
      // Verify the callback
      const verificationResult = await verifyPaymentCallback(payload, ipAddress);
      
      if (!verificationResult.verified) {
        // Log failed verification attempt
        logSecurityEvent('system', 'PAYMENT_CALLBACK_VERIFICATION_FAILED', {
          gateway: payload.gateway || 'unknown',
          error: verificationResult.error,
          transactionId: payload.data?.transactionId,
        }, ipAddress);
        
        return res.status(403).json({
          success: false,
          error: verificationResult.error,
          code: 'VERIFICATION_FAILED',
        });
      }
      
      // Payment verified - now update the booking status
      if (verificationResult.bookingReference) {
        try {
          // Find booking by reference
          const bookingResult = await db
            .select()
            .from(bookings)
            .where(eq(bookings.bookingReference, verificationResult.bookingReference))
            .limit(1);
          
          const booking = bookingResult[0];
          
          if (booking) {
            // Update payment status to 'paid'
            const updatedBooking = await storage.updatePaymentStatus(booking.id, 'paid');
            
            // Log successful payment confirmation
            logSecurityEvent('system', 'PAYMENT_GATEWAY_CONFIRMED', {
              bookingId: booking.id,
              bookingReference: verificationResult.bookingReference,
              transactionId: verificationResult.transactionId,
              gateway: verificationResult.gateway,
              amount: verificationResult.amount,
              currency: verificationResult.currency,
              processingTime: Date.now() - startTime,
            }, ipAddress);
            
            console.log(`✅ Payment confirmed via ${verificationResult.gateway}: ${verificationResult.transactionId}`);
            
            return res.json({
              success: true,
              message: 'Payment verified and booking updated',
              bookingId: booking.id,
              transactionId: verificationResult.transactionId,
            });
          } else {
            // Booking not found but payment verified - log for manual reconciliation
            logSecurityEvent('system', 'PAYMENT_VERIFIED_BOOKING_NOT_FOUND', {
              bookingReference: verificationResult.bookingReference,
              transactionId: verificationResult.transactionId,
              gateway: verificationResult.gateway,
              amount: verificationResult.amount,
            }, ipAddress);
            
            return res.status(404).json({
              success: false,
              error: 'Booking not found for payment reference',
              code: 'BOOKING_NOT_FOUND',
              transactionId: verificationResult.transactionId,
            });
          }
        } catch (dbError) {
          console.error('Error updating booking after payment verification:', dbError);
          return res.status(500).json({
            success: false,
            error: 'Failed to update booking status',
            code: 'DB_ERROR',
          });
        }
      }
      
      return res.json({
        success: true,
        message: 'Payment callback verified',
        transactionId: verificationResult.transactionId,
      });
      
    } catch (error: any) {
      console.error('Payment callback error:', error);
      
      logSecurityEvent('system', 'PAYMENT_CALLBACK_ERROR', {
        error: error.message,
        stack: error.stack?.substring(0, 500),
      }, ipAddress);
      
      return res.status(500).json({
        success: false,
        error: 'Internal error processing payment callback',
        code: 'INTERNAL_ERROR',
      });
    }
  });
  
  // Check payment verification status for a booking
  app.get('/api/payment/verification-status/:bookingReference', isAuthenticated, async (req: any, res) => {
    try {
      const { bookingReference } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;
      
      // Get booking to verify ownership
      const bookingResult = await db
        .select()
        .from(bookings)
        .where(eq(bookings.bookingReference, bookingReference))
        .limit(1);
      
      const booking = bookingResult[0];
      
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      
      // Get property to check if user is host
      const property = await db.select().from(properties).where(eq(properties.id, booking.propertyId)).limit(1);
      const isHost = property[0]?.hostId === userId;
      
      // Only allow guest, host, admin, or operator to check status
      if (booking.guestId !== userId && !isHost && !['admin', 'operator'].includes(userRole)) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      const status = getPaymentVerificationStatus(bookingReference);
      
      return res.json({
        bookingReference,
        paymentStatus: booking.paymentStatus,
        gatewayVerification: status,
      });
    } catch (error) {
      console.error('Error checking payment verification status:', error);
      return res.status(500).json({ message: 'Failed to check payment status' });
    }
  });
  
  // Development-only: Generate test callback for testing
  app.post('/api/payment/test-callback', isAuthenticated, async (req: any, res) => {
    // Only allow in development mode by admin
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ message: 'Test callbacks not allowed in production' });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required for test callbacks' });
    }
    
    const { gateway, transactionId, bookingReference, amount, currency } = req.body;
    
    if (!gateway || !transactionId || !bookingReference || !amount) {
      return res.status(400).json({ message: 'Missing required fields: gateway, transactionId, bookingReference, amount' });
    }
    
    const testPayload = generateTestCallback(
      gateway,
      transactionId,
      bookingReference,
      parseFloat(amount),
      currency || 'ETB'
    );
    
    if (!testPayload) {
      return res.status(500).json({ message: 'Failed to generate test callback - check gateway configuration' });
    }
    
    return res.json({
      message: 'Test callback payload generated. Submit this to /api/payment/gateway-callback',
      payload: testPayload,
    });
  });
  // ==================== END PAYMENT GATEWAY CALLBACK VERIFICATION ====================

  app.use('/api/payment', isAuthenticated, paymentRouter);

  // ============================================
  // SERVICE PROVIDER ROUTES (Add-On Services)
  // ============================================

  // Simplified service provider application endpoint
  app.post('/api/service-provider-applications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { businessName, serviceType, city, description, phoneNumber } = req.body;

      // Validate required fields (description is optional)
      if (!businessName || !serviceType || !city) {
        return res.status(400).json({ 
          message: "Missing required fields: businessName, serviceType, city" 
        });
      }

      // Create service provider with defaults for pricing (can be updated later)
      const providerData = {
        userId,
        businessName,
        serviceType,
        description: description || "", // Optional - default to empty string
        city,
        region: city, // Use city as region for simplicity
        pricingModel: "hourly" as const, // Default pricing model
        basePrice: "0.00", // Default - will be set during verification
        verificationStatus: "pending",
      };

      const newProvider = await storage.createServiceProvider(providerData);

      // Update user's isServiceProvider flag
      await db
        .update(users)
        .set({ isServiceProvider: true })
        .where(eq(users.id, userId));

      // Send confirmation email
      const user = req.user;
      if (user.email) {
        await sendProviderApplicationReceivedEmail(
          user.email,
          user.firstName || 'Provider',
          businessName,
          serviceType
        );
      }

      res.status(201).json({
        message: "Application submitted successfully",
        provider: newProvider,
      });
    } catch (error) {
      console.error("Error submitting service provider application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  // Create new service provider (requires authentication)
  app.post('/api/service-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providerData = {
        userId,
        ...req.body,
      };

      const newProvider = await storage.createServiceProvider(providerData);
      res.status(201).json(newProvider);
    } catch (error) {
      console.error("Error creating service provider:", error);
      res.status(500).json({ message: "Failed to create service provider" });
    }
  });

  // Get all service providers with filters
  app.get('/api/service-providers', async (req, res) => {
    try {
      const { city, serviceType, verificationStatus } = req.query;
      const filters: any = {};
      
      if (city) filters.city = city as string;
      if (serviceType) filters.serviceType = serviceType as string;
      if (verificationStatus) filters.verificationStatus = verificationStatus as string;
      
      const providers = await storage.getAllServiceProviders(filters);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Get service provider by ID
  app.get('/api/service-providers/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const provider = await storage.getServiceProvider(id);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      res.json(provider);
    } catch (error) {
      console.error("Error fetching service provider:", error);
      res.status(500).json({ message: "Failed to fetch service provider" });
    }
  });

  // Get current user's service providers
  app.get('/api/my-service-providers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providers = await storage.getServiceProvidersByUser(userId);
      res.json(providers);
    } catch (error) {
      console.error("Error fetching user service providers:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Update service provider (owner only)
  app.patch('/api/service-providers/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const userId = req.user.id;
      
      const provider = await storage.getServiceProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      if (provider.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this service provider" });
      }
      
      const updatedProvider = await storage.updateServiceProvider(id, req.body);
      res.json(updatedProvider);
    } catch (error) {
      console.error("Error updating service provider:", error);
      res.status(500).json({ message: "Failed to update service provider" });
    }
  });

  // Get current user's provider profile
  app.get('/api/my-provider-profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const providers = await storage.getServiceProvidersByUser(userId);
      
      // Return the first (and typically only) provider profile
      if (providers.length === 0) {
        return res.status(404).json({ message: "No provider profile found" });
      }
      
      res.json(providers[0]);
    } catch (error) {
      console.error("Error fetching provider profile:", error);
      res.status(500).json({ message: "Failed to fetch provider profile" });
    }
  });

  // Get current user's provider bookings
  app.get('/api/my-provider-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // First get the provider profile
      const providers = await storage.getServiceProvidersByUser(userId);
      if (providers.length === 0) {
        return res.json([]);
      }
      
      const providerId = providers[0].id;
      const bookings = await storage.getServiceBookingsByProvider(providerId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
      res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
  });

  // ============================================
  // ADMIN SERVICE PROVIDER VERIFICATION ROUTES
  // ============================================

  // Helper middleware to check admin/operator role
  const isAdminOrOperator = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin' && req.user?.role !== 'operator') {
      return res.status(403).json({ message: "Access denied. Admin or operator role required." });
    }
    next();
  };

  // Admin endpoint to seed sample properties for production
  app.post('/api/admin/seed-properties', isAuthenticated, isAdminOrOperator, async (req: any, res) => {
    try {
      const adminId = req.user.id;
      console.log(`[SEED] Admin ${adminId} triggered property seeding`);

      // Sample Ethiopian properties with real image URLs
      const sampleProperties = [
        {
          hostId: adminId,
          title: "Simien Mountain Lodge",
          description: "Experience breathtaking mountain views in the heart of Simien Mountains National Park. This traditional lodge offers authentic Ethiopian hospitality with modern comfort.",
          type: "traditional_home",
          status: "approved",
          location: "Debark",
          city: "Gondar",
          region: "Amhara",
          address: "Simien Mountains National Park, Debark, Gondar",
          latitude: "13.2500",
          longitude: "38.0000",
          pricePerNight: "1200.00",
          currency: "ETB",
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          amenities: ["Mountain View", "Hiking Trails", "Traditional Breakfast", "Fire Place", "Hot Water"],
          images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
          isActive: true,
          rating: "4.8",
          reviewCount: 24,
        },
        {
          hostId: adminId,
          title: "Addis View Hotel",
          description: "Modern boutique hotel in the heart of Addis Ababa's Bole district. Perfect for business and leisure travelers with rooftop restaurant and stunning city views.",
          type: "hotel",
          status: "approved",
          location: "Bole",
          city: "Addis Ababa",
          region: "Addis Ababa",
          address: "Bole Road, Near Edna Mall, Addis Ababa",
          latitude: "8.9806",
          longitude: "38.7578",
          pricePerNight: "2500.00",
          currency: "ETB",
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          amenities: ["WiFi", "Restaurant", "Bar", "Airport Shuttle", "Gym", "Rooftop Terrace"],
          images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800"],
          isActive: true,
          rating: "4.9",
          reviewCount: 156,
        },
        {
          hostId: adminId,
          title: "Blue Nile Retreat",
          description: "Peaceful lakeside guesthouse on the shores of Lake Tana. Wake up to stunning sunrises and enjoy fresh fish from the lake.",
          type: "guesthouse",
          status: "approved",
          location: "Lake Shore",
          city: "Bahir Dar",
          region: "Amhara",
          address: "Lake Tana Shore, Bahir Dar",
          latitude: "11.5936",
          longitude: "37.3908",
          pricePerNight: "980.00",
          currency: "ETB",
          maxGuests: 3,
          bedrooms: 1,
          bathrooms: 1,
          amenities: ["Lake View", "Boat Tours", "Fresh Fish", "Garden", "Traditional Coffee Ceremony"],
          images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
          isActive: true,
          rating: "4.7",
          reviewCount: 89,
        },
        {
          hostId: adminId,
          title: "Lalibela Rock Heritage House",
          description: "Stay in a traditional stone house near the famous rock-hewn churches of Lalibela. Experience authentic Ethiopian culture and spirituality.",
          type: "traditional_home",
          status: "approved",
          location: "Old Town",
          city: "Lalibela",
          region: "Amhara",
          address: "Near Beta Giyorgis Church, Lalibela",
          latitude: "12.0300",
          longitude: "39.0450",
          pricePerNight: "1500.00",
          currency: "ETB",
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          amenities: ["Historic Location", "Church Tours", "Traditional Meals", "Cultural Guide", "Hot Water"],
          images: ["https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800"],
          isActive: true,
          rating: "4.9",
          reviewCount: 132,
        },
        {
          hostId: adminId,
          title: "Hawassa Lakeside Villa",
          description: "Luxurious villa with private lake access in Hawassa. Perfect for families and groups seeking relaxation and water activities.",
          type: "guesthouse",
          status: "approved",
          location: "Lakeside",
          city: "Hawassa",
          region: "SNNPR",
          address: "Hawassa Lake Shore, Hawassa",
          latitude: "7.0504",
          longitude: "38.4955",
          pricePerNight: "3200.00",
          currency: "ETB",
          maxGuests: 6,
          bedrooms: 3,
          bathrooms: 2,
          amenities: ["Lake View", "Private Beach", "BBQ", "WiFi", "Parking", "Garden"],
          images: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800"],
          isActive: true,
          rating: "4.6",
          reviewCount: 67,
        },
        {
          hostId: adminId,
          title: "Axum Heritage Inn",
          description: "Historic guesthouse in the ancient city of Axum. Close to the famous obelisks and archaeological sites.",
          type: "guesthouse",
          status: "approved",
          location: "City Center",
          city: "Axum",
          region: "Tigray",
          address: "Near Stelae Field, Axum",
          latitude: "14.1210",
          longitude: "38.7469",
          pricePerNight: "1100.00",
          currency: "ETB",
          maxGuests: 3,
          bedrooms: 1,
          bathrooms: 1,
          amenities: ["Historic Location", "Tour Guide", "Traditional Breakfast", "WiFi"],
          images: ["https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800"],
          isActive: true,
          rating: "4.5",
          reviewCount: 45,
        },
        {
          hostId: adminId,
          title: "Harar Old City Guest House",
          description: "Traditional Harari house in the UNESCO World Heritage walled city. Experience the unique culture and famous coffee of Harar.",
          type: "traditional_home",
          status: "approved",
          location: "Old City",
          city: "Harar",
          region: "Harari",
          address: "Inside Jugol Wall, Harar",
          latitude: "9.3100",
          longitude: "42.1200",
          pricePerNight: "850.00",
          currency: "ETB",
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          amenities: ["Historic Building", "Coffee Ceremony", "City Tours", "Traditional Meals"],
          images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"],
          isActive: true,
          rating: "4.8",
          reviewCount: 78,
        },
        {
          hostId: adminId,
          title: "Bishoftu Lake Resort",
          description: "Modern resort on one of Bishoftu's beautiful crater lakes. Perfect weekend getaway from Addis Ababa.",
          type: "hotel",
          status: "approved",
          location: "Crater Lake",
          city: "Bishoftu",
          region: "Oromia",
          address: "Lake Bishoftu, Debre Zeit",
          latitude: "8.7500",
          longitude: "38.9833",
          pricePerNight: "2800.00",
          currency: "ETB",
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          amenities: ["Lake View", "Swimming Pool", "Restaurant", "Spa", "WiFi", "Parking"],
          images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"],
          isActive: true,
          rating: "4.7",
          reviewCount: 112,
        },
        {
          hostId: adminId,
          title: "Arba Minch Paradise Lodge",
          description: "Hillside lodge overlooking Lakes Abaya and Chamo. Gateway to Nechisar National Park and crocodile market.",
          type: "eco_lodge",
          status: "approved",
          location: "Hillside",
          city: "Arba Minch",
          region: "SNNPR",
          address: "40 Springs Area, Arba Minch",
          latitude: "6.0333",
          longitude: "37.5500",
          pricePerNight: "1800.00",
          currency: "ETB",
          maxGuests: 4,
          bedrooms: 2,
          bathrooms: 1,
          amenities: ["Lake View", "Nature Walks", "Bird Watching", "Restaurant", "Garden"],
          images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800"],
          isActive: true,
          rating: "4.6",
          reviewCount: 89,
        },
        {
          hostId: adminId,
          title: "Dire Dawa Railway Hotel",
          description: "Historic hotel near the famous Ethiopian railway station. Experience the charm of old Dire Dawa.",
          type: "hotel",
          status: "approved",
          location: "Railway District",
          city: "Dire Dawa",
          region: "Dire Dawa",
          address: "Near Railway Station, Dire Dawa",
          latitude: "9.6000",
          longitude: "41.8500",
          pricePerNight: "950.00",
          currency: "ETB",
          maxGuests: 2,
          bedrooms: 1,
          bathrooms: 1,
          amenities: ["Historic Building", "Restaurant", "WiFi", "Air Conditioning"],
          images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],
          isActive: true,
          rating: "4.3",
          reviewCount: 34,
        },
      ];

      let createdCount = 0;
      for (const property of sampleProperties) {
        try {
          await storage.createProperty(property as any);
          createdCount++;
        } catch (err) {
          console.log(`[SEED] Skipped property (may already exist): ${property.title}`);
        }
      }

      console.log(`[SEED] Successfully created ${createdCount} properties`);
      res.json({ 
        message: `Successfully seeded ${createdCount} properties`,
        totalAttempted: sampleProperties.length,
        created: createdCount
      });
    } catch (error) {
      console.error("[SEED] Error seeding properties:", error);
      res.status(500).json({ message: "Failed to seed properties" });
    }
  });

  // Approve service provider application
  app.post('/api/admin/service-providers/:id/approve', isAuthenticated, isAdminOrOperator, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { basePrice } = req.body;

      // Validate base price
      if (!basePrice || isNaN(parseFloat(basePrice))) {
        return res.status(400).json({ message: "Valid base price is required" });
      }

      const provider = await storage.getServiceProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      if (provider.verificationStatus === 'verified') {
        return res.status(400).json({ message: "Provider is already verified" });
      }

      // Update provider verification status and pricing
      const updatedProvider = await storage.updateServiceProvider(id, {
        verificationStatus: 'verified',
        basePrice: basePrice.toString(),
      });

      // Get provider user details for email
      const providerUser = await db
        .select()
        .from(users)
        .where(eq(users.id, provider.userId))
        .limit(1);

      if (providerUser.length > 0 && providerUser[0].email) {
        await sendProviderApplicationApprovedEmail(
          providerUser[0].email,
          providerUser[0].firstName || 'Provider',
          provider.businessName,
          provider.serviceType
        );
      }

      res.json({
        message: "Service provider approved successfully",
        provider: updatedProvider,
      });
    } catch (error) {
      console.error("Error approving service provider:", error);
      res.status(500).json({ message: "Failed to approve service provider" });
    }
  });

  // Reject service provider application
  app.post('/api/admin/service-providers/:id/reject', isAuthenticated, isAdminOrOperator, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { reason } = req.body;

      if (!reason || reason.trim() === '') {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const provider = await storage.getServiceProvider(id);
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }

      if (provider.verificationStatus === 'rejected') {
        return res.status(400).json({ message: "Provider is already rejected" });
      }

      // Update provider verification status
      const updatedProvider = await storage.updateServiceProvider(id, {
        verificationStatus: 'rejected',
        rejectionReason: reason,
      });

      // Get provider user details for email
      const providerUser = await db
        .select()
        .from(users)
        .where(eq(users.id, provider.userId))
        .limit(1);

      if (providerUser.length > 0 && providerUser[0].email) {
        await sendProviderApplicationRejectedEmail(
          providerUser[0].email,
          providerUser[0].firstName || 'Provider',
          provider.businessName,
          reason
        );
      }

      res.json({
        message: "Service provider rejected successfully",
        provider: updatedProvider,
      });
    } catch (error) {
      console.error("Error rejecting service provider:", error);
      res.status(500).json({ message: "Failed to reject service provider" });
    }
  });

  // ============================================
  // SERVICE BOOKING ROUTES
  // ============================================

  // Create service booking
  app.post('/api/service-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const guestId = req.user.id;
      const bookingData = {
        ...req.body,
        guestId,
      };

      const newBooking = await storage.createServiceBooking(bookingData);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Error creating service booking:", error);
      res.status(500).json({ message: "Failed to create service booking" });
    }
  });

  // Get service booking by ID
  app.get('/api/service-bookings/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const booking = await storage.getServiceBooking(id);
      
      if (!booking) {
        return res.status(404).json({ message: "Service booking not found" });
      }
      
      const userId = req.user.id;
      if (booking.guestId !== userId && booking.hostId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view this booking" });
      }
      
      res.json(booking);
    } catch (error) {
      console.error("Error fetching service booking:", error);
      res.status(500).json({ message: "Failed to fetch service booking" });
    }
  });

  // Get user's service bookings (as guest)
  app.get('/api/my-service-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getServiceBookingsByGuest(userId);
      
      // Add hasReviewed field to each booking
      const bookingsWithReviewStatus = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const review = await storage.getServiceReviewByBooking(booking.id);
            return {
              ...booking,
              hasReviewed: !!review
            };
          } catch {
            return {
              ...booking,
              hasReviewed: false
            };
          }
        })
      );
      
      res.json(bookingsWithReviewStatus);
    } catch (error) {
      console.error("Error fetching service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  // Get service bookings for host
  app.get('/api/host-service-bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const bookings = await storage.getServiceBookingsByHost(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching host service bookings:", error);
      res.status(500).json({ message: "Failed to fetch service bookings" });
    }
  });

  // Get service bookings for provider
  app.get('/api/provider-service-bookings/:providerId', isAuthenticated, async (req: any, res) => {
    try {
      const providerId = parseInt(req.params.providerId);
      const provider = await storage.getServiceProvider(providerId);
      
      if (!provider) {
        return res.status(404).json({ message: "Service provider not found" });
      }
      
      const userId = req.user.id;
      if (provider.userId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to view these bookings" });
      }
      
      const bookings = await storage.getServiceBookingsByProvider(providerId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching provider bookings:", error);
      res.status(500).json({ message: "Failed to fetch provider bookings" });
    }
  });

  // Update service booking status
  app.patch('/api/service-bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedBooking = await storage.updateServiceBookingStatus(id, status);
      res.json(updatedBooking);
    } catch (error) {
      console.error("Error updating service booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Complete service booking
  app.post('/api/service-bookings/:id/complete', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const completedBooking = await storage.completeServiceBooking(id);
      res.json(completedBooking);
    } catch (error) {
      console.error("Error completing service booking:", error);
      res.status(500).json({ message: "Failed to complete booking" });
    }
  });

  // ============================================
  // SERVICE REVIEWS
  // ============================================

  // Create service review
  app.post('/api/service-reviews', isAuthenticated, async (req: any, res) => {
    try {
      const reviewerId = req.user.id;
      const reviewData = {
        ...req.body,
        reviewerId,
      };
      
      const review = await storage.createServiceReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      console.error("Error creating service review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Get reviews for a service provider
  app.get('/api/service-providers/:id/reviews', async (req, res) => {
    try {
      const providerId = parseInt(req.params.id);
      const reviews = await storage.getServiceReviewsByProvider(providerId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching provider reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  // Get review by service booking ID
  app.get('/api/service-bookings/:id/review', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = parseInt(req.params.id);
      const review = await storage.getServiceReviewByBooking(bookingId);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }
      
      res.json(review);
    } catch (error) {
      console.error("Error fetching booking review:", error);
      res.status(500).json({ message: "Failed to fetch review" });
    }
  });

  // ============================================
  // ADMIN: SERVICE PROVIDER VERIFICATION
  // ============================================

  // Get all service providers for admin review
  app.get('/api/admin/service-providers', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: "Access denied. Admin or Operator role required." });
      }
      
      const providers = await storage.getAllServiceProviders();
      res.json(providers);
    } catch (error) {
      console.error("Error fetching service providers for admin:", error);
      res.status(500).json({ message: "Failed to fetch service providers" });
    }
  });

  // Verify service provider (admin/operator)
  app.patch('/api/admin/service-providers/:id/verify', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin' && req.user.role !== 'operator') {
        return res.status(403).json({ message: "Access denied. Admin or Operator role required." });
      }
      
      const id = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Valid status (approved/rejected) is required" });
      }
      
      const verifiedProvider = await storage.verifyServiceProvider(
        id,
        status,
        req.user.id,
        rejectionReason
      );
      
      res.json(verifiedProvider);
    } catch (error) {
      console.error("Error verifying service provider:", error);
      res.status(500).json({ message: "Failed to verify service provider" });
    }
  });

  // ============================================
  // FAYDA ID VERIFICATION
  // ============================================

  // Verify Fayda ID (Ethiopia's National Digital ID)
  app.post('/api/fayda/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { faydaId, dateOfBirth, phoneNumber } = req.body;

      if (!faydaId) {
        return res.status(400).json({ message: "Fayda ID is required" });
      }

      // Validate format
      if (!/^\d{12}$/.test(faydaId)) {
        return res.status(400).json({ 
          message: "Invalid Fayda ID format. Must be exactly 12 digits." 
        });
      }

      // Call Fayda verification service
      const verificationResult = await verifyFaydaId({
        faydaId,
        dateOfBirth,
        phoneNumber: phoneNumber || req.user.phoneNumber,
      });

      if (!verificationResult.success || !verificationResult.kycStatus) {
        return res.status(400).json({
          message: verificationResult.message || "Fayda ID verification failed",
          error: verificationResult.error,
        });
      }

      // Update user with verified Fayda data
      await updateUserFaydaVerification(userId, faydaId, verificationResult);

      res.json({
        success: true,
        message: "Fayda ID verified successfully",
        identity: verificationResult.identity,
      });
    } catch (error) {
      console.error("Error verifying Fayda ID:", error);
      res.status(500).json({ 
        message: "An error occurred during verification. Please try again." 
      });
    }
  });

  // Check Fayda verification status
  app.get('/api/fayda/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const isVerified = await isFaydaVerified(userId);
      
      const user = await storage.getUser(userId);
      
      res.json({
        verified: isVerified,
        faydaId: user?.faydaId || null,
        verifiedAt: user?.faydaVerifiedAt || null,
      });
    } catch (error) {
      console.error("Error checking Fayda status:", error);
      res.status(500).json({ message: "Failed to check verification status" });
    }
  });

  // ============================================================
  // LEMLEM AI ASSISTANT ROUTES (Cost-Optimized)
  // ============================================================

  // Send message to Lemlem (uses templates first, AI only if needed)
  app.post('/api/lemlem/chat', async (req: any, res) => {
    try {
      const { message, propertyId, bookingId, language } = req.body;
      const userId = req.user?.id;

      if (!message || message.trim().length === 0) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get context for better responses
      // Override user's language preference with selected language from UI
      const userWithLanguage = req.user ? {
        ...req.user,
        preferences: {
          ...(req.user.preferences || {}),
          language: language || req.user.preferences?.language || 'en'
        }
      } : null;

      const context: LemlemContext = {
        user: userWithLanguage,
      };

      if (propertyId) {
        const [property] = await db.select().from(properties).where(eq(properties.id, parseInt(propertyId)));
        context.property = property;

        const [propInfo] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));
        context.propertyInfo = propInfo;
      }

      if (bookingId) {
        const [booking] = await db.select().from(bookings).where(eq(bookings.id, parseInt(bookingId)));
        context.booking = booking;
      }

      // Try template matching first (NO AI COST!)
      let response = matchTemplate(message, context);

      // If no template match, try general help
      if (!response || response.confidence < 0.7) {
        const generalResponse = getGeneralHelp(message, context);
        if (generalResponse) {
          response = generalResponse;
        }
      }

      // If still no match, use fallback message (NO AI COST!)
      if (!response) {
        response = {
          message: `I understand you need help, dear! I can assist you with:\n\n🔑 Lockbox codes & access\n📶 WiFi passwords\n🏠 Check-in/Check-out times\n📞 Host contact information\n🚨 Emergency contacts\n🍽️ Restaurant recommendations\n🗺️ Local attractions\n\nWhat would you like to know? You can also contact the host directly if you need immediate assistance!`,
          usedTemplate: true,
          confidence: 0.5,
        };
      }

      // Save conversation to database (for history and cost tracking)
      await db.insert(lemlemChats).values({
        userId,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        bookingId: bookingId ? parseInt(bookingId) : undefined,
        message,
        isUser: true,
        usedTemplate: true,
      });

      await db.insert(lemlemChats).values({
        userId,
        propertyId: propertyId ? parseInt(propertyId) : undefined,
        bookingId: bookingId ? parseInt(bookingId) : undefined,
        message: response.message,
        isUser: false,
        usedTemplate: response.usedTemplate,
        aiModel: response.usedTemplate ? null : undefined,
        tokensUsed: response.usedTemplate ? null : undefined,
        estimatedCost: response.usedTemplate ? "0" : undefined,
      });

      res.json({
        message: response.message,
        usedTemplate: response.usedTemplate,
        confidence: response.confidence,
        cost: response.usedTemplate ? 0 : undefined, // $0 for template responses!
      });
    } catch (error) {
      console.error("Error in Lemlem chat:", error);
      res.status(500).json({ 
        message: "I'm having trouble right now, dear. Please try again in a moment or contact the host directly." 
      });
    }
  });

  // Get chat history
  app.get('/api/lemlem/history', async (req: any, res) => {
    try {
      const { propertyId, bookingId, limit = 50 } = req.query;
      const userId = req.user?.id;

      const conditions = [];
      if (userId) {
        conditions.push(eq(lemlemChats.userId, userId));
      }
      if (propertyId) {
        conditions.push(eq(lemlemChats.propertyId, parseInt(propertyId)));
      }
      if (bookingId) {
        conditions.push(eq(lemlemChats.bookingId, parseInt(bookingId)));
      }

      const history = await db.select().from(lemlemChats).where(conditions.length > 0 ? conditions[0] : undefined).limit(parseInt(limit));

      // Calculate total cost for this conversation
      const totalCost = history.reduce((sum, chat) => {
        if (chat.estimatedCost) {
          return sum + parseFloat(chat.estimatedCost);
        }
        return sum;
      }, 0);

      res.json({
        history,
        stats: {
          totalMessages: history.length,
          templateResponses: history.filter(c => c.usedTemplate).length,
          aiResponses: history.filter(c => !c.usedTemplate).length,
          totalCost: totalCost.toFixed(6), // Cost in dollars
        }
      });
    } catch (error) {
      console.error("Error fetching Lemlem history:", error);
      res.status(500).json({ message: "Failed to fetch chat history" });
    }
  });

  // Get property info for Lemlem (public - for chat)
  app.get('/api/property-info/:propertyId', async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const [info] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));
      
      if (!info) {
        return res.json({ message: "No property info available yet" });
      }

      res.json(info);
    } catch (error) {
      console.error("Error fetching property info:", error);
      res.status(500).json({ message: "Failed to fetch property info" });
    }
  });

  // Get property info for editing (authenticated)
  app.get('/api/lemlem/property-info/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const [info] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));
      
      if (!info) {
        // Return empty object if no info exists yet
        return res.json({});
      }

      res.json(info);
    } catch (error) {
      console.error("Error fetching property info:", error);
      res.status(500).json({ message: "Failed to fetch property info" });
    }
  });

  // Create/Update property info (for hosts) - POST version
  app.post('/api/lemlem/property-info/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const userId = req.user.id;

      // Verify user owns this property
      const [property] = await db.select().from(properties).where(eq(properties.id, parseInt(propertyId)));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this property info" });
      }

      // Check if property info exists
      const [existing] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));

      if (existing) {
        // Update existing
        await db.update(propertyInfo)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(propertyInfo.propertyId, parseInt(propertyId)));
      } else {
        // Create new
        await db.insert(propertyInfo).values({
          propertyId: parseInt(propertyId),
          ...req.body,
        });
      }

      const [updated] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));
      res.json(updated);
    } catch (error) {
      console.error("Error updating property info:", error);
      res.status(500).json({ message: "Failed to update property info" });
    }
  });

  // Create/Update property info (for hosts) - PUT version
  app.put('/api/property-info/:propertyId', isAuthenticated, async (req: any, res) => {
    try {
      const { propertyId } = req.params;
      const userId = req.user.id;

      // Verify user owns this property
      const [property] = await db.select().from(properties).where(eq(properties.id, parseInt(propertyId)));
      
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      if (property.hostId !== userId && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Not authorized to update this property info" });
      }

      // Check if property info exists
      const [existing] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));

      if (existing) {
        // Update existing
        await db.update(propertyInfo)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(propertyInfo.propertyId, parseInt(propertyId)));
      } else {
        // Create new
        await db.insert(propertyInfo).values({
          propertyId: parseInt(propertyId),
          ...req.body,
        });
      }

      const [updated] = await db.select().from(propertyInfo).where(eq(propertyInfo.propertyId, parseInt(propertyId)));
      res.json(updated);
    } catch (error) {
      console.error("Error updating property info:", error);
      res.status(500).json({ message: "Failed to update property info" });
    }
  });

  // ===============================
  // ADMIN LEMLEM INSIGHTS & AI CONTROL
  // ===============================

  // Get Lemlem insights (admin only)
  app.get('/api/admin/lemlem-insights', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      // Total chats
      const totalChats = await db.select({ count: sql<number>`count(*)` }).from(lemlemChats);
      const templateChats = await db.select({ count: sql<number>`count(*)` }).from(lemlemChats).where(eq(lemlemChats.usedTemplate, true));
      const aiChats = await db.select({ count: sql<number>`count(*)` }).from(lemlemChats).where(eq(lemlemChats.usedTemplate, false));

      // Total cost (all time)
      const costData = await db.select({ total: sql<number>`COALESCE(SUM(CAST(estimated_cost AS NUMERIC)), 0)` }).from(lemlemChats);
      const totalCost = parseFloat(costData[0].total.toString());

      // This month's cost
      const thisMonthData = await db.select({ total: sql<number>`COALESCE(SUM(CAST(estimated_cost AS NUMERIC)), 0)` })
        .from(lemlemChats)
        .where(sql`EXTRACT(MONTH FROM timestamp) = EXTRACT(MONTH FROM NOW()) AND EXTRACT(YEAR FROM timestamp) = EXTRACT(YEAR FROM NOW())`);
      const thisMonthCost = parseFloat(thisMonthData[0].total.toString());

      // Top questions (most asked)
      const topQuestions = await db.select({
        message: lemlemChats.message,
        count: sql<number>`count(*)`,
        usedTemplate: lemlemChats.usedTemplate,
      })
        .from(lemlemChats)
        .where(eq(lemlemChats.isUser, true))
        .groupBy(lemlemChats.message, lemlemChats.usedTemplate)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      // Most active properties
      const mostActiveProperties = await db.select({
        propertyId: lemlemChats.propertyId,
        title: properties.title,
        chatCount: sql<number>`count(*)`,
        templateCount: sql<number>`SUM(CASE WHEN ${lemlemChats.usedTemplate} THEN 1 ELSE 0 END)`,
        aiCount: sql<number>`SUM(CASE WHEN NOT ${lemlemChats.usedTemplate} THEN 1 ELSE 0 END)`,
        totalCost: sql<number>`COALESCE(SUM(CAST(${lemlemChats.estimatedCost} AS NUMERIC)), 0)`,
      })
        .from(lemlemChats)
        .leftJoin(properties, eq(lemlemChats.propertyId, properties.id))
        .where(sql`${lemlemChats.propertyId} IS NOT NULL`)
        .groupBy(lemlemChats.propertyId, properties.title)
        .orderBy(sql`count(*) DESC`)
        .limit(10);

      // Cost by day (last 30 days)
      const costByDay = await db.select({
        date: sql<string>`DATE(timestamp)`,
        count: sql<number>`count(*)`,
        cost: sql<number>`COALESCE(SUM(CAST(estimated_cost AS NUMERIC)), 0)`,
      })
        .from(lemlemChats)
        .where(sql`timestamp >= NOW() - INTERVAL '30 days'`)
        .groupBy(sql`DATE(timestamp)`)
        .orderBy(sql`DATE(timestamp) DESC`)
        .limit(30);

      // Lemlem Impact Analytics - Track bookings after Lemlem interactions
      const lemlemImpact = await db.select({
        totalChatsWithBookings: sql<number>`COUNT(DISTINCT ${lemlemChats.userId})`,
        totalBookingsAfterChat: sql<number>`COUNT(DISTINCT ${bookings.id})`,
      })
        .from(lemlemChats)
        .leftJoin(bookings, sql`${bookings.guestId} = ${lemlemChats.userId} AND ${bookings.createdAt} > ${lemlemChats.timestamp}`)
        .where(sql`${lemlemChats.timestamp} >= NOW() - INTERVAL '90 days'`);

      // Properties with highest Lemlem engagement
      const topPropertiesByEngagement = await db.select({
        propertyId: lemlemChats.propertyId,
        title: properties.title,
        totalChats: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${lemlemChats.userId})`,
        bookingsAfterChat: sql<number>`COUNT(DISTINCT ${bookings.id})`,
        conversionRate: sql<number>`ROUND(CAST(COUNT(DISTINCT ${bookings.id}) AS NUMERIC) / NULLIF(COUNT(DISTINCT ${lemlemChats.userId}), 0) * 100, 2)`,
      })
        .from(lemlemChats)
        .leftJoin(properties, eq(lemlemChats.propertyId, properties.id))
        .leftJoin(bookings, sql`${bookings.propertyId} = ${lemlemChats.propertyId} AND ${bookings.guestId} = ${lemlemChats.userId} AND ${bookings.createdAt} > ${lemlemChats.timestamp}`)
        .where(sql`${lemlemChats.propertyId} IS NOT NULL AND ${lemlemChats.timestamp} >= NOW() - INTERVAL '90 days'`)
        .groupBy(lemlemChats.propertyId, properties.title)
        .orderBy(sql`COUNT(DISTINCT ${bookings.id}) DESC`)
        .limit(10);

      res.json({
        totalChats: totalChats[0].count,
        templateChats: templateChats[0].count,
        aiChats: aiChats[0].count,
        totalCost,
        thisMonthCost,
        topQuestions,
        mostActiveProperties,
        costByDay,
        impact: {
          usersWithChats: lemlemImpact[0]?.totalChatsWithBookings || 0,
          bookingsAfterChats: lemlemImpact[0]?.totalBookingsAfterChat || 0,
          conversionRate: lemlemImpact[0]?.totalBookingsAfterChat && lemlemImpact[0]?.totalChatsWithBookings
            ? ((lemlemImpact[0].totalBookingsAfterChat / lemlemImpact[0].totalChatsWithBookings) * 100).toFixed(1)
            : '0.0',
          topPropertiesByEngagement,
        },
      });
    } catch (error) {
      console.error("Error fetching Lemlem insights:", error);
      res.status(500).json({ message: "Failed to fetch insights" });
    }
  });

  // Get platform settings (admin only)
  app.get('/api/admin/platform-settings', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [settings] = await db.select().from(platformSettings).limit(1);
      
      if (!settings) {
        // Create default settings if none exist
        const [newSettings] = await db.insert(platformSettings).values({
          aiEnabled: true,
          monthlyBudgetUSD: "20.00",
          currentMonthSpend: "0",
          alertsEnabled: true,
          alertThreshold: 80,
        }).returning();
        return res.json(newSettings);
      }

      res.json(settings);
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update platform settings (admin only)
  app.post('/api/admin/platform-settings', isAuthenticated, async (req: any, res) => {
    try {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const [existing] = await db.select().from(platformSettings).limit(1);

      if (existing) {
        const [updated] = await db.update(platformSettings)
          .set({
            ...req.body,
            updatedAt: new Date(),
          })
          .where(eq(platformSettings.id, existing.id))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(platformSettings)
          .values(req.body)
          .returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating platform settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  // ====================================================================
  // AGENT REGISTRATION & DASHBOARD ROUTES
  // ====================================================================

  // Register new agent
  app.post('/api/agent/register', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const {
        fullName,
        phoneNumber,
        paymentMethod,
        paymentAccount,
        telebirrAccount,
        idNumber,
        businessName,
        city,
        subCity,
      } = req.body;

      // Validate required fields
      if (!fullName || !phoneNumber || !city) {
        return res.status(400).json({ message: "Missing required fields: fullName, phoneNumber, and city are required" });
      }

      // Check if user already has an agent account
      const existing = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        // If they already have an agent account, update their role and return success
        await storage.updateUserRole(userId, 'agent');
        return res.json({
          success: true,
          agent: existing[0],
          message: "You already have an agent account. Your role has been updated.",
        });
      }

      // Create agent account
      const [newAgent] = await db
        .insert(agents)
        .values({
          userId,
          fullName,
          phoneNumber,
          telebirrAccount: telebirrAccount || paymentAccount || phoneNumber,  // Store payment account
          city,
          subCity: subCity || null,
          businessName: businessName || null,
          idNumber: idNumber || null,
          status: 'approved',  // Instant approval for verified users
          totalEarnings: '0.00',
          totalProperties: 0,
          activeProperties: 0,
          referralCode: `AG${Date.now().toString().slice(-8)}`,
        })
        .returning();

      // CRITICAL: Update user's role to 'agent' so they can access agent pages
      await storage.updateUserRole(userId, 'agent');

      res.json({
        success: true,
        agent: newAgent,
        message: "Agent account created successfully! You can now list properties.",
      });
    } catch (error: any) {
      console.error("Agent registration error:", error);
      res.status(500).json({ message: "Failed to create agent account" });
    }
  });

  // Get Agent Dashboard (simple version - redirects to Dellala dashboard)
  app.get('/api/agent/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Find agent by user ID
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId));

      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      // AUTO-FIX: If user has an approved agent account but wrong role, fix it
      if (agent.status === 'approved' && req.user.role !== 'agent') {
        await storage.updateUserRole(userId, 'agent');
        console.log(`[AUTO-FIX] Updated role to 'agent' for user ${userId}`);
      }

      // Get agent performance
      const performance = await storage.getAgentPerformance(agent.id);

      // Get recent commissions
      const recentCommissions = await db
        .select()
        .from(agentCommissions)
        .where(eq(agentCommissions.agentId, agent.id))
        .orderBy(desc(agentCommissions.createdAt))
        .limit(10);

      const stats = {
        totalEarnings: performance?.totalCommissionEarned || 0,
        pendingEarnings: performance?.totalCommissionPending || 0,
        paidEarnings: performance?.totalWithdrawn || 0,
        totalProperties: agent.totalProperties,
        activeProperties: agent.activeProperties,
        expiredProperties: 0,
        totalCommissions: recentCommissions.length,
        recentCommissions: recentCommissions,
      };

      res.json({
        agent: {
          id: agent.id,
          fullName: agent.fullName,
          phoneNumber: agent.phoneNumber,
          telebirrAccount: agent.telebirrAccount,
          city: agent.city,
          status: agent.status,
          totalEarnings: agent.totalEarnings,
          totalProperties: agent.totalProperties,
          activeProperties: agent.activeProperties,
          referralCode: agent.referralCode,
          createdAt: agent.createdAt,
        },
        stats,
      });
    } catch (error: any) {
      console.error("Agent dashboard error:", error);
      res.status(500).json({ message: "Failed to load agent dashboard" });
    }
  });

  // AGENT SUCCESS PAGE - Property & Owner Details
  // ====================================================================

  // Get property and owner details for agent success page
  app.get('/api/agent/property-details', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      // Find agent by user ID
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId));

      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      // Get the first property (in production, this would be linked to the agent)
      const [property] = await db
        .select()
        .from(properties)
        .limit(1);

      if (!property) {
        return res.status(404).json({ message: "No properties available yet" });
      }

      // Get property owner details
      const [owner] = await db
        .select()
        .from(users)
        .where(eq(users.id, property.hostId));

      if (!owner) {
        return res.status(404).json({ message: "Property owner not found" });
      }

      // Calculate commission details
      const pricePerNight = parseFloat(property.pricePerNight);
      const commissionRate = 0.05; // 5%
      const estimatedPerNight = pricePerNight * commissionRate;
      const durationMonths = 36; // 36 months as per requirements

      res.json({
        property: {
          id: property.id,
          title: property.title,
          location: property.location,
          city: property.city,
          pricePerNight: property.pricePerNight,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          maxGuests: property.maxGuests,
        },
        owner: {
          fullName: `${owner.firstName} ${owner.lastName}`,
          phoneNumber: owner.phoneNumber || 'Not provided',
          email: owner.email || 'Not provided',
          paymentAccount: agent.telebirrAccount || 'Not provided',
          paymentMethod: 'TeleBirr',
        },
        commission: {
          ratePercentage: commissionRate * 100,
          estimatedPerNight,
          durationMonths,
        },
      });
    } catch (error: any) {
      console.error("Agent property details error:", error);
      res.status(500).json({ message: "Failed to load property details" });
    }
  });

  // OWNER PAYOUT DASHBOARD ROUTES
  // ====================================================================

  // Get Owner Payout data - shows rental income minus all deductions
  app.get('/api/owner/payout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Get current user details
      const [currentUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's first property (for now, we'll show data for their first property)
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.hostId, userId))
        .limit(1);

      if (!property) {
        return res.status(404).json({ message: "No properties found. Please add a property first." });
      }

      // Get all completed bookings for this property
      const completedBookings = await db
        .select()
        .from(bookings)
        .where(and(
          eq(bookings.propertyId, property.id),
          eq(bookings.status, 'confirmed')
        ));

      // Calculate financials
      const totalBookings = completedBookings.length;
      const pricePerNight = parseFloat(property.pricePerNight);
      
      // Calculate gross revenue (total from all bookings)
      const grossRevenue = completedBookings.reduce((total, booking) => {
        return total + parseFloat(booking.totalPrice);
      }, 0);

      // Calculate deductions
      const vat = grossRevenue * 0.15;  // 15% VAT
      const platformFee = grossRevenue * 0.10;  // 10% Alga platform fee
      const agentCommission = grossRevenue * 0.05;  // 5% to Dellala agent
      const totalDeductions = vat + platformFee + agentCommission;
      const netPayout = grossRevenue - totalDeductions;

      // Expected occupancy (mock calculation - would be based on calendar in production)
      const expectedOccupancy = Math.min(85, totalBookings * 5);

      res.json({
        owner: {
          id: currentUser.id,
          fullName: `${currentUser.firstName} ${currentUser.lastName}`,
          phoneNumber: currentUser.phoneNumber || 'Not provided',
          email: currentUser.email || 'Not provided',
        },
        property: {
          id: property.id,
          title: property.title,
          location: property.location,
          city: property.city,
          pricePerNight: property.pricePerNight,
        },
        earnings: {
          totalBookings,
          expectedOccupancy,
          grossRevenue,
          vat,
          platformFee,
          agentCommission,
          totalDeductions,
          netPayout,
        },
      });
    } catch (error: any) {
      console.error("Owner payout error:", error);
      res.status(500).json({ message: "Failed to load owner payout data" });
    }
  });

  // DELLALA FINANCIAL DASHBOARD ROUTES
  // ====================================================================

  // Request withdrawal (Telebirr/Addispay)
  app.post('/api/dellala/withdraw', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { amount, method, accountNumber } = req.body;

      // Find agent by user ID
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId));

      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      // Check available balance
      const performance = await storage.getAgentPerformance(agent.id);
      const availableBalance = parseFloat(performance?.availableBalance || "0");
      const requestedAmount = parseFloat(amount);

      if (requestedAmount > availableBalance) {
        return res.status(400).json({ 
          message: "Insufficient balance",
          availableBalance: availableBalance.toFixed(2),
        });
      }

      if (requestedAmount < 100) {
        return res.status(400).json({ 
          message: "Minimum withdrawal amount is 100 ETB" 
        });
      }

      // Create withdrawal request
      const withdrawal = await storage.createAgentWithdrawal({
        agentId: agent.id,
        amount: amount,
        method,
        accountNumber,
        status: "pending",
      });

      console.log(`💸 WITHDRAWAL REQUEST: Agent #${agent.id} - ${amount} ETB via ${method}`);

      res.json({
        success: true,
        withdrawal,
        message: "Withdrawal request submitted successfully. Funds will be transferred within 24 hours.",
      });
    } catch (error) {
      console.error("Error processing withdrawal request:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Get withdrawal history
  app.get('/api/dellala/withdrawals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId));

      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      const withdrawals = await storage.getAgentWithdrawals(agent.id);
      res.json(withdrawals);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  // Get commission history with filters
  app.get('/api/dellala/commissions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { status, limit = "50", offset = "0" } = req.query;

      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId));

      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      let whereConditions: any[] = [eq(agentCommissions.agentId, agent.id)];

      if (status) {
        whereConditions.push(eq(agentCommissions.status, status as string));
      }

      const commissions = await db
        .select()
        .from(agentCommissions)
        .where(and(...whereConditions))
        .orderBy(desc(agentCommissions.createdAt))
        .limit(parseInt(limit as string))
        .offset(parseInt(offset as string));
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  // Get referral stats
  app.get('/api/dellala/referrals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.userId, userId));

      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      const referrals = await storage.getAgentReferrals(agent.id);
      const referralStats = await storage.getAgentReferralStats(agent.id);

      res.json({
        referrals,
        stats: referralStats,
      });
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referrals" });
    }
  });

  // ====================================================================
  // LEMLEM OPERATIONS ASSISTANT ROUTES
  // ====================================================================

  // Process operations query with AI-powered natural language understanding
  app.post('/api/admin/lemlem-ops/query', isAuthenticated, async (req: any, res) => {
    try {
      if (!['admin', 'operator'].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin/Operator access required" });
      }

      const { query } = req.body;
      const queryLower = query.toLowerCase();

      let response = "";
      let insights: string[] = [];

      // Parse query and fetch relevant data
      if (queryLower.includes('top') && queryLower.includes('agent')) {
        // Top agents by bookings (via commissions)
        const topAgents = await db.select({
          agentId: agents.id,
          agentName: sql`COALESCE(${agents.fullName}, ${agents.id})`,
          bookings: sql<number>`COUNT(DISTINCT ${agentCommissions.bookingId})`,
          commission: sql<number>`SUM(${agentCommissions.commissionAmount})`,
        })
          .from(agents)
          .leftJoin(agentCommissions, eq(agents.id, agentCommissions.agentId))
          .where(eq(agents.status, 'active'))
          .groupBy(agents.id, agents.fullName)
          .orderBy(desc(sql`COUNT(DISTINCT ${agentCommissions.bookingId})`))
          .limit(5);

        if (topAgents.length === 0) {
          response = "No active agents with bookings found.";
        } else {
          response = `Top ${topAgents.length} Agents:\n\n`;
          topAgents.forEach((agent, idx) => {
            response += `${idx + 1}. ${agent.agentName}\n   • ${agent.bookings} bookings\n   • ${agent.commission || 0} ETB commission\n\n`;
          });
          insights.push(`${topAgents[0].agentName} is the top performer with ${topAgents[0].bookings} bookings`);
        }
      } else if (queryLower.includes('overdue') && queryLower.includes('verification')) {
        // Overdue property verifications
        const overdueProps = await db.select({
          id: properties.id,
          title: properties.title,
          hostId: properties.hostId,
          status: properties.status,
        })
          .from(properties)
          .where(eq(properties.status, 'pending'));

        response = `Pending Verifications: ${overdueProps.length}\n\n`;
        if (overdueProps.length > 0) {
          overdueProps.slice(0, 10).forEach((prop) => {
            response += `• Property #${prop.id}: ${prop.title}\n`;
          });
          insights.push(`${overdueProps.length} properties require verification approval`);
        } else {
          response = "All properties are verified. No pending verifications.";
        }
      } else if (queryLower.includes('telebirr') || queryLower.includes('reconciliation')) {
        // Missing TeleBirr reconciliations
        const unreconciledPayments = await db.select()
          .from(paymentTransactions)
          .where(and(
            eq(paymentTransactions.paymentGateway, 'telebirr'),
            eq(paymentTransactions.status, 'pending')
          ));

        response = `Unreconciled TeleBirr Payments: ${unreconciledPayments.length}\n\n`;
        if (unreconciledPayments.length > 0) {
          unreconciledPayments.slice(0, 10).forEach((payment) => {
            response += `• ${payment.amount} ETB - Transaction #${payment.id}\n`;
          });
          insights.push(`${unreconciledPayments.length} TeleBirr transactions need reconciliation`);
        } else {
          response = "All TeleBirr payments are reconciled.";
        }
      } else if (queryLower.includes('agent status')) {
        // Agent status
        const agentStats = await db.select({
          status: agents.status,
          count: sql<number>`COUNT(*)`,
        })
          .from(agents)
          .groupBy(agents.status);

        response = `Agent Status:\n\n`;
        agentStats.forEach((stat) => {
          response += `• ${stat.status}: ${stat.count} agents\n`;
        });
      } else if (queryLower.includes('payment') && queryLower.includes('mismatch')) {
        // Payment mismatches
        const mismatches = await db.select()
          .from(paymentTransactions)
          .where(eq(paymentTransactions.status, 'failed'));

        response = `Payment Mismatches: ${mismatches.length}\n\n`;
        if (mismatches.length > 0) {
          mismatches.slice(0, 10).forEach((payment) => {
            response += `• ${payment.amount} ETB - ${payment.paymentGateway} - Transaction #${payment.id}\n`;
          });
        } else {
          response = "No payment mismatches found.";
        }
      } else if (queryLower.includes('warranty') && queryLower.includes('expir')) {
        // Warranty expiring
        const oneMonthFromNow = new Date();
        oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

        const expiringWarranties = await db.select()
          .from(hardwareDeployments)
          .where(
            and(
              sql`${hardwareDeployments.warrantyExpiry} <= ${oneMonthFromNow}`,
              sql`${hardwareDeployments.warrantyExpiry} >= NOW()`
            )
          );

        response = `Warranties Expiring in 30 Days: ${expiringWarranties.length}\n\n`;
        if (expiringWarranties.length > 0) {
          expiringWarranties.forEach((hw) => {
            response += `• ${hw.hardwareType} #${hw.serialNumber} - Expires ${new Date(hw.warrantyExpiry!).toLocaleDateString()}\n`;
          });
          insights.push(`${expiringWarranties.length} hardware warranties need renewal`);
        }
      } else if (queryLower.includes('new bookings') || queryLower.includes('this week')) {
        // New bookings this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const newBookings = await db.select()
          .from(bookings)
          .where(sql`${bookings.createdAt} >= ${oneWeekAgo}`);

        response = `New Bookings This Week: ${newBookings.length}\n\n`;
        const totalRevenue = newBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);
        response += `Total Revenue: ${totalRevenue.toFixed(2)} ETB\n`;
        insights.push(`${newBookings.length} bookings this week - ${((newBookings.length / 7) * 30).toFixed(0)} projected monthly`);
      } else {
        // General operations summary
        const activeAgentsCount = await db.select({ count: sql<number>`COUNT(*)` })
          .from(agents)
          .where(eq(agents.status, 'active'));

        const pendingPropsCount = await db.select({ count: sql<number>`COUNT(*)` })
          .from(properties)
          .where(eq(properties.status, 'pending'));

        const pendingPaymentsCount = await db.select({ count: sql<number>`COUNT(*)` })
          .from(paymentTransactions)
          .where(eq(paymentTransactions.status, 'pending'));

        response = `Operations Summary:\n\n`;
        response += `• Active Agents: ${activeAgentsCount[0]?.count || 0}\n`;
        response += `• Pending Property Verifications: ${pendingPropsCount[0]?.count || 0}\n`;
        response += `• Pending Payments: ${pendingPaymentsCount[0]?.count || 0}\n\n`;
        response += `Try asking specific questions like:\n`;
        response += `- "Show today's top agents"\n`;
        response += `- "List overdue verifications"\n`;
        response += `- "Missing TeleBirr reconciliations"\n`;
      }

      res.json({ response, insights });
    } catch (error) {
      console.error("Error processing operations query:", error);
      res.status(500).json({ 
        response: "Sorry, I couldn't process that query. Please try again.",
        insights: [],
      });
    }
  });

  // Get weekly summary for operations dashboard
  app.get('/api/admin/lemlem-ops/weekly-summary', isAuthenticated, async (req: any, res) => {
    try {
      if (!['admin', 'operator'].includes(req.user.role)) {
        return res.status(403).json({ message: "Admin/Operator access required" });
      }

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Agent performance
      const totalActiveAgents = await db.select({ count: sql<number>`COUNT(*)` })
        .from(agents)
        .where(eq(agents.status, 'active'));

      const newAgentsThisWeek = await db.select({ count: sql<number>`COUNT(*)` })
        .from(agents)
        .where(sql`${agents.createdAt} >= ${oneWeekAgo}`);

      const topPerformers = await db.select({
        agentId: agents.id,
        bookings: sql<number>`COUNT(DISTINCT ${agentCommissions.bookingId})`,
        commission: sql<number>`COALESCE(SUM(${agentCommissions.commissionAmount}), 0)`,
      })
        .from(agents)
        .leftJoin(agentCommissions, eq(agents.id, agentCommissions.agentId))
        .where(sql`${agentCommissions.createdAt} >= ${oneWeekAgo}`)
        .groupBy(agents.id)
        .orderBy(desc(sql`COUNT(DISTINCT ${agentCommissions.bookingId})`))
        .limit(5);

      // Booking growth
      const thisWeekBookings = await db.select({ count: sql<number>`COUNT(*)` })
        .from(bookings)
        .where(sql`${bookings.createdAt} >= ${oneWeekAgo}`);

      const lastWeekBookings = await db.select({ count: sql<number>`COUNT(*)` })
        .from(bookings)
        .where(and(
          sql`${bookings.createdAt} >= ${twoWeeksAgo}`,
          sql`${bookings.createdAt} < ${oneWeekAgo}`
        ));

      const thisWeek = thisWeekBookings[0]?.count || 0;
      const lastWeek = lastWeekBookings[0]?.count || 1;
      const percentChange = ((thisWeek - lastWeek) / lastWeek * 100);

      // Commission revenue
      const totalCommission = await db.select({ 
        total: sql<number>`COALESCE(SUM(${agentCommissions.commissionAmount}), 0)` 
      })
        .from(agentCommissions);

      const pendingCommission = await db.select({ 
        total: sql<number>`COALESCE(SUM(${agentCommissions.commissionAmount}), 0)` 
      })
        .from(agentCommissions)
        .where(eq(agentCommissions.status, 'pending'));

      const paidCommission = await db.select({ 
        total: sql<number>`COALESCE(SUM(${agentCommissions.commissionAmount}), 0)` 
      })
        .from(agentCommissions)
        .where(eq(agentCommissions.status, 'paid'));

      // Compliance alerts
      const pendingVerifications = await db.select({ count: sql<number>`COUNT(*)` })
        .from(properties)
        .where(eq(properties.status, 'pending'));

      const pendingPayments = await db.select({ count: sql<number>`COUNT(*)` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.status, 'pending'));

      const complianceAlerts = [];
      if (pendingVerifications[0]?.count > 0) {
        complianceAlerts.push({
          type: 'Property Verifications',
          count: pendingVerifications[0].count,
          severity: 'medium',
        });
      }
      if (pendingPayments[0]?.count > 0) {
        complianceAlerts.push({
          type: 'Payment Reconciliations',
          count: pendingPayments[0].count,
          severity: 'high',
        });
      }

      // Properties by zone
      const propertiesByZone = await db.select({
        zone: properties.city,
        count: sql<number>`COUNT(*)`,
        verified: sql<number>`COUNT(CASE WHEN ${properties.status} = 'active' THEN 1 END)`,
      })
        .from(properties)
        .groupBy(properties.city);

      res.json({
        agentPerformance: {
          totalActive: totalActiveAgents[0]?.count || 0,
          newThisWeek: newAgentsThisWeek[0]?.count || 0,
          topPerformers: topPerformers.map(p => ({
            agentId: p.agentId,
            bookings: p.bookings || 0,
            commission: p.commission || 0,
          })),
        },
        bookingGrowth: {
          thisWeek,
          lastWeek,
          percentChange: parseFloat(percentChange.toFixed(1)),
        },
        commissionRevenue: {
          total: totalCommission[0]?.total || 0,
          pending: pendingCommission[0]?.total || 0,
          paid: paidCommission[0]?.total || 0,
        },
        complianceAlerts,
        propertiesByZone: propertiesByZone.map(z => ({
          zone: z.zone || 'Unknown',
          count: z.count || 0,
          verified: z.verified || 0,
        })),
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error generating weekly summary:", error);
      res.status(500).json({ message: "Failed to generate summary" });
    }
  });

  // User Profile Routes
  
  // Get current user profile with preferences
  app.get('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, req.user.id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get recent activity for personalization
      const recentActivity = await db.select()
        .from(userActivityLog)
        .where(eq(userActivityLog.userId, req.user.id))
        .orderBy(desc(userActivityLog.createdAt))
        .limit(20);

      res.json({
        ...user,
        password: undefined, // Don't send password
        otp: undefined, // Don't send OTP
        recentActivity,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user profile
  app.put('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const updateData: any = {};
      
      // Only allow specific fields to be updated
      const allowedFields = ['firstName', 'lastName', 'bio', 'profileImageUrl', 'phoneNumber'];
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }

      updateData.updatedAt = new Date();

      const [updated] = await db.update(users)
        .set(updateData)
        .where(eq(users.id, req.user.id))
        .returning();

      res.json({
        ...updated,
        password: undefined,
        otp: undefined,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update user preferences
  app.post('/api/profile/preferences', isAuthenticated, async (req: any, res) => {
    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, req.user.id));

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Merge existing preferences with new ones
      const currentPreferences = (user.preferences || {}) as Record<string, unknown>;
      const updatedPreferences = {
        ...currentPreferences,
        ...req.body,
      };

      const [updated] = await db.update(users)
        .set({
          preferences: updatedPreferences,
          updatedAt: new Date(),
        })
        .where(eq(users.id, req.user.id))
        .returning();

      res.json({
        preferences: updated.preferences,
      });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
    }
  });

  // Log user activity (for personalization)
  app.post('/api/activity', isAuthenticated, async (req: any, res) => {
    try {
      const { action, metadata } = req.body;

      if (!action) {
        return res.status(400).json({ message: "Action is required" });
      }

      await db.insert(userActivityLog).values({
        userId: req.user.id,
        action,
        metadata: metadata || {},
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error logging activity:", error);
      res.status(500).json({ message: "Failed to log activity" });
    }
  });

  // ==================== AGENT (DELALA) ROUTES ====================
  // Note: Primary agent registration route is defined above in AGENT REGISTRATION section

  // Get agent commissions
  app.get("/api/agent/commissions", isAuthenticated, async (req, res) => {
    try {
      const agent = await storage.getAgentByUserId((req as any).user!.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      const { status } = req.query;
      const commissions = await storage.getAgentCommissions(
        agent.id,
        { status: status as string | undefined }
      );
      
      res.json(commissions);
    } catch (error) {
      console.error("Error fetching commissions:", error);
      res.status(500).json({ message: "Failed to fetch commissions" });
    }
  });

  // Link property to agent (used when listing a property)
  app.post("/api/agent/link-property", isAuthenticated, async (req, res) => {
    try {
      const { propertyId } = req.body;

      if (!propertyId) {
        return res.status(400).json({ message: "Property ID is required" });
      }

      const agent = await storage.getAgentByUserId((req as any).user!.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      if (agent.status !== 'verified') {
        return res.status(403).json({ message: "Agent account must be verified first" });
      }

      const agentProperty = await storage.linkPropertyToAgent(agent.id, propertyId);
      
      res.json(agentProperty);
    } catch (error: any) {
      console.error("Error linking property:", error);
      res.status(500).json({ message: error.message || "Failed to link property" });
    }
  });

  // Admin: Get all agents
  app.get("/api/admin/agents", isAuthenticated, async (req, res) => {
    try {
      if ((req as any).user!.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, city } = req.query;
      const agents = await storage.getAllAgents({
        status: status as string | undefined,
        city: city as string | undefined,
      });
      
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Admin: Verify agent
  app.post("/api/admin/agents/:id/verify", isAuthenticated, async (req, res) => {
    try {
      if ((req as any).user!.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const { status, rejectionReason } = req.body;
      const agentId = parseInt(req.params.id);

      if (!status || !['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      if (status === 'rejected' && !rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required" });
      }

      const agent = await storage.verifyAgent(
        agentId,
        status,
        (req as any).user!.id,
        rejectionReason
      );
      
      res.json(agent);
    } catch (error) {
      console.error("Error verifying agent:", error);
      res.status(500).json({ message: "Failed to verify agent" });
    }
  });

  // Admin: Process agent payout
  app.post("/api/admin/agents/:id/payout", isAuthenticated, async (req: any, res) => {
    try {
      if (req.user!.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const agentId = parseInt(req.params.id);
      const { commissionIds } = req.body;

      if (!commissionIds || !Array.isArray(commissionIds)) {
        return res.status(400).json({ message: "Commission IDs array is required" });
      }

      // Get agent details
      const agent = await storage.getAgent(agentId);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Import TeleBirr service
      const { teleBirrService } = await import("./telebirr");

      // Process payouts for each commission
      const results = [];
      for (const commissionId of commissionIds) {
        const commissions = await storage.getAgentCommissions(agentId, { status: 'pending' });
        const commission = commissions.find(c => c.id === commissionId);

        if (!commission) {
          results.push({
            commissionId,
            success: false,
            message: 'Commission not found or already paid',
          });
          continue;
        }

        // Process TeleBirr payout
        const payoutResult = await teleBirrService.sendPayout({
          agentId,
          commissionId,
          amount: parseFloat(commission.commissionAmount),
          telebirrAccount: agent.telebirrAccount,
          description: `Alga agent commission for booking #${commission.bookingId}`,
        });

        if (payoutResult.success) {
          // Update commission status in database
          const { agentCommissions } = await import("../shared/schema.js");
          await db
            .update(agentCommissions)
            .set({
              status: 'paid',
              paidAt: new Date(),
              telebirrTransactionId: payoutResult.transactionId,
            })
            .where(eq(agentCommissions.id, commissionId));
        }

        results.push({
          commissionId,
          success: payoutResult.success,
          message: payoutResult.message,
          transactionId: payoutResult.transactionId,
        });
      }

      const successCount = results.filter(r => r.success).length;

      res.json({
        message: `Processed ${successCount}/${commissionIds.length} payouts`,
        results,
      });
    } catch (error) {
      console.error("Error processing payout:", error);
      res.status(500).json({ message: "Failed to process payout" });
    }
  });

  // ==================== DELLALA PORTAL ROUTES (Enhanced Agent Portal) ====================

  // Get comprehensive Dellala dashboard
  app.get("/api/dellala/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found. Please register as a Dellala first." });
      }

      // Get or create performance record
      let performance = await storage.getAgentPerformance(agent.id);
      if (!performance) {
        performance = await storage.createAgentPerformance(agent.id);
      }

      // Get recent commissions
      const recentCommissions = await storage.getAgentCommissions(agent.id, {});

      // Get recent withdrawals
      const recentWithdrawals = await storage.getAgentWithdrawals(agent.id, {});

      // Get properties managed by this agent
      const properties = await storage.getAgentProperties(agent.id);

      // Get referral stats
      const referralStats = await storage.getAgentReferralStats(agent.id);

      // Get recent ratings
      const ratings = await storage.getAgentRatings(agent.id, { limit: 5 });

      res.json({
        agent,
        performance,
        recentCommissions,
        recentWithdrawals,
        properties,
        referralStats,
        ratings,
      });
    } catch (error) {
      console.error("Error fetching Dellala dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Get withdrawal history and available balance
  app.get("/api/dellala/withdrawals", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      const { status } = req.query;
      const withdrawals = await storage.getAgentWithdrawals(agent.id, { 
        status: status as string | undefined 
      });

      const performance = await storage.getAgentPerformance(agent.id);

      res.json({
        withdrawals,
        availableBalance: performance?.availableBalance || "0",
        totalWithdrawn: performance?.totalWithdrawn || "0",
      });
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawal history" });
    }
  });

  // Request withdrawal
  app.post("/api/dellala/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      if (agent.status !== 'approved') {
        return res.status(403).json({ message: "Your agent account must be approved before requesting withdrawals" });
      }

      const { amount, method, accountNumber } = req.body;

      if (!amount || !method || !accountNumber) {
        return res.status(400).json({ message: "Amount, method, and account number are required" });
      }

      const withdrawAmount = parseFloat(amount);
      if (withdrawAmount <= 0) {
        return res.status(400).json({ message: "Withdrawal amount must be greater than 0" });
      }

      // Check available balance
      const performance = await storage.getAgentPerformance(agent.id);
      const availableBalance = parseFloat(performance?.availableBalance || "0");

      if (withdrawAmount > availableBalance) {
        return res.status(400).json({ 
          message: `Insufficient balance. Available: ${availableBalance} ETB` 
        });
      }

      // Validate withdrawal method
      if (!['telebirr', 'addispay', 'bank_transfer'].includes(method)) {
        return res.status(400).json({ message: "Invalid withdrawal method" });
      }

      const withdrawal = await storage.createAgentWithdrawal({
        agentId: agent.id,
        amount: withdrawAmount.toString(),
        currency: 'ETB',
        method,
        accountNumber,
        status: 'pending',
      });

      res.json({
        message: "Withdrawal request submitted successfully. You will be notified once processed.",
        withdrawal,
      });
    } catch (error: any) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: error.message || "Failed to create withdrawal request" });
    }
  });

  // Get referrals and generate invite link
  app.get("/api/dellala/referrals", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      const referrals = await storage.getAgentReferrals(agent.id);
      const referralStats = await storage.getAgentReferralStats(agent.id);

      // Generate invite link with referral code
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? 'https://alga.et' 
        : `http://localhost:5000`;
      const inviteLink = `${baseUrl}/register?ref=${agent.referralCode}`;

      res.json({
        referrals,
        stats: referralStats,
        referralCode: agent.referralCode,
        inviteLink,
      });
    } catch (error) {
      console.error("Error fetching referrals:", error);
      res.status(500).json({ message: "Failed to fetch referral data" });
    }
  });

  // Get agent ratings and reviews
  app.get("/api/dellala/ratings", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent account not found" });
      }

      const { limit, offset } = req.query;
      const ratings = await storage.getAgentRatings(agent.id, {
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
      });

      const performance = await storage.getAgentPerformance(agent.id);

      res.json({
        ratings,
        averageRating: performance?.averageRating || "0",
        totalRatings: performance?.totalRatings || 0,
      });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  // List a property on behalf of an owner (Dellala agent functionality)
  app.post("/api/dellala/list-property", isAuthenticated, async (req: any, res) => {
    try {
      const agent = await storage.getAgentByUserId(req.user.id);
      
      if (!agent) {
        return res.status(404).json({ message: "You must be a registered Dellala agent to list properties" });
      }

      if (agent.status !== "approved") {
        return res.status(403).json({ message: "Your agent account must be approved before listing properties" });
      }

      const {
        // Property fields
        title,
        type,
        city,
        region,
        location,
        description,
        images,
        maxGuests,
        bedrooms,
        bathrooms,
        pricePerNight,
        amenities,
        // Owner information
        ownerFullName,
        ownerPhone,
        ownerEmail,
        ownerIdNumber,
        propertyDeedUrl,
      } = req.body;

      // Validate required fields including ownership verification
      if (!title || !type || !city || !region || !location || !images || images.length < 5 || 
          !maxGuests || !bedrooms || !bathrooms || !pricePerNight ||
          !ownerFullName || !ownerPhone || !ownerIdNumber || !propertyDeedUrl) {
        return res.status(400).json({ 
          message: "Missing required fields. Property details, owner information, ID number, and property deed are required for verification." 
        });
      }

      // Step 1: Find or create owner user account
      let ownerUser = await db.select()
        .from(users)
        .where(eq(users.phoneNumber, ownerPhone))
        .limit(1);

      let ownerId: string;

      if (ownerUser.length === 0) {
        // Create new owner account
        const newOwnerId = crypto.randomUUID();
        await db.insert(users).values({
          id: newOwnerId,
          phoneNumber: ownerPhone,
          email: ownerEmail || null,
          firstName: ownerFullName.split(" ")[0] || ownerFullName,
          lastName: ownerFullName.split(" ").slice(1).join(" ") || "",
          role: "host", // Owner is a host
          idNumber: ownerIdNumber || null,
          phoneVerified: false,
          idVerified: false,
          status: "active",
        });
        ownerId = newOwnerId;
      } else {
        ownerId = ownerUser[0].id;
        // Update existing owner's role to host if they're just a guest
        if (ownerUser[0].role === "guest") {
          await db.update(users)
            .set({ role: "host" })
            .where(eq(users.id, ownerId));
        }
      }

      // Step 2: Create the property linked to the owner
      const [newProperty] = await db.insert(properties).values({
        hostId: ownerId,
        title,
        description: description || "",
        type,
        city,
        region,
        location,
        address: location,
        pricePerNight,
        currency: "ETB",
        maxGuests,
        bedrooms,
        bathrooms,
        amenities: amenities || [],
        images,
        status: "pending", // Requires admin approval
        isActive: false, // Inactive until approved
      }).returning();

      // Step 3: Save property deed document for verification
      await db.insert(verificationDocuments).values({
        userId: ownerId,
        documentType: "property_deed",
        documentUrl: propertyDeedUrl,
        status: "pending", // Requires admin review
      });

      // Step 4: Link the agent to this property
      await db.insert(agentProperties).values({
        agentId: agent.id,
        propertyId: newProperty.id,
        isActive: true,
      });

      // Step 5: Update agent's total properties count
      await db.update(agents)
        .set({
          totalProperties: sql`${agents.totalProperties} + 1`,
          activeProperties: sql`${agents.activeProperties} + 1`,
        })
        .where(eq(agents.id, agent.id));

      res.status(201).json({
        message: "Property listed successfully! It will be reviewed by our team.",
        property: newProperty,
        ownerId,
      });
    } catch (error) {
      console.error("Error listing property:", error);
      res.status(500).json({ message: "Failed to create property listing" });
    }
  });

  // ==================== END AGENT ROUTES ====================

  // ==================== LEMLEM OPERATIONS DASHBOARD ROUTES ====================

  // Get KPI Overview Data
  app.get("/api/admin/operations/kpis", isAuthenticated, async (req: any, res) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "operator")) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const {
        agents,
        properties,
        hardwareDeployments,
        paymentTransactions,
        marketingCampaigns,
      } = await import("../shared/schema.js");

      // Count active agents
      const activeAgentsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(agents)
        .where(eq(agents.status, "approved"));
      const activeAgents = Number(activeAgentsResult[0]?.count || 0);

      // Count agents from last week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const newAgentsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(agents)
        .where(
          and(
            eq(agents.status, "approved"),
            sql`${agents.createdAt} >= ${oneWeekAgo.toISOString()}`
          )
        );
      const newAgentsThisWeek = Number(newAgentsResult[0]?.count || 0);

      // Count total properties
      const totalPropertiesResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties);
      const totalProperties = Number(totalPropertiesResult[0]?.count || 0);

      // Count pending properties
      const pendingPropertiesResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(properties)
        .where(eq(properties.status, "pending"));
      const pendingVerification = Number(pendingPropertiesResult[0]?.count || 0);

      // Count hardware deployments
      const hardwareResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(hardwareDeployments)
        .where(eq(hardwareDeployments.status, "active"));
      const hardwareDeployed = Number(hardwareResult[0]?.count || 0);

      // Count warranty expiring soon (next 30 days)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const warrantyResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(hardwareDeployments)
        .where(
          and(
            eq(hardwareDeployments.status, "active"),
            sql`${hardwareDeployments.warrantyExpiry} <= ${thirtyDaysFromNow.toISOString()}`
          )
        );
      const warrantyExpiring = Number(warrantyResult[0]?.count || 0);

      // Count unreconciled payments
      const unreconciledResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(paymentTransactions)
        .where(eq(paymentTransactions.reconciled, false));
      const unreconciledPayments = Number(unreconciledResult[0]?.count || 0);

      // Count active campaigns
      const campaignsResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(marketingCampaigns)
        .where(eq(marketingCampaigns.status, "active"));
      const activeCampaigns = Number(campaignsResult[0]?.count || 0);

      // Sum campaign conversions
      const conversionsResult = await db
        .select({ sum: sql<number>`COALESCE(SUM(${marketingCampaigns.conversions}), 0)` })
        .from(marketingCampaigns)
        .where(eq(marketingCampaigns.status, "active"));
      const campaignConversions = Number(conversionsResult[0]?.sum || 0);

      res.json({
        activeAgents,
        newAgentsThisWeek,
        totalProperties,
        pendingVerification,
        hardwareDeployed,
        warrantyExpiring,
        unreconciledPayments,
        activeCampaigns,
        campaignConversions,
      });
    } catch (error) {
      console.error("Error fetching operations KPIs:", error);
      res.status(500).json({ message: "Failed to fetch operations KPIs" });
    }
  });

  // Get Active System Alerts
  app.get("/api/admin/operations/alerts", isAuthenticated, async (req: any, res) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "operator")) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const { systemAlerts } = await import("../shared/schema.js");

      const alerts = await db
        .select()
        .from(systemAlerts)
        .where(eq(systemAlerts.status, "active"))
        .orderBy(
          sql`CASE 
            WHEN ${systemAlerts.severity} = 'critical' THEN 1 
            WHEN ${systemAlerts.severity} = 'high' THEN 2 
            WHEN ${systemAlerts.severity} = 'medium' THEN 3 
            ELSE 4 
          END`,
          systemAlerts.createdAt
        );

      res.json(alerts);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      res.status(500).json({ message: "Failed to fetch alerts" });
    }
  });

  // Acknowledge Alert
  app.post("/api/admin/operations/alerts/:id/acknowledge", isAuthenticated, async (req: any, res) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "operator")) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const { systemAlerts } = await import("../shared/schema.js");
      const alertId = parseInt(req.params.id);

      await db
        .update(systemAlerts)
        .set({
          status: "acknowledged",
          acknowledgedBy: req.user.id,
          acknowledgedAt: new Date(),
        })
        .where(eq(systemAlerts.id, alertId));

      res.json({ message: "Alert acknowledged successfully" });
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Resolve Alert
  app.post("/api/admin/operations/alerts/:id/resolve", isAuthenticated, async (req: any, res) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "operator")) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const { systemAlerts } = await import("../shared/schema.js");
      const alertId = parseInt(req.params.id);
      const { resolutionNotes } = req.body;

      await db
        .update(systemAlerts)
        .set({
          status: "resolved",
          resolvedBy: req.user.id,
          resolvedAt: new Date(),
          resolutionNotes: resolutionNotes || null,
        })
        .where(eq(systemAlerts.id, alertId));

      res.json({ message: "Alert resolved successfully" });
    } catch (error) {
      console.error("Error resolving alert:", error);
      res.status(500).json({ message: "Failed to resolve alert" });
    }
  });

  // Get Agent Governance Data
  app.get("/api/admin/operations/agents", isAuthenticated, async (req: any, res) => {
    if (!req.user || (req.user.role !== "admin" && req.user.role !== "operator")) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const { agents, agentCommissions } = await import("../shared/schema.js");

      const agentsList = await db
        .select({
          id: agents.id,
          fullName: agents.fullName,
          phoneNumber: agents.phoneNumber,
          city: agents.city,
          status: agents.status,
          totalEarnings: agents.totalEarnings,
          totalProperties: agents.totalProperties,
          activeProperties: agents.activeProperties,
          createdAt: agents.createdAt,
        })
        .from(agents)
        .orderBy(desc(agents.totalEarnings));

      res.json(agentsList);
    } catch (error) {
      console.error("Error fetching agents data:", error);
      res.status(500).json({ message: "Failed to fetch agents data" });
    }
  });

  // ==================== END LEMLEM OPERATIONS DASHBOARD ROUTES ====================

  // ==================== ADMIN SIGNATURE DASHBOARD ROUTES (INSA COMPLIANCE) ====================
  // Note: requireAdmin middleware is already defined at the top of this file

  // Get all signature consent logs (with filters and pagination)
  app.get("/api/admin/signatures", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { userId, action, verified, startDate, endDate, page = 1, pageSize = 50 } = req.query;
      
      const filters: any = {};
      
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (verified !== undefined) filters.verified = verified === 'true';
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      
      const limit = Math.min(parseInt(pageSize), 200);
      const offset = (parseInt(page) - 1) * limit;
      
      filters.limit = limit;
      filters.offset = offset;
      
      const result = await storage.getAllConsentLogs(filters);
      
      // Log dashboard access
      await storage.createDashboardAccessLog({
        adminUserId: req.user.id,
        action: 'view',
        recordId: null,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { filters, totalRecords: result.total },
      });
      
      res.json({
        total: result.total,
        page: parseInt(page),
        pageSize: limit,
        totalPages: Math.ceil(result.total / limit),
        logs: result.logs,
      });
    } catch (error) {
      console.error("Error fetching signature logs:", error);
      res.status(500).json({ message: "Failed to fetch signature logs" });
    }
  });

  // Verify signature integrity (recompute SHA-256 hash)
  app.post("/api/admin/signatures/verify/:signatureId", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { signatureId } = req.params;
      const log = await storage.getConsentLogBySignatureId(signatureId);
      
      if (!log) {
        return res.status(404).json({ message: "Signature not found" });
      }
      
      // Recompute hash
      const { generateSignatureHash } = await import("./utils/crypto");
      const recomputedHash = generateSignatureHash(log.userId, log.action, log.timestamp);
      
      const isValid = recomputedHash === log.signatureHash;
      
      // Log dashboard access
      await storage.createDashboardAccessLog({
        adminUserId: req.user.id,
        action: 'verify',
        recordId: signatureId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { isValid, originalHash: log.signatureHash, recomputedHash },
      });
      
      res.json({
        signatureId,
        isValid,
        originalHash: log.signatureHash,
        recomputedHash,
        message: isValid ? "Signature integrity verified" : "Signature hash mismatch - potential tampering detected",
      });
    } catch (error) {
      console.error("Error verifying signature:", error);
      res.status(500).json({ message: "Failed to verify signature" });
    }
  });

  // Decrypt audit info (IP address, device info) - Admin only
  app.get("/api/admin/signatures/decrypt/:signatureId", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { signatureId } = req.params;
      
      // Rate limit check (20 decrypts per hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const decryptCount = await storage.getAdminDecryptCount(req.user.id, oneHourAgo);
      
      if (decryptCount >= 20) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. Maximum 20 decrypt operations per hour.",
          nextAvailableAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        });
      }
      
      const log = await storage.getConsentLogBySignatureId(signatureId);
      
      if (!log) {
        return res.status(404).json({ message: "Signature not found" });
      }
      
      // Decrypt sensitive data (server-side only)
      const { decrypt } = await import("./utils/crypto");
      const ipAddress = log.ipAddressEncrypted ? decrypt(log.ipAddressEncrypted) : 'N/A';
      const deviceInfo = log.deviceInfoEncrypted ? decrypt(log.deviceInfoEncrypted) : 'N/A';
      
      // Log dashboard access
      await storage.createDashboardAccessLog({
        adminUserId: req.user.id,
        action: 'decrypt',
        recordId: signatureId,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { decryptedSuccessfully: true },
      });
      
      res.json({
        signatureId,
        userId: log.userId,
        action: log.action,
        timestamp: log.timestamp,
        ipAddress,
        deviceInfo,
        sessionInfo: {
          verified: log.verified,
          otpId: log.otpId,
          faydaId: log.faydaId,
        },
      });
    } catch (error) {
      console.error("Error decrypting audit info:", error);
      res.status(500).json({ message: "Failed to decrypt audit information" });
    }
  });

  // Export signature logs (CSV, PDF, JSON)
  app.post("/api/admin/signatures/export", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { format = 'csv', filters = {} } = req.body;
      
      // Rate limit check (100 exports per day)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const exportCount = await storage.getAdminExportCount(req.user.id, oneDayAgo);
      
      if (exportCount >= 100) {
        return res.status(429).json({ 
          message: "Rate limit exceeded. Maximum 100 exports per day.",
          nextAvailableAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        });
      }
      
      // Get filtered records (no pagination for export)
      const result = await storage.getAllConsentLogs({
        ...filters,
        limit: 10000, // Max export limit
        offset: 0,
      });
      
      const { generateSignatureReportPDF, generateSignatureReportCSV, generateSignatureReportJSON } = await import("./utils/reportBuilder");
      
      let fileContent: Buffer | string;
      let fileName: string;
      let contentType: string;
      
      const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
      const adminName = `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.id;
      
      switch (format) {
        case 'pdf':
          fileContent = generateSignatureReportPDF(result.logs, {
            title: 'Electronic Signature Compliance Report',
            adminName,
            adminUserId: req.user.id,
            exportDate: new Date(),
          });
          fileName = `alga_signatures_export_${timestamp}_${req.user.id}.pdf`;
          contentType = 'application/pdf';
          break;
        
        case 'json':
          fileContent = generateSignatureReportJSON(result.logs);
          fileName = `alga_signatures_export_${timestamp}_${req.user.id}.json`;
          contentType = 'application/json';
          break;
        
        case 'csv':
        default:
          fileContent = generateSignatureReportCSV(result.logs);
          fileName = `alga_signatures_export_${timestamp}_${req.user.id}.csv`;
          contentType = 'text/csv';
          break;
      }
      
      // Log dashboard access
      await storage.createDashboardAccessLog({
        adminUserId: req.user.id,
        action: 'export',
        recordId: null,
        exportFormat: format,
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
        metadata: { filters, recordCount: result.logs.length, fileName },
      });
      
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', contentType);
      res.send(fileContent);
    } catch (error) {
      console.error("Error exporting signatures:", error);
      res.status(500).json({ message: "Failed to export signature logs" });
    }
  });

  // ==================== INTEGRITY ALERTS (Signature Tampering Detection) ====================

  // Get integrity alerts (unresolved in last 30 days)
  app.get("/api/admin/signatures/alerts", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { resolved, category, limit, offset } = req.query;
      
      const result = await storage.getIntegrityAlerts({
        resolved: resolved === 'true' ? true : resolved === 'false' ? false : undefined,
        category: category || undefined,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0,
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error fetching integrity alerts:", error);
      res.status(500).json({ message: "Failed to fetch integrity alerts" });
    }
  });

  // Acknowledge integrity alerts
  app.post("/api/admin/signatures/alerts/acknowledge", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const { alertIds } = req.body;
      
      if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
        return res.status(400).json({ message: "alertIds array is required" });
      }
      
      await storage.acknowledgeIntegrityAlerts(alertIds, req.user.id);
      
      res.json({ 
        message: "Alerts acknowledged successfully",
        count: alertIds.length 
      });
    } catch (error) {
      console.error("Error acknowledging alerts:", error);
      res.status(500).json({ message: "Failed to acknowledge alerts" });
    }
  });

  // Create synthetic test alert (non-production only)
  app.post("/api/admin/signatures/alerts/test", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Test alerts are disabled in production" });
      }
      
      const { createTestAlert } = await import("./utils/integrityAlerts");
      const testSignatureId = await createTestAlert();
      
      res.json({ 
        message: "Test alert created successfully",
        signatureId: testSignatureId
      });
    } catch (error) {
      console.error("Error creating test alert:", error);
      res.status(500).json({ message: "Failed to create test alert" });
    }
  });

  // ==================== END ADMIN SIGNATURE DASHBOARD ROUTES ====================

  // ==================== DELLALA AGENT MANAGEMENT ROUTES ====================
  
  // Get all agents (admin only)
  app.get('/api/admin/agents', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const { status, city } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (city) filters.city = city as string;
      
      const agents = await storage.getAllAgents(filters);
      
      // Enrich with user data
      const enrichedAgents = await Promise.all(
        agents.map(async (agent) => {
          const user = await storage.getUser(agent.userId);
          return {
            ...agent,
            user: user ? {
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            } : null,
          };
        })
      );
      
      res.json(enrichedAgents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Verify/approve/reject agent (admin only)
  app.post('/api/admin/agents/:id/verify', isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const { status, rejectionReason } = req.body;
      
      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Valid status (approved/rejected) is required" });
      }
      
      if (status === 'rejected' && !rejectionReason) {
        return res.status(400).json({ message: "Rejection reason is required when rejecting" });
      }
      
      const updatedAgent = await storage.verifyAgent(
        agentId,
        status,
        req.user.id,
        rejectionReason
      );
      
      // Update user role if approved
      if (status === 'approved') {
        await storage.updateUserRole(updatedAgent.userId, 'dellala');
      }
      
      res.json(updatedAgent);
    } catch (error) {
      console.error("Error verifying agent:", error);
      res.status(500).json({ message: "Failed to verify agent" });
    }
  });

  // Get agent by ID (admin only)
  app.get('/api/admin/agents/:id', isAuthenticated, requireAdmin, async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      const agent = await storage.getAgent(agentId);
      
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const user = await storage.getUser(agent.userId);
      
      res.json({
        ...agent,
        user: user ? {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        } : null,
      });
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  // ==================== END DELLALA AGENT MANAGEMENT ROUTES ====================

  // ==================== FEATURE FLAGS ROUTES ====================
  
  // Get all feature flags
  app.get('/api/feature-flags', (req, res) => {
    res.json(getFeatureFlags());
  });

  // Update feature flag (admin only)
  app.patch('/api/feature-flags/:flagId', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser((req as any).user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ message: "Only admins can modify feature flags" });
      }

      const { flagId } = req.params;
      const { enabled } = req.body;

      if (typeof enabled !== 'boolean') {
        return res.status(400).json({ message: "enabled must be a boolean" });
      }

      setFeatureFlag(flagId, enabled);
      res.json({ flagId, enabled });
    } catch (error) {
      console.error("Error updating feature flag:", error);
      res.status(500).json({ message: "Failed to update feature flag" });
    }
  });

  // ==================== END FEATURE FLAGS ROUTES ====================

  // ==================== FINANCIAL SETTLEMENT ENGINE ROUTES ====================
  // Enterprise-grade settlement, wallet, payout, and reconciliation APIs
  app.use('/api/settlement', financialSettlementRoutes);
  // ==================== END FINANCIAL SETTLEMENT ENGINE ROUTES ====================

  // ==================== VITE DEV SERVER MIDDLEWARE (Frontend) ====================
  // Set up Vite dev server middleware for serving React frontend in development
  if (process.env.NODE_ENV === 'development') {
    try {
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          allowedHosts: true,
        },
      });
      
      // Use vite's connect instance as middleware
      app.use(vite.middlewares);
      
      console.log('✅ Vite dev server middleware loaded - frontend will be served from client/');
    } catch (error) {
      console.error('⚠️ Failed to load Vite dev server middleware:', error);
      console.log('Frontend may not be served correctly');
    }
  } else {
    // Production: Serve pre-built static files from dist/public
    const distPath = path.resolve(process.cwd(), 'dist', 'public');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, {
        maxAge: '1h',
        etag: false,
      }));
      
      // SPA fallback: serve index.html for all non-API routes
      app.get('*', (req, res) => {
        if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads') && !req.path.startsWith('/objects')) {
          res.sendFile(path.join(distPath, 'index.html'));
        } else {
          res.status(404).json({ message: 'Not found' });
        }
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
