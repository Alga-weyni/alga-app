#!/bin/bash
# 🔐 Generate Secure Secrets for Alga Deployment
# Author: Weyni Abraha | Version 1.0 | October 2025

echo "🔐 Alga Secrets Generator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate SESSION_SECRET (32 bytes = 64 hex chars)
echo "🔑 Generating SESSION_SECRET (32 bytes)..."
SESSION_SECRET=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
echo "✅ Generated!"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 YOUR SECRETS (Copy to Render Environment Variables)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "SESSION_SECRET=$SESSION_SECRET"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   → Save this SESSION_SECRET securely"
echo "   → Add to Render dashboard under Environment Variables"
echo "   → Never commit this to GitHub"
echo "   → Use Replit Secrets for sensitive data"
echo ""
echo "📋 Add these to Render.com:"
echo ""
echo "   DATABASE_URL = <your-neon-connection-string>"
echo "   NODE_ENV = production"
echo "   SESSION_SECRET = $SESSION_SECRET"
echo "   SENDGRID_API_KEY = SG.xxxxx (optional)"
echo "   SENDGRID_FROM_EMAIL = noreply@algaapp.com"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
