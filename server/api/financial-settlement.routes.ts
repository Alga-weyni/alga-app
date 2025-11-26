import { Router } from "express";
import { walletService } from "../services/wallet.service.js";
import { ledgerService } from "../services/ledger.service.js";
import { paymentSettlementService } from "../services/payment-settlement.service.js";
import { payoutService } from "../services/payout.service.js";
import { fxService } from "../services/fx.service.js";
import { taxService } from "../services/tax.service.js";
import { reconciliationService } from "../services/reconciliation.service.js";
import { auditLogService } from "../services/audit-log.service.js";
import { db } from "../db.js";
import { financialAuditLogs, wallets, settlementTransactions, payouts, fxRates } from "../../shared/schema.js";
import { desc, eq } from "drizzle-orm";

const router = Router();

const isAuthenticated = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

const isAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "operator")) {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};

router.get("/my-wallet", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const currency = (req.query.currency as string) || "ETB";
    
    const wallet = await walletService.getWalletByOwner(userId, currency);
    
    if (!wallet) {
      return res.json({
        exists: false,
        message: "No wallet found. A wallet will be created on first transaction.",
      });
    }
    
    res.json({
      exists: true,
      wallet: {
        id: wallet.id,
        currency: wallet.currency,
        availableBalance: wallet.availableBalance,
        frozenBalance: wallet.frozenBalance,
        pendingBalance: wallet.pendingBalance,
        totalEarnings: wallet.totalEarnings,
        totalWithdrawals: wallet.totalWithdrawals,
        status: wallet.status,
        preferredPayoutMethod: wallet.preferredPayoutMethod,
        hasBankDetails: !!wallet.bankAccountNumber,
        hasTelebirr: !!wallet.telebirrPhone,
      },
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    res.status(500).json({ message: "Failed to fetch wallet" });
  }
});

router.patch("/my-wallet/payout-details", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { bankName, bankAccountNumber, bankAccountName, telebirrPhone, preferredPayoutMethod } = req.body;
    
    let wallet = await walletService.getWalletByOwner(userId, "ETB");
    
    if (!wallet) {
      const userRole = req.user.role;
      const ownerType = userRole === "host" ? "owner" : userRole === "agent" ? "dellala" : "user";
      wallet = await walletService.getOrCreateWallet(userId, ownerType, "ETB");
    }
    
    const updated = await walletService.updatePayoutDetails(wallet.id, {
      bankName,
      bankAccountNumber,
      bankAccountName,
      telebirrPhone,
      preferredPayoutMethod,
    });
    
    res.json({ message: "Payout details updated", wallet: updated });
  } catch (error) {
    console.error("Error updating payout details:", error);
    res.status(500).json({ message: "Failed to update payout details" });
  }
});

router.get("/my-transactions", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    
    const ownerTransactions = await paymentSettlementService.getTransactionsByOwner(userId);
    const dellalaTransactions = await paymentSettlementService.getTransactionsByDellala(userId);
    
    const transactions = [...ownerTransactions, ...dellalaTransactions];
    transactions.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
    
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

router.get("/my-payouts", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const userPayouts = await payoutService.getPayoutsByRecipient(userId);
    res.json(userPayouts);
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ message: "Failed to fetch payouts" });
  }
});

router.post("/request-payout", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { amount, currency = "ETB" } = req.body;
    
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: "Invalid payout amount" });
    }
    
    const wallet = await walletService.getWalletByOwner(userId, currency);
    
    if (!wallet) {
      return res.status(400).json({ message: "No wallet found" });
    }
    
    if (parseFloat(wallet.availableBalance || "0") < parseFloat(amount)) {
      return res.status(400).json({ message: "Insufficient balance" });
    }
    
    if (!wallet.telebirrPhone && !wallet.bankAccountNumber) {
      return res.status(400).json({ message: "Please add payout details first" });
    }
    
    const result = await payoutService.createOwnerPayout({
      walletId: wallet.id,
      recipientId: userId,
      amount: parseFloat(amount),
    });
    
    if (!result.success) {
      return res.status(400).json({ message: result.error });
    }
    
    res.json({
      message: "Payout request submitted",
      payout: result.payout,
    });
  } catch (error) {
    console.error("Error requesting payout:", error);
    res.status(500).json({ message: "Failed to request payout" });
  }
});

