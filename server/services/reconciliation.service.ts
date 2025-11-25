import { db } from "../db";
import {
  reconciliationRecords,
  settlementTransactions,
  wallets,
  ledgerEntries,
  type ReconciliationRecord,
} from "@shared/schema";
import { eq, gte, lte, sql, and, desc } from "drizzle-orm";
import crypto from "crypto";
import { auditLogService } from "./audit-log.service";
import { walletService } from "./wallet.service";

export interface ReconciliationResult {
  success: boolean;
  record?: ReconciliationRecord;
  discrepancies: DiscrepancyItem[];
  summary: {
    totalTransactions: number;
    totalGrossAmount: number;
    totalOwnerPayouts: number;
    totalDellalaCommissions: number;
    totalCorporateFees: number;
    totalVat: number;
    totalWithholdingTax: number;
  };
}

export interface DiscrepancyItem {
  type: string;
  description: string;
  expected?: number | string;
  actual?: number | string;
  transactionId?: string;
  walletId?: string;
}

export class ReconciliationService {
  private static instance: ReconciliationService;

  private constructor() {}

  static getInstance(): ReconciliationService {
    if (!ReconciliationService.instance) {
      ReconciliationService.instance = new ReconciliationService();
    }
    return ReconciliationService.instance;
  }

  private generateSnapshotHash(data: object): string {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  async runDailyReconciliation(): Promise<ReconciliationResult> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setHours(0, 0, 0, 0);
    
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 1);

