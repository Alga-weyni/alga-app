import { db } from "../server/db";
import { users, properties, bookings, reviews, serviceProviders, serviceBookings } from "../shared/schema";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // Generate secure random password
    const generatePassword = () => randomBytes(32).toString('hex');
    
    // 1. Create Admin User
    console.log("Creating admin user...");
    const adminPassword = await bcrypt.hash(generatePassword(), 10);
    const [admin] = await db.insert(users).values({
      id: randomBytes(16).toString('hex'),
      email: "ethiopianstay@gmail.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
      phoneNumber: "+251911234567",
      phoneVerified: true,
      idVerified: true,
      status: "active",
    }).returning().onConflictDoNothing();

    // 2. Create Test Host
    console.log("Creating test host...");
    const hostPassword = await bcrypt.hash(generatePassword(), 10);
    const [host] = await db.insert(users).values({
      id: randomBytes(16).toString('hex'),
      email: "host@algaapp.com",
      password: hostPassword,
      firstName: "Abebe",
      lastName: "Kebede",
      role: "host",
      phoneNumber: "+251922345678",
      phoneVerified: true,
      idVerified: true,
      status: "active",
    }).returning().onConflictDoNothing();

    // 3. Create Test Guest
    console.log("Creating test guest...");
    const guestPassword = await bcrypt.hash(generatePassword(), 10);
    const [guest] = await db.insert(users).values({
      id: randomBytes(16).toString('hex'),
      email: "guest@algaapp.com",
      password: guestPassword,
      firstName: "Tigist",
      lastName: "Mekonnen",
      role: "guest",
      phoneNumber: "+251933456789",
      phoneVerified: true,
      idVerified: true,
      status: "active",
    }).returning().onConflictDoNothing();

    if (!host || !guest) {
      console.log("Users already exist, skipping property creation...");
      return;
    }

    // 4. Create Sample Properties
    console.log("Creating sample properties...");
    
    const property1 = await db.insert(properties).values({
      hostId: host.id,
      title: "Traditional Ethiopian Villa in Addis Ababa",
      description: "Experience authentic Ethiopian living in this beautifully restored traditional villa. Features original architecture, modern amenities, and stunning city views. Perfect for families or groups seeking cultural immersion.",
      type: "traditional_home",
      status: "approved",
      verifiedBy: admin?.id || host.id,
      verifiedAt: new Date(),
      address: "Bole District, Near Atlas Hotel",
      location: "Bole, Addis Ababa",
      city: "Addis Ababa",
      region: "Addis Ababa",
      pricePerNight: "3500",
      currency: "ETB",
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ["WiFi", "Kitchen", "Garden", "Coffee Ceremony", "Traditional Decor", "City View"],
      images: ["/placeholder/800/600", "/placeholder/800/600", "/placeholder/800/600"],
      isActive: true,
      rating: "4.8",
      reviewCount: 12,
    }).returning();

    const property2 = await db.insert(properties).values({
      hostId: host.id,
      title: "Luxury Hotel Suite in Bahir Dar",
      description: "Lakefront luxury with panoramic views of Lake Tana. Modern hotel suite with 5-star amenities, spa access, and traditional Ethiopian dining. Ideal for romantic getaways or business travelers.",
      type: "hotel",
      status: "approved",
      verifiedBy: admin?.id || host.id,
      verifiedAt: new Date(),
      address: "Lake Tana Shore, Blue Nile Falls Road",
      location: "Bahir Dar Waterfront",
      city: "Bahir Dar",
      region: "Amhara",
      pricePerNight: "5200",
      currency: "ETB",
      maxGuests: 2,
      bedrooms: 1,
      bathrooms: 1,
      amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Lake View", "Airport Shuttle"],
      images: ["/placeholder/800/600", "/placeholder/800/600"],
      isActive: true,
      rating: "4.9",
      reviewCount: 24,
    }).returning();

    const property3 = await db.insert(properties).values({
      hostId: host.id,
      title: "Eco-Lodge in Simien Mountains",
      description: "Sustainable mountain retreat surrounded by breathtaking landscapes. Eco-friendly design, solar power, organic farm-to-table meals. Perfect for nature lovers and hikers seeking adventure.",
      type: "eco_lodge",
      status: "approved",
      verifiedBy: admin?.id || host.id,
      verifiedAt: new Date(),
      address: "Simien Mountains National Park",
      location: "Debark, Simien Mountains",
      city: "Debark",
      region: "Amhara",
      pricePerNight: "2800",
      currency: "ETB",
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      amenities: ["Mountain View", "Hiking Trails", "Organic Meals", "Wildlife Viewing", "Campfire"],
      images: ["/placeholder/800/600"],
      isActive: true,
      rating: "4.7",
      reviewCount: 8,
    }).returning();

    // 5. Create Service Providers
    console.log("Creating service providers...");
    
    const serviceUser1Id = randomBytes(16).toString('hex');
    const serviceUser2Id = randomBytes(16).toString('hex');
    const serviceUser3Id = randomBytes(16).toString('hex');
    
    await db.insert(users).values([
      {
        id: serviceUser1Id,
        email: "cleaner@algaapp.com",
        password: await bcrypt.hash(generatePassword(), 10),
        firstName: "Mulu",
        lastName: "Tesfaye",
        role: "guest",
        phoneNumber: "+251944567890",
        phoneVerified: true,
        idVerified: true,
        isServiceProvider: true,
        status: "active",
      },
      {
        id: serviceUser2Id,
        email: "driver@algaapp.com",
        password: await bcrypt.hash(generatePassword(), 10),
        firstName: "Dawit",
        lastName: "Alemayehu",
        role: "guest",
        phoneNumber: "+251955678901",
        phoneVerified: true,
        idVerified: true,
        isServiceProvider: true,
        status: "active",
      },
      {
        id: serviceUser3Id,
        email: "laundry@algaapp.com",
        password: await bcrypt.hash(generatePassword(), 10),
        firstName: "Hanna",
        lastName: "Bekele",
        role: "guest",
        phoneNumber: "+251966789012",
        phoneVerified: true,
        idVerified: true,
        isServiceProvider: true,
        status: "active",
      },
    ]).onConflictDoNothing();

    await db.insert(serviceProviders).values([
      {
        userId: serviceUser1Id,
        businessName: "Sparkle Clean Ethiopia",
        serviceType: "cleaning",
        description: "Professional cleaning service for homes and short-term rentals. Deep cleaning, regular maintenance, and post-guest turnover. Eco-friendly products, trained staff.",
        pricingModel: "flat_rate",
        basePrice: "800",
        currency: "ETB",
        city: "Addis Ababa",
        region: "Addis Ababa",
        address: "Kirkos Subcity",
        verificationStatus: "approved",
        verifiedBy: admin?.id,
        verifiedAt: new Date(),
        rating: "4.8",
        totalJobsCompleted: 45,
        isActive: true,
      },
      {
        userId: serviceUser2Id,
        businessName: "Addis Airport Express",
        serviceType: "airport_pickup",
        description: "Reliable airport transfer service. Professional drivers, comfortable vehicles, meet & greet service. Available 24/7 for Bole International Airport.",
        pricingModel: "flat_rate",
        basePrice: "600",
        currency: "ETB",
        city: "Addis Ababa",
        region: "Addis Ababa",
        address: "Bole International Airport Area",
        verificationStatus: "approved",
        verifiedBy: admin?.id,
        verifiedAt: new Date(),
        rating: "4.9",
        totalJobsCompleted: 120,
        isActive: true,
      },
      {
        userId: serviceUser3Id,
        businessName: "Fresh & Clean Laundry",
        serviceType: "laundry",
        description: "Same-day laundry and dry cleaning service. Pickup and delivery included. Professional handling of all fabric types.",
        pricingModel: "hourly",
        basePrice: "50",
        currency: "ETB",
        city: "Addis Ababa",
        region: "Addis Ababa",
        address: "Piazza Area",
        verificationStatus: "approved",
        verifiedBy: admin?.id,
        verifiedAt: new Date(),
        rating: "4.7",
        totalJobsCompleted: 67,
        isActive: true,
      },
    ]).onConflictDoNothing();

    // 6. Create Sample Booking
    console.log("Creating sample booking...");
    const sampleBooking = await db.insert(bookings).values({
      propertyId: property1[0].id,
      guestId: guest.id,
      checkIn: new Date("2025-11-01"),
      checkOut: new Date("2025-11-05"),
      guests: 4,
      totalPrice: "14000",
      currency: "ETB",
      status: "confirmed",
      paymentMethod: "telebirr",
      paymentStatus: "paid",
      algaCommission: "1680",
      vat: "252",
      withholding: "280",
      hostPayout: "11788",
    }).returning();

    // 7. Create Sample Review
    console.log("Creating sample review...");
    await db.insert(reviews).values({
      propertyId: property1[0].id,
      bookingId: sampleBooking[0].id,
      reviewerId: guest.id,
      rating: 5,
      comment: "Amazing authentic Ethiopian experience! The villa was beautifully decorated with traditional furniture and the coffee ceremony was unforgettable. Host was very welcoming and helpful.",
      cleanliness: 5,
      communication: 5,
      accuracy: 5,
      location: 4,
      value: 5,
    }).onConflictDoNothing();

    console.log("✅ Database seeded successfully!");
    console.log("\n📧 Test User Credentials:");
    console.log("Admin: ethiopianstay@gmail.com");
    console.log("Host: host@algaapp.com");
    console.log("Guest: guest@algaapp.com");
    console.log("\n🔐 Use OTP authentication (4-digit code sent to console)");
    console.log("\n🏠 Created 3 properties in:");
    console.log("  - Addis Ababa");
    console.log("  - Bahir Dar");
    console.log("  - Debark (Simien Mountains)");
    console.log("\n🧹 Created 3 service providers:");
    console.log("  - Cleaning Service");
    console.log("  - Airport Pickup");
    console.log("  - Laundry Service");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
