# 🛠️ Alga Deployment Scripts

This directory contains automation scripts to help with Alga deployment.

---

## 📜 Available Scripts

### `deploy-prepare.sh` - Semi-Automated Deployment Preparation

**Purpose**: Automates local preparation tasks before web-based deployment

**What it does**:
1. ✅ Checks environment variables (DATABASE_URL)
2. ✅ Installs dependencies
3. ✅ Builds production bundle
4. ✅ Initializes database schema
5. ✅ Seeds test data
6. ✅ Commits and pushes to GitHub
7. ✅ Shows next steps for web-based deployment

**What it does NOT do** (you do this in browser):
- ❌ Deploy to Render (safer to do manually)
- ❌ Deploy to Vercel (safer to do manually)
- ❌ Expose secrets in code (uses environment variables)

---

## 🚀 How to Use

### Prerequisites

1. **Set DATABASE_URL** in Replit Secrets or .env file:
   ```bash
   DATABASE_URL=postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
   ```

2. **(Optional) Set SENDGRID_API_KEY** for email OTPs:
   ```bash
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   ```

### Run the Script

**Option 1: From Replit Shell**
```bash
bash scripts/deploy-prepare.sh
```

**Option 2: Make executable and run**
```bash
chmod +x scripts/deploy-prepare.sh
./scripts/deploy-prepare.sh
```

**Option 3: Direct execution**
```bash
cd scripts
bash deploy-prepare.sh
```

---

## 📋 What Happens When You Run It

```
🚀 Alga Deployment Preparation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Step 1: Checking environment variables...
✅ DATABASE_URL is set

📦 Step 2: Installing dependencies...
✅ Dependencies installed

🧱 Step 3: Building production bundle...
✅ Production build created

🗄️  Step 4: Initializing database...
✅ Database schema synchronized
✅ Test data seeded

📤 Step 5: Committing to GitHub...
✅ Code pushed to GitHub

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ LOCAL PREPARATION COMPLETE!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 NEXT: Web-Based Deployment
[Shows detailed steps for Render & Vercel]
```

---

## ⚠️ Important Notes

### Environment Variables

**DO NOT hardcode secrets in scripts!** Always use:

1. **Replit Secrets** (Recommended):
   - Tools → Secrets → Add DATABASE_URL

2. **Local .env file** (Alternative):
   ```bash
   # .env (make sure it's in .gitignore!)
   DATABASE_URL=postgresql://...
   SENDGRID_API_KEY=SG.xxx
   ```

3. **Export in shell** (Temporary):
   ```bash
   export DATABASE_URL="postgresql://..."
   export SENDGRID_API_KEY="SG.xxx"
   bash scripts/deploy-prepare.sh
   ```

### Security Best Practices

✅ **DO:**
- Use environment variables
- Keep .env files in .gitignore
- Use Replit Secrets for sensitive data
- Generate strong SESSION_SECRET: `openssl rand -hex 32`

❌ **DON'T:**
- Hardcode secrets in scripts
- Commit .env files to GitHub
- Share DATABASE_URL publicly
- Use weak session secrets

---

## 🆘 Troubleshooting

### "DATABASE_URL not set"
```bash
# Solution 1: Add to Replit Secrets
Tools → Secrets → Add DATABASE_URL

# Solution 2: Export in shell
export DATABASE_URL="postgresql://user:pass@host/db"
```

### "Build failed"
```bash
# Check for errors
npm run build

# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### "Database push failed"
```bash
# Try force push
npm run db:push -- --force

# Or manually
npx drizzle-kit push --force
```

### "Git push failed"
```bash
# Setup GitHub remote first
git remote add origin https://github.com/username/alga-app.git

# Or use Replit's Version Control panel
# Tools → Version Control → Create GitHub repo
```

---

## 📚 Related Documentation

After running this script, follow these guides:

1. **QUICK_DEPLOY.md** - Fast deployment reference
2. **MIGRATE_TO_PRODUCTION.md** - Complete deployment guide
3. **DEPLOYMENT_CHECKLIST.md** - Verification checklist
4. **YOUR_DEPLOYMENT_URLS.md** - Track your live URLs

---

## 🎯 Complete Deployment Flow

```
┌─────────────────────────────────────────┐
│ 1. Run deploy-prepare.sh               │
│    (Automated local preparation)       │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 2. Deploy to Render                     │
│    (Web interface - 10 min)             │
│    → Backend API                        │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 3. Deploy to Vercel                     │
│    (Web interface - 10 min)             │
│    → Frontend UI                        │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 4. Verify & Test                        │
│    → Sign up/login                      │
│    → Browse properties                  │
│    → Test booking flow                  │
└─────────────┬───────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│ 5. Cancel Replit Subscription           │
│    ✅ You're live on free hosting!      │
└─────────────────────────────────────────┘
```

---

## 💡 Tips

1. **Run this script first** before deploying to Render/Vercel
2. **Wait for completion** - don't interrupt the database seeding
3. **Check the output** for any errors or warnings
4. **Copy the next steps** shown at the end
5. **Follow QUICK_DEPLOY.md** for the web-based deployment

---

## 🎉 Success Criteria

You'll know it worked when you see:

```
✅ LOCAL PREPARATION COMPLETE!
🎉 You're ready for production deployment!
💰 Total cost: $0/month on free tier hosting
```

Then just follow the displayed next steps to complete your deployment!

---

**Created by**: Weyni Abraha  
**Last Updated**: October 2025  
**Version**: 1.1
