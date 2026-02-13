# Quick Reference: 500MB Upload Configuration

## ✅ Changes Made

### 1. Next.js Configuration
**File:** `next.config.js`
```javascript
bodySizeLimit: '500mb'  // Increased from 50mb to 500mb
```

### 2. Upload API
**File:** `src/app/api/upload/route.ts`
```javascript
const maxSize = 500 * 1024 * 1024; // 500MB (was 50MB)
```

## 🔧 Production Server Setup

### For Nginx (Most Common)

Add to `/etc/nginx/nginx.conf`:

```nginx
http {
    client_max_body_size 500M;
    client_body_timeout 300s;
    send_timeout 300s;
}
```

Then restart:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### For Apache

Add to Apache config:
```apache
LimitRequestBody 524288000
Timeout 300
```

Then restart:
```bash
sudo apachectl configtest
sudo systemctl restart apache2
```

### Automated Setup

Run this script on your production server:
```bash
sudo bash scripts/setup-production-server.sh
```

### Load Balancer Setup

If using a load balancer (Nginx, HAProxy, AWS ALB, Cloudflare):

**See full guide:** `docs/LOAD_BALANCER_CONFIG.md`

**Quick Nginx LB config:**
```nginx
upstream nextjs_backend {
    least_conn;
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
}

server {
    client_max_body_size 500M;
    proxy_request_buffering off;  # Critical!
    
    location /api/upload {
        proxy_pass http://nextjs_backend;
        client_body_timeout 600s;
    }
}
```

## 🌐 Hosting Provider Specific

### Vercel
- **Limitation:** 4.5MB on Hobby plan
- **Solution:** Upgrade to Pro plan OR use S3 direct upload

### Railway
- No additional config needed
- Ensure enough memory allocated

### Heroku
- Has 30s timeout on free/hobby plans
- Consider upgrading for large uploads

## 📦 S3 Configuration (Recommended)

Set these environment variables in production:

```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_bucket_name
```

## 🧪 Testing

1. **Restart your dev server** (config changes require restart)
2. **Try uploading** the profile picture again
3. **Check browser console** for errors
4. **Verify image appears** on the channel page

## 📝 Deployment Checklist

- [ ] Next.js config updated (✅ Done)
- [ ] Upload API updated (✅ Done)
- [ ] Nginx/Apache configured on production server
- [ ] Environment variables set
- [ ] S3 configured (optional but recommended)
- [ ] Server restarted
- [ ] Upload tested

## 🆘 Troubleshooting

### Still getting 413 error?
1. Check Nginx/Apache config
2. Restart web server
3. Check if using Cloudflare (has its own limits)
4. Verify config is deployed

### Upload timing out?
1. Increase timeout in Nginx/Apache
2. Check server resources (RAM, CPU)
3. Consider using S3 for large files

### Files disappearing?
1. Use S3 storage (recommended)
2. Ensure persistent disk/volume
3. Check if `public/uploads` is in `.gitignore`

## 📚 Documentation

- **Full Guide:** `docs/PRODUCTION_UPLOAD_CONFIG.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING_PROFILE_PICTURES.md`
- **Fix Summary:** `docs/PROFILE_PICTURE_FIX.md`

## 🔗 Quick Links

- Check database: `node scripts/check-image-urls.js`
- Fix URLs: `node scripts/fix-image-urls.js`
- Diagnostics API: `/api/channels/[channelId]/diagnostics`

---

**Current Limit:** 500MB
**Compression:** Automatic (WebP format, ~70-90% reduction)
**Storage:** Local (dev) / S3 (production recommended)
