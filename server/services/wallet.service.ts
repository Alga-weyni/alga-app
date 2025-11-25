import { db } from "../db";
import { wallets, type Wallet, type InsertWallet } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import crypto from "crypto";
import { auditLogService } from "./audit-log.service";

export class WalletService {
  private static instance: WalletService;

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  private generateBalanceHash(wallet: Partial<Wallet>): string {
    const data = {
      id: wallet.id,
      availableBalance: wallet.availableBalance,
      frozenBalance: wallet.frozenBalance,
      pendingBalance: wallet.pendingBalance,
      totalEarnings: wallet.totalEarnings,
      totalWithdrawals: wallet.totalWithdrawals,
      timestamp: new Date().toISOString(),
    };
    return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
  }

  async createWallet(data: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values({
      ...data,
      lastBalanceHash: this.generateBalanceHash(data as Partial<Wallet>),
    }).returning();
    
    return wallet;
  }

  async getWallet(id: string): Promise<Wallet | null> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet || null;
  }

  async getWalletByOwner(ownerId: string, currency: string = "ETB"): Promise<Wallet | null> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(and(eq(wallets.ownerId, ownerId), eq(wallets.currency, currency)));
    return wallet || null;
  }

  async getOrCreateWallet(ownerId: string, ownerType: string, currency: string = "ETB"): Promise<Wallet> {
    let wallet = await this.getWalletByOwner(ownerId, currency);
    
    if (!wallet) {
      wallet = await this.createWallet({
        ownerId,
        ownerType,
        currency,
      });
    }
    
    return wallet;
  }

  async getCorporateWallet(currency: string = "ETB"): Promise<Wallet> {
    const corporateOwnerId = "CORPORATE_ALGA";
    return this.getOrCreateWallet(corporateOwnerId, "corporate", currency);
  }

  async credit(
    walletId: string,
    amount: string,
    options: {
      frozen?: boolean;
      pending?: boolean;
      actorId?: string;
      actorType?: "user" | "system" | "cron";
      description?: string;
      requestId?: string;
    } = {}
  ): Promise<Wallet> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error(`Wallet not found: ${walletId}`);

    const previousState = {
      availableBalance: wallet.availableBalance,
      frozenBalance: wallet.frozenBalance,
      pendingBalance: wallet.pendingBalance,
    };

    const amountDecimal = parseFloat(amount);
    let updateData: Partial<Wallet> = {};

    if (options.frozen) {
      updateData.frozenBalance = (parseFloat(wallet.frozenBalance || "0") + amountDecimal).toFixed(2);
    } else if (options.pending) {
      updateData.pendingBalance = (parseFloat(wallet.pendingBalance || "0") + amountDecimal).toFixed(2);
    } else {
      updateData.availableBalance = (parseFloat(wallet.availableBalance || "0") + amountDecimal).toFixed(2);
    }
    
    updateData.totalEarnings = (parseFloat(wallet.totalEarnings || "0") + amountDecimal).toFixed(2);
    updateData.updatedAt = new Date();
    updateData.lastBalanceHash = this.generateBalanceHash({ ...wallet, ...updateData });

    const [updatedWallet] = await db
      .update(wallets)
      .set(updateData)
      .where(eq(wallets.id, walletId))
      .returning();

    await auditLogService.walletCredit({
      walletId,
      amount,
      currency: wallet.currency,
      actorId: options.actorId,
      actorType: options.actorType || "system",
      description: options.description,
      previousState,
      newState: {
        availableBalance: updatedWallet.availableBalance,
        frozenBalance: updatedWallet.frozenBalance,
        pendingBalance: updatedWallet.pendingBalance,
      },
      requestId: options.requestId,
    });

    return updatedWallet;
  }

  async debit(
    walletId: string,
    amount: string,
    options: {
      fromFrozen?: boolean;
      fromPending?: boolean;
      actorId?: string;
      actorType?: "user" | "system" | "cron";
      description?: string;
      requestId?: string;
    } = {}
  ): Promise<Wallet> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error(`Wallet not found: ${walletId}`);

    const previousState = {
      availableBalance: wallet.availableBalance,
      frozenBalance: wallet.frozenBalance,
      pendingBalance: wallet.pendingBalance,
    };

    const amountDecimal = parseFloat(amount);
    let updateData: Partial<Wallet> = {};

    if (options.fromFrozen) {
      const currentFrozen = parseFloat(wallet.frozenBalance || "0");
      if (currentFrozen < amountDecimal) {
        throw new Error(`Insufficient frozen balance: ${currentFrozen} < ${amountDecimal}`);
      }
      updateData.frozenBalance = (currentFrozen - amountDecimal).toFixed(2);
    } else if (options.fromPending) {
      const currentPending = parseFloat(wallet.pendingBalance || "0");
      if (currentPending < amountDecimal) {
        throw new Error(`Insufficient pending balance: ${currentPending} < ${amountDecimal}`);
      }
      updateData.pendingBalance = (currentPending - amountDecimal).toFixed(2);
    } else {
      const currentAvailable = parseFloat(wallet.availableBalance || "0");
      if (currentAvailable < amountDecimal) {
        throw new Error(`Insufficient available balance: ${currentAvailable} < ${amountDecimal}`);
      }
      updateData.availableBalance = (currentAvailable - amountDecimal).toFixed(2);
    }
    
    updateData.totalWithdrawals = (parseFloat(wallet.totalWithdrawals || "0") + amountDecimal).toFixed(2);
    updateData.updatedAt = new Date();
    updateData.lastBalanceHash = this.generateBalanceHash({ ...wallet, ...updateData });

    const [updatedWallet] = await db
      .update(wallets)
      .set(updateData)
      .where(eq(wallets.id, walletId))
      .returning();

    await auditLogService.walletDebit({
      walletId,
      amount,
      currency: wallet.currency,
      actorId: options.actorId,
      actorType: options.actorType || "system",
      description: options.description,
      previousState,
      newState: {
        availableBalance: updatedWallet.availableBalance,
        frozenBalance: updatedWallet.frozenBalance,
        pendingBalance: updatedWallet.pendingBalance,
      },
      requestId: options.requestId,
    });

    return updatedWallet;
  }

  async freeze(
    walletId: string,
    amount: string,
    options: {
      actorId: string;
      reason: string;
      requestId?: string;
    }
  ): Promise<Wallet> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error(`Wallet not found: ${walletId}`);

    const amountDecimal = parseFloat(amount);
    const currentAvailable = parseFloat(wallet.availableBalance || "0");

    if (currentAvailable < amountDecimal) {
      throw new Error(`Insufficient available balance to freeze: ${currentAvailable} < ${amountDecimal}`);
    }

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        availableBalance: (currentAvailable - amountDecimal).toFixed(2),
        frozenBalance: (parseFloat(wallet.frozenBalance || "0") + amountDecimal).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    await auditLogService.balanceFreeze({
      walletId,
      amount,
      currency: wallet.currency,
      actorId: options.actorId,
      reason: options.reason,
      requestId: options.requestId,
    });

    return updatedWallet;
  }

  async unfreeze(
    walletId: string,
    amount: string,
    options: {
      actorId?: string;
      actorType?: "user" | "system" | "cron";
      reason: string;
      requestId?: string;
    }
  ): Promise<Wallet> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error(`Wallet not found: ${walletId}`);

    const amountDecimal = parseFloat(amount);
    const currentFrozen = parseFloat(wallet.frozenBalance || "0");

    if (currentFrozen < amountDecimal) {
      throw new Error(`Insufficient frozen balance to unfreeze: ${currentFrozen} < ${amountDecimal}`);
    }

    const [updatedWallet] = await db
      .update(wallets)
      .set({
        frozenBalance: (currentFrozen - amountDecimal).toFixed(2),
        availableBalance: (parseFloat(wallet.availableBalance || "0") + amountDecimal).toFixed(2),
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    await auditLogService.balanceUnfreeze({
      walletId,
      amount,
      currency: wallet.currency,
      actorId: options.actorId,
      actorType: options.actorType || "system",
      reason: options.reason,
      requestId: options.requestId,
    });

    return updatedWallet;
  }

  async freezeWallet(
    walletId: string,
    reason: string,
    actorId: string
  ): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({
        status: "frozen",
        frozenReason: reason,
        frozenAt: new Date(),
        frozenBy: actorId,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    return wallet;
  }

  async unfreezeWallet(walletId: string): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({
        status: "active",
        frozenReason: null,
        frozenAt: null,
        frozenBy: null,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    return wallet;
  }

  async verifyIntegrity(walletId: string): Promise<{ valid: boolean; expectedHash?: string; actualHash?: string }> {
    const wallet = await this.getWallet(walletId);
    if (!wallet) throw new Error(`Wallet not found: ${walletId}`);

    const currentHash = this.generateBalanceHash(wallet);
    const valid = wallet.lastBalanceHash === currentHash;

    await auditLogService.integrityCheck({
      walletId,
      passed: valid,
      expectedHash: wallet.lastBalanceHash || undefined,
      actualHash: currentHash,
      actorType: "system",
    });

    return {
      valid,
      expectedHash: wallet.lastBalanceHash || undefined,
      actualHash: currentHash,
    };
  }

  async updatePayoutDetails(
    walletId: string,
    details: {
      bankName?: string;
      bankAccountNumber?: string;
      bankAccountName?: string;
      telebirrPhone?: string;
      preferredPayoutMethod?: string;
    }
  ): Promise<Wallet> {
    const [wallet] = await db
      .update(wallets)
      .set({
        ...details,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, walletId))
      .returning();

    return wallet;
  }

  async getAllWallets(): Promise<Wallet[]> {
    return db.select().from(wallets);
  }

  async getWalletsByOwnerType(ownerType: string): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.ownerType, ownerType));
  }
}

export const walletService = WalletService.getInstance();
