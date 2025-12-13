# 🚂 Complete Railway.app Deployment Guide

**Your Next.js SaaS Website Builder on Railway**

---

## ✅ **ISSUE FIXED!**

I've removed `prisma db push` from the build script. This was causing the build to fail because:
- Railway doesn't allow database modifications during build
- Database migrations should happen separately

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Your Repository**

✅ **I've already updated `package.json` for you!**

The build script is now:
```json
"build": "prisma generate && next build"
```

**Commit and push this change:**
```bash
git add package.json
git commit -m "Fix Railway build - remove db push from build script"
git push origin main
```

---

### **Step 2: Set Up Railway Project**

1. **Go to:** https://railway.app
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository:** `website-builder`
6. **Click "Deploy"**

⏸️ **Don't worry if it fails first time - we need to add database next!**

---

### **Step 3: Add PostgreSQL Database**

1. **In your Railway project, click "New"**
2. **Select "Database"**
3. **Choose "Add PostgreSQL"**
4. **Wait 30-60 seconds** for database to initialize
5. **You'll see a new PostgreSQL service** in your project

---

### **Step 4: Get Database Connection String**

1. **Click on the PostgreSQL service**
2. **Go to "Variables" tab**
3. **Find and copy `DATABASE_URL`** (or `DATABASE_PRIVATE_URL`)

It looks like:
```
postgresql://postgres:password123@containers-us-west-123.railway.app:7396/railway
```

---

### **Step 5: Add Environment Variables to Your App**

1. **Click on your Next.js app service** (not the database)
2. **Go to "Variables" tab**
3. **Click "New Variable"**
4. **Add each of these variables:**

```env
# ============================================
# 1. DATABASE (Required) - Copy from PostgreSQL service
# ============================================
DATABASE_URL=postgresql://postgres:password@containers-us-west-xxx.railway.app:7396/railway

# ============================================
# 2. AUTHENTICATION (Required)
# ============================================
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
NEXTAUTH_SECRET=generate-a-random-32-character-string-here

# ============================================
# 3. PAYMENT GATEWAY (Required for payments)
# ============================================
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# ============================================
# 4. FILE STORAGE (Required for uploads)
# ============================================
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_REGION=ap-south-1

# ============================================
# 5. EMAIL SERVICE (Required for notifications)
# ============================================
RESEND_API_KEY=your_resend_api_key

# ============================================
# 6. OPTIONAL
# ============================================
NODE_ENV=production
```

---

### **Step 6: Generate NEXTAUTH_SECRET**

Run this in your local terminal:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example output:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

Copy this and use it as your `NEXTAUTH_SECRET` value.

---

### **Step 7: Link Database to App (Important!)**

Railway has a special way to reference variables:

1. **In your app's "Variables" tab**
2. **For DATABASE_URL, instead of copying manually:**
   - Click "New Variable"
   - Choose "Add Reference"
   - Select: `PostgreSQL` → `DATABASE_URL`
   - This automatically uses the correct database URL

3. **For NEXTAUTH_URL:**
   - Use: `${{RAILWAY_PUBLIC_DOMAIN}}`
   - Railway automatically replaces this with your app's URL
   - Example: `https://web-production-abc123.up.railway.app`

---

### **Step 8: Trigger Deployment**

1. **Go to your app service**
2. **Click "Deployments" tab**
3. **Click "Deploy"** or just push to GitHub (Railway auto-deploys)
4. **Monitor the logs**

You should see:
```
✓ Packages installed
✓ Prisma generated
✓ Next.js build complete
✓ Deploy successful
```

---

### **Step 9: Run Database Migrations**

**After first successful deployment:**

#### **Option A: Via Railway Dashboard (Recommended)**

1. **Click on your app service**
2. **Go to "Settings" tab**
3. **Scroll to "Deploy"**
4. **Add a "Custom Start Command"** temporarily:
   ```bash
   npx prisma migrate deploy && npm start
   ```
5. **Trigger a new deployment**
6. **After migration completes, remove the custom start command**
7. **Set it back to:** `npm start`

#### **Option B: Via Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migration
railway run npx prisma migrate deploy
```

---

### **Step 10: Verify Deployment**

1. **Go to your app service**
2. **Click on the URL** at the top (looks like: `https://web-production-abc123.up.railway.app`)
3. **Your app should open!**

Test these:
- ✅ Homepage loads
- ✅ Sign up works
- ✅ Login works
- ✅ Dashboard opens

---

## 🔧 **Troubleshooting Common Issues**

### **Issue 1: Build Fails with "Environment variable not found"**

**Solution:**
- Make sure all environment variables are added in Railway
- Check spelling of variable names
- DATABASE_URL must be set before build

### **Issue 2: "Can't reach database server"**

**Solution:**
- Database is still starting, wait 1-2 minutes
- Make sure you used DATABASE_URL from PostgreSQL service
- Check database service status is "Active"

### **Issue 3: "Module not found: @prisma/client"**

