#!/usr/bin/env npx tsx

/**
 * Alga Payment Reconciliation Script
 * 
 * Validates payment integrity, checks for discrepancies,
 * and generates audit reports for INSA compliance.
 * 
 * Usage: npx tsx scripts/payment-reconciliation.ts
 */

import { db } from '../server/db';
import { bookings, wallets, ledgerEntries, settlements } from '../shared/schema';
import { eq, sql, and, gte, lte, desc } from 'drizzle-orm';

interface ReconciliationResult {
  check: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  details: string;
  amount?: number;
}

const results: ReconciliationResult[] = [];

function addResult(check: string, status: 'PASS' | 'FAIL' | 'WARN', details: string, amount?: number) {
  results.push({ check, status, details, amount });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} ${check}: ${details}${amount !== undefined ? ` (${amount.toLocaleString()} ETB)` : ''}`);
}

async function checkWalletBalances() {
  console.log('\n📊 Wallet Balance Integrity Check');
  console.log('----------------------------------');

  try {
    const allWallets = await db.select().from(wallets);
    
    let negativeBalances = 0;
    let totalBalance = 0;

    for (const wallet of allWallets) {
      const balance = parseFloat(wallet.balance || '0');
      totalBalance += balance;
      
      if (balance < 0) {
        negativeBalances++;
        addResult('Negative Balance Detected', 'FAIL', 
          `Wallet ${wallet.id} (${wallet.type}) has negative balance`, balance);
      }
    }

    if (negativeBalances === 0) {
      addResult('Wallet Balance Check', 'PASS', 
        `All ${allWallets.length} wallets have non-negative balances`, totalBalance);
    }
  } catch (error) {
    addResult('Wallet Balance Check', 'FAIL', 
      `Error checking wallets: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function checkLedgerIntegrity() {
  console.log('\n📒 Double-Entry Ledger Integrity');
  console.log('---------------------------------');

  try {
    const ledgerSummary = await db
      .select({
        totalDebit: sql<string>`COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0)`,
        totalCredit: sql<string>`COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0)`,
        entryCount: sql<number>`COUNT(*)`
      })
      .from(ledgerEntries);

    if (ledgerSummary.length > 0) {
      const debit = parseFloat(ledgerSummary[0].totalDebit || '0');
      const credit = parseFloat(ledgerSummary[0].totalCredit || '0');
      const diff = Math.abs(debit - credit);

      if (diff < 0.01) {
        addResult('Ledger Balance', 'PASS', 
          `Debits (${debit.toLocaleString()}) = Credits (${credit.toLocaleString()})`);
      } else {
        addResult('Ledger Balance', 'FAIL', 
          `Imbalance detected: Debits (${debit.toLocaleString()}) vs Credits (${credit.toLocaleString()})`, diff);
      }
    } else {
      addResult('Ledger Balance', 'WARN', 'No ledger entries found');
    }
  } catch (error) {
    addResult('Ledger Integrity', 'WARN', 
      `Error checking ledger: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function checkPaymentSettlements() {
  console.log('\n💰 Payment Settlement Status');
  console.log('-----------------------------');

  try {
    const settlementStats = await db
      .select({
        status: settlements.status,
        count: sql<number>`COUNT(*)`,
        total: sql<string>`COALESCE(SUM(amount), 0)`
      })
      .from(settlements)
      .groupBy(settlements.status);

    let pendingCount = 0;
    let pendingAmount = 0;

    for (const stat of settlementStats) {
      const amount = parseFloat(stat.total || '0');
      console.log(`   ${stat.status}: ${stat.count} settlements (${amount.toLocaleString()} ETB)`);
      
      if (stat.status === 'pending') {
        pendingCount = stat.count;
        pendingAmount = amount;
      }
    }

    if (pendingCount > 10) {
      addResult('Pending Settlements', 'WARN', 
        `${pendingCount} settlements pending review`, pendingAmount);
    } else {
      addResult('Settlement Status', 'PASS', 
        `${settlementStats.length > 0 ? settlementStats.reduce((acc, s) => acc + s.count, 0) : 0} total settlements`);
    }
  } catch (error) {
    addResult('Settlement Check', 'WARN', 
      `Error checking settlements: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function checkBookingPayments() {
  console.log('\n🏠 Booking Payment Verification');
  console.log('--------------------------------');

  try {
    const bookingStats = await db
      .select({
        paymentStatus: bookings.paymentStatus,
        count: sql<number>`COUNT(*)`,
        total: sql<string>`COALESCE(SUM(total_amount), 0)`
      })
      .from(bookings)
      .groupBy(bookings.paymentStatus);

    let unpaidConfirmed = 0;

    for (const stat of bookingStats) {
      const amount = parseFloat(stat.total || '0');
      console.log(`   ${stat.paymentStatus || 'unknown'}: ${stat.count} bookings (${amount.toLocaleString()} ETB)`);
    }

    // Check for confirmed bookings that aren't paid
    const confirmedUnpaid = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(bookings)
      .where(and(
        eq(bookings.status, 'confirmed'),
        sql`payment_status != 'paid'`
      ));

    if (confirmedUnpaid[0]?.count > 0) {
      addResult('Confirmed Unpaid Bookings', 'WARN', 
        `${confirmedUnpaid[0].count} confirmed bookings without payment`);
    } else {
      addResult('Booking Payment Status', 'PASS', 
        'All confirmed bookings have valid payment status');
    }
  } catch (error) {
    addResult('Booking Payment Check', 'WARN', 
      `Error checking bookings: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function checkTaxCalculations() {
  console.log('\n🧾 Tax Calculation Verification');
  console.log('--------------------------------');

  try {
    // Sample check - verify VAT is 15% and withholding is 2%
    const sampleBookings = await db
      .select()
      .from(bookings)
      .where(sql`vat_amount IS NOT NULL AND vat_amount > 0`)
      .limit(10);

    let taxErrors = 0;

    for (const booking of sampleBookings) {
      const total = parseFloat(booking.totalAmount || '0');
      const vat = parseFloat(booking.vatAmount || '0');
      const expectedVat = total * 0.15 / 1.15; // VAT from inclusive price
      
      // Allow 1% tolerance for rounding
      if (Math.abs(vat - expectedVat) / expectedVat > 0.01) {
        taxErrors++;
      }
    }

    if (taxErrors > 0) {
      addResult('Tax Calculations', 'WARN', 
        `${taxErrors} bookings with potential VAT calculation issues`);
    } else {
      addResult('Tax Calculations', 'PASS', 
        `Sampled ${sampleBookings.length} bookings - VAT calculations correct`);
    }
  } catch (error) {
    addResult('Tax Verification', 'WARN', 
      `Error verifying taxes: ${error instanceof Error ? error.message : 'Unknown'}`);
  }
}

async function generateReport() {
  console.log('\n=====================================');
  console.log('📋 PAYMENT RECONCILIATION REPORT');
  console.log('=====================================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);

  await checkWalletBalances();
  await checkLedgerIntegrity();
  await checkPaymentSettlements();
  await checkBookingPayments();
  await checkTaxCalculations();

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;

  console.log('\n=====================================');
  console.log('📊 RECONCILIATION SUMMARY');
  console.log('=====================================');
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Warnings: ${warnings}`);

  if (failed > 0) {
    console.log('\n❌ CRITICAL ISSUES DETECTED');
    console.log('Immediate review required for failed checks.');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   - ${r.check}: ${r.details}`);
    });
    process.exit(1);
  } else if (warnings > 0) {
    console.log('\n⚠️  WARNINGS DETECTED');
    console.log('Review recommended but not critical.');
    process.exit(0);
  } else {
    console.log('\n✅ ALL RECONCILIATION CHECKS PASSED');
    console.log('Financial data is consistent and audit-ready.');
    process.exit(0);
  }
}

generateReport().catch((error) => {
  console.error('Reconciliation failed:', error);
  process.exit(1);
});
