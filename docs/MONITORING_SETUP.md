# Alga Monitoring & Alerting Setup Guide

**Version:** 1.0  
**Last Updated:** December 2024

---

## Overview

This guide covers setting up monitoring dashboards and alerting for Alga's production environment.

---

## 1. Available Monitoring Endpoints

Alga provides three monitoring endpoints:

### 1.1 Health Check (`/api/health`)
```bash
curl https://api.alga.et/api/health
```
Returns:
- Server status (healthy/degraded)
- Database connectivity
- Memory usage
- Uptime
- Service availability (Stripe, Chapa, SendGrid, etc.)

### 1.2 Metrics (`/api/metrics`)
**Requires Admin Authentication**
```bash
curl -H "Cookie: session=..." https://api.alga.et/api/metrics
```
Returns:
- Booking statistics (total, confirmed, pending, revenue)
- User metrics (total, new, hosts, guests)
- Property counts (total, approved, pending)
- System metrics (memory, uptime)

### 1.3 Security Alerts (`/api/security/alerts`)
**Requires Admin Authentication**
```bash
curl -H "Cookie: session=..." https://api.alga.et/api/security/alerts
```
Returns:
- Memory alerts (>85% usage)
- Integrity event alerts
- Recent restart alerts

---

## 2. Recommended Monitoring Stack

### Option A: Grafana Cloud (Free Tier)
Best for: Comprehensive dashboards and visualization

**Setup:**
1. Create account at https://grafana.com/products/cloud/
2. Add Prometheus data source pointing to `/api/metrics`
3. Import Alga dashboard template

**Key Metrics to Track:**
- `alga_bookings_total` - Total bookings
- `alga_revenue_total` - Revenue in ETB
- `alga_users_active` - Active users
- `alga_memory_percent` - Memory usage
- `alga_api_latency_ms` - API response time

### Option B: BetterStack (Free Tier)
Best for: Uptime monitoring and log aggregation

**Setup:**
1. Create account at https://betterstack.com/
2. Add health check monitor for `/api/health`
3. Configure log shipping from Render

### Option C: Render Dashboard
Best for: Basic infrastructure metrics

**Built-in Metrics:**
- CPU usage
- Memory usage
- Network I/O
- Request count

---

## 3. Alerting Configuration

### Priority Levels

| Level | Response Time | Examples |
|-------|--------------|----------|
| P1 Critical | 15 minutes | App down, payment failure, data breach |
| P2 High | 1 hour | Database issues, high memory, reconciliation failures |
| P3 Medium | 4 hours | Performance degradation, minor errors |
| P4 Low | 24 hours | Non-critical warnings |

### Alert Channels

#### WhatsApp Business API
```javascript
// Example alert notification
async function sendWhatsAppAlert(message, priority) {
  // Use WhatsApp Business API
  // Or integrate with Twilio WhatsApp
}
```

#### Email (SendGrid)
```javascript
// Alga already has SendGrid configured
// Use SENDGRID_API_KEY for alert emails
```

#### Telegram Bot
```javascript
// Simple webhook integration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

async function sendTelegramAlert(message) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID, text: message })
  });
}
```

### Alert Thresholds

| Metric | Warning | Critical |
|--------|---------|----------|
| Memory Usage | 85% | 95% |
| API Latency | 500ms | 2000ms |
| Error Rate | 1% | 5% |
| Database Connections | 70% | 90% |
| Disk Usage | 80% | 95% |

---

## 4. Dashboard Templates

### Executive Dashboard
Display on office screens or for stakeholder meetings:

```
┌─────────────────────────────────────────────────────┐
│  ALGA OPERATIONS DASHBOARD                          │
├─────────────────────────────────────────────────────┤
│  Today's Bookings: 45    │  Revenue: 125,000 ETB   │
│  Active Users: 1,234     │  New Hosts: 12          │
├─────────────────────────────────────────────────────┤
│  System Health: ✅ HEALTHY                          │
│  Memory: 62% │ Database: OK │ Payments: Active     │
├─────────────────────────────────────────────────────┤
│  Alerts: 0 Critical │ 1 Warning                     │
└─────────────────────────────────────────────────────┘
```

### Technical Dashboard
For DevOps and engineering team:

- API response time (p50, p95, p99)
- Error rates by endpoint
- Database query performance
- Memory and CPU trends
- Deployment history

---

## 5. Log Aggregation

### Recommended: BetterStack Logs or Logtail

**Configure in Render:**
1. Go to Service → Logs
2. Add log drain to BetterStack endpoint
3. Configure log parsing rules

**Log Levels:**
- ERROR: Always alert
- WARN: Review daily
- INFO: Retention 7 days
- DEBUG: Retention 1 day (dev only)

### Key Log Patterns to Monitor

```
# Failed authentication attempts
grep "auth_failure" /var/log/alga/*.log

# Payment errors
grep "payment_error\|chapa_error\|stripe_error" /var/log/alga/*.log

# Database errors
grep "database_error\|connection_failed" /var/log/alga/*.log

# Rate limiting
grep "rate_limit" /var/log/alga/*.log
```

---

## 6. On-Call Schedule

### Weekly Rotation

| Week | Primary | Secondary |
|------|---------|-----------|
| 1 | Developer A | Developer B |
| 2 | Developer B | Developer C |
| 3 | Developer C | Developer A |

### Escalation Path

1. **0-15 min**: Primary on-call
2. **15-30 min**: Secondary on-call
3. **30-60 min**: Technical Lead
4. **60+ min**: CEO (for P1 only)

---

## 7. Quick Start Commands

```bash
# Check current health
curl -s https://api.alga.et/api/health | jq

# Run manual reconciliation
npx tsx scripts/payment-reconciliation.ts

# Check for security alerts (requires auth)
# Login first, then check /api/security/alerts

# Run disaster recovery simulation
npx tsx scripts/disaster-recovery-test.ts
```

---

## 8. Integration with GitHub Actions

Alga has automated monitoring via GitHub Actions:

- **Daily Tests**: Runs at 9 AM EAT
- **Weekly Security Scans**: Runs every Sunday
- **Daily Reconciliation**: Runs at midnight EAT

Check workflow status at: `https://github.com/[org]/alga/actions`

---

**Document Control:**
- Created: December 2024
- Review Cycle: Quarterly
- Owner: Alga DevOps Team
