# ⚡ Alga - Quick Deployment Commands

**Fast reference for deployment commands**

---

## 🚀 OPTION 1: Semi-Automated Preparation (Recommended)

### Run the preparation script:
```bash
bash scripts/deploy-prepare.sh
```

This will:
- ✅ Check environment variables
- ✅ Install dependencies
- ✅ Build production bundle
- ✅ Initialize database
- ✅ Seed test data
- ✅ Push to GitHub
- ✅ Show next steps for Render/Vercel

---

## 🔐 Generate Secrets

### Create SESSION_SECRET:
```bash
bash scripts/generate-secrets.sh
```

Or manually:
```bash
openssl rand -hex 32
```

Or with Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🗄️ Database Commands

### Push schema to database:
```bash
npm run db:push
```

### Force push (if warnings):
```bash
npm run db:push -- --force
```

### Seed test data:
```bash
npm run seed
```

### Reset database (careful!):
```bash
npm run db:push -- --force
npm run seed
```

---

## 🏗️ Build Commands

### Build for production:
```bash
npm run build
```

### Test production build locally:
```bash
npm run build
npm run start
```

### Clean and rebuild:
```bash
rm -rf dist node_modules
npm install
npm run build
```

---

## 📤 Git Commands

### Commit and push:
Use Replit's **Version Control** panel:
- Tools → Version Control → Commit & Push

Or via shell (manual):
```bash
# Note: Replit handles git automatically
# Just use the Version Control panel!
```

---

## 🌐 Deployment URLs (Fill in after deployment)

### Your Live URLs:
```
Frontend: https://alga-app-xxxxx.vercel.app
Backend:  https://alga-backend.onrender.com
Database: https://console.neon.tech (dashboard)
```

---

## 🔧 Environment Variables

### For Render (Backend):
```env
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require
NODE_ENV=production
SESSION_SECRET=<generated-64-char-hex>
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@algaapp.com
```

### For Vercel (Frontend):
```env
VITE_API_BASE_URL=https://alga-backend.onrender.com
```

---

## ✅ Verification Commands

### Check if backend is running:
```bash
curl https://alga-backend.onrender.com/api/properties
```

### Check database connection:
```bash
psql $DATABASE_URL -c "SELECT count(*) FROM properties;"
```

### View logs:
```bash
# Render: Dashboard → Logs tab
# Vercel: Dashboard → Deployments → View Logs
```

---

## 🆘 Troubleshooting

### Backend not starting?
```bash
# Check Render logs
# Verify DATABASE_URL is correct
# Ensure build completed
```

### Frontend showing errors?
```bash
# Verify VITE_API_BASE_URL
# Check browser console (F12)
# Ensure backend is running
```

### Database errors?
```bash
# Force push schema
npm run db:push -- --force

# Reseed data
npm run seed
```

---

## 📚 Full Documentation

- **QUICK_DEPLOY.md** - 30-minute deployment guide
- **MIGRATE_TO_PRODUCTION.md** - Complete step-by-step
- **DEPLOYMENT_CHECKLIST.md** - Verification checklist
- **scripts/README.md** - Script usage guide

---

**Quick Start**: `bash scripts/deploy-prepare.sh` then follow QUICK_DEPLOY.md
