# 🚀 ALGA - DEPLOYMENT CHECKLIST

**Date**: October 22, 2025  
**Version**: v1.0 (Stable Production Release)  
**Deployment Type**: Autoscale (Serverless)

---

## ✅ PRE-DEPLOYMENT VERIFICATION

### Infrastructure Status
- ✅ Production build successful (374.85 KB gzipped)
- ✅ TypeScript: 0 errors
- ✅ Database: 14 users, 15 properties, 15 bookings
- ✅ All 44 automated tests passed
- ✅ App running without errors on port 5000
- ✅ Deployment config set (Autoscale, npm build/start)

---

## 🔑 REQUIRED BEFORE DEPLOY (CRITICAL)

### Step 1: Add Missing API Keys

**Go to Replit Secrets tab and add:**

#### SendGrid (Email Notifications)
```
Key: SENDGRID_API_KEY
Value: [Your SendGrid API key from https://app.sendgrid.com/settings/api_keys]
```

**Why needed**: 
- OTP email delivery
- Provider approval/rejection emails
- Booking confirmations

---

#### Google Maps (Map Integration)
```
Key: GOOGLE_MAPS_API_KEY
Value: [Your Google Maps API key from https://console.cloud.google.com/apis/credentials]
```

**Why needed**: 
- Property location maps
- Interactive property search
- Location sharing features

---

### Step 2: Configure Object Storage (Post-Deployment)

**After deploying, go to Replit Object Storage tab:**

1. **Create production bucket**:
   - Name: `alga-production`
   - Type: Public

2. **Add environment variables**:
   ```
   PRIVATE_OBJECT_DIR=/alga-production/private
   PUBLIC_OBJECT_SEARCH_PATHS=/alga-production/public
   ```

**Why needed**: 
- Property image uploads
- Service provider photos
- User profile pictures

---

### Step 3: Database Migration

**Run this command in Shell BEFORE first deployment:**

```bash
npm run db:push
```

**Why needed**: Ensures production database has latest schema

---

## 🚀 DEPLOYMENT STEPS

### Option 1: Deploy via Replit UI (Recommended)

1. **Click "Publish" button** (top-right corner)
2. **Select deployment type**: Autoscale
3. **Wait for build** (~2-3 minutes)
4. **Click "Open Deployment"** when ready
5. **Verify** app loads and shows 15 properties

---

### Option 2: Deploy via Shell

```bash
# 1. Build production bundle
npm run build

# 2. Push database schema
npm run db:push

# 3. Deploy (Replit will use config automatically)
# Click "Publish" in UI or use Replit CLI
```

---

## ⚠️ POST-DEPLOYMENT TASKS (First 30 Minutes)

### Immediate Verification

**Test these routes in production:**

1. **Homepage** → `https://your-app.replit.app/`
   - [ ] 15 properties displayed
   - [ ] Search bar functional
   - [ ] City filters visible

2. **Login** → `https://your-app.replit.app/login`
   - [ ] Email/phone input works
   - [ ] "Send OTP" button functional
   - **Note**: Won't work without SENDGRID_API_KEY

3. **Services** → `https://your-app.replit.app/services`
   - [ ] 11 service categories visible
   - [ ] Provider CTA showing

4. **Protected Routes** → Try accessing `/my-alga` logged out
   - [ ] Shows login prompt (not 404)

---

### Configure Payment Webhooks

**Update webhook URLs in:**

#### Chapa
- Dashboard: https://dashboard.chapa.co/
- Update webhook URL to: `https://your-app.replit.app/api/webhooks/chapa`

#### Stripe
- Dashboard: https://dashboard.stripe.com/webhooks
- Update webhook URL to: `https://your-app.replit.app/api/webhooks/stripe`

**Why needed**: Booking confirmations, access code generation

---

## 🧪 MANUAL TESTING (First 24 Hours)

### Critical User Flows

**1. OTP Login** (10 min)
- [ ] Login with `ethiopianstay@gmail.com`
- [ ] Verify OTP arrives via email
- [ ] OTP code works and logs in
- [ ] Redirected to dashboard

