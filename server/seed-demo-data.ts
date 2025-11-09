/**
 * LEMLEM OPERATIONS DEMO DATA SEEDER
 * For Internal Operations & Investor Demonstrations
 * 
 * Realistic Ethiopian operational data:
 * - 55+ agents (Delalas) across Addis Ababa zones
 * - 120+ properties (Addis, Bishoftu, Adama)
 * - 550+ transactions (TeleBirr, Chapa, Stripe)
 * - 45 hardware deployments (lockboxes, cameras)
 * - 8 marketing campaigns (Facebook, Instagram, TikTok, Telegram)
 */

import { db } from './db';
import { 
  users, 
  properties, 
  agents, 
  bookings,
  hardwareDeployments,
  paymentTransactions,
  marketingCampaigns,
  systemAlerts
} from '../shared/schema';
import bcrypt from 'bcrypt';

const ADDIS_ZONES = ['Bole', 'CMC', 'Gerji', 'Megenagna', 'Piassa', 'Merkato', 'Lebu', 'Gurd Shola'];
const CITIES = ['Addis Ababa', 'Bishoftu', 'Adama'];
const REGIONS = ['Addis Ababa', 'Oromia', 'Oromia'];
const PROPERTY_TYPES = ['hotel', 'guesthouse', 'traditional_home', 'eco_lodge'];

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

function generateTelebirrAccount(): string {
  return `+251${Math.floor(Math.random() * 900000000 + 100000000)}`;
}

