import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").notNull().default("guest"), // admin, operator, host, guest
  phoneNumber: varchar("phone_number").unique(),
  phoneVerified: boolean("phone_verified").default(false),
  idVerified: boolean("id_verified").default(false),
  idNumber: varchar("id_number", { length: 50 }), // Support passport numbers too
  idFullName: varchar("id_full_name"),
  idDocumentType: varchar("id_document_type"), // ethiopian_id, passport, drivers_license, other
  idDocumentUrl: varchar("id_document_url"), // URL to uploaded ID image
  idExpiryDate: varchar("id_expiry_date"), // Store expiry date
  idCountry: varchar("id_country"), // Country of issue
  // Fayda ID verification (Ethiopia's national digital ID)
  faydaId: varchar("fayda_id", { length: 12 }), // 12-digit Fayda national ID number
  faydaVerified: boolean("fayda_verified").default(false),
  faydaVerifiedAt: timestamp("fayda_verified_at"),
  faydaVerificationData: jsonb("fayda_verification_data"), // Stores encrypted identity data from Fayda API
  isServiceProvider: boolean("is_service_provider").default(false), // Add-on services
  otp: varchar("otp", { length: 4 }),
  otpExpiry: timestamp("otp_expiry"),
  status: varchar("status").notNull().default("active"), // active, suspended, pending
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ID Verification documents table
export const verificationDocuments = pgTable("verification_documents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  documentType: varchar("document_type").notNull(), // national_id, passport, property_deed, business_license
  documentUrl: varchar("document_url").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  hostId: varchar("host_id").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  type: varchar("type").notNull(), // hotel, guesthouse, traditional_home, eco_lodge
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected, suspended
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  address: text("address"),
  location: varchar("location").notNull(),
  city: varchar("city").notNull(),
  region: varchar("region").notNull(),
  pricePerNight: decimal("price_per_night", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  maxGuests: integer("max_guests").notNull(),
  bedrooms: integer("bedrooms").notNull(),
  bathrooms: integer("bathrooms").notNull(),
  amenities: text("amenities").array(),
  images: text("images").array(),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  checkIn: timestamp("check_in").notNull(),
  checkOut: timestamp("check_out").notNull(),
  guests: integer("guests").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  status: varchar("status").default("pending").notNull(), // pending, confirmed, cancelled, completed, paid, failed
  paymentMethod: varchar("payment_method"), // telebirr, paypal, cbe, dashen, abyssinia, m_birr
  paymentStatus: varchar("payment_status").default("pending").notNull(), // pending, paid, failed, refunded
  paymentRef: varchar("payment_ref"), // Transaction ID from payment provider (Telebirr/PayPal)
  specialRequests: text("special_requests"),
  // Commission & Tax Breakdown (ERCA Compliance)
  algaCommission: decimal("alga_commission", { precision: 10, scale: 2 }),
  vat: decimal("vat", { precision: 10, scale: 2 }),
  withholding: decimal("withholding", { precision: 10, scale: 2 }),
  hostPayout: decimal("host_payout", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  cleanliness: integer("cleanliness"),
  communication: integer("communication"),
  accuracy: integer("accuracy"),
  location: integer("location"),
  value: integer("value"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const accessCodes = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  code: varchar("code", { length: 6 }).notNull(),
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  status: varchar("status").default("active").notNull(), // active, expired, revoked
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-On Services: Service Providers
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  serviceType: varchar("service_type").notNull(), // cleaning, laundry, airport_pickup, electrical, plumbing, welcome_pack, driver
  description: text("description").notNull(),
  pricingModel: varchar("pricing_model").notNull(), // hourly, flat_rate
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  city: varchar("city").notNull(),
  region: varchar("region").notNull(),
  address: text("address"),
  availability: text("availability"), // JSON string for schedule
  idDocumentUrl: varchar("id_document_url"), // ID verification for service provider
  verificationStatus: varchar("verification_status").default("pending").notNull(), // pending, approved, rejected
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalJobsCompleted: integer("total_jobs_completed").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-On Services: Service Bookings
export const serviceBookings = pgTable("service_bookings", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id), // Optional: linked to property booking
  serviceProviderId: integer("service_provider_id").notNull().references(() => serviceProviders.id),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  hostId: varchar("host_id").references(() => users.id), // If host requests service
  serviceType: varchar("service_type").notNull(),
  scheduledDate: timestamp("scheduled_date").notNull(),
  scheduledTime: varchar("scheduled_time"),
  propertyLocation: varchar("property_location"), // City/location where service needed
  status: varchar("status").default("pending").notNull(), // pending, confirmed, in_progress, completed, cancelled
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  algaCommission: decimal("alga_commission", { precision: 10, scale: 2 }), // 15%
  providerPayout: decimal("provider_payout", { precision: 10, scale: 2 }), // 85%
  paymentStatus: varchar("payment_status").default("pending").notNull(), // pending, paid, failed
  paymentRef: varchar("payment_ref"), // Transaction ID
  payoutStatus: varchar("payout_status").default("pending").notNull(), // pending, processing, completed
  specialInstructions: text("special_instructions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  bookings: many(bookings),
  reviews: many(reviews),
  favorites: many(favorites),
  verificationDocuments: many(verificationDocuments),
  verifiedDocuments: many(verificationDocuments, {
    relationName: "verifiedBy"
  }),
  serviceProviders: many(serviceProviders),
  serviceBookings: many(serviceBookings),
}));

export const verificationDocumentsRelations = relations(verificationDocuments, ({ one }) => ({
  user: one(users, {
    fields: [verificationDocuments.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [verificationDocuments.verifiedBy],
    references: [users.id],
    relationName: "verifiedBy"
  }),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  host: one(users, {
    fields: [properties.hostId],
    references: [users.id],
  }),
  bookings: many(bookings),
  reviews: many(reviews),
  favorites: many(favorites),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  property: one(properties, {
    fields: [bookings.propertyId],
    references: [properties.id],
  }),
  guest: one(users, {
    fields: [bookings.guestId],
    references: [users.id],
  }),
  reviews: many(reviews),
  accessCodes: many(accessCodes),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, {
    fields: [reviews.propertyId],
    references: [properties.id],
  }),
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
}));

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [favorites.propertyId],
    references: [properties.id],
  }),
}));

