import { reconciliationService } from "../services/reconciliation.service";

let isReconciliationRunning = false;

export async function runDailyReconciliation(): Promise<void> {
  if (isReconciliationRunning) {
    console.log("⏳ Reconciliation already in progress, skipping...");
    return;
  }

  isReconciliationRunning = true;
  console.log("🔄 Starting daily reconciliation...");

  try {
    const result = await reconciliationService.runDailyReconciliation();
    
    if (result.success) {
      console.log("✅ Daily reconciliation completed successfully");
      console.log(`   📊 Transactions: ${result.summary.totalTransactions}`);
      console.log(`   💰 Gross Amount: ${result.summary.totalGrossAmount.toFixed(2)} ETB`);
      console.log(`   👤 Owner Payouts: ${result.summary.totalOwnerPayouts.toFixed(2)} ETB`);
      console.log(`   🏢 Corporate Fees: ${result.summary.totalCorporateFees.toFixed(2)} ETB`);
    } else {
      console.warn("⚠️ Daily reconciliation found discrepancies:");
      for (const discrepancy of result.discrepancies) {
        console.warn(`   - ${discrepancy.type}: ${discrepancy.description}`);
      }
    }
  } catch (error) {
    console.error("❌ Daily reconciliation failed:", error);
  } finally {
    isReconciliationRunning = false;
  }
}

export async function runWeeklyReconciliation(): Promise<void> {
  if (isReconciliationRunning) {
    console.log("⏳ Reconciliation already in progress, skipping...");
    return;
  }

  isReconciliationRunning = true;
  console.log("🔄 Starting weekly reconciliation...");

  try {
    const result = await reconciliationService.runWeeklyReconciliation();
    
    if (result.success) {
      console.log("✅ Weekly reconciliation completed successfully");
      console.log(`   📊 Transactions: ${result.summary.totalTransactions}`);
      console.log(`   💰 Total Volume: ${result.summary.totalGrossAmount.toFixed(2)} ETB`);
    } else {
      console.warn("⚠️ Weekly reconciliation found discrepancies:");
      for (const discrepancy of result.discrepancies) {
        console.warn(`   - ${discrepancy.type}: ${discrepancy.description}`);
      }
    }
  } catch (error) {
    console.error("❌ Weekly reconciliation failed:", error);
  } finally {
    isReconciliationRunning = false;
  }
}

export async function runIntegrityCheck(): Promise<void> {
  console.log("🔒 Running wallet integrity check...");

  try {
    const result = await reconciliationService.verifyAllWalletIntegrity();
    
    console.log(`   📊 Total Wallets: ${result.totalWallets}`);
    console.log(`   ✅ Passed: ${result.passed}`);
    console.log(`   ❌ Failed: ${result.failed}`);
    
    if (result.failed > 0) {
      console.warn("⚠️ Integrity check failures:");
      for (const failure of result.failures) {
        console.warn(`   - Wallet ${failure.walletId} (${failure.ownerType}: ${failure.ownerId})`);
      }
    }
  } catch (error) {
    console.error("❌ Integrity check failed:", error);
  }
}

export function initializeReconciliationCron(): void {
  const RECONCILIATION_ENABLED = process.env.ENABLE_FINANCIAL_CRONS === "true";
  
  if (!RECONCILIATION_ENABLED) {
    console.log("ℹ️ Financial reconciliation cron jobs disabled (set ENABLE_FINANCIAL_CRONS=true to enable)");
    return;
  }

  console.log("🕐 Initializing financial reconciliation cron jobs...");

  setInterval(() => {
    const now = new Date();
    
    if (now.getHours() === 2 && now.getMinutes() === 0) {
      runDailyReconciliation();
    }
    
    if (now.getDay() === 1 && now.getHours() === 3 && now.getMinutes() === 0) {
      runWeeklyReconciliation();
    }
    
    if (now.getHours() === 4 && now.getMinutes() === 0) {
      runIntegrityCheck();
    }
  }, 60 * 1000);

  console.log("✅ Financial reconciliation cron jobs initialized");
  console.log("   - Daily reconciliation: 2:00 AM");
  console.log("   - Weekly reconciliation: Monday 3:00 AM");
  console.log("   - Integrity check: 4:00 AM daily");
}
