# Load Balancer Configuration for Large File Uploads

## Overview
This guide covers configuring load balancers (Nginx, HAProxy, AWS ALB) to handle 500MB file uploads across multiple application servers.

## 1. Nginx Load Balancer Configuration

### Basic Setup

Create `/etc/nginx/nginx.conf` or `/etc/nginx/sites-available/your-app`:

```nginx
# Upstream servers (your Next.js app instances)
upstream nextjs_backend {
    # Use least connections for better distribution of large uploads
    least_conn;
    
    # Your application servers
    server 10.0.1.10:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.11:3000 max_fails=3 fail_timeout=30s;
    server 10.0.1.12:3000 max_fails=3 fail_timeout=30s;
    
    # Keep connections alive
    keepalive 32;
}

# HTTP server (redirect to HTTPS)
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

# HTTPS server (main load balancer)
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL Configuration
    ssl_certificate /etc/ssl/certs/your-cert.crt;
    ssl_certificate_key /etc/ssl/private/your-key.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ===== CRITICAL: Large File Upload Settings =====
    
    # Maximum upload size (500MB)
    client_max_body_size 500M;
    
    # Buffer settings for large uploads
    client_body_buffer_size 128k;
    client_header_buffer_size 4k;
    large_client_header_buffers 4 16k;
    
    # Timeout settings (5 minutes for large uploads)
    client_body_timeout 300s;
    client_header_timeout 300s;
    send_timeout 300s;
    
    # Proxy timeout settings
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    
    # Disable buffering for uploads (stream directly to backend)
    proxy_request_buffering off;
    
    # ===== End Large File Upload Settings =====
    
    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
    
    # Main location block
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        
        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        
        # Important headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Don't cache uploads
        proxy_cache_bypass $http_upgrade;
        
        # Disable buffering for large uploads
        proxy_buffering off;
        proxy_request_buffering off;
    }
    
    # Special handling for upload endpoint
    location /api/upload {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        
        # Headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Critical: Disable buffering for uploads
        proxy_buffering off;
        proxy_request_buffering off;
        
        # Extended timeouts for large uploads
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        
        # Maximum upload size
        client_max_body_size 500M;
        client_body_timeout 600s;
    }
    
    # Static files (optional - if serving from load balancer)
    location /_next/static {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }
}
```

### Health Check Configuration

Add health check endpoint:

```nginx
# Health check location
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

### Apply Configuration

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Or restart if needed
sudo systemctl restart nginx
```

## 2. HAProxy Load Balancer Configuration

Create `/etc/haproxy/haproxy.cfg`:

```haproxy
global
    log /dev/log local0
    log /dev/log local1 notice
    chroot /var/lib/haproxy
    stats socket /run/haproxy/admin.sock mode 660 level admin
    stats timeout 30s
    user haproxy
    group haproxy
    daemon
    
    # SSL/TLS settings
    ssl-default-bind-ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256
    ssl-default-bind-options ssl-min-ver TLSv1.2 no-tls-tickets

defaults
    log global
    mode http
    option httplog
    option dontlognull
    
    # Timeouts for large uploads (10 minutes)
    timeout connect 5s
    timeout client 600s
    timeout server 600s
    timeout http-request 600s
    timeout http-keep-alive 10s
    
    # Error files
    errorfile 400 /etc/haproxy/errors/400.http
    errorfile 403 /etc/haproxy/errors/403.http
    errorfile 408 /etc/haproxy/errors/408.http
    errorfile 500 /etc/haproxy/errors/500.http
    errorfile 502 /etc/haproxy/errors/502.http
    errorfile 503 /etc/haproxy/errors/503.http
    errorfile 504 /etc/haproxy/errors/504.http

# Frontend (receives traffic)
frontend http_front
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/your-cert.pem
    
    # Redirect HTTP to HTTPS
    redirect scheme https code 301 if !{ ssl_fc }
    
    # ACLs for upload endpoint
    acl is_upload path_beg /api/upload
    
    # Use special backend for uploads
    use_backend upload_backend if is_upload
    default_backend nextjs_backend

# Backend for regular traffic
backend nextjs_backend
    balance leastconn
    option httpchk GET /health
    
    # Servers
    server app1 10.0.1.10:3000 check inter 5s fall 3 rise 2
    server app2 10.0.1.11:3000 check inter 5s fall 3 rise 2
    server app3 10.0.1.12:3000 check inter 5s fall 3 rise 2

# Special backend for uploads (longer timeouts)
backend upload_backend
    balance leastconn
    option httpchk GET /health
    
    # Extended timeouts for large uploads
    timeout server 600s
    timeout http-request 600s
    
    # Servers
    server app1 10.0.1.10:3000 check inter 5s fall 3 rise 2
    server app2 10.0.1.11:3000 check inter 5s fall 3 rise 2
    server app3 10.0.1.12:3000 check inter 5s fall 3 rise 2

# Statistics page
listen stats
    bind *:8404
    stats enable
    stats uri /stats
    stats refresh 30s
    stats auth admin:your_password_here
```

