/**
 * Predictive Analytics Engine for Lemlem Operations
 * Browser-native trend analysis and early warning system
 * 
 * ZERO COST - No ML APIs, pure JavaScript calculations
 */

import { operationsOfflineStorage } from './operationsOfflineStorage';

export interface Prediction {
  id: string;
  type: 'churn_risk' | 'hardware_failure' | 'compliance_delay' | 'payment_anomaly' | 'agent_decline';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number; // 0-100%
  trend: 'increasing' | 'decreasing' | 'stable';
  forecastDays: number;
  recommendedAction: string;
  affectedEntity?: {
    type: string;
    id: number;
    name: string;
  };
}

class PredictiveAnalyticsEngine {
  // Detect agent churn risk based on activity decline
  detectAgentChurnRisk(agents: any[]): Prediction[] {
    const predictions: Prediction[] = [];

    for (const agent of agents) {
      // Simple heuristic: zero active properties + recent registration = churn risk
      if (agent.activeProperties === 0 && agent.totalProperties > 0) {
        const daysSinceCreated = Math.floor(
          (Date.now() - new Date(agent.createdAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceCreated > 30) {
          predictions.push({
            id: `churn_agent_${agent.id}`,
            type: 'agent_decline',
            severity: 'high',
            title: `Agent Churn Risk: ${agent.fullName}`,
            description: `Agent ${agent.fullName} has ${agent.totalProperties} registered properties but 0 active listings for ${daysSinceCreated} days. High risk of abandonment.`,
            confidence: 85,
            trend: 'increasing',
            forecastDays: 14,
            recommendedAction: 'Re-engage agent with onboarding call or incentives',
            affectedEntity: {
              type: 'agent',
              id: agent.id,
              name: agent.fullName
            }
          });
        }
      }
    }

    return predictions;
  }

  // Predict hardware failures based on warranty and age
  predictHardwareFailures(hardware: any[]): Prediction[] {
    const predictions: Prediction[] = [];

    for (const device of hardware) {
      const warrantyExpiry = new Date(device.warrantyExpiry);
      const installDate = new Date(device.installationDate);
      const now = new Date();

      const daysUntilWarrantyExpiry = Math.floor(
        (warrantyExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const ageInDays = Math.floor(
        (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Predict failure if warranty expiring soon or device is old
      if (daysUntilWarrantyExpiry <= 60 && daysUntilWarrantyExpiry > 0) {
        predictions.push({
          id: `hardware_warranty_${device.id}`,
          type: 'hardware_failure',
          severity: daysUntilWarrantyExpiry <= 30 ? 'critical' : 'high',
          title: `Warranty Expiring: ${device.hardwareType}`,
          description: `${device.hardwareType} (SN: ${device.serialNumber}) warranty expires in ${daysUntilWarrantyExpiry} days. High failure risk post-warranty.`,
          confidence: 90,
          trend: 'increasing',
          forecastDays: daysUntilWarrantyExpiry,
          recommendedAction: 'Schedule replacement or renew warranty before expiry',
          affectedEntity: {
            type: 'hardware',
            id: device.id,
            name: `${device.manufacturer} ${device.model}`
          }
        });
      }

      // Old devices (>2 years) have higher failure probability
      if (ageInDays > 730) { // 2 years
        predictions.push({
          id: `hardware_age_${device.id}`,
          type: 'hardware_failure',
          severity: 'medium',
          title: `Aging Hardware: ${device.hardwareType}`,
          description: `${device.hardwareType} is ${Math.floor(ageInDays / 365)} years old. Increased failure probability detected.`,
          confidence: 65,
          trend: 'increasing',
          forecastDays: 90,
          recommendedAction: 'Schedule preventive maintenance or replacement',
          affectedEntity: {
            type: 'hardware',
            id: device.id,
            name: `${device.manufacturer} ${device.model}`
          }
        });
      }
    }

    return predictions;
  }

  // Detect compliance delays
  detectComplianceDelays(compliance: any[]): Prediction[] {
    const predictions: Prediction[] = [];

    for (const item of compliance) {
      if (item.status !== 'completed' && item.dueDate) {
        const dueDate = new Date(item.dueDate);
        const now = new Date();
        const daysUntilDue = Math.floor(
          (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Warn if due within 14 days
        if (daysUntilDue <= 14 && daysUntilDue > 0) {
          predictions.push({
            id: `compliance_delay_${item.id}`,
            type: 'compliance_delay',
            severity: daysUntilDue <= 7 ? 'critical' : 'high',
            title: `INSA Compliance Deadline Approaching`,
            description: `${item.complianceCategory}: "${item.requirement}" due in ${daysUntilDue} days. Status: ${item.status}`,
            confidence: 95,
            trend: 'stable',
            forecastDays: daysUntilDue,
            recommendedAction: 'Prioritize completion and evidence collection',
            affectedEntity: {
              type: 'compliance',
              id: item.id,
              name: item.complianceCategory
            }
          });
        }

        // Alert if overdue
        if (daysUntilDue < 0) {
          predictions.push({
            id: `compliance_overdue_${item.id}`,
            type: 'compliance_delay',
            severity: 'critical',
            title: `OVERDUE: ${item.complianceCategory}`,
            description: `Requirement "${item.requirement}" is ${Math.abs(daysUntilDue)} days overdue! Critical INSA audit risk.`,
            confidence: 100,
            trend: 'increasing',
            forecastDays: 0,
            recommendedAction: 'URGENT: Complete immediately and notify INSA',
            affectedEntity: {
              type: 'compliance',
              id: item.id,
              name: item.complianceCategory
            }
          });
        }
      }
    }

    return predictions;
  }

  // Detect payment anomalies
  detectPaymentAnomalies(transactions: any[]): Prediction[] {
    const predictions: Prediction[] = [];

    // Calculate average transaction amount
    const amounts = transactions.map(t => parseFloat(t.amount || "0"));
    const avgAmount = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const stdDev = Math.sqrt(
      amounts.reduce((sum, val) => sum + Math.pow(val - avgAmount, 2), 0) / amounts.length
    );

    // Detect anomalies (transactions > 2 standard deviations from mean)
    for (const transaction of transactions) {
      const amount = parseFloat(transaction.amount || "0");
      const zScore = Math.abs((amount - avgAmount) / stdDev);

      if (zScore > 2) {
        predictions.push({
          id: `payment_anomaly_${transaction.id}`,
          type: 'payment_anomaly',
          severity: 'medium',
          title: `Unusual Payment Detected`,
          description: `Transaction ${transaction.transactionId} (ETB ${amount.toLocaleString()}) is ${zScore.toFixed(1)}x above average. Potential anomaly.`,
          confidence: 70,
          trend: 'stable',
          forecastDays: 0,
          recommendedAction: 'Review transaction for fraud or data entry error',
          affectedEntity: {
            type: 'payment',
            id: transaction.id,
            name: transaction.transactionId
          }
        });
      }
    }

    // Detect unreconciled payment pattern
    const unreconciledCount = transactions.filter(t => !t.reconciled).length;
    const unreconciledPercent = (unreconciledCount / transactions.length) * 100;

    if (unreconciledPercent > 20) {
      predictions.push({
        id: `payment_reconciliation_risk`,
        type: 'payment_anomaly',
        severity: 'high',
        title: `High Unreconciled Payment Rate`,
        description: `${unreconciledPercent.toFixed(1)}% of payments (${unreconciledCount}/${transactions.length}) are unreconciled. Risk of financial discrepancies.`,
        confidence: 85,
        trend: 'increasing',
        forecastDays: 7,
        recommendedAction: 'Urgent: Reconcile all pending payments within 48 hours',
      });
    }

    return predictions;
  }

  // Analyze trends from historical data
  async analyzeTrends(): Promise<{
    agentGrowth: 'accelerating' | 'steady' | 'declining';
    propertyGrowth: 'accelerating' | 'steady' | 'declining';
    alertTrend: 'improving' | 'stable' | 'worsening';
  }> {
    const history = await operationsOfflineStorage.getAnalyticsHistory(30);

    if (history.length < 7) {
      // Not enough data
      return {
        agentGrowth: 'steady',
        propertyGrowth: 'steady',
        alertTrend: 'stable'
      };
    }

    // Simple linear regression for agent growth
    const agentCounts = history.map(h => h.agentCount);
    const agentSlope = this.calculateSlope(agentCounts);

    // Property growth
    const propertyCounts = history.map(h => h.propertyCount);
    const propertySlope = this.calculateSlope(propertyCounts);

    // Alert trend
    const alertCounts = history.map(h => h.alertCount);
    const alertSlope = this.calculateSlope(alertCounts);

    return {
      agentGrowth: agentSlope > 0.5 ? 'accelerating' : agentSlope < -0.5 ? 'declining' : 'steady',
      propertyGrowth: propertySlope > 0.5 ? 'accelerating' : propertySlope < -0.5 ? 'declining' : 'steady',
      alertTrend: alertSlope < -0.3 ? 'improving' : alertSlope > 0.3 ? 'worsening' : 'stable'
    };
  }

  // Simple slope calculation (first-last difference)
  private calculateSlope(values: number[]): number {
    if (values.length < 2) return 0;
    const first = values[0];
    const last = values[values.length - 1];
    return (last - first) / values.length;
  }

  // Get all predictions
  async generateAllPredictions(data: {
    agents?: any[];
    hardware?: any[];
    compliance?: any[];
    transactions?: any[];
  }): Promise<Prediction[]> {
    const predictions: Prediction[] = [];

    if (data.agents) {
      predictions.push(...this.detectAgentChurnRisk(data.agents));
    }

    if (data.hardware) {
      predictions.push(...this.predictHardwareFailures(data.hardware));
    }

    if (data.compliance) {
      predictions.push(...this.detectComplianceDelays(data.compliance));
    }

    if (data.transactions) {
      predictions.push(...this.detectPaymentAnomalies(data.transactions));
    }

    // Sort by severity (critical first)
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return predictions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }
}

export const predictiveAnalytics = new PredictiveAnalyticsEngine();
