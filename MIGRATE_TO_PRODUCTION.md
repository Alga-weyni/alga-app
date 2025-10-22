# 🚀 ALGA - REPLIT TO PRODUCTION MIGRATION GUIDE

**Objective**: Deploy Alga on 100% free infrastructure (Render + Vercel + Neon)  
**Timeline**: 30-45 minutes  
**Cost**: $0/month

---

## ✅ PRE-FLIGHT CHECKLIST

- [x] ✅ Production build tested successfully
- [x] ✅ Backend APIs complete (2,200+ lines)
- [x] ✅ Database schema ready
- [x] ✅ Frontend built and optimized
- [ ] GitHub repository ready
- [ ] Render.com account created
- [ ] Vercel account created
- [ ] Neon database created (or use existing)

---

## 📦 STEP 1: EXPORT FROM REPLIT TO GITHUB (5 minutes)

### Option A: Using Replit's GitHub Integration (Recommended)

1. **In Replit**, click the three dots (...) menu
2. Select **"Version control"** or **"Git"**
3. Click **"Connect to GitHub"** or **"Create GitHub repo"**
4. Choose: **Create new repository** → Name it `alga-app`
5. Click **"Create and push"**
6. ✅ Your code is now on GitHub!

### Option B: Manual Git Push (If Option A doesn't work)

```bash
# 1. Initialize git (if not already done)
git init

# 2. Add all files
git add .

# 3. Commit
git commit -m "Final Replit export - Production ready"

# 4. Add GitHub remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/alga-app.git

# 5. Push to GitHub
git push -u origin main
```

**Note**: Replit automatically handles git for you. Just use the Version Control panel!

---

## 🗄️ STEP 2: FREE DATABASE SETUP - NEON (5 minutes)

### If you don't have a Neon database yet:

