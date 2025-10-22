# 🚀 DEPLOY NOW - Alga Production Launch

## ⚡ Quick Start (Run This First!)

```bash
# Execute the automated deployment script
./deploy-to-production.sh
```

This script will:
- ✅ Test production build
- ✅ Stage and commit all changes
- ✅ Push code to GitHub
- ✅ Display next steps

---

## 📋 What's Been Prepared for You

### ✅ Deployment Configurations Created
- `render.yaml` - Render.com backend configuration
- `vercel.json` - Vercel frontend configuration
- `.env.production.example` - Complete environment variables template
- `RENDER_ENV_VARS.txt` - Backend variables for copy-paste
- `VERCEL_ENV_VARS.txt` - Frontend variables for copy-paste

### ✅ Documentation Completed
- `DEPLOYMENT_GUIDE.md` - Comprehensive 30-45 min guide
- `QUICK_DEPLOY_CHECKLIST.md` - Step-by-step checklist
- `CHAPA_INTEGRATION.md` - Payment integration docs
- `deploy-to-production.sh` - Automated deployment script

### ✅ Code Ready for Production
- Production build tested ✓
- All payment integrations complete (Chapa, Stripe, PayPal, Telebirr)
- OTP authentication working
- Database schema synced
- Security hardened for production

---

## 🎯 3-Step Deployment Process

### Step 1: Push to GitHub (2 min)
```bash
./deploy-to-production.sh
```