router.get("/my-ledger", isAuthenticated, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const wallet = await walletService.getWalletByOwner(userId, "ETB");
    
    if (!wallet) {
      return res.json([]);
    }
    
    const entries = await ledgerService.getEntriesByWallet(wallet.id);
    res.json(entries);
  } catch (error) {
    console.error("Error fetching ledger:", error);
    res.status(500).json({ message: "Failed to fetch ledger entries" });
  }
});

router.get("/admin/wallets", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const allWallets = await walletService.getAllWallets();
    res.json(allWallets);
  } catch (error) {
    console.error("Error fetching wallets:", error);
    res.status(500).json({ message: "Failed to fetch wallets" });
  }
});

router.get("/admin/transactions", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const transactions = await db
      .select()
      .from(settlementTransactions)
      .orderBy(desc(settlementTransactions.createdAt))
      .limit(100);
    res.json(transactions);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

router.get("/admin/payouts", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const allPayouts = await db
      .select()
      .from(payouts)
      .orderBy(desc(payouts.createdAt))
      .limit(100);
    res.json(allPayouts);
  } catch (error) {
    console.error("Error fetching payouts:", error);
    res.status(500).json({ message: "Failed to fetch payouts" });
  }
});

router.post("/admin/payouts/:id/approve", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const payout = await payoutService.markPayoutProcessing(id);
    
    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }
    
    res.json({ message: "Payout approved for processing", payout });
  } catch (error) {
    console.error("Error approving payout:", error);
    res.status(500).json({ message: "Failed to approve payout" });
  }
});

router.post("/admin/payouts/:id/complete", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { externalReference } = req.body;
    
    const payout = await payoutService.markPayoutCompleted(id, externalReference);
    
    if (!payout) {
      return res.status(404).json({ message: "Payout not found" });
    }
    
    res.json({ message: "Payout marked as completed", payout });
  } catch (error) {
    console.error("Error completing payout:", error);
    res.status(500).json({ message: "Failed to complete payout" });
  }
});

router.post("/admin/wallets/:id/freeze", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const wallet = await walletService.freezeWallet(id, reason, req.user.id);
    res.json({ message: "Wallet frozen", wallet });
  } catch (error) {
    console.error("Error freezing wallet:", error);
    res.status(500).json({ message: "Failed to freeze wallet" });
  }
});

router.post("/admin/wallets/:id/unfreeze", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { id } = req.params;
    const wallet = await walletService.unfreezeWallet(id);
    res.json({ message: "Wallet unfrozen", wallet });
  } catch (error) {
    console.error("Error unfreezing wallet:", error);
    res.status(500).json({ message: "Failed to unfreeze wallet" });
  }
});

router.get("/admin/fx-rates", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const rates = await fxService.getAllActiveRates();
    res.json(rates);
  } catch (error) {
    console.error("Error fetching FX rates:", error);
    res.status(500).json({ message: "Failed to fetch FX rates" });
  }
});

router.post("/admin/fx-rates", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { fromCurrency, toCurrency, rate, source } = req.body;
    
    if (!fromCurrency || !toCurrency || !rate) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    const fxRate = await fxService.setRate({
      fromCurrency,
      toCurrency,
      rate: parseFloat(rate).toFixed(6),
      inverseRate: (1 / parseFloat(rate)).toFixed(6),
      source: source || "manual",
      effectiveFrom: new Date(),
      isActive: true,
      setBy: req.user.id,
    });
    
    res.json({ message: "FX rate set", rate: fxRate });
  } catch (error) {
    console.error("Error setting FX rate:", error);
    res.status(500).json({ message: "Failed to set FX rate" });
  }
});

