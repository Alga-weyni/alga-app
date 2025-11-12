# 🚀 Alga - Complete Deployment Guide

## 📋 **Pre-Deployment Checklist**

### **✅ What's Ready**

- ✅ **Backend API**: Express.js with PostgreSQL (Neon)
- ✅ **Frontend**: React + Vite, optimized and built
- ✅ **Database**: Neon PostgreSQL configured
- ✅ **Authentication**: Phone OTP + Fayda ID verification
- ✅ **Security**: INSA compliance (75% complete), E-Signature ready
- ✅ **Payment**: Chapa, Telebirr, Stripe, PayPal integrated
- ✅ **Mobile**: PWA + Capacitor (Android/iOS)
- ✅ **Hardware**: TTLock lockbox + camera integration
- ✅ **Deployment Config**: Autoscale configured

---

## 🌐 **Web Deployment (Replit)**

### **Option 1: One-Click Publish** (Recommended)

1. **Click "Publish" button** in Replit
2. **Select deployment type**: Autoscale (already configured)
3. **Set environment variables** (see below)
4. **Deploy!**

**What happens:**
- Runs `npm run build` (compiles React + backend)
- Starts `node dist/index.js` (production server)
- Auto-scales based on traffic
- Gets custom Replit URL

---

### **Option 2: Manual Deploy Command**

```bash
# Build production assets
npm run build

# Run production server
node dist/index.js
```

**Production URL**: Your Replit deployment URL will be assigned

---

## 🔐 **Environment Variables (Production)**

### **Required Secrets:**

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:pass@host/db

# Session Security
SESSION_SECRET=your-super-secret-key-here

# Payment Processors
CHAPA_SECRET_KEY=CHASECK_TEST-xxx
TELEBIRR_APP_ID=your-telebirr-app-id
TELEBIRR_APP_KEY=your-telebirr-app-key
STRIPE_SECRET_KEY=sk_test_xxx
PAYPAL_CLIENT_ID=xxx
PAYPAL_CLIENT_SECRET=xxx

# Communication
SENDGRID_API_KEY=SG.xxx
ETHIOPIAN_TELECOM_SMS_KEY=your-sms-key

# Hardware Integration
TTLOCK_CLIENT_ID=your-ttlock-client-id
TTLOCK_CLIENT_SECRET=your-ttlock-secret
TTLOCK_API_URL=https://api.ttlock.com

# Google Maps
VITE_GOOGLE_MAPS_API_KEY=AIzaSyxxx

# Storage (Replit Object Storage)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name

# Company Info
COMPANY_NAME=Alga One Member PLC
COMPANY_TIN=0101809194
COMPANY_ADDRESS=Addis Ababa, Ethiopia
COMPANY_PHONE=+251911000000
COMPANY_EMAIL=info@alga.et
```

### **How to Add Secrets:**

1. Go to **Secrets** tab in Replit
2. Click **+ New Secret**
3. Add each variable from above
4. Restart deployment

---

## 📱 **Mobile App Deployment**

### **Android APK Build**

```bash
# 1. Build web assets
npm run build

# 2. Sync to Capacitor
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleDebug  # Debug build
./gradlew assembleRelease  # Production build
cd ..

# APK Location:
# android/app/build/outputs/apk/debug/app-debug.apk
# android/app/build/outputs/apk/release/app-release.apk
```

**Upload to Google Play:**
1. Sign APK with your keystore
2. Create Google Play Console account
3. Upload AAB (Android App Bundle)
4. Submit for review

---

### **iOS App Build** (macOS required)

```bash
# 1. Build web assets
npm run build

# 2. Sync to Capacitor
npx cap sync ios

# 3. Open in Xcode
npx cap open ios

# In Xcode:
# - Set Team & Signing
# - Build for Archive
# - Upload to App Store Connect
```

**Upload to App Store:**
1. App Store Connect account
2. Create app listing
3. Upload via Xcode
4. Submit for review

---

## 🏗️ **Architecture Overview**

### **Production Stack:**

```
┌─────────────────────────────────────────┐
│         USERS (Web + Mobile)            │
└─────────────┬───────────────────────────┘
              │
    ┌─────────▼──────────┐
    │   Frontend (React)  │
    │   Port: 5000        │
    └─────────┬───────────┘
              │
    ┌─────────▼──────────┐
    │  Backend (Express)  │
    │   Node.js + TypeScript  │
    └─────────┬───────────┘
              │
    ┌─────────▼──────────┐
    │  PostgreSQL (Neon)  │
    │  Drizzle ORM        │
    └─────────────────────┘

External Services:
├─ Chapa (Payments)
├─ Telebirr (Mobile Money)
├─ TTLock (Smart Lockbox)
├─ SendGrid (Email)
├─ Ethiopian Telecom (SMS)
└─ Google Cloud Storage (Images)
```

---

## 🧪 **Testing Before Deployment**

### **1. Local Testing**

```bash
# Start dev server
npm run dev

# Run automated tests
npx tsx scripts/test-agent-journey.ts

