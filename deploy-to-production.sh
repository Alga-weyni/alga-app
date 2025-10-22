#!/bin/bash

# ==============================================
# ALGA - Zero-Cost Production Deployment Script
# ==============================================

set -e  # Exit on error

echo "🚀 Starting Alga Production Deployment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean and verify
echo "📦 Step 1: Verifying project..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    exit 1
fi

# Step 2: Test production build
echo ""
echo "🔨 Step 2: Testing production build..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Fix errors before deploying.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Step 3: Check Git status
echo ""
echo "📝 Step 3: Checking Git repository..."

# Remove lock file if exists
if [ -f ".git/index.lock" ]; then
    echo "🔓 Removing stale git lock..."
    rm -f .git/index.lock
fi

git status

# Step 4: Stage all changes
echo ""
echo "📥 Step 4: Staging changes for commit..."
git add .

# Step 5: Commit
echo ""
echo "💾 Step 5: Creating deployment commit..."
COMMIT_MSG="Production deployment - Zero-cost infrastructure ($(date '+%Y-%m-%d %H:%M:%S'))"
git commit -m "$COMMIT_MSG" || echo "No changes to commit"

# Step 6: Push to GitHub
echo ""
echo "🌐 Step 6: Pushing to GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Git push failed!${NC}"
    echo "Please check your GitHub credentials and try again."
    exit 1
fi

echo -e "${GREEN}✅ Code pushed to GitHub successfully!${NC}"

# Step 7: Display next steps
echo ""
echo "================================================"
echo -e "${GREEN}✅ PRE-DEPLOYMENT COMPLETE!${NC}"
echo "================================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1️⃣  Deploy Backend to Render:"
echo "   → Visit: https://render.com/deploy"
echo "   → Connect: alga-app repository"
echo "   → Follow: DEPLOYMENT_GUIDE.md (Step 2)"
echo ""
echo "2️⃣  Deploy Frontend to Vercel:"
echo "   → Visit: https://vercel.com/new"
echo "   → Import: alga-app repository"
echo "   → Follow: DEPLOYMENT_GUIDE.md (Step 3)"
echo ""
echo "3️⃣  Seed Database:"
echo "   → After backend deploys, run: npm run seed"
echo "   → Via Render Shell or locally with production DB"
echo ""
echo "4️⃣  Test Live Site:"
echo "   → Test complete user flow"
echo "   → Verify OTP, bookings, payments"
echo ""
echo "📚 Full instructions in: DEPLOYMENT_GUIDE.md"
echo ""
echo "================================================"
echo -e "${GREEN}🎉 Ready for Production Deployment!${NC}"
echo "================================================"
