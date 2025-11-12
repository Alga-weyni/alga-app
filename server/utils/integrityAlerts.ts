import sgMail from '@sendgrid/mail';
import { db } from "../db";
import { integrityAlerts, consentLogs, dashboardAccessLogs } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=sendgrid',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key || !connectionSettings.settings.from_email)) {
    throw new Error('SendGrid not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, email: connectionSettings.settings.from_email };
}

async function getUncachableSendGridClient() {
  const { apiKey, email } = await getCredentials();
  sgMail.setApiKey(apiKey);
  return {
    client: sgMail,
    fromEmail: email
  };
}

export type AlertCategory = 'HASH_MISMATCH' | 'DECRYPT_FAILURE' | 'DB_INTEGRITY_ERROR' | 'UNKNOWN';

interface AlertContext {
  signatureId: string;
  category: AlertCategory;
  userId?: string;
  action?: string;
  timestamp?: Date;
  errorMessage?: string;
}

interface AlertEmailData {
  signatureId: string;
  category: AlertCategory;
  userId: string;
  action: string;
  timestamp: string;
  errorSummary: string;
}

// Check if we've already sent an email for this signature in the last 24 hours
async function hasRecentEmail(signatureId: string): Promise<boolean> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const existingAlerts = await db
    .select()
    .from(integrityAlerts)
    .where(
      and(
        eq(integrityAlerts.signatureId, signatureId),
        gte(integrityAlerts.lastSeenAt, twentyFourHoursAgo)
      )
    )
    .limit(1);
  
  return existingAlerts.length > 0;
}

// Check global email rate limit (max 20 per day)
async function checkGlobalRateLimit(): Promise<boolean> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(integrityAlerts)
    .where(gte(integrityAlerts.firstSeenAt, oneDayAgo));
  
  const alertCount = count[0]?.count || 0;
  return Number(alertCount) >= 20;
}

// Create or update alert record
async function createOrUpdateAlert(context: AlertContext): Promise<void> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const existingAlert = await db
    .select()
    .from(integrityAlerts)
    .where(
      and(
        eq(integrityAlerts.signatureId, context.signatureId),
        gte(integrityAlerts.lastSeenAt, twentyFourHoursAgo)
      )
    )
    .limit(1);
  
  if (existingAlert.length > 0) {
    await db
      .update(integrityAlerts)
      .set({
        lastSeenAt: new Date(),
        occurrenceCount: sql`${integrityAlerts.occurrenceCount} + 1`,
        metadata: {
          ...existingAlert[0].metadata as object,
          lastError: context.errorMessage,
        },
      })
      .where(eq(integrityAlerts.id, existingAlert[0].id));
  } else {
    await db.insert(integrityAlerts).values({
      signatureId: context.signatureId,
      category: context.category,
      occurrenceCount: 1,
      resolved: false,
      metadata: {
        userId: context.userId,
        action: context.action,
        timestamp: context.timestamp?.toISOString(),
        errorMessage: context.errorMessage,
      },
    });
  }
}

