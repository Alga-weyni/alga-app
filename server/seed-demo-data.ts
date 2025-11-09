/**
 * COMPREHENSIVE DEMO DATA SEEDER
 * For INSA/Investor/Partner Demonstrations
 * 
 * Realistic Ethiopian operational data:
 * - 50+ agents across Addis Ababa zones
 * - 100+ properties (Addis, Bishoftu, Adama)
 * - 500+ transactions (TeleBirr, Chapa, Stripe)
 * - Hardware deployments with warranty tracking
 * - Marketing campaigns with metrics
 * - INSA compliance records
 */

import { db } from './db';
import { users, properties, agents, bookings } from '../shared/schema';
import { 
  hardwareDeployments, 
  paymentTransactions, 
  marketingCampaigns, 
  systemAlerts, 
  insaCompliance 
} from '../shared/schema';
import bcrypt from 'bcrypt';

const ADDIS_ZONES = ['Bole', 'CMC', 'Gerji', 'Megenagna', 'Piassa', 'Merkato', 'Lebu', 'Gurd Shola'];
const CITIES = ['Addis Ababa', 'Bishoftu', 'Adama', 'Hawassa', 'Bahir Dar'];
const PROPERTY_TYPES = ['apartment', 'condo', 'villa', 'studio', 'guesthouse'];

// Ethiopian names for realism
const FIRST_NAMES = [
  'Abebe', 'Kebede', 'Mulugeta', 'Tadesse', 'Tesfaye', 'Yohannes', 'Gebre', 'Haile',
  'Marta', 'Tigist', 'Selamawit', 'Hanna', 'Rahel', 'Sara', 'Eden', 'Bethlehem',
  'Daniel', 'Samuel', 'Michael', 'David', 'Solomon', 'Abraham', 'Isaac', 'Jacob',
  'Meseret', 'Almaz', 'Tsehai', 'Aster', 'Birhane', 'Chaltu', 'Derartu', 'Ejigayehu'
];

const LAST_NAMES = [
  'Tekle', 'Mengistu', 'Hailu', 'Bekele', 'Alemu', 'Worku', 'Gebremariam', 'Tesfa',
  'Negash', 'Getachew', 'Demissie', 'Tefera', 'Assefa', 'Tadele', 'Desta', 'Lemma',
  'Abera', 'Yosef', 'Girma', 'Mulatu', 'Kebede', 'Admasu', 'Berhanu', 'Chala'
];

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomName(): { first: string; last: string; full: string } {
  const first = randomItem(FIRST_NAMES);
  const last = randomItem(LAST_NAMES);
  return { first, last, full: `${first} ${last}` };
}

function randomPhone(): string {
  const prefixes = ['0911', '0912', '0913', '0914', '0915', '0916', '0917', '0918'];
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `+251${randomItem(prefixes).slice(1)}${suffix}`;
}

