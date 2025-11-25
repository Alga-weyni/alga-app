/**
 * Workflow Automation Engine for Lemlem Operations Dashboard
 * Auto-generates alerts based on operational triggers
 * 100% FREE - no external API costs, runs on scheduled intervals
 */

import { db } from './db.js';
import { 
  agents, 
  agentCommissions, 
  properties,
  systemAlerts,
  hardwareDeployments,
  paymentTransactions
} from '../shared/schema.js';
import { eq, and, lt, gte, sql } from "drizzle-orm";

// Alert generation functions
export async function generateCommissionAlerts() {
  console.log("[Workflow] Checking commission deadlines...");
  
  // Find agents with expiring contracts (within 30 days of 36-month mark)
  const threeYearsAgo = new Date();
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  threeYearsAgo.setDate(threeYearsAgo.getDate() + 30); // 30 days before expiry

  const agentsNearExpiry = await db
    .select()
    .from(agents)
    .where(
      and(
        eq(agents.status, "approved"),
        lt(agents.createdAt, threeYearsAgo)
      )
    );

  for (const agent of agentsNearExpiry) {
    // Check if alert already exists
    const existingAlert = await db
      .select()
      .from(systemAlerts)
      .where(
        and(
          eq(systemAlerts.relatedEntityType, "agent"),
          eq(systemAlerts.relatedEntityId, agent.id),
          eq(systemAlerts.alertType, "commission_expiry"),
          eq(systemAlerts.status, "active")
        )
      )
      .limit(1);

    if (existingAlert.length === 0) {
      await db.insert(systemAlerts).values({
        alertType: "commission_expiry",
        severity: "high",
        pillar: "agents",
        title: `Agent Commission Contract Expiring`,
        description: `Agent ${agent.fullName}'s 36-month commission contract is nearing expiration. Review contract renewal.`,
        relatedEntityType: "agent",
        relatedEntityId: agent.id,
        status: "active"
      });
      console.log(`[Workflow] Created commission expiry alert for agent #${agent.id}`);
    }
  }
}

export async function generateWarrantyExpiryAlerts() {
  console.log("[Workflow] Checking hardware warranties...");

  // Find hardware with warranties expiring in next 30 days
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const expiringWarranties = await db
    .select()
    .from(hardwareDeployments)
    .where(
      and(
        eq(hardwareDeployments.status, "active"),
        lt(hardwareDeployments.warrantyExpiry, thirtyDaysFromNow.toISOString()),
        gte(hardwareDeployments.warrantyExpiry, new Date().toISOString())
      )
    );

  for (const hardware of expiringWarranties) {
    const existingAlert = await db
      .select()
      .from(systemAlerts)
      .where(
        and(
          eq(systemAlerts.relatedEntityType, "hardware"),
          eq(systemAlerts.relatedEntityId, hardware.id),
          eq(systemAlerts.alertType, "warranty_expiry"),
          eq(systemAlerts.status, "active")
        )
      )
      .limit(1);

    if (existingAlert.length === 0) {
      await db.insert(systemAlerts).values({
        alertType: "warranty_expiry",
        severity: "medium",
        pillar: "hardware",
        title: `Hardware Warranty Expiring`,
        description: `${hardware.hardwareType} (SN: ${hardware.serialNumber}) warranty expires on ${new Date(hardware.warrantyExpiry).toLocaleDateString()}. Plan for renewal or replacement.`,
        relatedEntityType: "hardware",
        relatedEntityId: hardware.id,
        status: "active"
      });
      console.log(`[Workflow] Created warranty expiry alert for hardware #${hardware.id}`);
    }
  }
}

export async function generatePaymentMismatchAlerts() {
  console.log("[Workflow] Checking payment reconciliation...");

  // Find unreconciled payments older than 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const unreconciledPayments = await db
    .select()
    .from(paymentTransactions)
    .where(
      and(
        eq(paymentTransactions.reconciled, false),
        lt(paymentTransactions.createdAt, sevenDaysAgo.toISOString())
      )
    );

  for (const payment of unreconciledPayments) {
    const existingAlert = await db
      .select()
      .from(systemAlerts)
      .where(
        and(
          eq(systemAlerts.relatedEntityType, "payment"),
          eq(systemAlerts.relatedEntityId, payment.id),
          eq(systemAlerts.alertType, "payment_mismatch"),
          eq(systemAlerts.status, "active")
        )
      )
      .limit(1);

    if (existingAlert.length === 0) {
      await db.insert(systemAlerts).values({
        alertType: "payment_mismatch",
        severity: "critical",
        pillar: "payments",
        title: `Unreconciled Payment Alert`,
        description: `Payment ${payment.transactionId} (ETB ${payment.amount}) via ${payment.paymentGateway} has been unreconciled for over 7 days. Investigate immediately.`,
        relatedEntityType: "payment",
        relatedEntityId: payment.id,
        status: "active"
      });
      console.log(`[Workflow] Created payment mismatch alert for payment #${payment.id}`);
    }
  }
}

export async function generatePropertyVerificationAlerts() {
  console.log("[Workflow] Checking property verifications...");

  // Find active properties not yet verified by operator, older than 3 days
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const unverifedProperties = await db
    .select()
    .from(properties)
    .where(
      and(
        eq(properties.status, "pending"),
        sql`${properties.verifiedBy} IS NULL`,
        sql`${properties.createdAt} < ${threeDaysAgo}::timestamp`
      )
    );

  for (const property of unverifedProperties) {
    const existingAlert = await db
      .select()
      .from(systemAlerts)
      .where(
        and(
          eq(systemAlerts.relatedEntityType, "property"),
          eq(systemAlerts.relatedEntityId, property.id),
          eq(systemAlerts.alertType, "verification_lapse"),
          eq(systemAlerts.status, "active")
        )
      )
      .limit(1);

    if (existingAlert.length === 0) {
      await db.insert(systemAlerts).values({
        alertType: "verification_lapse",
        severity: "medium",
        pillar: "supply",
        title: `Property Pending Verification`,
        description: `Property "${property.title}" in ${property.city} has been active for 3+ days without operator verification. Review for quality assurance.`,
        relatedEntityType: "property",
        relatedEntityId: property.id,
        status: "active"
      });
      console.log(`[Workflow] Created verification lapse alert for property #${property.id}`);
    }
  }
}

// Main workflow runner - call this on a schedule
export async function runWorkflowAutomation() {
  console.log("\n=== Starting Workflow Automation ===");
  console.log(`[Workflow] Running at ${new Date().toISOString()}`);
  
  try {
    await generateCommissionAlerts();
    await generateWarrantyExpiryAlerts();
    await generatePaymentMismatchAlerts();
    await generatePropertyVerificationAlerts();
    
    console.log("[Workflow] ✅ Workflow automation completed successfully");
  } catch (error) {
    console.error("[Workflow] ❌ Error in workflow automation:", error);
  }
  
  console.log("=== Workflow Automation Complete ===\n");
}

// Optional: Run on a schedule (e.g., every 6 hours)
// This can be triggered by a cron job or scheduled task
export function startWorkflowScheduler() {
  console.log("[Workflow] Starting scheduler (runs every 6 hours)");
  
  // Run immediately on startup
  runWorkflowAutomation();
  
  // Then run every 6 hours
  setInterval(() => {
    runWorkflowAutomation();
  }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
}