### Step 2: Deploy Backend (15 min)
1. Go to [render.com](https://render.com)
2. New Web Service → Connect GitHub → Select "alga-app"
3. Use FREE tier
4. Add environment variables from `RENDER_ENV_VARS.txt`
5. Deploy!

**Required Environment Variables:**
```
DATABASE_URL=[your-neon-connection]
SENDGRID_API_KEY=[your-sendgrid-key]
CHAPA_SECRET_KEY=[your-chapa-key]
```

### Step 3: Deploy Frontend (10 min)
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import "alga-app" from GitHub
3. Add ONE environment variable:
   ```
   VITE_API_URL=https://alga-backend.onrender.com
   ```
4. Deploy!

---

## 🔑 Where to Get API Keys

### 1. Database URL (Neon)
- Go to: [console.neon.tech](https://console.neon.tech)
- Select your project → Connection Details
- Copy connection string

### 2. Chapa Secret Key (Required)
- Go to: [dashboard.chapa.co](https://dashboard.chapa.co)
- Settings → API Keys
- Copy secret key

### 3. SendGrid API Key (Required)
- Go to: [app.sendgrid.com](https://app.sendgrid.com)
- Settings → API Keys → Create API Key
- Full Access → Copy key

### 4. Stripe Keys (Optional)
- Go to: [dashboard.stripe.com](https://dashboard.stripe.com)
- Developers → API Keys
- Copy secret and publishable keys

---

## 🧪 Testing Your Deployment

After both services deploy, test:

1. **Backend Health Check**
   ```bash
   curl https://alga-backend.onrender.com/api/health
   # Should return: {"status":"ok"}
   ```

2. **Frontend Loads**
   - Visit: `https://alga-app.vercel.app`
   - Should see homepage with "Stay. Discover. Belong."

3. **Complete User Flow**
   - Sign up with phone/email
   - Receive OTP code
   - Browse properties
   - Create booking
   - Complete payment with Chapa
   - Receive confirmation email

4. **Seed Database** (Optional)
   ```bash
   # Via Render Shell or locally
   npm run seed
   ```

---

## 💰 Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Render** (Backend) | Free Tier | $0.00 |
| **Vercel** (Frontend) | Hobby Plan | $0.00 |
| **Neon** (Database) | Free Tier | $0.00 |
| **SendGrid** (Email) | Free (100/day) | $0.00 |
| **TOTAL** | | **$0.00/month** ✨ |

**Free Tier Limits:**
- Render: 750 hours/month, auto-sleep after 15 min
- Vercel: 100 GB bandwidth/month, unlimited deploys
- Neon: 512 MB storage, 1 project
- SendGrid: 100 emails/day

---

## ⚠️ Important Notes

### Free Tier Caveats

**Render Backend:**
- Spins down after 15 min of inactivity
- Takes ~30 seconds to wake up on first request
- Solution: Use [UptimeRobot](https://uptimerobot.com) to ping every 5 min (free)

**Neon Database:**
- Suspends after 5 min of inactivity
- Resumes in ~1 second
- No action needed

**SendGrid:**
- 100 emails/day limit
- Enough for ~50 user signups per day
- Upgrade when you scale

### Monitoring (Optional but Recommended)

Set up UptimeRobot to keep your backend warm:
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor: `https://alga-backend.onrender.com/api/health`
3. Check interval: 5 minutes
4. ✅ Backend stays responsive!

---

## 🎉 After Successful Deployment

### Update URLs in Your Documents
Replace these placeholders with your actual URLs:
- `https://alga-backend.onrender.com` → Your Render URL
- `https://alga-app.vercel.app` → Your Vercel URL

### Share Your Live Site
Your site will be accessible at:
- **Public URL**: `https://alga-app.vercel.app`
- **Custom Domain**: (optional) Add via Vercel settings ($12/year)

### Monitor Performance
- **Render**: Dashboard → Metrics
- **Vercel**: Dashboard → Analytics
- **Neon**: Console → Monitoring

---

## 🚨 Troubleshooting

### Build Fails on Render
- Check logs in Render dashboard
- Verify `package.json` dependencies
- Ensure `DATABASE_URL` is set

### Frontend Can't Reach Backend
- Verify `VITE_API_URL` in Vercel env vars
- Check CORS settings (already configured)
- Test backend health endpoint

### Database Connection Error
- Verify `DATABASE_URL` format is correct
- Check Neon database is active
- Run `npm run db:push --force` if schema mismatch

### Payments Not Working
- Verify API keys in Render env vars
- Check payment provider dashboards
- Use test mode first, then switch to live

### Emails Not Sending
- Verify SendGrid API key
- Check sender email is verified in SendGrid
- Check Render logs for email errors

---

## 📚 Full Documentation

- **Complete Guide**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Checklist**: [QUICK_DEPLOY_CHECKLIST.md](./QUICK_DEPLOY_CHECKLIST.md)
- **Chapa Payments**: [CHAPA_INTEGRATION.md](./CHAPA_INTEGRATION.md)
- **Environment Variables**: [.env.production.example](./.env.production.example)

---

## ✅ Success Checklist

Before canceling Replit:
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] All environment variables configured
- [ ] Database connected and seeded
- [ ] Health check passes
- [ ] User signup/login works
- [ ] OTP emails received
- [ ] Payments processing successfully
- [ ] All features tested end-to-end
- [ ] Site accessible publicly

---

## 🔗 Quick Links

- **Deploy Backend**: [render.com](https://render.com)
- **Deploy Frontend**: [vercel.com/new](https://vercel.com/new)
- **Database**: [console.neon.tech](https://console.neon.tech)
- **Email Dashboard**: [app.sendgrid.com](https://app.sendgrid.com)
- **Payment Dashboard**: [dashboard.chapa.co](https://dashboard.chapa.co)
- **GitHub Repo**: [github.com/Alga-weyni/alga-app](https://github.com/Alga-weyni/alga-app)

---

## 🏁 Final Step: Cancel Replit Subscription

**ONLY after confirming everything works:**

1. Download important files from Replit (if any)
2. Go to [replit.com/account](https://replit.com/account)
3. Click "Subscription" tab
4. Click "Cancel Subscription"
5. Confirm cancellation

**💡 Pro Tip**: Keep Replit project as backup for 30 days before deleting

---

## 🎊 Congratulations!

Once deployed, Alga will be:
- ✅ Live and accessible globally
- ✅ Running on 100% free infrastructure
- ✅ Zero monthly hosting costs
- ✅ Auto-deploying on every push
- ✅ Fully functional with all features

**Total Deployment Time**: 30-45 minutes  
**Monthly Cost**: $0.00  
**Next**: Share your site and start welcoming guests! 🏠

---

**Ready to Deploy?** Run: `./deploy-to-production.sh`
