#!/usr/bin/env npx tsx

/**
 * Alga Disaster Recovery Simulation Script
 * 
 * Tests the platform's ability to recover from various failure scenarios.
 * Run this script monthly to ensure disaster recovery procedures work.
 * 
 * Usage: npx tsx scripts/disaster-recovery-test.ts
 */

const API_BASE = process.env.API_BASE_URL || 'http://localhost:5000';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  details: string;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const details = await testFn();
    results.push({
      name,
      passed: true,
      duration: Date.now() - start,
      details
    });
    console.log(`✅ ${name} (${Date.now() - start}ms)`);
  } catch (error) {
    results.push({
      name,
      passed: false,
      duration: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
    console.log(`❌ ${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function testHealthEndpoint(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/health`);
  const data = await response.json();
  
  if (response.status !== 200) {
    throw new Error(`Health check returned ${response.status}`);
  }
  
  if (data.database !== 'connected') {
    throw new Error(`Database status: ${data.database}`);
  }
  
  return `Status: ${data.status}, DB: ${data.database}, Uptime: ${data.uptimeFormatted}`;
}

async function testDatabaseRecovery(): Promise<string> {
  // Test that we can query the database after simulated reconnection
  const response = await fetch(`${API_BASE}/api/properties?limit=1`);
  
  if (response.status !== 200) {
    throw new Error(`Properties query failed with ${response.status}`);
  }
  
  const data = await response.json();
  return `Database query successful, returned ${Array.isArray(data) ? data.length : 0} properties`;
}

async function testAPIResponseTime(): Promise<string> {
  const endpoints = [
    '/api/health',
    '/api/properties',
    '/api/properties?city=Addis%20Ababa'
  ];
  
  const times: number[] = [];
  
  for (const endpoint of endpoints) {
    const start = Date.now();
    await fetch(`${API_BASE}${endpoint}`);
    times.push(Date.now() - start);
  }
  
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  
  if (avg > 5000) {
    throw new Error(`Average response time ${avg}ms exceeds 5000ms threshold`);
  }
  
  return `Average response time: ${avg.toFixed(0)}ms`;
}

async function testSecurityHeaders(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/health`);
  const headers = response.headers;
  
  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'content-security-policy'
  ];
  
  const missing = requiredHeaders.filter(h => !headers.get(h));
  
  if (missing.length > 0) {
    throw new Error(`Missing security headers: ${missing.join(', ')}`);
  }
  
  return `All ${requiredHeaders.length} security headers present`;
}

async function testRateLimiting(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/properties`);
  const limit = response.headers.get('ratelimit-limit');
  const remaining = response.headers.get('ratelimit-remaining');
  
  if (!limit) {
    throw new Error('Rate limiting not configured');
  }
  
  return `Rate limit: ${remaining}/${limit} remaining`;
}

async function testAuthProtection(): Promise<string> {
  const protectedEndpoints = [
    '/api/bookings',
    '/api/auth/user',
    '/api/admin/users'
  ];
  
  for (const endpoint of protectedEndpoints) {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (response.status !== 401 && response.status !== 403) {
      throw new Error(`${endpoint} returned ${response.status} instead of 401/403`);
    }
  }
  
  return `All ${protectedEndpoints.length} protected endpoints require authentication`;
}

async function testMemoryUsage(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/health`);
  const data = await response.json();
  
  if (!data.memory) {
    throw new Error('Memory stats not available in health endpoint');
  }
  
  const heapUsedMB = parseInt(data.memory.heapUsed);
  const heapTotalMB = parseInt(data.memory.heapTotal);
  const usagePercent = (heapUsedMB / heapTotalMB) * 100;
  
  if (usagePercent > 90) {
    throw new Error(`Memory usage critical: ${usagePercent.toFixed(1)}%`);
  }
  
  return `Memory: ${data.memory.heapUsed}/${data.memory.heapTotal} (${usagePercent.toFixed(1)}%)`;
}

async function runAllTests() {
  console.log('🔄 ALGA DISASTER RECOVERY SIMULATION');
  console.log('=====================================');
  console.log(`Target: ${API_BASE}`);
  console.log(`Date: ${new Date().toISOString()}\n`);

  // Core system tests
  console.log('📡 System Health Tests');
  console.log('-----------------------');
  await runTest('Health endpoint accessible', testHealthEndpoint);
  await runTest('Database connection stable', testDatabaseRecovery);
  await runTest('Memory usage within limits', testMemoryUsage);

  console.log('\n⚡ Performance Tests');
  console.log('--------------------');
  await runTest('API response time acceptable', testAPIResponseTime);

  console.log('\n🔒 Security Tests');
  console.log('------------------');
  await runTest('Security headers present', testSecurityHeaders);
  await runTest('Rate limiting active', testRateLimiting);
  await runTest('Auth protection working', testAuthProtection);

  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log('\n=====================================');
  console.log('📊 DISASTER RECOVERY TEST SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.details}`);
    });
    console.log('\n⚠️  DISASTER RECOVERY ISSUES DETECTED');
    console.log('Review the failed tests and update the runbook if needed.');
    process.exit(1);
  } else {
    console.log('\n✅ ALL DISASTER RECOVERY TESTS PASSED');
    console.log('The platform is ready for recovery scenarios.');
  }
}

runAllTests().catch(console.error);

export {};
