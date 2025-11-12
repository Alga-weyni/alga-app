/**
 * Automated Signature Integrity Check
 * 
 * Verifies that stored signature_hash values remain unchanged.
 * Runs daily (or weekly) to detect any tampering or corruption.
 * Alerts in case of hash mismatch or failed decryption attempts.
 * 
 * Compliance: Ethiopian Electronic Signature Proclamation No. 1072/2018
 */

import { db } from "../db";
import { consentLogs } from "@shared/schema";
import { generateSignatureHash, decrypt } from "../utils/crypto";
import { createIntegrityAlert, categorizeIntegrityFailure } from "../utils/integrityAlerts";
import { gte } from "drizzle-orm";

interface IntegrityCheckResult {
  totalChecked: number;
  validSignatures: number;
  invalidSignatures: number;
  decryptionFailures: number;
  errors: Array<{
    id: number;
    signatureId: string;
    userId: string;
    action: string;
    timestamp: Date;
    issue: string;
  }>;
}

/**
 * Verify signature hash integrity
 * Recalculates SHA-256 hash and compares to stored value
 */
async function verifySignatureIntegrity(
  log: {
    id: number;
    signatureId: string;
    userId: string;
    action: string;
    timestamp: Date;
    signatureHash: string;
    ipAddressEncrypted: string | null;
    deviceInfoEncrypted: string | null;
  }
): Promise<{ valid: boolean; issue?: string }> {
  try {
    // Recalculate signature hash
    const expectedHash = generateSignatureHash(log.userId, log.action, log.timestamp);

    // Compare with stored hash
    if (expectedHash !== log.signatureHash) {
      return {
        valid: false,
        issue: `Hash mismatch: expected ${expectedHash}, got ${log.signatureHash}`,
      };
    }

    // Test decryption (ensure encrypted data is still readable)
    if (log.ipAddressEncrypted) {
      try {
        decrypt(log.ipAddressEncrypted);
      } catch (decryptError) {
        return {
          valid: false,
          issue: `Decryption failed for IP address: ${decryptError}`,
        };
      }
    }

    if (log.deviceInfoEncrypted) {
      try {
        decrypt(log.deviceInfoEncrypted);
      } catch (decryptError) {
        return {
          valid: false,
          issue: `Decryption failed for device info: ${decryptError}`,
        };
      }
    }

    return { valid: true };
  } catch (error: any) {
    return {
      valid: false,
      issue: `Verification error: ${error.message}`,
    };
  }
}

/**
 * Run integrity check on all signatures
 * Optionally limit to signatures created after a certain date
 */
export async function runSignatureIntegrityCheck(
  sinceDate?: Date
): Promise<IntegrityCheckResult> {
  const result: IntegrityCheckResult = {
    totalChecked: 0,
    validSignatures: 0,
    invalidSignatures: 0,
    decryptionFailures: 0,
    errors: [],
  };

  try {
    console.log('[INTEGRITY CHECK] Starting signature verification...');

    // Fetch signatures to check
    const query = sinceDate
      ? db.select().from(consentLogs).where(gte(consentLogs.timestamp, sinceDate))
      : db.select().from(consentLogs);

    const signatures = await query;

    console.log(`[INTEGRITY CHECK] Checking ${signatures.length} signatures...`);

    // Verify each signature
    for (const signature of signatures) {
      result.totalChecked++;

      const verification = await verifySignatureIntegrity(signature);

      if (verification.valid) {
        result.validSignatures++;
      } else {
        result.invalidSignatures++;

        if (verification.issue?.includes('Decryption failed')) {
          result.decryptionFailures++;
        }

        result.errors.push({
          id: signature.id,
          signatureId: signature.signatureId,
          userId: signature.userId,
          action: signature.action,
          timestamp: signature.timestamp,
          issue: verification.issue || 'Unknown issue',
        });

        console.error(
          `[INTEGRITY CHECK] ❌ ALERT: Signature ${signature.signatureId} failed verification:`,
          verification.issue
        );

        // Create integrity alert with auto-categorization
        try {
          const category = categorizeIntegrityFailure(verification.issue || 'Unknown issue');
          await createIntegrityAlert(
            signature.signatureId,
            signature.userId,
            category,
            verification.issue || 'Unknown issue'
          );
          console.log(`[INTEGRITY CHECK] Alert created for signature ${signature.signatureId}`);
        } catch (alertError: any) {
          console.error(
            `[INTEGRITY CHECK] Failed to create alert for ${signature.signatureId}:`,
            alertError.message
          );
        }
      }
    }

    // Summary
    console.log('[INTEGRITY CHECK] ✅ Check complete:');
    console.log(`  Total checked: ${result.totalChecked}`);
    console.log(`  Valid: ${result.validSignatures}`);
    console.log(`  Invalid: ${result.invalidSignatures}`);
    console.log(`  Decryption failures: ${result.decryptionFailures}`);

    // Alert if any issues found
    if (result.invalidSignatures > 0) {
      console.error(
        `[INTEGRITY CHECK] ⚠️ ALERT: ${result.invalidSignatures} signature(s) failed integrity check!`
      );
      console.log(`[INTEGRITY CHECK] Created ${result.invalidSignatures} integrity alerts`);
      console.log(`[INTEGRITY CHECK] Alerts sent via email (production only)`);
      console.log(`[INTEGRITY CHECK] View alerts at /admin/signatures dashboard`);
    }

    return result;
  } catch (error: any) {
    console.error('[INTEGRITY CHECK] ❌ Fatal error:', error);
    throw error;
  }
}

/**
 * Schedule integrity checks
 * Daily at 2:00 AM Ethiopian time (UTC+3)
 */
export function scheduleIntegrityChecks() {
  const DAILY_CHECK_HOUR = 2; // 2 AM
  const WEEKLY_CHECK_DAY = 0; // Sunday
  const CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  console.log('[INTEGRITY CHECK] Scheduling daily integrity checks at 2:00 AM Ethiopian time...');

  // Calculate time until next 2 AM
  const now = new Date();
  const next2AM = new Date(now);
  next2AM.setHours(DAILY_CHECK_HOUR, 0, 0, 0);

  if (next2AM <= now) {
    next2AM.setDate(next2AM.getDate() + 1);
  }

  const timeUntilNext2AM = next2AM.getTime() - now.getTime();

  // Schedule first check
  setTimeout(async () => {
    await runSignatureIntegrityCheck();

    // Schedule recurring checks
    setInterval(async () => {
      await runSignatureIntegrityCheck();
    }, CHECK_INTERVAL);
  }, timeUntilNext2AM);

  console.log(`[INTEGRITY CHECK] Next check scheduled for: ${next2AM.toISOString()}`);
}

/**
 * Run manual integrity check (for testing or on-demand verification)
 * 
 * Usage: npx tsx server/cron/signature-integrity-check.ts
 */
