# 🚀 Railway Deployment - Quick Fix Card

## ✅ **FIXED: Your Build Issue**

**Problem:** Build was failing because `prisma db push` tried to modify database during build.

**Solution:** I updated your `package.json` to remove database push from build script.

---

## 📝 **What Changed:**

### **Before (Causing Error):**
```json
"build": "prisma generate && prisma db push && next build"
```

### **After (Fixed):**
```json
"build": "prisma generate && next build"
```

---

## 🎯 **Next Steps - Do This Now:**

### **1. Commit and Push the Fix**
```bash
git add package.json
git commit -m "Fix Railway build script"
git push origin main
```

### **2. Add These Environment Variables in Railway**

**Required Variables (Minimum to start):**

```env
DATABASE_URL        →  From PostgreSQL service (use "Add Reference")
NEXTAUTH_SECRET     →  Generate random string (see command below)
NEXTAUTH_URL        →  Use: ${{RAILWAY_PUBLIC_DOMAIN}}
```

**Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Other Required Variables (for full functionality):**
```env
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME
AWS_REGION
RESEND_API_KEY
```

### **3. Make Sure PostgreSQL is Added**
- In Railway project: Click "New" → "Database" → "PostgreSQL"
- Wait for it to show "Active" status

### **4. Link Database to App**
- In your app's Variables tab
- Click "New Variable" → "Add Reference"
- Select: PostgreSQL → DATABASE_URL

### **5. Redeploy**
- Railway will auto-deploy when you push
- Or manually click "Deploy" in Railway dashboard

---

## ✅ **Build Should Succeed Now!**

After these steps, your build should complete successfully and show:
```
✓ Prisma Client generated
✓ Next.js build complete
✓ Deployment successful
```

---

## 🔧 **After First Successful Deployment:**

Run database migrations using one of these methods:

**Method 1: Custom Start Command (Easiest)**
1. Go to Settings → Deploy
2. Set Custom Start Command to: `npx prisma migrate deploy && npm start`
3. Deploy once
4. Remove custom start command
5. Set back to: `npm start`

**Method 2: Railway CLI**
```bash
npm i -g @railway/cli
railway login
railway link
railway run npx prisma migrate deploy
```

---

## 📚 **Full Documentation:**

See `RAILWAY_DEPLOYMENT_GUIDE.md` for complete step-by-step instructions.

---

## 🆘 **Still Having Issues?**

Common fixes:
- ✅ Make sure ALL environment variables are added
- ✅ Verify DATABASE_URL is referenced from PostgreSQL service
- ✅ Check PostgreSQL service is "Active"
- ✅ Wait 1-2 minutes after adding database
- ✅ Make sure you pushed the package.json changes

---

**Your app should now build and deploy successfully!** 🎉

