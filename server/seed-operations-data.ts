/**
 * Operations Dashboard Sample Data Seeder
 * Populates hardware, payment, marketing, and alert tables for testing
 * Run with: npx tsx server/seed-operations-data.ts
 */

import { db } from './db';
import {
  hardwareDeployments,
  paymentTransactions,
  marketingCampaigns,
  systemAlerts,
  insaCompliance,
  properties
} from "@db/schema";

async function seedHardwareDeployments() {
  console.log("🔧 Seeding hardware deployments...");

  // Get first 10 properties for deployment
  const propertiesList = await db.select().from(properties).limit(10);
  
  if (propertiesList.length === 0) {
    console.log("⚠️ No properties found. Skipping hardware deployments.");
    return;
  }

  const hardwareData = [
    {
      propertyId: propertiesList[0].id,
      hardwareType: "lockbox",
      serialNumber: "LB2024-001-AA",
      manufacturer: "MasterLock",
      model: "SafeSpace 5000",
      purchaseDate: new Date("2024-01-15").toISOString(),
      warrantyExpiry: new Date("2026-01-15").toISOString(),
      installationDate: new Date("2024-01-20").toISOString(),
      installedBy: propertiesList[0].hostId,
      status: "active",
      location: "Front entrance",
      lastMaintenanceDate: new Date("2024-10-01").toISOString(),
      nextMaintenanceDate: new Date("2025-04-01").toISOString(),
      notes: "Primary lockbox for main entrance",
      cost: "3500.00"
    },
    {
      propertyId: propertiesList[1]?.id || propertiesList[0].id,
      hardwareType: "camera",
      serialNumber: "CAM2024-002-BB",
      manufacturer: "Ring",
      model: "Doorbell Pro",
      purchaseDate: new Date("2024-03-10").toISOString(),
      warrantyExpiry: new Date("2025-12-15").toISOString(), // Expiring soon!
      installationDate: new Date("2024-03-15").toISOString(),
      installedBy: propertiesList[1]?.hostId || propertiesList[0].hostId,
      status: "active",
      location: "Front door",
      lastMaintenanceDate: new Date("2024-09-01").toISOString(),
      nextMaintenanceDate: new Date("2025-03-01").toISOString(),
      notes: "Security camera with motion detection",
      cost: "8500.00"
    },
    {
      propertyId: propertiesList[2]?.id || propertiesList[0].id,
      hardwareType: "smart_lock",
      serialNumber: "SL2024-003-CC",
      manufacturer: "August",
      model: "Smart Lock Pro",
      purchaseDate: new Date("2024-05-20").toISOString(),
      warrantyExpiry: new Date("2026-05-20").toISOString(),
      installationDate: new Date("2024-05-25").toISOString(),
      installedBy: propertiesList[2]?.hostId || propertiesList[0].hostId,
      status: "active",
      location: "Main door",
      cost: "12000.00"
    },
    {
      propertyId: propertiesList[3]?.id || propertiesList[0].id,
      hardwareType: "thermostat",
      serialNumber: "TH2024-004-DD",
      manufacturer: "Nest",
      model: "Learning Thermostat",
      purchaseDate: new Date("2024-06-01").toISOString(),
      warrantyExpiry: new Date("2026-06-01").toISOString(),
      installationDate: new Date("2024-06-05").toISOString(),
      installedBy: propertiesList[3]?.hostId || propertiesList[0].hostId,
      status: "active",
      location: "Living room",
      cost: "7500.00"
    },
    {
      propertyId: propertiesList[4]?.id || propertiesList[0].id,
      hardwareType: "lockbox",
      serialNumber: "LB2024-005-EE",
      manufacturer: "MasterLock",
      model: "SafeSpace 3000",
      purchaseDate: new Date("2024-07-10").toISOString(),
      warrantyExpiry: new Date("2026-07-10").toISOString(),
      installationDate: new Date("2024-07-15").toISOString(),
      installedBy: propertiesList[4]?.hostId || propertiesList[0].hostId,
      status: "active",
      location: "Side entrance",
      cost: "2800.00"
    }
  ];

  await db.insert(hardwareDeployments).values(hardwareData);
  console.log(`✅ Seeded ${hardwareData.length} hardware deployments`);
}

