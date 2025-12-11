# Alga DevOps Runbook

## Emergency Contact Chain

| Role | Responsibility | Escalation Time |
|------|---------------|-----------------|
| On-Call Engineer | First responder | Immediate |
| Tech Lead | Technical decisions | 15 minutes |
| CEO | Business decisions, kill-switch | 30 minutes |

## Incident Severity Levels

| Level | Description | Response Time | Example |
|-------|-------------|---------------|---------|
| P1 - Critical | Platform down, payments failing | 15 min | Database unreachable, API 500s |
| P2 - High | Major feature broken | 1 hour | Booking flow broken, auth failing |
| P3 - Medium | Degraded performance | 4 hours | Slow API responses, minor bugs |
| P4 - Low | Cosmetic issues | 24 hours | UI glitches, typos |

---

## Incident Response Procedures

### Step 1: Assess
```bash
# Check system health
curl https://api.alga.et/api/health

# Check logs
# On Render: Dashboard → Logs
# On Replit: npx tsx scripts/api-tests.ts
```

### Step 2: Communicate
- Post in #incidents channel (if using Slack/Discord)
- Notify on-call engineer
- Update status page (if applicable)

### Step 3: Mitigate
- Apply temporary fix if possible
- Consider rollback if recent deployment caused issue

### Step 4: Resolve
- Deploy permanent fix
- Verify with health checks and tests

### Step 5: Post-Mortem
- Document what happened
- Identify root cause
- Create action items to prevent recurrence

---

## Common Runbook Scenarios

### Scenario: API Returning 500 Errors

**Symptoms:** Users see error pages, health check failing

**Steps:**
1. Check Render logs for stack traces
2. Verify database connection: `curl api.alga.et/api/health`
3. Check recent deployments - rollback if needed
4. If DB issue, check Neon dashboard for connection limits

**Rollback:**
```bash
# On Render Dashboard:
# 1. Go to Deployments
# 2. Find last working deployment
# 3. Click "Rollback to this deploy"
```

---

### Scenario: Database Connection Issues

**Symptoms:** API timeouts, "database unreachable" in logs

**Steps:**
1. Check Neon Dashboard for status
2. Verify DATABASE_URL is correct in Render
3. Check connection pool limits (max 100 connections)
4. If Neon is down, activate maintenance mode

**Emergency Maintenance Mode:**
```bash
# Set environment variable on Render:
MAINTENANCE_MODE=true
# This should show maintenance page to users
```

---

### Scenario: Payment Failure Spike

**Symptoms:** Multiple failed payments, customer complaints

**Steps:**
1. Check payment gateway status (Chapa, Stripe, PayPal)
2. Review payment logs for error patterns
3. Verify API keys haven't expired
4. Check if rate limits were hit

**Immediate Actions:**
- Pause new bookings if systematic failure
- Notify affected customers
- Contact payment provider support

---

### Scenario: Security Incident Detected

**Symptoms:** Unusual traffic, audit log alerts, suspicious activity

**Steps:**
1. **FREEZE DEPLOYMENTS** - No code changes
2. Check audit logs for suspicious patterns
3. Review rate limiting logs for attack attempts
4. If breach confirmed, activate CEO kill-switch

**CEO Kill-Switch Activation:**
```bash
# On Render Dashboard:
# 1. Set EMERGENCY_SHUTDOWN=true
# 2. This blocks all API requests except health checks
# 3. Notify legal and INSA if data breach
```

---

### Scenario: High Traffic / Performance Degradation

**Symptoms:** Slow responses, timeouts, high memory usage

**Steps:**
1. Check health endpoint memory stats
2. Review Render metrics for resource usage
3. Scale up if needed (Render Dashboard → Settings)
4. Enable aggressive caching if not already active

---

## Database Backup & Restore

### Daily Backup (Automated)
- Neon provides automatic point-in-time recovery
- Manual backup script: `./scripts/backup-database.sh`

### Restore from Backup
```bash
# 1. Download backup file from storage
# 2. Restore to Neon
psql $DATABASE_URL < backup-YYYY-MM-DD.sql
```

### Point-in-Time Recovery (Neon)
1. Go to Neon Dashboard
2. Select project → Branches
3. Create branch from specific timestamp
4. Update DATABASE_URL to new branch
5. Verify data integrity
6. Merge or promote branch when confirmed

---

## Deployment Procedures

### Standard Deployment
1. Merge PR to `main` branch
2. Render auto-deploys within 5 minutes
3. Monitor health endpoint post-deploy
4. Run `npx tsx scripts/api-tests.ts` to verify

### Emergency Hotfix
1. Create hotfix branch from `main`
2. Make minimal change
3. Test locally
4. Merge directly to `main` (skip staging)
5. Monitor closely for 30 minutes

### Rollback Procedure
1. Go to Render Dashboard → Deployments
2. Find last known good deployment
3. Click "Rollback to this deploy"
4. Verify with health checks
5. Document incident

---

## Maintenance Windows

**Preferred Times:** Tuesday/Wednesday 2:00-4:00 AM EAT (Ethiopian time)

**Pre-Maintenance Checklist:**
- [ ] Notify customers 24 hours in advance
- [ ] Backup database
- [ ] Prepare rollback plan
- [ ] Have on-call engineer available

**Post-Maintenance Checklist:**
- [ ] Run full test suite
- [ ] Verify all integrations
- [ ] Check payment flows
- [ ] Monitor for 2 hours

---

## Key Environment Variables

| Variable | Purpose | Rotate Frequency |
|----------|---------|------------------|
| DATABASE_URL | Neon connection | On compromise |
| SENDGRID_API_KEY | Email service | Annually |
| STRIPE_SECRET_KEY | Payments | On compromise |
| CHAPA_SECRET_KEY | Local payments | On compromise |
| SESSION_SECRET | Auth sessions | Quarterly |

---

## Monitoring Dashboards

### Health Check Endpoint
```
GET /api/health
```
Returns: status, database connection, memory usage, uptime

### Key Metrics to Watch
- API response time (target: <200ms)
- Error rate (target: <1%)
- Database query time (target: <50ms)
- Memory usage (alert at 80%)

---

## Escalation Matrix

| Time Since Incident | Action |
|---------------------|--------|
| 0-15 min | On-call engineer investigating |
| 15-30 min | Tech Lead notified, joins response |
| 30-60 min | CEO briefed, business decisions |
| 60+ min | All hands if P1, customer communication |

---

## Post-Incident Template

```markdown
## Incident Report: [Title]

**Date:** YYYY-MM-DD
**Duration:** X hours Y minutes
**Severity:** P1/P2/P3/P4
**Impact:** [Who was affected and how]

### Timeline
- HH:MM - Incident detected
- HH:MM - On-call alerted
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

### Root Cause
[What caused the incident]

### Resolution
[How it was fixed]

### Action Items
- [ ] Action 1 - Owner - Due date
- [ ] Action 2 - Owner - Due date

### Lessons Learned
[What we learned and how to prevent recurrence]
```

---

## Quick Reference Commands

```bash
# Check API health
curl https://api.alga.et/api/health

# Run automated tests
npx tsx scripts/api-tests.ts

# Database backup
./scripts/backup-database.sh

# Check for security vulnerabilities
npm audit

# View recent deployments
# Render Dashboard → Deployments
```

---

*Last Updated: December 2024*
*Owner: Alga Engineering Team*
