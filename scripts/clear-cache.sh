#!/bin/bash

echo "🧹 Clearing all caches..."

# Stop the application
echo "⏹️  Stopping PM2 application..."
pm2 stop website-builder

# Clear Next.js build cache
echo "🗑️  Clearing Next.js build cache..."
rm -rf .next/cache
rm -rf .next

# Clear PM2 logs
echo "📝 Clearing PM2 logs..."
pm2 flush

# Clear any system caches
echo "🔄 Restarting system journal..."
sudo systemctl restart systemd-journald

# Clear npm cache (optional)
echo "📦 Clearing npm cache..."
npm cache clean --force

# Rebuild the application
echo "🔨 Rebuilding application..."
npm run build

# Restart the application
echo "🚀 Restarting PM2 application..."
pm2 start website-builder --update-env

echo "✅ Cache clearing complete!"
echo "📊 Check PM2 status: pm2 status"
echo "📝 Watch logs: pm2 log website-builder --lines 100"