function randomDate(daysBack: number): Date {
  const now = new Date();
  const past = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function seedDemoData() {
  console.log('🌱 Starting comprehensive demo data seeding...\n');

  // 1. AGENTS (50+ across Addis zones)
  console.log('👥 Seeding 50 agents across Addis Ababa zones...');
  const agentData = [];
  
  for (let i = 0; i < 55; i++) {
    const name = randomName();
    const zone = randomItem(ADDIS_ZONES);
    const daysAgo = Math.floor(Math.random() * 180); // 0-6 months ago
    const activeProps = Math.floor(Math.random() * 8);
    const totalProps = activeProps + Math.floor(Math.random() * 5);
    
    agentData.push({
      fullName: name.full,
      phoneNumber: randomPhone(),
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@agent.alga.et`,
      zone,
      idVerified: Math.random() > 0.1, // 90% verified
      activeProperties: activeProps,
      totalProperties: totalProps,
      commissionEarned: (Math.random() * 50000 + 5000).toFixed(2),
      contractStartDate: randomDate(daysAgo).toISOString().split('T')[0],
      contractEndDate: new Date(Date.now() + (36 - daysAgo / 30) * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: Math.random() > 0.15 ? 'active' : 'inactive',
      createdAt: randomDate(daysAgo),
    });
  }

  await db.insert(agents).values(agentData);
  console.log(`✅ Seeded ${agentData.length} agents\n`);

  // 2. USERS (for property owners/guests)
  console.log('👤 Seeding 80 users (hosts and guests)...');
  const userData = [];
  
  for (let i = 0; i < 80; i++) {
    const name = randomName();
    const role = i < 30 ? 'host' : 'guest';
    
    userData.push({
      fullName: name.full,
      phoneNumber: randomPhone(),
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@alga.et`,
      passwordHash: await bcrypt.hash('Demo2025!', 10),
      role,
      isVerified: Math.random() > 0.2, // 80% verified
      createdAt: randomDate(365),
    });
  }

  const insertedUsers = await db.insert(users).values(userData).returning();
  console.log(`✅ Seeded ${insertedUsers.length} users\n`);

  // 3. PROPERTIES (100+ across cities)
  console.log('🏠 Seeding 120 properties across Addis, Bishoftu, Adama...');
  const propertyData = [];
  const hostUsers = insertedUsers.filter(u => u.role === 'host');

  for (let i = 0; i < 120; i++) {
    const city = i < 70 ? 'Addis Ababa' : randomItem(['Bishoftu', 'Adama', 'Hawassa']);
    const zone = city === 'Addis Ababa' ? randomItem(ADDIS_ZONES) : null;
    const propertyType = randomItem(PROPERTY_TYPES);
    const hostUser = randomItem(hostUsers);
    
    propertyData.push({
      hostId: hostUser.id,
      title: `${propertyType === 'apartment' ? 'Modern' : propertyType === 'villa' ? 'Luxury' : 'Cozy'} ${propertyType} in ${zone || city}`,
      description: `Beautiful ${propertyType} perfect for travelers. Located in ${zone || city}, close to amenities and attractions.`,
      propertyType,
      address: `${zone || city}, ${city}, Ethiopia`,
      city,
      neighborhood: zone,
      latitude: city === 'Addis Ababa' ? '9.03' : city === 'Bishoftu' ? '8.75' : '8.54',
      longitude: city === 'Addis Ababa' ? '38.74' : city === 'Bishoftu' ? '38.98' : '39.27',
      pricePerNight: (Math.random() * 3000 + 500).toFixed(2),
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      maxGuests: Math.floor(Math.random() * 6) + 2,
      amenities: ['wifi', 'kitchen', 'parking', 'ac', 'tv'],
      images: [`https://picsum.photos/seed/${i}/800/600`],
      isAvailable: Math.random() > 0.15, // 85% available
      verificationStatus: Math.random() > 0.2 ? 'verified' : 'pending',
      createdAt: randomDate(180),
    });
  }

  const insertedProperties = await db.insert(properties).values(propertyData).returning();
  console.log(`✅ Seeded ${insertedProperties.length} properties\n`);

  // 4. BOOKINGS (generating transaction history)
  console.log('📅 Seeding 300 bookings...');
  const bookingData = [];
  const guestUsers = insertedUsers.filter(u => u.role === 'guest');

  for (let i = 0; i < 300; i++) {
    const property = randomItem(insertedProperties);
    const guest = randomItem(guestUsers);
    const daysAgo = Math.floor(Math.random() * 120);
    const checkIn = randomDate(daysAgo);
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000);
    const totalPrice = (parseFloat(property.pricePerNight) * nights).toFixed(2);
    
    bookingData.push({
      propertyId: property.id,
      guestId: guest.id,
      checkInDate: checkIn.toISOString().split('T')[0],
      checkOutDate: checkOut.toISOString().split('T')[0],
      numberOfGuests: Math.floor(Math.random() * property.maxGuests) + 1,
      totalPrice,
      status: Math.random() > 0.2 ? 'confirmed' : Math.random() > 0.5 ? 'completed' : 'cancelled',
      paymentStatus: Math.random() > 0.1 ? 'paid' : 'pending',
      createdAt: randomDate(daysAgo + 7),
    });
  }

  await db.insert(bookings).values(bookingData);
  console.log(`✅ Seeded ${bookingData.length} bookings\n`);

  // 5. HARDWARE DEPLOYMENTS
  console.log('🔧 Seeding 45 hardware deployments...');
  const hardwareTypes = ['lockbox', 'camera', 'smart_lock', 'thermostat'];
  const manufacturers = ['Yale', 'Kwikset', 'August', 'Ring', 'Nest', 'Ecobee'];
  const hardwareData = [];

  for (let i = 0; i < 45; i++) {
    const type = randomItem(hardwareTypes);
    const manufacturer = randomItem(manufacturers);
    const installDate = randomDate(365);
    const warrantyMonths = 24;
    const warrantyExpiry = new Date(installDate.getTime() + warrantyMonths * 30 * 24 * 60 * 60 * 1000);
    
    hardwareData.push({
      propertyId: randomItem(insertedProperties).id,
      hardwareType: type,
      manufacturer,
      model: `${manufacturer} ${type.toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`,
      serialNumber: `SN${Date.now()}${Math.floor(Math.random() * 10000)}`,
      installationDate: installDate.toISOString().split('T')[0],
      warrantyExpiry: warrantyExpiry.toISOString().split('T')[0],
      purchaseCost: (Math.random() * 15000 + 3000).toFixed(2),
      status: Math.random() > 0.1 ? 'active' : 'maintenance',
    });
  }

  await db.insert(hardwareDeployments).values(hardwareData);
  console.log(`✅ Seeded ${hardwareData.length} hardware deployments\n`);

  // 6. PAYMENT TRANSACTIONS (500+)
  console.log('💰 Seeding 550 payment transactions...');
  const paymentGateways = ['telebirr', 'chapa', 'stripe'];
  const paymentData = [];

  for (let i = 0; i < 550; i++) {
    const gateway = randomItem(paymentGateways);
    const amount = (Math.random() * 50000 + 1000).toFixed(2);
    const transactionDate = randomDate(90);
    
    paymentData.push({
      bookingId: Math.floor(Math.random() * 300) + 1,
      gateway,
      transactionId: `${gateway.toUpperCase()}_${Date.now()}_${i}`,
      amount,
      currency: 'ETB',
      status: Math.random() > 0.05 ? 'completed' : 'pending',
      reconciled: Math.random() > 0.15, // 85% reconciled
      transactionDate: transactionDate.toISOString().split('T')[0],
      reconciledAt: Math.random() > 0.15 ? new Date(transactionDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null,
    });
  }

  await db.insert(paymentTransactions).values(paymentData);
  console.log(`✅ Seeded ${paymentData.length} payment transactions\n`);

  // 7. MARKETING CAMPAIGNS
  console.log('📢 Seeding 8 marketing campaigns...');
  const platforms = ['facebook', 'instagram', 'tiktok', 'telegram'];
  const campaignData = platforms.flatMap(platform => [
    {
      campaignName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} - Property Listings Launch`,
      platform,
      startDate: randomDate(60).toISOString().split('T')[0],
      endDate: randomDate(30).toISOString().split('T')[0],
      budget: (Math.random() * 50000 + 10000).toFixed(2),
      spent: (Math.random() * 40000 + 5000).toFixed(2),
      impressions: Math.floor(Math.random() * 500000 + 100000),
      reach: Math.floor(Math.random() * 200000 + 50000),
      clicks: Math.floor(Math.random() * 15000 + 3000),
      conversions: Math.floor(Math.random() * 500 + 100),
      status: 'active',
    },
    {
      campaignName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} - Agent Recruitment Q1`,
      platform,
      startDate: randomDate(45).toISOString().split('T')[0],
      endDate: randomDate(15).toISOString().split('T')[0],
      budget: (Math.random() * 30000 + 5000).toFixed(2),
      spent: (Math.random() * 25000 + 3000).toFixed(2),
      impressions: Math.floor(Math.random() * 300000 + 50000),
      reach: Math.floor(Math.random() * 150000 + 30000),
      clicks: Math.floor(Math.random() * 8000 + 2000),
      conversions: Math.floor(Math.random() * 200 + 50),
      status: Math.random() > 0.5 ? 'active' : 'paused',
    },
  ]);

  await db.insert(marketingCampaigns).values(campaignData);
  console.log(`✅ Seeded ${campaignData.length} marketing campaigns\n`);

  // 8. SYSTEM ALERTS
  console.log('⚠️  Seeding 12 system alerts...');
  const alertData = [
    {
      pillar: 'agent_governance',
      alertType: 'commission_expiring',
      severity: 'high',
      title: 'Commission Contract Expiring Soon',
      description: '3 agents have contracts expiring within 30 days',
      entityType: 'agent',
      entityId: 5,
      status: 'active',
    },
    {
      pillar: 'hardware_deployment',
      alertType: 'warranty_expiring',
      severity: 'critical',
      title: 'Warranty Expiring: Lockbox Hardware',
      description: '5 lockbox units have warranties expiring within 15 days',
      entityType: 'hardware',
      entityId: 8,
      status: 'active',
    },
    {
      pillar: 'payment_compliance',
      alertType: 'payment_mismatch',
      severity: 'high',
      title: 'Unreconciled TeleBirr Payments',
      description: '12 TeleBirr payments pending reconciliation for 7+ days',
      entityType: 'payment',
      entityId: 45,
      status: 'active',
    },
    {
      pillar: 'supply_curation',
      alertType: 'verification_lapse',
      severity: 'medium',
      title: 'Property Verification Pending',
      description: '8 active properties awaiting operator verification for 3+ days',
      entityType: 'property',
      entityId: 23,
      status: 'active',
    },
  ];

  await db.insert(systemAlerts).values(alertData);
  console.log(`✅ Seeded ${alertData.length} system alerts\n`);

  // 9. INSA COMPLIANCE RECORDS
  console.log('🛡️  Seeding 10 INSA compliance records...');
  const complianceData = [
    {
      complianceCategory: 'Data Protection',
      requirement: 'Personal Data Encryption at Rest',
      status: 'completed',
      dueDate: randomDate(30).toISOString().split('T')[0],
      completedDate: randomDate(60).toISOString().split('T')[0],
      evidenceUrl: 'https://docs.alga.et/compliance/encryption-cert.pdf',
      assignedTo: 'Security Team',
    },
    {
      complianceCategory: 'Access Control',
      requirement: 'Role-Based Access Control Implementation',
      status: 'completed',
      dueDate: randomDate(20).toISOString().split('T')[0],
      completedDate: randomDate(45).toISOString().split('T')[0],
      evidenceUrl: 'https://docs.alga.et/compliance/rbac-implementation.pdf',
      assignedTo: 'Engineering Team',
    },
    {
      complianceCategory: 'Audit Trail',
      requirement: 'Comprehensive Activity Logging',
      status: 'completed',
      dueDate: randomDate(15).toISOString().split('T')[0],
      completedDate: randomDate(30).toISOString().split('T')[0],
      evidenceUrl: 'https://docs.alga.et/compliance/audit-logs.pdf',
      assignedTo: 'Operations Team',
    },
    {
      complianceCategory: 'Network Security',
      requirement: 'HTTPS/TLS Encryption for All Traffic',
      status: 'completed',
      dueDate: randomDate(10).toISOString().split('T')[0],
      completedDate: randomDate(25).toISOString().split('T')[0],
      evidenceUrl: 'https://docs.alga.et/compliance/tls-cert.pdf',
      assignedTo: 'Infrastructure Team',
    },
    {
      complianceCategory: 'Data Protection',
      requirement: 'Automated Data Backup System',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      completedDate: null,
      evidenceUrl: null,
      assignedTo: 'Infrastructure Team',
    },
  ];

  await db.insert(insaCompliance).values(complianceData);
  console.log(`✅ Seeded ${complianceData.length} INSA compliance records\n`);

  console.log('🎉 COMPREHENSIVE DEMO DATA SEEDING COMPLETE!\n');
  console.log('📊 Summary:');
  console.log(`   • ${agentData.length} agents`);
  console.log(`   • ${insertedUsers.length} users`);
  console.log(`   • ${insertedProperties.length} properties`);
  console.log(`   • ${bookingData.length} bookings`);
  console.log(`   • ${hardwareData.length} hardware deployments`);
  console.log(`   • ${paymentData.length} payment transactions`);
  console.log(`   • ${campaignData.length} marketing campaigns`);
  console.log(`   • ${alertData.length} system alerts`);
  console.log(`   • ${complianceData.length} INSA compliance records`);
  console.log('\n✅ System ready for INSA/investor demonstration!');
}

seedDemoData()
  .then(() => {
    console.log('\n✅ Seeding completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
