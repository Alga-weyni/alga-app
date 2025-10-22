# ⚡ Quick Deployment Checklist

## 🎯 Zero-Cost Production Launch

### ✅ Pre-Deployment (Complete)
- [x] Production build tested
- [x] GitHub repository configured
- [x] Deployment configs created (render.yaml, vercel.json)
- [x] Environment variables documented
- [x] Payment integrations ready
- [x] Database migrated to Neon

---

## 🚀 Deployment Steps (30-45 min)

### Step 1: Push Code to GitHub (5 min)
```bash
# Run the automated deployment script
./deploy-to-production.sh
```

**Or manually:**
```bash
rm -f .git/index.lock
git add .
git commit -m "Production deployment - Zero-cost infrastructure"
git push origin main
```

---

### Step 2: Deploy Backend to Render (15 min)

#### Quick Links:
- 🔗 [Deploy on Render](https://render.com)
- 📋 [Environment Variables Template](./RENDER_ENV_VARS.txt)

#### Steps:
1. Sign up → Connect GitHub → Select "alga-app"
2. Configure:
   - Name: `alga-backend`
   - Plan: **FREE** ⭐
   - Build: `npm install && npm run build`
   - Start: `npm start`
3. Add env vars from `RENDER_ENV_VARS.txt`
4. Click "Create Web Service"
5. ✅ Copy URL: `https://alga-backend.onrender.com`

---

### Step 3: Deploy Frontend to Vercel (10 min)

#### Quick Links:
- 🔗 [Deploy on Vercel](https://vercel.com/new)
- 📋 [Environment Variables Template](./VERCEL_ENV_VARS.txt)

#### Steps:
1. Sign up → Import "alga-app"
2. Configure:
   - Build: `npm run build`
   - Output: `dist/public`
3. Add env vars from `VERCEL_ENV_VARS.txt`
   - **Important**: Set `VITE_API_URL` to your Render backend URL
4. Click "Deploy"
5. ✅ Copy URL: `https://alga-app.vercel.app`

---

### Step 4: Update Backend URL (2 min)

Go back to Render → Environment → Update:
```
APP_URL=https://alga-app.vercel.app
```
Save → Auto-redeploy

---

### Step 5: Seed Database (3 min)

**Option A: Via Render Shell**
1. Render Dashboard → alga-backend → "Shell"
2. Run: `npm run seed`

**Option B: Local with Production DB**
```bash
export DATABASE_URL="[your-neon-connection-string]"
npm run seed
unset DATABASE_URL
```

---

### Step 6: Test Live Site (5 min)

Visit your Vercel URL and test:
- [ ] Sign up with OTP
- [ ] Browse properties
- [ ] Create booking
- [ ] Complete payment (Chapa)
- [ ] Receive confirmation email
- [ ] Access code generated

---

## 🎉 Success Metrics

Your site is live when:
- ✅ Frontend loads at Vercel URL
- ✅ Backend health check: `/api/health` returns `{"status":"ok"}`
- ✅ OTP emails delivered
- ✅ Payments process successfully
- ✅ Zero console errors

---

## 📊 Live URLs

After deployment:

- **Frontend**: https://alga-app.vercel.app
- **Backend**: https://alga-backend.onrender.com
- **Backend Health**: https://alga-backend.onrender.com/api/health
- **Database**: [Neon Dashboard](https://console.neon.tech)

---

## 🔐 Required Environment Variables

### Render (Backend)
**Minimum Required:**
```
DATABASE_URL=[from-neon]
SENDGRID_API_KEY=[from-sendgrid]
CHAPA_SECRET_KEY=[from-chapa]
APP_URL=https://alga-backend.onrender.com
```

**Optional:**
- STRIPE_SECRET_KEY
- PAYPAL_CLIENT_ID
- PAYPAL_CLIENT_SECRET
- TELEBIRR credentials

### Vercel (Frontend)
**Required:**
```
VITE_API_URL=https://alga-backend.onrender.com
```

**Optional:**
- VITE_STRIPE_PUBLIC_KEY
- VITE_CHAPA_PUBLIC_KEY

---

## 💰 Monthly Costs

| Service | Plan | Cost |
|---------|------|------|
| Render | Free | $0.00 |
| Vercel | Free | $0.00 |
| Neon DB | Free | $0.00 |
| SendGrid | Free (100 emails/day) | $0.00 |
| **TOTAL** | | **$0.00** ✨ |

---

## ⚠️ Important Notes

### Free Tier Limitations

**Render:**
- Auto-sleep after 15 min inactivity
- 30-second cold start on first request
- 750 free hours/month (one 24/7 service)

**Vercel:**
- 100 GB bandwidth/month
- No cold starts (always fast!)

**Neon:**
- Auto-suspend after 5 min inactivity
- 512 MB storage
- Fast resume (~1 second)

### Keep Backend Warm (Optional)

Set up free monitoring to prevent cold starts:
1. Go to [UptimeRobot.com](https://uptimerobot.com)
2. Add monitor: `https://alga-backend.onrender.com/api/health`
3. Check every 5 minutes
4. ✅ Backend stays warm!

---

## 🚨 Before Canceling Replit

**ONLY after confirming:**
- ✅ Both Render and Vercel deployed successfully
- ✅ All features tested and working
- ✅ Database properly migrated
- ✅ Environment variables configured
- ✅ Payments processing correctly

**Then:**
1. Download any important files from Replit
2. Go to [replit.com/account](https://replit.com/account)
3. Click "Subscription" → "Cancel"
4. Keep Replit project as backup for 30 days

---

## 📞 Need Help?

- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Chapa Integration**: [CHAPA_INTEGRATION.md](./CHAPA_INTEGRATION.md)

---

**Estimated Total Time**: 30-45 minutes  
**Monthly Cost**: $0.00  
**Status**: ✅ Ready to Deploy