### Apply HAProxy Configuration

```bash
# Test configuration
sudo haproxy -c -f /etc/haproxy/haproxy.cfg

# Restart HAProxy
sudo systemctl restart haproxy

# Check status
sudo systemctl status haproxy
```

## 3. AWS Application Load Balancer (ALB)

### Create ALB via AWS Console

1. **Go to EC2 → Load Balancers → Create Load Balancer**
2. **Select Application Load Balancer**
3. **Configure:**

#### Basic Configuration
- **Name:** `nextjs-app-lb`
- **Scheme:** Internet-facing
- **IP address type:** IPv4

#### Network Mapping
- **VPC:** Select your VPC
- **Availability Zones:** Select at least 2 AZs
- **Subnets:** Select public subnets

#### Security Groups
- Create or select a security group that allows:
  - Port 80 (HTTP)
  - Port 443 (HTTPS)

#### Listeners and Routing

**HTTP Listener (Port 80):**
- **Default action:** Redirect to HTTPS

**HTTPS Listener (Port 443):**
- **Default action:** Forward to target group
- **SSL Certificate:** Select from ACM or upload

#### Target Group Settings

Create a new target group:
- **Target type:** Instances or IP addresses
- **Protocol:** HTTP
- **Port:** 3000
- **Health check path:** `/health`
- **Health check interval:** 30 seconds
- **Healthy threshold:** 2
- **Unhealthy threshold:** 3
- **Timeout:** 5 seconds

**Important: Modify Attributes**
- **Deregistration delay:** 30 seconds
- **Slow start duration:** 0 seconds
- **Stickiness:** Enable (for upload consistency)
- **Stickiness duration:** 300 seconds

### AWS CLI Configuration

```bash
# Create target group
aws elbv2 create-target-group \
  --name nextjs-targets \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxxxxx \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 3

# Create load balancer
aws elbv2 create-load-balancer \
  --name nextjs-app-lb \
  --subnets subnet-xxxxxxxx subnet-yyyyyyyy \
  --security-groups sg-xxxxxxxx \
  --scheme internet-facing \
  --type application

# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:region:account-id:loadbalancer/app/nextjs-app-lb/xxxxxxxxxx \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:region:account-id:certificate/xxxxxxxxxx \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/nextjs-targets/xxxxxxxxxx

# Modify target group attributes for large uploads
aws elbv2 modify-target-group-attributes \
  --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/nextjs-targets/xxxxxxxxxx \
  --attributes \
    Key=deregistration_delay.timeout_seconds,Value=30 \
    Key=stickiness.enabled,Value=true \
    Key=stickiness.type,Value=lb_cookie \
    Key=stickiness.lb_cookie.duration_seconds,Value=300
```

### Important ALB Notes

⚠️ **AWS ALB has a maximum timeout of 60 seconds** for idle connections. For uploads larger than what can complete in 60 seconds, consider:

1. **Use S3 Direct Upload** (recommended)
2. **Implement chunked uploads**
3. **Use CloudFront with custom origin timeout**

## 4. Cloudflare Load Balancer

If using Cloudflare:

### Cloudflare Settings

1. **Go to Traffic → Load Balancing**
2. **Create Load Balancer**
3. **Configure:**

```yaml
Name: nextjs-app
Hostname: your-domain.com

Pools:
  - Name: primary-pool
    Origins:
      - server1.your-domain.com (10.0.1.10)
      - server2.your-domain.com (10.0.1.11)
      - server3.your-domain.com (10.0.1.12)
    Health Check:
      Path: /health
      Interval: 60s
      
Session Affinity: Cookie-based
TTL: 300 seconds
```

