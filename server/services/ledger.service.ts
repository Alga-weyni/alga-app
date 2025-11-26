import { db } from "../db.js";
import { ledgerEntries, type LedgerEntry, type InsertLedgerEntry, wallets } from "../../shared/schema.js";
import { eq, desc, and, sql } from "drizzle-orm";
import crypto from "crypto";

export interface LedgerEntryInput {
  transactionId: string;
  walletId?: string;
  accountType: string;
  entryType: "debit" | "credit";
  amount: string;
  currency: string;
  bookingId?: number;
  description?: string;
}

export class LedgerService {
  private static instance: LedgerService;

  private constructor() {}

  static getInstance(): LedgerService {
    if (!LedgerService.instance) {
      LedgerService.instance = new LedgerService();
    }
    return LedgerService.instance;
  }

  private generateEntryHash(entry: LedgerEntryInput, previousHash?: string): string {
    const data = {
      ...entry,
      previousHash: previousHash || "",
      timestamp: new Date().toISOString(),
    };
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  private async getLastEntryHash(walletId?: string): Promise<string | null> {
    const query = walletId
      ? db
          .select({ entryHash: ledgerEntries.entryHash })
          .from(ledgerEntries)
          .where(eq(ledgerEntries.walletId, walletId))
          .orderBy(desc(ledgerEntries.createdAt))
          .limit(1)
      : db
          .select({ entryHash: ledgerEntries.entryHash })
          .from(ledgerEntries)
          .orderBy(desc(ledgerEntries.createdAt))
          .limit(1);

    const result = await query;
    return result[0]?.entryHash || null;
  }

  private async getWalletBalance(walletId: string): Promise<{ before: string; after: string }> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, walletId));
    return {
      before: wallet?.availableBalance || "0.00",
      after: wallet?.availableBalance || "0.00",
    };
  }

  async createEntry(input: LedgerEntryInput): Promise<LedgerEntry> {
    const previousHash = await this.getLastEntryHash(input.walletId || undefined);
    const entryHash = this.generateEntryHash(input, previousHash || undefined);

    let balanceBefore: string | undefined;
    let balanceAfter: string | undefined;

    if (input.walletId) {
      const balance = await this.getWalletBalance(input.walletId);
      balanceBefore = balance.before;
      balanceAfter = balance.after;
    }

    const [entry] = await db
      .insert(ledgerEntries)
      .values({
        transactionId: input.transactionId,
        walletId: input.walletId,
        accountType: input.accountType,
        entryType: input.entryType,
        amount: input.amount,
        currency: input.currency,
        bookingId: input.bookingId,
        description: input.description,
        balanceBefore,
        balanceAfter,
        entryHash,
        previousHash,
      })
      .returning();

    return entry;
  }

  async createDoubleEntry(
    transactionId: string,
    debitEntry: Omit<LedgerEntryInput, "transactionId" | "entryType">,
    creditEntry: Omit<LedgerEntryInput, "transactionId" | "entryType">
  ): Promise<{ debit: LedgerEntry; credit: LedgerEntry }> {
    const debit = await this.createEntry({
      ...debitEntry,
      transactionId,
      entryType: "debit",
    });

    const credit = await this.createEntry({
      ...creditEntry,
      transactionId,
      entryType: "credit",
    });

    return { debit, credit };
  }

  async createSettlementEntries(params: {
    transactionId: string;
    bookingId: number;
    grossAmount: string;
    ownerShare: string;
    ownerWalletId: string;
    dellalaShare?: string;
    dellalaWalletId?: string;
    corporateShare: string;
    corporateWalletId: string;
    vatAmount: string;
    withholdingTax: string;
    currency: string;
  }): Promise<LedgerEntry[]> {
    const entries: LedgerEntry[] = [];

    const guestPayment = await this.createEntry({
      transactionId: params.transactionId,
      accountType: "guest_payment",
      entryType: "debit",
      amount: params.grossAmount,
      currency: params.currency,
      bookingId: params.bookingId,
      description: `Guest payment for booking #${params.bookingId}`,
    });
    entries.push(guestPayment);

    const ownerEarning = await this.createEntry({
      transactionId: params.transactionId,
      walletId: params.ownerWalletId,
      accountType: "owner_earning",
      entryType: "credit",
      amount: params.ownerShare,
      currency: params.currency,
      bookingId: params.bookingId,
      description: `Owner earnings for booking #${params.bookingId}`,
    });
    entries.push(ownerEarning);

    if (params.dellalaShare && params.dellalaWalletId && parseFloat(params.dellalaShare) > 0) {
      const dellalaCommission = await this.createEntry({
        transactionId: params.transactionId,
        walletId: params.dellalaWalletId,
        accountType: "dellala_commission",
        entryType: "credit",
        amount: params.dellalaShare,
        currency: params.currency,
        bookingId: params.bookingId,
        description: `Dellala commission for booking #${params.bookingId}`,
      });
      entries.push(dellalaCommission);
    }

    const corporateFee = await this.createEntry({
      transactionId: params.transactionId,
      walletId: params.corporateWalletId,
      accountType: "corporate_fee",
      entryType: "credit",
      amount: params.corporateShare,
      currency: params.currency,
      bookingId: params.bookingId,
      description: `Alga commission for booking #${params.bookingId}`,
    });
    entries.push(corporateFee);

    if (parseFloat(params.vatAmount) > 0) {
      const vat = await this.createEntry({
        transactionId: params.transactionId,
        accountType: "vat",
        entryType: "credit",
        amount: params.vatAmount,
        currency: params.currency,
        bookingId: params.bookingId,
        description: `VAT (15%) for booking #${params.bookingId}`,
      });
      entries.push(vat);
    }

    if (parseFloat(params.withholdingTax) > 0) {
      const withholding = await this.createEntry({
        transactionId: params.transactionId,
        accountType: "withholding_tax",
        entryType: "credit",
        amount: params.withholdingTax,
        currency: params.currency,
        bookingId: params.bookingId,
        description: `Withholding tax (10%) for booking #${params.bookingId}`,
      });
      entries.push(withholding);
    }

    return entries;
  }

  async getEntriesByTransaction(transactionId: string): Promise<LedgerEntry[]> {
    return db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.transactionId, transactionId))
      .orderBy(ledgerEntries.createdAt);
  }

  async getEntriesByWallet(walletId: string, limit: number = 50): Promise<LedgerEntry[]> {
    return db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.walletId, walletId))
      .orderBy(desc(ledgerEntries.createdAt))
      .limit(limit);
  }

  async getEntriesByBooking(bookingId: number): Promise<LedgerEntry[]> {
    return db
      .select()
      .from(ledgerEntries)
      .where(eq(ledgerEntries.bookingId, bookingId))
      .orderBy(ledgerEntries.createdAt);
  }

  async verifyChainIntegrity(walletId?: string): Promise<{
    valid: boolean;
    totalEntries: number;
    brokenAt?: number;
    details?: string;
  }> {
    const query = walletId
      ? db
          .select()
          .from(ledgerEntries)
          .where(eq(ledgerEntries.walletId, walletId))
          .orderBy(ledgerEntries.createdAt)
      : db.select().from(ledgerEntries).orderBy(ledgerEntries.createdAt);

    const entries = await query;

    if (entries.length === 0) {
      return { valid: true, totalEntries: 0 };
    }

    for (let i = 1; i < entries.length; i++) {
      const currentEntry = entries[i];
      const previousEntry = entries[i - 1];

      if (currentEntry.previousHash !== previousEntry.entryHash) {
        return {
          valid: false,
          totalEntries: entries.length,
          brokenAt: i,
          details: `Chain broken at entry ${i}: expected previous hash ${previousEntry.entryHash}, got ${currentEntry.previousHash}`,
        };
      }
    }

    return { valid: true, totalEntries: entries.length };
  }

  async getTotalsByAccountType(
    startDate?: Date,
    endDate?: Date
  ): Promise<{ accountType: string; totalDebit: string; totalCredit: string }[]> {
    let query = db
      .select({
        accountType: ledgerEntries.accountType,
        totalDebit: sql<string>`COALESCE(SUM(CASE WHEN ${ledgerEntries.entryType} = 'debit' THEN ${ledgerEntries.amount} ELSE 0 END), 0)`,
        totalCredit: sql<string>`COALESCE(SUM(CASE WHEN ${ledgerEntries.entryType} = 'credit' THEN ${ledgerEntries.amount} ELSE 0 END), 0)`,
      })
      .from(ledgerEntries)
      .groupBy(ledgerEntries.accountType);

    return query;
  }
}

export const ledgerService = LedgerService.getInstance();
