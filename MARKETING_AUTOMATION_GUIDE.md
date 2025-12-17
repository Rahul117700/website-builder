# 🚀 Marketing Automation Guide

Automatically post promotional content about your platform to multiple blogging platforms to drive traffic and awareness.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Supported Platforms](#supported-platforms)
3. [Setup Instructions](#setup-instructions)
4. [Getting API Keys](#getting-api-keys)
5. [Running the Script](#running-the-script)
6. [Automation Options](#automation-options)
7. [Customizing Content](#customizing-content)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This automation system:
- ✅ **Automatically generates** promotional blog posts about your platform
- ✅ **Posts to multiple platforms** (Medium, Dev.to, Hashnode, WordPress, etc.)
- ✅ **Includes backlinks** to drive traffic to sellearndirect.com
- ✅ **Tracks posting history** to avoid duplicates
- ✅ **Schedules posts** at regular intervals
- ✅ **SEO optimized** content with proper keywords

## Supported Platforms

Currently supports:

| Platform | Free Account | Monthly Reach | Best For |
|----------|--------------|---------------|----------|
| **Medium** | ✅ Yes | 100K+ | General audience |
| **Dev.to** | ✅ Yes | 500K+ | Developers & tech |
| **Hashnode** | ✅ Yes | 200K+ | Tech bloggers |
| **WordPress** | ✅ Yes | Unlimited | Your own blog |
| **LinkedIn** | 🚧 Coming soon | Professional network |
| **Twitter/X** | 🚧 Coming soon | Quick updates |

---

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

### Step 2: Get API Keys

See [Getting API Keys](#getting-api-keys) section below for detailed instructions.

### Step 3: Configure

Create a file `config/marketing-config.js`:

```bash
cp config/marketing-config.example.js config/marketing-config.js
```

Edit `config/marketing-config.js` and add your API keys.

### Step 4: Test Run

Run a single post to test:

```bash
node scripts/auto-post-marketing.js
```

This will post one article to all enabled platforms.

---

## Getting API Keys

### 🔵 Medium

1. Go to https://medium.com/me/settings/security
2. Scroll to "Integration tokens"
3. Enter a description: "Marketing Automation"
4. Click "Get integration token"
5. Copy the token
6. Add to config: `MEDIUM_API_KEY: 'your_token_here'`

**Note**: Medium allows posting but not scheduling. Posts will be published immediately.

---

### 💚 Dev.to

1. Go to https://dev.to/settings/extensions
2. Generate API Key
3. Copy the key
4. Add to config: `DEVTO_API_KEY: 'your_key_here'`

**Limits**: 
- Max 4 tags per post
- Posts appear immediately

---

### 🔷 Hashnode

1. Go to https://hashnode.com/settings/developer
2. Generate Personal Access Token
3. Create or select your publication
4. Get Publication ID from URL (e.g., `https://hashnode.com/YOUR_PUBLICATION_ID/dashboard`)
5. Add to config:
```javascript
HASHNODE_API_KEY: 'your_token',
HASHNODE_PUBLICATION_ID: 'your_publication_id'
```

---

### 📘 WordPress

For WordPress.com or self-hosted:

1. Go to https://wordpress.com/me/security/application-passwords
2. Create new Application Password
3. Name it "Marketing Automation"
4. Copy the password
5. Add to config:
```javascript
WORDPRESS_URL: 'https://yourblog.wordpress.com',
WORDPRESS_USERNAME: 'your_username',
WORDPRESS_APP_PASSWORD: 'xxxx xxxx xxxx xxxx'
```

For self-hosted WordPress:
- URL should be your blog's URL (e.g., `https://blog.sellearndirect.com`)
- Enable Application Passwords in WordPress settings

---

## Running the Script

### Option 1: Manual Single Post

Post one article immediately:

```bash
node scripts/auto-post-marketing.js
```

### Option 2: Scheduled Posting

Run continuously with automatic posting:

```bash
node scripts/schedule-marketing-posts.js
```

This will:
- Post immediately on start
- Then post every 24 hours (configurable)
- Cycle through all articles
- Keep running until stopped (Ctrl+C)

### Option 3: Cron Job (Recommended)

Add to your crontab for reliability:

```bash
# Edit crontab
crontab -e

# Add this line to post daily at 10 AM
0 10 * * * cd /path/to/website-builder && node scripts/auto-post-marketing.js >> logs/marketing-cron.log 2>&1

# Or every 3 days
0 10 */3 * * cd /path/to/website-builder && node scripts/auto-post-marketing.js >> logs/marketing-cron.log 2>&1
```

### Option 4: PM2 (For VPS)

Keep script running permanently:

```bash
# Install PM2
npm install -g pm2

# Start scheduler
pm2 start scripts/schedule-marketing-posts.js --name "marketing-automation"

# View logs
pm2 logs marketing-automation

# Stop
pm2 stop marketing-automation

# Restart
pm2 restart marketing-automation
```

---

## Automation Options

### Configure Posting Frequency

Edit `scripts/schedule-marketing-posts.js`:

```javascript
// Post every 24 hours
const INTERVAL_HOURS = 24;

// Post every 12 hours
const INTERVAL_HOURS = 12;

// Post weekly
const INTERVAL_HOURS = 168;
```

### Select Platforms

Edit `scripts/auto-post-marketing.js`:

```javascript
enabledPlatforms: ['medium', 'devto', 'hashnode']

// Or just Medium and Dev.to
enabledPlatforms: ['medium', 'devto']
```

---

## Customizing Content

### Add Your Own Articles

Edit `scripts/auto-post-marketing.js`:

```javascript
const contentTemplates = [
  {
    title: "Your Article Title",
    category: "tutorial", // tutorial, guide, case-study, marketing
    keywords: ["keyword1", "keyword2", "keyword3"],
    content: `
Your markdown content here...

Include links back to your site:
[Get Started](${CONFIG.platform.ctaLink})
    `
  },
  // Add more articles...
];
```

### Customize Platform Details

```javascript
platform: {
  name: 'Sell Earn Direct',
  url: 'https://sellearndirect.com',
  tagline: 'Create & Sell Digital Products Online',
  description: 'Your custom description',
  ctaLink: 'https://sellearndirect.com/auth/signup',
}
```

### Pre-made Article Templates

The script includes 4 ready-to-use articles:

1. **"How to Build and Sell Your First Digital Product in India"**
   - Tutorial for beginners
   - Keywords: digital products, online business, India

2. **"5 Reasons Why Sales Funnels Are Essential"**
   - Marketing focused
   - Keywords: sales funnel, conversion, digital marketing

3. **"Complete Guide to Accepting Payments in India"**
   - Technical guide
   - Keywords: payment gateway, Razorpay, digital payments

4. **"How I Built a ₹1 Lakh/Month Business"**
   - Success story / case study
   - Keywords: passive income, side hustle, case study

---

## Monitoring Results

### Check Posting Logs

View the log file:

```bash
cat scripts/marketing-posts-log.json
```

Example log entry:
```json
{
  "timestamp": "2024-12-18T10:00:00.000Z",
  "article": "How to Build and Sell Your First Digital Product",
  "results": [
    {
      "platform": "medium",
      "success": true,
      "url": "https://medium.com/@yourname/..."
    },
    {
      "platform": "devto",
      "success": true,
      "url": "https://dev.to/yourname/..."
    }
  ]
}
```

### Check Posted Articles

```bash
cat scripts/posted-articles.json
```

### Track Traffic

Monitor traffic from these platforms in:
- Google Analytics
- Your dashboard analytics
- Referral sources

Expected traffic sources:
- `medium.com`
- `dev.to`
- `hashnode.dev`
- etc.

---

## Best Practices

### 1. **Post Frequency**
- Don't spam: Maximum 1 post per day per platform
- Recommended: 1 post every 2-3 days
- Quality > Quantity

### 2. **Content Strategy**
- Mix tutorial, guide, and case study content
- Keep articles informative, not just promotional
- Include real value for readers
- Natural inclusion of your platform

### 3. **SEO Optimization**
- Use relevant keywords
- Include backlinks naturally
- Optimize titles for search
- Add canonical URLs

### 4. **Engagement**
- Respond to comments on your posts
- Build community around your content
- Share on social media
- Cross-promote articles

### 5. **Compliance**
- Follow each platform's terms of service
- Don't spam or auto-comment
- Provide genuine value
- Disclose promotional content appropriately

---

## Troubleshooting

### "API Key Invalid" Error

**Problem**: Authentication failed

**Solution**:
1. Check API key is copied correctly (no extra spaces)
2. Verify API key hasn't expired
3. Ensure you have necessary permissions
4. Regenerate API key if needed

### "Rate Limit Exceeded"

**Problem**: Too many requests

**Solution**:
1. Increase delay between posts (edit script)
2. Post less frequently
3. Wait for rate limit to reset (usually 1 hour)

### "Post Already Exists"

**Problem**: Duplicate content detected

**Solution**:
1. Medium and Dev.to check for duplicates
2. Change article title slightly
3. Add unique introduction
4. Post to different platform

### Posts Not Appearing

**Problem**: Posts published but not visible

**Solution**:
1. Check spam/moderation queue
2. Verify account is in good standing
3. Wait a few minutes (can take time to appear)
4. Check platform's community guidelines

### Script Stops Running

**Problem**: Scheduler stops unexpectedly

**Solution**:
1. Use PM2 for auto-restart
2. Check error logs
3. Ensure server has enough memory
4. Verify API keys still valid

---

## Advanced Features

### Add More Platforms

To add LinkedIn, Twitter, etc., edit `scripts/auto-post-marketing.js`:

```javascript
async function postToLinkedIn(article) {
  // Add LinkedIn API integration
}

async function postToTwitter(article) {
  // Add Twitter API integration
}
```

### Webhook Notifications

Get notified when posts are published:

```javascript
// Add to script
async function sendWebhookNotification(results) {
  await axios.post('YOUR_WEBHOOK_URL', {
    message: 'New post published',
    results
  });
}
```

### Analytics Tracking

Track which articles drive most traffic:

```javascript
// Add UTM parameters to links
const ctaLink = `${CONFIG.platform.ctaLink}?utm_source=${platform}&utm_medium=blog&utm_campaign=auto_post`;
```

---

## Support & Resources

- **Script Location**: `scripts/auto-post-marketing.js`
- **Scheduler**: `scripts/schedule-marketing-posts.js`
- **Config**: `config/marketing-config.js`
- **Logs**: `scripts/marketing-posts-log.json`

### Platform Documentation

- [Medium API](https://github.com/Medium/medium-api-docs)
- [Dev.to API](https://developers.forem.com/api)
- [Hashnode API](https://api.hashnode.com/)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)

---

## Quick Start Checklist

- [ ] Install dependencies (`npm install axios`)
- [ ] Copy config file
- [ ] Get API keys for platforms
- [ ] Add API keys to config
- [ ] Test run: `node scripts/auto-post-marketing.js`
- [ ] Check if posts appeared on platforms
- [ ] Set up automation (PM2 or cron)
- [ ] Monitor results in logs
- [ ] Track traffic increase

---

## Expected Results

After running for 1 month:

- **Posts**: 10-15 articles across platforms
- **Views**: 5,000-20,000 depending on platform
- **Traffic**: 100-500 visitors to your site
- **Backlinks**: 10-15 quality backlinks
- **SEO**: Improved domain authority

The goal is **consistent, quality content** that builds awareness and drives targeted traffic over time.

---

## Questions?

If you need help:
1. Check logs: `cat scripts/marketing-posts-log.json`
2. Test individual platforms
3. Verify API keys
4. Check platform documentation

Happy automating! 🚀

