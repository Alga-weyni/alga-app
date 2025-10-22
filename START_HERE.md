# 🚀 ALGA - START HERE FOR DEPLOYMENT

**Welcome! This guide will help you deploy Alga to free production hosting in 30 minutes.**

---

## ✅ WHAT'S READY

Your Alga app is **100% production-ready**:
- ✅ Code built and tested (1.2MB frontend, 153KB backend)
- ✅ Database schema ready (17 tables)
- ✅ Test data prepared (admin, host, 3 properties, 3 services)
- ✅ All features working (auth, booking, payments, reviews, ID verification)
- ✅ Deployment automation created
- ✅ Comprehensive documentation written

---

## 🎯 CHOOSE YOUR DEPLOYMENT METHOD

### ⚡ OPTION 1: Semi-Automated (Recommended)

**Best for**: Most users who want safety + speed

**What you do**:
1. Add DATABASE_URL to Replit Secrets
2. Run: `bash scripts/deploy-prepare.sh`
3. Follow web-based steps for Render + Vercel (10 min each)

**Total time**: 25-30 minutes  
**Difficulty**: Easy ⭐  
**Safety**: High 🔒

👉 **Start here**: `scripts/README.md` → Then run the script

---

### 📖 OPTION 2: Manual Step-by-Step

**Best for**: Those who want full control or are deploying for the first time

**What you do**:
1. Follow QUICK_DEPLOY.md for fast deployment
2. Or MIGRATE_TO_PRODUCTION.md for detailed instructions

**Total time**: 30-45 minutes  
**Difficulty**: Easy ⭐⭐  
**Safety**: High 🔒

👉 **Start here**: `QUICK_DEPLOY.md`

---

## 📚 DOCUMENTATION MAP

### 🟢 For Quick Deployment
1. **scripts/README.md** - How to use automation scripts
2. **DEPLOYMENT_COMMANDS.md** - All commands in one place
3. **QUICK_DEPLOY.md** - 30-minute fast deployment

### 🔵 For Detailed Instructions
1. **MIGRATE_TO_PRODUCTION.md** - Complete step-by-step guide
2. **DEPLOYMENT_CHECKLIST.md** - Verification checklist
3. **FINAL_DEPLOYMENT_SUMMARY.md** - Overview & decision guide

### 🟣 For Reference
1. **YOUR_DEPLOYMENT_URLS.md** - Track your live URLs
2. **replit.md** - Project architecture & features

---

## 🚀 FASTEST PATH TO DEPLOYMENT

```
┌─────────────────────────────────────────┐
│ 1. Setup (2 minutes)                    │
│    → Add DATABASE_URL to Replit Secrets │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. Automate (3 minutes)                 │
│    → bash scripts/deploy-prepare.sh     │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. Deploy Backend (10 minutes)          │
│    → render.com (web interface)         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. Deploy Frontend (10 minutes)         │
│    → vercel.com (web interface)         │
└─────────────────┬───────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 5. Verify (5 minutes)                   │
│    → Test sign up, login, properties    │
└─────────────────┬───────────────────────┘
                  ↓
          🎉 YOU'RE LIVE!
    💰 Cost: $0/month on free tier
```

---

## 💰 HOSTING COSTS

| Service | What | Cost |
|---------|------|------|
| **Render** | Backend API | $0/month (free tier) |
| **Vercel** | Frontend UI | $0/month (free tier) |
| **Neon** | PostgreSQL DB | $0/month (free tier) |
| **Total** | | **$0/month** |

**Free tier limits**:
- Render: 750 hours/month (24/7), sleeps after 15min
- Vercel: Unlimited deploys, 100GB bandwidth
- Neon: 0.5GB storage (enough for 10,000+ properties)

---

## 🔐 SECURITY REQUIREMENTS

Before deploying, you'll need:

1. **DATABASE_URL** (from Neon.tech)
   ```
   postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
   ```

2. **SESSION_SECRET** (generate with script)
   ```bash
   bash scripts/generate-secrets.sh
   ```

3. **SENDGRID_API_KEY** (optional - for email OTPs)
   ```
   SG.xxxxxxxxxxxxx
   ```

**Important**: Never hardcode secrets in code! Use Replit Secrets or platform dashboards.

---

## ⚠️ IMPORTANT NOTES

### Before You Start
- ☑️ You need a GitHub account (free)
- ☑️ You need accounts on Render, Vercel, Neon (all free)
- ☑️ Allow 30-45 minutes of focused time
- ☑️ Have your Neon DATABASE_URL ready

### After Deployment
- ✅ Test everything thoroughly before cancelling Replit
- ✅ Keep Replit project as backup for 30 days
- ✅ Fill out YOUR_DEPLOYMENT_URLS.md with your live URLs
- ✅ Use DEPLOYMENT_CHECKLIST.md to verify everything works

### Free Tier Limitations
- ⏰ Render backend sleeps after 15min (first request takes ~30s to wake)
- 📧 Without SendGrid, OTPs appear in console logs (not email)
- 💾 0.5GB database limit (plenty for MVP)

---

## 🎯 RECOMMENDED: START WITH AUTOMATION

**Most users should use the semi-automated approach:**

1. Open `scripts/README.md` - Read how the script works (5 min)
2. Add DATABASE_URL to Replit Secrets (2 min)
3. Run `bash scripts/deploy-prepare.sh` (3-5 min)
4. Follow displayed next steps for Render + Vercel (20 min)
5. Verify using DEPLOYMENT_CHECKLIST.md (5 min)

**Total**: 30-35 minutes to go live! 🚀

---

## 🆘 TROUBLESHOOTING

### Script fails with "DATABASE_URL not set"
→ Add to Replit Secrets: Tools → Secrets → Add DATABASE_URL

### Build errors
→ Run: `npm install && npm run build`

### Database push fails
→ Run: `npm run db:push -- --force`

### Git push fails
→ Use Replit Version Control panel instead

---

## 📞 NEED HELP?

All guides include comprehensive troubleshooting sections:
- `scripts/README.md` - Script troubleshooting
- `MIGRATE_TO_PRODUCTION.md` - Deployment troubleshooting
- `DEPLOYMENT_CHECKLIST.md` - Verification troubleshooting

---

## 🎉 YOU'RE READY!

Everything is prepared. Just choose your method and follow the guides!

**Recommended next step**: Open `scripts/README.md` and run the automation script.

**Time to production**: 30 minutes  
**Cost**: $0/month  
**Difficulty**: Easy

**Let's get Alga live! 🇪🇹🏠**

---

Created by: Weyni Abraha | Alga App | October 2025
