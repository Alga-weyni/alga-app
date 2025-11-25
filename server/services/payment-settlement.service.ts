import { db } from "../db";
import {
  settlementTransactions,
  bookings,
  properties,
  agents,
  agentProperties,
  users,
  type SettlementTransaction,
  type InsertSettlementTransaction,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";
import { walletService } from "./wallet.service";
import { ledgerService } from "./ledger.service";
import { taxService } from "./tax.service";
import { fxService } from "./fx.service";
import { auditLogService } from "./audit-log.service";

export interface SettlementResult {
  success: boolean;
  transaction?: SettlementTransaction;
  error?: string;
  breakdown?: {
    grossAmount: string;
    ownerShare: string;
    dellalaShare: string;
    corporateShare: string;
    vatAmount: string;
    withholdingTax: string;
    fxRate?: string;
    originalCurrency?: string;
    originalAmount?: string;
  };
}

export class PaymentSettlementService {
  private static instance: PaymentSettlementService;

  private constructor() {}

  static getInstance(): PaymentSettlementService {
    if (!PaymentSettlementService.instance) {
      PaymentSettlementService.instance = new PaymentSettlementService();
    }
    return PaymentSettlementService.instance;
  }

  private generateTransactionHash(data: object): string {
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  async settleBookingPayment(params: {
    bookingId: number;
    paymentReference: string;
    paymentMethod: string;
    grossAmount: number;
    currency: string;
    guestId: string;
    freezeUntilCheckout?: boolean;
  }): Promise<SettlementResult> {
    try {
      const [booking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, params.bookingId));

      if (!booking) {
        return { success: false, error: "Booking not found" };
      }

      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, booking.propertyId));

      if (!property) {
        return { success: false, error: "Property not found" };
      }

      const ownerId = property.hostId;
      let dellalaId: string | null = null;
      let dellalaActive = false;

      const [agentProperty] = await db
        .select({
          agentId: agentProperties.agentId,
          firstBookingDate: agentProperties.firstBookingDate,
        })
        .from(agentProperties)
        .innerJoin(agents, eq(agents.id, agentProperties.agentId))
        .where(eq(agentProperties.propertyId, property.id));

      if (agentProperty) {
        const [agent] = await db
          .select()
          .from(agents)
          .where(eq(agents.id, agentProperty.agentId));

        if (agent) {
          dellalaId = agent.userId;
          dellalaActive = taxService.isDellalaCommissionActive(
            new Date(agentProperty.firstBookingDate || agent.createdAt || Date.now())
          );
        }
      }

      let grossAmountETB = params.grossAmount;
      let fxRateUsed: string | undefined;
      let fxRateId: string | undefined;
      let originalCurrency = params.currency;
      let originalAmount = params.grossAmount;

      if (params.currency !== "ETB") {
        const fxConversion = await fxService.convert(
          params.grossAmount,
          params.currency,
          "ETB"
        );
        grossAmountETB = fxConversion.convertedAmount;
        fxRateUsed = fxConversion.rate.toFixed(6);
        fxRateId = fxConversion.rateId;
      }

      const commissionSplit = taxService.calculateCommissionSplit(
        grossAmountETB,
        !!dellalaId,
        dellalaActive
      );

      const ownerWallet = await walletService.getOrCreateWallet(ownerId, "owner", "ETB");
      const corporateWallet = await walletService.getCorporateWallet("ETB");

      let dellalaWallet = null;
      if (dellalaId && commissionSplit.dellalaShare > 0) {
        dellalaWallet = await walletService.getOrCreateWallet(dellalaId, "dellala", "ETB");
      }

      const transactionId = crypto.randomUUID();
      const transactionHash = this.generateTransactionHash({
        bookingId: params.bookingId,
        grossAmount: grossAmountETB,
        ownerShare: commissionSplit.ownerShare,
        dellalaShare: commissionSplit.dellalaShare,
        corporateShare: commissionSplit.corporateShare,
        timestamp: new Date().toISOString(),
      });

      const [transaction] = await db
        .insert(settlementTransactions)
        .values({
          id: transactionId,
          bookingId: params.bookingId,
          paymentReference: params.paymentReference,
          paymentMethod: params.paymentMethod,
          grossAmount: grossAmountETB.toFixed(2),
          currency: "ETB",
          ownerShare: commissionSplit.ownerShare.toFixed(2),
          dellalaShare: commissionSplit.dellalaShare.toFixed(2),
          corporateShare: commissionSplit.corporateShare.toFixed(2),
          vatAmount: commissionSplit.taxes.vatAmount.toFixed(2),
          withholdingTax: commissionSplit.taxes.withholdingTax.toFixed(2),
          originalCurrency: params.currency !== "ETB" ? params.currency : undefined,
          originalAmount: params.currency !== "ETB" ? originalAmount.toFixed(2) : undefined,
          fxRateUsed: fxRateUsed,
          status: params.freezeUntilCheckout ? "frozen" : "settled",
          settledAt: params.freezeUntilCheckout ? undefined : new Date(),
          frozenAt: params.freezeUntilCheckout ? new Date() : undefined,
          ownerId,
          dellalaId,
          guestId: params.guestId,
          transactionHash,
        })
        .returning();

      await ledgerService.createSettlementEntries({
        transactionId,
        bookingId: params.bookingId,
        grossAmount: grossAmountETB.toFixed(2),
        ownerShare: commissionSplit.ownerShare.toFixed(2),
        ownerWalletId: ownerWallet.id,
        dellalaShare: commissionSplit.dellalaShare.toFixed(2),
        dellalaWalletId: dellalaWallet?.id,
        corporateShare: commissionSplit.corporateShare.toFixed(2),
        corporateWalletId: corporateWallet.id,
        vatAmount: commissionSplit.taxes.vatAmount.toFixed(2),
        withholdingTax: commissionSplit.taxes.withholdingTax.toFixed(2),
        currency: "ETB",
      });

      if (params.freezeUntilCheckout) {
        await walletService.credit(ownerWallet.id, commissionSplit.ownerShare.toFixed(2), {
          frozen: true,
          actorType: "system",
          description: `Frozen owner earnings for booking #${params.bookingId}`,
        });

        if (dellalaWallet && commissionSplit.dellalaShare > 0) {
          await walletService.credit(dellalaWallet.id, commissionSplit.dellalaShare.toFixed(2), {
            frozen: true,
            actorType: "system",
            description: `Frozen dellala commission for booking #${params.bookingId}`,
          });
        }
      } else {
        await walletService.credit(ownerWallet.id, commissionSplit.ownerShare.toFixed(2), {
          actorType: "system",
          description: `Owner earnings for booking #${params.bookingId}`,
        });

        if (dellalaWallet && commissionSplit.dellalaShare > 0) {
          await walletService.credit(dellalaWallet.id, commissionSplit.dellalaShare.toFixed(2), {
            actorType: "system",
            description: `Dellala commission for booking #${params.bookingId}`,
          });
        }
      }

      await walletService.credit(corporateWallet.id, commissionSplit.corporateShare.toFixed(2), {
        actorType: "system",
        description: `Alga commission for booking #${params.bookingId}`,
      });

      await auditLogService.settlementCreated({
        transactionId,
        bookingId: params.bookingId,
        grossAmount: grossAmountETB.toFixed(2),
        ownerShare: commissionSplit.ownerShare.toFixed(2),
        dellalaShare: commissionSplit.dellalaShare.toFixed(2),
        corporateShare: commissionSplit.corporateShare.toFixed(2),
        currency: "ETB",
        actorType: "system",
      });

      if (fxRateUsed) {
        await auditLogService.fxConversion({
          transactionId,
          fromCurrency: originalCurrency,
          toCurrency: "ETB",
          fromAmount: originalAmount.toFixed(2),
          toAmount: grossAmountETB.toFixed(2),
          rate: fxRateUsed,
          actorType: "system",
        });
      }

      return {
        success: true,
        transaction,
        breakdown: {
          grossAmount: grossAmountETB.toFixed(2),
          ownerShare: commissionSplit.ownerShare.toFixed(2),
          dellalaShare: commissionSplit.dellalaShare.toFixed(2),
          corporateShare: commissionSplit.corporateShare.toFixed(2),
          vatAmount: commissionSplit.taxes.vatAmount.toFixed(2),
          withholdingTax: commissionSplit.taxes.withholdingTax.toFixed(2),
          fxRate: fxRateUsed,
          originalCurrency: params.currency !== "ETB" ? originalCurrency : undefined,
          originalAmount: params.currency !== "ETB" ? originalAmount.toFixed(2) : undefined,
        },
      };
    } catch (error) {
      console.error("Settlement error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown settlement error",
      };
    }
  }

  async unfreezeOnCheckout(bookingId: number): Promise<SettlementResult> {
    try {
      const [transaction] = await db
        .select()
        .from(settlementTransactions)
        .where(
          and(
            eq(settlementTransactions.bookingId, bookingId),
            eq(settlementTransactions.status, "frozen")
          )
        );

      if (!transaction) {
        return { success: false, error: "No frozen transaction found for booking" };
      }

      if (transaction.ownerId) {
        const ownerWallet = await walletService.getWalletByOwner(transaction.ownerId, "ETB");
        if (ownerWallet) {
          await walletService.unfreeze(ownerWallet.id, transaction.ownerShare, {
            actorType: "system",
            reason: `Checkout completed for booking #${bookingId}`,
          });
        }
      }

      if (transaction.dellalaId && parseFloat(transaction.dellalaShare || "0") > 0) {
        const dellalaWallet = await walletService.getWalletByOwner(transaction.dellalaId, "ETB");
        if (dellalaWallet) {
          await walletService.unfreeze(dellalaWallet.id, transaction.dellalaShare || "0", {
            actorType: "system",
            reason: `Checkout completed for booking #${bookingId}`,
          });
        }
      }

      const [updatedTransaction] = await db
        .update(settlementTransactions)
        .set({
          status: "unfrozen",
          unfrozenAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(settlementTransactions.id, transaction.id))
        .returning();

      return { success: true, transaction: updatedTransaction };
    } catch (error) {
      console.error("Unfreeze error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown unfreeze error",
      };
    }
  }

  async getTransactionByBooking(bookingId: number): Promise<SettlementTransaction | null> {
    const [transaction] = await db
      .select()
      .from(settlementTransactions)
      .where(eq(settlementTransactions.bookingId, bookingId));
    return transaction || null;
  }

  async getTransactionsByOwner(ownerId: string): Promise<SettlementTransaction[]> {
    return db
      .select()
      .from(settlementTransactions)
      .where(eq(settlementTransactions.ownerId, ownerId))
      .orderBy(desc(settlementTransactions.createdAt));
  }

  async getTransactionsByDellala(dellalaId: string): Promise<SettlementTransaction[]> {
    return db
      .select()
      .from(settlementTransactions)
      .where(eq(settlementTransactions.dellalaId, dellalaId))
      .orderBy(desc(settlementTransactions.createdAt));
  }

  async getPendingFrozenTransactions(): Promise<SettlementTransaction[]> {
    return db
      .select()
      .from(settlementTransactions)
      .where(eq(settlementTransactions.status, "frozen"))
      .orderBy(settlementTransactions.frozenAt);
  }

  async refundTransaction(transactionId: string, reason: string): Promise<SettlementResult> {
    try {
      const [transaction] = await db
        .select()
        .from(settlementTransactions)
        .where(eq(settlementTransactions.id, transactionId));

      if (!transaction) {
        return { success: false, error: "Transaction not found" };
      }

      if (transaction.status === "refunded") {
        return { success: false, error: "Transaction already refunded" };
      }

      if (transaction.ownerId) {
        const ownerWallet = await walletService.getWalletByOwner(transaction.ownerId, "ETB");
        if (ownerWallet) {
          const fromFrozen = transaction.status === "frozen";
          await walletService.debit(ownerWallet.id, transaction.ownerShare, {
            fromFrozen,
            actorType: "system",
            description: `Refund for booking #${transaction.bookingId}: ${reason}`,
          });
        }
      }

      if (transaction.dellalaId && parseFloat(transaction.dellalaShare || "0") > 0) {
        const dellalaWallet = await walletService.getWalletByOwner(transaction.dellalaId, "ETB");
        if (dellalaWallet) {
          const fromFrozen = transaction.status === "frozen";
          await walletService.debit(dellalaWallet.id, transaction.dellalaShare || "0", {
            fromFrozen,
            actorType: "system",
            description: `Refund for booking #${transaction.bookingId}: ${reason}`,
          });
        }
      }

      const corporateWallet = await walletService.getCorporateWallet("ETB");
      await walletService.debit(corporateWallet.id, transaction.corporateShare, {
        actorType: "system",
        description: `Refund for booking #${transaction.bookingId}: ${reason}`,
      });

      const [updatedTransaction] = await db
        .update(settlementTransactions)
        .set({
          status: "refunded",
          updatedAt: new Date(),
        })
        .where(eq(settlementTransactions.id, transactionId))
        .returning();

      return { success: true, transaction: updatedTransaction };
    } catch (error) {
      console.error("Refund error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown refund error",
      };
    }
  }
}

export const paymentSettlementService = PaymentSettlementService.getInstance();
