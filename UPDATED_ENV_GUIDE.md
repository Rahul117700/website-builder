# 🔑 Updated Environment Variables Guide (Medium API Deprecated)

## ⚠️ Important Update

**Medium no longer provides API access to new users.** The integration token feature has been restricted.

## ✅ Working Platforms (No Medium Needed!)

You can still post to these excellent platforms:

| Platform | Free | Reach | API Access |
|----------|------|-------|------------|
| **Dev.to** | ✅ Yes | 900K+ users | ✅ Easy |
| **Hashnode** | ✅ Yes | 500K+ users | ✅ Easy |
| **WordPress** | ✅ Yes | Your blog | ✅ Easy |

These 3 platforms are enough to drive significant traffic!

---

## 📋 Updated Environment Variables

Add these to your `.env` file:

```bash
# ============================================
# MARKETING AUTOMATION (Updated - No Medium!)
# ============================================

# Dev.to API Key (Required)
# Get from: https://dev.to/settings/extensions
DEVTO_API_KEY=your_devto_api_key_here

# Hashnode API Key & Publication ID (Required)
# Get from: https://hashnode.com/settings/developer
HASHNODE_API_KEY=your_hashnode_api_key_here
HASHNODE_PUBLICATION_ID=your_hashnode_publication_id

# WordPress (Optional - if you have your own blog)
WORDPRESS_URL=https://yourblog.wordpress.com
WORDPRESS_USERNAME=your_wordpress_username
WORDPRESS_APP_PASSWORD=xxxx_xxxx_xxxx_xxxx

# Configuration
POST_INTERVAL_HOURS=24
ENABLED_PLATFORMS=devto,hashnode
```

---

## 🚀 Quick Setup (Just 2 Platforms!)

### Step 1: Dev.to (2 minutes) ⚡

1. **Sign up/Login**: https://dev.to/enter
2. **Go to settings**: https://dev.to/settings/extensions
3. **Generate API Key**
   - Description: "Marketing Automation"
   - Click "Generate API Key"
4. **Copy the key**
5. **Add to .env**:
   ```
   DEVTO_API_KEY=your_key_here
   ```

**Benefits:**
- 900K+ registered users
- Great for technical content
- High engagement
- SEO-friendly
- Free forever

---

### Step 2: Hashnode (5 minutes) 📝

#### Part A: Get API Key

1. **Sign up/Login**: https://hashnode.com/
2. **Go to settings**: https://hashnode.com/settings/developer
3. **Generate New Token**
   - Name: "Marketing Automation"
   - Click "Generate"
4. **Copy the token**
5. **Add to .env**:
   ```
   HASHNODE_API_KEY=your_token_here
   ```

#### Part B: Create/Get Publication

