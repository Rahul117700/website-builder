# Profile Picture Not Visible in Production - Troubleshooting Guide

## Issue
Profile pictures uploaded in the channel editor are not visible on the public channel page in production.

## Common Causes

### 1. **Ephemeral File System (Most Common)**
Production environments (like Vercel, Heroku, Railway) use ephemeral file systems. Files uploaded to the local disk are lost when the server restarts.

**Solution:** Configure S3 storage

```bash
# Add these to your production environment variables:
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name
```

### 2. **Incorrect Image URL Format**
The database might contain URLs with incorrect prefixes (e.g., `/public/uploads/...` instead of `/uploads/...`)

**Solution:** Run the fix script

```bash
# Check what's in the database
node scripts/check-image-urls.js

# Fix the URLs (dry run first)
node scripts/fix-image-urls.js --dry-run

# Apply the fixes
node scripts/fix-image-urls.js
```

### 3. **Files Not Deployed**
If using local storage, the `public/uploads` folder might not be included in the deployment.

**Solution:** Ensure the folder is committed to git (if using git-based deployment)

```bash
# Create a .gitkeep file to ensure the folder is tracked
mkdir -p public/uploads/images
touch public/uploads/images/.gitkeep
git add public/uploads/images/.gitkeep
git commit -m "Ensure uploads directory exists"
```

### 4. **API Route Not Working**
The `/api/view-image` route might not be functioning correctly in production.

**Solution:** Test the API route directly

```bash
# In production, try accessing:
https://your-domain.com/uploads/images/your-image.webp

# Check the server logs for errors
```

## Diagnostic Steps

### Step 1: Check Database
```bash
node scripts/check-image-urls.js
```

This will show:
- What URLs are stored in the database
- Whether the files exist on disk
- The type of URL (local vs S3)

### Step 2: Check API Diagnostics
Visit in your browser (while logged in):
```
https://your-domain.com/api/channels/YOUR_CHANNEL_ID/diagnostics
```

This will show:
- Current image URLs
- Image status
- Whether fallbacks are available

### Step 3: Check Browser Console
Open the channel page and check the browser console for:
- Image load errors
- The actual URLs being attempted
- Any CORS or security errors

## Quick Fixes

### Fix 1: Re-upload the Image
1. Go to your channel editor
2. Remove the current profile picture
3. Upload it again
4. Save the channel

### Fix 2: Use S3 Storage (Recommended for Production)
1. Set up an S3 bucket
2. Add the environment variables (see above)
3. Re-upload the profile picture
4. The image will now be stored on S3 and persist across deployments

### Fix 3: Use External Image URL
1. Upload your image to a service like Imgur, Cloudinary, or your own CDN
2. In the database, update the profileImage field to the external URL:

```sql
UPDATE "Channel" 
SET "profileImage" = 'https://your-cdn.com/your-image.jpg'
WHERE id = 'your-channel-id';
```

## Verification

After applying a fix:

1. **Clear browser cache** or use incognito mode
2. **Visit the channel page** as a logged-out user
3. **Check the browser console** for any errors
4. **Verify the image loads** correctly

## Prevention

To prevent this issue in the future:

1. **Always use S3 in production** - Configure S3 environment variables
2. **Test in production** - After uploading, verify the image is visible
3. **Monitor logs** - Check server logs for upload errors
4. **Use absolute URLs** - When possible, use full URLs for images

## Need More Help?

If the issue persists:

1. Check the server logs for errors
2. Verify the S3 bucket permissions (if using S3)
3. Ensure the image file format is supported (JPG, PNG, WebP, GIF)
4. Check the Content Security Policy headers
5. Verify the image URL is accessible (try opening it directly in a browser)
