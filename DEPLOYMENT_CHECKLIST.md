# ✅ ALGA DEPLOYMENT CHECKLIST

**Date**: October 22, 2025  
**Project**: Alga - Ethiopian Property Rental Platform  
**Migration**: Replit → Free Production (Render + Vercel + Neon)

---

## PRE-DEPLOYMENT STATUS

### ✅ Code Ready
- [x] Production build tested successfully (1.2MB frontend, 153KB backend)
- [x] All APIs functional (properties, bookings, reviews, payments, services)
- [x] Database schema complete (17 tables)
- [x] Seed script ready with test data
- [x] Environment variables documented
- [x] No TypeScript errors
- [x] No console errors in development

### ✅ Features Complete
- [x] Passwordless 4-digit OTP authentication (phone + email)
- [x] Property search & filters (city, type, price, dates)
- [x] Booking system with conflict detection
- [x] Review system with weighted ratings
- [x] Payment integration (Stripe, PayPal, Telebirr)
- [x] ID verification (QR + OCR)
- [x] Add-on services backend (15% commission model)
- [x] Admin dashboard
- [x] Host dashboard
- [x] Guest dashboard
- [x] Commission & tax calculation (ERCA compliant)

### ⏳ Pending (Phase 2)
- [ ] Add-on services UI (booking confirmation page)
- [ ] Ethiopian Telecom SMS integration
- [ ] Google Maps integration
- [ ] Advanced analytics

---

## DEPLOYMENT STEPS

### Phase 1: Setup Free Infrastructure

#### Step 1: GitHub Repository
- [ ] Export from Replit using Version Control panel
- [ ] Create GitHub repo: `alga-app`
- [ ] Push code to main branch
- [ ] Verify all files uploaded

**How**: Replit → Three dots → Version Control → Create GitHub repo

---

#### Step 2: Neon Database (Free PostgreSQL)
- [ ] Create account at neon.tech
- [ ] Create project: "alga-production"
- [ ] Copy connection string
- [ ] Save connection string securely

**Connection String Format**:
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

---

#### Step 3: Render Backend Deployment
- [ ] Create account at render.com (sign up with GitHub)
- [ ] Create new Web Service
- [ ] Select GitHub repo: `alga-app`
- [ ] Configure build settings:
  - Build Command: `npm install && npm run build`
  - Start Command: `npm run start`
  - Instance Type: **FREE**
- [ ] Add environment variables (see below)
- [ ] Deploy and wait 3-5 minutes
- [ ] Copy Render URL: `https://alga-backend.onrender.com`
- [ ] Verify API: Visit `/api/properties` endpoint

**Environment Variables for Render**:
```env
DATABASE_URL=<your-neon-connection-string>
NODE_ENV=production
SESSION_SECRET=<generate-random-32-character-string>
SENDGRID_API_KEY=SG.xxxxxx (optional for now)
SENDGRID_FROM_EMAIL=noreply@algaapp.com
```

**Generate SESSION_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

#### Step 4: Vercel Frontend Deployment
- [ ] Create account at vercel.com (sign up with GitHub)
- [ ] Import project
- [ ] Select GitHub repo: `alga-app`
- [ ] Configure:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist/public`
- [ ] Add environment variable:
  ```env
  VITE_API_BASE_URL=https://alga-backend.onrender.com
  ```
  (Use YOUR actual Render URL!)
- [ ] Deploy and wait 2-3 minutes
- [ ] Copy Vercel URL: `https://alga-app-xxxxx.vercel.app`

---

#### Step 5: Initialize Database
- [ ] Access Render dashboard → Your web service → Shell tab
- [ ] Run migration:
  ```bash
  npm run db:push
  ```
- [ ] Run seed script:
  ```bash
  npm run seed
  ```
- [ ] Verify tables created in Neon dashboard

**Expected Output**: 17 tables created, 3 properties, 2 users, 3 service providers

---

### Phase 2: Verification & Testing

#### Backend Verification
- [ ] Visit: `https://your-render-url.onrender.com/api/properties`
- [ ] Should return JSON with 3 properties
- [ ] Check Render logs for errors
- [ ] Verify database connection successful