async function seedDemoData() {
  console.log('🌱 Starting Lemlem Operations demo data seeding...\n');

  // 1. USERS (for agents, hosts, guests)
  console.log('👤 Seeding 135 users (55 agents, 30 hosts, 50 guests)...');
  const userData = [];
  
  // Create users for agents
  for (let i = 0; i < 55; i++) {
    const name = randomName();
    userData.push({
      id: `agent-${i + 1}`,
      fullName: name.full,
      phoneNumber: randomPhone(),
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@agent.alga.et`,
      password: await bcrypt.hash('Agent2025!', 10),
      role: 'host', // Agents are also hosts
      verified: Math.random() > 0.1,
      createdAt: randomDate(180),
    });
  }

  // Create users for hosts
  for (let i = 0; i < 30; i++) {
    const name = randomName();
    userData.push({
      id: `host-${i + 1}`,
      fullName: name.full,
      phoneNumber: randomPhone(),
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@host.alga.et`,
      password: await bcrypt.hash('Host2025!', 10),
      role: 'host',
      verified: Math.random() > 0.2,
      createdAt: randomDate(365),
    });
  }

  // Create users for guests
  for (let i = 0; i < 50; i++) {
    const name = randomName();
    userData.push({
      id: `guest-${i + 1}`,
      fullName: name.full,
      phoneNumber: randomPhone(),
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@alga.et`,
      password: await bcrypt.hash('Guest2025!', 10),
      role: 'guest',
      verified: Math.random() > 0.2,
      createdAt: randomDate(365),
    });
  }

  const insertedUsers = await db.insert(users).values(userData).returning();
  console.log(`✅ Seeded ${insertedUsers.length} users\n`);

  const agentUsers = insertedUsers.filter(u => u.id.startsWith('agent-'));
  const hostUsers = insertedUsers.filter(u => u.id.startsWith('host-'));
  const guestUsers = insertedUsers.filter(u => u.id.startsWith('guest-'));

  // 2. AGENTS (55 Delalas across Addis zones)
  console.log('👥 Seeding 55 agents (Delalas) across Addis Ababa zones...');
  const agentData = [];
  
  for (let i = 0; i < 55; i++) {
    const agentUser = agentUsers[i];
    const city = randomItem(ADDIS_ZONES);
    const daysAgo = Math.floor(Math.random() * 180);
    const activeProps = Math.floor(Math.random() * 8);
    const totalProps = activeProps + Math.floor(Math.random() * 5);
    
    agentData.push({
      userId: agentUser.id,
      fullName: agentUser.fullName,
      phoneNumber: agentUser.phoneNumber,
      telebirrAccount: generateTelebirrAccount(),
      city,
      subCity: Math.random() > 0.5 ? `${city} ${Math.floor(Math.random() * 10) + 1}` : null,
      status: Math.random() > 0.15 ? 'approved' : 'pending',
      totalEarnings: (Math.random() * 50000 + 5000).toFixed(2),
      totalProperties: totalProps,
      activeProperties: activeProps,
      createdAt: randomDate(daysAgo),
    });
  }

  await db.insert(agents).values(agentData);
  console.log(`✅ Seeded ${agentData.length} agents\n`);

  // 3. PROPERTIES (120 across cities)
  console.log('🏠 Seeding 120 properties across Addis, Bishoftu, Adama...');
  const propertyData = [];

  for (let i = 0; i < 120; i++) {
    const cityIndex = i < 70 ? 0 : i < 95 ? 1 : 2;
    const city = CITIES[cityIndex];
    const region = REGIONS[cityIndex];
    const zone = city === 'Addis Ababa' ? randomItem(ADDIS_ZONES) : city;
    const propertyType = randomItem(PROPERTY_TYPES);
    const hostUser = randomItem([...agentUsers, ...hostUsers]);
    
    propertyData.push({
      hostId: hostUser.id,
      title: `${propertyType === 'hotel' ? 'Modern' : propertyType === 'guesthouse' ? 'Cozy' : propertyType === 'eco_lodge' ? 'Luxury' : 'Traditional'} ${propertyType.replace('_', ' ')} in ${zone}`,
      description: `Beautiful ${propertyType.replace('_', ' ')} perfect for travelers. Located in ${zone}, ${city}, close to amenities and attractions. Experience authentic Ethiopian hospitality.`,
      type: propertyType,
      location: zone,
      city,
      region,
      address: `${zone}, ${city}, Ethiopia`,
      latitude: city === 'Addis Ababa' ? (9.0 + Math.random() * 0.1).toFixed(8) : city === 'Bishoftu' ? (8.75 + Math.random() * 0.05).toFixed(8) : (8.54 + Math.random() * 0.05).toFixed(8),
      longitude: city === 'Addis Ababa' ? (38.74 + Math.random() * 0.1).toFixed(8) : city === 'Bishoftu' ? (38.98 + Math.random() * 0.05).toFixed(8) : (39.27 + Math.random() * 0.05).toFixed(8),
      pricePerNight: (Math.random() * 3000 + 500).toFixed(2),
      currency: 'ETB',
      bedrooms: Math.floor(Math.random() * 4) + 1,
      bathrooms: Math.floor(Math.random() * 3) + 1,
      maxGuests: Math.floor(Math.random() * 6) + 2,
      amenities: ['wifi', 'kitchen', 'parking', 'ac', 'tv', 'hot_water'],
      images: [`https://picsum.photos/seed/${i}/800/600`],
      isActive: Math.random() > 0.15,
      status: Math.random() > 0.2 ? 'approved' : 'pending',
      createdAt: randomDate(180),
    });
  }

  const insertedProperties = await db.insert(properties).values(propertyData).returning();
  console.log(`✅ Seeded ${insertedProperties.length} properties\n`);

  // 4. BOOKINGS (300 transactions)
  console.log('📅 Seeding 300 bookings...');
  const bookingData = [];

  for (let i = 0; i < 300; i++) {
    const property = randomItem(insertedProperties);
    const guest = randomItem(guestUsers);
    const daysAgo = Math.floor(Math.random() * 120);
    const checkIn = randomDate(daysAgo);
    const nights = Math.floor(Math.random() * 7) + 1;
    const checkOut = new Date(checkIn.getTime() + nights * 24 * 60 * 60 * 1000);
    const totalPrice = parseFloat((parseFloat(property.pricePerNight) * nights).toFixed(2));
    const commission = (totalPrice * 0.10).toFixed(2);
    const vat = (totalPrice * 0.15).toFixed(2);
    const withholding = (totalPrice * 0.02).toFixed(2);
    const hostPayout = (totalPrice - parseFloat(commission) - parseFloat(vat) - parseFloat(withholding)).toFixed(2);
    
    bookingData.push({
      propertyId: property.id,
      guestId: guest.id,
      checkIn,
      checkOut,
      guests: Math.floor(Math.random() * property.maxGuests) + 1,
      totalPrice: totalPrice.toString(),
      currency: 'ETB',
      status: Math.random() > 0.2 ? 'confirmed' : Math.random() > 0.5 ? 'completed' : 'cancelled',
      paymentMethod: randomItem(['telebirr', 'chapa', 'stripe', 'cbe']),
      paymentStatus: Math.random() > 0.1 ? 'paid' : 'pending',
      algaCommission: commission,
      vat,
      withholding,
      hostPayout,
      createdAt: randomDate(daysAgo + 7),
    });
  }

  const insertedBookings = await db.insert(bookings).values(bookingData).returning();
  console.log(`✅ Seeded ${insertedBookings.length} bookings\n`);

  // 5. PAYMENT TRANSACTIONS (550)
  console.log('💰 Seeding 550 payment transactions...');
  const paymentData = [];

  for (let i = 0; i < 550; i++) {
    const gateway = randomItem(['telebirr', 'chapa', 'stripe']);
    const amount = (Math.random() * 50000 + 1000).toFixed(2);
    const transactionDate = randomDate(90);
    
    paymentData.push({
      transactionId: `${gateway.toUpperCase()}_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`,
      paymentGateway: gateway,
      transactionType: randomItem(['booking', 'commission', 'payout']),
      amount,
      currency: 'ETB',
      status: Math.random() > 0.05 ? 'completed' : 'pending',
      relatedBookingId: i < 300 ? insertedBookings[i].id : null,
      reconciled: Math.random() > 0.15,
      reconciledAt: Math.random() > 0.15 ? new Date(transactionDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      createdAt: transactionDate,
    });
  }

  await db.insert(paymentTransactions).values(paymentData);
  console.log(`✅ Seeded ${paymentData.length} payment transactions\n`);

  // 6. HARDWARE DEPLOYMENTS (45)
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
      purchaseDate: new Date(installDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      installationDate: installDate,
      warrantyExpiry,
      status: Math.random() > 0.1 ? 'active' : 'maintenance',
      cost: (Math.random() * 15000 + 3000).toFixed(2),
      createdAt: installDate,
    });
  }

  await db.insert(hardwareDeployments).values(hardwareData);
  console.log(`✅ Seeded ${hardwareData.length} hardware deployments\n`);

  // 7. MARKETING CAMPAIGNS (8)
  console.log('📢 Seeding 8 marketing campaigns...');
  const platforms = ['facebook', 'instagram', 'tiktok', 'telegram'];
  const campaignData = platforms.flatMap(platform => [
    {
      campaignName: `${platform.charAt(0).toUpperCase() + platform.slice(1)} - Property Listings Launch`,
      campaignType: 'paid_ads',
      platform,
      startDate: randomDate(60),
      endDate: randomDate(30),
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
      campaignType: 'social_media',
      platform,
      startDate: randomDate(45),
      endDate: randomDate(15),
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

  // 8. SYSTEM ALERTS (for Operations Dashboard)
  console.log('⚠️  Seeding 6 system alerts...');
  const alertData = [
    {
      pillar: 'agent_governance',
      alertType: 'commission_expiring',
      severity: 'high',
      title: 'Agent Commission Contracts Expiring',
      description: '3 agent contracts will expire within 30 days - renewal required',
      entityType: 'agent',
      entityId: 5,
      status: 'active',
    },
    {
      pillar: 'hardware_deployment',
      alertType: 'warranty_expiring',
      severity: 'critical',
      title: 'Hardware Warranty Expiring Soon',
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
      description: '8 active properties awaiting operator verification',
      entityType: 'property',
      entityId: 23,
      status: 'active',
    },
  ];

  await db.insert(systemAlerts).values(alertData);
  console.log(`✅ Seeded ${alertData.length} system alerts\n`);

  console.log('🎉 LEMLEM OPERATIONS DEMO DATA SEEDING COMPLETE!\n');
  console.log('📊 Summary:');
  console.log(`   • ${agentData.length} agents (Delalas)`);
  console.log(`   • ${insertedUsers.length} users`);
  console.log(`   • ${insertedProperties.length} properties`);
  console.log(`   • ${insertedBookings.length} bookings`);
  console.log(`   • ${hardwareData.length} hardware deployments`);
  console.log(`   • ${paymentData.length} payment transactions`);
  console.log(`   • ${campaignData.length} marketing campaigns`);
  console.log(`   • ${alertData.length} system alerts`);
  console.log('\n✅ Lemlem Operations Dashboard ready for demonstration!');
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
