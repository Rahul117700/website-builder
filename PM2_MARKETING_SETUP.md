# 🚀 PM2 Setup for Marketing Automation

Since you're already running PM2 on your server, setting up marketing automation is super easy!

## ⚡ Quick Start (3 Commands)

```bash
# 1. Start the marketing automation
pm2 start scripts/schedule-marketing-posts.js --name "marketing-automation"

# 2. Save the PM2 process list
pm2 save

# 3. Done! It will run 24/7 automatically
pm2 list
```

---

## 📋 Complete Setup Steps

### Step 1: Add Environment Variables

First, make sure your `.env` file has the marketing variables:

```bash
# Edit .env file
nano .env

# Add these lines:
DEVTO_API_KEY=your_devto_key
HASHNODE_API_KEY=your_hashnode_key
HASHNODE_PUBLICATION_ID=your_publication_id
POST_INTERVAL_HOURS=24
ENABLED_PLATFORMS=devto,hashnode
```

### Step 2: Install Dependencies

```bash
cd ~/website-builder
npm install axios dotenv
```

### Step 3: Test the Script

```bash
# Test a single post first
node scripts/auto-post-marketing.js
```

If you see posts being created, you're good to go!

### Step 4: Start with PM2

```bash
# Start the scheduler
pm2 start scripts/schedule-marketing-posts.js --name "marketing-automation"

# Alternative: Use ecosystem file (recommended - see below)
pm2 start ecosystem.config.js --only marketing-automation
```

### Step 5: Save PM2 Configuration

```bash
# Save so it restarts on server reboot
pm2 save

# Enable PM2 startup (if not already done)
pm2 startup
# Run the command it gives you (with sudo)
```

---

## 🎛️ PM2 Commands Reference

### View Status
```bash
# List all PM2 processes
pm2 list

# Detailed info about marketing automation
pm2 info marketing-automation

# View logs
pm2 logs marketing-automation

# View only marketing logs
pm2 logs marketing-automation --lines 50
```

### Control the Process
```bash
# Stop marketing automation
pm2 stop marketing-automation

# Restart (after updating .env or code)
pm2 restart marketing-automation

# Delete from PM2
pm2 delete marketing-automation

# Reload (zero-downtime restart)
pm2 reload marketing-automation
```

### Monitor
```bash
# Real-time monitoring dashboard
pm2 monit

# Check if it's running
pm2 status marketing-automation

# View error logs
pm2 logs marketing-automation --err

# View output logs
pm2 logs marketing-automation --out
```

---

## 📝 Recommended: Ecosystem File

Create `ecosystem.config.js` in your project root:

```javascript
module.exports = {
  apps: [
    {
      name: 'website-builder',
      script: 'npm',
      args: 'start',
      cwd: '/home/rahul/website-builder',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'marketing-automation',
      script: './scripts/schedule-marketing-posts.js',
      cwd: '/home/rahul/website-builder',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 0 * * *', // Restart daily at midnight (optional)
      max_memory_restart: '200M',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/marketing-error.log',
      out_file: './logs/marketing-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};
```

Then use:

```bash
# Start all apps
pm2 start ecosystem.config.js

# Or just marketing automation
pm2 start ecosystem.config.js --only marketing-automation

# Update and reload
pm2 reload ecosystem.config.js
```

---

## 🔍 Monitoring & Logs

### View Real-time Logs
```bash
# Follow logs in real-time
pm2 logs marketing-automation --lines 100

# Only errors
pm2 logs marketing-automation --err --lines 50

# Specific date range
pm2 logs marketing-automation --lines 200 | grep "2024-12-18"
```

### Check Resource Usage
```bash
# Memory and CPU usage
pm2 monit

# Detailed process info
pm2 describe marketing-automation

# Show process stats
pm2 show marketing-automation
```

### Log Files Location
```bash
# PM2 stores logs here:
~/.pm2/logs/

# View marketing logs
cat ~/.pm2/logs/marketing-automation-out.log
cat ~/.pm2/logs/marketing-automation-error.log

# Or use your custom log location if using ecosystem.config.js
cat logs/marketing-out.log
cat logs/marketing-error.log
```

---

## 🔄 Update Workflow

When you update the code or .env:

```bash
# 1. Navigate to project
cd ~/website-builder

# 2. Pull latest changes (if using git)
git pull

# 3. Restart the process
pm2 restart marketing-automation

# 4. Check if it's working
pm2 logs marketing-automation --lines 20
```

---

## 🛠️ Troubleshooting

### Process Not Starting
```bash
# Check PM2 status
pm2 status

# View detailed error
pm2 logs marketing-automation --err --lines 50

# Try starting manually to see errors
node scripts/schedule-marketing-posts.js
```

### Environment Variables Not Loading
```bash
# Make sure .env file is in the correct location
ls -la .env

# Check if dotenv is installed
npm list dotenv

# Restart PM2 after .env changes
pm2 restart marketing-automation
```

### High Memory Usage
```bash
# Check memory
pm2 monit

# Restart if needed
pm2 restart marketing-automation

# Set max memory in ecosystem.config.js
# max_memory_restart: '200M'
```

