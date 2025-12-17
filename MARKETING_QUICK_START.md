# 🚀 Marketing Automation - Quick Start

Automatically post promotional content about Sell Earn Direct to blogging platforms to drive traffic.

## ⚡ 5-Minute Setup (No Medium Needed!)

### ⚠️ Update: Medium API No Longer Available
Medium has restricted API access for new users. **Good news**: Dev.to + Hashnode are even better for driving traffic!

### 1. Run Setup Script

```bash
npm run marketing:setup
```

This installs dependencies and creates config files.

### 2. Get API Keys (Just 2 Platforms!)

#### Dev.to (2 minutes) - Super Easy!
1. Go to https://dev.to/settings/extensions
2. Click "Generate API Key"
3. Copy the key
4. **Reach**: 900K+ developers

#### Hashnode (5 minutes) - Your Own Blog!
1. Go to https://hashnode.com/settings/developer
2. Generate "Personal Access Token"
3. Create a blog (if you don't have one)
4. Get your Publication ID from dashboard URL
5. **Reach**: 500K+ monthly readers

### 3. Add Keys to .env File

Add these to your `.env` file:

```bash
# Dev.to (Required)
DEVTO_API_KEY=paste_your_devto_key_here

# Hashnode (Required)
HASHNODE_API_KEY=paste_your_hashnode_token_here
HASHNODE_PUBLICATION_ID=paste_your_publication_id_here

# Configuration
POST_INTERVAL_HOURS=24
ENABLED_PLATFORMS=devto,hashnode
```

**That's it! Just 2 platforms, super simple!**

### 4. Test It

```bash
npm run marketing:post
```

This posts one article to all platforms. Check if it worked!

### 5. Automate It

**Option A: Continuous Running**
```bash
npm run marketing:schedule
```

**Option B: PM2 (Best for VPS)**
```bash
npm install -g pm2
pm2 start scripts/schedule-marketing-posts.js --name marketing
pm2 save
pm2 startup
```

**Option C: Cron Job (Daily at 10 AM)**
```bash
crontab -e
# Add this line:
0 10 * * * cd /path/to/website-builder && npm run marketing:post >> logs/marketing.log 2>&1
```

---

## 📊 What Gets Posted?

The script includes 4 high-quality articles that post to **Dev.to & Hashnode**:

1. **"How to Build and Sell Your First Digital Product in India"**
   - Tutorial for beginners
   - Drives sign-ups

2. **"5 Reasons Why Sales Funnels Are Essential"**
   - Marketing focused
   - Educates about features

3. **"Complete Guide to Accepting Payments in India"**
   - Solves common problems
   - Builds trust

4. **"How I Built a ₹1 Lakh/Month Business"**
   - Success story
   - Inspires action

All articles:
- ✅ Include natural backlinks to sellearndirect.com
- ✅ Have proper SEO keywords
- ✅ Provide real value to readers
- ✅ Include call-to-action buttons
- ✅ Automatically formatted for each platform

## 💡 Why Dev.to + Hashnode Are Better Than Medium

| Feature | Medium | Dev.to + Hashnode |
|---------|--------|-------------------|
| **API Access** | ❌ Restricted | ✅ Full access |
| **Cost** | $5/mo to read | ✅ Free forever |
| **Reach** | ~100K | ✅ 1.4M+ users |
| **SEO** | Limited | ✅ Excellent |
| **Your Brand** | No | ✅ Own blog on Hashnode |
| **Tech Audience** | Mixed | ✅ Perfect match |

---

## 🎯 Expected Results (Dev.to + Hashnode)

### Week 1
- 3-4 posts on Dev.to & Hashnode
- 800-1,500 views (Dev.to has higher engagement!)
- 15-40 visitors to your site
- 6-8 quality backlinks

### Month 1
- 10-15 posts published
- 5,000-10,000 views
- 100-300 visitors to your site
- 10-15 quality backlinks
- Improved SEO

### Month 3
- 30+ posts across platforms
- 20,000-30,000 views (Dev.to community is very active!)
- 500-800 visitors
- Better domain authority
- Consistent traffic stream
- Growing Hashnode blog following

**Note**: Dev.to often drives MORE traffic than Medium for tech/business content!

---

## 📝 Available Commands

```bash
# One-time post (test)
npm run marketing:post

# Continuous scheduled posting
npm run marketing:schedule

# Setup script
npm run marketing:setup
```

---

## 🔍 Monitoring

### Check Posting Logs
```bash
cat scripts/marketing-posts-log.json
```

### View Which Articles Posted
```bash
cat scripts/posted-articles.json
```

### See What's Next
```bash
# Articles will post in rotation:
# 1. First article → All platforms
# 2. Wait 24 hours
# 3. Second article → All platforms
# 4. And so on...
```

---

## ⚙️ Configuration

### Change Posting Frequency

Edit `scripts/schedule-marketing-posts.js`:

```javascript
// Post every 24 hours (default)
const INTERVAL_HOURS = 24;

// Post every 12 hours
const INTERVAL_HOURS = 12;

// Post every 2 days
const INTERVAL_HOURS = 48;

// Post weekly
const INTERVAL_HOURS = 168;
```

### Select Platforms

Edit your `.env` file:

```bash
# Both platforms (recommended)
ENABLED_PLATFORMS=devto,hashnode

# Only Dev.to
ENABLED_PLATFORMS=devto

# Only Hashnode
ENABLED_PLATFORMS=hashnode

# With WordPress (if you have it)
ENABLED_PLATFORMS=devto,hashnode,wordpress
```

---

## 🎨 Customize Content

### Add Your Own Articles

Edit `scripts/auto-post-marketing.js`:

Add new articles to `contentTemplates` array:

```javascript
{
  title: "Your Custom Article Title",
  category: "tutorial",
  keywords: ["keyword1", "keyword2", "keyword3"],
  content: `
Your article content in Markdown format...

Make sure to include links to your site:
[Get Started](https://sellearndirect.com/auth/signup)

---
*Built with [Sell Earn Direct](https://sellearndirect.com)*
  `
}
```

---

## ❓ Troubleshooting

### "API Key Invalid"
- Double-check you copied the full key
- No spaces before/after the key
- Key hasn't expired
- Try regenerating the key

### "Posts not appearing"
- Wait 2-3 minutes (platforms need processing time)
- Check your profile on the platform
- Verify account is not restricted
- Check spam/moderation queue

### "Script stops"
- Use PM2 for auto-restart
- Check logs: `pm2 logs marketing`
- Ensure VPS has enough memory
- Verify all API keys are valid

### "Rate limit exceeded"
- Wait 1 hour
- Reduce posting frequency
- Post to fewer platforms

---

## 📚 Full Documentation

For detailed information, see:
- **[Full Guide](MARKETING_AUTOMATION_GUIDE.md)** - Complete documentation
- **[Script](scripts/auto-post-marketing.js)** - Main posting script
- **[Scheduler](scripts/schedule-marketing-posts.js)** - Automation script

---

## 🎯 Best Practices

1. **Start Small**: Test with 1-2 platforms first
2. **Quality First**: Don't spam, provide value
3. **Be Patient**: SEO and traffic takes 2-3 months
4. **Engage**: Respond to comments on your posts
5. **Track Results**: Monitor traffic in Google Analytics
6. **Iterate**: Add more articles based on what works

---

## 🆘 Need Help?

1. Check the logs first
2. Read the [full guide](MARKETING_AUTOMATION_GUIDE.md)
3. Test each platform individually
4. Verify API keys in platform settings

---

## ✅ Simplified Checklist (No Medium!)

- [ ] Run `npm run marketing:setup`
- [ ] Get Dev.to API key (2 min)
- [ ] Get Hashnode API key (5 min)
- [ ] Create Hashnode blog
- [ ] Add keys to `.env` file
- [ ] Set `ENABLED_PLATFORMS=devto,hashnode`
- [ ] Test: `npm run marketing:post`
- [ ] Verify posts on Dev.to and Hashnode
- [ ] Set up automation (PM2 or cron)
- [ ] Monitor logs for first week
- [ ] Track traffic increase

**Total setup time: ~10 minutes** (instead of 20 with Medium!)

---

## 🌟 Pro Tips

1. **Track with UTM**: Add `?utm_source=medium&utm_campaign=auto_post` to links
2. **Repurpose**: Share these articles on social media too
3. **Engage**: Reply to comments to boost visibility
4. **Cross-promote**: Mention other articles in new posts
5. **Consistency**: Regular posting beats sporadic bursts

---

**Ready to drive traffic? Start with a test post:**

```bash
npm run marketing:post
```

Good luck! 🚀

