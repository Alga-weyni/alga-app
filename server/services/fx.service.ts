import { db } from "../db.js";
import { fxRates, type FxRate, type InsertFxRate } from "@shared/schema.js";
import { eq, and, desc, lte, or, isNull } from "drizzle-orm";

export interface FxConversion {
  originalAmount: number;
  originalCurrency: string;
  convertedAmount: number;
  targetCurrency: string;
  rate: number;
  rateId: string;
  rateSource: string;
  effectiveDate: Date;
}

export class FxService {
  private static instance: FxService;
  
  private readonly DEFAULT_USD_ETB_RATE = 56.50;

  private constructor() {}

  static getInstance(): FxService {
    if (!FxService.instance) {
      FxService.instance = new FxService();
    }
    return FxService.instance;
  }

  async setRate(data: InsertFxRate): Promise<FxRate> {
    await db
      .update(fxRates)
      .set({ isActive: false, effectiveTo: new Date() })
      .where(
        and(
          eq(fxRates.fromCurrency, data.fromCurrency),
          eq(fxRates.toCurrency, data.toCurrency),
          eq(fxRates.isActive, true)
        )
      );

    const [rate] = await db.insert(fxRates).values(data).returning();
    return rate;
  }

  async getCurrentRate(fromCurrency: string, toCurrency: string): Promise<FxRate | null> {
    const [rate] = await db
      .select()
      .from(fxRates)
      .where(
        and(
          eq(fxRates.fromCurrency, fromCurrency),
          eq(fxRates.toCurrency, toCurrency),
          eq(fxRates.isActive, true)
        )
      )
      .orderBy(desc(fxRates.effectiveFrom))
      .limit(1);

    return rate || null;
  }

  async getRateAtDate(fromCurrency: string, toCurrency: string, date: Date): Promise<FxRate | null> {
    const [rate] = await db
      .select()
      .from(fxRates)
      .where(
        and(
          eq(fxRates.fromCurrency, fromCurrency),
          eq(fxRates.toCurrency, toCurrency),
          lte(fxRates.effectiveFrom, date)
        )
      )
      .orderBy(desc(fxRates.effectiveFrom))
      .limit(1);

    return rate || null;
  }

  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    date?: Date
  ): Promise<FxConversion> {
    if (fromCurrency === toCurrency) {
      return {
        originalAmount: amount,
        originalCurrency: fromCurrency,
        convertedAmount: amount,
        targetCurrency: toCurrency,
        rate: 1,
        rateId: "SAME_CURRENCY",
        rateSource: "system",
        effectiveDate: new Date(),
      };
    }

    let fxRate: FxRate | null;
    
    if (date) {
      fxRate = await this.getRateAtDate(fromCurrency, toCurrency, date);
    } else {
      fxRate = await this.getCurrentRate(fromCurrency, toCurrency);
    }

    if (!fxRate) {
      fxRate = await this.getCurrentRate(toCurrency, fromCurrency);
      
      if (fxRate) {
        const convertedAmount = Math.round(amount * parseFloat(fxRate.inverseRate) * 100) / 100;
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount,
          targetCurrency: toCurrency,
          rate: parseFloat(fxRate.inverseRate),
          rateId: fxRate.id,
          rateSource: fxRate.source,
          effectiveDate: fxRate.effectiveFrom,
        };
      }
    }

    if (!fxRate) {
      if (fromCurrency === "USD" && toCurrency === "ETB") {
        const defaultRate = this.DEFAULT_USD_ETB_RATE;
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: Math.round(amount * defaultRate * 100) / 100,
          targetCurrency: toCurrency,
          rate: defaultRate,
          rateId: "DEFAULT_RATE",
          rateSource: "system_default",
          effectiveDate: new Date(),
        };
      }
      if (fromCurrency === "ETB" && toCurrency === "USD") {
        const defaultRate = 1 / this.DEFAULT_USD_ETB_RATE;
        return {
          originalAmount: amount,
          originalCurrency: fromCurrency,
          convertedAmount: Math.round(amount * defaultRate * 100) / 100,
          targetCurrency: toCurrency,
          rate: defaultRate,
          rateId: "DEFAULT_RATE",
          rateSource: "system_default",
          effectiveDate: new Date(),
        };
      }
      throw new Error(`No FX rate found for ${fromCurrency} to ${toCurrency}`);
    }

    const convertedAmount = Math.round(amount * parseFloat(fxRate.rate) * 100) / 100;

    return {
      originalAmount: amount,
      originalCurrency: fromCurrency,
      convertedAmount,
      targetCurrency: toCurrency,
      rate: parseFloat(fxRate.rate),
      rateId: fxRate.id,
      rateSource: fxRate.source,
      effectiveDate: fxRate.effectiveFrom,
    };
  }

  async getAllActiveRates(): Promise<FxRate[]> {
    return db.select().from(fxRates).where(eq(fxRates.isActive, true));
  }

  async getRateHistory(fromCurrency: string, toCurrency: string, limit: number = 30): Promise<FxRate[]> {
    return db
      .select()
      .from(fxRates)
      .where(
        and(
          eq(fxRates.fromCurrency, fromCurrency),
          eq(fxRates.toCurrency, toCurrency)
        )
      )
      .orderBy(desc(fxRates.effectiveFrom))
      .limit(limit);
  }

  async seedDefaultRates(setBy?: string): Promise<void> {
    const existingRate = await this.getCurrentRate("USD", "ETB");
    
    if (!existingRate) {
      await this.setRate({
        fromCurrency: "USD",
        toCurrency: "ETB",
        rate: this.DEFAULT_USD_ETB_RATE.toString(),
        inverseRate: (1 / this.DEFAULT_USD_ETB_RATE).toFixed(6),
        buyRate: (this.DEFAULT_USD_ETB_RATE * 0.99).toFixed(6),
        sellRate: (this.DEFAULT_USD_ETB_RATE * 1.01).toFixed(6),
        spread: "2.0000",
        source: "manual",
        effectiveFrom: new Date(),
        isActive: true,
        setBy,
      });
      console.log("✅ Default USD/ETB FX rate seeded");
    }
  }
}

export const fxService = FxService.getInstance();
