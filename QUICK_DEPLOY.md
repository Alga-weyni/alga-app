# ⚡ ALGA - QUICK DEPLOYMENT REFERENCE

**Total Time**: 30 minutes | **Cost**: $0/month

---

## 🚀 DEPLOYMENT STEPS

### 1️⃣ Push to GitHub (2 min)
```
In Replit: Version Control → Create GitHub repo → Push
```

### 2️⃣ Neon Database (5 min)
```
1. Go to neon.tech → Sign up
2. Create project: "alga-production"
3. Copy connection string
```

### 3️⃣ Render Backend (10 min)
```
1. Go to render.com → Sign up with GitHub
2. New Web Service → Select repo
3. Settings:
   - Build: npm install && npm run build
   - Start: npm run start
   - Instance: FREE
4. Add env vars (see below)
5. Deploy!
```

### 4️⃣ Vercel Frontend (10 min)
```
1. Go to vercel.com → Sign up with GitHub
2. Import project → Select repo
3. Framework: Vite
4. Add env: VITE_API_BASE_URL=<your-render-url>
5. Deploy!
```

### 5️⃣ Initialize Database (3 min)
```bash
# In Render Shell or local terminal:
npm run db:push
npm run seed
```

---

## 🔑 ENVIRONMENT VARIABLES

### Render (Backend)
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
NODE_ENV=production
SESSION_SECRET=<generate-random-32-chars>
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@algaapp.com
```

### Vercel (Frontend)
```env
VITE_API_BASE_URL=https://alga-backend.onrender.com
```

---

## ✅ VERIFICATION

1. ✅ Visit Vercel URL → See homepage
2. ✅ Sign up with email → Get OTP
3. ✅ Browse properties → See 3 listings
4. ✅ Admin login: `ethiopianstay@gmail.com`
5. ✅ No console errors

---

## 🆘 QUICK FIXES

**Backend not responding?**
→ Check Render logs, verify DATABASE_URL

**Frontend API errors?**
→ Verify VITE_API_BASE_URL in Vercel env vars

**OTP not working?**
→ Check console logs (emails need SendGrid key)

**Slow first load?**
→ Normal! Render free tier sleeps after 15min

---

## 📊 YOUR URLS

Save these after deployment:

```
Frontend: https://alga-app-xxxxx.vercel.app
Backend: https://alga-backend.onrender.com
Database: Neon dashboard

Admin: ethiopianstay@gmail.com
Host: winnieaman94@gmail.com
```

---

## 💰 COST: $0/MONTH

- ✅ Render Free: 750 hours/month
- ✅ Vercel Hobby: Unlimited deploys
- ✅ Neon Free: 0.5GB storage

---

## 🔄 AUTO-DEPLOY

Push to GitHub → Auto-deploys to Render + Vercel!

```bash
git add .
git commit -m "Update"
git push origin main
```

---

**Full Guide**: See `MIGRATE_TO_PRODUCTION.md`

🎉 **You're live on free infrastructure!**
