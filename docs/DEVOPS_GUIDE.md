# Alga DevOps Guide

## Overview

This document outlines the DevOps practices implemented for the Alga platform, ensuring stable releases, audit-ready security, and high uptime.

## Branching Strategy

```
main (production)
  ↑
staging (testing + INSA fixes)
  ↑
dev (daily development)
```

### Workflow
1. Develop on `dev` branch
2. Merge to `staging` for testing
3. After approval, merge to `main` for production deployment

## CI/CD Pipeline

### Replit → GitHub → Render

1. **Development** (Replit)
   - Code changes made in Replit
   - Run local tests: `npx tsx scripts/api-tests.ts`
   - Commit and push to GitHub

2. **Staging** (Render)
   - Automatic deployment when `staging` branch is updated
   - Run integration tests
   - INSA security testing

3. **Production** (Render)
   - Manual approval required
   - Merge `staging` to `main`
   - Render auto-deploys from `main`

## Environment Variables

### Required Secrets (Never commit to code!)

```
# Database
DATABASE_URL=postgresql://...

# Authentication
SESSION_SECRET=<generated>

# Payment Gateways
CHAPA_SECRET_KEY=<from Chapa dashboard>
STRIPE_SECRET_KEY=<from Stripe dashboard>
TELEBIRR_APP_ID=<from Telebirr>
TELEBIRR_APP_KEY=<from Telebirr>
TELEBIRR_PUBLIC_KEY=<from Telebirr>
TELEBIRR_SHORT_CODE=<from Telebirr>

# Communication
SENDGRID_API_KEY=<from SendGrid>
SENDGRID_FROM_EMAIL=<verified sender>

# Maps (Frontend)
VITE_GOOGLE_MAPS_API_KEY=<from Google Cloud>
```

### Where to Set Secrets

- **Replit**: Tools → Secrets
- **Render**: Environment → Secret Files / Environment Variables

## Automated Testing

### Run Tests Locally
```bash
npx tsx scripts/api-tests.ts
```

### Test Categories
1. **Security Tests**
   - Health check
   - Security headers
   - Rate limiting

2. **Authentication Tests**
   - Unauthorized access
   - Password hash exposure

3. **IDOR Protection Tests**
   - Booking access control
   - Property approval control

4. **Data Validation Tests**
   - SQL injection prevention
   - XSS prevention
   - Input validation

## Database Backups

### Manual Backup
```bash
./scripts/backup-database.sh
```

### Automated (Production)
- Render PostgreSQL includes automatic daily backups
- Backups retained for 7 days

### Restore from Backup
```bash
gunzip backups/alga_db_YYYYMMDD_HHMMSS.sql.gz
psql $DATABASE_URL < backups/alga_db_YYYYMMDD_HHMMSS.sql
```

## Monitoring & Logging

### Health Check Endpoint
```
GET /api/health
```

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-09T...",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 12345
}
```

### Logging Levels
- **INFO**: API requests, successful operations
- **WARN**: Rate limiting, validation failures
- **ERROR**: Server errors, failed operations
- **SECURITY**: Authentication, authorization events

### Audit Logs (INSA Compliant)
- SHA-256 hashed chain of events
- Tamper-evident logging
- Financial transaction trails

## Security Hardening

### Implemented Protections
- ✅ Rate limiting (100 requests/15min)
- ✅ JWT expiration (24 hours)
- ✅ Password hashing (bcrypt)
- ✅ Role-based access control
- ✅ HTTPS enforcement
- ✅ Security headers (Helmet.js)
- ✅ Input sanitization
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection

## Deployment Checklist

### Before Deploying
- [ ] All tests pass locally
- [ ] No secrets in code
- [ ] Database migrations ready
- [ ] Environment variables set in Render
- [ ] Backup created

### Deploying to Staging
```bash
git checkout staging
git merge dev
git push origin staging
```

### Deploying to Production
```bash
git checkout main
git merge staging
git push origin main
```

### Rollback (if needed)
1. Go to Render dashboard
2. Select previous deployment
3. Click "Rollback"

## DevOps Culture

### Daily Practices
- Review logs for errors
- Monitor health endpoints
- Address security alerts

### Weekly Practices
- Review backup status
- Check resource usage
- Update dependencies

### Monthly Practices
- Security audit
- Performance review
- Capacity planning

## Support

For deployment issues:
- Check Render logs
- Review health endpoint
- Contact DevOps lead
