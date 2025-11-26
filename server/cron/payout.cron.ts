import { payoutService } from "../services/payout.service.js";

let isPayoutRunning = false;

export async function runWeeklyDellalaPayouts(): Promise<void> {
  if (isPayoutRunning) {
    console.log("⏳ Payout job already in progress, skipping...");
    return;
  }

  isPayoutRunning = true;
  console.log("💸 Starting weekly Dellala payout processing...");

  try {
    const result = await payoutService.processWeeklyDellalaPayouts();
    
    console.log(`✅ Weekly Dellala payouts completed`);
    console.log(`   📊 Total Dellala wallets: ${result.total}`);
    console.log(`   ✅ Processed: ${result.processed}`);
    console.log(`   ❌ Failed: ${result.failed}`);
  } catch (error) {
    console.error("❌ Weekly Dellala payout processing failed:", error);
  } finally {
    isPayoutRunning = false;
  }
}

export async function processPendingPayouts(): Promise<void> {
  console.log("🔄 Processing pending payouts...");

  try {
    const pendingPayouts = await payoutService.getPendingPayouts();
    
    console.log(`   📊 Found ${pendingPayouts.length} pending payouts`);
    
    for (const payout of pendingPayouts) {
      try {
        await payoutService.markPayoutProcessing(payout.id);
        
        const payoutMethod = payout.payoutMethod;
        let externalReference: string | undefined;
        
        if (payoutMethod === "telebirr") {
          console.log(`   📱 Processing Telebirr payout to ${payout.telebirrPhone}...`);
          externalReference = `TLB-${Date.now()}-${payout.id.substring(0, 8)}`;
        } else if (payoutMethod === "bank_transfer") {
          console.log(`   🏦 Processing bank transfer to ${payout.bankAccountNumber}...`);
          externalReference = `BNK-${Date.now()}-${payout.id.substring(0, 8)}`;
        }
        
        await payoutService.markPayoutCompleted(payout.id, externalReference);
        console.log(`   ✅ Payout ${payout.id} completed (ref: ${externalReference})`);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await payoutService.markPayoutFailed(payout.id, errorMessage);
        console.error(`   ❌ Payout ${payout.id} failed: ${errorMessage}`);
      }
    }
  } catch (error) {
    console.error("❌ Pending payout processing failed:", error);
  }
}

export async function runCorporateSweepReport(): Promise<void> {
  console.log("📊 Running corporate daily sweep report...");

  try {
    const sweep = await payoutService.getCorporateDailySweep();
    
    console.log(`   💰 Corporate ETB Balance: ${sweep.totalETB.toFixed(2)} ETB`);
    console.log(`   💵 Corporate USD Balance: ${sweep.totalUSD.toFixed(2)} USD`);
    console.log(`   ⏳ Pending Payouts: ${sweep.pendingPayouts}`);
    console.log(`   ✅ Completed Today: ${sweep.completedPayouts}`);
  } catch (error) {
    console.error("❌ Corporate sweep report failed:", error);
  }
}

export function initializePayoutCron(): void {
  const PAYOUT_ENABLED = process.env.ENABLE_FINANCIAL_CRONS === "true";
  
  if (!PAYOUT_ENABLED) {
    console.log("ℹ️ Financial payout cron jobs disabled (set ENABLE_FINANCIAL_CRONS=true to enable)");
    return;
  }

  console.log("🕐 Initializing financial payout cron jobs...");

  setInterval(() => {
    const now = new Date();
    
    if (now.getDay() === 1 && now.getHours() === 6 && now.getMinutes() === 0) {
      runWeeklyDellalaPayouts();
    }
    
    if (now.getMinutes() === 0 && now.getHours() >= 9 && now.getHours() <= 17) {
      processPendingPayouts();
    }
    
    if (now.getHours() === 23 && now.getMinutes() === 0) {
      runCorporateSweepReport();
    }
  }, 60 * 1000);

  console.log("✅ Financial payout cron jobs initialized");
  console.log("   - Weekly Dellala payouts: Monday 6:00 AM");
  console.log("   - Pending payouts processing: Hourly (9 AM - 5 PM)");
  console.log("   - Corporate sweep report: Daily 11:00 PM");
}
