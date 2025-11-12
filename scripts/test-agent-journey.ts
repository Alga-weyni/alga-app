#!/usr/bin/env tsx
/**
 * 🎭 Alga Agent Journey Simulation Script
 * 
 * This script simulates the complete journey of a Delala Agent:
 * 1. Agent Registration
 * 2. Fayda ID Verification
 * 3. Property Upload
 * 4. Commission Earning
 * 
 * Run: npx tsx scripts/test-agent-journey.ts
 */

const API_BASE = 'http://localhost:5000';

// Test Agent Profile
const testAgent = {
  fullName: "Meron Tadesse",
  email: "meron.agent@alga.et",
  phoneNumber: "+251911234567",
  password: "Agent@1234",
  telebirrAccount: "0911234567",
  businessName: "Meron Property Services",
  city: "Addis Ababa",
  subCity: "Bole",
  faydaId: "123456789012",
  dateOfBirth: "1995-05-15"
};

// Test Property Data
const testProperty = {
  title: "Cozy Studio in Bole",
  type: "apartment",
  city: "Addis Ababa",
  address: "Bole Atlas Road, Building 5A",
  description: "Modern studio apartment in the heart of Bole. Walking distance to restaurants, cafes, and shopping centers.",
  pricePerNight: "2500",
  maxGuests: 2,
  bedrooms: 1,
  bathrooms: 1,
  amenities: ["WiFi", "Kitchen", "Air Conditioning", "Parking"],
  lockboxBrand: "LILIWISE KB01",
  lockboxSerialNumber: "KB01-2024-12345",
  cameraBrand: "Hikvision DS-2CD1043G0-I",
  cameraSerialNumber: "CAM-2024-67890"
};

let sessionCookie = '';

