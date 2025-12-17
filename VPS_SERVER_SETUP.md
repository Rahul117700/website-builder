# 🚀 VPS Server Configuration for Large File Uploads (500MB)

## 📋 Problem
Getting **"413 Request Entity Too Large"** error when uploading files, even though VPS has plenty of storage space.

## 🔍 Root Cause
- Web server (Nginx) has default upload limits (usually 1MB-2MB)
- Application needs to be configured for large files
- Timeouts need to be extended

---

## ✅ Solution: Complete VPS Setup

### 1️⃣ **Configure Nginx** (Most Important!)

SSH into your VPS:

```bash
ssh your-user@your-vps-ip
```

#### Option A: Global Configuration

Edit main Nginx config:

```bash
sudo nano /etc/nginx/nginx.conf
```

Add inside the `http` block:

```nginx
http {
    # ... existing config ...
    
    # Allow uploads up to 500MB
    client_max_body_size 500M;
    client_body_buffer_size 16M;
    client_body_timeout 300s;
    
    # Increase timeouts
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    send_timeout 300s;
    
    # ... rest of config ...
}
```

#### Option B: Site-Specific Configuration

Edit your site config:

```bash
sudo nano /etc/nginx/sites-available/your-site-name
```

Or if using default:

```bash
sudo nano /etc/nginx/sites-available/default
```

Add/update inside the `server` block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Allow large file uploads
    client_max_body_size 500M;
    client_body_buffer_size 16M;
    client_body_timeout 300s;
    
    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Important for large uploads
        proxy_request_buffering off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
    
    # Special configuration for upload APIs
    location /api/products/upload {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        
        # Extra large limits for this endpoint
        client_max_body_size 500M;
        client_body_buffer_size 16M;
        proxy_request_buffering off;
        proxy_read_timeout 600s;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
    }
}
```

#### Test and Restart Nginx

```bash
# Test configuration
sudo nginx -t

# If test passes, restart nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

---

### 2️⃣ **Configure PM2 (if using PM2)**

If you're running Next.js with PM2, update your ecosystem file:

```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'website-builder',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/your/website-builder',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      // Increase Node.js memory limit for large uploads
      NODE_OPTIONS: '--max-old-space-size=4096'
    },
    max_memory_restart: '2G',
    exec_mode: 'cluster',
    instances: 2,
  }]
};
```

Restart PM2:

```bash
pm2 restart ecosystem.config.js
pm2 save
```

---

### 3️⃣ **Update Application on VPS**

Pull the latest code:

```bash
cd ~/website-builder
git pull origin main
```

Install dependencies and rebuild:

```bash
npm install
npm run build
```

Restart your application:

```bash
# If using PM2
pm2 restart website-builder

# If using systemd
sudo systemctl restart your-app-name

# If running directly
# Stop the current process and restart
npm run start
```

---

### 4️⃣ **Verify Configuration**

Check Nginx is running:

```bash
sudo systemctl status nginx
```

Check your app is running:

```bash
pm2 status
# or
sudo systemctl status your-app-name
```

Check Nginx error logs if issues:

```bash
sudo tail -f /var/log/nginx/error.log
```

---

## 🧪 Testing

1. **Open your website** in browser
2. **Go to funnel editor** → Product tab
3. **Try uploading a large video** (100MB+)
4. **Check browser Network tab** for any errors
5. **Check server logs:**

```bash
# Nginx access log
sudo tail -f /var/log/nginx/access.log

# Nginx error log
sudo tail -f /var/log/nginx/error.log

# PM2 logs
pm2 logs website-builder
```

---

## 🔥 Common Issues & Fixes

### Issue 1: Still Getting 413 Error

**Check Nginx config is actually updated:**

```bash
sudo nginx -t
grep -r "client_max_body_size" /etc/nginx/
```

**Make sure you restarted Nginx:**

```bash
sudo systemctl restart nginx
```

### Issue 2: Upload Times Out

**Increase all timeouts:**

```nginx
# In Nginx config
client_body_timeout 600s;
proxy_read_timeout 600s;
proxy_connect_timeout 600s;
proxy_send_timeout 600s;
send_timeout 600s;
```

### Issue 3: Connection Reset During Upload

**Disable proxy buffering:**

```nginx
location /api/products/upload {
    proxy_request_buffering off;
    proxy_buffering off;
    # ... other settings ...
}
```

### Issue 4: Out of Memory

**Increase Node.js memory:**

```bash
# In PM2 or start command
NODE_OPTIONS="--max-old-space-size=4096" npm start
```

---

## 📊 Recommended VPS Specs

For handling 500MB uploads:

- **RAM:** Minimum 2GB (4GB recommended)
- **Storage:** As needed for your products
- **CPU:** 2 cores minimum
- **Network:** Good bandwidth (100Mbps+)

---

## 🎯 Quick Reference Commands

```bash
# Restart everything
sudo systemctl restart nginx
pm2 restart all

# View logs
sudo tail -f /var/log/nginx/error.log
pm2 logs

# Check configuration
sudo nginx -t
pm2 status

# Pull latest code
cd ~/website-builder && git pull

# Rebuild application
npm run build
pm2 restart website-builder
```

---

## ✅ Checklist

- [ ] Updated Nginx `client_max_body_size` to 500M
- [ ] Added timeout configurations in Nginx
- [ ] Disabled `proxy_request_buffering` for upload routes
- [ ] Tested Nginx config with `sudo nginx -t`
- [ ] Restarted Nginx
- [ ] Pulled latest code from GitHub
- [ ] Rebuilt Next.js app
- [ ] Restarted application (PM2/systemd)
- [ ] Tested upload with large file
- [ ] Checked logs for errors

---

## 🆘 Still Having Issues?

1. **Check all logs:**
   ```bash
   sudo tail -50 /var/log/nginx/error.log
   pm2 logs website-builder --lines 100
   ```

2. **Test with curl:**
   ```bash
   curl -X POST \
     -F "file=@/path/to/large-file.mp4" \
     -F "name=Test Product" \
     -F "price=99" \
     https://yourdomain.com/api/products/upload
   ```

3. **Check disk space:**
   ```bash
   df -h
   du -sh ~/website-builder/public/uploads
   ```

4. **Verify Nginx is actually proxying:**
   ```bash
   curl -I https://yourdomain.com
   ```

---

## 📝 Notes

- After updating Nginx config, **ALWAYS** run `sudo nginx -t` before restarting
- Keep backups of working configurations
- Monitor disk space usage regularly
- Consider using S3/cloud storage for production at scale
- Set up log rotation to prevent logs from filling disk

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ No 413 errors in browser
- ✅ Upload progress bar reaches 100%
- ✅ Success toast appears
- ✅ File appears in `/public/uploads/products/`
- ✅ Product shows as uploaded in UI
- ✅ No errors in Nginx or PM2 logs