#### Frontend Verification
- [ ] Visit: `https://your-vercel-url.vercel.app`
- [ ] Homepage loads with hero section
- [ ] Click "Browse Properties" → See 3 properties
- [ ] Click property → View details page
- [ ] No console errors in browser DevTools

#### Authentication Flow
- [ ] Click "Sign Up"
- [ ] Enter email address
- [ ] Receive 4-digit OTP (check console logs if no SendGrid)
- [ ] Enter OTP and complete signup
- [ ] Verify redirect to /properties
- [ ] Check user session persists on refresh

#### Booking Flow
- [ ] Select a property
- [ ] Choose check-in/check-out dates
- [ ] Click "Book Now"
- [ ] Fill guest details
- [ ] See pricing breakdown
- [ ] Test payment flow (use Stripe test mode)

#### Admin Access
- [ ] Login with: `ethiopianstay@gmail.com`
- [ ] Get OTP from console/email
- [ ] Access admin dashboard
- [ ] Check verification tabs
- [ ] View statistics

#### Host Access
- [ ] Login with: `winnieaman94@gmail.com`
- [ ] Get OTP from console/email
- [ ] Access host dashboard
- [ ] View properties
- [ ] Check bookings tab

---

### Phase 3: Final Configuration

#### Custom Domain (Optional)
- [ ] Purchase domain: `algaapp.com` ($12/year)
- [ ] Add to Vercel: Frontend
- [ ] Add to Render: Backend (`api.algaapp.com`)
- [ ] Configure DNS records
- [ ] Verify SSL certificates

#### Email Configuration (Recommended)
- [ ] Create SendGrid account (free tier: 100 emails/day)
- [ ] Verify sender email: `noreply@algaapp.com`
- [ ] Get API key (starts with "SG.")
- [ ] Add to Render environment variables
- [ ] Test OTP email delivery

#### Monitoring Setup
- [ ] Enable Render metrics dashboard
- [ ] Enable Vercel analytics
- [ ] Check Neon database usage
- [ ] Set up error tracking (optional: Sentry)

---

## POST-DEPLOYMENT CHECKLIST

### Functionality
- [ ] ✅ User registration works
- [ ] ✅ Login with OTP works
- [ ] ✅ Properties display correctly
- [ ] ✅ Search and filters work
- [ ] ✅ Property details page loads
- [ ] ✅ Booking flow completes
- [ ] ✅ Payment integration works
- [ ] ✅ Admin dashboard accessible
- [ ] ✅ Host dashboard accessible
- [ ] ✅ ID verification uploads work
- [ ] ✅ Reviews can be submitted

### Performance
- [ ] ✅ Page load time < 3 seconds
- [ ] ✅ API response time < 1 second
- [ ] ✅ Images load properly
- [ ] ✅ Mobile responsive design works
- [ ] ✅ No memory leaks
- [ ] ✅ Database queries optimized

### Security
- [ ] ✅ HTTPS enabled (auto on Render/Vercel)
- [ ] ✅ Environment variables secure
- [ ] ✅ Session cookies httpOnly
- [ ] ✅ Rate limiting active
- [ ] ✅ No secrets in code
- [ ] ✅ SQL injection protection (Drizzle ORM)
- [ ] ✅ CORS configured correctly

### User Experience
- [ ] ✅ No console errors
- [ ] ✅ Proper error messages
- [ ] ✅ Loading states shown
- [ ] ✅ Forms validate correctly
- [ ] ✅ Navigation works smoothly
- [ ] ✅ Ethiopian theme consistent

---

## FINAL DEPLOYMENT URLS

**Save these after completion:**

