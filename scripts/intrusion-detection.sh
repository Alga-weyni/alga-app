#!/bin/bash

###############################################################################
# ALGA INTRUSION DETECTION SCRIPT
# Simple real-time monitoring using Replit logs and pattern detection
# 
# Usage: Run continuously in background or via workflow
# Output: Alerts to console + security log file
###############################################################################

# Configuration
LOG_DIR="./builds/security-logs"
ALERT_LOG="${LOG_DIR}/intrusion-alerts-$(date +%Y-%m-%d).log"
CHECK_INTERVAL=60  # Check every 60 seconds

# Thresholds
MAX_FAILED_LOGINS=10      # Per IP per hour
MAX_API_REQUESTS=1000     # Per IP per minute
MAX_SQL_PATTERNS=5        # Suspicious SQL patterns per hour
MAX_XSS_ATTEMPTS=5        # XSS attempts per hour

# Create log directory
mkdir -p "${LOG_DIR}"

# Initialize counters
declare -A failed_logins
declare -A api_requests
declare -A sql_attempts
declare -A xss_attempts

# Colors for console output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Log alert function
log_alert() {
    local severity=$1
    local message=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Console output
    case $severity in
        "CRITICAL")
            echo -e "${RED}🚨 [CRITICAL] ${message}${NC}"
            ;;
        "HIGH")
            echo -e "${YELLOW}⚠️  [HIGH] ${message}${NC}"
            ;;
        "MEDIUM")
            echo -e "${YELLOW}📌 [MEDIUM] ${message}${NC}"
            ;;
        "INFO")
            echo -e "${GREEN}ℹ️  [INFO] ${message}${NC}"
            ;;
    esac
    
    # File output
    echo "[${timestamp}] [${severity}] ${message}" >> "${ALERT_LOG}"
}

# Parse workflow logs for suspicious activity
check_workflow_logs() {
    local log_file="/tmp/logs/Start_application_*.log"
    
    # Only process if log files exist
    if ! ls ${log_file} 1> /dev/null 2>&1; then
        return
    fi
    
    # Get the most recent log file
    local latest_log=$(ls -t ${log_file} | head -1)
    
    # Check for security-related patterns in last 100 lines
    tail -100 "${latest_log}" | while read -r line; do
        
        # Detect failed authentication attempts
        if echo "$line" | grep -qi "unauthorized\|401"; then
            local ip=$(echo "$line" | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | head -1)
            if [ -n "$ip" ]; then
                failed_logins["$ip"]=$((${failed_logins["$ip"]:-0} + 1))
                if [ ${failed_logins["$ip"]} -gt $MAX_FAILED_LOGINS ]; then
                    log_alert "HIGH" "Brute force attempt detected from IP: $ip (${failed_logins[$ip]} failed attempts)"
                fi
            fi
        fi
        
        # Detect SQL injection attempts (from INSA hardening logs)
        if echo "$line" | grep -qi "SQL injection attempt blocked"; then
            local ip=$(echo "$line" | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | head -1)
            if [ -n "$ip" ]; then
                sql_attempts["$ip"]=$((${sql_attempts["$ip"]:-0} + 1))
                log_alert "CRITICAL" "SQL injection attempt from IP: $ip (Pattern detected)"
            fi
        fi
        
        # Detect XSS attempts
        if echo "$line" | grep -qi "XSS attempt blocked"; then
            local ip=$(echo "$line" | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | head -1)
            if [ -n "$ip" ]; then
                xss_attempts["$ip"]=$((${xss_attempts["$ip"]:-0} + 1))
                log_alert "HIGH" "XSS attack attempt from IP: $ip"
            fi
        fi
        
        # Detect NoSQL injection attempts
        if echo "$line" | grep -qi "NoSQL injection attempt blocked"; then
            local ip=$(echo "$line" | grep -oP '\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}' | head -1)
            if [ -n "$ip" ]; then
                log_alert "CRITICAL" "NoSQL injection attempt from IP: $ip"
            fi
        fi
        
        # Detect rate limiting hits
        if echo "$line" | grep -qi "rate limit\|too many requests\|429"; then
            log_alert "MEDIUM" "Rate limit exceeded - possible DoS attempt"
        fi
        
        # Detect server errors (potential exploitation)
        if echo "$line" | grep -qi "error 500\|internal server error"; then
            log_alert "MEDIUM" "Server error detected - investigate for exploitation"
        fi
        
    done
}

# Monitor browser console for client-side attacks
check_browser_logs() {
    local log_file="/tmp/logs/browser_console_*.log"
    
    # Only process if log files exist
    if ! ls ${log_file} 1> /dev/null 2>&1; then
        return
    fi
    
    # Get the most recent log file
    local latest_log=$(ls -t ${log_file} | head -1)
    
    # Check for suspicious client-side activity
    if [ -f "${latest_log}" ]; then
        # Look for common attack patterns
        if grep -qi "eval\|<script\|javascript:\|onerror=" "${latest_log}"; then
            log_alert "HIGH" "Suspicious client-side code detected in browser console"
        fi
    fi
}

# Check for unusual API access patterns
check_api_patterns() {
    local log_file="/tmp/logs/Start_application_*.log"
    
    if ! ls ${log_file} 1> /dev/null 2>&1; then
        return
    fi
    
    local latest_log=$(ls -t ${log_file} | head -1)
    
    # Count API requests per endpoint
    local api_calls=$(tail -100 "${latest_log}" | grep -c "GET /api\|POST /api\|PUT /api\|DELETE /api")
    
    if [ $api_calls -gt 500 ]; then
        log_alert "MEDIUM" "High API request volume detected: ${api_calls} calls in last 100 log lines"
    fi
}

# Main monitoring loop
main() {
    log_alert "INFO" "Intrusion detection started - monitoring every ${CHECK_INTERVAL}s"
    
    while true; do
        check_workflow_logs
        check_browser_logs
        check_api_patterns
        
        # Reset hourly counters (simple implementation)
        local current_minute=$(date +%M)
        if [ "$current_minute" == "00" ]; then
            failed_logins=()
            api_requests=()
            sql_attempts=()
            xss_attempts=()
            log_alert "INFO" "Hourly counters reset"
        fi
        
        sleep $CHECK_INTERVAL
    done
}

# Handle graceful shutdown
trap 'log_alert "INFO" "Intrusion detection stopped"; exit 0' SIGINT SIGTERM

# Run main loop
main
