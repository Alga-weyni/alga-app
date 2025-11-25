import { walletService } from "./wallet.service";
import { ledgerService } from "./ledger.service";
import { paymentSettlementService } from "./payment-settlement.service";
import { payoutService } from "./payout.service";
import { fxService } from "./fx.service";
import { taxService } from "./tax.service";
import { reconciliationService } from "./reconciliation.service";

export interface SimulationResult {
  success: boolean;
  testName: string;
  duration: number;
  details: object;
  error?: string;
}

export class SettlementSimulation {
  private results: SimulationResult[] = [];

  private async runTest(
    testName: string,
    testFn: () => Promise<object>
  ): Promise<SimulationResult> {
    const start = Date.now();
    try {
      const details = await testFn();
      const result: SimulationResult = {
        success: true,
        testName,
        duration: Date.now() - start,
        details,
      };
      this.results.push(result);
      return result;
    } catch (error) {
      const result: SimulationResult = {
        success: false,
        testName,
        duration: Date.now() - start,
        details: {},
        error: error instanceof Error ? error.message : "Unknown error",
      };
      this.results.push(result);
      return result;
    }
  }

  async runTaxCalculationTests(): Promise<SimulationResult> {
    return this.runTest("Tax Calculation Tests", async () => {
      const tests = [
        { amount: 1000, expectedVat: 150, expectedOwnerShare: 800, expectedCorporate: 150 },
        { amount: 5000, expectedVat: 750, expectedOwnerShare: 4000, expectedCorporate: 750 },
        { amount: 10000, expectedVat: 1500, expectedOwnerShare: 8000, expectedCorporate: 1500 },
      ];

      const results = [];
      for (const test of tests) {
        const split = taxService.calculateCommissionSplit(test.amount, false);
        const vatCalc = taxService.calculateVAT(test.amount);
        
        results.push({
          amount: test.amount,
          calculatedOwnerShare: split.ownerShare,
          expectedOwnerShare: test.expectedOwnerShare,
          ownerShareMatch: Math.abs(split.ownerShare - test.expectedOwnerShare) < 0.01,
          calculatedCorporateShare: split.corporateShare,
          expectedCorporate: test.expectedCorporate,
          corporateMatch: Math.abs(split.corporateShare - test.expectedCorporate) < 0.01,
          vatAmount: vatCalc,
        });
      }

      const allPassed = results.every((r) => r.ownerShareMatch && r.corporateMatch);
      if (!allPassed) {
        throw new Error("Tax calculation mismatch detected");
      }

      return { tests: results, passed: allPassed };
    });
  }

  async runDellalaCommissionTests(): Promise<SimulationResult> {
    return this.runTest("Dellala Commission Tests", async () => {
      const tests = [
        { amount: 1000, hasDellala: true, expectedDellala: 50 },
        { amount: 5000, hasDellala: true, expectedDellala: 250 },
        { amount: 10000, hasDellala: false, expectedDellala: 0 },
      ];

      const results = [];
      for (const test of tests) {
        const split = taxService.calculateCommissionSplit(test.amount, test.hasDellala);
        
        results.push({
          amount: test.amount,
          hasDellala: test.hasDellala,
          calculatedDellalaShare: split.dellalaShare,
          expectedDellala: test.expectedDellala,
          match: Math.abs(split.dellalaShare - test.expectedDellala) < 0.01,
        });
      }

      const allPassed = results.every((r) => r.match);
      if (!allPassed) {
        throw new Error("Dellala commission calculation mismatch");
      }

      return { tests: results, passed: allPassed };
    });
  }

  async runFxConversionTests(): Promise<SimulationResult> {
    return this.runTest("FX Conversion Tests", async () => {
      await fxService.seedDefaultRates();

      const tests = [
        { amount: 100, from: "USD", to: "ETB", minExpected: 5000, maxExpected: 6000 },
        { amount: 50, from: "USD", to: "ETB", minExpected: 2500, maxExpected: 3000 },
      ];

      const results = [];
      for (const test of tests) {
        const conversion = await fxService.convert(test.amount, test.from, test.to);
        
        results.push({
          originalAmount: test.amount,
          originalCurrency: test.from,
          targetCurrency: test.to,
          convertedAmount: conversion.convertedAmount,
          rate: conversion.rate,
          withinRange: conversion.convertedAmount >= test.minExpected && 
                       conversion.convertedAmount <= test.maxExpected,
        });
      }

      const allPassed = results.every((r) => r.withinRange);
      return { tests: results, passed: allPassed };
    });
  }

