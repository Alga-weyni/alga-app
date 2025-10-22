# 🌐 ALGA - YOUR PRODUCTION URLS

**Fill this out after deployment**

---

## 🔗 LIVE URLS

### Frontend (Users access here)
```
https://alga-app-[your-project-id].vercel.app
```

**Custom Domain** (optional):
```
https://algaapp.com (after DNS setup)
```

---

### Backend API
```
https://alga-backend.onrender.com
```

**API Endpoints**:
- Properties: `https://alga-backend.onrender.com/api/properties`
- Health Check: `https://alga-backend.onrender.com/api/health`

**Custom API Domain** (optional):
```
https://api.algaapp.com (after DNS setup)
```

---

### Database
**Neon Dashboard**:
```
https://console.neon.tech/app/projects/[your-project-id]
```

**Connection String** (keep private):
```
postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## 👥 TEST ACCOUNTS

### Admin Account
```
Email: ethiopianstay@gmail.com
Role: Administrator
Dashboard: /admin
```

### Host Account
```
Email: winnieaman94@gmail.com
Name: Weyni Abraha
Role: Property Host
Dashboard: /host
```

### Guest Account
```
Create any guest during testing
Just sign up with any email
```

---

## 🔑 DEPLOYMENT DASHBOARDS

### Render (Backend)
```
https://dashboard.render.com/
→ Your Web Service: alga-backend
→ View logs, metrics, environment variables
```

### Vercel (Frontend)
```
https://vercel.com/dashboard
→ Your Project: alga-app
→ View deployments, analytics, settings
```

### Neon (Database)
```
https://console.neon.tech/
→ Your Project: alga-production
→ View tables, queries, storage usage
```

---

## 📊 MONITORING LINKS

### Performance
- **Frontend**: https://vercel.com/[user]/alga-app/analytics
- **Backend**: https://dashboard.render.com/web/[service-id]
- **Database**: https://console.neon.tech/app/projects/[project-id]/monitoring

### Logs
- **Render Logs**: Dashboard → alga-backend → Logs tab
- **Vercel Logs**: Dashboard → alga-app → Deployments → View Function Logs
- **Database Logs**: Neon Console → Monitoring → Query Insights

---

## 🚀 QUICK ACTIONS

### Redeploy
```bash
# Push to GitHub (auto-deploys)
git add .
git commit -m "Update"
git push origin main

# ✅ Vercel: Auto-deploys in ~2 min
# ✅ Render: Auto-deploys in ~3 min
```

### View Logs
```bash
# Render: Dashboard → Logs tab (live stream)
# Vercel: Dashboard → Deployments → Latest → View Logs
# Database: Neon Console → Monitoring
```

### Update Environment Variables
```bash
# Render: Dashboard → Environment tab → Add/Edit
# Vercel: Dashboard → Settings → Environment Variables
# Database: Cannot change connection string (create new DB instead)
```

---

## 📱 SHARE YOUR APP

**For Testing**:
```
🔗 Try Alga: https://alga-app-xxxxx.vercel.app
📧 Test Login: Use any email, get OTP
🏠 Browse Properties: No login required
```

**For Production** (after custom domain):
```
🌍 Visit: https://algaapp.com
🇪🇹 Experience Ethiopian hospitality
```

---

## 🆘 TROUBLESHOOTING SHORTCUTS

### Backend Down?
```
1. Check: https://dashboard.render.com/
2. View logs in Logs tab
3. Verify environment variables
4. Restart service if needed
```

### Frontend Errors?
```
1. Check: https://vercel.com/dashboard
2. View deployment logs
3. Check browser console (F12)
4. Verify VITE_API_BASE_URL setting
```

### Database Issues?
```
1. Check: https://console.neon.tech/
2. Verify connection string
3. Check storage limits (0.5GB free)
4. View query performance
```

---

## 💾 BACKUP & RECOVERY

### Database Backups
```
Neon automatically backs up your database
Recovery: Neon Console → Backups → Restore
```

### Code Backups
```
GitHub: https://github.com/[username]/alga-app
All deployments are versioned (can rollback)
```

### Rollback Deployment
```
Vercel: Dashboard → Deployments → Previous → Promote
Render: Dashboard → Manual Deploy → Select commit
```

---

## 📈 UPGRADE PATHS

### When You Need More:

**Render Pro** ($7/month):
- ✅ No sleep time (always-on)
- ✅ Faster CPU
- ✅ More memory
- Upgrade: Dashboard → Upgrade Instance

**Vercel Pro** ($20/month):
- ✅ Team collaboration
- ✅ Advanced analytics
- ✅ More bandwidth
- Upgrade: Dashboard → Settings → Upgrade

**Neon Pro** ($19/month):
- ✅ 10GB storage
- ✅ Better performance
- ✅ More projects
- Upgrade: Console → Billing → Upgrade

---

## 🎯 DEPLOYMENT VERIFICATION

After deployment, check these URLs work:

- [ ] Frontend: `https://your-vercel-url.vercel.app`
- [ ] API Health: `https://your-render-url.onrender.com/api/health`
- [ ] API Properties: `https://your-render-url.onrender.com/api/properties`
- [ ] Sign Up Flow: Can create account
- [ ] Login Flow: Can login with OTP
- [ ] Browse Properties: See listings
- [ ] Admin Dashboard: Access with admin email
- [ ] Host Dashboard: Access with host email

---

## 🌟 SUCCESS!

**You now have**:
✅ Live website accessible worldwide  
✅ Scalable backend API  
✅ Secure PostgreSQL database  
✅ Auto-deployment from GitHub  
✅ $0/month hosting costs  

**Start onboarding users!** 🎉

---

**Last Updated**: October 22, 2025  
**Deployment Status**: Ready  
**Next**: Follow QUICK_DEPLOY.md to fill in your URLs!
