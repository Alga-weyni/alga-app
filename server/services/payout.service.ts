import { db } from "../db.js";
import {
  payouts,
  wallets,
  settlementTransactions,
  users,
  type Payout,
  type InsertPayout,
} from "../../shared/schema.js";
import { eq, and, desc, gte, lte, sql, inArray } from "drizzle-orm";
import { walletService } from "./wallet.service.js";
import { taxService } from "./tax.service.js";
import { auditLogService } from "./audit-log.service.js";
import crypto from "crypto";

export interface PayoutResult {
  success: boolean;
  payout?: Payout;
  error?: string;
}

export class PayoutService {
  private static instance: PayoutService;

  private constructor() {}

  static getInstance(): PayoutService {
    if (!PayoutService.instance) {
      PayoutService.instance = new PayoutService();
    }
    return PayoutService.instance;
  }

  async createOwnerPayout(params: {
    walletId: string;
    recipientId: string;
    amount: number;
    applyWithholding?: boolean;
    transactionIds?: string[];
    approvedBy?: string;
  }): Promise<PayoutResult> {
    try {
      const wallet = await walletService.getWallet(params.walletId);
      if (!wallet) {
        return { success: false, error: "Wallet not found" };
      }

      if (parseFloat(wallet.availableBalance || "0") < params.amount) {
        return { success: false, error: "Insufficient available balance" };
      }

      const { netAmount, withholdingTax } = params.applyWithholding !== false
        ? taxService.calculateOwnerPayout(params.amount)
        : { netAmount: params.amount, withholdingTax: 0 };

      const payoutMethod = wallet.preferredPayoutMethod || "telebirr";
      const fee = payoutMethod === "bank_transfer" ? 25 : 5;
      const finalAmount = netAmount - fee;

      const [payout] = await db
        .insert(payouts)
        .values({
          walletId: params.walletId,
          recipientId: params.recipientId,
          recipientType: "owner",
          amount: params.amount.toFixed(2),
          currency: wallet.currency,
          fee: fee.toFixed(2),
          netAmount: finalAmount.toFixed(2),
          payoutMethod,
          bankName: wallet.bankName,
          bankAccountNumber: wallet.bankAccountNumber,
          telebirrPhone: wallet.telebirrPhone,
          status: "pending",
          transactionIds: params.transactionIds,
          approvedBy: params.approvedBy,
          approvedAt: params.approvedBy ? new Date() : undefined,
        })
        .returning();

      await walletService.debit(params.walletId, params.amount.toFixed(2), {
        actorType: "system",
        description: `Payout initiated: ${payout.id}`,
      });

      await auditLogService.payoutInitiated({
        payoutId: payout.id,
        recipientId: params.recipientId,
        amount: finalAmount.toFixed(2),
        currency: wallet.currency,
        method: payoutMethod,
        actorType: "system",
      });

      return { success: true, payout };
    } catch (error) {
      console.error("Owner payout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown payout error",
      };
    }
  }