**Solution:**
- Make sure `postinstall` script exists in package.json
- Redeploy to trigger fresh build

### **Issue 4: App loads but shows errors**

**Solution:**
- Check logs in Railway dashboard
- Make sure ALL environment variables are set
- Verify NEXTAUTH_URL matches your actual Railway URL

### **Issue 5: "Prisma Client not initialized"**

**Solution:**
- Run migrations: `npx prisma migrate deploy`
- Or add custom start command temporarily

---

## 📊 **Railway Free Tier Limits**

| Resource | Free Tier |
|----------|-----------|
| **Credits** | $5/month |
| **Usage** | Metered |
| **Databases** | 1 GB storage |
| **Sleep Policy** | None (stays awake) |
| **Custom Domain** | Yes |
| **SSL** | Automatic |

**Typical costs with $5 credit:**
- Small app: Runs all month
- Medium traffic: May need $10-20/month
- High traffic: Upgrade to Pro ($20/month)

---

## 🎯 **Post-Deployment Checklist**

After successful deployment:

- [ ] Test user signup
- [ ] Test user login
- [ ] Create a test funnel
- [ ] Test Razorpay payment (test mode)
- [ ] Upload a test file
- [ ] Check analytics work
- [ ] Test email notifications
- [ ] Add custom domain (optional)
- [ ] Set up monitoring
- [ ] Backup database regularly

---

## 🌐 **Add Custom Domain (Optional)**

1. **In your app service, go to "Settings"**
2. **Scroll to "Domains"**
3. **Click "Add Custom Domain"**
4. **Enter your domain:** `yourdomain.com`
5. **Add DNS records** at your domain registrar:
   ```
   Type: CNAME
   Name: @  (or www)
   Value: [Railway provides this]
   ```
6. **Wait for DNS propagation** (5 minutes to 24 hours)

---

## 📱 **Monitor Your App**

### **Railway Dashboard:**
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Deployments:** History of all deployments
- **Usage:** Track your $5 credit usage

### **Check Logs:**
1. Click on your app service
2. Go to "Logs" tab
3. View real-time logs
4. Search for errors

---

## 🔄 **Update Your App**

Railway automatically deploys when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main

# Railway automatically:
# 1. Detects the push
# 2. Pulls latest code
# 3. Runs npm install
# 4. Runs npm run build
# 5. Deploys new version
```

---

## 💾 **Database Backups**

Railway doesn't backup free tier databases automatically.

### **Manual Backup:**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and link project
railway login
railway link

# Backup database
railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore if needed
railway run psql $DATABASE_URL < backup_20231207.sql
```

---

## 🚨 **Important Notes**

### **Environment Variables:**
- ✅ Never commit .env file to GitHub
- ✅ All secrets must be in Railway Variables
- ✅ Use `${{RAILWAY_PUBLIC_DOMAIN}}` for NEXTAUTH_URL
- ✅ Reference DATABASE_URL from PostgreSQL service

### **Build Process:**
- ✅ Railway uses Railpack (automatic)
- ✅ Detects Node.js automatically
- ✅ Installs dependencies with `npm ci`
- ✅ Runs your build script
- ✅ Starts with your start script

### **Cost Management:**
- 💰 Monitor usage in Railway dashboard
- 💰 $5 credit usually enough for MVP
- 💰 Set up billing alerts
- 💰 Upgrade to Pro if needed ($20/month)

---

## 🆘 **Still Having Issues?**

### **Check These:**

1. **All environment variables added?**
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - RAZORPAY credentials
   - AWS credentials
   - RESEND_API_KEY

2. **Database linked correctly?**
   - PostgreSQL service is Active
   - DATABASE_URL references PostgreSQL service

3. **Build logs show success?**
   - Check Deployments tab
   - Look for "Deploy successful"

4. **Migrations run?**
   - Run `prisma migrate deploy`
   - Or use custom start command

---

## 📞 **Get Help**

- **Railway Discord:** https://discord.gg/railway
- **Railway Docs:** https://docs.railway.app
- **Railway Status:** https://status.railway.app

---

## ✅ **Quick Reference Commands**

```bash
# Generate NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Install Railway CLI
npm i -g @railway/cli

# Login to Railway
railway login

# Link project
railway link

# View logs
railway logs

# Run migrations
railway run npx prisma migrate deploy

# Open app in browser
railway open
```

---

## 🎉 **Success!**

Once deployed, your app will be live at:
```
https://web-production-[random].up.railway.app
```

You can now:
- ✅ Accept user signups
- ✅ Process payments
- ✅ Manage subscriptions
- ✅ Track analytics
- ✅ Scale as needed

**Congratulations on your deployment!** 🚀

---

## 📈 **Next Steps After Launch**

1. **Add custom domain**
2. **Set up monitoring**
3. **Enable database backups**
4. **Test all features thoroughly**
5. **Monitor error logs**
6. **Plan for scaling**
7. **Collect user feedback**
8. **Iterate and improve**

Good luck with your SaaS launch! 🎊