  async runWalletOperationsTests(): Promise<SimulationResult> {
    return this.runTest("Wallet Operations Tests", async () => {
      const testUserId = `TEST_USER_${Date.now()}`;
      
      const wallet = await walletService.getOrCreateWallet(testUserId, "test", "ETB");
      
      await walletService.credit(wallet.id, "1000.00", {
        actorType: "system",
        description: "Test credit",
      });

      const afterCredit = await walletService.getWallet(wallet.id);
      const creditPassed = parseFloat(afterCredit?.availableBalance || "0") === 1000;

      await walletService.debit(wallet.id, "250.00", {
        actorType: "system",
        description: "Test debit",
      });

      const afterDebit = await walletService.getWallet(wallet.id);
      const debitPassed = parseFloat(afterDebit?.availableBalance || "0") === 750;

      await walletService.credit(wallet.id, "500.00", {
        frozen: true,
        actorType: "system",
        description: "Test frozen credit",
      });

      const afterFrozen = await walletService.getWallet(wallet.id);
      const frozenPassed = parseFloat(afterFrozen?.frozenBalance || "0") === 500;

      await walletService.unfreeze(wallet.id, "200.00", {
        actorType: "system",
        reason: "Test unfreeze",
      });

      const afterUnfreeze = await walletService.getWallet(wallet.id);
      const unfreezePassed = parseFloat(afterUnfreeze?.availableBalance || "0") === 950 &&
                            parseFloat(afterUnfreeze?.frozenBalance || "0") === 300;

      const integrityCheck = await walletService.verifyIntegrity(wallet.id);

      return {
        walletId: wallet.id,
        creditPassed,
        debitPassed,
        frozenPassed,
        unfreezePassed,
        integrityPassed: integrityCheck.valid,
        finalBalance: {
          available: afterUnfreeze?.availableBalance,
          frozen: afterUnfreeze?.frozenBalance,
        },
        allPassed: creditPassed && debitPassed && frozenPassed && unfreezePassed,
      };
    });
  }

  async runLedgerIntegrityTests(): Promise<SimulationResult> {
    return this.runTest("Ledger Integrity Tests", async () => {
      const testTransactionId = `TEST_TX_${Date.now()}`;
      
      const { debit, credit } = await ledgerService.createDoubleEntry(
        testTransactionId,
        {
          accountType: "test_debit",
          amount: "500.00",
          currency: "ETB",
          description: "Test debit entry",
        },
        {
          accountType: "test_credit",
          amount: "500.00",
          currency: "ETB",
          description: "Test credit entry",
        }
      );

      const entries = await ledgerService.getEntriesByTransaction(testTransactionId);
      const entriesCreated = entries.length === 2;

      const chainIntegrity = await ledgerService.verifyChainIntegrity();

      return {
        transactionId: testTransactionId,
        debitEntry: { id: debit.id, hash: debit.entryHash },
        creditEntry: { id: credit.id, hash: credit.entryHash },
        entriesCreated,
        chainValid: chainIntegrity.valid,
        totalEntriesInChain: chainIntegrity.totalEntries,
        passed: entriesCreated && chainIntegrity.valid,
      };
    });
  }

  async runStressTest(transactionCount: number = 50): Promise<SimulationResult> {
    return this.runTest(`Stress Test (${transactionCount} transactions)`, async () => {
      const startTime = Date.now();
      const results = [];

      for (let i = 0; i < transactionCount; i++) {
        const amount = Math.floor(Math.random() * 9000) + 1000;
        const split = taxService.calculateCommissionSplit(amount, Math.random() > 0.5);
        
        results.push({
          iteration: i + 1,
          amount,
          ownerShare: split.ownerShare,
          corporateShare: split.corporateShare,
          dellalaShare: split.dellalaShare,
        });
      }

      const totalDuration = Date.now() - startTime;
      const avgTimePerTransaction = totalDuration / transactionCount;

      return {
        transactionCount,
        totalDuration: `${totalDuration}ms`,
        avgTimePerTransaction: `${avgTimePerTransaction.toFixed(2)}ms`,
        passed: avgTimePerTransaction < 100,
        sampleResults: results.slice(0, 5),
      };
    });
  }

  async runReconciliationTest(): Promise<SimulationResult> {
    return this.runTest("Reconciliation Test", async () => {
      const result = await reconciliationService.runDailyReconciliation();

      return {
        success: result.success,
        discrepancyCount: result.discrepancies.length,
        summary: result.summary,
        recordId: result.record?.id,
      };
    });
  }

  async runFullSimulation(): Promise<{
    totalTests: number;
    passed: number;
    failed: number;
    results: SimulationResult[];
    duration: number;
  }> {
    const startTime = Date.now();
    this.results = [];

    console.log("🧪 Starting Financial Settlement Engine Simulation...\n");

    console.log("📊 Running Tax Calculation Tests...");
    await this.runTaxCalculationTests();

    console.log("👥 Running Dellala Commission Tests...");
    await this.runDellalaCommissionTests();

    console.log("💱 Running FX Conversion Tests...");
    await this.runFxConversionTests();

    console.log("💰 Running Wallet Operations Tests...");
    await this.runWalletOperationsTests();

    console.log("📒 Running Ledger Integrity Tests...");
    await this.runLedgerIntegrityTests();

    console.log("🔄 Running Reconciliation Test...");
    await this.runReconciliationTest();

    console.log("⚡ Running Stress Test...");
    await this.runStressTest(50);

    const passed = this.results.filter((r) => r.success).length;
    const failed = this.results.filter((r) => !r.success).length;
    const duration = Date.now() - startTime;

    console.log("\n📋 Simulation Results:");
    console.log(`   Total Tests: ${this.results.length}`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   ⏱️ Duration: ${duration}ms`);

    for (const result of this.results) {
      const icon = result.success ? "✅" : "❌";
      console.log(`   ${icon} ${result.testName} (${result.duration}ms)`);
      if (!result.success && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }

    return {
      totalTests: this.results.length,
      passed,
      failed,
      results: this.results,
      duration,
    };
  }
}

export const settlementSimulation = new SettlementSimulation();
