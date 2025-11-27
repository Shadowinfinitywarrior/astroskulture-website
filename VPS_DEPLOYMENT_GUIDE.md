# 🚀 VPS Deployment Guide for Astros Kulture

Complete guide to deploy your Astros Kulture e-commerce website on **Hostinger VPS** with domain **https://astroskulture.in/** for 24/7 uptime.

---

## 📋 Prerequisites Checklist

Before starting deployment, ensure you have:

- [x] **Hostinger VPS** with root/SSH access
- [ ] **Domain**: astroskulture.in pointed to VPS IP (A record)
- [ ] **MongoDB Atlas** connection string with VPS IP whitelisted
- [ ] **Razorpay** production API keys (key_id and key_secret)
- [ ] **Cloudinary** account credentials (optional, for image hosting)
- [ ] **Email** for SSL certificate notifications

---

## 🌐 Step 1: Configure DNS Settings

> [!IMPORTANT]
> DNS changes can take up to 24-48 hours to propagate, but usually complete within 1-2 hours.

### 1.1 Add A Records

Log into your domain registrar (where you purchased astroskulture.in) and add these DNS records:

```
Type: A
Name: @
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600

Type: A  
Name: www
Value: YOUR_VPS_IP_ADDRESS
TTL: 3600
```

### 1.2 Verify DNS Propagation

Wait 10-15 minutes, then check if DNS is working:

```bash
nslookup astroskulture.in
nslookup www.astroskulture.in
```

Both should return your VPS IP address.

---

## 🖥️ Step 2: Initial VPS Setup

### 2.1 Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2.2 Run Server Setup Script

This installs Node.js, PM2, Nginx, and configures the system:

```bash
# Download and run setup script
curl -o- https://raw.githubusercontent.com/YOUR_REPO/deployment/server-setup.sh | bash
```

**Or manually:**

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt-get install -y nginx

# Configure firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Create project directory
sudo mkdir -p /var/www/astroskulture
sudo mkdir -p /var/www/certbot
```

---

## 📦 Step 3: Upload Your Project

### Option A: Using Git (Recommended)

```bash
cd /var/www/astroskulture

# Clone your repository
git clone https://github.com/YOUR_USERNAME/astroskulture-website.git .

# Or if already cloned, pull latest changes
git pull origin main
```

### Option B: Using SCP/SFTP

From your local machine:

```bash
# Navigate to your local project directory
cd c:\Users\Dell\Downloads\astroskulture-website-main

# Upload to VPS
scp -r * root@YOUR_VPS_IP:/var/www/astroskulture/
```

### Option C: Using FileZilla or WinSCP

1. Open FileZilla/WinSCP
2. Connect to your VPS (IP, username: root, password)
3. Upload entire project folder to `/var/www/astroskulture`

---

## ⚙️ Step 4: Configure Environment Variables

### 4.1 Backend Environment Variables

```bash
cd /var/www/astroskulture/backend

# Copy template and edit
cp ../deployment/.env.production.backend .env
nano .env
```

**Update these values:**

```bash
# MongoDB (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/astroskulture

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your_generated_secret_here

# Razorpay Production Keys
RAZORPAY_KEY_ID=rzp_live_RgHCMPiF6byxqC
RAZORPAY_KEY_SECRET=your_razorpay_secret_key

# Cloudinary (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Save:** Press `Ctrl+X`, then `Y`, then `Enter`

### 4.2 Frontend Environment Variables

Already configured in `.env.production`:

```bash
VITE_API_BASE_URL=https://astroskulture.in/api
VITE_RAZORPAY_KEY_ID=rzp_live_RgHCMPiF6byxqC
VITE_ENVIRONMENT=production
```

### 4.3 MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas → Network Access
2. Add your VPS IP address to whitelist
3. Or use `0.0.0.0/0` for access from anywhere (less secure)

---

## 🔧 Step 5: Install Dependencies and Build

```bash
cd /var/www/astroskulture

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Build frontend for production
npm run build
```

**Verify build succeeded:**

```bash
ls -lh dist/
# Should show index.html and assets folder
```

---

## 🌐 Step 6: Configure Nginx

### 6.1 Copy Nginx Configuration

```bash
# Copy configuration file
sudo cp /var/www/astroskulture/deployment/nginx.conf /etc/nginx/sites-available/astroskulture

# Create symbolic link
sudo ln -s /etc/nginx/sites-available/astroskulture /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t
```

### 6.2 Temporary HTTP Configuration

For initial setup (before SSL), temporarily modify the Nginx config:

```bash
sudo nano /etc/nginx/sites-available/astroskulture
```

Comment out the HTTPS server block (lines 21-99) and keep only HTTP redirect disabled for now.

```bash
# Reload Nginx
sudo systemctl reload nginx
```

---

## 🔒 Step 7: Setup SSL Certificate

> [!IMPORTANT]
> Your domain DNS MUST be pointing to your VPS before running this step!

### 7.1 Run SSL Setup Script

```bash
cd /var/www/astroskulture
chmod +x deployment/setup-ssl.sh
sudo ./deployment/setup-ssl.sh
```

This will:
- Install Certbot
- Obtain SSL certificate from Let's Encrypt
- Configure automatic renewal
- Update Nginx configuration

### 7.2 Verify SSL

```bash
# Check certificate
sudo certbot certificates

# Test your site
curl -I https://astroskulture.in
```

