# Production Server Configuration for File Uploads

## Overview
This guide covers all the necessary configurations for your production server to handle large file uploads (up to 500MB) for profile pictures and cover images.

**📌 Using a Load Balancer?** See [LOAD_BALANCER_CONFIG.md](./LOAD_BALANCER_CONFIG.md) for detailed configuration of Nginx, HAProxy, AWS ALB, and Cloudflare load balancers.

## 1. Next.js Configuration (Already Done)

The `next.config.js` file has been configured with:

```javascript
experimental: {
  serverActions: {
    allowedOrigins: ['*'],
    bodySizeLimit: '500mb', // 500MB upload limit
  },
}
```

## 2. Production Server Configuration

Depending on your hosting provider, you need to configure the following:

### A. Nginx Configuration (if using Nginx)

Add these settings to your Nginx configuration file (usually `/etc/nginx/nginx.conf` or `/etc/nginx/sites-available/your-site`):

```nginx
http {
    # Increase client body size limit to 500MB
    client_max_body_size 500M;
    
    # Increase buffer sizes for large uploads
    client_body_buffer_size 128k;
    
    # Increase timeout for large uploads
    client_body_timeout 300s;
    send_timeout 300s;
    
    # Increase proxy timeouts
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    server {
        listen 80;
        server_name your-domain.com;
        
        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            
            # Important: Set max body size for this location
            client_max_body_size 500M;
        }
    }
}
```

**After editing, restart Nginx:**
```bash
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### B. Apache Configuration (if using Apache)

Add to your `.htaccess` or Apache config:

```apache
# Increase upload limit to 500MB
LimitRequestBody 524288000

# Increase timeout
Timeout 300
```

Or in your VirtualHost configuration:

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    # Increase upload limit
    LimitRequestBody 524288000
    
    # Increase timeout
    Timeout 300
    
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
</VirtualHost>
```

**After editing, restart Apache:**
```bash
sudo apachectl configtest  # Test configuration
sudo systemctl restart apache2
```

### C. PM2 Configuration (if using PM2)

Create or update your `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'website-builder',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Increase Node.js memory limit if needed
      NODE_OPTIONS: '--max-old-space-size=4096'
    }
  }]
}
```

### D. Vercel Configuration

Create or update `vercel.json`:

```json
{
  "functions": {
    "app/api/upload/route.ts": {
      "maxDuration": 60,
      "memory": 3008
    }
  },
  "headers": [
    {
      "source": "/api/upload",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

**Note:** Vercel has a 4.5MB limit on Hobby plan. You need **Pro plan** for larger uploads.

### E. Railway Configuration

Add to your `railway.toml`:

```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[env]
NODE_ENV = "production"
```

Railway supports large uploads by default, but ensure you have enough memory allocated.

### F. Heroku Configuration

Add to your `Procfile`:

```
web: npm start
```

And set the timeout:

```bash
heroku config:set REQUEST_TIMEOUT=300000
```

**Note:** Heroku has a 30-second request timeout on free/hobby plans. Consider upgrading for large uploads.

## 3. Environment Variables

Ensure these are set in production:

```bash
# Required for production
NODE_ENV=production
PORT=3000

# Recommended: S3 Configuration (for persistent storage)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Optional: Database
DATABASE_URL=your_database_url

# Optional: NextAuth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_secret_key
```

## 4. S3 Configuration (Highly Recommended)

For production, use S3 to store uploaded files instead of local storage:

### Step 1: Create S3 Bucket

1. Go to AWS S3 Console
2. Create a new bucket
3. Set bucket permissions:
   - Uncheck "Block all public access"
   - Enable "ACLs enabled"

### Step 2: Configure Bucket Policy

Add this policy to allow public read access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### Step 3: Configure CORS

Add this CORS configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Step 4: Create IAM User

1. Go to IAM Console
2. Create a new user with programmatic access
3. Attach policy: `AmazonS3FullAccess`
4. Save the Access Key ID and Secret Access Key
5. Add them to your environment variables

## 5. Testing in Production

After deploying, test the upload:

1. **Upload a small image first** (< 1MB) to verify basic functionality
2. **Upload a medium image** (10-50MB) to test the limits
3. **Check browser console** for any errors
4. **Verify the image appears** on the public channel page

### Test Commands

```bash
# Check Nginx configuration
sudo nginx -t

# Check Apache configuration
sudo apachectl configtest

# Check PM2 status
pm2 status

# View logs
pm2 logs website-builder --lines 100

# Check disk space (if using local storage)
df -h

# Check memory usage
free -h
```

## 6. Monitoring and Logs

### View Application Logs

```bash
# PM2
pm2 logs website-builder

# Vercel
vercel logs

# Railway
railway logs

# Heroku
heroku logs --tail
```

### Check for Upload Errors

Look for these in the logs:
- `413 Request Entity Too Large` - Server limit too low
- `PayloadTooLargeError` - Next.js limit too low
- `ENOSPC` - Disk space full
- `ENOMEM` - Out of memory

## 7. Troubleshooting

### Issue: Still getting 413 error

**Solution:**
1. Check Nginx/Apache configuration
2. Restart the web server
3. Check if there's a CDN/proxy (Cloudflare) with limits
4. Verify Next.js config is deployed

### Issue: Upload times out

**Solution:**
1. Increase timeout values in Nginx/Apache
2. Increase `maxDuration` in Next.js API route
3. Consider using S3 for large files

### Issue: Out of memory

**Solution:**
1. Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`
2. Upgrade server RAM
3. Use S3 instead of local processing

### Issue: Files disappear after restart

**Solution:**
1. Configure S3 storage (recommended)
2. Use persistent volume/disk
3. Ensure `public/uploads` is not in `.gitignore`

## 8. Performance Optimization

### Enable Compression

The app already compresses images to WebP format, reducing file size by 70-90%.

### Use CDN

For better performance, serve images through a CDN:
1. Upload to S3
2. Enable CloudFront distribution
3. Update image URLs to use CDN

### Lazy Loading

Images are already lazy-loaded in the frontend.

## 9. Security Considerations

### File Type Validation

Already implemented - only image files are allowed.

### File Size Limits

Set to 500MB - adjust if needed based on your use case.

### Virus Scanning

Consider adding virus scanning for production:

```bash
npm install clamav.js
```

### Rate Limiting

Add rate limiting to prevent abuse:

```bash
npm install express-rate-limit
```

## 10. Deployment Checklist

Before deploying to production:

- [ ] Next.js config updated with 500MB limit
- [ ] Nginx/Apache configured for large uploads
- [ ] S3 credentials added to environment variables
- [ ] Environment variables set in production
- [ ] Server has enough disk space (if using local storage)
- [ ] Server has enough RAM (minimum 2GB recommended)
- [ ] Timeouts increased in web server config
- [ ] Tested upload in staging environment
- [ ] Monitoring and logging configured
- [ ] Backup strategy in place

## Need Help?

If you encounter issues:

1. Check the logs first
2. Verify all configurations are applied
3. Test with a small file first
4. Check server resources (CPU, RAM, disk)
5. Review the error messages carefully

---

**Last Updated:** 2026-02-14
**Upload Limit:** 500MB
**Recommended Storage:** AWS S3
