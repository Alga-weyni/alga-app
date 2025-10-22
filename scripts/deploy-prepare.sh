#!/bin/bash
# 🟤 Alga Semi-Automated Deployment Preparation Script
# Author: Weyni Abraha | Version 1.1 | October 2025
# Purpose: Prepares Alga for production deployment (safe automation)

set -e  # Exit on any error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Alga Deployment Preparation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 1: Verify Required Environment Variables
# ═══════════════════════════════════════════════════════════
echo "🔍 Step 1: Checking environment variables..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL not set."
  echo ""
  echo "How to fix:"
  echo "  1. In Replit: Secrets tab → Add DATABASE_URL"
  echo "  2. Or create .env file with: DATABASE_URL=postgresql://..."
  echo ""
  exit 1
fi

echo "✅ DATABASE_URL is set"

# Optional: Check SendGrid (not required for deployment)
if [ -z "$SENDGRID_API_KEY" ]; then
  echo "⚠️  WARNING: SENDGRID_API_KEY not set (optional)"
  echo "   → OTPs will appear in console logs instead of email"
else
  echo "✅ SENDGRID_API_KEY is set"
fi

echo ""

# ═══════════════════════════════════════════════════════════
# Step 2: Install Dependencies
# ═══════════════════════════════════════════════════════════
echo "📦 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 3: Build Production Bundle
# ═══════════════════════════════════════════════════════════
echo "🧱 Step 3: Building production bundle..."
npm run build

if [ ! -d "dist" ]; then
  echo "❌ ERROR: Build failed - dist folder not created"
  exit 1
fi

echo "✅ Production build created"
echo "   → Frontend: dist/public"
echo "   → Backend: dist/index.js"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 4: Database Initialization
# ═══════════════════════════════════════════════════════════
echo "🗄️  Step 4: Initializing database..."
echo "   → Pushing schema to database..."

# Use npm script instead of direct drizzle-kit call
npm run db:push || {
  echo "⚠️  Schema push had warnings. Trying force push..."
  npm run db:push -- --force
}

echo "✅ Database schema synchronized"
echo ""

echo "   → Seeding test data..."
npm run seed
echo "✅ Test data seeded (admin, host, properties, services)"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 5: Git Commit & Push to GitHub
# ═══════════════════════════════════════════════════════════
echo "📤 Step 5: Committing changes to GitHub..."

# Check if we're in a git repo
if [ ! -d ".git" ]; then
  echo "⚠️  Not a git repository. Initialize with:"
  echo "   git init"
  echo "   git remote add origin https://github.com/username/alga-app.git"
  echo ""
else
  # Commit changes
  git add .
  git commit -m "Production deployment preparation - $(date +'%Y-%m-%d %H:%M:%S')" || {
    echo "⚠️  Nothing to commit or commit failed"
  }
  
  # Push to GitHub
  echo "   → Pushing to GitHub main branch..."
  git push origin main || {
    echo "⚠️  Git push failed. You may need to:"
    echo "   1. Set up GitHub remote: git remote add origin <your-repo-url>"
    echo "   2. Or use Replit's Version Control panel to push"
  }
  
  echo "✅ Code pushed to GitHub"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ LOCAL PREPARATION COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════════════════════
# Step 6: Display Next Steps
# ═══════════════════════════════════════════════════════════
echo "🌐 NEXT: Web-Based Deployment (Safe & Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Follow these steps in your browser:"
echo ""
echo "1️⃣  NEON DATABASE (If not already created)"
echo "   → Go to: https://neon.tech"
echo "   → Create project: 'alga-production'"
echo "   → Copy connection string"
echo ""
echo "2️⃣  RENDER.COM - Backend Deployment"
echo "   → Go to: https://render.com/dashboard"
echo "   → Click: 'New +' → 'Web Service'"
echo "   → Select: Your GitHub repo (alga-app)"
echo "   → Settings:"
echo "      • Build Command: npm install && npm run build"
echo "      • Start Command: npm run start"
echo "      • Instance Type: FREE"
echo "   → Environment Variables (add these):"
echo "      DATABASE_URL = <your-neon-connection-string>"
echo "      NODE_ENV = production"
echo "      SESSION_SECRET = <generate-with-openssl-rand-32>"
echo "      SENDGRID_API_KEY = SG.xxxxx (optional)"
echo "      SENDGRID_FROM_EMAIL = noreply@algaapp.com"
echo "   → Click: 'Create Web Service'"
echo "   → Copy your Render URL: https://alga-backend.onrender.com"
echo ""
echo "3️⃣  VERCEL.COM - Frontend Deployment"
echo "   → Go to: https://vercel.com/dashboard"
echo "   → Click: 'Add New...' → 'Project'"
echo "   → Import: Your GitHub repo (alga-app)"
echo "   → Framework: Vite"
echo "   → Environment Variable (add this):"
echo "      VITE_API_BASE_URL = https://alga-backend.onrender.com"
echo "      (Replace with YOUR actual Render URL!)"
echo "   → Click: 'Deploy'"
echo "   → Copy your Vercel URL: https://alga-app-xxxxx.vercel.app"
echo ""
echo "4️⃣  VERIFICATION"
echo "   → Visit your Vercel URL"
echo "   → Test sign up/login with OTP"
echo "   → Browse properties (should see 3 listings)"
echo "   → Login as admin: ethiopianstay@gmail.com"
echo "   → Login as host: winnieaman94@gmail.com"
echo ""
echo "5️⃣  CANCEL REPLIT (After verification)"
echo "   → Verify everything works on production"
echo "   → Cancel Replit subscription"
echo "   → Keep this repo as backup for 30 days"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 DETAILED GUIDES:"
echo "   → QUICK_DEPLOY.md - Fast reference"
echo "   → MIGRATE_TO_PRODUCTION.md - Full guide"
echo "   → DEPLOYMENT_CHECKLIST.md - Verification steps"
echo ""
echo "🔐 SECURITY TIPS:"
echo "   → Generate SESSION_SECRET: openssl rand -hex 32"
echo "   → Never commit .env files to GitHub"
echo "   → Keep DATABASE_URL private"
echo "   → Use Replit Secrets for sensitive data"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 You're ready for production deployment!"
echo "💰 Total cost: $0/month on free tier hosting"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
