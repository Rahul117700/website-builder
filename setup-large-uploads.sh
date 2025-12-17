#!/bin/bash

# 🚀 VPS Setup Script for Large File Uploads (500MB)
# Run this on your VPS server

echo "=================================="
echo "🚀 Setting up Large File Uploads"
echo "=================================="
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo "⚠️  Please run with sudo: sudo bash setup-large-uploads.sh"
    exit 1
fi

# Backup existing Nginx config
echo "📦 Creating backup of Nginx config..."
cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Check if client_max_body_size already exists in nginx.conf
if grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
    echo "⚠️  client_max_body_size already exists in nginx.conf"
    echo "   Please update it manually to: client_max_body_size 500M;"
else
    # Add client_max_body_size to http block
    echo "✅ Adding client_max_body_size to nginx.conf..."
    sed -i '/http {/a \    # Allow large file uploads\n    client_max_body_size 500M;\n    client_body_buffer_size 16M;\n    client_body_timeout 300s;\n' /etc/nginx/nginx.conf
fi

# Test Nginx configuration
echo ""
echo "🧪 Testing Nginx configuration..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid!"
    
    # Restart Nginx
    echo ""
    echo "🔄 Restarting Nginx..."
    systemctl restart nginx
    
    if [ $? -eq 0 ]; then
        echo "✅ Nginx restarted successfully!"
    else
        echo "❌ Failed to restart Nginx"
        exit 1
    fi
else
    echo "❌ Nginx configuration test failed!"
    echo "   Restoring backup..."
    cp /etc/nginx/nginx.conf.backup.* /etc/nginx/nginx.conf
    exit 1
fi

# Check if site-specific config exists
echo ""
echo "📝 Checking for site-specific Nginx config..."

SITE_CONFIG=""
if [ -f "/etc/nginx/sites-available/default" ]; then
    SITE_CONFIG="/etc/nginx/sites-available/default"
elif [ -f "/etc/nginx/sites-enabled/default" ]; then
    SITE_CONFIG="/etc/nginx/sites-enabled/default"
fi

if [ -n "$SITE_CONFIG" ]; then
    echo "Found site config: $SITE_CONFIG"
    echo ""
    echo "📌 MANUAL STEP REQUIRED:"
    echo "   Add this to your server block in $SITE_CONFIG:"
    echo ""
    echo "   client_max_body_size 500M;"
    echo "   client_body_timeout 300s;"
    echo ""
    echo "   For upload endpoints, add:"
    echo ""
    echo "   location /api/products/upload {"
    echo "       proxy_pass http://localhost:3000;"
    echo "       client_max_body_size 500M;"
    echo "       proxy_request_buffering off;"
    echo "       proxy_read_timeout 600s;"
    echo "   }"
    echo ""
fi

# Check Nginx status
echo ""
echo "📊 Nginx Status:"
systemctl status nginx --no-pager -l

echo ""
echo "=================================="
echo "✅ Setup Complete!"
echo "=================================="
echo ""
echo "📋 What was done:"
echo "  ✓ Backed up Nginx config"
echo "  ✓ Added client_max_body_size 500M"
echo "  ✓ Added timeout configurations"
echo "  ✓ Restarted Nginx"
echo ""
echo "📋 Next Steps:"
echo "  1. Pull latest code: cd ~/website-builder && git pull"
echo "  2. Rebuild app: npm run build"
echo "  3. Restart app: pm2 restart all"
echo "  4. Test upload with a large file"
echo ""
echo "📝 To view Nginx config:"
echo "  cat /etc/nginx/nginx.conf | grep -A 5 'client_max_body_size'"
echo ""
echo "🔍 To check logs:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo "  pm2 logs"
echo ""