1. Go to **[Neon.tech](https://neon.tech)**
2. Sign up with GitHub (free)
3. Click **"Create Project"**
   - Name: `alga-production`
   - Region: Choose closest to your users (e.g., US East)
4. Click **"Create"**
5. Copy your connection string:
   ```
   postgres://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
6. Save this - you'll need it for Render!

**Free Tier Limits**: 0.5 GB storage (plenty for your app)

---

## 🔧 STEP 3: DEPLOY BACKEND TO RENDER.COM (10 minutes)

### 3.1 Create Render Account
1. Go to **[Render.com](https://render.com)**
2. Sign up with **GitHub** (free)

### 3.2 Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account
3. Select repository: `alga-app`
4. Configure:

**Service Details:**
```yaml
Name: alga-backend
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main
Root Directory: . (leave blank)
```

**Build Settings:**
```yaml
Build Command: npm install && npm run build
Start Command: npm run start
```

**Instance Type:**
```
✅ Free (select Free tier - $0/month)
```

### 3.3 Add Environment Variables

Click **"Environment"** tab and add:

```env
DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
NODE_ENV=production
SESSION_SECRET=your-super-secret-random-string-change-this-to-something-unique
SENDGRID_API_KEY=SG.your-sendgrid-key-here
SENDGRID_FROM_EMAIL=noreply@algaapp.com
```

**Generate SESSION_SECRET**: Run this in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.4 Deploy!

1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. You'll get a URL like: `https://alga-backend.onrender.com`
4. ✅ Copy this URL - you need it for frontend!

**Important**: Free tier apps sleep after 15 min of inactivity. First request may take 30s to wake up.

---

## 🎨 STEP 4: DEPLOY FRONTEND TO VERCEL (10 minutes)

### 4.1 Create Vercel Account
1. Go to **[Vercel.com](https://vercel.com)**
2. Sign up with **GitHub** (free)

### 4.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Select your GitHub repository: `alga-app`
3. Configure:

**Build Settings:**
```yaml
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist/public
Install Command: npm install
```

**Root Directory**: Leave blank (.)

### 4.3 Add Environment Variable

Under **"Environment Variables"**:

```env
VITE_API_BASE_URL=https://alga-backend.onrender.com
```

⚠️ **Replace with YOUR actual Render backend URL from Step 3.4!**

### 4.4 Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. You'll get a URL like: `https://alga-app-xxxx.vercel.app`
4. ✅ Your frontend is live!

**Free Tier**: Unlimited bandwidth, auto SSL, instant deployments

---

## 🗃️ STEP 5: INITIALIZE DATABASE (2 minutes)

Your database needs tables. Run migration:

### Option A: From Render Dashboard (Easiest)

1. Go to your **Render Web Service**
2. Click **"Shell"** tab
3. Run:
```bash
npm run db:push
npm run seed
```

### Option B: From Local Terminal

```bash
# Set DATABASE_URL to your Neon connection string
export DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require"

# Push schema
npm run db:push

# Seed test data
npm run seed
```

This creates:
- ✅ Admin user: `ethiopianstay@gmail.com`
- ✅ Host user: `winnieaman94@gmail.com`
- ✅ 3 properties (Addis Ababa, Bahir Dar, Debark)
- ✅ 3 service providers

---

## ✅ STEP 6: VERIFY DEPLOYMENT (5 minutes)

### Test Your Live App

1. **Visit Your Frontend**: `https://alga-app-xxxx.vercel.app`

2. **Test Sign Up**:
   - Click "Sign Up"
   - Enter email (use your real email if SendGrid is configured)
   - Check console logs for OTP if email doesn't work
   - Verify OTP and login

3. **Test Property Browsing**:
   - See 3 seeded properties
   - Test search filters
   - View property details

4. **Test Booking Flow**:
   - Select dates
   - Click "Book Now"
   - Fill guest details
   - Test payment (use test mode)

5. **Test Admin Dashboard**:
   - Login as: `ethiopianstay@gmail.com`
   - Check verification tabs
   - View statistics

6. **Check Backend**:
   - Visit: `https://alga-backend.onrender.com/api/properties`
   - Should see JSON with 3 properties

---

## 📊 DEPLOYMENT URLS

After completing all steps, save these URLs:

```
Frontend (Users): https://alga-app-xxxx.vercel.app
Backend API: https://alga-backend.onrender.com
Database: ep-xxxx.region.aws.neon.tech (via Neon dashboard)

Admin Login: ethiopianstay@gmail.com
Host Login: winnieaman94@gmail.com
```

---

## 💰 COST BREAKDOWN

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| Render.com (Backend) | Free | $0 |
| Vercel (Frontend) | Hobby | $0 |
| Neon (Database) | Free | $0 |
| **TOTAL** | | **$0/month** |

**Free Tier Limits:**
- Render: 750 hours/month (enough for 1 app 24/7)
- Vercel: Unlimited deployments
- Neon: 0.5GB storage, 1 project

---

## 🚨 TROUBLESHOOTING

### Backend doesn't start
- Check Render logs: Dashboard → Logs tab
- Verify `DATABASE_URL` is correct
- Ensure build command succeeded

### Frontend shows API errors
- Verify `VITE_API_BASE_URL` matches your Render URL
- Check Render backend is running (not sleeping)
- Open browser console for errors

### Database connection fails
- Verify Neon database is running
- Check connection string has `?sslmode=require`
- Ensure IP allowlist is disabled in Neon (or add Render IPs)

### OTP emails not sending
- Get proper SendGrid API key (starts with "SG.")
- Verify sender email in SendGrid
- Check Render environment variables

### App sleeps / slow first load
- This is normal for Render free tier
- First request wakes up the app (~30 seconds)
- Consider upgrading to Render's paid tier ($7/mo) for always-on

---

## 🔄 CONTINUOUS DEPLOYMENT

Both Render and Vercel auto-deploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main

# ✅ Automatic deployment happens!
# Vercel: ~2 minutes
# Render: ~3-5 minutes
```

---

## 🎯 POST-DEPLOYMENT CHECKLIST

- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds at Render URL
- [ ] Database tables exist (check Neon dashboard)
- [ ] Can sign up new user
- [ ] OTP authentication works
- [ ] Properties display correctly
- [ ] Booking flow completes
- [ ] Admin dashboard accessible
- [ ] No console errors in browser
- [ ] Mobile responsive design works

---

## 🔐 SECURITY RECOMMENDATIONS

1. **Change SESSION_SECRET**: Use unique random value
2. **Enable HTTPS**: Auto-enabled on Render & Vercel
3. **Rotate Secrets**: Change API keys monthly
4. **Monitor Logs**: Check Render/Vercel dashboards weekly
5. **Backup Database**: Neon has automatic backups (free tier)

---

## 📈 MONITORING

### Render Dashboard
- View logs: Real-time backend logs
- Metrics: CPU, memory, response times
- Events: Deployment history

### Vercel Dashboard
- Analytics: Page views, performance
- Logs: Build logs, function logs
- Deployments: History and rollback

### Neon Dashboard
- Database size
- Connection count
- Query performance

---

## 🆙 OPTIONAL UPGRADES (When Ready)

### Custom Domain ($12/year)
1. Buy domain at Namecheap/Google Domains
2. Add to Vercel: `algaapp.com`
3. Add to Render: `api.algaapp.com`

### Paid Tiers (If Needed)
- Render Pro: $7/mo (always-on, better performance)
- Vercel Pro: $20/mo (team features, advanced analytics)
- Neon Pro: $19/mo (more storage, better performance)

---

## 🎉 SUCCESS!

Your Alga app is now live on 100% free infrastructure!

**Frontend**: Your Vercel URL  
**Backend**: Your Render URL  
**Database**: Neon PostgreSQL

**No Replit charges, no hidden fees, fully functional!** 🚀

---

## 📞 SUPPORT RESOURCES

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **Your Code**: Check DEPLOYMENT.md for more details

---

**Migration Complete!** 🎊

Next Steps:
1. Test everything thoroughly
2. Share your Vercel URL with users
3. Monitor logs for issues
4. Enjoy your free hosting!