router.get("/admin/reconciliation", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const history = await reconciliationService.getReconciliationHistory();
    res.json(history);
  } catch (error) {
    console.error("Error fetching reconciliation history:", error);
    res.status(500).json({ message: "Failed to fetch reconciliation history" });
  }
});

router.post("/admin/reconciliation/run", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const { periodType = "daily" } = req.body;
    
    let result;
    if (periodType === "weekly") {
      result = await reconciliationService.runWeeklyReconciliation();
    } else {
      result = await reconciliationService.runDailyReconciliation();
    }
    
    res.json({
      message: result.success ? "Reconciliation completed" : "Reconciliation found discrepancies",
      ...result,
    });
  } catch (error) {
    console.error("Error running reconciliation:", error);
    res.status(500).json({ message: "Failed to run reconciliation" });
  }
});

router.get("/admin/integrity-check", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const result = await reconciliationService.verifyAllWalletIntegrity();
    res.json(result);
  } catch (error) {
    console.error("Error running integrity check:", error);
    res.status(500).json({ message: "Failed to run integrity check" });
  }
});

router.get("/admin/audit-logs", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const logs = await db
      .select()
      .from(financialAuditLogs)
      .orderBy(desc(financialAuditLogs.createdAt))
      .limit(limit);
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

router.get("/admin/corporate-summary", isAuthenticated, isAdmin, async (req: any, res) => {
  try {
    const sweep = await payoutService.getCorporateDailySweep();
    const corporateETB = await walletService.getCorporateWallet("ETB");
    const corporateUSD = await walletService.getCorporateWallet("USD");
    
    res.json({
      wallets: {
        etb: {
          available: corporateETB.availableBalance,
          frozen: corporateETB.frozenBalance,
          totalEarnings: corporateETB.totalEarnings,
        },
        usd: {
          available: corporateUSD.availableBalance,
          frozen: corporateUSD.frozenBalance,
          totalEarnings: corporateUSD.totalEarnings,
        },
      },
      payouts: {
        pending: sweep.pendingPayouts,
        completedToday: sweep.completedPayouts,
      },
    });
  } catch (error) {
    console.error("Error fetching corporate summary:", error);
    res.status(500).json({ message: "Failed to fetch corporate summary" });
  }
});

router.get("/calculate-split", async (req, res) => {
  try {
    const { amount, hasDellala } = req.query;
    
    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }
    
    const split = taxService.calculateCommissionSplit(
      parseFloat(amount as string),
      hasDellala === "true"
    );
    
    res.json({
      grossAmount: split.grossAmount,
      ownerShare: split.ownerShare,
      dellalaShare: split.dellalaShare,
      corporateShare: split.corporateShare,
      vat: split.taxes.vatAmount,
      withholdingTax: split.taxes.withholdingTax,
      breakdown: {
        ownerPercent: ((split.ownerShare / split.grossAmount) * 100).toFixed(1),
        dellalaPercent: ((split.dellalaShare / split.grossAmount) * 100).toFixed(1),
        corporatePercent: ((split.corporateShare / split.grossAmount) * 100).toFixed(1),
      },
    });
  } catch (error) {
    console.error("Error calculating split:", error);
    res.status(500).json({ message: "Failed to calculate split" });
  }
});

router.get("/fx-convert", async (req, res) => {
  try {
    const { amount, from, to } = req.query;
    
    if (!amount || !from || !to) {
      return res.status(400).json({ message: "Amount, from, and to currencies are required" });
    }
    
    const conversion = await fxService.convert(
      parseFloat(amount as string),
      from as string,
      to as string
    );
    
    res.json(conversion);
  } catch (error) {
    console.error("Error converting currency:", error);
    res.status(500).json({ message: "Failed to convert currency" });
  }
});

export default router;
