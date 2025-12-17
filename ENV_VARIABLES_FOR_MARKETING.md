# 🔑 Environment Variables for Marketing Automation

Add these variables to your `.env` file in the root directory.

## 📋 Copy & Paste Template

```bash
# ============================================
# MARKETING AUTOMATION - Add to your .env file
# ============================================

# Medium API Key
# Get from: https://medium.com/me/settings/security
MEDIUM_API_KEY=your_medium_integration_token_here

# Dev.to API Key  
# Get from: https://dev.to/settings/extensions
DEVTO_API_KEY=your_devto_api_key_here

# Hashnode API Key & Publication ID
# Get from: https://hashnode.com/settings/developer
HASHNODE_API_KEY=your_hashnode_api_key_here
HASHNODE_PUBLICATION_ID=your_hashnode_publication_id

# WordPress (Optional)
# Get from: https://wordpress.com/me/security/application-passwords
WORDPRESS_URL=https://yourblog.wordpress.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx

# Configuration
POST_INTERVAL_HOURS=24
ENABLED_PLATFORMS=medium,devto,hashnode
```

---

## 🚀 Quick Setup Instructions

### 1. Open your `.env` file

```bash
nano .env
# or
code .env
```

### 2. Add the variables above to the file

Just copy-paste the template above to the bottom of your existing `.env` file.

### 3. Get Your API Keys

Follow the links below to get each API key:

---

## 🔑 How to Get Each API Key

### Medium (Required - 3 minutes)

1. **Go to**: https://medium.com/me/settings/security
2. **Scroll down** to "Integration tokens"
3. **Enter description**: "Marketing Automation for Sell Earn Direct"
4. **Click**: "Get integration token"
5. **Copy the token** (looks like: `1234abc567def8901ghij234klm...`)
6. **Paste in .env**: 
   ```
   MEDIUM_API_KEY=1234abc567def8901ghij234klm...
   ```

**Note**: Medium tokens don't expire but can be revoked.

---

### Dev.to (Required - 2 minutes)

1. **Go to**: https://dev.to/settings/extensions
2. **Click**: "Generate API Key"
3. **Enter description**: "Marketing Automation"
4. **Copy the key** (looks like: `AbCdEfGhIjKlMnOpQr...`)
5. **Paste in .env**:
   ```
   DEVTO_API_KEY=AbCdEfGhIjKlMnOpQr...
   ```

**Rate Limits**: 
- Authenticated: 10 requests per 30 seconds
- Publishing: Up to 10 articles per day (recommend 1-2)

---

### Hashnode (Required - 5 minutes)

#### Step 1: Get API Key

1. **Go to**: https://hashnode.com/settings/developer
2. **Click**: "Generate New Token"
3. **Name it**: "Marketing Automation"
4. **Copy the token** (looks like: `12345678-abcd-1234-efgh-567890abcdef`)
5. **Paste in .env**:
   ```
   HASHNODE_API_KEY=12345678-abcd-1234-efgh-567890abcdef
   ```

#### Step 2: Get Publication ID

1. **Go to**: https://hashnode.com/
2. **Click** on your blog/publication
3. **Go to**: Dashboard
4. **Look at the URL**: `https://hashnode.com/YOUR_PUBLICATION_ID/dashboard`
5. **Copy** `YOUR_PUBLICATION_ID` from the URL
6. **Paste in .env**:
   ```
   HASHNODE_PUBLICATION_ID=YOUR_PUBLICATION_ID
   ```

**Note**: If you don't have a publication yet:
- Click "Create Blog" on Hashnode
- Choose a subdomain (e.g., `yourblog.hashnode.dev`)
- Then follow steps above

---

### WordPress (Optional - 5 minutes)

Only if you have a WordPress blog.

#### For WordPress.com:

1. **Go to**: https://wordpress.com/me/security/application-passwords
2. **Enter name**: "Marketing Automation"
3. **Click**: "Create New Application Password"
4. **Copy the password** (looks like: `xxxx xxxx xxxx xxxx`)
5. **Add to .env**:
   ```
   WORDPRESS_URL=https://yourblog.wordpress.com
   WORDPRESS_USERNAME=your_username
   WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

#### For Self-Hosted WordPress:

1. **Login to WordPress admin**
2. **Go to**: Users → Your Profile
3. **Scroll down** to "Application Passwords"
4. **Create new password**: "Marketing Automation"
5. **Copy the password**
6. **Add to .env**:
   ```
   WORDPRESS_URL=https://yourdomain.com
   WORDPRESS_USERNAME=admin
   WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## ⚙️ Configuration Variables

