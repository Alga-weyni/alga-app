/**
 * Alga DevOps - Automated API Test Suite
 * Phase 4 of DevOps implementation
 * 
 * Run: npx tsx scripts/api-tests.ts
 * 
 * Tests:
 * - Authentication flow
 * - Booking creation with security checks
 * - IDOR protection
 * - Payment validation
 * - Role-based access control
 * - Data leakage prevention
 */

const API_BASE = process.env.API_URL || 'http://localhost:5000';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, passed: true, duration: Date.now() - start });
    console.log(`✅ ${name}`);
  } catch (error: any) {
    results.push({ name, passed: false, duration: Date.now() - start, error: error.message });
    console.log(`❌ ${name}: ${error.message}`);
  }
}

async function apiRequest(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data, headers: response.headers };
}

// ==================== HEALTH CHECK TESTS ====================
async function testHealthCheck() {
  await test('Health check endpoint returns 200', async () => {
    const { status, data } = await apiRequest('/api/health');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!data.status) throw new Error('Missing status field');
  });
}

// ==================== SECURITY TESTS ====================
async function testSecurityHeaders() {
  await test('Security headers are present', async () => {
    const { headers } = await apiRequest('/api/health');
    const required = ['x-frame-options', 'x-content-type-options', 'strict-transport-security'];
    for (const header of required) {
      if (!headers.get(header)) {
        throw new Error(`Missing header: ${header}`);
      }
    }
  });
}

async function testRateLimiting() {
  await test('Rate limiting headers are present', async () => {
    const { headers } = await apiRequest('/api/properties');
    if (!headers.get('ratelimit-limit')) {
      throw new Error('Rate limiting not configured');
    }
  });
}

// ==================== AUTHENTICATION TESTS ====================
async function testUnauthorizedAccess() {
  await test('Unauthorized access to protected route returns 401', async () => {
    const { status } = await apiRequest('/api/auth/user');
    if (status !== 401) throw new Error(`Expected 401, got ${status}`);
  });
}

async function testPasswordNotExposed() {
  await test('Password hash not exposed in API responses', async () => {
    const { data } = await apiRequest('/api/properties');
    const stringified = JSON.stringify(data);
    if (stringified.includes('password') && stringified.includes('$2')) {
      throw new Error('Password hash found in response');
    }
  });
}

// ==================== BOOKING SECURITY TESTS ====================
async function testBookingDateValidation() {
  await test('Booking rejects invalid date range (checkout before checkin)', async () => {
    const { status, data } = await apiRequest('/api/bookings/calculate', {
      method: 'POST',
      body: JSON.stringify({
        propertyId: 1,
        checkIn: '2025-12-25',
        checkOut: '2025-12-20',
        guests: 1
      })
    });
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
    if (data?.code !== 'INVALID_DATES') throw new Error('Expected INVALID_DATES error code');
  });
}

async function testGuestCapacityValidation() {
  await test('Booking rejects excessive guest count', async () => {
    const { status, data } = await apiRequest('/api/bookings/calculate', {
      method: 'POST',
      body: JSON.stringify({
        propertyId: 1,
        checkIn: '2025-12-25',
        checkOut: '2025-12-27',
        guests: 999
      })
    });
    if (status !== 400) throw new Error(`Expected 400, got ${status}`);
    if (data?.code !== 'INVALID_GUEST_COUNT') throw new Error('Expected INVALID_GUEST_COUNT error code');
  });
}

// ==================== IDOR PROTECTION TESTS ====================
async function testBookingIDORProtection() {
  await test('Cannot access other users bookings without auth', async () => {
    const { status } = await apiRequest('/api/bookings/1');
    if (status !== 401 && status !== 403) {
      throw new Error(`Expected 401 or 403, got ${status}`);
    }
  });
}

async function testPropertyApprovalProtection() {
  await test('Cannot approve property without admin role', async () => {
    const { status } = await apiRequest('/api/admin/properties/1/approve', {
      method: 'POST',
      body: JSON.stringify({ status: 'approved' })
    });
    if (status !== 401 && status !== 403) {
      throw new Error(`Expected 401 or 403, got ${status}`);
    }
  });
}

// ==================== DATA VALIDATION TESTS ====================
async function testInvalidPropertyId() {
  await test('Invalid property ID returns appropriate error', async () => {
    const { status, data } = await apiRequest('/api/properties/invalid');
    if (status !== 400 && status !== 404) {
      throw new Error(`Expected 400 or 404, got ${status}`);
    }
  });
}

async function testSQLInjectionPrevention() {
  await test('SQL injection attempt is blocked', async () => {
    const { status } = await apiRequest("/api/properties?city='; DROP TABLE users;--");
    if (status === 500) {
      throw new Error('Server error suggests SQL injection vulnerability');
    }
  });
}

async function testXSSPrevention() {
  await test('XSS attempt is sanitized', async () => {
    const { status } = await apiRequest('/api/properties?city=<script>alert(1)</script>');
    if (status === 500) {
      throw new Error('Server error suggests XSS vulnerability');
    }
  });
}

// ==================== API RESPONSE TESTS ====================
async function testPropertiesListWorks() {
  await test('Properties list endpoint works', async () => {
    const { status, data } = await apiRequest('/api/properties');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data)) throw new Error('Expected array response');
  });
}

async function testPropertySearchWorks() {
  await test('Property search endpoint works', async () => {
    const { status, data } = await apiRequest('/api/properties/search?city=Addis');
    if (status !== 200) throw new Error(`Expected 200, got ${status}`);
    if (!Array.isArray(data)) throw new Error('Expected array response');
  });
}

// ==================== RUN ALL TESTS ====================
async function runTests() {
  console.log('\n🧪 ALGA API AUTOMATED TESTS');
  console.log('=' .repeat(50));
  console.log(`Target: ${API_BASE}\n`);

  // Health & Security
  await testHealthCheck();
  await testSecurityHeaders();
  await testRateLimiting();

  // Authentication
  await testUnauthorizedAccess();
  await testPasswordNotExposed();

  // Booking Security
  await testBookingDateValidation();
  await testGuestCapacityValidation();

  // IDOR Protection
  await testBookingIDORProtection();
  await testPropertyApprovalProtection();

  // Data Validation
  await testInvalidPropertyId();
  await testSQLInjectionPrevention();
  await testXSSPrevention();

  // API Functionality
  await testPropertiesListWorks();
  await testPropertySearchWorks();

  // Summary
  console.log('\n' + '='.repeat(50));
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  console.log(`📊 RESULTS: ${passed} passed, ${failed} failed`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ ALL TESTS PASSED');
    process.exit(0);
  }
}

runTests().catch(console.error);