export const accessCodesRelations = relations(accessCodes, ({ one }) => ({
  booking: one(bookings, {
    fields: [accessCodes.bookingId],
    references: [bookings.id],
  }),
  property: one(properties, {
    fields: [accessCodes.propertyId],
    references: [properties.id],
  }),
  guest: one(users, {
    fields: [accessCodes.guestId],
    references: [users.id],
  }),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one, many }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  verifier: one(users, {
    fields: [serviceProviders.verifiedBy],
    references: [users.id],
    relationName: "verifiedBy"
  }),
  serviceBookings: many(serviceBookings),
}));

export const serviceBookingsRelations = relations(serviceBookings, ({ one }) => ({
  serviceProvider: one(serviceProviders, {
    fields: [serviceBookings.serviceProviderId],
    references: [serviceProviders.id],
  }),
  guest: one(users, {
    fields: [serviceBookings.guestId],
    references: [users.id],
  }),
  host: one(users, {
    fields: [serviceBookings.hostId],
    references: [users.id],
    relationName: "hostServiceBookings"
  }),
  booking: one(bookings, {
    fields: [serviceBookings.bookingId],
    references: [bookings.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  phoneVerified: true,
  idVerified: true,
  status: true,
});

// Phone registration schema
export const registerPhoneUserSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[0-9]{9}$/, "Phone number must be in format +251XXXXXXXXX"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Email registration schema
export const registerEmailUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Phone login schema
export const loginPhoneUserSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[0-9]{9}$/, "Phone number must be in format +251XXXXXXXXX"),
  password: z.string().min(1, "Password is required"),
});

// Email login schema
export const loginEmailUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// OTP verification schema
export const verifyOtpSchema = z.object({
  phoneNumber: z.string().regex(/^\+251[0-9]{9}$/, "Phone number must be in format +251XXXXXXXXX"),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  reviewCount: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  // Accept dates as strings or Date objects
  checkIn: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  checkOut: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  // Accept totalPrice as string or number
  totalPrice: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === 'number' ? val.toString() : val
  ),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true,
});

export const insertAccessCodeSchema = createInsertSchema(accessCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalJobsCompleted: true,
  verificationStatus: true,
  verifiedBy: true,
  verifiedAt: true,
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  scheduledDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  totalPrice: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === 'number' ? val.toString() : val
  ),
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type RegisterPhoneUser = z.infer<typeof registerPhoneUserSchema>;
export type RegisterEmailUser = z.infer<typeof registerEmailUserSchema>;
export type LoginPhoneUser = z.infer<typeof loginPhoneUserSchema>;
export type LoginEmailUser = z.infer<typeof loginEmailUserSchema>;
export type VerifyOtp = z.infer<typeof verifyOtpSchema>;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;
export type InsertAccessCode = z.infer<typeof insertAccessCodeSchema>;
export type AccessCode = typeof accessCodes.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