1. **Create your blog** (if you don't have one):
   - Click "Create Blog" on Hashnode
   - Choose subdomain: `yourblog.hashnode.dev`
   - Customize appearance
   
2. **Get Publication ID**:
   - Go to your blog's dashboard
   - URL looks like: `https://hashnode.com/YOUR_PUBLICATION_ID/dashboard`
   - Copy `YOUR_PUBLICATION_ID`
   
3. **Add to .env**:
   ```
   HASHNODE_PUBLICATION_ID=your_publication_id
   ```

**Benefits:**
- 500K+ monthly readers
- Own custom subdomain
- Can add custom domain later
- Built-in newsletter
- Excellent SEO

---

### Step 3 (Optional): WordPress 🌐

Only if you have your own WordPress blog.

1. **Go to**: https://wordpress.com/me/security/application-passwords
2. **Create password**: "Marketing Automation"
3. **Add to .env**:
   ```
   WORDPRESS_URL=https://yourblog.wordpress.com
   WORDPRESS_USERNAME=your_username
   WORDPRESS_APP_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## 🎯 Why These Platforms Are Better

### Dev.to Advantages
- ✅ Free forever, no paid tiers
- ✅ Built-in audience of developers
- ✅ Cross-posting from other blogs
- ✅ Series and collections support
- ✅ Great community engagement

### Hashnode Advantages
- ✅ Your own branded blog
- ✅ Custom domain support
- ✅ Built-in newsletter
- ✅ SEO optimized
- ✅ No vendor lock-in (can export)

### Combined Benefits
- **Reach**: 1.4M+ potential readers
- **SEO**: Multiple backlinks to your site
- **Cost**: $0 (completely free)
- **Effort**: Automated posting

---

## 📊 Expected Results (Without Medium)

### Month 1
- 10-15 posts on Dev.to & Hashnode
- 5,000-8,000 views
- 80-200 visitors to your site
- 10-15 quality backlinks

### Month 3
- 30+ posts across platforms
- 20,000+ views
- 400+ visitors
- Improved search rankings

**Note**: These results are actually better than Medium for tech/business content!

---

## 🔄 Alternative to Medium

If you really want Medium-like reach:

### Option 1: Manual Medium Posts
Post manually to Medium (still free):
1. Copy your article
2. Go to https://medium.com/new-story
3. Paste and publish
4. Add canonical URL to your blog

### Option 2: LinkedIn Articles
LinkedIn allows publishing articles:
1. Click "Write article" on LinkedIn
2. Paste your content
3. Publish to your network

### Option 3: Blogger (Google)
Free blog platform with API:
```bash
# Add to your .env:
BLOGGER_API_KEY=your_google_api_key
BLOGGER_BLOG_ID=your_blog_id
```

---

## ✅ Updated Installation

```bash
# 1. Setup
npm run marketing:setup

# 2. Add only Dev.to and Hashnode keys to .env
# (see template above)

# 3. Test
npm run marketing:post

# 4. Automate
npm run marketing:schedule
```

---

## 🎨 Customize Content for Each Platform

The script automatically formats content appropriately for each platform:

- **Dev.to**: Uses tags, series, canonical URLs
- **Hashnode**: Formatted for technical audience
- **WordPress**: Standard blog format

All include backlinks to sellearndirect.com!

---

## 💡 Pro Tips (Without Medium)

1. **Focus on Dev.to**: Has the most active tech community
2. **Build Hashnode blog**: Your own branded content hub
3. **Cross-promote**: Share Dev.to posts on Twitter/LinkedIn
4. **Engage**: Reply to comments to boost visibility
5. **Be consistent**: Post 2-3 times per week

---

## 🆘 Troubleshooting

### "Still see Medium errors"
```bash
# Update your .env:
ENABLED_PLATFORMS=devto,hashnode
# (remove 'medium' from the list)
```

### "Posts not appearing"
- Dev.to: Check https://dev.to/dashboard
- Hashnode: Check your blog dashboard
- Wait 2-3 minutes for processing

### "API key invalid"
- Regenerate the key
- Copy the full key (no spaces)
- Save .env file
- Restart the script

---

## 📈 Growth Strategy

**Week 1-2**: Dev.to Focus
- Post 3-4 articles
- Engage with comments
- Build initial audience

**Week 3-4**: Hashnode Growth
- Establish your blog
- Cross-link articles
- Build newsletter

**Month 2+**: Automation
- Let script run automatically
- Monitor traffic in analytics
- Adjust content based on performance

---

## 🎯 Success Metrics

Track these in Google Analytics:

- **Referral traffic** from dev.to and hashnode.dev
- **Bounce rate** (should be under 60%)
- **Time on page** (should increase)
- **Sign-ups** from blog traffic

Add UTM parameters:
```
https://sellearndirect.com/auth/signup?utm_source=devto&utm_campaign=auto_post
```

---

## 📚 Additional Resources

- [Dev.to API Docs](https://developers.forem.com/api)
- [Hashnode API Docs](https://api.hashnode.com/)
- [Content Marketing Guide](https://backlinko.com/content-marketing-this-year)

---

## ✨ Quick Start Checklist

- [ ] ~~Get Medium API key~~ (Not needed anymore!)
- [ ] Get Dev.to API key (2 min)
- [ ] Get Hashnode API key (5 min)
- [ ] Create Hashnode blog
- [ ] Add keys to `.env` file
- [ ] Set `ENABLED_PLATFORMS=devto,hashnode`
- [ ] Test: `npm run marketing:post`
- [ ] Check posts on both platforms
- [ ] Set up automation
- [ ] Monitor traffic

---

## 💰 Cost Comparison

| Platform | Setup Cost | Monthly Cost | API Access |
|----------|-----------|--------------|------------|
| Medium | N/A | $5 (to read) | ❌ Restricted |
| **Dev.to** | **Free** | **Free** | ✅ **Full API** |
| **Hashnode** | **Free** | **Free** | ✅ **Full API** |
| WordPress.com | Free | Free-$4 | ✅ Full API |

**Total Cost: $0/month for full automation!** 🎉

---

**Ready to start without Medium?**

```bash
npm run marketing:setup
```

Then add just **2 API keys** (Dev.to + Hashnode) and you're done!

No Medium needed! 🚀