# Manual testing
# - Browse properties: /properties
# - Book a stay
# - Become agent: /dellala/dashboard
# - Operator dashboard: /operator-dashboard
```

### **2. Production Testing**

After deployment, test:
- ✅ Property browsing
- ✅ User registration (phone OTP)
- ✅ Booking and payment
- ✅ Lockbox code generation
- ✅ Agent commission tracking
- ✅ INSA compliance page (offline mode)

---

## 📊 **Monitoring & Analytics**

### **What to Monitor:**

1. **Server Health**
   - Response times
   - Error rates
   - Memory usage

2. **Database**
   - Query performance
   - Connection pool
   - Storage usage

3. **Business Metrics**
   - Bookings per day
   - Agent signups
   - Commission payouts
   - Property listings

4. **Security**
   - Failed login attempts
   - INSA compliance score
   - E-signature audit logs

---

## 🔄 **CI/CD & Updates**

### **Replit Auto-Deploy:**

Every commit to main branch:
1. Runs `npm run build`
2. Restarts server
3. Zero downtime

### **Manual Deploy:**

```bash
git add .
git commit -m "Update: description"
git push origin main
```

Replit auto-deploys on push!

---

## 🚨 **Rollback & Recovery**

### **If deployment fails:**

1. **Use Replit Rollback**
   - Click "History" tab
   - Select previous version
   - Click "Restore"

2. **Database Rollback**
   - Neon provides automatic backups
   - Use Neon dashboard to restore

3. **Emergency Hotfix**
   ```bash
   # Revert last commit
   git revert HEAD
   git push origin main
   ```

---

## 💰 **Cost Estimation**

### **Monthly Operating Costs:**

| Service | Cost | Notes |
|---------|------|-------|
| Replit Hosting | ~$20-40/mo | Autoscale pricing |
| Neon Database | $0-19/mo | Free tier → Pro |
| Google Cloud Storage | ~$5/mo | 100GB images |
| SendGrid Email | $0 | Free tier (100/day) |
| **TOTAL** | **$25-64/mo** | Scales with usage |

**Revenue Projection:**
- 100 bookings/month @ 2.5% commission
- Average booking: 5,000 ETB
- Monthly revenue: ~12,500 ETB (~$220 USD)
- **ROI: Positive from Month 1**

---

## 📱 **PWA Installation**

### **For Users (No App Store):**

**Android:**
1. Visit website in Chrome
2. Tap "Add to Home Screen"
3. App installs instantly
4. Works offline!

**iOS:**
1. Visit website in Safari
2. Tap Share → "Add to Home Screen"
3. App icon appears
4. Offline capable

**Benefits:**
- No Google Play/App Store approval
- Instant updates
- 100% FREE distribution
- Offline-first architecture

---

## 🎯 **Launch Checklist**

### **Pre-Launch:**

- [ ] Test all 9 user journeys
- [ ] Configure production secrets
- [ ] Set up payment processors (production keys)
- [ ] Configure TTLock hardware API
- [ ] Set up Ethiopian Telecom SMS
- [ ] Configure SendGrid email
- [ ] Test lockbox code generation
- [ ] Verify INSA compliance (75%+)
- [ ] E-signature system tested
- [ ] Database backup configured

### **Launch Day:**

- [ ] Deploy to production
- [ ] Test live booking flow
- [ ] Monitor error logs
- [ ] Activate payment processors
- [ ] Send test lockbox code
- [ ] Verify agent commissions
- [ ] Test offline mode (PWA)

### **Post-Launch:**

- [ ] Monitor daily bookings
- [ ] Track agent signups
- [ ] Review payment success rate
- [ ] Check lockbox unlock rates
- [ ] Respond to user feedback
- [ ] Scale infrastructure as needed

---

## 🏆 **Success Metrics**

### **Month 1 Goals:**

- 50+ properties listed
- 100+ bookings
- 20+ active agents
- 95%+ payment success
- 99%+ lockbox unlock success
- 4.5+ star average rating

### **Quarter 1 Goals:**

- 500+ properties
- 1,000+ bookings
- 100+ agents
- Launch in 3+ cities
- iOS/Android apps published
- Break-even revenue

---

## 📞 **Support & Documentation**

- **Testing Guide**: `docs/COMPLETE_USER_JOURNEY_SIMULATION.md`
- **Quick Start**: `docs/QUICK_START_TESTING.md`
- **Agent Guide**: `docs/AGENT_SIMULATION_GUIDE.md`
- **E-Signature**: `docs/ADMIN_SIGNATURE_DASHBOARD_GUIDE.md`
- **Deployment**: This file

---

## 🌟 **Next Steps**

1. **Review all environment variables**
2. **Test with production payment keys**
3. **Configure TTLock hardware**
4. **Click "Publish" in Replit**
5. **Share URL with beta users**
6. **Monitor and iterate**

---

**🎉 Ready to launch Alga and transform Ethiopian hospitality!**

---

**Company**: Alga One Member PLC  
**TIN**: 0101809194  
**Status**: INSA Compliant (75%), E-Signature Ready  
**Architecture**: 100% FREE browser-native solutions  
**Vision**: Leading platform for Ethiopian property rentals
