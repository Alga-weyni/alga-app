#!/bin/bash

# Test script for role-based login redirects
# Tests each role and verifies correct redirect page

API_URL="http://localhost:5000"
COOKIE_JAR="/tmp/cookies.txt"

echo "🧪 ALGA ROLE-BASED LOGIN TEST SIMULATION"
echo "=========================================="
echo ""

# Test helper function
test_role_redirect() {
  local email=$1
  local password=$2
  local expected_role=$3
  local expected_redirect=$4

  echo "Testing: $expected_role ($email)"
  
  # Try email login
  response=$(curl -s -X POST "$API_URL/api/auth/login/email" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$email\", \"password\": \"$password\"}" \
    -c $COOKIE_JAR)
  
  # Extract fields from response
  actual_redirect=$(echo "$response" | grep -o '"redirect":"[^"]*' | cut -d'"' -f4)
  actual_role=$(echo "$response" | grep -o '"role":"[^"]*' | cut -d'"' -f4)
  
  if [ "$actual_redirect" == "$expected_redirect" ]; then
    echo "  ✅ Redirect: $actual_redirect (correct)"
  else
    echo "  ❌ Redirect: $actual_redirect (expected: $expected_redirect)"
  fi
  
  if [ "$actual_role" == "$expected_role" ]; then
    echo "  ✅ Role: $actual_role (correct)"
  else
    echo "  ❌ Role: $actual_role (expected: $expected_role)"
  fi
  echo ""
}

# Wait for server
echo "⏳ Waiting for server to be ready..."
sleep 2

echo "Testing Login Redirects for Each Role:"
echo "======================================"
echo ""

# Note: These test accounts assume they already exist in the database
# If they don't, the endpoints will return 401
# But we can at least verify the backend is working

# Test Admin
echo "1️⃣  ADMIN USER"
test_role_redirect "admin@alga.et" "admin123" "admin" "/admin/dashboard"

# Test Operator
echo "2️⃣  OPERATOR USER"
test_role_redirect "operator@alga.et" "operator123" "operator" "/operator/dashboard"

# Test Host
echo "3️⃣  HOST USER"
test_role_redirect "host@alga.et" "host123" "host" "/host/dashboard"

# Test Agent/Dellala
echo "4️⃣  AGENT/DELLALA USER"
test_role_redirect "agent@alga.et" "agent123" "agent" "/agent-dashboard"

# Test Service Provider
echo "5️⃣  SERVICE PROVIDER USER"
test_role_redirect "provider@alga.et" "provider123" "service_provider" "/provider/dashboard"

# Test Guest/Default
echo "6️⃣  GUEST USER (default)"
test_role_redirect "guest@alga.et" "guest123" "guest" "/"

echo "=========================================="
echo "✅ Redirect Logic Test Complete"
echo ""
echo "Expected Results:"
echo "  Admin           → /admin/dashboard"
echo "  Operator        → /operator/dashboard"
echo "  Host            → /host/dashboard"
echo "  Agent/Dellala   → /agent-dashboard"
echo "  Service Provider → /provider/dashboard"
echo "  Guest           → / or /properties"
