#!/bin/bash

# Production Server Setup Script for Large File Uploads
# This script configures Nginx for 500MB file uploads

echo "🚀 Setting up production server for large file uploads..."
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo "⚠️  Please run as root (use sudo)"
  exit 1
fi

# Detect web server
if command -v nginx &> /dev/null; then
    echo "✅ Nginx detected"
    WEB_SERVER="nginx"
elif command -v apache2 &> /dev/null || command -v httpd &> /dev/null; then
    echo "✅ Apache detected"
    WEB_SERVER="apache"
else
    echo "❌ No supported web server found (Nginx or Apache required)"
    exit 1
fi

# Configure Nginx
if [ "$WEB_SERVER" = "nginx" ]; then
    echo ""
    echo "📝 Configuring Nginx..."
    
    # Backup existing config
    cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up existing Nginx config"
    
    # Check if client_max_body_size is already set
    if grep -q "client_max_body_size" /etc/nginx/nginx.conf; then
        echo "⚠️  client_max_body_size already exists in config"
        echo "   Please manually update it to 500M"
    else
        # Add to http block
        sed -i '/http {/a \    # Large file upload support\n    client_max_body_size 500M;\n    client_body_buffer_size 128k;\n    client_body_timeout 300s;\n    send_timeout 300s;' /etc/nginx/nginx.conf
        echo "✅ Added upload configuration to Nginx"
    fi
    
    # Test configuration
    echo ""
    echo "🧪 Testing Nginx configuration..."
    if nginx -t; then
        echo "✅ Nginx configuration is valid"
        
        # Ask to restart
        read -p "Restart Nginx now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            systemctl restart nginx
            echo "✅ Nginx restarted successfully"
        else
            echo "⚠️  Remember to restart Nginx: sudo systemctl restart nginx"
        fi
    else
        echo "❌ Nginx configuration test failed"
        echo "   Restoring backup..."
        cp /etc/nginx/nginx.conf.backup.$(date +%Y%m%d_%H%M%S) /etc/nginx/nginx.conf
        exit 1
    fi
fi

# Configure Apache
if [ "$WEB_SERVER" = "apache" ]; then
    echo ""
    echo "📝 Configuring Apache..."
    
    # Detect Apache config location
    if [ -f /etc/apache2/apache2.conf ]; then
        APACHE_CONF="/etc/apache2/apache2.conf"
    elif [ -f /etc/httpd/conf/httpd.conf ]; then
        APACHE_CONF="/etc/httpd/conf/httpd.conf"
    else
        echo "❌ Could not find Apache configuration file"
        exit 1
    fi
    
    # Backup existing config
    cp $APACHE_CONF ${APACHE_CONF}.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backed up existing Apache config"
    
    # Add configuration
    echo "" >> $APACHE_CONF
    echo "# Large file upload support" >> $APACHE_CONF
    echo "LimitRequestBody 524288000" >> $APACHE_CONF
    echo "Timeout 300" >> $APACHE_CONF
    echo "✅ Added upload configuration to Apache"
    
    # Test configuration
    echo ""
    echo "🧪 Testing Apache configuration..."
    if apachectl configtest; then
        echo "✅ Apache configuration is valid"
        
        # Ask to restart
        read -p "Restart Apache now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            systemctl restart apache2 || systemctl restart httpd
            echo "✅ Apache restarted successfully"
        else
            echo "⚠️  Remember to restart Apache: sudo systemctl restart apache2"
        fi
    else
        echo "❌ Apache configuration test failed"
        echo "   Restoring backup..."
        cp ${APACHE_CONF}.backup.$(date +%Y%m%d_%H%M%S) $APACHE_CONF
        exit 1
    fi
fi

echo ""
echo "✅ Server configuration complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Ensure your Next.js app is built and deployed"
echo "   2. Set environment variables (see PRODUCTION_UPLOAD_CONFIG.md)"
echo "   3. Configure S3 for persistent storage (recommended)"
echo "   4. Test file upload with a small image first"
echo ""
echo "📖 For more details, see: docs/PRODUCTION_UPLOAD_CONFIG.md"
