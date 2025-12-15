import {
  users,
  properties,
  bookings,
  reviews,
  favorites,
  verificationDocuments,
  accessCodes,
  lockboxes,
  securityCameras,
  serviceProviders,
  serviceBookings,
  serviceReviews,
  agents,
  agentProperties,
  agentCommissions,
  agentWithdrawals,
  agentRatings,
  agentReferrals,
  agentPerformance,
  consentLogs,
  dashboardAccessLogs,
  integrityAlerts,
  userOnboarding,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Favorite,
  type InsertFavorite,
  type AccessCode,
  type InsertAccessCode,
  type Lockbox,
  type InsertLockbox,
  type SecurityCamera,
  type InsertSecurityCamera,
  type ServiceProvider,
  type InsertServiceProvider,
  type ServiceBooking,
  type InsertServiceBooking,
  type ServiceReview,
  type InsertServiceReview,
  type Agent,
  type InsertAgent,
  type AgentProperty,
  type InsertAgentProperty,
  type AgentCommission,
  type InsertAgentCommission,
  type AgentWithdrawal,
  type InsertAgentWithdrawal,
  type AgentRating,
  type InsertAgentRating,
  type AgentReferral,
  type InsertAgentReferral,
  type AgentPerformance,
  type InsertAgentPerformance,
  type ConsentLog,
  type InsertConsentLog,
  type DashboardAccessLog,
  type InsertDashboardAccessLog,
  type IntegrityAlert,
} from '../shared/schema.js';
import { db } from './db.js';
import { eq, and, desc, asc, sql, ilike, gte, lte, inArray } from "drizzle-orm";
import { calculateBookingBreakdown } from './utils/booking.js';

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined>;
  createUser(user: UpsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // OTP operations (supports both phone and email)
  saveOtp(contact: string, otp: string, expiryMinutes?: number): Promise<void>;
  getOtp(contact: string): Promise<string | null>;
  deleteOtp(contact: string): Promise<void>;
  verifyOtp(contact: string, otp: string): Promise<boolean>;
  markPhoneVerified(phoneNumber: string): Promise<User>;
  
  // User update operations
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
  
  // Admin user management
  getAllUsers(): Promise<User[]>;
  updateUserRole(userId: string, role: string): Promise<User>;
  updateUserStatus(userId: string, status: string): Promise<User>;
  
  // Property operations
  getProperties(filters?: {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    maxGuests?: number;
    checkIn?: Date;
    checkOut?: Date;
    q?: string;
    sort?: string;
  }): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  getPropertiesByHost(hostId: string): Promise<Property[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingByReference(reference: string): Promise<Booking | undefined>; // INSA FIX: Secure non-sequential lookup
  getAllBookings(): Promise<Booking[]>;
  getBookingsByGuest(guestId: string): Promise<Booking[]>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updatePaymentStatus(id: number, paymentStatus: string): Promise<Booking>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  recalculatePropertyRating(propertyId: number): Promise<number>;
  getReviewsByProperty(propertyId: number): Promise<Review[]>;
  
  // Favorite operations
  addToFavorites(favorite: InsertFavorite): Promise<Favorite>;
  removeFromFavorites(userId: string, propertyId: number): Promise<void>;
  getUserFavorites(userId: string): Promise<Property[]>;
  
  // Statistics
  getPropertyStats(propertyId: number): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
  }>;
  
  getHostStats(hostId: string): Promise<{
    activeListings: number;
    totalListings: number;
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalEarnings: number;
    lastPayout: number | null;
    lastPayoutDate: Date | null;
    avgRating: number;
    totalReviews: number;
    occupancyRate: number;
    pendingReviews: number;
  }>;
  
  // Verification document operations
  createVerificationDocument(document: any): Promise<any>;
  getVerificationDocumentsByUser(userId: string): Promise<any[]>;
  getAllVerificationDocuments(): Promise<any[]>;
  getPendingVerificationDocuments(): Promise<any[]>;
  verifyDocument(documentId: number, status: string, verifierId: string, rejectionReason?: string): Promise<any>;
  
  // Admin operations
  getAllPropertiesForVerification(): Promise<Property[]>;
  getPendingProperties(): Promise<Property[]>;
  verifyProperty(propertyId: number, status: string, verifierId: string, rejectionReason?: string): Promise<Property>;
  getAdminStats(): Promise<{
    totalUsers: number;
    newUsersThisMonth: number;
    activeProperties: number;
    pendingProperties: number;
    pendingDocuments: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }>;
  
  // Access code operations
  createAccessCode(accessCode: InsertAccessCode): Promise<AccessCode>;
  getAccessCodeByBookingId(bookingId: number): Promise<AccessCode | undefined>;
  getAccessCodesByGuestId(guestId: string): Promise<AccessCode[]>;
  expireOldAccessCodes(): Promise<void>;
  
  // Alga Secure Access - Lockbox operations
  createLockbox(lockbox: InsertLockbox): Promise<Lockbox>;
  getLockboxByPropertyId(propertyId: number): Promise<Lockbox | undefined>;
  updateLockbox(id: number, updates: Partial<InsertLockbox>): Promise<Lockbox>;
  verifyLockbox(id: number, verifiedBy: string, status: string, rejectionReason?: string): Promise<Lockbox>;
  getAllPendingLockboxes(): Promise<Lockbox[]>;
  
  // Alga Secure Access - Security camera operations
  createSecurityCamera(camera: InsertSecurityCamera): Promise<SecurityCamera>;
  getSecurityCamerasByPropertyId(propertyId: number): Promise<SecurityCamera[]>;
  updateSecurityCamera(id: number, updates: Partial<InsertSecurityCamera>): Promise<SecurityCamera>;
  verifySecurityCamera(id: number, verifiedBy: string, status: string, rejectionReason?: string): Promise<SecurityCamera>;
  getAllPendingSecurityCameras(): Promise<SecurityCamera[]>;
  
  // Alga Secure Access - Property hardware verification
  updatePropertyHardwareStatus(propertyId: number, lockboxVerified: boolean, cameraVerified: boolean): Promise<Property>;
  getPropertiesWithoutHardware(): Promise<Property[]>;
  
  // Service provider operations
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  getServiceProvider(id: number): Promise<ServiceProvider | undefined>;
  getServiceProvidersByUser(userId: string): Promise<ServiceProvider[]>;
  getAllServiceProviders(filters?: {
    city?: string;
    serviceType?: string;
    verificationStatus?: string;
  }): Promise<ServiceProvider[]>;
  updateServiceProvider(id: number, updates: Partial<ServiceProvider>): Promise<ServiceProvider>;
  verifyServiceProvider(providerId: number, status: string, verifierId: string, rejectionReason?: string): Promise<ServiceProvider>;
  updateServiceProviderRating(providerId: number): Promise<void>;
  
  // Service booking operations
  createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking>;
  getServiceBooking(id: number): Promise<ServiceBooking | undefined>;
  getServiceBookingsByGuest(guestId: string): Promise<ServiceBooking[]>;
  getServiceBookingsByHost(hostId: string): Promise<ServiceBooking[]>;
  getServiceBookingsByProvider(providerId: number): Promise<ServiceBooking[]>;
  updateServiceBookingStatus(id: number, status: string): Promise<ServiceBooking>;
  updateServiceBookingPayment(id: number, paymentStatus: string, paymentRef?: string): Promise<ServiceBooking>;
  completeServiceBooking(id: number): Promise<ServiceBooking>;
  
  // Service review operations
  createServiceReview(review: InsertServiceReview): Promise<ServiceReview>;
  getServiceReviewsByProvider(providerId: number): Promise<ServiceReview[]>;
  getServiceReviewByBooking(bookingId: number): Promise<ServiceReview | undefined>;
  
  // Agent (Delala) operations
  createAgent(agent: InsertAgent): Promise<Agent>;
  getAgent(id: number): Promise<Agent | undefined>;
  getAgentByUserId(userId: string): Promise<Agent | undefined>;
  getAgentByPhone(phoneNumber: string): Promise<Agent | undefined>;
  getAllAgents(filters?: { status?: string; city?: string }): Promise<Agent[]>;
  verifyAgent(agentId: number, status: string, verifierId: string, rejectionReason?: string): Promise<Agent>;
  linkPropertyToAgent(agentId: number, propertyId: number): Promise<AgentProperty>;
  calculateAndCreateCommission(bookingId: number): Promise<AgentCommission | null>;
  getAgentCommissions(agentId: number, filters?: { status?: string }): Promise<AgentCommission[]>;
  getAgentDashboardStats(agentId: number): Promise<{
    totalEarnings: number;
    pendingEarnings: number;
    paidEarnings: number;
    totalProperties: number;
    activeProperties: number;
    expiredProperties: number;
    totalCommissions: number;
    recentCommissions: AgentCommission[];
  }>;
  
  // Dellala Portal - Enhanced agent operations
  getAgentPerformance(agentId: number): Promise<AgentPerformance | undefined>;
  createAgentPerformance(agentId: number): Promise<AgentPerformance>;
  getAgentProperties(agentId: number): Promise<Property[]>;
  getAgentWithdrawals(agentId: number, filters?: { status?: string }): Promise<AgentWithdrawal[]>;
  createAgentWithdrawal(withdrawal: InsertAgentWithdrawal): Promise<AgentWithdrawal>;
  getAgentReferrals(agentId: number): Promise<AgentReferral[]>;
  getAgentReferralStats(agentId: number): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: string;
  }>;
  getAgentRatings(agentId: number, filters?: { limit?: number; offset?: number }): Promise<AgentRating[]>;
  processAgentWithdrawal(withdrawalId: number, status: string, processedBy: string, transactionRef?: string): Promise<AgentWithdrawal>;
  updateCommissionStatusToPaid(agentId: number, commissionIds: number[]): Promise<void>;
  processAutoPaymentSplit(bookingId: number): Promise<{
    dellalaAmount: number;
    ownerAmount: number;
    algaFee: number;
    success: boolean;
  }>;
  
  // E-Signature Consent Logs (Ethiopian legal compliance)
  createConsentLog(log: InsertConsentLog): Promise<ConsentLog>;
  getUserConsentLogs(userId: string): Promise<ConsentLog[]>;
  getConsentLogsByEntity(entityType: string, entityId: string): Promise<ConsentLog[]>;
  getAllConsentLogs(filters?: {
    userId?: string;
    action?: string;
    verified?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; logs: ConsentLog[] }>;
  getConsentLogBySignatureId(signatureId: string): Promise<ConsentLog | undefined>;
  
  // Dashboard Access Logs (INSA Compliance - Admin Audit Trail)
  createDashboardAccessLog(log: InsertDashboardAccessLog): Promise<DashboardAccessLog>;
  getDashboardAccessLogs(filters?: {
    adminUserId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<DashboardAccessLog[]>;
  getAdminExportCount(adminUserId: string, since: Date): Promise<number>;
  getAdminDecryptCount(adminUserId: string, since: Date): Promise<number>;
  
  // Integrity Alerts (Signature Tampering Detection)
  getIntegrityAlerts(filters?: {
    resolved?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; alerts: any[] }>;
  acknowledgeIntegrityAlerts(alertIds: string[], adminUserId: string): Promise<void>;
  getUnresolvedAlertsCount(): Promise<number>;
  
  // User Onboarding (100% Free Browser-Native System)
  getOnboardingStatus(userId: string): Promise<any | undefined>;
  trackOnboardingStep(userId: string, step: string, value: boolean): Promise<void>;
  completeOnboarding(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  // Save OTP (expects pre-hashed OTP for security)
  async saveOtp(contact: string, hashedOtp: string, expiryMinutes: number = 5): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
    
    // Check if contact is email or phone number
    const isEmail = contact.includes('@');
    
    await db
      .update(users)
      .set({
        otp: hashedOtp, // Store SHA-256 hash, never plaintext
        otpExpiry: expiryDate,
      })
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));
  }

  // Get OTP hash for password reset verification
  async getOtp(contact: string): Promise<string | null> {
    const isEmail = contact.includes('@');
    
    const [user] = await db
      .select({ otp: users.otp, otpExpiry: users.otpExpiry })
      .from(users)
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));

    if (!user || !user.otp || !user.otpExpiry) return null;
    
    // Check if OTP is expired
    if (new Date() > user.otpExpiry) return null;
    
    return user.otp;
  }

  // Delete OTP after successful password reset
  async deleteOtp(contact: string): Promise<void> {
    const isEmail = contact.includes('@');
    
    await db
      .update(users)
      .set({ otp: null, otpExpiry: null })
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));
  }

  // Update user with partial data (for password reset, etc.)
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }

  // Get stored OTP hash for verification (don't compare here - let caller handle timing-safe comparison)
  async getStoredOTPData(contact: string): Promise<{ hash: string | null; expiry: Date | null } | null> {
    const isEmail = contact.includes('@');
    
    const [user] = await db
      .select({ otp: users.otp, otpExpiry: users.otpExpiry })
      .from(users)
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));

    if (!user) return null;
    return { hash: user.otp, expiry: user.otpExpiry };
  }

  // Legacy verifyOtp - kept for backwards compatibility but uses hash comparison
  async verifyOtp(contact: string, providedOtp: string): Promise<boolean> {
    const isEmail = contact.includes('@');
    
    const [user] = await db
      .select()
      .from(users)
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));

    if (!user || !user.otp || !user.otpExpiry) {
      console.log(`[OTP VERIFY] Failed: no user or OTP data`);
      return false;
    }

    const now = new Date();
    if (now > user.otpExpiry) {
      console.log(`[OTP VERIFY] OTP expired`);
      // Clear expired OTP
      await this.clearOtp(contact);
      return false;
    }

    // Support both hashed and legacy plaintext OTPs during transition
    // SHA-256 hashes are 64 characters hex
    const storedOtp = user.otp;
    let isValid: boolean;
    
    if (storedOtp.length === 64) {
      // Hashed OTP - use timing-safe comparison
      const { createHash } = await import('crypto');
      const providedHash = createHash('sha256').update(providedOtp).digest('hex');
      // Timing-safe comparison
      if (providedHash.length !== storedOtp.length) {
        isValid = false;
      } else {
        let result = 0;
        for (let i = 0; i < providedHash.length; i++) {
          result |= providedHash.charCodeAt(i) ^ storedOtp.charCodeAt(i);
        }
        isValid = result === 0;
      }
    } else {
      // Legacy plaintext OTP (4-6 digits) - for backwards compatibility
      isValid = storedOtp === providedOtp;
    }
    
    console.log(`[OTP VERIFY] Verification ${isValid ? 'successful' : 'failed'}`);
    return isValid;
  }

  // Clear OTP after use or expiration
  async clearOtp(contact: string): Promise<void> {
    const isEmail = contact.includes('@');
    await db
      .update(users)
      .set({ otp: null, otpExpiry: null })
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));
  }

  async markPhoneVerified(phoneNumber: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        phoneVerified: true,
        otp: null,
        otpExpiry: null,
      })
      .where(eq(users.phoneNumber, phoneNumber))
      .returning();
    return user;
  }

  async createUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Property operations
  async getProperties(filters?: {
    city?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    maxGuests?: number;
    checkIn?: Date;
    checkOut?: Date;
    q?: string;
    sort?: string;
  }): Promise<Property[]> {
    const conditions = [eq(properties.isActive, true), eq(properties.status, 'active')];

    if (filters) {
      if (filters.city) {
        conditions.push(ilike(properties.city, `%${filters.city}%`));
      }
      
      if (filters.type) {
        conditions.push(eq(properties.type, filters.type));
      }
      
      if (filters.minPrice) {
        conditions.push(sql`CAST(${properties.pricePerNight} AS NUMERIC) >= ${filters.minPrice}`);
      }
      
      if (filters.maxPrice) {
        conditions.push(sql`CAST(${properties.pricePerNight} AS NUMERIC) <= ${filters.maxPrice}`);
      }
      
      if (filters.maxGuests) {
        conditions.push(gte(properties.maxGuests, filters.maxGuests));
      }

      // Keyword search in title, description, and location
      if (filters.q) {
        conditions.push(
          sql`(
            ${properties.title} ILIKE ${`%${filters.q}%`} OR 
            ${properties.description} ILIKE ${`%${filters.q}%`} OR 
            ${properties.location} ILIKE ${`%${filters.q}%`} OR
            ${properties.address} ILIKE ${`%${filters.q}%`}
          )`
        );
      }
    }
    
    // Determine sort order
    const sortOrder = filters?.sort || 'recommended';
    let orderByClause;
    
    switch (sortOrder) {
      case 'price_asc':
        orderByClause = asc(properties.pricePerNight);
        break;
      case 'price_desc':
        orderByClause = desc(properties.pricePerNight);
        break;
      case 'rating_desc':
        orderByClause = desc(properties.rating);
        break;
      case 'recommended':
      default:
        orderByClause = desc(properties.rating);
        break;
    }

    // Handle date filtering - exclude properties with conflicting confirmed bookings
    if (filters?.checkIn && filters?.checkOut) {
      // Validate date range
      if (filters.checkIn >= filters.checkOut) {
        return []; // Invalid date range, return empty results
      }

      // Use SQL to exclude properties with conflicting confirmed bookings
      const availableProperties = await db
        .select({
          id: properties.id,
          hostId: properties.hostId,
          title: properties.title,
          description: properties.description,
          type: properties.type,
          status: properties.status,
          verifiedBy: properties.verifiedBy,
          verifiedAt: properties.verifiedAt,
          rejectionReason: properties.rejectionReason,
          latitude: properties.latitude,
          longitude: properties.longitude,
          address: properties.address,
          location: properties.location,
          city: properties.city,
          region: properties.region,
          pricePerNight: properties.pricePerNight,
          currency: properties.currency,
          maxGuests: properties.maxGuests,
          bedrooms: properties.bedrooms,
          bathrooms: properties.bathrooms,
          amenities: properties.amenities,
          images: properties.images,
          isActive: properties.isActive,
          rating: properties.rating,
          reviewCount: properties.reviewCount,
          createdAt: properties.createdAt,
          updatedAt: properties.updatedAt,
          lockboxVerified: properties.lockboxVerified,
          cameraVerified: properties.cameraVerified,
          hardwareVerifiedAt: properties.hardwareVerifiedAt,
          hardwareVerificationNotes: properties.hardwareVerificationNotes,
        })
        .from(properties)
        .leftJoin(
          bookings,
          and(
            eq(bookings.propertyId, properties.id),
            eq(bookings.status, 'confirmed'),
            // Check for date overlap: booking checkIn < requested checkOut AND booking checkOut > requested checkIn
            // Use strict inequalities to allow adjacent stays (checkout on same day as next checkin)
            sql`${bookings.checkIn} < ${filters.checkOut}`,
            sql`${bookings.checkOut} > ${filters.checkIn}`
          )
        )
        .where(
          and(
            ...conditions,
            // Only include properties where there's NO conflicting booking (bookings.id is NULL)
            sql`${bookings.id} IS NULL`
          )
        )
        .orderBy(orderByClause)
        .limit(50);

      return availableProperties;
    }

    // No date filter - return all matching properties
    return await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(50);
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db
      .insert(properties)
      .values(property as unknown as typeof properties.$inferInsert)
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() } as unknown as Partial<typeof properties.$inferInsert>)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<void> {
    await db.update(properties).set({ isActive: false }).where(eq(properties.id, id));
  }

  async getPropertiesByHost(hostId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(and(eq(properties.hostId, hostId), eq(properties.isActive, true)))
      .orderBy(desc(properties.createdAt));
  }

  // Booking operations
  async createBooking(booking: InsertBooking): Promise<Booking> {
    // Calculate commission and tax breakdown
    const totalAmount = parseFloat(booking.totalPrice);
    const breakdown = calculateBookingBreakdown(totalAmount);
    
    // Add financial breakdown to booking
    const bookingWithFinancials = {
      ...booking,
      algaCommission: breakdown.algaCommission.toString(),
      vat: breakdown.vatOnCommission.toString(),
      withholding: breakdown.hostWithholding.toString(),
      hostPayout: breakdown.hostNet.toString(),
    };
    
    const [newBooking] = await db
      .insert(bookings)
      .values(bookingWithFinancials as unknown as typeof bookings.$inferInsert)
      .returning();
    return newBooking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  // INSA FIX: Secure booking lookup by non-sequential reference
  async getBookingByReference(reference: string): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.bookingReference, reference));
    return booking;
  }

  async getBookingsByGuest(guestId: string): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.guestId, guestId))
      .orderBy(desc(bookings.createdAt));
  }

  async getAllBookings(): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt));
  }

  async getBookingsByProperty(propertyId: number): Promise<Booking[]> {
    return await db
      .select()
      .from(bookings)
      .where(eq(bookings.propertyId, propertyId))
      .orderBy(desc(bookings.createdAt));
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async updatePaymentStatus(id: number, paymentStatus: string): Promise<Booking> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ paymentStatus, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  // Review operations
  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review as unknown as typeof reviews.$inferInsert)
      .returning();

    // Recalculate property rating using weighted algorithm
    const newRating = await this.recalculatePropertyRating(review.propertyId as number);
    
    return newReview;
  }

  async recalculatePropertyRating(propertyId: number): Promise<number> {
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId));

    if (allReviews.length === 0) {
      await db
        .update(properties)
        .set({
          rating: "0",
          reviewCount: 0,
          updatedAt: new Date()
        })
        .where(eq(properties.id, propertyId));
      return 0;
    }

    const now = new Date();
    let weightedSum = 0;
    let totalWeight = 0;

    allReviews.forEach((review: any) => {
      const createdAt = new Date(review.createdAt);
      const ageDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const weight = 1 / (1 + ageDays / 90);
      weightedSum += review.rating * weight;
      totalWeight += weight;
    });

    const weightedRating = Number((weightedSum / totalWeight).toFixed(2));

    await db
      .update(properties)
      .set({
        rating: weightedRating.toString(),
        reviewCount: allReviews.length,
        updatedAt: new Date()
      })
      .where(eq(properties.id, propertyId));

    return weightedRating;
  }

  async getReviewsByProperty(propertyId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId))
      .orderBy(desc(reviews.createdAt));
  }

  // Favorite operations
  async addToFavorites(favorite: InsertFavorite): Promise<Favorite> {
    const [newFavorite] = await db
      .insert(favorites)
      .values(favorite as unknown as typeof favorites.$inferInsert)
      .onConflictDoNothing()
      .returning();
    return newFavorite;
  }

  async removeFromFavorites(userId: string, propertyId: number): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.propertyId, propertyId)));
  }

  async getUserFavorites(userId: string): Promise<Property[]> {
    return await db
      .select({
        id: properties.id,
        hostId: properties.hostId,
        title: properties.title,
        description: properties.description,
        type: properties.type,
        status: properties.status,
        verifiedBy: properties.verifiedBy,
        verifiedAt: properties.verifiedAt,
        rejectionReason: properties.rejectionReason,
        latitude: properties.latitude,
        longitude: properties.longitude,
        address: properties.address,
        location: properties.location,
        city: properties.city,
        region: properties.region,
        pricePerNight: properties.pricePerNight,
        currency: properties.currency,
        maxGuests: properties.maxGuests,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        amenities: properties.amenities,
        images: properties.images,
        isActive: properties.isActive,
        rating: properties.rating,
        reviewCount: properties.reviewCount,
        createdAt: properties.createdAt,
        updatedAt: properties.updatedAt,
        lockboxVerified: properties.lockboxVerified,
        cameraVerified: properties.cameraVerified,
        hardwareVerifiedAt: properties.hardwareVerifiedAt,
        hardwareVerificationNotes: properties.hardwareVerificationNotes,
      })
      .from(favorites)
      .innerJoin(properties, eq(favorites.propertyId, properties.id))
      .where(and(eq(favorites.userId, userId), eq(properties.isActive, true)));
  }

  // Statistics
  async getPropertyStats(propertyId: number): Promise<{
    totalBookings: number;
    totalRevenue: number;
    averageRating: number;
    reviewCount: number;
  }> {
    const [bookingStats] = await db
      .select({
        totalBookings: sql<number>`COUNT(${bookings.id})`,
        totalRevenue: sql<number>`SUM(${bookings.totalPrice})`
      })
      .from(bookings)
      .where(and(eq(bookings.propertyId, propertyId), eq(bookings.status, 'completed')));

    const [reviewStats] = await db
      .select({
        averageRating: sql<number>`AVG(${reviews.rating})`,
        reviewCount: sql<number>`COUNT(${reviews.id})`
      })
      .from(reviews)
      .where(eq(reviews.propertyId, propertyId));

    return {
      totalBookings: bookingStats.totalBookings || 0,
      totalRevenue: bookingStats.totalRevenue || 0,
      averageRating: reviewStats.averageRating || 0,
      reviewCount: reviewStats.reviewCount || 0,
    };
  }

  async getHostStats(hostId: string): Promise<{
    activeListings: number;
    totalListings: number;
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    totalEarnings: number;
    lastPayout: number | null;
    lastPayoutDate: Date | null;
    avgRating: number;
    totalReviews: number;
    occupancyRate: number;
    pendingReviews: number;
  }> {
    // Get all properties for this host
    const hostProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.hostId, hostId));

    const propertyIds = hostProperties.map(p => p.id);

    // If no properties, return zeros
    if (propertyIds.length === 0) {
      return {
        activeListings: 0,
        totalListings: 0,
        totalBookings: 0,
        upcomingBookings: 0,
        completedBookings: 0,
        totalEarnings: 0,
        lastPayout: null,
        lastPayoutDate: null,
        avgRating: 0,
        totalReviews: 0,
        occupancyRate: 0,
        pendingReviews: 0,
      };
    }

    // Count active and total listings
    const activeListings = hostProperties.filter(p => p.isActive && p.status === 'active').length;
    const totalListings = hostProperties.length;

    // Get booking stats across all properties
    const [bookingStats] = await db
      .select({
        totalBookings: sql<number>`COUNT(${bookings.id})`,
        upcomingBookings: sql<number>`COUNT(*) FILTER (WHERE ${bookings.checkIn} > NOW() AND ${bookings.status} != 'cancelled')`,
        completedBookings: sql<number>`COUNT(*) FILTER (WHERE ${bookings.status} = 'completed')`,
        totalEarnings: sql<number>`COALESCE(SUM(${bookings.hostPayout}), 0)`,
      })
      .from(bookings)
      .where(inArray(bookings.propertyId, propertyIds));

    // Get last payout info
    const lastCompletedBooking = await db
      .select({
        payout: bookings.hostPayout,
        date: bookings.updatedAt,
      })
      .from(bookings)
      .where(and(
        inArray(bookings.propertyId, propertyIds),
        eq(bookings.status, 'completed'),
        sql`${bookings.hostPayout} IS NOT NULL`
      ))
      .orderBy(desc(bookings.updatedAt))
      .limit(1);

    // Get review stats across all properties
    const [reviewStats] = await db
      .select({
        avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`,
        totalReviews: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .where(inArray(reviews.propertyId, propertyIds));

    // Count pending reviews (completed bookings without reviews)
    const [pendingReviewsCount] = await db
      .select({
        count: sql<number>`COUNT(${bookings.id})`,
      })
      .from(bookings)
      .leftJoin(reviews, eq(bookings.id, reviews.bookingId))
      .where(and(
        inArray(bookings.propertyId, propertyIds),
        eq(bookings.status, 'completed'),
        sql`${reviews.id} IS NULL`
      ));

    // Calculate occupancy rate (simplified: completed bookings / total days available)
    // For now, use a simple metric: completed bookings vs total bookings
    const occupancyRate = bookingStats.totalBookings > 0
      ? Math.round((bookingStats.completedBookings / bookingStats.totalBookings) * 100)
      : 0;

    return {
      activeListings,
      totalListings,
      totalBookings: bookingStats.totalBookings || 0,
      upcomingBookings: bookingStats.upcomingBookings || 0,
      completedBookings: bookingStats.completedBookings || 0,
      totalEarnings: parseFloat(String(bookingStats.totalEarnings || 0)),
      lastPayout: lastCompletedBooking[0] ? parseFloat(String(lastCompletedBooking[0].payout)) : null,
      lastPayoutDate: lastCompletedBooking[0]?.date || null,
      avgRating: parseFloat(String(reviewStats.avgRating || 0)),
      totalReviews: reviewStats.totalReviews || 0,
      occupancyRate,
      pendingReviews: pendingReviewsCount.count || 0,
    };
  }

  // Admin user management
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  async updateUserStatus(userId: string, status: string): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser;
  }

  // Verification document operations
  async createVerificationDocument(document: any): Promise<any> {
    const [newDocument] = await db
      .insert(verificationDocuments)
      .values(document as unknown as typeof verificationDocuments.$inferInsert)
      .returning();
    return newDocument;
  }

  async getVerificationDocumentsByUser(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(verificationDocuments)
      .where(eq(verificationDocuments.userId, userId))
      .orderBy(desc(verificationDocuments.createdAt));
  }

  async getAllVerificationDocuments(): Promise<any[]> {
    // Get all verification documents first
    const docs = await db
      .select()
      .from(verificationDocuments)
      .orderBy(desc(verificationDocuments.createdAt));
    
    // Manually fetch user data for each document
    const docsWithUsers = await Promise.all(
      docs.map(async (doc) => {
        const user = await this.getUser(doc.userId);
        return {
          ...doc,
          user: user ? {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber,
            idNumber: user.idNumber,
            idFullName: user.idFullName,
            idDocumentType: user.idDocumentType,
            idDocumentUrl: user.idDocumentUrl,
            idExpiryDate: user.idExpiryDate,
            idCountry: user.idCountry,
          } : undefined
        };
      })
    );
    
    return docsWithUsers;
  }

  async getPendingVerificationDocuments(): Promise<any[]> {
    return await db
      .select({
        id: verificationDocuments.id,
        userId: verificationDocuments.userId,
        documentType: verificationDocuments.documentType,
        documentUrl: verificationDocuments.documentUrl,
        status: verificationDocuments.status,
        createdAt: verificationDocuments.createdAt,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phoneNumber: users.phoneNumber
        }
      })
      .from(verificationDocuments)
      .leftJoin(users, eq(verificationDocuments.userId, users.id))
      .where(eq(verificationDocuments.status, 'pending'))
      .orderBy(desc(verificationDocuments.createdAt));
  }

  async verifyDocument(documentId: number, status: string, verifierId: string, rejectionReason?: string): Promise<any> {
    const [updatedDocument] = await db
      .update(verificationDocuments)
      .set({
        status,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason || null,
        updatedAt: new Date()
      })
      .where(eq(verificationDocuments.id, documentId))
      .returning();
    return updatedDocument;
  }

  // Admin property operations
  async getAllPropertiesForVerification(): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .orderBy(desc(properties.createdAt));
  }

  async getPendingProperties(): Promise<any[]> {
    return await db
      .select({
        id: properties.id,
        hostId: properties.hostId,
        title: properties.title,
        description: properties.description,
        type: properties.type,
        status: properties.status,
        location: properties.location,
        city: properties.city,
        region: properties.region,
        pricePerNight: properties.pricePerNight,
        maxGuests: properties.maxGuests,
        bedrooms: properties.bedrooms,
        bathrooms: properties.bathrooms,
        images: properties.images,
        createdAt: properties.createdAt,
        host: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          phoneNumber: users.phoneNumber
        }
      })
      .from(properties)
      .leftJoin(users, eq(properties.hostId, users.id))
      .where(eq(properties.status, 'pending'))
      .orderBy(desc(properties.createdAt));
  }

  async verifyProperty(propertyId: number, status: string, verifierId: string, rejectionReason?: string): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({
        status,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason || null,
        updatedAt: new Date()
      })
      .where(eq(properties.id, propertyId))
      .returning();
    return updatedProperty;
  }

  async getAdminStats(): Promise<{
    totalUsers: number;
    newUsersThisMonth: number;
    activeProperties: number;
    pendingProperties: number;
    pendingDocuments: number;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [userStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        newThisMonth: sql<number>`COUNT(*) FILTER (WHERE ${users.createdAt} >= ${startOfMonth})`
      })
      .from(users);

    const [propertyStats] = await db
      .select({
        active: sql<number>`COUNT(*) FILTER (WHERE ${properties.status} = 'active')`,
        pending: sql<number>`COUNT(*) FILTER (WHERE ${properties.status} = 'pending')`
      })
      .from(properties);

    const [documentStats] = await db
      .select({
        pending: sql<number>`COUNT(*)`
      })
      .from(verificationDocuments)
      .where(eq(verificationDocuments.status, 'pending'));

    const [revenueStats] = await db
      .select({
        total: sql<number>`COALESCE(SUM(${bookings.totalPrice}), 0)`,
        monthly: sql<number>`COALESCE(SUM(${bookings.totalPrice}) FILTER (WHERE ${bookings.createdAt} >= ${startOfMonth}), 0)`
      })
      .from(bookings)
      .where(eq(bookings.paymentStatus, 'paid'));

    return {
      totalUsers: userStats.total || 0,
      newUsersThisMonth: userStats.newThisMonth || 0,
      activeProperties: propertyStats.active || 0,
      pendingProperties: propertyStats.pending || 0,
      pendingDocuments: documentStats.pending || 0,
      totalRevenue: revenueStats.total || 0,
      monthlyRevenue: revenueStats.monthly || 0,
    };
  }

  // Access code operations
  async createAccessCode(accessCode: InsertAccessCode): Promise<AccessCode> {
    const [newAccessCode] = await db
      .insert(accessCodes)
      .values(accessCode as unknown as typeof accessCodes.$inferInsert)
      .returning();
    return newAccessCode;
  }

  async getAccessCodeByBookingId(bookingId: number): Promise<AccessCode | undefined> {
    const [accessCode] = await db
      .select()
      .from(accessCodes)
      .where(eq(accessCodes.bookingId, bookingId))
      .orderBy(desc(accessCodes.createdAt))
      .limit(1);
    return accessCode;
  }

  async getAccessCodesByGuestId(guestId: string): Promise<AccessCode[]> {
    return await db
      .select()
      .from(accessCodes)
      .where(eq(accessCodes.guestId, guestId))
      .orderBy(desc(accessCodes.createdAt));
  }

  async expireOldAccessCodes(): Promise<void> {
    // Access codes expire naturally - no update needed
  }

  // ==================== ALGA SECURE ACCESS OPERATIONS ====================
  
  // Lockbox operations
  async createLockbox(lockbox: InsertLockbox): Promise<Lockbox> {
    const [newLockbox] = await db
      .insert(lockboxes)
      .values(lockbox as unknown as typeof lockboxes.$inferInsert)
      .returning();
    return newLockbox;
  }

  async getLockboxByPropertyId(propertyId: number): Promise<Lockbox | undefined> {
    const [lockbox] = await db
      .select()
      .from(lockboxes)
      .where(eq(lockboxes.propertyId, propertyId));
    return lockbox;
  }

  async updateLockbox(id: number, updates: Partial<InsertLockbox>): Promise<Lockbox> {
    const [updated] = await db
      .update(lockboxes)
      .set({ ...updates } as unknown as Partial<typeof lockboxes.$inferInsert>)
      .where(eq(lockboxes.id, id))
      .returning();
    return updated;
  }

  async verifyLockbox(id: number, verifiedBy: string, status: string, rejectionReason?: string): Promise<Lockbox> {
    const [verified] = await db
      .update(lockboxes)
      .set({ })
      .where(eq(lockboxes.id, id))
      .returning();
    return verified;
  }

  async getAllPendingLockboxes(): Promise<Lockbox[]> {
    return await db
      .select()
      .from(lockboxes)
      .orderBy(desc(lockboxes.createdAt));
  }

  // Security camera operations
  async createSecurityCamera(camera: InsertSecurityCamera): Promise<SecurityCamera> {
    const [newCamera] = await db
      .insert(securityCameras)
      .values(camera as unknown as typeof securityCameras.$inferInsert)
      .returning();
    return newCamera;
  }

  async getSecurityCamerasByPropertyId(propertyId: number): Promise<SecurityCamera[]> {
    return await db
      .select()
      .from(securityCameras)
      .where(eq(securityCameras.propertyId, propertyId))
      .orderBy(desc(securityCameras.createdAt));
  }

  async updateSecurityCamera(id: number, updates: Partial<InsertSecurityCamera>): Promise<SecurityCamera> {
    const [updated] = await db
      .update(securityCameras)
      .set({ ...updates } as unknown as Partial<typeof securityCameras.$inferInsert>)
      .where(eq(securityCameras.id, id))
      .returning();
    return updated;
  }

  async verifySecurityCamera(id: number, verifiedBy: string, status: string, rejectionReason?: string): Promise<SecurityCamera> {
    const [verified] = await db
      .update(securityCameras)
      .set({ })
      .where(eq(securityCameras.id, id))
      .returning();
    return verified;
  }

  async getAllPendingSecurityCameras(): Promise<SecurityCamera[]> {
    return await db
      .select()
      .from(securityCameras)
      .orderBy(desc(securityCameras.createdAt));
  }

  // Property hardware verification
  async updatePropertyHardwareStatus(propertyId: number, lockboxVerified: boolean, cameraVerified: boolean): Promise<Property> {
    const [updated] = await db
      .update(properties)
      .set({ })
      .where(eq(properties.id, propertyId))
      .returning();
    return updated;
  }

  async getPropertiesWithoutHardware(): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(
        and(
          eq(properties.status, "active"),
          sql`(${properties.lockboxVerified} = false OR ${properties.cameraVerified} = false)`
        )
      )
      .orderBy(desc(properties.createdAt));
  }

  // Service provider operations
  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [newProvider] = await db
      .insert(serviceProviders)
      .values(provider as unknown as typeof serviceProviders.$inferInsert)
      .returning();
    
    return newProvider;
  }

  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> {
    const [provider] = await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.id, id));
    return provider;
  }

  async getServiceProvidersByUser(userId: string): Promise<ServiceProvider[]> {
    return await db
      .select()
      .from(serviceProviders)
      .where(eq(serviceProviders.userId, userId))
      .orderBy(desc(serviceProviders.createdAt));
  }

  async getAllServiceProviders(filters?: {
    city?: string;
    serviceType?: string;
    verificationStatus?: string;
  }): Promise<ServiceProvider[]> {
    const conditions = [eq(serviceProviders.isActive, true)];
    
    if (filters?.city) {
      conditions.push(eq(serviceProviders.city, filters.city));
    }
    if (filters?.serviceType) {
      conditions.push(eq(serviceProviders.serviceType, filters.serviceType));
    }
    if (filters?.verificationStatus) {
      conditions.push(eq(serviceProviders.verificationStatus, filters.verificationStatus));
    }
    
    return await db
      .select()
      .from(serviceProviders)
      .where(and(...conditions))
      .orderBy(desc(serviceProviders.rating), desc(serviceProviders.totalJobsCompleted));
  }

  async updateServiceProvider(id: number, updates: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({ ...updates })
      .where(eq(serviceProviders.id, id))
      .returning();
    return updatedProvider;
  }

  async verifyServiceProvider(providerId: number, status: string, verifierId: string, rejectionReason?: string): Promise<ServiceProvider> {
    const [updatedProvider] = await db
      .update(serviceProviders)
      .set({ })
      .where(eq(serviceProviders.id, providerId))
      .returning();
    return updatedProvider;
  }

  async updateServiceProviderRating(providerId: number): Promise<void> {
    // Rating update handled separately
  }

  // Service booking operations
  async createServiceBooking(booking: InsertServiceBooking): Promise<ServiceBooking> {
    const [newBooking] = await db
      .insert(serviceBookings)
      .values(booking as unknown as typeof serviceBookings.$inferInsert)
      .returning();
    return newBooking;
  }

  async getServiceBooking(id: number): Promise<ServiceBooking | undefined> {
    const [booking] = await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.id, id));
    return booking;
  }

  async getServiceBookingsByGuest(guestId: string): Promise<ServiceBooking[]> {
    return await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.guestId, guestId))
      .orderBy(desc(serviceBookings.createdAt));
  }

  async getServiceBookingsByHost(hostId: string): Promise<ServiceBooking[]> {
    return await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.hostId, hostId))
      .orderBy(desc(serviceBookings.createdAt));
  }

  async getServiceBookingsByProvider(providerId: number): Promise<ServiceBooking[]> {
    return await db
      .select()
      .from(serviceBookings)
      .where(eq(serviceBookings.serviceProviderId, providerId))
      .orderBy(desc(serviceBookings.createdAt));
  }

  async updateServiceBookingStatus(id: number, status: string): Promise<ServiceBooking> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ })
      .where(eq(serviceBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async updateServiceBookingPayment(id: number, paymentStatus: string, paymentRef?: string): Promise<ServiceBooking> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ 
        paymentStatus, 
        paymentRef: paymentRef || null,
        updatedAt: new Date() 
      })
      .where(eq(serviceBookings.id, id))
      .returning();
    return updatedBooking;
  }

  async completeServiceBooking(id: number): Promise<ServiceBooking> {
    const [updatedBooking] = await db
      .update(serviceBookings)
      .set({ 
        status: 'completed',
        payoutStatus: 'processing',
        updatedAt: new Date() 
      })
      .where(eq(serviceBookings.id, id))
      .returning();
    
    if (updatedBooking) {
      await this.updateServiceProviderRating(updatedBooking.serviceProviderId);
    }
    
    return updatedBooking;
  }

  // Service review operations
  async createServiceReview(review: InsertServiceReview): Promise<ServiceReview> {
    const [newReview] = await db
      .insert(serviceReviews)
      .values(review as unknown as typeof serviceReviews.$inferInsert)
      .returning();
    
    // Update provider rating after new review
    await this.updateServiceProviderRating(review.serviceProviderId as number);
    
    return newReview;
  }

  async getServiceReviewsByProvider(providerId: number): Promise<ServiceReview[]> {
    return await db
      .select()
      .from(serviceReviews)
      .where(eq(serviceReviews.serviceProviderId, providerId))
      .orderBy(desc(serviceReviews.createdAt));
  }

  async getServiceReviewByBooking(bookingId: number): Promise<ServiceReview | undefined> {
    const [review] = await db
      .select()
      .from(serviceReviews)
      .where(eq(serviceReviews.serviceBookingId, bookingId));
    return review;
  }

  // ==================== AGENT (DELALA) OPERATIONS ====================
  
  async createAgent(agent: InsertAgent): Promise<Agent> {
    // Generate unique referral code
    const referralCode = `AGENT${Date.now().toString(36).toUpperCase()}`;
    
    const [newAgent] = await db
      .insert(agents)
      .values({ ...agent, referralCode } as unknown as typeof agents.$inferInsert)
      .returning();
    
    return newAgent;
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async getAgentByUserId(userId: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.userId, userId));
    return agent;
  }

  async getAgentByPhone(phoneNumber: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.phoneNumber, phoneNumber));
    return agent;
  }

  async getAllAgents(filters?: { status?: string; city?: string }): Promise<Agent[]> {
    let query = db.select().from(agents);
    const conditions = [];
    
    if (filters?.status) {
      conditions.push(eq(agents.status, filters.status));
    }
    if (filters?.city) {
      conditions.push(eq(agents.city, filters.city));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const results = await query.orderBy(desc(agents.createdAt));
    return results;
  }

  async verifyAgent(
    agentId: number,
    status: string,
    verifierId: string,
    rejectionReason?: string
  ): Promise<Agent> {
    const [agent] = await db
      .update(agents)
      .set({
        status,
        verifiedBy: verifierId,
        verifiedAt: new Date(),
        rejectionReason: rejectionReason || null,
      })
      .where(eq(agents.id, agentId))
      .returning();
    
    return agent;
  }

  async linkPropertyToAgent(agentId: number, propertyId: number): Promise<AgentProperty> {
    // Check if property already linked
    const [existing] = await db
      .select()
      .from(agentProperties)
      .where(eq(agentProperties.propertyId, propertyId));
    
    if (existing) {
      throw new Error('Property already linked to an agent');
    }
    
    const [agentProperty] = await db
      .insert(agentProperties)
      .values({
        agentId,
        propertyId,
        isActive: true,
      })
      .returning();
    
    // Update agent's property count
    await db
      .update(agents)
      .set({
        totalProperties: sql`${agents.totalProperties} + 1`,
        activeProperties: sql`${agents.activeProperties} + 1`,
      })
      .where(eq(agents.id, agentId));
    
    return agentProperty;
  }

  async calculateAndCreateCommission(bookingId: number): Promise<AgentCommission | null> {
    // Get booking details
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));
    
    if (!booking || booking.status !== 'completed') {
      return null;
    }
    
    // Check if property has an agent
    const [agentProperty] = await db
      .select()
      .from(agentProperties)
      .where(eq(agentProperties.propertyId, booking.propertyId));
    
    if (!agentProperty || !agentProperty.isActive) {
      return null;
    }
    
    // If this is the first booking, set the commission start date
    if (!agentProperty.firstBookingDate) {
      const commissionExpiryDate = new Date();
      commissionExpiryDate.setMonth(commissionExpiryDate.getMonth() + 36); // 36 months = 3 years
      
      await db
        .update(agentProperties)
        .set({
          firstBookingDate: new Date(),
          commissionExpiryDate,
        })
        .where(eq(agentProperties.id, agentProperty.id));
    }
    
    // Check if commission period has expired (36 months from first booking)
    const [updatedAgentProperty] = await db
      .select()
      .from(agentProperties)
      .where(eq(agentProperties.id, agentProperty.id));
    
    if (updatedAgentProperty.commissionExpiryDate && new Date() > updatedAgentProperty.commissionExpiryDate) {
      // Commission period expired - mark as inactive
      await db
        .update(agentProperties)
        .set({ isActive: false })
        .where(eq(agentProperties.id, agentProperty.id));
      
      return null;
    }
    
    // Check if commission already exists for this booking
    const [existing] = await db
      .select()
      .from(agentCommissions)
      .where(eq(agentCommissions.bookingId, bookingId));
    
    if (existing) {
      return existing;
    }
    
    // Calculate 5% commission
    const bookingTotal = parseFloat(booking.totalPrice);
    const commissionRate = 5.00; // 5%
    const commissionAmount = (bookingTotal * commissionRate) / 100;
    
    // Create commission record
    const [commission] = await db
      .insert(agentCommissions)
      .values({
        agentId: agentProperty.agentId,
        propertyId: booking.propertyId,
        bookingId: booking.id,
        bookingTotal: booking.totalPrice,
        commissionRate: commissionRate.toString(),
        commissionAmount: commissionAmount.toFixed(2),
        status: 'pending',
      })
      .returning();
    
    // Update agent property totals
    await db
      .update(agentProperties)
      .set({
        totalBookings: sql`${agentProperties.totalBookings} + 1`,
        totalCommissionEarned: sql`${agentProperties.totalCommissionEarned} + ${commissionAmount}`,
      })
      .where(eq(agentProperties.id, agentProperty.id));
    
    // Update agent total earnings
    await db
      .update(agents)
      .set({
        totalEarnings: sql`${agents.totalEarnings} + ${commissionAmount}`,
      })
      .where(eq(agents.id, agentProperty.agentId));
    
    // Update agent_performance table for Dellala dashboard
    const performance = await this.getAgentPerformance(agentProperty.agentId);
    if (performance) {
      await db
        .update(agentPerformance)
        .set({
          totalCommissionEarned: sql`${agentPerformance.totalCommissionEarned} + ${commissionAmount}`,
          totalCommissionPending: sql`${agentPerformance.totalCommissionPending} + ${commissionAmount}`,
          availableBalance: sql`${agentPerformance.availableBalance} + ${commissionAmount}`,
          totalBookings: sql`${agentPerformance.totalBookings} + 1`,
          totalPropertiesListed: sql`GREATEST(${agentPerformance.totalPropertiesListed}, (
            SELECT COUNT(DISTINCT property_id) 
            FROM agent_properties 
            WHERE agent_id = ${agentProperty.agentId}
          ))`,
          updatedAt: new Date(),
        })
        .where(eq(agentPerformance.agentId, agentProperty.agentId));
    } else {
      // Create performance record if it doesn't exist
      await this.createAgentPerformance(agentProperty.agentId);
      await db
        .update(agentPerformance)
        .set({
          totalCommissionEarned: commissionAmount.toFixed(2),
          totalCommissionPending: commissionAmount.toFixed(2),
          availableBalance: commissionAmount.toFixed(2),
          totalBookings: 1,
        })
        .where(eq(agentPerformance.agentId, agentProperty.agentId));
    }
    
    return commission;
  }

  async getAgentCommissions(
    agentId: number,
    filters?: { status?: string }
  ): Promise<AgentCommission[]> {
    const conditions = [eq(agentCommissions.agentId, agentId)];
    
    if (filters?.status) {
      conditions.push(eq(agentCommissions.status, filters.status));
    }
    
    const results = await db
      .select()
      .from(agentCommissions)
      .where(and(...conditions))
      .orderBy(desc(agentCommissions.createdAt));
    
    return results;
  }

  async getAgentDashboardStats(agentId: number) {
    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // Get all agent properties
    const agentProps = await db
      .select()
      .from(agentProperties)
      .where(eq(agentProperties.agentId, agentId));
    
    const activeProps = agentProps.filter(ap => ap.isActive);
    const expiredProps = agentProps.filter(ap => !ap.isActive);
    
    // Get all commissions
    const allCommissions = await db
      .select()
      .from(agentCommissions)
      .where(eq(agentCommissions.agentId, agentId))
      .orderBy(desc(agentCommissions.createdAt));
    
    const pendingCommissions = allCommissions.filter(c => c.status === 'pending');
    const paidCommissions = allCommissions.filter(c => c.status === 'paid');
    
    const pendingEarnings = pendingCommissions.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount),
      0
    );
    
    const paidEarnings = paidCommissions.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount),
      0
    );
    
    return {
      totalEarnings: parseFloat(agent.totalEarnings || '0'),
      pendingEarnings,
      paidEarnings,
      totalProperties: agent.totalProperties || 0,
      activeProperties: activeProps.length,
      expiredProperties: expiredProps.length,
      totalCommissions: allCommissions.length,
      recentCommissions: allCommissions.slice(0, 10),
    };
  }

  // Dellala Portal - Enhanced agent operations
  async getAgentPerformance(agentId: number): Promise<AgentPerformance | undefined> {
    const [performance] = await db
      .select()
      .from(agentPerformance)
      .where(eq(agentPerformance.agentId, agentId));
    return performance;
  }

  async createAgentPerformance(agentId: number): Promise<AgentPerformance> {
    const [performance] = await db
      .insert(agentPerformance)
      .values({
        agentId,
        totalCommissionEarned: "0",
        totalCommissionPending: "0",
        availableBalance: "0",
        totalWithdrawn: "0",
        totalReferrals: 0,
        successfulReferrals: 0,
        totalRatings: 0,
        averageRating: "0",
        totalPropertiesListed: 0,
        activeProperties: 0,
        totalBookings: 0,
      })
      .returning();
    return performance;
  }

  async getAgentProperties(agentId: number): Promise<Property[]> {
    const agentProps = await db
      .select()
      .from(agentProperties)
      .where(eq(agentProperties.agentId, agentId));

    if (agentProps.length === 0) {
      return [];
    }

    const propertyIds = agentProps.map(ap => ap.propertyId);
    const props = await db
      .select()
      .from(properties)
      .where(inArray(properties.id, propertyIds));

    return props;
  }

  async getAgentWithdrawals(
    agentId: number,
    filters?: { status?: string }
  ): Promise<AgentWithdrawal[]> {
    const conditions = [eq(agentWithdrawals.agentId, agentId)];

    if (filters?.status) {
      conditions.push(eq(agentWithdrawals.status, filters.status));
    }

    const results = await db
      .select()
      .from(agentWithdrawals)
      .where(and(...conditions))
      .orderBy(desc(agentWithdrawals.createdAt));

    return results;
  }

  async createAgentWithdrawal(withdrawal: InsertAgentWithdrawal): Promise<AgentWithdrawal> {
    const agentId = withdrawal.agentId as number;
    const amount = withdrawal.amount as string;

    const pendingWithdrawals = await db
      .select()
      .from(agentWithdrawals)
      .where(
        and(
          eq(agentWithdrawals.agentId, agentId),
          eq(agentWithdrawals.status, 'pending')
        )
      );

    if (pendingWithdrawals.length > 0) {
      throw new Error('You already have a pending withdrawal request. Please wait for it to be processed.');
    }

    const performance = await this.getAgentPerformance(agentId);
    if (!performance) {
      throw new Error('Agent performance record not found');
    }

    const availableBalance = parseFloat(performance.availableBalance || '0');
    const withdrawAmount = parseFloat(amount);

    if (withdrawAmount > availableBalance) {
      throw new Error(`Insufficient balance. Available: ${availableBalance} ETB`);
    }

    const [newWithdrawal] = await db
      .insert(agentWithdrawals)
      .values(withdrawal as unknown as typeof agentWithdrawals.$inferInsert)
      .returning();

    return newWithdrawal;
  }

  async getAgentReferrals(agentId: number): Promise<AgentReferral[]> {
    const results = await db
      .select()
      .from(agentReferrals)
      .where(eq(agentReferrals.referrerId, agentId))
      .orderBy(desc(agentReferrals.createdAt));

    return results;
  }

  async getAgentReferralStats(agentId: number): Promise<{
    totalReferrals: number;
    activeReferrals: number;
    totalEarned: string;
  }> {
    const referrals = await db
      .select()
      .from(agentReferrals)
      .where(eq(agentReferrals.referrerId, agentId));

    const activeReferrals = referrals.filter(r => r.status === 'converted');
    
    const totalEarned = referrals.reduce(
      (sum, r) => sum + parseFloat(r.bonusAmount || '0'),
      0
    );

    return {
      totalReferrals: referrals.length,
      activeReferrals: activeReferrals.length,
      totalEarned: totalEarned.toFixed(2),
    };
  }

  async getAgentRatings(
    agentId: number,
    filters?: { limit?: number; offset?: number }
  ): Promise<AgentRating[]> {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const results = await db
      .select()
      .from(agentRatings)
      .where(eq(agentRatings.agentId, agentId))
      .orderBy(desc(agentRatings.createdAt))
      .limit(limit)
      .offset(offset);

    return results;
  }

  async processAgentWithdrawal(
    withdrawalId: number,
    status: string,
    processedBy: string,
    transactionRef?: string
  ): Promise<AgentWithdrawal> {
    const [withdrawal] = await db
      .select()
      .from(agentWithdrawals)
      .where(eq(agentWithdrawals.id, withdrawalId));

    if (!withdrawal) {
      throw new Error('Withdrawal request not found');
    }

    if (withdrawal.status !== 'pending') {
      throw new Error('Withdrawal has already been processed');
    }

    const withdrawAmount = parseFloat(withdrawal.amount);

    if (status === 'approved') {
      // Update withdrawal record
      const [updatedWithdrawal] = await db
        .update(agentWithdrawals)
        .set({
          status: 'approved',
          processedBy,
          processedAt: new Date(),
          transactionId: transactionRef || null,
        })
        .where(eq(agentWithdrawals.id, withdrawalId))
        .returning();

      // Update agent_performance balances
      await db
        .update(agentPerformance)
        .set({
          availableBalance: sql`${agentPerformance.availableBalance} - ${withdrawAmount}`,
          totalWithdrawn: sql`${agentPerformance.totalWithdrawn} + ${withdrawAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(agentPerformance.agentId, withdrawal.agentId));

      return updatedWithdrawal;
    } else {
      // Rejection - just update status
      const [updatedWithdrawal] = await db
        .update(agentWithdrawals)
        .set({
          status: 'rejected',
          processedBy,
          processedAt: new Date(),
        })
        .where(eq(agentWithdrawals.id, withdrawalId))
        .returning();

      return updatedWithdrawal;
    }
  }

  async updateCommissionStatusToPaid(agentId: number, commissionIds: number[]): Promise<void> {
    if (commissionIds.length === 0) return;

    // Get total commission amount being paid
    const commissions = await db
      .select()
      .from(agentCommissions)
      .where(
        and(
          eq(agentCommissions.agentId, agentId),
          inArray(agentCommissions.id, commissionIds),
          eq(agentCommissions.status, 'pending')
        )
      );

    const totalPaidAmount = commissions.reduce(
      (sum, c) => sum + parseFloat(c.commissionAmount),
      0
    );

    // Update commission status to paid
    await db
      .update(agentCommissions)
      .set({
        status: 'paid',
        paidAt: new Date(),
      })
      .where(
        and(
          eq(agentCommissions.agentId, agentId),
          inArray(agentCommissions.id, commissionIds)
        )
      );

    // Update agent_performance to reflect paid commissions
    await db
      .update(agentPerformance)
      .set({
        totalCommissionPending: sql`${agentPerformance.totalCommissionPending} - ${totalPaidAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(agentPerformance.agentId, agentId));
  }

  async processAutoPaymentSplit(bookingId: number): Promise<{
    dellalaAmount: number;
    ownerAmount: number;
    algaFee: number;
    success: boolean;
  }> {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId));

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.paymentStatus !== 'paid') {
      throw new Error('Payment must be confirmed before split processing');
    }

    const totalAmount = parseFloat(booking.totalPrice);
    
    const DELLALA_COMMISSION_RATE = 5.0;
    const ALGA_SERVICE_FEE_RATE = 2.5;

    const dellalaAmount = (totalAmount * DELLALA_COMMISSION_RATE) / 100;
    const algaFee = (totalAmount * ALGA_SERVICE_FEE_RATE) / 100;
    const ownerAmount = totalAmount - dellalaAmount - algaFee;

    const [agentProperty] = await db
      .select()
      .from(agentProperties)
      .where(eq(agentProperties.propertyId, booking.propertyId));

    if (agentProperty && agentProperty.isActive) {
      const [existingCommission] = await db
        .select()
        .from(agentCommissions)
        .where(eq(agentCommissions.bookingId, bookingId));

      if (!existingCommission) {
        await db
          .insert(agentCommissions)
          .values({
            agentId: agentProperty.agentId,
            propertyId: booking.propertyId,
            bookingId: booking.id,
            bookingTotal: booking.totalPrice,
            commissionRate: DELLALA_COMMISSION_RATE.toString(),
            commissionAmount: dellalaAmount.toFixed(2),
            status: 'paid',
            paidAt: new Date(),
          });

        const performance = await this.getAgentPerformance(agentProperty.agentId);
        if (performance) {
          await db
            .update(agentPerformance)
            .set({
              totalCommissionEarned: sql`${agentPerformance.totalCommissionEarned} + ${dellalaAmount}`,
              availableBalance: sql`${agentPerformance.availableBalance} + ${dellalaAmount}`,
              totalBookings: sql`${agentPerformance.totalBookings} + 1`,
              updatedAt: new Date(),
            })
            .where(eq(agentPerformance.agentId, agentProperty.agentId));
        } else {
          await this.createAgentPerformance(agentProperty.agentId);
          await db
            .update(agentPerformance)
            .set({
              totalCommissionEarned: dellalaAmount.toFixed(2),
              availableBalance: dellalaAmount.toFixed(2),
              totalBookings: 1,
            })
            .where(eq(agentPerformance.agentId, agentProperty.agentId));
        }

        await db
          .update(agents)
          .set({
            totalEarnings: sql`${agents.totalEarnings} + ${dellalaAmount}`,
          })
          .where(eq(agents.id, agentProperty.agentId));

        console.log(`💰 AUTO SPLIT-PAYMENT: Booking #${bookingId}`);
        console.log(`   → Dellala: ${dellalaAmount.toFixed(2)} ETB (5%)`);
        console.log(`   → Owner: ${ownerAmount.toFixed(2)} ETB (92.5%)`);
        console.log(`   → Alga: ${algaFee.toFixed(2)} ETB (2.5%)`);
      }
    } else {
      console.log(`💰 AUTO SPLIT-PAYMENT: Booking #${bookingId} (No agent)`);
      console.log(`   → Owner: ${(totalAmount - algaFee).toFixed(2)} ETB (97.5%)`);
      console.log(`   → Alga: ${algaFee.toFixed(2)} ETB (2.5%)`);
    }

    return {
      dellalaAmount: agentProperty && agentProperty.isActive ? dellalaAmount : 0,
      ownerAmount: agentProperty && agentProperty.isActive ? ownerAmount : (totalAmount - algaFee),
      algaFee,
      success: true,
    };
  }
  
  // E-Signature Consent Logs (Ethiopian legal compliance)
  async createConsentLog(log: InsertConsentLog): Promise<ConsentLog> {
    const [record] = await db
      .insert(consentLogs)
      .values(log as typeof consentLogs.$inferInsert)
      .returning();
    return record;
  }
  
  async getUserConsentLogs(userId: string): Promise<ConsentLog[]> {
    return await db
      .select()
      .from(consentLogs)
      .where(eq(consentLogs.userId, userId))
      .orderBy(desc(consentLogs.createdAt));
  }
  
  async getConsentLogsByEntity(entityType: string, entityId: string): Promise<ConsentLog[]> {
    return await db
      .select()
      .from(consentLogs)
      .where(
        and(
          eq(consentLogs.relatedEntityType, entityType),
          eq(consentLogs.relatedEntityId, entityId)
        )
      )
      .orderBy(desc(consentLogs.createdAt));
  }
  
  async getAllConsentLogs(filters: {
    userId?: string;
    action?: string;
    verified?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ total: number; logs: ConsentLog[] }> {
    const { userId, action, verified, startDate, endDate, limit = 50, offset = 0 } = filters;
    
    const conditions = [];
    
    if (userId) {
      conditions.push(eq(consentLogs.userId, userId));
    }
    
    if (action) {
      conditions.push(eq(consentLogs.action, action));
    }
    
    if (verified !== undefined) {
      conditions.push(eq(consentLogs.verified, verified));
    }
    
    if (startDate) {
      conditions.push(gte(consentLogs.timestamp, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(consentLogs.timestamp, endDate));
    }
    
    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(consentLogs);
    
    if (conditions.length > 0) {
      countQuery.where(and(...conditions));
    }
    
    const countResults = await countQuery;
    const total = Number(countResults[0]?.count || 0);
    
    // Get paginated logs
    const logsQuery = db
      .select()
      .from(consentLogs)
      .orderBy(desc(consentLogs.createdAt))
      .limit(limit)
      .offset(offset);
    
    if (conditions.length > 0) {
      logsQuery.where(and(...conditions));
    }
    
    const logs = await logsQuery;
    
    return { total, logs };
  }
  
  async getConsentLogBySignatureId(signatureId: string): Promise<ConsentLog | undefined> {
    const [log] = await db
      .select()
      .from(consentLogs)
      .where(eq(consentLogs.signatureId, signatureId));
    
    return log;
  }
  
  // Dashboard Access Logs (INSA Compliance - Admin Audit Trail)
  async createDashboardAccessLog(log: InsertDashboardAccessLog): Promise<DashboardAccessLog> {
    const [record] = await db
      .insert(dashboardAccessLogs)
      .values(log as typeof dashboardAccessLogs.$inferInsert)
      .returning();
    return record;
  }
  
  async getDashboardAccessLogs(filters: {
    adminUserId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  } = {}): Promise<DashboardAccessLog[]> {
    const { adminUserId, action, startDate, endDate, limit = 50, offset = 0 } = filters;
    
    const conditions = [];
    
    if (adminUserId) {
      conditions.push(eq(dashboardAccessLogs.adminUserId, adminUserId));
    }
    
    if (action) {
      conditions.push(eq(dashboardAccessLogs.action, action));
    }
    
    if (startDate) {
      conditions.push(gte(dashboardAccessLogs.timestamp, startDate));
    }
    
    if (endDate) {
      conditions.push(lte(dashboardAccessLogs.timestamp, endDate));
    }
    
    const query = db
      .select()
      .from(dashboardAccessLogs)
      .orderBy(desc(dashboardAccessLogs.timestamp))
      .limit(limit)
      .offset(offset);
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }
  
  async getAdminExportCount(adminUserId: string, since: Date): Promise<number> {
    const results = await db
      .select({ count: sql<number>`count(*)` })
      .from(dashboardAccessLogs)
      .where(
        and(
          eq(dashboardAccessLogs.adminUserId, adminUserId),
          eq(dashboardAccessLogs.action, 'export'),
          gte(dashboardAccessLogs.timestamp, since)
        )
      );
    
    return Number(results[0]?.count || 0);
  }
  
  async getAdminDecryptCount(adminUserId: string, since: Date): Promise<number> {
    const results = await db
      .select({ count: sql<number>`count(*)` })
      .from(dashboardAccessLogs)
      .where(
        and(
          eq(dashboardAccessLogs.adminUserId, adminUserId),
          eq(dashboardAccessLogs.action, 'decrypt'),
          gte(dashboardAccessLogs.timestamp, since)
        )
      );
    
    return Number(results[0]?.count || 0);
  }
  
  // Integrity Alerts (Signature Tampering Detection)
  async getIntegrityAlerts(filters?: {
    resolved?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; alerts: IntegrityAlert[] }> {
    const { resolved, category, limit = 50, offset = 0 } = filters || {};
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const conditions = [gte(integrityAlerts.firstSeenAt, thirtyDaysAgo)];
    
    if (resolved !== undefined) {
      conditions.push(eq(integrityAlerts.resolved, resolved));
    }
    
    if (category) {
      conditions.push(eq(integrityAlerts.category, category));
    }
    
    const alerts = await db
      .select()
      .from(integrityAlerts)
      .where(and(...conditions))
      .orderBy(desc(integrityAlerts.lastSeenAt))
      .limit(limit)
      .offset(offset);
    
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(integrityAlerts)
      .where(and(...conditions));
    
    return {
      total: Number(totalResult[0]?.count || 0),
      alerts,
    };
  }
  
  async acknowledgeIntegrityAlerts(alertIds: string[], adminUserId: string): Promise<void> {
    await db
      .update(integrityAlerts)
      .set({
        resolved: true,
        acknowledgedBy: adminUserId,
        acknowledgedAt: new Date(),
      })
      .where(sql`${integrityAlerts.id}::text = ANY(${alertIds})`);
    
    await db.insert(dashboardAccessLogs).values({
      adminUserId: adminUserId,
      action: 'acknowledge_alerts',
      metadata: { alertIds, count: alertIds.length },
    });
  }
  
  async getUnresolvedAlertsCount(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(integrityAlerts)
      .where(
        and(
          eq(integrityAlerts.resolved, false),
          gte(integrityAlerts.lastSeenAt, twentyFourHoursAgo)
        )
      );
    
    return Number(result[0]?.count || 0);
  }
  
  // User Onboarding Operations (100% Free Browser-Native System)
  async getOnboardingStatus(userId: string): Promise<any | undefined> {
    const [status] = await db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, userId));
    return status;
  }
  
  async trackOnboardingStep(userId: string, step: string, value: boolean): Promise<void> {
    const existing = await this.getOnboardingStatus(userId);
    
    if (!existing) {
      // Create new onboarding record
      const user = await this.getUser(userId);
      await db.insert(userOnboarding).values({
        userId,
        role: user?.role || 'guest',
        [step]: value,
        lastInteractionAt: new Date(),
      });
    } else {
      // Update existing record
      await db
        .update(userOnboarding)
        .set({
          [step]: value,
          lastInteractionAt: new Date(),
        })
        .where(eq(userOnboarding.userId, userId));
    }
  }
  
  async completeOnboarding(userId: string): Promise<void> {
    await db
      .update(userOnboarding)
      .set({
        onboardingCompleted: true,
        completedAt: new Date(),
        stepWelcome: true,
        stepTour: true,
        stepComplete: true,
      })
      .where(eq(userOnboarding.userId, userId));
  }
}

export const storage = new DatabaseStorage();
