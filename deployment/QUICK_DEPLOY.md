# Quick Deployment Commands

## First Time Setup

```bash
# 1. Connect to VPS
ssh root@YOUR_VPS_IP

# 2. Run server setup
cd /tmp && wget https://raw.githubusercontent.com/YOUR_REPO/deployment/server-setup.sh
chmod +x server-setup.sh
sudo ./server-setup.sh

# 3. Clone/upload project
cd /var/www/astroskulture
git clone YOUR_REPO_URL .

# 4. Configure environment
cp deployment/.env.production.backend backend/.env
nano backend/.env  # Edit with your credentials

# 5. Install & build
npm install
cd backend && npm install && cd ..
npm run build

# 6. Setup Nginx
sudo cp deployment/nginx.conf /etc/nginx/sites-available/astroskulture
sudo ln -s /etc/nginx/sites-available/astroskulture /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# 7. Setup SSL (after DNS is configured)
chmod +x deployment/setup-ssl.sh
sudo ./deployment/setup-ssl.sh

# 8. Start with PM2
pm2 start deployment/ecosystem.config.js --env production
pm2 save
pm2 startup systemd
```

## Regular Deployment

```bash
cd /var/www/astroskulture
chmod +x deployment/deploy.sh
./deployment/deploy.sh
```

## Monitoring

```bash
pm2 status                    # Process status
pm2 logs astroskulture-backend  # View logs
pm2 monit                     # Live monitoring
sudo systemctl status nginx   # Nginx status
```