  async createDellalaPayout(params: {
    walletId: string;
    recipientId: string;
    periodStart: Date;
    periodEnd: Date;
    transactionIds?: string[];
  }): Promise<PayoutResult> {
    try {
      const wallet = await walletService.getWallet(params.walletId);
      if (!wallet) {
        return { success: false, error: "Wallet not found" };
      }

      const amount = parseFloat(wallet.availableBalance || "0");
      if (amount <= 0) {
        return { success: false, error: "No available balance for payout" };
      }

      const { netAmount, withholdingTax } = taxService.calculateDelalalPayout(amount);

      const payoutMethod = wallet.preferredPayoutMethod || "telebirr";
      const fee = payoutMethod === "bank_transfer" ? 25 : 5;
      const finalAmount = netAmount - fee;

      const batchId = `DELLALA-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;

      const [payout] = await db
        .insert(payouts)
        .values({
          walletId: params.walletId,
          recipientId: params.recipientId,
          recipientType: "dellala",
          amount: amount.toFixed(2),
          currency: wallet.currency,
          fee: fee.toFixed(2),
          netAmount: finalAmount.toFixed(2),
          payoutMethod,
          bankName: wallet.bankName,
          bankAccountNumber: wallet.bankAccountNumber,
          telebirrPhone: wallet.telebirrPhone,
          status: "pending",
          periodStart: params.periodStart,
          periodEnd: params.periodEnd,
          batchId,
          transactionIds: params.transactionIds,
        })
        .returning();

      await walletService.debit(params.walletId, amount.toFixed(2), {
        actorType: "cron",
        description: `Weekly dellala payout: ${payout.id}`,
      });

      await auditLogService.payoutInitiated({
        payoutId: payout.id,
        recipientId: params.recipientId,
        amount: finalAmount.toFixed(2),
        currency: wallet.currency,
        method: payoutMethod,
        actorType: "cron",
      });

      return { success: true, payout };
    } catch (error) {
      console.error("Dellala payout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown payout error",
      };
    }
  }

  async processWeeklyDellalaPayouts(): Promise<{ processed: number; failed: number; total: number }> {
    const dellalaWallets = await walletService.getWalletsByOwnerType("dellala");
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    let processed = 0;
    let failed = 0;

    for (const wallet of dellalaWallets) {
      if (parseFloat(wallet.availableBalance || "0") <= 0) {
        continue;
      }

      const transactions = await db
        .select({ id: settlementTransactions.id })
        .from(settlementTransactions)
        .where(
          and(
            eq(settlementTransactions.dellalaId, wallet.ownerId),
            gte(settlementTransactions.createdAt, weekAgo),
            lte(settlementTransactions.createdAt, now)
          )
        );

      const result = await this.createDellalaPayout({
        walletId: wallet.id,
        recipientId: wallet.ownerId,
        periodStart: weekAgo,
        periodEnd: now,
        transactionIds: transactions.map((t) => t.id),
      });

      if (result.success) {
        processed++;
      } else {
        failed++;
        console.error(`Failed to process dellala payout for ${wallet.ownerId}: ${result.error}`);
      }
    }

    return { processed, failed, total: dellalaWallets.length };
  }

  async processOwnerPayoutOnCheckout(bookingId: number): Promise<PayoutResult> {
    try {
      const [transaction] = await db
        .select()
        .from(settlementTransactions)
        .where(eq(settlementTransactions.bookingId, bookingId));

      if (!transaction || !transaction.ownerId) {
        return { success: false, error: "Transaction not found or no owner" };
      }

      const ownerWallet = await walletService.getWalletByOwner(transaction.ownerId, "ETB");
      if (!ownerWallet) {
        return { success: false, error: "Owner wallet not found" };
      }

      const autoPayoutEnabled = process.env.AUTO_OWNER_PAYOUT === "true";
      if (!autoPayoutEnabled) {
        return { success: true, payout: undefined };
      }

      const ownerShare = parseFloat(transaction.ownerShare);
      
      return this.createOwnerPayout({
        walletId: ownerWallet.id,
        recipientId: transaction.ownerId,
        amount: ownerShare,
        transactionIds: [transaction.id],
      });
    } catch (error) {
      console.error("Owner checkout payout error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async markPayoutProcessing(payoutId: string): Promise<Payout | null> {
    const [payout] = await db
      .update(payouts)
      .set({
        status: "processing",
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(payouts.id, payoutId))
      .returning();
    return payout;
  }

  async markPayoutCompleted(payoutId: string, externalReference?: string): Promise<Payout | null> {
    const [payout] = await db
      .update(payouts)
      .set({
        status: "completed",
        completedAt: new Date(),
        externalReference,
        updatedAt: new Date(),
      })
      .where(eq(payouts.id, payoutId))
      .returning();

    if (payout) {
      await auditLogService.payoutCompleted({
        payoutId: payout.id,
        externalReference,
        actorType: "system",
      });
    }

    return payout;
  }

  async markPayoutFailed(payoutId: string, reason: string): Promise<Payout | null> {
    const [payout] = await db
      .select()
      .from(payouts)
      .where(eq(payouts.id, payoutId));

    if (!payout) return null;

    await walletService.credit(payout.walletId, payout.amount, {
      actorType: "system",
      description: `Payout failed, funds returned: ${reason}`,
    });

    const [updatedPayout] = await db
      .update(payouts)
      .set({
        status: "failed",
        failedAt: new Date(),
        failureReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(payouts.id, payoutId))
      .returning();

    return updatedPayout;
  }

  async getPendingPayouts(): Promise<Payout[]> {
    return db
      .select()
      .from(payouts)
      .where(eq(payouts.status, "pending"))
      .orderBy(payouts.createdAt);
  }

  async getPayoutsByRecipient(recipientId: string): Promise<Payout[]> {
    return db
      .select()
      .from(payouts)
      .where(eq(payouts.recipientId, recipientId))
      .orderBy(desc(payouts.createdAt));
  }

  async getPayoutById(payoutId: string): Promise<Payout | null> {
    const [payout] = await db.select().from(payouts).where(eq(payouts.id, payoutId));
    return payout || null;
  }

  async getCorporateDailySweep(): Promise<{
    totalETB: number;
    totalUSD: number;
    pendingPayouts: number;
    completedPayouts: number;
  }> {
    const corporateETB = await walletService.getCorporateWallet("ETB");
    const corporateUSD = await walletService.getCorporateWallet("USD");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [stats] = await db
      .select({
        pending: sql<number>`COUNT(*) FILTER (WHERE ${payouts.status} = 'pending')`,
        completed: sql<number>`COUNT(*) FILTER (WHERE ${payouts.status} = 'completed' AND ${payouts.completedAt} >= ${today})`,
      })
      .from(payouts);

    return {
      totalETB: parseFloat(corporateETB.availableBalance || "0"),
      totalUSD: parseFloat(corporateUSD.availableBalance || "0"),
      pendingPayouts: stats?.pending || 0,
      completedPayouts: stats?.completed || 0,
    };
  }
}

export const payoutService = PayoutService.getInstance();
