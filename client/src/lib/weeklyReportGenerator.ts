/**
 * Weekly Performance Pulse Report Generator
 * Generates comprehensive PDF reports for all 5 operational pillars
 * 
 * ZERO COST - Uses jsPDF (already installed)
 */

import jsPDF from 'jspdf';

export interface WeeklyReportData {
  agents: {
    total: number;
    active: number;
    newThisWeek: number;
    totalCommissions: number;
    topAgent: { name: string; earnings: number } | null;
  };
  properties: {
    total: number;
    verified: number;
    pendingVerification: number;
    newThisWeek: number;
  };
  hardware: {
    deployed: number;
    expiringWarranties: number;
    totalInvestment: number;
  };
  payments: {
    totalVolume: number;
    unreconciled: number;
    transactions: number;
  };
  marketing: {
    activeCampaigns: number;
    totalBudget: number;
    totalSpent: number;
    totalImpressions: number;
    totalConversions: number;
  };
  alerts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

export class WeeklyReportGenerator {
  generatePDF(data: WeeklyReportData, weekEnding: Date): jsPDF {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('አልጋ Alga - Weekly Performance Pulse', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Week Ending: ${weekEnding.toLocaleDateString('en-ET')}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text('Lemlem Operations Dashboard - Confidential', pageWidth / 2, yPos, { align: 'center' });
    pdf.setTextColor(0);
    
    yPos += 15;

    // Divider
    pdf.setDrawColor(139, 69, 19); // Brown
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 10;

    // Executive Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', 15, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const summaryLines = [
      `• Total Agents: ${data.agents.total} (${data.agents.newThisWeek} new this week)`,
      `• Active Properties: ${data.properties.total} (${data.properties.verified} verified)`,
      `• Payment Volume: ETB ${data.payments.totalVolume.toLocaleString()}`,
      `• Critical Alerts: ${data.alerts.critical} requiring immediate attention`,
    ];

    summaryLines.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 6;
    });

    yPos += 5;

    // 1. Agent Governance
    this.addSection(pdf, yPos, '1. Agent Governance', [
      `Total Agents: ${data.agents.total}`,
      `Active Agents: ${data.agents.active}`,
      `New This Week: ${data.agents.newThisWeek}`,
      `Total Commissions Paid: ETB ${data.agents.totalCommissions.toLocaleString()}`,
      data.agents.topAgent
        ? `Top Performer: ${data.agents.topAgent.name} (ETB ${data.agents.topAgent.earnings.toLocaleString()})`
        : 'No agent data available'
    ]);
    yPos += 45;

    // 2. Supply Curation
    this.addSection(pdf, yPos, '2. Supply Curation', [
      `Total Properties: ${data.properties.total}`,
      `Verified: ${data.properties.verified} (${Math.round((data.properties.verified / data.properties.total) * 100)}%)`,
      `Pending Verification: ${data.properties.pendingVerification}`,
      `New This Week: ${data.properties.newThisWeek}`
    ]);
    yPos += 40;

    // 3. Hardware Deployment
    this.addSection(pdf, yPos, '3. Hardware Deployment', [
      `Devices Deployed: ${data.hardware.deployed}`,
      `Warranties Expiring Soon: ${data.hardware.expiringWarranties}`,
      `Total Investment: ETB ${data.hardware.totalInvestment.toLocaleString()}`
    ]);
    yPos += 35;

    // Check if need new page
    if (yPos > 240) {
      pdf.addPage();
      yPos = 20;
    }

    // 4. Payments & Compliance
    this.addSection(pdf, yPos, '4. Payments & Compliance', [
      `Total Transaction Volume: ETB ${data.payments.totalVolume.toLocaleString()}`,
      `Transactions Processed: ${data.payments.transactions}`,
      `Unreconciled Payments: ${data.payments.unreconciled}`,
      data.payments.unreconciled > 0
        ? '⚠️ ACTION REQUIRED: Reconcile pending payments'
        : '✓ All payments reconciled'
    ]);
    yPos += 40;

    // 5. Marketing & Growth
    this.addSection(pdf, yPos, '5. Marketing & Growth', [
      `Active Campaigns: ${data.marketing.activeCampaigns}`,
      `Total Budget: ETB ${data.marketing.totalBudget.toLocaleString()}`,
      `Spent: ETB ${data.marketing.totalSpent.toLocaleString()} (${Math.round((data.marketing.totalSpent / data.marketing.totalBudget) * 100)}%)`,
      `Total Impressions: ${data.marketing.totalImpressions.toLocaleString()}`,
      `Total Conversions: ${data.marketing.totalConversions}`
    ]);
    yPos += 45;

    // Alerts Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Active Alerts & Red Flags', 15, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const alertLines = [
      `🔴 Critical: ${data.alerts.critical}`,
      `🟠 High: ${data.alerts.high}`,
      `🟡 Medium: ${data.alerts.medium}`,
      `🔵 Low: ${data.alerts.low}`,
      `Total Active Alerts: ${data.alerts.total}`
    ];

    alertLines.forEach(line => {
      pdf.text(line, 20, yPos);
      yPos += 6;
    });

    yPos += 10;

    // Footer
    pdf.setDrawColor(139, 69, 19);
    pdf.line(15, yPos, pageWidth - 15, yPos);
    yPos += 5;

    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text('Alga One Member PLC • TIN: 0101809194 • INSA Compliant', pageWidth / 2, yPos, { align: 'center' });
    pdf.text(`Generated: ${new Date().toLocaleString('en-ET')}`, pageWidth / 2, yPos + 4, { align: 'center' });

    return pdf;
  }

  private addSection(pdf: jsPDF, yPos: number, title: string, lines: string[]): void {
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 15, yPos);
    yPos += 6;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    lines.forEach(line => {
      pdf.text(`  ${line}`, 20, yPos);
      yPos += 5;
    });
  }

  async downloadReport(data: WeeklyReportData, weekEnding: Date): Promise<void> {
    const pdf = this.generatePDF(data, weekEnding);
    const fileName = `Alga_Weekly_Report_${weekEnding.toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    console.log(`📄 Weekly report downloaded: ${fileName}`);
  }

  async scheduleWeeklyReport(getData: () => Promise<WeeklyReportData>): Promise<void> {
    // Check if it's Friday
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday

    if (dayOfWeek === 5) {
      const data = await getData();
      await this.downloadReport(data, now);
      console.log('📅 Friday weekly report auto-generated!');
    }
  }
}

export const weeklyReportGenerator = new WeeklyReportGenerator();
