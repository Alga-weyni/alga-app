import {
  users,
  properties,
  bookings,
  reviews,
  favorites,
  verificationDocuments,
  accessCodes,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, ilike, gte, lte, inArray } from "drizzle-orm";

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
  verifyOtp(contact: string, otp: string): Promise<boolean>;
  markPhoneVerified(phoneNumber: string): Promise<User>;
  
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

  async saveOtp(contact: string, otp: string, expiryMinutes: number = 10): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);
    
    // Check if contact is email or phone number
    const isEmail = contact.includes('@');
    
    await db
      .update(users)
      .set({
        otp,
        otpExpiry: expiryDate,
      })
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));
  }

  async verifyOtp(contact: string, otp: string): Promise<boolean> {
    // Check if contact is email or phone number
    const isEmail = contact.includes('@');
    
    const [user] = await db
      .select()
      .from(users)
      .where(isEmail ? eq(users.email, contact) : eq(users.phoneNumber, contact));

    if (!user || !user.otp || !user.otpExpiry) {
      console.log(`[OTP VERIFY] Failed: user=${!!user}, otp=${user?.otp}, otpExpiry=${user?.otpExpiry}`);
      return false;
    }

    const now = new Date();
    if (now > user.otpExpiry) {
      console.log(`[OTP VERIFY] OTP expired. Now: ${now}, Expiry: ${user.otpExpiry}`);
      return false;
    }

    const isValid = user.otp === otp;
    console.log(`[OTP VERIFY] OTP comparison: stored=${user.otp}, provided=${otp}, match=${isValid}`);
    return isValid;
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
    const conditions = [eq(properties.isActive, true), eq(properties.status, 'approved')];

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
      .values(property)
      .returning();
    return newProperty;
  }

  async updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
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
    // Import the booking breakdown utility
    const { calculateBookingBreakdown } = await import('./utils/booking.js');
    
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
      .values(bookingWithFinancials)
      .returning();
    return newBooking;
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
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
      .values(review)
      .returning();

    // Recalculate property rating using weighted algorithm
    const newRating = await this.recalculatePropertyRating(review.propertyId);
    
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
      .values(favorite)
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
      .values(document)
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
    return await db
      .select()
      .from(verificationDocuments)
      .orderBy(desc(verificationDocuments.createdAt));
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
        active: sql<number>`COUNT(*) FILTER (WHERE ${properties.status} = 'approved')`,
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
      .values(accessCode)
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
    await db
      .update(accessCodes)
      .set({ status: "expired", updatedAt: new Date() })
      .where(
        and(
          sql`${accessCodes.validTo} < NOW()`,
          eq(accessCodes.status, "active")
        )
      );
  }
}

export const storage = new DatabaseStorage();