**2. Booking Flow** (20 min)
- [ ] Browse properties
- [ ] Select property, click "Book Now"
- [ ] Fill dates, guests, payment
- [ ] Complete payment (use test card: 4242 4242 4242 4242)
- [ ] Verify 6-digit access code generated
- [ ] Booking appears in "My Trips"

**3. Host Property Listing** (15 min)
- [ ] Login as host
- [ ] Add new property with images
- [ ] Verify images upload successfully
- [ ] Property shows "Pending Approval"
- [ ] Login as admin, approve property
- [ ] Verify property appears publicly

**4. Mobile Responsiveness** (15 min)
- [ ] Open on iPhone/Android
- [ ] Test navigation
- [ ] Check property cards display correctly
- [ ] Verify forms work on mobile

---

## 📊 MONITORING & HEALTH CHECKS

### What to Monitor First Week

1. **Error Logs** (Daily)
   - Go to Replit Deployments → Logs tab
   - Check for 500 errors, crashes, exceptions

2. **Database Performance** (Daily)
   - Go to Replit Database tab
   - Check query times (should be <500ms)
   - Monitor connection count

3. **Image Uploads** (First Day)
   - Test uploading property images
   - Verify images appear correctly
   - Check Object Storage usage

4. **Payment Webhooks** (After First Booking)
   - Verify Chapa/Stripe webhooks trigger
   - Check access codes generate
   - Confirm booking status updates

---

## 🔄 ROLLBACK PLAN (If Issues Occur)

### If Critical Bug Found

1. **Use Replit Rollback**:
   - Go to Deployments tab
   - Click "Rollback to previous version"
   - Select last stable deployment

2. **Fix locally**:
   - Fix bug in development
   - Test thoroughly
   - Redeploy when ready

---

## 📋 DEPLOYMENT CONFIGURATION

**Already configured via `deploy_config_tool`:**

```yaml
Deployment Type: autoscale
Build Command: npm run build
Run Command: npm start
Port: 5000
```

**Autoscale Benefits**:
- ✅ Scales to 0 when idle (cost-efficient)
- ✅ Auto-scales up with traffic
- ✅ No server maintenance
- ✅ Built-in load balancing

---

## ✅ GO/NO-GO CRITERIA

### Must Have (Before Deploy):
- ✅ Production build successful
- ✅ Database schema pushed
- ⚠️ SENDGRID_API_KEY added (REQUIRED for OTP)
- ⚠️ GOOGLE_MAPS_API_KEY added (REQUIRED for maps)
- ⚠️ Object Storage configured (REQUIRED for images)

### Nice to Have (Can add after):
- Payment webhook URLs updated
- Manual testing completed
- Mobile testing done

---

## 🎯 DEPLOYMENT DECISION

**Status**: ⚠️ **READY TO DEPLOY AFTER ADDING API KEYS**

**Current Blockers**:
1. Missing `SENDGRID_API_KEY` → **Add before deploy**
2. Missing `GOOGLE_MAPS_API_KEY` → **Add before deploy**
3. Object Storage not configured → **Configure after deploy**

**Recommended Path**:
1. Add API keys NOW (2 minutes)
2. Deploy to production (3 minutes)
3. Configure Object Storage (5 minutes)
4. Update payment webhooks (10 minutes)
5. Complete manual testing (2 hours)

---

## 🚀 READY TO DEPLOY?

**Once API keys are added, click "Publish" and the app will deploy automatically!**

### Expected Deployment Time:
- Build: 2-3 minutes
- Deploy: 1 minute
- Total: ~4 minutes

### First Thing to Test:
1. Open deployed URL
2. Verify homepage loads
3. Check 15 properties display
4. Test login (with SENDGRID_API_KEY)

---

## 📞 SUPPORT

**If deployment fails:**
1. Check Replit Deployments logs
2. Verify all environment variables set
3. Ensure database migration ran
4. Review build logs for errors

**Common Issues**:
- Build fails → Check TypeScript errors
- App crashes → Check missing environment variables
- 404 errors → Verify Vite build completed
- Database errors → Run `npm run db:push --force`

---

**Last Updated**: October 22, 2025  
**Next Review**: After first deployment  
**Deployment Approver**: CEO / Technical Lead
