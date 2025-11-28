#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Config
URL="https://astroskulture.in"
API_URL="${URL}/api/products"
REFRESH_RATE=5

print_header() {
    clear
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                 ASTROS KULTURE - DETAILED MONITOR                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════════╝${NC}"
    echo -e "🕒 Time: $(date '+%Y-%m-%d %H:%M:%S') | 🖥️  Host: $(hostname)"
    echo "----------------------------------------------------------------------"
}

check_website() {
    echo -e "${CYAN}🌐 Website & API Health${NC}"
    
    # Website
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL")
    TIME_TOTAL=$(curl -s -o /dev/null -w "%{time_total}" --max-time 5 "$URL")
    
    if [ "$HTTP_CODE" == "200" ]; then
        echo -e "   ✅ Website: UP (Status: $HTTP_CODE) | Latency: ${TIME_TOTAL}s"
    else
        echo -e "   ❌ Website: DOWN (Status: $HTTP_CODE)"
    fi

    # API
    API_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$API_URL")
    if [ "$API_CODE" == "200" ]; then
        echo -e "   ✅ API:     UP (Status: $API_CODE)"
    else
        echo -e "   ❌ API:     DOWN (Status: $API_CODE)"
    fi
    echo "----------------------------------------------------------------------"
}

check_ssl() {
    echo -e "${CYAN}🔐 SSL Certificate${NC}"
    # Try to get expiry date
    if command -v certbot &> /dev/null; then
        CERT_INFO=$(sudo certbot certificates 2>/dev/null | grep -E "Certificate Name: astroskulture.in|Expiry Date" -A 1)
        if [ -n "$CERT_INFO" ]; then
            EXPIRY=$(echo "$CERT_INFO" | grep "Expiry Date" | xargs)
            echo -e "   ✅ $EXPIRY"
        else
            echo -e "   ⚠️  SSL info not available (check permissions)"
        fi
    else
        echo -e "   ⚠️  Certbot not installed"
    fi
    echo "----------------------------------------------------------------------"
}

check_pm2() {
    echo -e "${CYAN}🚀 PM2 Backend Processes${NC}"
    # Display compact PM2 status
    pm2 status astroskulture-backend | grep -E "astroskulture|id|name|mode|status|cpu|mem" | grep -v "Module"
    echo "----------------------------------------------------------------------"
}

check_system() {
    echo -e "${CYAN}📊 System Resources${NC}"
    
    # CPU
    LOAD=$(uptime | awk -F'load average:' '{ print $2 }' | xargs)
    echo -e "   ⚡ Load Average: $LOAD"
    
    # Memory
    free -h | awk '/^Mem:/ {print "   🧠 Memory:      Used: " $3 " / Total: " $2 " (Free: " $4 ")"}'
    
    # Disk
    df -h / | awk 'NR==2 {print "   💾 Disk (/):    Used: " $3 " / Total: " $2 " (" $5 " used)"}'
    
    # Network
    if command -v netstat &> /dev/null; then
        CONN_COUNT=$(netstat -an | grep ESTABLISHED | wc -l)
        echo -e "   🔌 Active Connections: $CONN_COUNT"
    fi
    echo "----------------------------------------------------------------------"
}

check_logs() {
    echo -e "${CYAN}⚠️  Recent Backend Errors (Last 3)${NC}"
    # Try to find the error log file
    LOG_FILE="/root/.pm2/logs/astroskulture-backend-error.log"
    if [ ! -f "$LOG_FILE" ]; then
        LOG_FILE="/var/www/astroskulture/logs/backend-error.log"
    fi

    if [ -f "$LOG_FILE" ]; then
        if [ -s "$LOG_FILE" ]; then
            tail -n 3 "$LOG_FILE" | sed 's/^/   /'
        else
            echo -e "   ✅ No recent errors found in log."
        fi
    else
        echo "   ⚠️  Log file not found."
    fi
    echo "----------------------------------------------------------------------"
}

run_monitor() {
    print_header
    check_website
    check_ssl
    check_pm2
    check_system
    check_logs
}

# Live loop
if [[ "$1" == "--live" || "$1" == "-l" ]]; then
    while true; do
        run_monitor
        echo -e "${BLUE}🔄 Refreshing in ${REFRESH_RATE}s... (Press Ctrl+C to exit)${NC}"
        sleep $REFRESH_RATE
    done
else
    run_monitor
    echo -e "${YELLOW}💡 Tip: Run with './monitor.sh --live' for real-time dashboard${NC}"
fi
