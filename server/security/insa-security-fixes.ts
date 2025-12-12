import { Request, Response, NextFunction } from 'express';
import { db } from '../db.js';
import { bookings, properties, users } from '../../shared/schema.js';
import { eq, and } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';

// ==================== INSA SECURITY FIX UTILITIES ====================

// Generate secure booking reference (UUID-like) - Fix #12
export function generateBookingReference(): string {
  return randomBytes(16).toString('hex');
}

// Generate secure 6-digit OTP with proper entropy - Fix #8
export function generateSecureOTP(): string {
  const bytes = randomBytes(4);
  const num = bytes.readUInt32BE(0) % 1000000;
  return num.toString().padStart(6, '0');
}

// Hash OTP before storage - Fix #8
export function hashOTP(otp: string): string {
  return createHash('sha256').update(otp).digest('hex');
}

// Sanitize user object to remove sensitive fields - Fix #10
export function sanitizeUserResponse(user: any): any {
  if (!user) return null;
  
  const {
    password,
    otp,
    otpExpiry,
    faydaVerificationData,
    ...safeUser
  } = user;
  
  return safeUser;
}

// Validate date order (check-in must be before check-out) - Fix #11
export function validateBookingDates(checkIn: Date | string, checkOut: Date | string): { valid: boolean; error?: string } {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  
  // Compare dates only (ignore time) to allow same-day bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDateOnly = new Date(checkInDate);
  checkInDateOnly.setHours(0, 0, 0, 0);
  
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (checkOutDate <= checkInDate) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }
  
  if (checkInDateOnly < today) {
    return { valid: false, error: 'Check-in date cannot be in the past' };
  }
  
  return { valid: true };
}

// Calculate booking price server-side - Fix #3 & #5
export async function calculateBookingPrice(
  propertyId: number,
  checkIn: Date | string,
  checkOut: Date | string,
  guests: number
): Promise<{
  pricePerNight: number;
  nights: number;
  subtotal: number;
  serviceFee: number;
  total: number;
  currency: string;
}> {
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
  
  const pricePerNight = parseFloat(prop.pricePerNight);
  const subtotal = pricePerNight * nights;
  const serviceFee = subtotal * 0.15; // 15% Alga service fee
  const total = subtotal + serviceFee;
  
  return {
    pricePerNight,
    nights,
    subtotal,
    serviceFee,
    total,
    currency: prop.currency || 'ETB'
  };
}

// Validate guest count against property capacity - Fix #6
export async function validateGuestCount(propertyId: number, guests: number): Promise<{ valid: boolean; error?: string; maxGuests?: number }> {
  const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
  
  if (!property || property.length === 0) {
    return { valid: false, error: 'Property not found' };
  }
  
  const maxGuests = property[0].maxGuests;
  
  if (guests <= 0) {
    return { valid: false, error: 'Guest count must be at least 1', maxGuests };
  }
  
  if (guests > maxGuests) {
    return { valid: false, error: `Guest count exceeds maximum capacity of ${maxGuests}`, maxGuests };
  }
  
  return { valid: true, maxGuests };
}

// ==================== MIDDLEWARE ====================

// Admin-only middleware - Fix #1
export const requireAdmin = (req: any, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  
  if (userRole !== 'admin') {
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
};

// Admin or Operator middleware
export const requireAdminOrOperator = (req: any, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  
  if (!['admin', 'operator'].includes(userRole)) {
    return res.status(403).json({ 
      message: 'Access denied. Admin or operator privileges required.',
      code: 'ELEVATED_ACCESS_REQUIRED'
    });
  }
  
  next();
};

// Booking ownership validation middleware - Fix #2 & #9
export const validateBookingOwnership = async (req: any, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.id || req.params.bookingId);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ message: 'Invalid booking ID' });
    }
    
    const booking = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
    
    if (!booking || booking.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    const bookingData = booking[0];
    
    // Check if user owns the booking OR is admin/operator OR is the property host
    const property = await db.select().from(properties).where(eq(properties.id, bookingData.propertyId)).limit(1);
    const isHost = property[0]?.hostId === userId;
    
    if (bookingData.guestId !== userId && !['admin', 'operator'].includes(userRole) && !isHost) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to access this booking.',
        code: 'BOOKING_ACCESS_DENIED'
      });
    }
    
    // Attach booking to request for use in handler
    req.booking = bookingData;
    req.isHost = isHost;
    next();
  } catch (error) {
    console.error('Booking ownership validation error:', error);
    res.status(500).json({ message: 'Failed to validate booking access' });
  }
};

