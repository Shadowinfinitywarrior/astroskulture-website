#!/bin/bash

###############################################################################
# VPS Server Initial Setup Script for Astros Kulture
# Run this script once on a fresh Ubuntu/Debian VPS
###############################################################################

set -e  # Exit on any error

echo "🚀 Setting up VPS for Astros Kulture"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Step 1: Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt-get update
apt-get upgrade -y

# Step 2: Install Node.js 20.x LTS
echo -e "${YELLOW}📦 Installing Node.js 20.x LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify Node.js installation
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} installed!${NC}"
echo -e "${GREEN}✅ npm ${NPM_VERSION} installed!${NC}"

# Step 3: Install PM2 globally
echo -e "${YELLOW}📦 Installing PM2 process manager...${NC}"
npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd -u root --hp /root
echo -e "${GREEN}✅ PM2 installed and configured!${NC}"

# Step 4: Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
apt-get install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed and running!${NC}"

# Step 5: Install Git
echo -e "${YELLOW}📦 Installing Git...${NC}"
apt-get install -y git
GIT_VERSION=$(git --version)
echo -e "${GREEN}✅ ${GIT_VERSION} installed!${NC}"

# Step 6: Configure Firewall (UFW)
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
apt-get install -y ufw

# Allow SSH (important - don't lock yourself out!)
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
echo "y" | ufw enable

echo -e "${GREEN}✅ Firewall configured!${NC}"
ufw status

# Step 7: Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
mkdir -p /var/www/astroskulture
mkdir -p /var/www/certbot

echo -e "${GREEN}✅ Project directories created!${NC}"

# Step 8: Install build essentials (for native npm modules)
echo -e "${YELLOW}📦 Installing build essentials...${NC}"
apt-get install -y build-essential

# Step 9: Optimize system for production
echo -e "${YELLOW}⚙️  Optimizing system settings...${NC}"

# Increase file descriptor limits
cat >> /etc/security/limits.conf << EOF

# Astros Kulture production settings
*         soft    nofile      65536
*         hard    nofile      65536
root      soft    nofile      65536
root      hard    nofile      65536
EOF

# Optimize sysctl settings
cat >> /etc/sysctl.conf << EOF

# Astros Kulture network optimizations
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.ip_local_port_range = 1024 65535
net.ipv4.tcp_tw_reuse = 1
EOF

sysctl -p

echo -e "${GREEN}✅ System optimizations applied!${NC}"

# Step 10: Install additional useful tools
echo -e "${YELLOW}📦 Installing additional tools...${NC}"
apt-get install -y curl wget htop unzip

# Step 11: Display summary
echo ""
echo "================================================"
echo -e "${GREEN}✨ VPS Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📋 Installed Software:"
echo "  ✅ Node.js: $NODE_VERSION"
echo "  ✅ npm: $NPM_VERSION"
echo "  ✅ PM2: $(pm2 --version)"
echo "  ✅ Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "  ✅ Git: $GIT_VERSION"
echo ""
echo "📁 Project Directory: /var/www/astroskulture"
echo ""
echo "🔥 Firewall Status:"
ufw status numbered
echo ""
echo "📝 Next Steps:"
echo "  1. Upload your project files to /var/www/astroskulture"
echo "  2. Configure backend/.env with your production credentials"
echo "  3. Copy deployment/nginx.conf to /etc/nginx/sites-available/astroskulture"
echo "  4. Create symbolic link: ln -s /etc/nginx/sites-available/astroskulture /etc/nginx/sites-enabled/"
echo "  5. Run deployment/setup-ssl.sh to configure SSL"
echo "  6. Run deployment/deploy.sh to deploy your application"
echo ""
