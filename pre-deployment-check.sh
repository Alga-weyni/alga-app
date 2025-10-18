#!/bin/bash
echo "🇪🇹 Ethiopia Stays - Pre-Deployment Checklist"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1️⃣ Check Required Secrets
echo "📋 Step 1: Checking Required Secrets..."
echo ""

REQUIRED_SECRETS=(
  "DATABASE_URL"
  "SESSION_SECRET"
  "STRIPE_SECRET_KEY"
  "VITE_STRIPE_PUBLIC_KEY"
  "STRIPE_WEBHOOK_SECRET"
  "TELEBIRR_APP_ID"
  "TELEBIRR_API_KEY"
  "PAYPAL_CLIENT_ID"
  "PAYPAL_SECRET"
  "BASE_URL"
)

MISSING_COUNT=0
for SECRET in "${REQUIRED_SECRETS[@]}"; do
  if [ -z "${!SECRET}" ]; then
    echo -e "${RED}❌ Missing: $SECRET${NC}"
    MISSING_COUNT=$((MISSING_COUNT + 1))
  else
    echo -e "${GREEN}✅ Found: $SECRET${NC}"
  fi
done

echo ""
if [ $MISSING_COUNT -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Warning: $MISSING_COUNT secret(s) missing${NC}"
  echo "   Add them in: Tools → Secrets"
  echo ""
fi

# 2️⃣ Check Server Health
echo "📋 Step 2: Checking Development Server..."
echo ""

if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Server is running on port 5000${NC}"
  
  # Check health endpoint details
  HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
  echo "   Response: $HEALTH_RESPONSE"
else
  echo -e "${RED}❌ Server not responding${NC}"
  echo "   Run: npm run dev"
fi

echo ""

# 3️⃣ Check Database Connection
echo "📋 Step 3: Checking Database Connection..."
echo ""

if [ -n "$DATABASE_URL" ]; then
  echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
  echo "   Database should be connected"
else
  echo -e "${RED}❌ DATABASE_URL not found${NC}"
fi

echo ""

# 4️⃣ Check Payment Integration Status
echo "📋 Step 4: Payment Integration Status..."
echo ""

if [ -n "$STRIPE_SECRET_KEY" ] && [ -n "$VITE_STRIPE_PUBLIC_KEY" ]; then
  echo -e "${GREEN}✅ Stripe configured${NC}"
else
  echo -e "${YELLOW}⚠️  Stripe not fully configured${NC}"
fi

if [ -n "$TELEBIRR_APP_ID" ] && [ -n "$TELEBIRR_API_KEY" ]; then
  echo -e "${GREEN}✅ Telebirr configured${NC}"
else
  echo -e "${YELLOW}⚠️  Telebirr not configured${NC}"
fi

if [ -n "$PAYPAL_CLIENT_ID" ] && [ -n "$PAYPAL_SECRET" ]; then
  echo -e "${GREEN}✅ PayPal configured${NC}"
else
  echo -e "${YELLOW}⚠️  PayPal not configured${NC}"
fi

echo ""

# 5️⃣ Dependencies Check
echo "📋 Step 5: Checking Dependencies..."
echo ""

if [ -d "node_modules" ]; then
  echo -e "${GREEN}✅ Node modules installed${NC}"
else
  echo -e "${RED}❌ Node modules missing${NC}"
  echo "   Run: npm install"
fi

echo ""

# 6️⃣ File Structure Check
echo "📋 Step 6: Checking Project Structure..."
echo ""

REQUIRED_FILES=(
  "package.json"
  "vite.config.ts"
  "server/routes.ts"
  "client/src/App.tsx"
  "shared/schema.ts"
)

for FILE in "${REQUIRED_FILES[@]}"; do
  if [ -f "$FILE" ]; then
    echo -e "${GREEN}✅ $FILE${NC}"
  else
    echo -e "${RED}❌ Missing: $FILE${NC}"
  fi
done

echo ""
echo "=============================================="
echo "🎯 Summary"
echo "=============================================="
echo ""

if [ $MISSING_COUNT -eq 0 ]; then
  echo -e "${GREEN}✅ All secrets configured!${NC}"
else
  echo -e "${YELLOW}⚠️  $MISSING_COUNT secret(s) need attention${NC}"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Fix any ❌ or ⚠️  issues above"
echo "2. Click 'Deploy' button in Replit UI"
echo "3. Select 'Autoscale Deployment'"
echo "4. Configure and publish"
echo ""
echo "📖 Full guide: PAYMENT_INTEGRATION_GUIDE.md"
echo ""