// Format timestamp to Africa/Addis_Ababa timezone
function formatEthiopianTime(date: Date): string {
  return new Intl.DateTimeFormat('en-ET', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

// Send email alert
async function sendEmailAlert(data: AlertEmailData): Promise<boolean> {
  const isProduction = process.env.NODE_ENV === 'production';
  const alertsEnabled = process.env.ALERTS_ENABLED === 'true';
  
  if (!isProduction || !alertsEnabled) {
    console.log('[ALERTS] Skipping email in non-production environment:', {
      signatureId: data.signatureId,
      category: data.category,
    });
    return false;
  }
  
  const globalLimitReached = await checkGlobalRateLimit();
  if (globalLimitReached) {
    console.error('[ALERTS] Global rate limit reached (20 emails/day)');
    return false;
  }
  
  const hasRecent = await hasRecentEmail(data.signatureId);
  if (hasRecent) {
    console.log('[ALERTS] Skipping duplicate email for signature:', data.signatureId);
    return false;
  }
  
  try {
    const { client, fromEmail } = await getUncachableSendGridClient();
    
    const primaryEmail = process.env.ALERTS_EMAIL_TO || 'legal@alga.et';
    const ccEmail = process.env.ALERTS_EMAIL_CC || 'security@alga.et';
    
    const subject = `ALERT: Signature Integrity Failure – ${data.signatureId} – ${data.category}`;
    
    const plainText = `
SIGNATURE INTEGRITY ALERT

Category: ${data.category}
Signature ID: ${data.signatureId}
User ID: ${data.userId}
Action: ${data.action}
Timestamp (EAT): ${data.timestamp}

Error Summary:
${data.errorSummary}

IMMEDIATE ACTIONS REQUIRED:
1. View record: https://alga.et/admin/signatures?signatureId=${data.signatureId}
2. Export full audit trail for investigation
3. Contact legal team if tampering suspected

SECURITY NOTE:
This alert indicates potential signature tampering or data integrity issues.
Do NOT decrypt personal data unless legally required.

---
Compliant with Proclamation No. 1072/2018 & No. 1205/2020 — Alga Technologies PLC © 2025
`.trim();
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
    .alert-box { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 8px; border-bottom: 1px solid #ddd; }
    .info-table td:first-child { font-weight: bold; width: 40%; }
    .action-list { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .footer { text-align: center; padding: 15px; font-size: 12px; color: #666; }
    .btn { display: inline-block; background-color: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚨 Signature Integrity Alert</h1>
    </div>
    
    <div class="content">
      <div class="alert-box">
        <strong>CRITICAL:</strong> Potential signature tampering or data integrity issue detected.
      </div>
      
      <table class="info-table">
        <tr>
          <td>Category</td>
          <td><strong>${data.category}</strong></td>
        </tr>
        <tr>
          <td>Signature ID</td>
          <td><code>${data.signatureId}</code></td>
        </tr>
        <tr>
          <td>User ID</td>
          <td><code>${data.userId}</code></td>
        </tr>
        <tr>
          <td>Action</td>
          <td>${data.action}</td>
        </tr>
        <tr>
          <td>Timestamp (EAT)</td>
          <td>${data.timestamp}</td>
        </tr>
      </table>
      
      <div class="alert-box">
        <strong>Error Summary:</strong><br>
        ${data.errorSummary}
      </div>
      
      <div class="action-list">
        <strong>⚠️ IMMEDIATE ACTIONS REQUIRED:</strong>
        <ol>
          <li>Review the signature record in the admin dashboard</li>
          <li>Export complete audit trail for investigation</li>
          <li>Escalate to legal team if tampering suspected</li>
          <li>Document findings in incident response log</li>
        </ol>
      </div>
      
      <div style="text-align: center; margin: 20px 0;">
        <a href="https://alga.et/admin/signatures?signatureId=${data.signatureId}" class="btn">View Record</a>
        <a href="https://alga.et/admin/signatures" class="btn">Admin Dashboard</a>
      </div>
      
      <div style="background-color: #fee; padding: 15px; border-radius: 5px; margin-top: 20px;">
        <strong>🔒 Security Note:</strong><br>
        This alert contains NO personally identifiable information (PII).
        Decrypted IP addresses and device info are viewable only through the admin dashboard with proper authorization.
      </div>
    </div>
    
    <div class="footer">
      Compliant with Electronic Signature Proclamation No. 1072/2018<br>
      and Electronic Transactions Proclamation No. 1205/2020<br>
      <strong>Alga Technologies PLC</strong> © 2025
    </div>
  </div>
</body>
</html>
`.trim();
    
    const msg = {
      to: primaryEmail,
      cc: ccEmail,
      from: fromEmail,
      subject: subject,
      text: plainText,
      html: htmlBody,
    };
    
    await client.send(msg);
    console.log('[ALERTS] Email sent successfully to:', primaryEmail);
    return true;
  } catch (error) {
    console.error('[ALERTS] Failed to send email:', error);
    return false;
  }
}

// Main function to trigger alert
export async function triggerIntegrityAlert(context: AlertContext): Promise<void> {
  try {
    await createOrUpdateAlert(context);
    
    const consentLog = await db
      .select()
      .from(consentLogs)
      .where(eq(consentLogs.signatureId, context.signatureId))
      .limit(1);
    
    if (consentLog.length === 0) {
      console.warn('[ALERTS] Consent log not found for signature:', context.signatureId);
      return;
    }
    
    const log = consentLog[0];
    const timestamp = new Date(log.timestamp);
    
    const emailData: AlertEmailData = {
      signatureId: context.signatureId,
      category: context.category,
      userId: log.userId,
      action: log.action,
      timestamp: formatEthiopianTime(timestamp),
      errorSummary: context.errorMessage || `${context.category} detected for signature ${context.signatureId}`,
    };
    
    await sendEmailAlert(emailData);
  } catch (error) {
    console.error('[ALERTS] Failed to trigger integrity alert:', error);
  }
}

// Get unresolved alerts (for admin dashboard)
export async function getUnresolvedAlerts(limit: number = 50, offset: number = 0) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const alerts = await db
    .select()
    .from(integrityAlerts)
    .where(
      and(
        eq(integrityAlerts.resolved, false),
        gte(integrityAlerts.firstSeenAt, thirtyDaysAgo)
      )
    )
    .orderBy(sql`${integrityAlerts.lastSeenAt} DESC`)
    .limit(limit)
    .offset(offset);
  
  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(integrityAlerts)
    .where(
      and(
        eq(integrityAlerts.resolved, false),
        gte(integrityAlerts.firstSeenAt, thirtyDaysAgo)
      )
    );
  
  return {
    alerts,
    total: Number(totalCount[0]?.count || 0),
  };
}

// Acknowledge alerts
export async function acknowledgeAlerts(alertIds: string[], adminUserId: string): Promise<void> {
  await db
    .update(integrityAlerts)
    .set({
      resolved: true,
      acknowledgedBy: adminUserId,
      acknowledgedAt: new Date(),
    })
    .where(sql`${integrityAlerts.id} = ANY(${alertIds})`);
  
  await db.insert(dashboardAccessLogs).values({
    adminUserId: adminUserId,
    action: 'acknowledge_alerts',
    metadata: { alertIds, count: alertIds.length },
  });
}

// Create synthetic test alert (non-production only)
export async function createTestAlert(): Promise<string> {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    throw new Error('Test alerts are disabled in production');
  }
  
  const testSignatureId = `test_${Date.now()}`;
  
  await triggerIntegrityAlert({
    signatureId: testSignatureId,
    category: 'UNKNOWN',
    userId: 'test_user',
    action: 'test_action',
    timestamp: new Date(),
    errorMessage: 'This is a synthetic test alert for smoke testing',
  });
  
  return testSignatureId;
}
