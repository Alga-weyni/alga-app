/**
 * INSA Security Audit - Test Data Seeding Script
 * 
 * This script creates comprehensive test data for INSA security auditors
 * Covers all user roles, properties, bookings, services, and agent data
 * 
 * Usage: tsx server/seed-insa-test-data.ts
 */

import { db } from './db';
import { 
  users, properties, bookings, reviews, accessCodes,
  serviceProviders, serviceBookings, agents, agentProperties,
  agentCommissions, propertyInfo, lemlemChats
} from "@shared/schema";
import bcrypt from "bcrypt";
import { sql } from "drizzle-orm";

const INSA_TEST_PASSWORD = "INSA_Test_2025!";

async function seedINSATestData() {
  console.log("🔐 Starting INSA Test Data Seeding...\n");

  try {
    // 1. Create Test Users for all roles
    console.log("1️⃣ Creating test users...");
    
    const hashedPassword = await bcrypt.hash(INSA_TEST_PASSWORD, 10);
    
    const testUsers = [
      // Guest Account
      {
        id: "insa-guest-001",
        email: "insa-guest@test.alga.et",
        password: hashedPassword,
        firstName: "INSA",
        lastName: "Guest User",
        role: "guest",
        phoneNumber: "+251911111001",
        phoneVerified: true,
        idVerified: true,
        idNumber: "TEST-ID-001",
        idFullName: "INSA Guest User",
        idDocumentType: "ethiopian_id",
        idCountry: "Ethiopia",
        status: "active",
        bio: "INSA security audit test guest account"
      },
      // Host Account
      {
        id: "insa-host-001",
        email: "insa-host@test.alga.et",
        password: hashedPassword,
        firstName: "INSA",
        lastName: "Host User",
        role: "host",
        phoneNumber: "+251911111002",
        phoneVerified: true,
        idVerified: true,
        idNumber: "TEST-ID-002",
        idFullName: "INSA Host User",
        idDocumentType: "ethiopian_id",
        idCountry: "Ethiopia",
        status: "active",
        bio: "INSA security audit test host account - manages 5 properties"
      },
      // Admin Account
      {
        id: "insa-admin-001",
        email: "insa-admin@test.alga.et",
        password: hashedPassword,
        firstName: "INSA",
        lastName: "Admin User",
        role: "admin",
        phoneNumber: "+251911111003",
        phoneVerified: true,
        idVerified: true,
        idNumber: "TEST-ID-003",
        idFullName: "INSA Admin User",
        idDocumentType: "ethiopian_id",
        idCountry: "Ethiopia",
        status: "active",
        bio: "INSA security audit test admin account - full platform access"
      },
      // Operator Account
      {
        id: "insa-operator-001",
        email: "insa-operator@test.alga.et",
        password: hashedPassword,
        firstName: "INSA",
        lastName: "Operator User",
        role: "operator",
        phoneNumber: "+251911111004",
        phoneVerified: true,
        idVerified: true,
        idNumber: "TEST-ID-004",
        idFullName: "INSA Operator User",
        idDocumentType: "ethiopian_id",
        idCountry: "Ethiopia",
        status: "active",
        bio: "INSA security audit test operator account - verifies IDs and properties"
      },
      // Delala Agent Account
      {
        id: "insa-agent-001",
        email: "insa-agent@test.alga.et",
        password: hashedPassword,
        firstName: "INSA",
        lastName: "Agent User",
        role: "guest",
        phoneNumber: "+251911111005",
        phoneVerified: true,
        idVerified: true,
        idNumber: "TEST-ID-005",
        idFullName: "INSA Agent User",
        idDocumentType: "ethiopian_id",
        idCountry: "Ethiopia",
        status: "active",
        bio: "INSA security audit test Delala agent account - earns 5% commission"
      },
      // Service Provider Account
      {
        id: "insa-service-001",
        email: "insa-service@test.alga.et",
        password: hashedPassword,
        firstName: "INSA",
        lastName: "Service Provider",
        role: "guest",
        phoneNumber: "+251911111006",
        phoneVerified: true,
        idVerified: true,
        isServiceProvider: true,
        idNumber: "TEST-ID-006",
        idFullName: "INSA Service Provider",
        idDocumentType: "ethiopian_id",
        idCountry: "Ethiopia",
        status: "active",
        bio: "INSA security audit test service provider account"
      },
    ];

    await db.insert(users).values(testUsers).onConflictDoNothing();
    console.log(`   ✅ Created ${testUsers.length} test users\n`);

    // 2. Create Test Properties
    console.log("2️⃣ Creating test properties...");
    
    const testProperties = [
      {
        hostId: "insa-host-001",
        title: "Traditional Ethiopian Tukul - Addis Ababa",
        description: "Authentic circular tukul in the heart of Addis Ababa. Experience traditional Ethiopian living with modern amenities. Perfect for cultural immersion.",
        type: "traditional_home",
        status: "approved",
        verifiedBy: "insa-operator-001",
        latitude: "9.0320",
        longitude: "38.7469",
        address: "Bole, Near Mexican Embassy",
        location: "Bole",
        city: "Addis Ababa",
        region: "Addis Ababa",
        pricePerNight: "1500.00",
        currency: "ETB",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "parking", "traditional_coffee_ceremony"],
        images: ["/test-property-1.jpg"],
        isActive: true,
        rating: "4.8",
        reviewCount: 12
      },
      {
        hostId: "insa-host-001",
        title: "Luxury Lakeside Villa - Bahir Dar",
        description: "Stunning villa overlooking Lake Tana. Modern luxury meets Ethiopian hospitality. Close to Blue Nile Falls.",
        type: "hotel",
        status: "approved",
        verifiedBy: "insa-operator-001",
        latitude: "11.5935",
        longitude: "37.3886",
        address: "Lake Tana Shore",
        location: "Lakeside",
        city: "Bahir Dar",
        region: "Amhara",
        pricePerNight: "3500.00",
        currency: "ETB",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        amenities: ["wifi", "pool", "lake_view", "boat_access", "restaurant"],
        images: ["/test-property-2.jpg"],
        isActive: true,
        rating: "4.9",
        reviewCount: 25
      },
      {
        hostId: "insa-host-001",
        title: "Historic Guesthouse - Lalibela",
        description: "Stay near the famous rock-hewn churches. Family-run guesthouse with authentic Ethiopian breakfast and local guide services.",
        type: "guesthouse",
        status: "approved",
        verifiedBy: "insa-operator-001",
        latitude: "12.0333",
        longitude: "39.0500",
        address: "Near Beta Giyorgis Church",
        location: "Old Town",
        city: "Lalibela",
        region: "Amhara",
        pricePerNight: "800.00",
        currency: "ETB",
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        amenities: ["wifi", "breakfast", "local_guide", "airport_pickup"],
        images: ["/test-property-3.jpg"],
        isActive: true,
        rating: "4.7",
        reviewCount: 18
      },
      {
        hostId: "insa-host-001",
        title: "Eco-Lodge in Simien Mountains",
        description: "Sustainable eco-lodge with breathtaking mountain views. Perfect base for trekking and wildlife watching. Solar-powered.",
        type: "eco_lodge",
        status: "approved",
        verifiedBy: "insa-operator-001",
        latitude: "13.2500",
        longitude: "38.0000",
        address: "Simien Mountains National Park",
        location: "Debark",
        city: "Debark",
        region: "Amhara",
        pricePerNight: "2200.00",
        currency: "ETB",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["mountain_view", "eco_friendly", "trekking_base", "wildlife_viewing"],
        images: ["/test-property-4.jpg"],
        isActive: true,
        rating: "4.9",
        reviewCount: 31
      },
      {
        hostId: "insa-host-001",
        title: "Modern Apartment - Hawassa",
        description: "Contemporary apartment near Lake Hawassa. Perfect for business travelers and tourists. Full kitchen and workspace.",
        type: "hotel",
        status: "approved",
        verifiedBy: "insa-operator-001",
        latitude: "7.0500",
        longitude: "38.4667",
        address: "Amora Gedel, Near Fish Market",
        location: "City Center",
        city: "Hawassa",
        region: "Sidama",
        pricePerNight: "1200.00",
        currency: "ETB",
        maxGuests: 3,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["wifi", "kitchen", "workspace", "lake_proximity"],
        images: ["/test-property-5.jpg"],
        isActive: true,
        rating: "4.6",
        reviewCount: 9
      },
    ];

    const insertedProperties = await db.insert(properties).values(testProperties).returning();
    console.log(`   ✅ Created ${insertedProperties.length} test properties\n`);

    // 3. Create Property Info for Lemlem AI
    console.log("3️⃣ Creating property information for Lemlem AI...");
    
    const propertyInfoData = insertedProperties.map((prop, index) => ({
      propertyId: prop.id,
      lockboxCode: `${123456 + index}`,
      lockboxLocation: "Under the front doormat",
      parkingInstructions: "Free street parking available",
      entryInstructions: "Use lockbox code to get the key",
      wifiNetwork: `ALGA_TEST_${index + 1}`,
      wifiPassword: `TestWifi${index + 1}!`,
      hostEmergencyPhone: "+251911222333",
      checkInTime: "2:00 PM",
      checkOutTime: "11:00 AM",
      quietHours: "10:00 PM - 7:00 AM",
      smokingAllowed: false,
      petsAllowed: index % 2 === 0,
      partiesAllowed: false,
    }));

    await db.insert(propertyInfo).values(propertyInfoData);
    console.log(`   ✅ Created property info for ${propertyInfoData.length} properties\n`);

    // 4. Create Test Bookings
    console.log("4️⃣ Creating test bookings...");
    
    const testBookings = [
      {
        propertyId: insertedProperties[0].id,
        guestId: "insa-guest-001",
        checkIn: new Date("2025-12-01T14:00:00"),
        checkOut: new Date("2025-12-05T11:00:00"),
        guests: 2,
        totalPrice: "6000.00",
        currency: "ETB",
        status: "confirmed",
        paymentMethod: "telebirr",
        paymentStatus: "paid",
        paymentRef: "TB-TEST-001",
        algaCommission: "720.00", // 12%
        vat: "900.00", // 15%
        withholding: "120.00", // 2%
        hostPayout: "4260.00",
      },
      {
        propertyId: insertedProperties[1].id,
        guestId: "insa-guest-001",
        checkIn: new Date("2025-11-15T14:00:00"),
        checkOut: new Date("2025-11-20T11:00:00"),
        guests: 4,
        totalPrice: "17500.00",
        currency: "ETB",
        status: "completed",
        paymentMethod: "cbe",
        paymentStatus: "paid",
        paymentRef: "CBE-TEST-002",
        algaCommission: "2100.00",
        vat: "2625.00",
        withholding: "350.00",
        hostPayout: "12425.00",
      },
      {
        propertyId: insertedProperties[2].id,
        guestId: "insa-guest-001",
        checkIn: new Date("2025-12-10T14:00:00"),
        checkOut: new Date("2025-12-13T11:00:00"),
        guests: 2,
        totalPrice: "2400.00",
        currency: "ETB",
        status: "pending",
        paymentMethod: "telebirr",
        paymentStatus: "pending",
        algaCommission: "288.00",
        vat: "360.00",
        withholding: "48.00",
        hostPayout: "1704.00",
      },
    ];

    const insertedBookings = await db.insert(bookings).values(testBookings).returning();
    console.log(`   ✅ Created ${insertedBookings.length} test bookings\n`);

    // 5. Create Access Codes
    console.log("5️⃣ Creating access codes...");
    
    const accessCodeData = insertedBookings.slice(0, 2).map((booking, index) => ({
      bookingId: booking.id,
      propertyId: booking.propertyId,
      guestId: booking.guestId,
      code: `${123456 + index}`,
      validFrom: booking.checkIn,
      validTo: booking.checkOut,
      status: "active"
    }));

    await db.insert(accessCodes).values(accessCodeData);
    console.log(`   ✅ Created ${accessCodeData.length} access codes\n`);

    // 6. Create Reviews
    console.log("6️⃣ Creating reviews...");
    
    const testReviews = [
      {
        propertyId: insertedProperties[1].id,
        bookingId: insertedBookings[1].id,
        reviewerId: "insa-guest-001",
        rating: 5,
        comment: "Absolutely stunning villa! The lake view was breathtaking and the host was incredibly helpful. Highly recommend!",
        cleanliness: 5,
        communication: 5,
        accuracy: 5,
        location: 5,
        value: 5,
      }
    ];

    await db.insert(reviews).values(testReviews);
    console.log(`   ✅ Created ${testReviews.length} reviews\n`);

    // 7. Create Delala Agent
    console.log("7️⃣ Creating Delala agent...");
    
    const testAgent = {
      userId: "insa-agent-001",
      fullName: "INSA Agent User",
      phoneNumber: "+251911111005",
      telebirrAccount: "+251911111005",
      city: "Addis Ababa",
      status: "approved",
      verifiedBy: "insa-admin-001",
    };

    const insertedAgent = await db.insert(agents).values([testAgent]).returning();
    console.log(`   ✅ Created Delala agent\n`);

    // 8. Link Agent to Properties
    console.log("8️⃣ Linking agent to properties...");
    
    const agentPropertyLinks = [
      {
        agentId: insertedAgent[0].id,
        propertyId: insertedProperties[0].id,
        linkedAt: new Date(),
        expiresAt: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000), // 36 months
      },
      {
        agentId: insertedAgent[0].id,
        propertyId: insertedProperties[1].id,
        linkedAt: new Date(),
        expiresAt: new Date(Date.now() + 36 * 30 * 24 * 60 * 60 * 1000),
      }
    ];

    await db.insert(agentProperties).values(agentPropertyLinks);
    console.log(`   ✅ Linked agent to ${agentPropertyLinks.length} properties\n`);

    // 9. Create Agent Commissions
    console.log("9️⃣ Creating agent commissions...");
    
    const testCommissions = [
      {
        agentId: insertedAgent[0].id,
        bookingId: insertedBookings[0].id,
        propertyId: insertedProperties[0].id,
        bookingTotal: "6000.00",
        commissionRate: "5.00",
        commissionAmount: "300.00", // 5% of 6000
        status: "paid",
        telebirrTransactionId: "TB-COMM-001",
        paidAt: new Date(),
      }
    ];

    await db.insert(agentCommissions).values(testCommissions);
    console.log(`   ✅ Created ${testCommissions.length} agent commissions\n`);

    // 10. Create Service Provider
    console.log("🔟 Creating service provider...");
    
    const testServiceProvider = {
      userId: "insa-service-001",
      businessName: "INSA Test Cleaning Services",
      serviceType: "cleaning",
      description: "Professional cleaning services for properties. Quick turnaround, eco-friendly products.",
      pricingModel: "flat_rate",
      basePrice: "800.00",
      currency: "ETB",
      city: "Addis Ababa",
      region: "Addis Ababa",
      address: "Bole, Addis Ababa",
      verificationStatus: "approved",
      verifiedBy: "insa-admin-001",
      rating: "4.8",
      totalJobsCompleted: 15,
      isActive: true
    };

    const insertedServiceProvider = await db.insert(serviceProviders).values([testServiceProvider]).returning();
    console.log(`   ✅ Created service provider\n`);

    // 11. Create Service Booking
    console.log("1️⃣1️⃣ Creating service booking...");
    
    const testServiceBooking = {
      serviceProviderId: insertedServiceProvider[0].id,
      guestId: "insa-guest-001",
      serviceType: "cleaning",
      scheduledDate: new Date("2025-12-06T10:00:00"),
      scheduledTime: "10:00 AM",
      propertyLocation: "Addis Ababa",
      status: "confirmed",
      totalPrice: "800.00",
      currency: "ETB",
      algaCommission: "120.00", // 15%
      providerPayout: "680.00", // 85%
      paymentStatus: "paid",
      paymentRef: "SVC-TEST-001",
      payoutStatus: "pending"
    };

    await db.insert(serviceBookings).values([testServiceBooking]);
    console.log(`   ✅ Created service booking\n`);

    // 12. Create Lemlem Chat Samples
    console.log("1️⃣2️⃣ Creating Lemlem chat samples...");
    
    const lemlemChatSamples = [
      {
        userId: "insa-guest-001",
        propertyId: insertedProperties[0].id,
        message: "What is the WiFi password?",
        isUser: true,
        usedTemplate: false
      },
      {
        userId: "insa-guest-001",
        propertyId: insertedProperties[0].id,
        message: `እንኳን ደስ አለዎት ውድ እንግዳ! (Welcome, dear guest!) The WiFi password is: TestWifi1!`,
        isUser: false,
        usedTemplate: true,
        aiModel: null,
        tokensUsed: null,
        estimatedCost: null
      }
    ];

    await db.insert(lemlemChats).values(lemlemChatSamples);
    console.log(`   ✅ Created Lemlem chat samples\n`);

    console.log("\n✅ INSA Test Data Seeding Complete!");
    console.log("\n📋 Summary:");
    console.log(`   • Users: ${testUsers.length}`);
    console.log(`   • Properties: ${insertedProperties.length}`);
    console.log(`   • Bookings: ${insertedBookings.length}`);
    console.log(`   • Reviews: ${testReviews.length}`);
    console.log(`   • Access Codes: ${accessCodeData.length}`);
    console.log(`   • Agents: 1`);
    console.log(`   • Agent Commissions: ${testCommissions.length}`);
    console.log(`   • Service Providers: 1`);
    console.log(`   • Service Bookings: 1`);
    console.log(`   • Lemlem Chats: ${lemlemChatSamples.length}`);
    
    console.log("\n🔑 Test Credentials:");
    console.log(`   Password for all accounts: ${INSA_TEST_PASSWORD}`);
    console.log(`   See docs/insa/INSA_TEST_CREDENTIALS.md for complete list\n`);

  } catch (error) {
    console.error("❌ Error seeding INSA test data:", error);
    throw error;
  }
}

// Run the seeding function
seedINSATestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

export { seedINSATestData };
