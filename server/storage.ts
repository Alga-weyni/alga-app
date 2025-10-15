import {
  users,
  properties,
  bookings,
  reviews,
  favorites,
  verificationDocuments,
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
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, ilike, gte, lte, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
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
  }): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, updates: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<void>;
  getPropertiesByHost(hostId: string): Promise<Property[]>;
  
  // Booking operations
  createBooking(booking: InsertBooking): Promise<Booking>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByGuest(guestId: string): Promise<Booking[]>;
  getBookingsByProperty(propertyId: number): Promise<Booking[]>;
  updateBookingStatus(id: number, status: string): Promise<Booking>;
  updatePaymentStatus(id: number, paymentStatus: string): Promise<Booking>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
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
  verifyDocument(documentId: number, status: string, verifierId: string, rejectionReason?: string): Promise<any>;
  
  // Admin operations
  getAllPropertiesForVerification(): Promise<Property[]>;
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
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
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
        .orderBy(desc(properties.rating));

      return availableProperties;
    }

    // No date filter - return all matching properties
    return await db
      .select()
      .from(properties)
      .where(and(...conditions))
      .orderBy(desc(properties.rating));
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
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
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

    // Update property rating
    const [avgRating] = await db
      .select({
        avg: sql<number>`AVG(${reviews.rating})`,
        count: sql<number>`COUNT(${reviews.id})`
      })
      .from(reviews)
      .where(eq(reviews.propertyId, review.propertyId));

    await db
      .update(properties)
      .set({
        rating: avgRating.avg.toString(),
        reviewCount: avgRating.count,
        updatedAt: new Date()
      })
      .where(eq(properties.id, review.propertyId));

    return newReview;
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
}

export const storage = new DatabaseStorage();