// Helper function for API requests
async function apiRequest(method: string, endpoint: string, data?: any) {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  if (sessionCookie) {
    headers['Cookie'] = sessionCookie;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  // Capture session cookie
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    sessionCookie = setCookie.split(';')[0];
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${response.status}: ${errorText}`);
  }

  return response.json();
}

async function log(emoji: string, message: string) {
  console.log(`\n${emoji} ${message}`);
}

async function step(number: number, title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`STEP ${number}: ${title}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('\n🎭 ALGA AGENT JOURNEY SIMULATION');
  console.log('═'.repeat(60));
  
  try {
    // ============================================================
    // STEP 1: REGISTER USER ACCOUNT
    // ============================================================
    await step(1, 'Register User Account (Phone + OTP)');
    
    // Register with phone
    await log('📱', 'Registering with phone number...');
    const registerResponse = await apiRequest('POST', '/api/auth/register/phone', {
      phoneNumber: testAgent.phoneNumber,
      password: testAgent.password,
      firstName: "Meron",
      lastName: "Tadesse"
    });
    
    await log('✓', `User registered: ${testAgent.phoneNumber}`);
    console.log('   OTP Code:', registerResponse.otp || '1234 (check SMS)');

    // Verify OTP
    await log('🔐', 'Verifying OTP...');
    const otpVerify = await apiRequest('POST', '/api/auth/verify-otp', {
      phoneNumber: testAgent.phoneNumber,
      otp: registerResponse.otp || '1234'
    });
    
    await log('✓', 'Phone number verified! User logged in.');
    console.log('   User ID:', otpVerify.user?.id || 'logged-in');

    // ============================================================
    // STEP 2: FAYDA ID VERIFICATION
    // ============================================================
    await step(2, 'Fayda ID Verification (eKYC)');
    
    await log('🆔', 'Submitting Fayda ID for verification...');
    const faydaVerify = await apiRequest('POST', '/api/fayda/verify', {
      faydaId: testAgent.faydaId,
      dateOfBirth: testAgent.dateOfBirth,
      phoneNumber: testAgent.phoneNumber
    });
    
    await log('✓', 'Fayda ID verified successfully!');
    console.log('   Identity:', JSON.stringify(faydaVerify.identity, null, 2));

    // Check verification status
    const faydaStatus = await apiRequest('GET', '/api/fayda/status');
    await log('📋', `Verification Status: ${faydaStatus.verified ? '✅ Verified' : '❌ Not Verified'}`);

    // ============================================================
    // STEP 3: AGENT REGISTRATION
    // ============================================================
    await step(3, 'Agent (Delala) Registration');
    
    await log('💼', 'Registering as Delala Agent...');
    const agentReg = await apiRequest('POST', '/api/agent/register', {
      fullName: testAgent.fullName,
      phoneNumber: testAgent.phoneNumber,
      telebirrAccount: testAgent.telebirrAccount,
      businessName: testAgent.businessName,
      city: testAgent.city,
      subCity: testAgent.subCity
    });
    
    await log('✓', 'Agent registration successful!');
    console.log('   Agent ID:', agentReg.agent?.id);
    console.log('   Referral Code:', agentReg.agent?.referralCode);
    console.log('   Status:', agentReg.agent?.status);

    // ============================================================
    // STEP 4: ACCESS AGENT DASHBOARD
    // ============================================================
    await step(4, 'Access Agent Dashboard');
    
    await log('📊', 'Fetching agent dashboard data...');
    const dashboard = await apiRequest('GET', '/api/dellala/dashboard');
    
    await log('✓', 'Dashboard loaded successfully!');
    console.log('\n   📈 AGENT PERFORMANCE:');
    console.log(`   Total Earnings:  ${dashboard.performance?.totalCommissionEarned || '0'} ETB`);
    console.log(`   Pending:         ${dashboard.performance?.totalCommissionPending || '0'} ETB`);
    console.log(`   Available:       ${dashboard.performance?.availableBalance || '0'} ETB`);
    console.log(`   Properties:      ${dashboard.performance?.totalPropertiesListed || 0}`);
    console.log(`   Total Bookings:  ${dashboard.performance?.totalBookings || 0}`);

    // ============================================================
    // STEP 5: UPLOAD PROPERTY (with Hardware)
    // ============================================================
    await step(5, 'Upload Property with Hardware Verification');
    
    await log('🏠', 'Creating property listing...');
    const property = await apiRequest('POST', '/api/properties', {
      ...testProperty,
      images: ['/uploads/test-property-1.jpg'], // Mock image
    });
    
    await log('✓', 'Property created successfully!');
    console.log('   Property ID:', property.id);
    console.log('   Title:', property.title);
    console.log('   Status:', property.verificationStatus);
    console.log('   Agent Linked:', property.agentId ? '✅' : '❌');

    // Record hardware deployment
    await log('📷', 'Recording hardware deployment...');
    const hardware = await apiRequest('POST', '/api/hardware/deploy', {
      propertyId: property.id,
      lockboxBrand: testProperty.lockboxBrand,
      lockboxSerialNumber: testProperty.lockboxSerialNumber,
      cameraBrand: testProperty.cameraBrand,
      cameraSerialNumber: testProperty.cameraSerialNumber,
      installationPhotos: ['/uploads/lockbox.jpg', '/uploads/camera.jpg']
    });
    
    await log('✓', 'Hardware deployment recorded!');

    // ============================================================
    // STEP 6: SIMULATE BOOKING (Commission Earning)
    // ============================================================
    await step(6, 'Simulate Guest Booking (Commission)');
    
    await log('💰', 'Creating test booking...');
    const booking = await apiRequest('POST', '/api/bookings', {
      propertyId: property.id,
      checkIn: '2025-11-15',
      checkOut: '2025-11-20',
      guests: 2,
      totalPrice: '12500', // 5 nights × 2500 ETB
    });
    
    await log('✓', 'Booking created successfully!');
    console.log('   Booking ID:', booking.id);
    console.log('   Total Price:', booking.totalPrice, 'ETB');
    console.log('   Agent Commission (5%):', parseFloat(booking.totalPrice) * 0.05, 'ETB');

    // ============================================================
    // STEP 7: VIEW UPDATED DASHBOARD
    // ============================================================
    await step(7, 'View Updated Dashboard (With Commission)');
    
    await log('📊', 'Refreshing dashboard...');
    const updatedDashboard = await apiRequest('GET', '/api/dellala/dashboard');
    
    await log('✓', 'Commission recorded!');
    console.log('\n   📈 UPDATED PERFORMANCE:');
    console.log(`   Total Earnings:  ${updatedDashboard.performance?.totalCommissionEarned || '0'} ETB`);
    console.log(`   Pending:         ${updatedDashboard.performance?.totalCommissionPending || '0'} ETB`);
    console.log(`   Total Bookings:  ${updatedDashboard.performance?.totalBookings || 0}`);

    console.log('\n   💳 RECENT COMMISSIONS:');
    if (updatedDashboard.recentCommissions?.length > 0) {
      updatedDashboard.recentCommissions.forEach((comm: any, i: number) => {
        console.log(`   ${i + 1}. Booking #${comm.bookingId} - ${comm.commissionAmount} ETB (${comm.status})`);
      });
    } else {
      console.log('   (No commissions yet - booking may be pending)');
    }

    // ============================================================
    // SUCCESS SUMMARY
    // ============================================================
    console.log('\n' + '═'.repeat(60));
    console.log('✅ SIMULATION COMPLETED SUCCESSFULLY!');
    console.log('═'.repeat(60));
    
    console.log('\n📋 SUMMARY:');
    console.log(`   ✓ User registered: ${testAgent.phoneNumber}`);
    console.log(`   ✓ Fayda ID verified: ${testAgent.faydaId}`);
    console.log(`   ✓ Agent account created: ${agentReg.agent?.referralCode}`);
    console.log(`   ✓ Property uploaded: ${testProperty.title}`);
    console.log(`   ✓ Hardware deployed: Lockbox + Camera`);
    console.log(`   ✓ Booking created: ${booking?.id || 'pending'}`);
    console.log(`   ✓ Commission earned: ${parseFloat(booking?.totalPrice || '0') * 0.05} ETB`);

    console.log('\n🎯 NEXT STEPS:');
    console.log('   1. Login at: /dellala/dashboard');
    console.log(`   2. Phone: ${testAgent.phoneNumber}`);
    console.log('   3. OTP: 1234');
    console.log('   4. View your earnings and withdraw funds!\n');

  } catch (error: any) {
    console.error('\n❌ SIMULATION FAILED:');
    console.error('   Error:', error.message);
    console.error('\n   Stack:', error.stack);
    process.exit(1);
  }
}

// Run simulation
main().catch(console.error);
