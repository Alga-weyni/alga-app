#!/bin/bash

###############################################################################
# ALGA WEEKLY SECURITY AUDIT SCRIPT
# Automated vulnerability scanning and compliance reporting
# 
# Usage: Run manually or via cron job every Monday at 9:00 AM
# Schedule: 0 9 * * 1 /path/to/security-audit-weekly.sh
###############################################################################

# Configuration
REPORT_DIR="./builds/security-reports"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="${REPORT_DIR}/security-audit-${TIMESTAMP}.txt"

# Create reports directory if it doesn't exist
mkdir -p "${REPORT_DIR}"

# Start audit report
echo "════════════════════════════════════════════════════════════" | tee "${REPORT_FILE}"
echo "🛡️  ALGA WEEKLY SECURITY AUDIT REPORT" | tee -a "${REPORT_FILE}"
echo "════════════════════════════════════════════════════════════" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"
echo "📅 Generated: $(date)" | tee -a "${REPORT_FILE}"
echo "🔍 Scan Type: Automated Weekly Vulnerability Assessment" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# 1. NPM AUDIT
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "1️⃣  NPM VULNERABILITY SCAN" | tee -a "${REPORT_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Run npm audit and capture both JSON and human-readable output
npm audit --json > "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" 2>&1
npm audit 2>&1 | tee -a "${REPORT_FILE}"

# Parse and summarize critical findings
CRITICAL=$(cat "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" | grep -o '"critical":[0-9]*' | grep -o '[0-9]*')
HIGH=$(cat "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" | grep -o '"high":[0-9]*' | grep -o '[0-9]*')
MODERATE=$(cat "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" | grep -o '"moderate":[0-9]*' | grep -o '[0-9]*')
LOW=$(cat "${REPORT_DIR}/npm-audit-${TIMESTAMP}.json" | grep -o '"low":[0-9]*' | grep -o '[0-9]*')

echo "" | tee -a "${REPORT_FILE}"
echo "📊 Summary:" | tee -a "${REPORT_FILE}"
echo "   • Critical: ${CRITICAL:-0}" | tee -a "${REPORT_FILE}"
echo "   • High: ${HIGH:-0}" | tee -a "${REPORT_FILE}"
echo "   • Moderate: ${MODERATE:-0}" | tee -a "${REPORT_FILE}"
echo "   • Low: ${LOW:-0}" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# 2. SECURITY CONFIGURATION CHECK
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "2️⃣  SECURITY CONFIGURATION AUDIT" | tee -a "${REPORT_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Check INSA hardening file
if [ -f "server/security/insa-hardening.ts" ]; then
    echo "✅ INSA hardening module: Present" | tee -a "${REPORT_FILE}"
else
    echo "❌ INSA hardening module: MISSING" | tee -a "${REPORT_FILE}"
fi

# Check security audit script
if [ -f "server/security/audit.ts" ]; then
    echo "✅ Security audit script: Present" | tee -a "${REPORT_FILE}"
else
    echo "❌ Security audit script: MISSING" | tee -a "${REPORT_FILE}"
fi

# Check environment variables
if [ -n "${DATABASE_URL}" ]; then
    echo "✅ Database URL: Configured" | tee -a "${REPORT_FILE}"
else
    echo "⚠️  Database URL: Not configured" | tee -a "${REPORT_FILE}"
fi

echo "" | tee -a "${REPORT_FILE}"

# 3. DEPENDENCY CHECK
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "3️⃣  DEPENDENCY FRESHNESS" | tee -a "${REPORT_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Check for outdated security packages
echo "🔍 Checking critical security packages..." | tee -a "${REPORT_FILE}"
npm outdated helmet cors express-rate-limit hpp xss-clean express-mongo-sanitize 2>&1 | tee -a "${REPORT_FILE}" || echo "All security packages up to date" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# 4. COMPLIANCE STATUS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "4️⃣  INSA COMPLIANCE STATUS" | tee -a "${REPORT_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Run INSA security audit if available
if [ -f "server/security/audit.ts" ]; then
    echo "Running INSA compliance check..." | tee -a "${REPORT_FILE}"
    tsx server/security/audit.ts 2>&1 | tee -a "${REPORT_FILE}"
else
    echo "⚠️  INSA audit script not found" | tee -a "${REPORT_FILE}"
fi

echo "" | tee -a "${REPORT_FILE}"

# 5. RECOMMENDATIONS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "5️⃣  RECOMMENDATIONS" | tee -a "${REPORT_FILE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Generate recommendations based on findings
if [ "${CRITICAL:-0}" -gt 0 ] || [ "${HIGH:-0}" -gt 0 ]; then
    echo "🚨 URGENT: Critical or high severity vulnerabilities detected!" | tee -a "${REPORT_FILE}"
    echo "   → Run 'npm audit fix' immediately" | tee -a "${REPORT_FILE}"
    echo "   → Review breaking changes before deployment" | tee -a "${REPORT_FILE}"
    echo "" | tee -a "${REPORT_FILE}"
fi

if [ "${MODERATE:-0}" -gt 0 ]; then
    echo "⚠️  MODERATE: Moderate severity vulnerabilities detected" | tee -a "${REPORT_FILE}"
    echo "   → Schedule fix within 7 days" | tee -a "${REPORT_FILE}"
    echo "" | tee -a "${REPORT_FILE}"
fi

if [ "${CRITICAL:-0}" -eq 0 ] && [ "${HIGH:-0}" -eq 0 ] && [ "${MODERATE:-0}" -eq 0 ]; then
    echo "✅ GOOD: No critical, high, or moderate vulnerabilities" | tee -a "${REPORT_FILE}"
    echo "   → Continue weekly monitoring" | tee -a "${REPORT_FILE}"
    echo "" | tee -a "${REPORT_FILE}"
fi

echo "📝 Next Actions:" | tee -a "${REPORT_FILE}"
echo "   1. Review full report at: ${REPORT_FILE}" | tee -a "${REPORT_FILE}"
echo "   2. Address any critical/high vulnerabilities" | tee -a "${REPORT_FILE}"
echo "   3. Update outdated security packages" | tee -a "${REPORT_FILE}"
echo "   4. Share report with INSA if required" | tee -a "${REPORT_FILE}"
echo "" | tee -a "${REPORT_FILE}"

# Footer
echo "════════════════════════════════════════════════════════════" | tee -a "${REPORT_FILE}"
echo "✅ Audit Complete - Report saved to:" | tee -a "${REPORT_FILE}"
echo "   ${REPORT_FILE}" | tee -a "${REPORT_FILE}"
echo "════════════════════════════════════════════════════════════" | tee -a "${REPORT_FILE}"

# Cleanup old reports (keep last 12 weeks)
find "${REPORT_DIR}" -name "security-audit-*.txt" -type f -mtime +84 -delete
find "${REPORT_DIR}" -name "npm-audit-*.json" -type f -mtime +84 -delete

echo ""
echo "📧 Email this report to: security@alga.app (to be configured)"
echo "🔗 Submit to INSA if required for compliance"

exit 0