### Script Stops Unexpectedly
```bash
# Check error logs
pm2 logs marketing-automation --err

# Enable auto-restart on crash
pm2 start scripts/schedule-marketing-posts.js \
  --name "marketing-automation" \
  --max-restarts 10 \
  --min-uptime 5000
```

---

## 📊 Verify It's Working

### Check Recent Posts
```bash
# View the log file
cat scripts/marketing-posts-log.json | jq '.'

# See last 5 posts
cat scripts/marketing-posts-log.json | jq '.[-5:]'

# Count total posts
cat scripts/marketing-posts-log.json | jq 'length'
```

### Check Posted Articles
```bash
# View cycle tracking
cat scripts/posted-articles.json | jq '.'
```

### Check PM2 Dashboard
```bash
# Web-based dashboard (optional)
pm2 install pm2-server-monit

# Then access: http://your-server-ip:9615
```

---

## ⚙️ Configuration Tips

### Change Posting Frequency

Edit `.env`:
```bash
# Post every 12 hours
POST_INTERVAL_HOURS=12

# Post every 2 days
POST_INTERVAL_HOURS=48

# Post weekly
POST_INTERVAL_HOURS=168
```

Then restart:
```bash
pm2 restart marketing-automation
```

### Change Platforms

Edit `.env`:
```bash
# Both platforms
ENABLED_PLATFORMS=devto,hashnode

# Only Dev.to
ENABLED_PLATFORMS=devto

# With WordPress
ENABLED_PLATFORMS=devto,hashnode,wordpress
```

Then restart:
```bash
pm2 restart marketing-automation
```

---

## 🔐 Security Best Practices

### Protect Your .env File
```bash
# Set proper permissions
chmod 600 .env

# Ensure it's in .gitignore
grep ".env" .gitignore
```

### Rotate API Keys Periodically
```bash
# 1. Get new API keys from platforms
# 2. Update .env file
# 3. Restart PM2
pm2 restart marketing-automation
```

---

## 📈 Performance Optimization

### Reduce Memory Usage
In `ecosystem.config.js`:
```javascript
{
  max_memory_restart: '150M',
  node_args: '--max-old-space-size=256'
}
```

### Automatic Daily Restart
In `ecosystem.config.js`:
```javascript
{
  cron_restart: '0 3 * * *' // Restart at 3 AM daily
}
```

---

## 🎯 Complete PM2 Setup Script

Create `setup-pm2-marketing.sh`:

```bash
#!/bin/bash

echo "🚀 Setting up Marketing Automation with PM2..."

# Navigate to project
cd ~/website-builder

# Install dependencies
npm install axios dotenv

# Start with PM2
pm2 start scripts/schedule-marketing-posts.js --name "marketing-automation"

# Save PM2 list
pm2 save

# Show status
pm2 list

echo "✅ Marketing automation is now running!"
echo "📊 View logs: pm2 logs marketing-automation"
echo "🛑 Stop: pm2 stop marketing-automation"
echo "🔄 Restart: pm2 restart marketing-automation"
```

Run it:
```bash
chmod +x setup-pm2-marketing.sh
./setup-pm2-marketing.sh
```

---

## ✅ Quick Verification Checklist

```bash
# 1. Is process running?
pm2 list | grep marketing

# 2. Any errors?
pm2 logs marketing-automation --err --lines 10

# 3. Did it post anything?
cat scripts/marketing-posts-log.json | jq '.[-1]'

# 4. Is it scheduled correctly?
pm2 describe marketing-automation | grep "uptime"
```

All green? You're good to go! 🎉

---

## 📱 Monitor from Anywhere (Optional)

### PM2 Plus (Free Monitoring)
```bash
# Sign up: https://app.pm2.io/
pm2 plus

# Link your server
pm2 link <secret-key> <public-key>

# Now monitor from web dashboard
```

### Email Notifications on Errors
```bash
# Install PM2 notify
pm2 install pm2-notify

# Configure email alerts
pm2 set pm2-notify:email your@email.com
```

---

## 🆘 Common Issues & Solutions

### Issue: "Cannot find module 'dotenv'"
```bash
npm install dotenv
pm2 restart marketing-automation
```

### Issue: "API key invalid"
```bash
# Check .env file
cat .env | grep API_KEY

# Verify keys are correct (no extra spaces)
# Restart after fixing
pm2 restart marketing-automation
```

### Issue: "Process keeps restarting"
```bash
# Check what's failing
pm2 logs marketing-automation --err --lines 50

# Test manually
node scripts/schedule-marketing-posts.js
```

### Issue: "Posts not appearing"
```bash
# Check if script is actually running
pm2 logs marketing-automation --lines 20

# Verify environment variables
pm2 env marketing-automation

# Check posting interval (might be too long)
cat .env | grep POST_INTERVAL
```

---

## 🎉 You're All Set!

Your marketing automation is now running 24/7 with PM2!

**Key Commands to Remember:**
```bash
pm2 list                        # Check status
pm2 logs marketing-automation   # View logs
pm2 restart marketing-automation # Restart after changes
pm2 monit                       # Real-time monitoring
```

**What Happens Now:**
- ✅ Script runs continuously
- ✅ Posts every 24 hours automatically
- ✅ Cycles through all articles
- ✅ Restarts if it crashes
- ✅ Survives server reboots (if pm2 startup is configured)

Monitor your traffic in Google Analytics and watch it grow! 📈

