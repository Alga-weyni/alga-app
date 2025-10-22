#!/bin/bash
# Test script for seed endpoint
# Usage: ./scripts/test-seed-endpoint.sh YOUR_PRODUCTION_URL YOUR_ADMIN_SEED_KEY

PRODUCTION_URL="${1:-http://127.0.0.1:5000}"
ADMIN_SEED_KEY="${2:-620022a4bf154fa88e322f4af3c2b04ed2342a384b0ae6cd1a7f4cf087aa4933}"

echo "🌱 Testing Production Seed Endpoint"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL: $PRODUCTION_URL/api/admin/seed-database"
echo "Key: ${ADMIN_SEED_KEY:0:20}..."
echo ""

RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$PRODUCTION_URL/api/admin/seed-database" \
  -H "Authorization: Bearer $ADMIN_SEED_KEY" \
  -H "Content-Type: application/json")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')

echo "Response ($HTTP_STATUS):"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
echo ""

case $HTTP_STATUS in
  200)
    echo "✅ SUCCESS - Database seeded successfully!"
    ;;
  400)
    echo "⚠️  WARNING - Database already contains properties"
    ;;
  403)
    echo "❌ ERROR - Unauthorized (check ADMIN_SEED_KEY)"
    ;;
  500)
    echo "❌ ERROR - Server error (check environment variables)"
    ;;
  *)
    echo "❌ UNKNOWN STATUS - Check server logs"
    ;;
esac
