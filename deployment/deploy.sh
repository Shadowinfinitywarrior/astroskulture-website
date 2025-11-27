#!/bin/bash

###############################################################################
# Astros Kulture Deployment Script
# This script automates the deployment process on your VPS
###############################################################################

set -e  # Exit on any error

echo "🚀 Starting Astros Kulture Deployment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/astroskulture"
BACKEND_DIR="$PROJECT_DIR/backend"
NGINX_CONFIG="/etc/nginx/sites-available/astroskulture"

# Step 1: Navigate to project directory
echo -e "${YELLOW}📁 Navigating to project directory...${NC}"
cd "$PROJECT_DIR" || exit 1

# Step 2: Pull latest code (if using git)
if [ -d ".git" ]; then
    echo -e "${YELLOW}📥 Pulling latest code from git...${NC}"
    git pull origin main
fi

# Step 3: Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install --production=false

# Step 4: Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd "$BACKEND_DIR"
npm install --production

# Step 5: Build frontend
echo -e "${YELLOW}🔨 Building frontend for production...${NC}"
cd "$PROJECT_DIR"
npm run build

# Verify build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! dist directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend build successful!${NC}"

# Step 6: Ensure environment files are in place
echo -e "${YELLOW}🔐 Checking environment files...${NC}"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo -e "${RED}⚠️  Warning: Backend .env file not found!${NC}"
    echo -e "${YELLOW}Please copy deployment/.env.production.backend to backend/.env${NC}"
fi

if [ ! -f ".env.production" ]; then
    echo -e "${RED}⚠️  Warning: Frontend .env.production file not found!${NC}"
fi

# Step 7: Create logs directory if it doesn't exist
echo -e "${YELLOW}📝 Setting up logs directory...${NC}"
mkdir -p "$PROJECT_DIR/logs"

# Step 8: Restart PM2 processes
echo -e "${YELLOW}♻️  Restarting PM2 processes...${NC}"
cd "$PROJECT_DIR"

# Check if PM2 is running the app
if pm2 list | grep -q "astroskulture-backend"; then
    echo -e "${YELLOW}Reloading existing PM2 process...${NC}"
    pm2 reload ecosystem.config.js --env production
else
    echo -e "${YELLOW}Starting new PM2 process...${NC}"
    pm2 start ecosystem.config.js --env production
fi

# Save PM2 process list
pm2 save

echo -e "${GREEN}✅ PM2 processes restarted!${NC}"

# Step 9: Reload Nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}✅ Nginx reloaded!${NC}"

# Step 10: Show status
echo ""
echo "================================================"
echo -e "${GREEN}✨ Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "🌐 Your website should now be live at: https://astroskulture.in"
echo ""
echo "📊 Check status with:"
echo "  - PM2 status:     pm2 status"
echo "  - PM2 logs:       pm2 logs astroskulture-backend"
echo "  - Nginx status:   sudo systemctl status nginx"
echo ""
echo "🔍 Monitor your application:"
echo "  - PM2 monitoring: pm2 monit"
echo "  - Backend logs:   pm2 logs astroskulture-backend --lines 50"
echo ""