### POST_INTERVAL_HOURS

How often to post automatically:

```bash
# Post daily (recommended)
POST_INTERVAL_HOURS=24

# Post twice daily
POST_INTERVAL_HOURS=12

# Post every 2 days
POST_INTERVAL_HOURS=48

# Post weekly
POST_INTERVAL_HOURS=168
```

### ENABLED_PLATFORMS

Which platforms to post to (comma-separated, no spaces):

```bash
# All platforms
ENABLED_PLATFORMS=medium,devto,hashnode

# Only Medium and Dev.to
ENABLED_PLATFORMS=medium,devto

# Only Medium
ENABLED_PLATFORMS=medium

# With WordPress
ENABLED_PLATFORMS=medium,devto,hashnode,wordpress
```

---

## 📝 Example Complete .env Section

Here's what your `.env` file should look like with real values:

```bash
# ============================================
# MARKETING AUTOMATION
# ============================================

# Medium
MEDIUM_API_KEY=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t

# Dev.to
DEVTO_API_KEY=AbCdEfGh1234567890IjKlMnOpQrStUvWx

# Hashnode
HASHNODE_API_KEY=12345678-abcd-1234-efgh-567890abcdef
HASHNODE_PUBLICATION_ID=65abc123def456ghi789

# Configuration
POST_INTERVAL_HOURS=24
ENABLED_PLATFORMS=medium,devto,hashnode
```

---

## ✅ Verification Checklist

After adding variables, verify:

- [ ] All required keys are filled in (not "your_key_here")
- [ ] No extra spaces before or after the `=` sign
- [ ] No quotes around the values (unless part of the actual key)
- [ ] ENABLED_PLATFORMS has no spaces between platform names
- [ ] File is saved

---

## 🧪 Test Your Configuration

After adding the variables:

```bash
# Test that variables are loaded
node -e "console.log('Medium:', process.env.MEDIUM_API_KEY ? 'Set ✅' : 'Not set ❌')"
node -e "console.log('Dev.to:', process.env.DEVTO_API_KEY ? 'Set ✅' : 'Not set ❌')"
node -e "console.log('Hashnode:', process.env.HASHNODE_API_KEY ? 'Set ✅' : 'Not set ❌')"

# Test a post
npm run marketing:post
```

If you see errors about missing API keys, check:
1. Variables are in `.env` file in root directory
2. Variable names match exactly (case-sensitive)
3. No typos in variable names
4. .env file is saved

---

## 🔒 Security Notes

1. **Never commit .env file to git** (it should be in .gitignore)
2. **Keep API keys secret** - don't share them
3. **Regenerate keys** if accidentally exposed
4. **Use different keys** for development vs production
5. **Rotate keys** periodically for security

---

## 🆘 Troubleshooting

### "API key invalid" error

- Check you copied the complete key (no missing characters)
- Verify no extra spaces before/after the key
- Try regenerating the key on the platform
- Make sure key hasn't been revoked

### "Cannot read environment variable"

- Ensure variable is in `.env` file in root directory
- Check variable name matches exactly (case-sensitive)
- Restart your terminal/process after adding variables
- Try: `source .env` to reload variables

### "Permission denied"

- Check API key has correct permissions
- Verify your account on the platform is active
- Ensure you're not rate-limited

---

## 📚 Next Steps

After adding environment variables:

1. **Test**: `npm run marketing:post`
2. **Check** if posts appeared on platforms
3. **Set up automation**: `npm run marketing:schedule`
4. **Monitor logs**: `cat scripts/marketing-posts-log.json`

---

## 🔗 Quick Links

- [Medium API Docs](https://github.com/Medium/medium-api-docs)
- [Dev.to API Docs](https://developers.forem.com/api)
- [Hashnode API Docs](https://api.hashnode.com/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

---

Need help? Check:
- [Quick Start Guide](MARKETING_QUICK_START.md)
- [Full Documentation](MARKETING_AUTOMATION_GUIDE.md)

