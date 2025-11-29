// PM2 Ecosystem Configuration for Astros Kulture Backend
// This manages the Node.js backend process for 24/7 uptime

module.exports = {
  apps: [
    {
      name: 'astroskulture-backend',
      script: '../backend/src/server.js',
      instances: 2,
      exec_mode: 'cluster',

      // Environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },

      // Auto-restart configuration
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',

      // Logging
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Restart settings
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,

      // Advanced options
      kill_timeout: 5000,
      listen_timeout: 3000,
      shutdown_with_message: true,

      // Merge logs from all instances
      merge_logs: true,

      // Source map support
      source_map_support: true,

      // Instance variables for cluster mode
      instance_var: 'INSTANCE_ID'
    }
  ],

  // Deployment configuration (optional - for PM2 deploy feature)
  deploy: {
    production: {
      user: 'root',
      host: 'YOUR_VPS_IP',
      ref: 'origin/main',
      repo: 'YOUR_GIT_REPO_URL',
      path: '/var/www/astroskulture',
      'post-deploy': 'npm run install:all && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-deploy-local': '',
      'post-setup': ''
    }
  }
};