async function seedPaymentTransactions() {
  console.log("💳 Seeding payment transactions...");

  const transactionData = [
    {
      transactionId: "TXN-TELEBIRR-2024-001",
      paymentGateway: "telebirr",
      transactionType: "commission_payout",
      amount: "2500.00",
      currency: "ETB",
      status: "completed",
      relatedAgentId: 1,
      gatewayResponse: { success: true, reference: "TB001" },
      reconciled: true,
      reconciledAt: new Date("2024-11-01").toISOString(),
      notes: "Monthly commission payout to agent"
    },
    {
      transactionId: "TXN-CHAPA-2024-002",
      paymentGateway: "chapa",
      transactionType: "booking_payment",
      amount: "15000.00",
      currency: "ETB",
      status: "completed",
      relatedBookingId: 1,
      gatewayResponse: { success: true, reference: "CH002" },
      reconciled: true,
      reconciledAt: new Date("2024-11-02").toISOString()
    },
    {
      transactionId: "TXN-STRIPE-2024-003",
      paymentGateway: "stripe",
      transactionType: "booking_payment",
      amount: "25000.00",
      currency: "ETB",
      status: "completed",
      relatedBookingId: 2,
      gatewayResponse: { success: true, charge_id: "ch_3abc" },
      reconciled: false, // Unreconciled for alert testing
      notes: "International guest payment"
    },
    {
      transactionId: "TXN-TELEBIRR-2024-004",
      paymentGateway: "telebirr",
      transactionType: "commission_payout",
      amount: "1800.00",
      currency: "ETB",
      status: "pending",
      relatedAgentId: 2,
      reconciled: false,
      notes: "Pending commission payout"
    },
    {
      transactionId: "TXN-CHAPA-2024-005",
      paymentGateway: "chapa",
      transactionType: "booking_payment",
      amount: "18500.00",
      currency: "ETB",
      status: "completed",
      relatedBookingId: 3,
      gatewayResponse: { success: true, reference: "CH005" },
      reconciled: true,
      reconciledAt: new Date("2024-11-05").toISOString()
    }
  ];

  await db.insert(paymentTransactions).values(transactionData);
  console.log(`✅ Seeded ${transactionData.length} payment transactions`);
}

async function seedMarketingCampaigns() {
  console.log("📱 Seeding marketing campaigns...");

  const campaignData = [
    {
      campaignName: "Alga Launch Campaign - Addis Ababa",
      campaignType: "brand_awareness",
      platform: "facebook",
      startDate: new Date("2024-10-01").toISOString(),
      endDate: new Date("2024-11-30").toISOString(),
      status: "active",
      budget: "50000.00",
      spent: "28500.00",
      targetAudience: "Young professionals in Addis Ababa, 25-40 years old",
      goals: "Increase brand awareness and app downloads",
      impressions: 125000,
      reach: 85000,
      clicks: 3200,
      conversions: 245,
      leads: 180,
      followers: 450,
      likes: 1200,
      shares: 85,
      comments: 320
    },
    {
      campaignName: "Instagram Property Showcase",
      campaignType: "content_marketing",
      platform: "instagram",
      startDate: new Date("2024-10-15").toISOString(),
      endDate: new Date("2024-12-15").toISOString(),
      status: "active",
      budget: "30000.00",
      spent: "15200.00",
      targetAudience: "Travelers and tourists interested in Ethiopia",
      goals: "Drive property bookings through visual content",
      impressions: 95000,
      reach: 62000,
      clicks: 2100,
      conversions: 156,
      leads: 98,
      followers: 890,
      likes: 4500,
      shares: 320,
      comments: 580
    },
    {
      campaignName: "TikTok Viral Challenge - #AlgaEthiopia",
      campaignType: "viral_marketing",
      platform: "tiktok",
      startDate: new Date("2024-11-01").toISOString(),
      endDate: new Date("2024-11-30").toISOString(),
      status: "active",
      budget: "25000.00",
      spent: "8500.00",
      targetAudience: "Gen Z travelers, 18-28 years old",
      goals: "Go viral with Ethiopian hospitality content",
      impressions: 250000,
      reach: 180000,
      clicks: 5600,
      conversions: 89,
      leads: 45,
      followers: 1200,
      likes: 12500,
      shares: 890,
      comments: 1250
    },
    {
      campaignName: "Telegram Community Growth",
      campaignType: "community_building",
      platform: "telegram",
      startDate: new Date("2024-09-01").toISOString(),
      endDate: new Date("2024-12-31").toISOString(),
      status: "active",
      budget: "15000.00",
      spent: "12000.00",
      targetAudience: "Ethiopian diaspora and local travelers",
      goals: "Build engaged community for repeat bookings",
      impressions: 45000,
      reach: 38000,
      clicks: 1800,
      conversions: 120,
      leads: 95,
      followers: 2100,
      likes: 0,
      shares: 0,
      comments: 450
    }
  ];

  await db.insert(marketingCampaigns).values(campaignData);
  console.log(`✅ Seeded ${campaignData.length} marketing campaigns`);
}

