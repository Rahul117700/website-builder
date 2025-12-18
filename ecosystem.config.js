module.exports = {
  apps: [
    // Main Next.js Application
    {
      name: 'website-builder',
      script: 'npm',
      args: 'start',
      cwd: '/home/rahul/website-builder',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/app-error.log',
      out_file: './logs/app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    },

    // Marketing Automation
    {
      name: 'marketing-automation',
      script: './scripts/schedule-marketing-posts.js',
      cwd: '/home/rahul/website-builder',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '200M',
      restart_delay: 5000,
      max_restarts: 10,
      min_uptime: 10000,
      autorestart: true,
      cron_restart: '0 3 * * *', // Restart daily at 3 AM (optional)
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/marketing-error.log',
      out_file: './logs/marketing-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Optional: Kill and restart if no activity for 1 hour
      listen_timeout: 3600000
    }
  ]
};