    return this.runReconciliation("daily", periodStart, periodEnd);
  }

  async runWeeklyReconciliation(): Promise<ReconciliationResult> {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setHours(0, 0, 0, 0);
    
    const periodStart = new Date(periodEnd);
    periodStart.setDate(periodStart.getDate() - 7);

    return this.runReconciliation("weekly", periodStart, periodEnd);
  }

  async runReconciliation(
    periodType: "daily" | "weekly" | "monthly",
    periodStart: Date,
    periodEnd: Date
  ): Promise<ReconciliationResult> {
    const discrepancies: DiscrepancyItem[] = [];

    const transactions = await db
      .select()
      .from(settlementTransactions)
      .where(
        and(
          gte(settlementTransactions.createdAt, periodStart),
          lte(settlementTransactions.createdAt, periodEnd)
        )
      );

    let summary = {
      totalTransactions: transactions.length,
      totalGrossAmount: 0,
      totalOwnerPayouts: 0,
      totalDellalaCommissions: 0,
      totalCorporateFees: 0,
      totalVat: 0,
      totalWithholdingTax: 0,
      etbVolume: 0,
      usdVolume: 0,
    };

    for (const tx of transactions) {
      summary.totalGrossAmount += parseFloat(tx.grossAmount);
      summary.totalOwnerPayouts += parseFloat(tx.ownerShare);
      summary.totalDellalaCommissions += parseFloat(tx.dellalaShare || "0");
      summary.totalCorporateFees += parseFloat(tx.corporateShare);
      summary.totalVat += parseFloat(tx.vatAmount || "0");
      summary.totalWithholdingTax += parseFloat(tx.withholdingTax || "0");

      if (tx.currency === "ETB") {
        summary.etbVolume += parseFloat(tx.grossAmount);
      } else if (tx.originalCurrency === "USD") {
        summary.usdVolume += parseFloat(tx.originalAmount || "0");
      }

      const expectedTotal = 
        parseFloat(tx.ownerShare) +
        parseFloat(tx.dellalaShare || "0") +
        parseFloat(tx.corporateShare);

      const grossAmount = parseFloat(tx.grossAmount);

      if (Math.abs(grossAmount - expectedTotal) > 0.01) {
        discrepancies.push({
          type: "split_mismatch",
          description: `Transaction split doesn't match gross amount`,
          expected: grossAmount,
          actual: expectedTotal,
          transactionId: tx.id,
        });
      }
    }

    const allWallets = await walletService.getAllWallets();
    const walletBalancesSnapshot: Record<string, object> = {};

    for (const wallet of allWallets) {
      walletBalancesSnapshot[wallet.id] = {
        ownerId: wallet.ownerId,
        ownerType: wallet.ownerType,
        currency: wallet.currency,
        availableBalance: wallet.availableBalance,
        frozenBalance: wallet.frozenBalance,
        pendingBalance: wallet.pendingBalance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawals: wallet.totalWithdrawals,
      };

      const integrityCheck = await walletService.verifyIntegrity(wallet.id);
      if (!integrityCheck.valid) {
        discrepancies.push({
          type: "wallet_integrity",
          description: `Wallet integrity check failed`,
          expected: integrityCheck.expectedHash,
          actual: integrityCheck.actualHash,
          walletId: wallet.id,
        });
      }
    }

    const [totalCredits] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${ledgerEntries.amount} AS DECIMAL)), 0)`,
      })
      .from(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.entryType, "credit"),
          gte(ledgerEntries.createdAt, periodStart),
          lte(ledgerEntries.createdAt, periodEnd)
        )
      );

    const [totalDebits] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${ledgerEntries.amount} AS DECIMAL)), 0)`,
      })
      .from(ledgerEntries)
      .where(
        and(
          eq(ledgerEntries.entryType, "debit"),
          gte(ledgerEntries.createdAt, periodStart),
          lte(ledgerEntries.createdAt, periodEnd)
        )
      );

    const creditTotal = parseFloat(totalCredits?.total || "0");
    const debitTotal = parseFloat(totalDebits?.total || "0");

    if (Math.abs(creditTotal - debitTotal) > 0.01) {
      discrepancies.push({
        type: "ledger_imbalance",
        description: "Ledger credits don't match debits (double-entry violation)",
        expected: debitTotal,
        actual: creditTotal,
      });
    }

    const snapshotHash = this.generateSnapshotHash({
      periodType,
      periodStart: periodStart.toISOString(),
      periodEnd: periodEnd.toISOString(),
      summary,
      walletBalancesSnapshot,
      discrepancies,
    });

    const [record] = await db
      .insert(reconciliationRecords)
      .values({
        periodType,
        periodStart,
        periodEnd,
        totalTransactions: summary.totalTransactions,
        totalGrossAmount: summary.totalGrossAmount.toFixed(2),
        totalOwnerPayouts: summary.totalOwnerPayouts.toFixed(2),
        totalDellalaCommissions: summary.totalDellalaCommissions.toFixed(2),
        totalCorporateFees: summary.totalCorporateFees.toFixed(2),
        totalVat: summary.totalVat.toFixed(2),
        totalWithholdingTax: summary.totalWithholdingTax.toFixed(2),
        etbVolume: summary.etbVolume.toFixed(2),
        usdVolume: summary.usdVolume.toFixed(2),
        status: discrepancies.length > 0 ? "discrepancy_found" : "completed",
        discrepancies: discrepancies,
        snapshotHash,
        walletBalancesSnapshot,
        runBy: "system",
        completedAt: new Date(),
      })
      .returning();

    await auditLogService.reconciliationRun({
      recordId: record.id,
      periodType,
      periodStart,
      periodEnd,
      totalTransactions: summary.totalTransactions,
      discrepancies: discrepancies.length,
    });

    return {
      success: discrepancies.length === 0,
      record,
      discrepancies,
      summary: {
        totalTransactions: summary.totalTransactions,
        totalGrossAmount: summary.totalGrossAmount,
        totalOwnerPayouts: summary.totalOwnerPayouts,
        totalDellalaCommissions: summary.totalDellalaCommissions,
        totalCorporateFees: summary.totalCorporateFees,
        totalVat: summary.totalVat,
        totalWithholdingTax: summary.totalWithholdingTax,
      },
    };
  }

  async getLatestReconciliation(): Promise<ReconciliationRecord | null> {
    const [record] = await db
      .select()
      .from(reconciliationRecords)
      .orderBy(desc(reconciliationRecords.createdAt))
      .limit(1);
    return record || null;
  }

  async getReconciliationHistory(limit: number = 30): Promise<ReconciliationRecord[]> {
    return db
      .select()
      .from(reconciliationRecords)
      .orderBy(desc(reconciliationRecords.createdAt))
      .limit(limit);
  }

  async verifyAllWalletIntegrity(): Promise<{
    totalWallets: number;
    passed: number;
    failed: number;
    failures: { walletId: string; ownerId: string; ownerType: string }[];
  }> {
    const allWallets = await walletService.getAllWallets();
    const failures: { walletId: string; ownerId: string; ownerType: string }[] = [];

    for (const wallet of allWallets) {
      const result = await walletService.verifyIntegrity(wallet.id);
      if (!result.valid) {
        failures.push({
          walletId: wallet.id,
          ownerId: wallet.ownerId,
          ownerType: wallet.ownerType,
        });
      }
    }

    return {
      totalWallets: allWallets.length,
      passed: allWallets.length - failures.length,
      failed: failures.length,
      failures,
    };
  }
}

export const reconciliationService = ReconciliationService.getInstance();