// Property ownership validation middleware - Fix #1 & #7
export const validatePropertyOwnership = async (req: any, res: Response, next: NextFunction) => {
  try {
    const propertyId = parseInt(req.params.propertyId || req.params.id);
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (isNaN(propertyId)) {
      return res.status(400).json({ message: 'Invalid property ID' });
    }
    
    const property = await db.select().from(properties).where(eq(properties.id, propertyId)).limit(1);
    
    if (!property || property.length === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    const propertyData = property[0];
    
    // Only host or admin can modify property
    if (propertyData.hostId !== userId && !['admin', 'operator'].includes(userRole)) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to modify this property.',
        code: 'PROPERTY_ACCESS_DENIED'
      });
    }
    
    req.property = propertyData;
    next();
  } catch (error) {
    console.error('Property ownership validation error:', error);
    res.status(500).json({ message: 'Failed to validate property access' });
  }
};

// Validate booking status transitions - Fix #4
export const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending': ['confirmed', 'cancelled'],
  'confirmed': ['completed', 'cancelled'],
  'completed': [], // Final state
  'cancelled': [], // Final state
};

export const VALID_PAYMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending': ['paid', 'failed'],
  'paid': ['refunded'],
  'failed': ['pending', 'paid'], // Can retry
  'refunded': [], // Final state
};

export function validateStatusTransition(currentStatus: string, newStatus: string, type: 'booking' | 'payment'): boolean {
  const transitions = type === 'booking' ? VALID_STATUS_TRANSITIONS : VALID_PAYMENT_STATUS_TRANSITIONS;
  const allowedTransitions = transitions[currentStatus] || [];
  return allowedTransitions.includes(newStatus);
}

// Rate limiting for OTP - Fix #8
const otpAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

export function checkOTPRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 5;
  const blockDuration = 30 * 60 * 1000; // 30 minutes block
  
  const record = otpAttempts.get(identifier);
  
  if (record) {
    // Check if blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return { allowed: false, retryAfter: Math.ceil((record.blockedUntil - now) / 1000) };
    }
    
    // Check if within window
    if (now - record.lastAttempt < windowMs) {
      if (record.count >= maxAttempts) {
        // Block the user
        record.blockedUntil = now + blockDuration;
        otpAttempts.set(identifier, record);
        return { allowed: false, retryAfter: Math.ceil(blockDuration / 1000) };
      }
      record.count++;
    } else {
      // Reset counter
      record.count = 1;
    }
    record.lastAttempt = now;
    otpAttempts.set(identifier, record);
  } else {
    otpAttempts.set(identifier, { count: 1, lastAttempt: now });
  }
  
  return { allowed: true };
}

export function resetOTPRateLimit(identifier: string): void {
  otpAttempts.delete(identifier);
}

// File path validation - Fix #7
export function validateFilePath(providedPath: string, expectedPattern: RegExp): boolean {
  // Prevent path traversal
  if (providedPath.includes('..') || providedPath.includes('//')) {
    return false;
  }
  
  return expectedPattern.test(providedPath);
}

// Secure session file association - Fix #7
const uploadSessions = new Map<string, { userId: string; files: string[]; expiry: number }>();

export function createUploadSession(userId: string): string {
  const sessionId = randomBytes(32).toString('hex');
  const expiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  
  uploadSessions.set(sessionId, { userId, files: [], expiry });
  
  return sessionId;
}

export function addFileToSession(sessionId: string, filePath: string, userId: string): boolean {
  const session = uploadSessions.get(sessionId);
  
  if (!session || session.userId !== userId || Date.now() > session.expiry) {
    return false;
  }
  
  session.files.push(filePath);
  return true;
}

export function validateFileOwnership(sessionId: string, filePath: string, userId: string): boolean {
  const session = uploadSessions.get(sessionId);
  
  if (!session || session.userId !== userId) {
    return false;
  }
  
  return session.files.includes(filePath);
}

// Audit logging for security events
export async function logSecurityEvent(
  userId: string | null,
  action: string,
  details: Record<string, any>,
  ipAddress: string
): Promise<void> {
  try {
    console.log(`[SECURITY AUDIT] ${new Date().toISOString()} | User: ${userId || 'anonymous'} | Action: ${action} | IP: ${ipAddress} | Details: ${JSON.stringify(details)}`);
    // In production, this would write to a secure audit log table
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
