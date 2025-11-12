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
  preferences: jsonb("preferences").default('{}'), // User preferences for personalization
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

// User Activity Log for personalization and analytics
export const userActivityLog = pgTable("user_activity_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // viewed_property, made_booking, searched, chatted_lemlem, etc.
  metadata: jsonb("metadata").default('{}'), // Additional context (property_id, search_query, etc.)
  createdAt: timestamp("created_at").defaultNow(),
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
  // Alga Secure Access - Hardware verification status
  lockboxVerified: boolean("lockbox_verified").default(false),
  cameraVerified: boolean("camera_verified").default(false),
  hardwareVerifiedAt: timestamp("hardware_verified_at"),
  hardwareVerificationNotes: text("hardware_verification_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Information for Lemlem AI Assistant
export const propertyInfo = pgTable("property_info", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id).unique(),
  
  // Access Information
  lockboxCode: varchar("lockbox_code", { length: 20 }),
  lockboxLocation: text("lockbox_location"),
  parkingInstructions: text("parking_instructions"),
  entryInstructions: text("entry_instructions"),
  
  // Connectivity
  wifiNetwork: varchar("wifi_network", { length: 100 }),
  wifiPassword: varchar("wifi_password", { length: 100 }),
  
  // Contacts
  hostEmergencyPhone: varchar("host_emergency_phone", { length: 20 }),
  propertyManager: varchar("property_manager", { length: 100 }),
  propertyManagerPhone: varchar("property_manager_phone", { length: 20 }),
  
  // Local Information
  nearestHospital: text("nearest_hospital"),
  nearestRestaurants: text("nearest_restaurants"),
  nearestAttractions: text("nearest_attractions"),
  transportationTips: text("transportation_tips"),
  
  // Appliance Instructions
  heatingInstructions: text("heating_instructions"),
  acInstructions: text("ac_instructions"),
  tvInstructions: text("tv_instructions"),
  kitchenAppliances: text("kitchen_appliances"),
  otherInstructions: text("other_instructions"),
  
  // Check-in/Check-out
  checkInTime: varchar("check_in_time", { length: 10 }).default("2:00 PM"),
  checkOutTime: varchar("check_out_time", { length: 10 }).default("11:00 AM"),
  checkInNotes: text("check_in_notes"),
  checkOutChecklist: text("checkout_checklist"),
  
  // House Rules
  quietHours: varchar("quiet_hours", { length: 50 }),
  smokingAllowed: boolean("smoking_allowed").default(false),
  petsAllowed: boolean("pets_allowed").default(false),
  partiesAllowed: boolean("parties_allowed").default(false),
  additionalRules: text("additional_rules"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lemlem Chat Conversations (for context & cost tracking)
export const lemlemChats = pgTable("lemlem_chats", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  bookingId: integer("booking_id").references(() => bookings.id),
  propertyId: integer("property_id").references(() => properties.id),
  message: text("message").notNull(),
  isUser: boolean("is_user").notNull(),
  usedTemplate: boolean("used_template").default(true), // Track if template was used (no AI cost)
  aiModel: varchar("ai_model", { length: 50 }), // Only if AI was used
  tokensUsed: integer("tokens_used"), // Only if AI was used
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 6 }), // Only if AI was used
  timestamp: timestamp("timestamp").defaultNow(),
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

// ==================== ALGA SECURE ACCESS SYSTEM ====================
// Lockboxes - Hardware-agnostic smart lockbox registry
export const lockboxes = pgTable("lockboxes", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id).unique(), // One lockbox per property
  vendor: varchar("vendor", { length: 50 }).notNull(), // ttlock, igloohome, populife, master_lock, other
  vendorLockId: varchar("vendor_lock_id", { length: 255 }), // Vendor's unique lock ID
  model: varchar("model", { length: 100 }), // Model name/number
  serialNumber: varchar("serial_number", { length: 100 }),
  installationDate: timestamp("installation_date"),
  installationPhotoUrl: varchar("installation_photo_url"), // Photo proof for operator verification
  location: text("location"), // Where lockbox is mounted (e.g., "Main entrance left side")
  verificationStatus: varchar("verification_status").default("pending").notNull(), // pending, verified, rejected
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Admin/operator notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Access Codes - Time-limited 4-digit PIN codes for guest check-in
export const accessCodes = pgTable("access_codes", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  lockboxId: integer("lockbox_id").references(() => lockboxes.id),
  guestId: varchar("guest_id").notNull().references(() => users.id),
  code: varchar("code", { length: 4 }).notNull(), // 4-digit PIN
  validFrom: timestamp("valid_from").notNull(),
  validTo: timestamp("valid_to").notNull(),
  status: varchar("status").default("active").notNull(), // active, expired, revoked, used
  usedAt: timestamp("used_at"), // Track when guest first used code
  generatedBy: varchar("generated_by").default("system").notNull(), // system, manual
  vendorCodeId: varchar("vendor_code_id", { length: 255 }), // Vendor's code ID (if applicable)
  deliveryMethod: varchar("delivery_method"), // sms, whatsapp, app, email
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Security Cameras - Mandatory safety hardware for all properties
export const securityCameras = pgTable("security_cameras", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  location: text("location").notNull(), // Where camera is mounted (e.g., "Front entrance", "Parking area")
  brand: varchar("brand", { length: 100 }),
  model: varchar("model", { length: 100 }),
  installationDate: timestamp("installation_date"),
  installationPhotoUrl: varchar("installation_photo_url"), // Photo proof for operator verification
  viewingArea: text("viewing_area"), // What the camera covers (e.g., "Entrance and driveway")
  recordingEnabled: boolean("recording_enabled").default(true),
  storageType: varchar("storage_type"), // cloud, local, none
  verificationStatus: varchar("verification_status").default("pending").notNull(), // pending, verified, rejected
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"), // Admin/operator notes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Add-On Services: Service Providers
export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: varchar("business_name", { length: 255 }).notNull(),
  serviceType: varchar("service_type").notNull(), // cleaning, laundry, airport_pickup, electrical, plumbing, driver, welcome_pack, meal_support, local_guide, photography, landscaping, self_care
  description: text("description").notNull(),
  pricingModel: varchar("pricing_model").notNull(), // hourly, flat_rate
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  city: varchar("city").notNull(),
  region: varchar("region").notNull(),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  availability: text("availability"), // JSON string for schedule
  portfolioImages: text("portfolio_images").array(), // Array of image URLs for self_care providers
  idDocumentUrl: varchar("id_document_url"), // ID verification for service provider
  verificationStatus: varchar("verification_status").default("pending").notNull(), // pending, approved, rejected
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  totalJobsCompleted: integer("total_jobs_completed").default(0),
  isActive: boolean("is_active").default(true),
  // Meal support specific fields
  providerType: varchar("provider_type"), // home_cook, restaurant (for meal_support)
  cuisine: varchar("cuisine"), // ethiopian, italian, chinese, etc. (for meal_support)
  specialties: text("specialties").array(), // Array of dish names (for meal_support)
  deliveryRadiusKm: integer("delivery_radius_km"), // Delivery range in km (for meal_support)
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

// Service Reviews: Reviews for service providers
export const serviceReviews = pgTable("service_reviews", {
  id: serial("id").primaryKey(),
  serviceBookingId: integer("service_booking_id").notNull().references(() => serviceBookings.id),
  serviceProviderId: integer("service_provider_id").notNull().references(() => serviceProviders.id),
  reviewerId: varchar("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // Overall rating 1-5
  comment: text("comment"),
  // Detailed ratings
  professionalism: integer("professionalism"), // 1-5
  quality: integer("quality"), // 1-5
  timeliness: integer("timeliness"), // 1-5
  communication: integer("communication"), // 1-5
  value: integer("value"), // 1-5
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
  serviceReviews: many(serviceReviews),
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
  propertyInfo: one(propertyInfo, {
    fields: [properties.id],
    references: [propertyInfo.propertyId],
  }),
  lockbox: one(lockboxes, {
    fields: [properties.id],
    references: [lockboxes.propertyId],
  }),
  securityCameras: many(securityCameras),
  accessCodes: many(accessCodes),
}));

export const propertyInfoRelations = relations(propertyInfo, ({ one }) => ({
  property: one(properties, {
    fields: [propertyInfo.propertyId],
    references: [properties.id],
  }),
}));

export const lemlemChatsRelations = relations(lemlemChats, ({ one }) => ({
  user: one(users, {
    fields: [lemlemChats.userId],
    references: [users.id],
  }),
  booking: one(bookings, {
    fields: [lemlemChats.bookingId],
    references: [bookings.id],
  }),
  property: one(properties, {
    fields: [lemlemChats.propertyId],
    references: [properties.id],
  }),
}));

// Platform Settings for AI Controls
export const platformSettings = pgTable("platform_settings", {
  id: serial("id").primaryKey(),
  aiEnabled: boolean("ai_enabled").default(true).notNull(), // Master toggle for AI fallback
  monthlyBudgetUSD: decimal("monthly_budget_usd", { precision: 10, scale: 2 }).default("20.00"), // Monthly AI budget cap
  currentMonthSpend: decimal("current_month_spend", { precision: 10, scale: 6 }).default("0"), // Track current month's AI spending
  budgetResetDate: timestamp("budget_reset_date").defaultNow(), // When to reset the monthly budget
  alertsEnabled: boolean("alerts_enabled").default(true).notNull(), // Send alerts when near budget
  alertThreshold: integer("alert_threshold").default(80), // Alert at 80% of budget
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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
  lockbox: one(lockboxes, {
    fields: [accessCodes.lockboxId],
    references: [lockboxes.id],
  }),
  guest: one(users, {
    fields: [accessCodes.guestId],
    references: [users.id],
  }),
}));

export const lockboxesRelations = relations(lockboxes, ({ one, many }) => ({
  property: one(properties, {
    fields: [lockboxes.propertyId],
    references: [properties.id],
  }),
  verifier: one(users, {
    fields: [lockboxes.verifiedBy],
    references: [users.id],
    relationName: "verifiedLockboxBy"
  }),
  accessCodes: many(accessCodes),
}));

export const securityCamerasRelations = relations(securityCameras, ({ one }) => ({
  property: one(properties, {
    fields: [securityCameras.propertyId],
    references: [properties.id],
  }),
  verifier: one(users, {
    fields: [securityCameras.verifiedBy],
    references: [users.id],
    relationName: "verifiedCameraBy"
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
  serviceReviews: many(serviceReviews),
}));

export const serviceBookingsRelations = relations(serviceBookings, ({ one, many }) => ({
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
  serviceReviews: many(serviceReviews),
}));

export const serviceReviewsRelations = relations(serviceReviews, ({ one }) => ({
  serviceBooking: one(serviceBookings, {
    fields: [serviceReviews.serviceBookingId],
    references: [serviceBookings.id],
  }),
  serviceProvider: one(serviceProviders, {
    fields: [serviceReviews.serviceProviderId],
    references: [serviceProviders.id],
  }),
  reviewer: one(users, {
    fields: [serviceReviews.reviewerId],
    references: [users.id],
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

export const insertLockboxSchema = createInsertSchema(lockboxes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSecurityCameraSchema = createInsertSchema(securityCameras).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Service type validation
export const serviceTypeEnum = z.enum([
  "cleaning",
  "laundry", 
  "airport_pickup",
  "electrical",
  "plumbing",
  "driver",
  "welcome_pack",
  "meal_support",
  "local_guide",
  "photography",
  "landscaping",
  "self_care"
]);

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  rating: true,
  totalJobsCompleted: true,
  verificationStatus: true,
  verifiedBy: true,
  verifiedAt: true,
}).extend({
  serviceType: serviceTypeEnum,
});

export const insertServiceBookingSchema = createInsertSchema(serviceBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  serviceType: serviceTypeEnum,
  scheduledDate: z.union([z.string(), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  totalPrice: z.union([z.string(), z.number()]).transform((val) => 
    typeof val === 'number' ? val.toString() : val
  ),
});

export const insertServiceReviewSchema = createInsertSchema(serviceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPropertyInfoSchema = createInsertSchema(propertyInfo).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLemlemChatSchema = createInsertSchema(lemlemChats).omit({
  id: true,
  timestamp: true,
});

export const insertPlatformSettingsSchema = createInsertSchema(platformSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivityLog).omit({
  id: true,
  createdAt: true,
});

// ==================== DELALA AGENT COMMISSION SYSTEM ====================
// Agents (Delalas) - Ethiopia's informal property brokers
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id), // Links to user account
  fullName: varchar("full_name", { length: 255 }).notNull(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull().unique(),
  telebirrAccount: varchar("telebirr_account", { length: 50 }).notNull(), // For direct payments
  idNumber: varchar("id_number", { length: 50 }), // Ethiopian ID or passport
  idDocumentUrl: varchar("id_document_url"), // URL to uploaded ID
  businessName: varchar("business_name", { length: 255 }), // Optional business registration
  businessLicenseUrl: varchar("business_license_url"), // Optional license
  city: varchar("city").notNull(),
  subCity: varchar("sub_city"),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected, suspended
  verifiedBy: varchar("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  rejectionReason: text("rejection_reason"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default("0"),
  totalProperties: integer("total_properties").default(0), // Count of properties brought
  activeProperties: integer("active_properties").default(0), // Currently active
  referralCode: varchar("referral_code", { length: 20 }).unique(), // For marketing
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent-Property Relationships (which agent brought which property)
export const agentProperties = pgTable("agent_properties", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  propertyId: integer("property_id").notNull().references(() => properties.id).unique(), // One property, one agent
  firstBookingDate: timestamp("first_booking_date"), // When commission started (first booking)
  commissionExpiryDate: timestamp("commission_expiry_date"), // 36 months from first booking
  isActive: boolean("is_active").default(true), // Commission still valid?
  totalBookings: integer("total_bookings").default(0),
  totalCommissionEarned: decimal("total_commission_earned", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Commission Records (per booking)
export const agentCommissions = pgTable("agent_commissions", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  propertyId: integer("property_id").notNull().references(() => properties.id),
  bookingId: integer("booking_id").notNull().references(() => bookings.id).unique(), // One commission per booking
  bookingTotal: decimal("booking_total", { precision: 10, scale: 2 }).notNull(), // Total booking amount
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }).default("5.00"), // 5% default
  commissionAmount: decimal("commission_amount", { precision: 10, scale: 2 }).notNull(), // 5% of booking total
  status: varchar("status").notNull().default("pending"), // pending, paid, cancelled
  paidAt: timestamp("paid_at"),
  telebirrTransactionId: varchar("telebirr_transaction_id", { length: 100 }), // Payment confirmation
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  totalEarnings: true,
  totalProperties: true,
  activeProperties: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentPropertySchema = createInsertSchema(agentProperties).omit({
  id: true,
  totalBookings: true,
  totalCommissionEarned: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentCommissionSchema = createInsertSchema(agentCommissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Agent Withdrawals (Telebirr/Addispay payouts)
export const agentWithdrawals = pgTable("agent_withdrawals", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  method: varchar("method").notNull(), // telebirr, addispay, bank_transfer
  accountNumber: varchar("account_number").notNull(), // Telebirr/Addispay number or bank account
  status: varchar("status").notNull().default("pending"), // pending, processing, completed, failed, cancelled
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  processedBy: varchar("processed_by").references(() => users.id), // Admin who processed
  transactionId: varchar("transaction_id"), // Payment provider transaction ID
  failureReason: text("failure_reason"),
  notes: text("notes"), // Admin notes
  metadata: jsonb("metadata").default('{}'), // Additional payment details
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Ratings & Reviews (from hosts/guests)
export const agentRatings = pgTable("agent_ratings", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id),
  raterId: varchar("rater_id").notNull().references(() => users.id), // Host or guest who rated
  raterType: varchar("rater_type").notNull(), // host, guest
  propertyId: integer("property_id").references(() => properties.id), // Property context
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  tags: text("tags").array(), // helpful, professional, responsive, knowledgeable
  isVerified: boolean("is_verified").default(false), // Verified by admin
  status: varchar("status").notNull().default("active"), // active, hidden, reported
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Referrals (invite system for recruiting new agents)
export const agentReferrals = pgTable("agent_referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => agents.id), // Agent who referred
  referredUserId: varchar("referred_user_id").references(() => users.id), // User who signed up
  referredAgentId: integer("referred_agent_id").references(() => agents.id), // If referred became agent
  referralCode: varchar("referral_code").notNull(), // Unique code used
  status: varchar("status").notNull().default("pending"), // pending, converted, expired
  bonusAmount: decimal("bonus_amount", { precision: 10, scale: 2 }).default("0"), // Referral bonus earned
  bonusPaid: boolean("bonus_paid").default(false),
  convertedAt: timestamp("converted_at"), // When referred user became agent
  expiresAt: timestamp("expires_at"), // Referral link expiry
  metadata: jsonb("metadata").default('{}'), // Source, campaign, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Agent Performance Analytics (cached/aggregated data for dashboard)
export const agentPerformance = pgTable("agent_performance", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id).unique(),
  totalPropertiesListed: integer("total_properties_listed").default(0),
  activeProperties: integer("active_properties").default(0),
  totalBookings: integer("total_bookings").default(0),
  totalCommissionEarned: decimal("total_commission_earned", { precision: 10, scale: 2 }).default("0"),
  totalCommissionPending: decimal("total_commission_pending", { precision: 10, scale: 2 }).default("0"),
  totalWithdrawn: decimal("total_withdrawn", { precision: 10, scale: 2 }).default("0"),
  availableBalance: decimal("available_balance", { precision: 10, scale: 2 }).default("0"),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalRatings: integer("total_ratings").default(0),
  totalReferrals: integer("total_referrals").default(0),
  successfulReferrals: integer("successful_referrals").default(0),
  isVerified: boolean("is_verified").default(false), // Alga-verified badge
  verifiedBadgeLevel: varchar("verified_badge_level"), // bronze, silver, gold, platinum
  lastActivityAt: timestamp("last_activity_at"),
  joinedAt: timestamp("joined_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertAgentWithdrawalSchema = createInsertSchema(agentWithdrawals).omit({
  id: true,
  requestedAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentRatingSchema = createInsertSchema(agentRatings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentReferralSchema = createInsertSchema(agentReferrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentPerformanceSchema = createInsertSchema(agentPerformance).omit({
  id: true,
  joinedAt: true,
  updatedAt: true,
});

// ========================================
// LEMLEM OPERATIONS DASHBOARD TABLES
// ========================================

// Hardware Deployment Tracking (Lockboxes, Cameras, etc.)
export const hardwareDeployments = pgTable("hardware_deployments", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id").references(() => properties.id),
  hardwareType: varchar("hardware_type").notNull(), // lockbox, camera, smart_lock, thermostat
  serialNumber: varchar("serial_number", { length: 100 }),
  manufacturer: varchar("manufacturer"),
  model: varchar("model"),
  purchaseDate: timestamp("purchase_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  installationDate: timestamp("installation_date"),
  installedBy: varchar("installed_by").references(() => users.id),
  status: varchar("status").notNull().default("active"), // active, maintenance, broken, retired
  location: text("location"), // Physical location at property
  lastMaintenanceDate: timestamp("last_maintenance_date"),
  nextMaintenanceDate: timestamp("next_maintenance_date"),
  notes: text("notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment Transaction Tracking (for reconciliation with TeleBirr, CBE, etc.)
export const paymentTransactions = pgTable("payment_transactions", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 100 }).unique().notNull(),
  paymentGateway: varchar("payment_gateway").notNull(), // telebirr, chapa, stripe, cbe, paypal
  transactionType: varchar("transaction_type").notNull(), // booking, commission, refund, payout
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency").default("ETB").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, completed, failed, refunded
  relatedBookingId: integer("related_booking_id").references(() => bookings.id),
  relatedAgentId: integer("related_agent_id").references(() => agents.id),
  payerUserId: varchar("payer_user_id").references(() => users.id),
  recipientUserId: varchar("recipient_user_id").references(() => users.id),
  gatewayResponse: jsonb("gateway_response"), // Full API response for reconciliation
  reconciled: boolean("reconciled").default(false),
  reconciledAt: timestamp("reconciled_at"),
  reconciledBy: varchar("reconciled_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Marketing Campaigns & Social Media Tracking
export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  campaignName: varchar("campaign_name", { length: 255 }).notNull(),
  campaignType: varchar("campaign_type").notNull(), // social_media, email, partnership, influencer, paid_ads
  platform: varchar("platform"), // facebook, instagram, tiktok, telegram, twitter, linkedin
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  status: varchar("status").notNull().default("active"), // active, paused, completed, cancelled
  budget: decimal("budget", { precision: 10, scale: 2 }),
  spent: decimal("spent", { precision: 10, scale: 2 }).default("0"),
  targetAudience: text("target_audience"),
  goals: text("goals"),
  
  // Metrics
  impressions: integer("impressions").default(0),
  reach: integer("reach").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0), // Bookings or sign-ups from this campaign
  leads: integer("leads").default(0),
  
  // Social Media Specific
  followers: integer("followers").default(0),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  comments: integer("comments").default(0),
  
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// System Alerts & Red Flags for Operations Dashboard
export const systemAlerts = pgTable("system_alerts", {
  id: serial("id").primaryKey(),
  alertType: varchar("alert_type").notNull(), // agent_commission_due, warranty_expiring, payment_mismatch, property_unverified, low_campaign_performance
  severity: varchar("severity").notNull().default("medium"), // low, medium, high, critical
  pillar: varchar("pillar").notNull(), // agent_governance, supply_curation, hardware_deployment, payments_compliance, marketing_growth
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  relatedEntityType: varchar("related_entity_type"), // agent, property, hardware, payment, campaign
  relatedEntityId: integer("related_entity_id"),
  status: varchar("status").notNull().default("active"), // active, acknowledged, resolved, dismissed
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// INSA Compliance Tracking
export const insaCompliance = pgTable("insa_compliance", {
  id: serial("id").primaryKey(),
  complianceCategory: varchar("compliance_category").notNull(), // security_audit, data_protection, encryption, access_control
  requirement: text("requirement").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, in_progress, completed, failed
  dueDate: timestamp("due_date"),
  completedDate: timestamp("completed_date"),
  evidenceUrl: varchar("evidence_url"),
  assignedTo: varchar("assigned_to").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas for new tables
export const insertHardwareDeploymentSchema = createInsertSchema(hardwareDeployments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSystemAlertSchema = createInsertSchema(systemAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInsaComplianceSchema = createInsertSchema(insaCompliance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// E-Signature Consent Logs (Ethiopian Legal Compliance - Proclamations No. 1072/2018 and No. 1205/2020)
export const consentLogs = pgTable("consent_logs", {
  id: serial("id").primaryKey(),
  signatureId: varchar("signature_id").notNull().unique(), // UUID returned to frontend
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // booking, submit, confirm, payment
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddressEncrypted: text("ip_address_encrypted"), // Encrypted IP for audit trail
  deviceInfoEncrypted: text("device_info_encrypted"), // Encrypted user agent
  otpId: varchar("otp_id"), // OTP verification ID if available
  faydaId: varchar("fayda_id"), // Fayda ID if verified
  signatureHash: varchar("signature_hash", { length: 64 }).notNull(), // SHA-256 of user_id + action + timestamp
  relatedEntityType: varchar("related_entity_type"), // booking, property, service_booking
  relatedEntityId: varchar("related_entity_id"), // ID of the related entity
  verified: boolean("verified").notNull().default(false), // Session verification status
  metadata: jsonb("metadata").default('{}'), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertConsentLogSchema = createInsertSchema(consentLogs).omit({
  id: true,
  createdAt: true,
});

// Dashboard Access Logs (INSA Compliance - Admin Audit Trail)
export const dashboardAccessLogs = pgTable("dashboard_access_logs", {
  id: serial("id").primaryKey(),
  adminUserId: varchar("admin_user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(), // view, verify, decrypt, export
  recordId: varchar("record_id"), // signature_id being accessed (null for list views)
  exportFormat: varchar("export_format"), // csv, pdf, json (for export actions)
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").default('{}'), // Additional context (filters, record count, etc.)
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertDashboardAccessLogSchema = createInsertSchema(dashboardAccessLogs).omit({
  id: true,
  timestamp: true,
});

export type DashboardAccessLog = typeof dashboardAccessLogs.$inferSelect;
export type InsertDashboardAccessLog = z.infer<typeof insertDashboardAccessLogSchema>;

// Integrity Alerts (Signature Tampering Detection & Incident Response)
export const integrityAlerts = pgTable("integrity_alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  signatureId: varchar("signature_id").notNull(), // References consent_logs.signature_id
  category: varchar("category").notNull(), // HASH_MISMATCH, DECRYPT_FAILURE, DB_INTEGRITY_ERROR, UNKNOWN
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  occurrenceCount: integer("occurrence_count").default(1).notNull(),
  resolved: boolean("resolved").default(false).notNull(),
  acknowledgedBy: varchar("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  metadata: jsonb("metadata").default('{}'), // Additional context about the failure
});

export const insertIntegrityAlertSchema = createInsertSchema(integrityAlerts).omit({
  id: true,
  firstSeenAt: true,
  lastSeenAt: true,
});

export type IntegrityAlert = typeof integrityAlerts.$inferSelect;
export type InsertIntegrityAlert = z.infer<typeof insertIntegrityAlertSchema>;

// ========================================
// USER ONBOARDING TRACKING (100% Free Browser-Native System)
// ========================================

export const userOnboarding = pgTable("user_onboarding", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id),
  role: varchar("role").notNull(), // guest, host, dellala, operator, admin
  onboardingCompleted: boolean("onboarding_completed").default(false),
  completedAt: timestamp("completed_at"),
  
  // Step tracking
  stepWelcome: boolean("step_welcome").default(false),
  stepTour: boolean("step_tour").default(false),
  stepComplete: boolean("step_complete").default(false),
  
  // Welcome image generation
  welcomeImageGenerated: boolean("welcome_image_generated").default(false),
  welcomeImageUrl: varchar("welcome_image_url"),
  
  // Engagement tracking
  tourStepsViewed: integer("tour_steps_viewed").default(0),
  skipCount: integer("skip_count").default(0), // How many times user skipped
  totalTimeSpent: integer("total_time_spent").default(0), // Seconds
  
  // Last interaction
  lastInteractionAt: timestamp("last_interaction_at").defaultNow(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserOnboardingSchema = createInsertSchema(userOnboarding).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertUserOnboarding = z.infer<typeof insertUserOnboardingSchema>;

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
export type InsertLockbox = z.infer<typeof insertLockboxSchema>;
export type Lockbox = typeof lockboxes.$inferSelect;
export type InsertSecurityCamera = z.infer<typeof insertSecurityCameraSchema>;
export type SecurityCamera = typeof securityCameras.$inferSelect;
export type ServiceType = z.infer<typeof serviceTypeEnum>;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceBooking = z.infer<typeof insertServiceBookingSchema>;
export type ServiceBooking = typeof serviceBookings.$inferSelect;
export type InsertServiceReview = z.infer<typeof insertServiceReviewSchema>;
export type ServiceReview = typeof serviceReviews.$inferSelect;
export type InsertPropertyInfo = z.infer<typeof insertPropertyInfoSchema>;
export type PropertyInfo = typeof propertyInfo.$inferSelect;
export type InsertLemlemChat = z.infer<typeof insertLemlemChatSchema>;
export type LemlemChat = typeof lemlemChats.$inferSelect;
export type InsertPlatformSettings = z.infer<typeof insertPlatformSettingsSchema>;
export type PlatformSettings = typeof platformSettings.$inferSelect;
export type InsertUserActivity = z.infer<typeof insertUserActivitySchema>;
export type UserActivity = typeof userActivityLog.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
export type InsertAgentProperty = z.infer<typeof insertAgentPropertySchema>;
export type AgentProperty = typeof agentProperties.$inferSelect;
export type InsertAgentCommission = z.infer<typeof insertAgentCommissionSchema>;
export type AgentCommission = typeof agentCommissions.$inferSelect;
export type InsertHardwareDeployment = z.infer<typeof insertHardwareDeploymentSchema>;
export type HardwareDeployment = typeof hardwareDeployments.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertSystemAlert = z.infer<typeof insertSystemAlertSchema>;
export type SystemAlert = typeof systemAlerts.$inferSelect;
export type InsertInsaCompliance = z.infer<typeof insertInsaComplianceSchema>;
export type InsaCompliance = typeof insaCompliance.$inferSelect;
export type InsertConsentLog = z.infer<typeof insertConsentLogSchema>;
export type ConsentLog = typeof consentLogs.$inferSelect;
export type InsertAgentWithdrawal = z.infer<typeof insertAgentWithdrawalSchema>;
export type AgentWithdrawal = typeof agentWithdrawals.$inferSelect;
export type InsertAgentRating = z.infer<typeof insertAgentRatingSchema>;
export type AgentRating = typeof agentRatings.$inferSelect;
export type InsertAgentReferral = z.infer<typeof insertAgentReferralSchema>;
export type AgentReferral = typeof agentReferrals.$inferSelect;
export type InsertAgentPerformance = z.infer<typeof insertAgentPerformanceSchema>;
export type AgentPerformance = typeof agentPerformance.$inferSelect;
