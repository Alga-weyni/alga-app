export interface TaxCalculation {
  grossAmount: number;
  vatAmount: number;
  withholdingTax: number;
  netAmount: number;
  breakdown: {
    vatRate: number;
    withholdingRate: number;
    vatBase: number;
    withholdingBase: number;
  };
}

export interface CommissionSplit {
  grossAmount: number;
  ownerShare: number;
  dellalaShare: number;
  corporateShare: number;
  taxes: TaxCalculation;
}

export class TaxService {
  private static instance: TaxService;

  private readonly VAT_RATE = 0.15; // 15% VAT
  private readonly WITHHOLDING_TAX_RATE = 0.10; // 10% withholding tax on commission
  private readonly ALGA_COMMISSION_RATE = 0.15; // 15% Alga commission
  private readonly DELLALA_COMMISSION_RATE = 0.05; // 5% Dellala commission (for 36 months)

  private constructor() {}

  static getInstance(): TaxService {
    if (!TaxService.instance) {
      TaxService.instance = new TaxService();
    }
    return TaxService.instance;
  }

  calculateVAT(amount: number): number {
    return Math.round(amount * this.VAT_RATE * 100) / 100;
  }

  calculateWithholdingTax(commission: number): number {
    return Math.round(commission * this.WITHHOLDING_TAX_RATE * 100) / 100;
  }

  calculateTaxes(grossAmount: number, isCommission: boolean = false): TaxCalculation {
    const vatAmount = this.calculateVAT(grossAmount);
    const withholdingTax = isCommission ? this.calculateWithholdingTax(grossAmount) : 0;
    const netAmount = grossAmount - vatAmount - withholdingTax;

    return {
      grossAmount,
      vatAmount,
      withholdingTax,
      netAmount,
      breakdown: {
        vatRate: this.VAT_RATE,
        withholdingRate: this.WITHHOLDING_TAX_RATE,
        vatBase: grossAmount,
        withholdingBase: isCommission ? grossAmount : 0,
      },
    };
  }

  calculateCommissionSplit(
    grossAmount: number,
    hasDellala: boolean = false,
    dellalaActive: boolean = true
  ): CommissionSplit {
    const algaCommission = Math.round(grossAmount * this.ALGA_COMMISSION_RATE * 100) / 100;
    
    let dellalaShare = 0;
    if (hasDellala && dellalaActive) {
      dellalaShare = Math.round(grossAmount * this.DELLALA_COMMISSION_RATE * 100) / 100;
    }
    
    const totalCommission = algaCommission + dellalaShare;
    const ownerShare = Math.round((grossAmount - totalCommission) * 100) / 100;

    const taxes = this.calculateTaxes(algaCommission, true);

    return {
      grossAmount,
      ownerShare,
      dellalaShare,
      corporateShare: algaCommission,
      taxes,
    };
  }

  calculateOwnerPayout(
    ownerShare: number,
    applyWithholding: boolean = true
  ): { netAmount: number; withholdingTax: number } {
    if (applyWithholding) {
      const withholdingTax = this.calculateWithholdingTax(ownerShare);
      return {
        netAmount: ownerShare - withholdingTax,
        withholdingTax,
      };
    }
    return {
      netAmount: ownerShare,
      withholdingTax: 0,
    };
  }

  calculateDelalalPayout(dellalaShare: number): { netAmount: number; withholdingTax: number } {
    const withholdingTax = this.calculateWithholdingTax(dellalaShare);
    return {
      netAmount: dellalaShare - withholdingTax,
      withholdingTax,
    };
  }

  isDellalaCommissionActive(dellalaRegistrationDate: Date): boolean {
    const monthsSinceRegistration = this.getMonthsDifference(dellalaRegistrationDate, new Date());
    return monthsSinceRegistration <= 36;
  }

  private getMonthsDifference(startDate: Date, endDate: Date): number {
    const yearsDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthsDiff = endDate.getMonth() - startDate.getMonth();
    return yearsDiff * 12 + monthsDiff;
  }

  generateERCAReceipt(transaction: {
    id: string;
    grossAmount: number;
    vatAmount: number;
    withholdingTax: number;
    netAmount: number;
    date: Date;
    payerName: string;
    payerTIN?: string;
    payeeName: string;
    payeeTIN?: string;
    description: string;
  }): object {
    return {
      receiptNumber: `ERCA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: transaction.id,
      issueDate: transaction.date.toISOString(),
      payer: {
        name: transaction.payerName,
        tin: transaction.payerTIN || "N/A",
      },
      payee: {
        name: transaction.payeeName,
        tin: transaction.payeeTIN || "N/A",
      },
      amounts: {
        gross: transaction.grossAmount,
        vat: transaction.vatAmount,
        withholdingTax: transaction.withholdingTax,
        net: transaction.netAmount,
      },
      description: transaction.description,
      vatRate: `${this.VAT_RATE * 100}%`,
      withholdingRate: `${this.WITHHOLDING_TAX_RATE * 100}%`,
      issuedBy: "Alga Platform - Women-Owned Ethiopian Hospitality",
      footer: "This is a system-generated receipt for Ethiopian Revenue and Customs Authority (ERCA) compliance.",
    };
  }
}

export const taxService = TaxService.getInstance();