Visit https://astroskulture.in in your browser - you should see a secure padlock icon! 🔒

---

## 🚀 Step 8: Deploy Application with PM2

### 8.1 Start PM2 Process

```bash
cd /var/www/astroskulture

# Start backend with PM2
pm2 start deployment/ecosystem.config.js --env production

# Save PM2 process list
pm2 save

# Configure PM2 to start on server reboot
pm2 startup systemd
# Run the command it outputs
```

### 8.2 Verify Everything is Running

```bash
# Check PM2 status
pm2 status

# Check backend logs
pm2 logs astroskulture-backend --lines 50

# Check if backend is responding
curl http://localhost:5000/api/products

# Check Nginx status
sudo systemctl status nginx
```

---

## ✅ Step 9: Final Verification

### 9.1 Test Your Website

Visit these URLs and verify they work:

1. **Homepage**: https://astroskulture.in
2. **Shop Page**: https://astroskulture.in/shop
3. **API Health**: https://astroskulture.in/api/products
4. **Admin Panel**: https://astroskulture.in/admin

### 9.2 Test Core Functionality

- [ ] Browse products
- [ ] Add items to cart
- [ ] User registration
- [ ] User login
- [ ] Checkout process
- [ ] Admin login
- [ ] Admin dashboard

---

## 🔄 Step 10: Future Deployments

For subsequent updates, use the automated deployment script:

```bash
cd /var/www/astroskulture

# Make script executable
chmod +x deployment/deploy.sh

# Run deployment
./deployment/deploy.sh
```

This script automatically:
- Pulls latest code (if using git)
- Installs dependencies
- Builds frontend
- Restarts PM2 processes
- Reloads Nginx

---

## 📊 Monitoring & Maintenance

### PM2 Commands

```bash
# View process status
pm2 status

# View logs
pm2 logs astroskulture-backend

# View real-time monitoring
pm2 monit

# Restart application
pm2 restart astroskulture-backend

# Stop application
pm2 stop astroskulture-backend

# View detailed info
pm2 info astroskulture-backend
```

### Nginx Commands

```bash
# Test configuration
sudo nginx -t

# Reload Nginx (zero downtime)
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### System Monitoring

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU and processes
htop

# Check open ports
sudo netstat -tulpn
```

---

## 🔍 Troubleshooting

### Issue: Website Not Loading

**Check Nginx:**
```bash
sudo systemctl status nginx
sudo nginx -t
sudo journalctl -u nginx -n 50
```

**Check DNS:**
```bash
nslookup astroskulture.in
```

### Issue: API Not Working

**Check Backend:**
```bash
pm2 status
pm2 logs astroskulture-backend
curl http://localhost:5000/api/products
```

**Check MongoDB Connection:**
```bash
pm2 logs astroskulture-backend | grep -i mongo
```

### Issue: SSL Certificate Problems

**Renew Certificate:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Check Certificate Status:**
```bash
sudo certbot certificates
```

### Issue: 502 Bad Gateway

This means Nginx can't connect to backend:

```bash
# Check if backend is running
pm2 status

# Check backend port
netstat -tulpn | grep 5000

# Restart backend
pm2 restart astroskulture-backend
```

### Issue: Out of Memory

```bash
# Check memory
free -h

# Restart PM2 with memory limit
pm2 restart astroskulture-backend --max-memory-restart 500M
```

---

## 🔐 Security Best Practices

### 1. Change SSH Port

```bash
sudo nano /etc/ssh/sshd_config
# Change Port 22 to Port 2222
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

### 2. Disable Root Login

```bash
# Create new sudo user first!
adduser deployuser
usermod -aG sudo deployuser

# Then disable root
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

### 3. Enable Automatic Security Updates

```bash
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

### 4. Setup Fail2Ban (Prevents Brute Force)

```bash
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 5. Regular Backups

**MongoDB:** Use MongoDB Atlas automatic backups

**Code:** Use Git repository as backup

**Environment Files:** 
```bash
# Backup .env files (store securely)
tar -czf env-backup-$(date +%Y%m%d).tar.gz backend/.env .env.production
```

---

## 📈 Performance Optimization

### 1. Enable Nginx Caching

Add to Nginx config:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m;
```

### 2. Enable PM2 Cluster Mode

Already configured in `ecosystem.config.js` with 2 instances!

### 3. Database Indexing

Ensure MongoDB indexes are created for frequently queried fields.

### 4. CDN for Static Assets (Optional)

Consider using Cloudflare CDN for even faster loading.

---

## 🆘 Support Commands Quick Reference

```bash
# Complete system status
pm2 status && sudo systemctl status nginx && free -h && df -h

# View all logs
pm2 logs astroskulture-backend --lines 100 && sudo tail -50 /var/log/nginx/error.log

# Full restart
pm2 restart astroskulture-backend && sudo systemctl restart nginx

# Check SSL expiry
sudo certbot certificates | grep -i expire

# Test website health
curl -I https://astroskulture.in
curl https://astroskulture.in/api/products
```

---

## 🎉 Congratulations!

Your Astros Kulture e-commerce website is now live at **https://astroskulture.in** with:

✅ 24/7 uptime with PM2 auto-restart  
✅ HTTPS/SSL security  
✅ Nginx reverse proxy  
✅ Production-optimized configuration  
✅ Automatic SSL renewal  
✅ Cluster mode for high availability  

**Your site is production-ready!** 🚀
