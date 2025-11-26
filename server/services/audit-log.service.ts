import { db } from "../db.js";
import { financialAuditLogs, type InsertFinancialAuditLog } from "../../shared/schema.js";
import { desc, eq } from "drizzle-orm";
import crypto from "crypto";

export class AuditLogService {
  private static instance: AuditLogService;
  private lastHash: string | null = null;

  private constructor() {}

  static getInstance(): AuditLogService {
    if (!AuditLogService.instance) {
      AuditLogService.instance = new AuditLogService();
    }
    return AuditLogService.instance;
  }

  private generateHash(data: object, previousHash?: string): string {
    const payload = JSON.stringify({ ...data, previousHash: previousHash || "" });
    return crypto.createHash("sha256").update(payload).digest("hex");
  }

  async getLastLogHash(): Promise<string | null> {
    const lastLog = await db
      .select({ logHash: financialAuditLogs.logHash })
      .from(financialAuditLogs)
      .orderBy(desc(financialAuditLogs.createdAt))
      .limit(1);
    
    return lastLog[0]?.logHash || null;
  }

  async log(entry: Omit<InsertFinancialAuditLog, "logHash" | "previousLogHash">): Promise<void> {
    const previousHash = await this.getLastLogHash();
    
    const logHash = this.generateHash(entry, previousHash || undefined);

    await db.insert(financialAuditLogs).values({
      ...entry,
      logHash,
      previousLogHash: previousHash,
    });
  }

  async walletCredit(params: {
    walletId: string;
    amount: string;
    currency: string;
    actorId?: string;
    actorType: "user" | "system" | "cron";
    description?: string;
    previousState?: object;
    newState?: object;
    requestId?: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      action: "wallet_credit",
      category: "wallet",
      actorId: params.actorId,
      actorType: params.actorType,
      targetType: "wallet",
      targetId: params.walletId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      previousState: params.previousState,
      newState: params.newState,
      requestId: params.requestId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  }

  async walletDebit(params: {
    walletId: string;
    amount: string;
    currency: string;
    actorId?: string;
    actorType: "user" | "system" | "cron";
    description?: string;
    previousState?: object;
    newState?: object;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      action: "wallet_debit",
      category: "wallet",
      actorId: params.actorId,
      actorType: params.actorType,
      targetType: "wallet",
      targetId: params.walletId,
      amount: params.amount,
      currency: params.currency,
      description: params.description,
      previousState: params.previousState,
      newState: params.newState,
      requestId: params.requestId,
    });
  }

  async balanceFreeze(params: {
    walletId: string;
    amount: string;
    currency: string;
    actorId: string;
    reason: string;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      action: "balance_freeze",
      category: "wallet",
      actorId: params.actorId,
      actorType: "user",
      targetType: "wallet",
      targetId: params.walletId,
      amount: params.amount,
      currency: params.currency,
      description: params.reason,
      requestId: params.requestId,
    });
  }

  async balanceUnfreeze(params: {
    walletId: string;
    amount: string;
    currency: string;
    actorId?: string;
    actorType: "user" | "system" | "cron";
    reason: string;
    requestId?: string;
  }): Promise<void> {
    await this.log({
      action: "balance_unfreeze",
      category: "wallet",
      actorId: params.actorId,
      actorType: params.actorType,
      targetType: "wallet",
      targetId: params.walletId,
      amount: params.amount,
      currency: params.currency,
      description: params.reason,
      requestId: params.requestId,
    });
  }

  async payoutInitiated(params: {
    payoutId: string;
    recipientId: string;
    amount: string;
    currency: string;
    method: string;
    actorId?: string;
    actorType: "user" | "system" | "cron";
  }): Promise<void> {
    await this.log({
      action: "payout_initiated",
      category: "payout",
      actorId: params.actorId,
      actorType: params.actorType,
      targetType: "payout",
      targetId: params.payoutId,
      amount: params.amount,
      currency: params.currency,
      description: `Payout to ${params.recipientId} via ${params.method}`,
      metadata: { recipientId: params.recipientId, method: params.method },
    });
  }

  async payoutCompleted(params: {
    payoutId: string;
    externalReference?: string;
    actorType: "user" | "system" | "cron";
  }): Promise<void> {
    await this.log({
      action: "payout_completed",
      category: "payout",
      actorType: params.actorType,
      targetType: "payout",
      targetId: params.payoutId,
      description: `Payout completed. Ref: ${params.externalReference || "N/A"}`,
      metadata: { externalReference: params.externalReference },
    });
  }

  async settlementCreated(params: {
    transactionId: string;
    bookingId: number;
    grossAmount: string;
    ownerShare: string;
    dellalaShare: string;
    corporateShare: string;
    currency: string;
    actorType: "user" | "system";
  }): Promise<void> {
    await this.log({
      action: "settlement_created",
      category: "settlement",
      actorType: params.actorType,
      targetType: "transaction",
      targetId: params.transactionId,
      amount: params.grossAmount,
      currency: params.currency,
      description: `Settlement for booking ${params.bookingId}`,
      metadata: {
        bookingId: params.bookingId,
        ownerShare: params.ownerShare,
        dellalaShare: params.dellalaShare,
        corporateShare: params.corporateShare,
      },
    });
  }

  async fxConversion(params: {
    transactionId: string;
    fromCurrency: string;
    toCurrency: string;
    fromAmount: string;
    toAmount: string;
    rate: string;
    actorType: "user" | "system";
  }): Promise<void> {
    await this.log({
      action: "fx_conversion",
      category: "fx",
      actorType: params.actorType,
      targetType: "transaction",
      targetId: params.transactionId,
      amount: params.fromAmount,
      currency: params.fromCurrency,
      description: `FX: ${params.fromAmount} ${params.fromCurrency} → ${params.toAmount} ${params.toCurrency} @ ${params.rate}`,
      metadata: {
        fromCurrency: params.fromCurrency,
        toCurrency: params.toCurrency,
        toAmount: params.toAmount,
        rate: params.rate,
      },
    });
  }

  async reconciliationRun(params: {
    recordId: string;
    periodType: string;
    periodStart: Date;
    periodEnd: Date;
    totalTransactions: number;
    discrepancies: number;
  }): Promise<void> {
    await this.log({
      action: "reconciliation_run",
      category: "reconciliation",
      actorType: "cron",
      targetType: "reconciliation",
      targetId: params.recordId,
      description: `${params.periodType} reconciliation: ${params.totalTransactions} transactions, ${params.discrepancies} discrepancies`,
      metadata: {
        periodType: params.periodType,
        periodStart: params.periodStart.toISOString(),
        periodEnd: params.periodEnd.toISOString(),
        totalTransactions: params.totalTransactions,
        discrepancies: params.discrepancies,
      },
    });
  }

  async integrityCheck(params: {
    walletId: string;
    passed: boolean;
    expectedHash?: string;
    actualHash?: string;
    actorType: "user" | "system" | "cron";
  }): Promise<void> {
    await this.log({
      action: "integrity_check",
      category: "integrity",
      actorType: params.actorType,
      targetType: "wallet",
      targetId: params.walletId,
      description: params.passed ? "Integrity check passed" : "INTEGRITY CHECK FAILED",
      metadata: {
        passed: params.passed,
        expectedHash: params.expectedHash,
        actualHash: params.actualHash,
      },
    });
  }
}

export const auditLogService = AuditLogService.getInstance();