async function seedSystemAlerts() {
  console.log("🚨 Seeding system alerts...");

  const alertData = [
    {
      alertType: "warranty_expiry",
      severity: "medium",
      pillar: "hardware",
      title: "Camera Warranty Expiring Soon",
      description: "Ring Doorbell Pro (SN: CAM2024-002-BB) warranty expires on December 15, 2025. Consider renewal or replacement.",
      relatedEntityType: "hardware",
      relatedEntityId: 2,
      status: "active"
    },
    {
      alertType: "payment_mismatch",
      severity: "critical",
      pillar: "payments",
      title: "Unreconciled Stripe Payment",
      description: "Payment TXN-STRIPE-2024-003 (ETB 25,000) via Stripe has been unreconciled for over 7 days. Investigate immediately.",
      relatedEntityType: "payment",
      relatedEntityId: 3,
      status: "active"
    },
    {
      alertType: "verification_lapse",
      severity: "high",
      pillar: "supply",
      title: "Property Pending Verification",
      description: "Multiple properties have been active for 3+ days without operator verification. Review for quality assurance.",
      relatedEntityType: "property",
      status: "active"
    }
  ];

  await db.insert(systemAlerts).values(alertData);
  console.log(`✅ Seeded ${alertData.length} system alerts`);
}

async function seedINSACompliance() {
  console.log("🛡️ Seeding INSA compliance requirements...");

  const complianceData = [
    {
      complianceCategory: "Data Protection",
      requirement: "Implement end-to-end encryption for user data",
      status: "completed",
      dueDate: new Date("2024-10-01").toISOString(),
      completedDate: new Date("2024-09-25").toISOString(),
      evidenceUrl: "/docs/encryption-audit.pdf",
      notes: "AES-256 encryption implemented for all sensitive data"
    },
    {
      complianceCategory: "Authentication",
      requirement: "Multi-factor authentication for all admin users",
      status: "completed",
      dueDate: new Date("2024-10-15").toISOString(),
      completedDate: new Date("2024-10-10").toISOString(),
      evidenceUrl: "/docs/mfa-implementation.pdf",
      notes: "OTP-based 2FA implemented"
    },
    {
      complianceCategory: "Audit Logging",
      requirement: "Comprehensive audit trail for all transactions",
      status: "in_progress",
      dueDate: new Date("2024-12-01").toISOString(),
      notes: "Database logging implemented, export function in development"
    },
    {
      complianceCategory: "OWASP Top 10",
      requirement: "Address all OWASP Top 10 vulnerabilities",
      status: "completed",
      dueDate: new Date("2024-11-01").toISOString(),
      completedDate: new Date("2024-10-28").toISOString(),
      evidenceUrl: "/docs/owasp-compliance.pdf",
      notes: "All 10 vulnerabilities mitigated with security hardening"
    },
    {
      complianceCategory: "Data Residency",
      requirement: "Ensure Ethiopian user data stays in Ethiopia",
      status: "pending",
      dueDate: new Date("2025-01-01").toISOString(),
      notes: "Evaluating local data center options"
    }
  ];

  await db.insert(insaCompliance).values(complianceData);
  console.log(`✅ Seeded ${complianceData.length} INSA compliance requirements`);
}

async function main() {
  console.log("\n🌱 ========================================");
  console.log("🌱 Operations Dashboard Sample Data Seeder");
  console.log("🌱 ========================================\n");

  try {
    await seedHardwareDeployments();
    await seedPaymentTransactions();
    await seedMarketingCampaigns();
    await seedSystemAlerts();
    await seedINSACompliance();

    console.log("\n✅ ========================================");
    console.log("✅ All operations data seeded successfully!");
    console.log("✅ ========================================\n");
    console.log("📊 Summary:");
    console.log("   - Hardware Deployments: 5");
    console.log("   - Payment Transactions: 5");
    console.log("   - Marketing Campaigns: 4");
    console.log("   - System Alerts: 3");
    console.log("   - INSA Compliance: 5");
    console.log("\n🚀 Ready for Lemlem Operations Dashboard testing!\n");
  } catch (error) {
    console.error("\n❌ Error seeding data:", error);
    process.exit(1);
  }
}

main();
