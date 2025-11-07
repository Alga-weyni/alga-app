# INSA Test Account Activation Guide
## Step-by-Step Deployment to Render Platform

**Date:** November 7, 2025  
**Purpose:** Deploy Alga staging environment for INSA security audit  
**Target URL:** https://alga-staging.onrender.com

---

## Prerequisites Checklist

Before starting, ensure you have:
- ✅ GitHub account with Alga repository
- ✅ Render account (sign up at https://render.com)
- ✅ Neon Database URL (already configured)
- ✅ Google Cloud Storage credentials (object storage)
- ✅ SendGrid API key (email)
- ✅ Ethiopian Telecom SMS credentials
- ✅ Payment processor credentials (Chapa, Stripe, PayPal - sandbox mode)

---

## STEP 1: Create Render Account & Connect GitHub

### 1.1 Sign Up for Render
```
1. Go to https://render.com
2. Click "Get Started" or "Sign Up"
3. Choose "Sign up with GitHub" (recommended)
4. Authorize Render to access your GitHub account
5. Complete email verification
```

### 1.2 Connect Alga Repository
```
1. On Render Dashboard, click "New +"
2. Select "Web Service"
3. Click "Connect a repository"
4. Find and select your Alga repository
5. Click "Connect"
```

---

## STEP 2: Configure Render Web Service

### 2.1 Basic Settings
```
Name: alga-staging
Region: Oregon (US West) or closest to Ethiopia
Branch: main (or your default branch)
Root Directory: . (leave blank if using root)
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### 2.2 Environment Variables (CRITICAL)

Click **"Environment"** tab and add these variables:

#### Database
```
DATABASE_URL = [Your Neon PostgreSQL URL]
```

#### Application
```
NODE_ENV = production
PORT = 5000
SESSION_SECRET = [Generate 64-char random string]
```

#### Payment Processors (Sandbox/Test Mode)
```
CHAPA_SECRET_KEY = [Your Chapa test key]
STRIPE_SECRET_KEY = [Your Stripe test key]
STRIPE_PUBLISHABLE_KEY = [Your Stripe test publishable key]
PAYPAL_CLIENT_ID = [Your PayPal sandbox client ID]
PAYPAL_CLIENT_SECRET = [Your PayPal sandbox secret]
TELEBIRR_APP_ID = [TeleBirr sandbox app ID]
TELEBIRR_APP_KEY = [TeleBirr sandbox key]
```

#### Communication Services
```
SENDGRID_API_KEY = [Your SendGrid API key]
SENDGRID_FROM_EMAIL = noreply@alga.et
ETH_TELECOM_API_KEY = [Ethiopian Telecom SMS API key]
ETH_TELECOM_SENDER_ID = ALGA
```

#### Google Cloud Storage
```
GCS_PROJECT_ID = [Your Google Cloud project ID]
GCS_BUCKET_NAME = alga-storage
GCS_CREDENTIALS = [Your GCS service account JSON - base64 encoded]
```

#### Google Maps
```
VITE_GOOGLE_MAPS_API_KEY = [Your Google Maps API key]
```

#### Security (Generate Random Values)
```
OTP_SECRET = [64-char random string]
ENCRYPTION_KEY = [32-byte random key - hex format]
```

**How to generate random secrets:**
```bash
# On Mac/Linux terminal:
openssl rand -hex 32

# Or use this Node.js command:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2.3 Auto-Deploy Settings
```
✅ Enable "Auto-Deploy" (deploys on every git push)
Instance Type: Starter ($7/month) or Free (if available)
Health Check Path: /api/health
```

---

## STEP 3: Deploy Application

### 3.1 Trigger First Deployment
```
1. Click "Create Web Service" (bottom of page)
2. Render will start building your application
3. Wait 5-10 minutes for initial build
4. Watch build logs for any errors
```

### 3.2 Monitor Deployment
```
Build Logs Location: Dashboard → alga-staging → Logs → Build
Runtime Logs Location: Dashboard → alga-staging → Logs → Deploy

Look for:
✅ "Build succeeded"
✅ "Deploy succeeded"
✅ "Your service is live"
```

### 3.3 Verify Deployment
```
1. Copy your service URL: https://alga-staging.onrender.com
2. Open in browser
3. You should see Alga homepage
4. Check health endpoint: https://alga-staging.onrender.com/api/health
   Expected response: {"status": "ok", "database": "connected"}
```

---

## STEP 4: Seed INSA Test Data

### 4.1 Access Render Shell
```
1. Go to Render Dashboard → alga-staging
2. Click "Shell" tab (top navigation)
3. A terminal will open connected to your server
```

### 4.2 Run Seeding Script
```bash
# In Render Shell, run:
npm run seed:insa

# Expected output:
# ✅ Seeding INSA test data...
# ✅ Creating 6 test users...
# ✅ Creating 10 test properties...
# ✅ Creating 50 test bookings...
# ✅ Creating 1 verified agent...
# ✅ Creating 1 approved service provider...
# ✅ INSA test data seeded successfully!
```

**Alternative: Via Local Database**
```bash
# If Render Shell doesn't work, run locally:
DATABASE_URL="your-neon-url" npm run seed:insa
```

### 4.3 Verify Test Data
```bash
# In Render Shell or locally:
npm run db:studio

# This opens Drizzle Studio to view database
# Check tables: users, properties, bookings, agents, services
```

---

## STEP 5: Test INSA Accounts

### 5.1 Test Account Credentials
All accounts use password: **INSA_Test_2025!**

| Role | Email | Test What |
|------|-------|-----------|
| Guest | insa-guest@test.alga.et | Property search, booking |
| Host | insa-host@test.alga.et | Property management, earnings |
| Admin | insa-admin@test.alga.et | User management, platform config |
| Operator | insa-operator@test.alga.et | ID verification, approvals |
| Agent | insa-agent@test.alga.et | Commission tracking, payouts |
| Service Provider | insa-service@test.alga.et | Service listings, bookings |

### 5.2 Verification Checklist

**Test Guest Account:**
```
1. Go to https://alga-staging.onrender.com/auth/login
2. Email: insa-guest@test.alga.et
3. Password: INSA_Test_2025!
4. ✅ Login successful?
5. ✅ Can browse properties?
6. ✅ Can search by city?
7. ✅ Can view property details?
```

**Test Host Account:**
```
1. Login as: insa-host@test.alga.et
2. Go to /host/dashboard
3. ✅ See 2 active properties?
4. ✅ View booking history?
5. ✅ See earnings summary?
```

**Test Admin Account:**
```
1. Login as: insa-admin@test.alga.et
2. Go to /admin/users
3. ✅ See all 6 test users?
4. ✅ Can view user details?
5. ✅ See platform statistics?
```

**Test Operator Account:**
```
1. Login as: insa-operator@test.alga.et
2. Go to /operator/verification
3. ✅ See pending verifications?
4. ✅ Can approve/reject IDs?
```

**Test Agent Account:**
```
1. Login as: insa-agent@test.alga.et
2. Go to /agent-dashboard
3. ✅ See commission earnings?
4. ✅ View linked properties?
5. ✅ See 36-month countdown?
```

**Test API Endpoints:**
```bash
# Test health check
curl https://alga-staging.onrender.com/api/health

# Test properties endpoint
curl https://alga-staging.onrender.com/api/properties

# Test authentication (should require login)
curl https://alga-staging.onrender.com/api/bookings
```

---

## STEP 6: Grant INSA Read-Only Access

### 6.1 Add INSA Auditor to Render Team
```
1. Go to Render Dashboard
2. Click your profile (top right) → "Account Settings"
3. Click "Members" tab
4. Click "Invite Team Member"
5. Enter INSA auditor email: tilahune@insa.gov.et
6. Select Role: "Viewer" (read-only)
7. Optional: Add message: "INSA Security Audit - Read-only access for Alga staging"
8. Click "Send Invitation"
```

### 6.2 What INSA Can Access
**✅ Viewer Role Permissions:**
- View deployment logs (build + runtime)
- View environment variable names (NOT values)
- View service metrics (CPU, memory, requests)
- View build history and timestamps
- Export audit logs (CSV format)
- View connected services (database, storage)

**❌ Viewer Role Restrictions:**
- Cannot deploy or redeploy
- Cannot modify environment variables
- Cannot view secret values
- Cannot delete or suspend services
- Cannot access SSH/Shell
- Cannot change settings

### 6.3 Additional Auditors (if needed)
```
Repeat Step 6.1 for additional INSA team members
Common INSA audit team roles:
- Lead Auditor
- Technical Reviewer
- Security Analyst
```

---

## STEP 7: Prepare INSA Submission Package

### 7.1 Export Platform Information
```
1. Go to Render Dashboard → alga-staging
2. Click "Settings" tab
3. Copy these details for INSA:
   - Service URL: https://alga-staging.onrender.com
   - Service ID: srv-xxxxx
   - Region: Oregon (US West)
   - Instance Type: Starter
   - Created Date: [Date]
```

### 7.2 Export Audit Logs
```
1. Click "Logs" tab
2. Select date range: Last 30 days
3. Click "Export" → CSV
4. Save as: alga-staging-audit-logs.csv
5. Include in INSA submission
```

### 7.3 Export Compliance Certificates
```
Download and include:
✅ Render SOC 2 Type II Certificate
   → Go to https://render.com/trust → Download SOC 2 report

✅ Neon Database ISO 27001 Certificate
   → Go to https://neon.tech/security → Download compliance docs

✅ Stripe PCI DSS Level 1 Certificate
   → Go to https://stripe.com/docs/security/stripe → Download attestation

✅ Chapa Security Documentation
   → Contact Chapa support for compliance certificates
```

---

## STEP 8: Final Verification Before INSA Submission

### 8.1 Complete Testing Checklist
```
✅ Web application loads at staging URL
✅ All 6 test accounts can login
✅ API health check returns 200 OK
✅ Properties display correctly
✅ Booking flow works end-to-end
✅ Payment sandbox works (test transactions)
✅ Email notifications send (check SendGrid logs)
✅ SMS OTP sends (check Ethiopian Telecom logs)
✅ Admin dashboard accessible
✅ Operator verification works
✅ Agent commission tracking visible
✅ INSA auditor has Viewer access to Render
✅ No console errors in browser
✅ HTTPS/TLS certificate valid
✅ All API endpoints return proper responses
```

### 8.2 Performance Verification
```
✅ Page load time < 3 seconds
✅ API response time < 500ms
✅ Database queries optimized
✅ Images compressed and loading
✅ Mobile responsive (test on phone)
```

### 8.3 Security Verification
```
✅ HTTPS enforced (HTTP redirects to HTTPS)
✅ Security headers present (check with securityheaders.com)
✅ Rate limiting active (try 20 rapid requests)
✅ XSS protection working
✅ SQL injection blocked (Drizzle ORM only)
✅ CORS configured correctly
✅ Session cookies have httpOnly + secure flags
✅ Sensitive data not exposed in logs
```

---

## STEP 9: Share with INSA

### 9.1 Email to INSA
```
To: tilahune@insa.gov.et
CC: [Other INSA auditors]
Subject: Alga Staging Environment - Ready for Security Audit

Dear Dr. Tilahun Ejigu,

The Alga staging environment is now deployed and ready for your security audit.

STAGING ENVIRONMENT ACCESS:
- Web Application: https://alga-staging.onrender.com
- API Base: https://alga-staging.onrender.com/api
- Health Check: https://alga-staging.onrender.com/api/health

TEST ACCOUNTS (All use password: INSA_Test_2025!):
1. Guest: insa-guest@test.alga.et
2. Host: insa-host@test.alga.et
3. Admin: insa-admin@test.alga.et
4. Operator: insa-operator@test.alga.et
5. Agent: insa-agent@test.alga.et
6. Service Provider: insa-service@test.alga.et

RENDER PLATFORM ACCESS:
You have been invited as a Viewer (read-only) to our Render account.
Please check your email (tilahune@insa.gov.et) for the invitation.

DOCUMENTATION:
All security documentation is attached:
- INSA_WEB_APP_SUBMISSION.md (formal submission)
- INSA_MOBILE_APP_SUBMISSION.md (mobile apps)
- All architecture diagrams (7 files)
- All security documents (9 files)

TEST DATA:
- 10 properties across Ethiopian cities
- 50 sample bookings
- 1 verified Delala agent
- 1 approved service provider

Please let us know if you need any additional information or access.

Best regards,
Weyni Abraha
Founder & CEO
Alga One Member PLC
TIN: 0101809194
Phone: +251 996 034 044
Email: Winnieaman94@gmail.com
```

---

## TROUBLESHOOTING

### Issue: Deployment Failed
```
Solution:
1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Check DATABASE_URL is correct
4. Try manual deploy: Click "Manual Deploy" → "Deploy latest commit"
```

### Issue: Test Accounts Don't Work
```
Solution:
1. Verify seeding script ran successfully
2. Check database has test users: npm run db:studio
3. Re-run seeding: npm run seed:insa
4. Check logs for authentication errors
```

### Issue: Health Check Returns 500
```
Solution:
1. Check database connection (DATABASE_URL correct?)
2. Check Neon database is running
3. View error logs in Render → Logs → Deploy
4. Restart service: Render Dashboard → Manual Deploy
```

### Issue: INSA Can't Access Render
```
Solution:
1. Verify invitation was sent (check Render → Account → Members)
2. Check email wasn't filtered to spam
3. Resend invitation
4. Contact Render support if needed
```

### Issue: Payment Sandbox Not Working
```
Solution:
1. Verify using SANDBOX/TEST keys (not production)
2. Check Chapa/Stripe dashboard for test mode
3. Use test card numbers (Stripe: 4242 4242 4242 4242)
4. Check webhook URLs are configured
```

---

## POST-DEPLOYMENT MAINTENANCE

### Daily Checks (During Audit Period)
```
✅ Check uptime: https://alga-staging.onrender.com/api/health
✅ Review error logs in Render dashboard
✅ Monitor database usage in Neon dashboard
✅ Check email delivery in SendGrid dashboard
```

### Weekly Tasks
```
✅ Review INSA feedback and implement fixes
✅ Update test data if needed
✅ Check security headers still configured
✅ Verify SSL certificate is valid
```

### If INSA Finds Issues
```
1. Document the finding
2. Fix the issue in code
3. Push to GitHub (triggers auto-deploy)
4. Wait for Render to deploy (5-10 minutes)
5. Verify fix works
6. Notify INSA: "Issue fixed and deployed"
```

---

## COST ESTIMATE

**Render Starter Plan:** $7/month
**Neon Database:** Free tier (sufficient for testing)
**Google Cloud Storage:** ~$1-2/month (test data)
**SendGrid:** Free tier (100 emails/day)
**Total:** ~$10/month for staging environment

---

## SECURITY BEST PRACTICES

✅ Use SANDBOX mode for all payment processors
✅ Never commit secrets to GitHub
✅ Rotate SESSION_SECRET monthly
✅ Monitor logs for suspicious activity
✅ Keep dependencies updated (npm audit)
✅ Enable 2FA on Render account
✅ Limit team access (principle of least privilege)
✅ Backup database weekly
✅ Document all changes in INSA audit period

---

## SUPPORT CONTACTS

**Render Support:** support@render.com  
**Neon Database:** support@neon.tech  
**SendGrid:** support@sendgrid.com  
**INSA Contact:** Dr. Tilahun Ejigu - tilahune@insa.gov.et, +251 937 456 374

---

**Document Version:** 1.0  
**Last Updated:** November 7, 2025  
**Prepared by:** Weyni Abraha, Alga One Member PLC
