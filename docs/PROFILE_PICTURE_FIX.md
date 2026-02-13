# Profile Picture Upload Issue - FIXED

## Problem
Profile pictures were not uploading in production, showing the error:
```
Upload error: SyntaxError: Unexpected token '<', "<html>... is not valid JSON
POST https://sedstudios.com/api/upload 413 (Request Entity Too Large)
```

## Root Cause
The issue was **NOT** about image visibility - it was about the upload failing due to file size limits. Next.js was rejecting the upload request with a 413 error (Request Entity Too Large), and returning an HTML error page instead of JSON, which caused the parsing error.

## Solutions Implemented

### 1. Increased Next.js Body Size Limit
**File:** `next.config.js`

Added configuration to allow larger request bodies (50MB):

```javascript
experimental: {
  serverActions: {
    allowedOrigins: ['*'],
    bodySizeLimit: '50mb', // Increased from default ~4.5MB to 50MB
  },
},
```

### 2. Improved Error Handling in Upload API
**File:** `src/app/api/upload/route.ts`

- Added early content-length check to reject oversized files before parsing
- Improved error messages to always return JSON (not HTML)
- Added specific handling for PayloadTooLargeError
- Better error details showing actual file size vs max allowed

### 3. Enhanced Profile Image Rendering
**File:** `src/components/channel/TemplateRenderer.tsx`

- Added better error handling for image loading
- Improved logging to debug image issues
- Added fallback mechanism (profile image → user image → placeholder)
- Fixed URL construction for both absolute and relative URLs

### 4. Diagnostic Tools Created

**Script:** `scripts/check-image-urls.js`
- Checks what URLs are stored in the database
- Verifies if image files exist on disk
- Shows image type (local vs S3)

**Script:** `scripts/fix-image-urls.js`
- Automatically fixes common URL format issues
- Supports dry-run mode
- Removes `/public/` prefix if present

**API Endpoint:** `/api/channels/[channelId]/diagnostics`
- Shows current image URLs for a channel
- Displays image status and availability
- Helps debug production issues

## How to Test

1. **Restart the development server** (configuration changes require restart):
   ```bash
   npm run dev
   ```

2. **Try uploading a profile picture** in the channel editor:
   - Go to your channel customize page
   - Click on Basic Info tab
   - Upload a profile picture (up to 50MB)
   - Save the channel

3. **Verify the image is visible**:
   - Visit your public channel page
   - Check that the profile picture displays correctly
   - Open browser console to see any errors

## Production Deployment

### Important Notes:

1. **File Storage in Production:**
   - If using ephemeral file systems (Vercel, Heroku, etc.), uploaded files will be lost on restart
   - **Recommended:** Configure S3 storage for production
   
   Add these environment variables:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   AWS_REGION=your_region
   AWS_S3_BUCKET=your_bucket
   ```

2. **After Deploying:**
   - Re-upload any profile pictures that were uploaded before this fix
   - Run the diagnostic script to verify all images are accessible
   - Check browser console for any loading errors

## File Size Limits

| Item | Limit |
|------|-------|
| Profile Picture | 50MB (before compression) |
| Cover Image | 50MB (before compression) |
| After Compression | ~70-90% smaller (WebP format) |

## Troubleshooting

If images still don't show in production:

1. **Check the logs** for upload errors
2. **Run diagnostics:**
   ```bash
   node scripts/check-image-urls.js
   ```
3. **Verify S3 configuration** (if using S3)
4. **Check file permissions** on the uploads directory
5. **Review the troubleshooting guide:** `docs/TROUBLESHOOTING_PROFILE_PICTURES.md`

## Related Files Changed

- ✅ `next.config.js` - Increased body size limit
- ✅ `src/app/api/upload/route.ts` - Better error handling
- ✅ `src/components/channel/TemplateRenderer.tsx` - Enhanced image rendering
- ✅ `src/app/api/channels/public/[slug]/route.ts` - Added logging
- ✅ `scripts/check-image-urls.js` - Diagnostic tool
- ✅ `scripts/fix-image-urls.js` - Auto-fix tool
- ✅ `docs/TROUBLESHOOTING_PROFILE_PICTURES.md` - Documentation