### Cloudflare Page Rules

Add page rule for uploads:

```
URL: your-domain.com/api/upload*
Settings:
  - Cache Level: Bypass
  - Disable Performance
  - Disable Apps
```

### Important Cloudflare Notes

⚠️ **Cloudflare Free/Pro plans have a 100MB upload limit**. For 500MB uploads:
- Upgrade to Business or Enterprise plan
- OR bypass Cloudflare for upload endpoint
- OR use S3 direct upload

## 5. Session Persistence (Sticky Sessions)

For multi-part uploads, enable sticky sessions:

### Nginx
```nginx
upstream nextjs_backend {
    ip_hash;  # Simple IP-based stickiness
    # OR
    hash $cookie_sessionid consistent;  # Cookie-based
    
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
    server 10.0.1.12:3000;
}
```

### HAProxy
```haproxy
backend nextjs_backend
    balance leastconn
    cookie SERVERID insert indirect nocache
    server app1 10.0.1.10:3000 cookie app1 check
    server app2 10.0.1.11:3000 cookie app2 check
    server app3 10.0.1.12:3000 cookie app3 check
```

## 6. Monitoring and Health Checks

### Add Health Check Endpoint

Create `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
}
```

### Monitor Upload Performance

Add logging to track upload performance across servers:

```typescript
// In upload route
console.log('Upload started', {
  server: process.env.SERVER_ID || 'unknown',
  fileSize: file.size,
  timestamp: new Date().toISOString(),
});
```

## 7. Testing Load Balancer

### Test Health Checks

```bash
# Test each backend server
curl http://10.0.1.10:3000/api/health
curl http://10.0.1.11:3000/api/health
curl http://10.0.1.12:3000/api/health

# Test through load balancer
curl https://your-domain.com/api/health
```

### Test Upload Distribution

```bash
# Upload test file multiple times
for i in {1..10}; do
  curl -X POST https://your-domain.com/api/upload \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "file=@test-image.jpg" \
    -v
done
```

### Monitor Logs

```bash
# Nginx
sudo tail -f /var/log/nginx/access.log

# HAProxy
sudo tail -f /var/log/haproxy.log

# Application servers
pm2 logs
```

## 8. Troubleshooting

### Issue: 502 Bad Gateway

**Causes:**
- Backend servers down
- Health check failing
- Firewall blocking traffic

**Solutions:**
```bash
# Check backend servers
curl http://backend-ip:3000/api/health

# Check firewall
sudo ufw status
sudo iptables -L

# Check logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: Uploads failing randomly

**Cause:** No session persistence

**Solution:** Enable sticky sessions (see Section 5)

### Issue: Slow uploads

**Causes:**
- Buffering enabled
- Small buffer sizes
- Network latency

**Solutions:**
- Disable `proxy_request_buffering`
- Increase buffer sizes
- Use direct S3 upload

## 9. Best Practices

1. **Use S3 for uploads** - Bypass load balancer entirely
2. **Enable sticky sessions** - For multi-part uploads
3. **Disable buffering** - For large file uploads
4. **Set proper timeouts** - At least 10 minutes
5. **Monitor health checks** - Ensure all backends are healthy
6. **Use HTTPS** - Always encrypt uploads
7. **Implement rate limiting** - Prevent abuse
8. **Log everything** - Track upload performance

## 10. Architecture Diagram

```
Internet
    ↓
[Load Balancer]
    ↓
    ├─→ [App Server 1] → [S3]
    ├─→ [App Server 2] → [S3]
    └─→ [App Server 3] → [S3]
```

## Quick Reference

| Setting | Nginx | HAProxy | AWS ALB |
|---------|-------|---------|---------|
| Max Upload | 500M | No limit | No limit |
| Timeout | 600s | 600s | 60s max |
| Buffering | Off | N/A | N/A |
| Sticky Sessions | ip_hash | cookie | lb_cookie |
| Health Check | /health | /health | /health |

---

**Recommendation:** For 500MB uploads, use **S3 direct upload** to bypass load balancer limitations entirely.
