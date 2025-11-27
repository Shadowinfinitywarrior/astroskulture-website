#!/bin/bash

###############################################################################
# SSL Certificate Setup Script for Astros Kulture
# This script obtains and configures Let's Encrypt SSL certificate
###############################################################################

set -e  # Exit on any error

echo "🔒 Setting up SSL Certificate for astroskulture.in"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="astroskulture.in"
WWW_DOMAIN="www.astroskulture.in"
EMAIL="admin@astroskulture.in"  # Change this to your email

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Install Certbot if not already installed
echo -e "${YELLOW}📦 Checking for Certbot installation...${NC}"
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}Installing Certbot...${NC}"
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✅ Certbot installed!${NC}"
else
    echo -e "${GREEN}✅ Certbot already installed!${NC}"
fi

# Step 2: Create webroot directory for verification
echo -e "${YELLOW}📁 Creating webroot directory for verification...${NC}"
mkdir -p /var/www/certbot

# Step 3: Obtain SSL certificate
echo -e "${YELLOW}🔐 Obtaining SSL certificate from Let's Encrypt...${NC}"
echo -e "${YELLOW}Note: Make sure your DNS is pointing to this server!${NC}"

certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL certificate obtained successfully!${NC}"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo "  1. Your domain DNS is pointing to this server's IP"
    echo "  2. Ports 80 and 443 are open in your firewall"
    echo "  3. Nginx is running and accessible"
    exit 1
fi

# Step 4: Test Nginx configuration
echo -e "${YELLOW}🧪 Testing Nginx configuration...${NC}"
nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx configuration is valid!${NC}"
    
    # Reload Nginx
    echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded!${NC}"
else
    echo -e "${RED}❌ Nginx configuration test failed${NC}"
    exit 1
fi

# Step 5: Set up automatic renewal
echo -e "${YELLOW}⚙️  Setting up automatic certificate renewal...${NC}"

# Create renewal hook script
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF

chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

# Test renewal process
echo -e "${YELLOW}🧪 Testing automatic renewal...${NC}"
certbot renew --dry-run

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Automatic renewal configured successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Renewal test had issues, but certificate is still valid${NC}"
fi

# Display certificate information
echo ""
echo "================================================"
echo -e "${GREEN}✨ SSL Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📜 Certificate Details:"
certbot certificates
echo ""
echo "🔒 Your website is now accessible via HTTPS:"
echo "   https://$DOMAIN"
echo "   https://$WWW_DOMAIN"
echo ""
echo "♻️  Certificate will auto-renew before expiration"
echo "📅 Let's Encrypt certificates are valid for 90 days"
echo ""
echo "🔍 Verify your SSL setup:"
echo "   Visit: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
echo ""
