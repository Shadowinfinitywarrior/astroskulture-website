# 🚀 Deployment Configuration

This directory contains all configuration files and scripts needed to deploy Astros Kulture on a production VPS server.

## 📁 Files Overview

### Configuration Files

- **`nginx.conf`** - Nginx reverse proxy configuration with SSL/HTTPS support
- **`ecosystem.config.js`** - PM2 process manager configuration for backend
- **`.env.production.backend`** - Template for backend environment variables

### Deployment Scripts

- **`server-setup.sh`** - Initial VPS server setup (Node.js, PM2, Nginx, firewall)
- **`setup-ssl.sh`** - SSL certificate setup with Let's Encrypt
- **`deploy.sh`** - Automated deployment script for updates

### Documentation

- **`QUICK_DEPLOY.md`** - Quick command reference for deployment

## 🎯 Quick Start

### First-Time Deployment

1. **Setup VPS Server**
   ```bash
   sudo ./server-setup.sh
   ```

2. **Upload Project Files**
   ```bash
   # Use git, scp, or FTP to upload to /var/www/astroskulture
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.production.backend ../backend/.env
   nano ../backend/.env  # Edit with your credentials
   ```

4. **Setup Nginx**
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/astroskulture
   sudo ln -s /etc/nginx/sites-available/astroskulture /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. **Setup SSL (after DNS configured)**
   ```bash
   sudo ./setup-ssl.sh
   ```

6. **Deploy Application**
   ```bash
   ./deploy.sh
   ```

### Regular Updates

Simply run:
```bash
./deploy.sh
```

## 📚 Full Documentation

See **[VPS_DEPLOYMENT_GUIDE.md](../VPS_DEPLOYMENT_GUIDE.md)** in the root directory for complete step-by-step instructions.

## 🔧 Requirements

- Ubuntu 20.04+ or Debian 10+ VPS
- Root/sudo access
- Domain pointing to VPS IP
- MongoDB Atlas connection string
- Razorpay production API keys

## 📝 Notes

- All scripts should be run from the VPS server
- Make scripts executable: `chmod +x *.sh`
- Update placeholder values in `.env.production.backend` before deploying