```
┌─────────────────────────────────────────────────────────┐
│ 🌐 ALGA PRODUCTION URLS                                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Frontend (Users):                                       │
│ https://alga-app-xxxxx.vercel.app                      │
│                                                          │
│ Backend API:                                            │
│ https://alga-backend.onrender.com                       │
│                                                          │
│ Database:                                               │
│ Neon Dashboard (ep-xxxx.neon.tech)                     │
│                                                          │
│ Admin Login:                                            │
│ Email: ethiopianstay@gmail.com                          │
│                                                          │
│ Host Login:                                             │
│ Email: winnieaman94@gmail.com                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## REPLIT SHUTDOWN

After verification:

- [ ] Confirm all features work on production
- [ ] Download backup of .env file (for records)
- [ ] Stop all Replit workflows
- [ ] Cancel Replit subscription (if paid)
- [ ] Archive Replit project (keep as backup)

**Important**: Keep Replit project archived for 30 days as backup before deleting.

---

## COST SUMMARY

| Service | Plan | Monthly Cost | Limits |
|---------|------|--------------|--------|
| **Render** | Free | $0 | 750 hours/month, sleeps after 15min |
| **Vercel** | Hobby | $0 | Unlimited deploys, 100GB bandwidth |
| **Neon** | Free | $0 | 0.5GB storage, 1 project |
| **SendGrid** | Free | $0 | 100 emails/day |
| **Total** | | **$0/month** | Perfect for MVP/testing |

**Upgrade Path** (when ready):
- Render Pro: $7/mo (always-on, no sleep)
- Vercel Pro: $20/mo (team features)
- Neon Pro: $19/mo (more storage)

---

## TROUBLESHOOTING GUIDE

### Issue: Backend shows "Application Error"
**Solution**:
1. Check Render logs (Dashboard → Logs)
2. Verify DATABASE_URL is correct
3. Ensure build completed successfully
4. Check environment variables are set

### Issue: Frontend shows "Failed to fetch"
**Solution**:
1. Verify VITE_API_BASE_URL in Vercel
2. Check Render backend is running
3. Inspect browser console for CORS errors
4. Wait 30s if backend is sleeping (first request)

### Issue: OTP not received
**Solution**:
1. Check browser console logs (OTP appears there)
2. Verify SendGrid API key if emails needed
3. Check email spam folder
4. Use admin user to bypass (ethiopianstay@gmail.com)

### Issue: Database connection failed
**Solution**:
1. Verify Neon database is active
2. Check connection string has `?sslmode=require`
3. Ensure Neon project is not paused
4. Test connection from Render Shell: `psql $DATABASE_URL`

### Issue: Images not loading
**Solution**:
1. Check images uploaded to database
2. Verify public folder deployed to Vercel
3. Check browser network tab for 404s
4. Ensure file paths are correct

---

## SUCCESS CRITERIA

Your deployment is successful when:

✅ All checklist items completed  
✅ Frontend loads without errors  
✅ Backend API responds correctly  
✅ Users can sign up and login  
✅ Properties display properly  
✅ Booking flow works end-to-end  
✅ Admin dashboard accessible  
✅ No console errors  
✅ Mobile responsive  
✅ Replit subscription cancelled  

---

## NEXT STEPS (Post-Launch)

### Week 1: Monitor & Fix
- [ ] Check Render/Vercel dashboards daily
- [ ] Monitor error logs
- [ ] Fix any user-reported bugs
- [ ] Optimize slow queries

### Week 2-4: Phase 2 Features
- [ ] Build add-on services UI
- [ ] Implement Ethiopian Telecom SMS
- [ ] Add Google Maps integration
- [ ] Enhance search with geocoding

### Month 2: Growth
- [ ] Add analytics (Google Analytics)
- [ ] Implement SEO optimizations
- [ ] Create marketing materials
- [ ] Gather user feedback

### Month 3: Scale
- [ ] Consider upgrading to paid tiers if needed
- [ ] Add more Ethiopian cities
- [ ] Implement referral program
- [ ] Launch marketing campaign

---

## 📞 SUPPORT RESOURCES

- **Render Support**: https://render.com/docs
- **Vercel Support**: https://vercel.com/docs
- **Neon Support**: https://neon.tech/docs/introduction
- **Your Documentation**: See MIGRATE_TO_PRODUCTION.md

---

## 🎉 CONGRATULATIONS!

You've successfully migrated Alga from Replit to free production hosting!

**You now have**:
- ✅ Live website on Vercel
- ✅ API backend on Render
- ✅ PostgreSQL database on Neon
- ✅ $0/month hosting costs
- ✅ Auto-deployment from GitHub
- ✅ Production-ready platform

**Share your app and start onboarding users!** 🚀

---

**Last Updated**: October 22, 2025  
**Version**: 1.0  
**Status**: Ready for Deployment
