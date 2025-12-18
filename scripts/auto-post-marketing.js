/**
 * Automatic Marketing Post Generator and Publisher
 * 
 * This script generates promotional content about your platform
 * and automatically posts it to various platforms.
 * 
 * Supported Platforms:
 * - Medium
 * - LinkedIn
 * - WordPress
 * - Blogger
 * - Dev.to
 * - Hashnode
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  // Your platform details
  platform: {
    name: 'Sell Earn Direct',
    url: 'https://sellearndirect.com',
    tagline: 'Create & Sell Digital Products Online',
    description: 'Build beautiful sales funnels and sell digital products with ease.',
    ctaLink: 'https://sellearndirect.com/auth/signup',
  },

  // API Keys (reads from environment variables or config file)
  apiKeys: {
    medium: process.env.MEDIUM_API_KEY,
    linkedin: process.env.LINKEDIN_ACCESS_TOKEN,
    wordpress: {
      url: process.env.WORDPRESS_URL,
      username: process.env.WORDPRESS_USERNAME,
      password: process.env.WORDPRESS_APP_PASSWORD
    },
    devto: process.env.DEVTO_API_KEY,
    hashnode: process.env.HASHNODE_API_KEY,
    hashnodePublicationId: process.env.HASHNODE_PUBLICATION_ID
  },

  // Posting schedule (which platforms to post to)
  // Can be overridden by ENABLED_PLATFORMS env variable
  // Note: Medium API is no longer available for new users
  enabledPlatforms: process.env.ENABLED_PLATFORMS 
    ? process.env.ENABLED_PLATFORMS.split(',').map(p => p.trim())
    : ['devto', 'hashnode'] // Medium removed - API no longer available
};

// ============================================
// CONTENT TEMPLATES
// ============================================
const contentTemplates = [
  {
    title: "How to Build and Sell Your First Digital Product in India",
    category: "tutorial",
    keywords: ["digitalproducts", "onlinebusiness", "india", "passiveincome"],
    content: `
Are you a creator, educator, or entrepreneur looking to monetize your knowledge? Building and selling digital products is one of the best ways to create passive income in 2024.

## Why Digital Products?

Digital products have several advantages:
- **No inventory costs**: Create once, sell unlimited times
- **High profit margins**: 90%+ profit on every sale
- **Global reach**: Sell to anyone, anywhere
- **Automated delivery**: No shipping, no fulfillment hassles

## What You Can Sell

Popular digital products include:
- 📚 eBooks and guides
- 🎓 Online courses
- 🎨 Design templates
- 💻 Code snippets and plugins
- 🎵 Music and audio files
- 📹 Video content

## How to Get Started

With platforms like **${CONFIG.platform.name}**, you can:

1. **Create beautiful sales pages** without coding
2. **Upload your digital products** (up to 500MB)
3. **Accept payments** via Razorpay (all Indian payment methods)
4. **Track sales and analytics** in real-time
5. **Deliver products automatically** to customers

## Real Success Stories

Our users are making real money:
- Amit S. made ₹75,000 in 3 weeks
- Priya K. earned ₹1,20,000 in first month
- Meera G. now makes ₹2,50,000 monthly

## Start Your Journey Today

Building a digital product business doesn't require technical skills. With the right platform, you can launch your first product in under an hour.

👉 **[Start selling now →](${CONFIG.platform.ctaLink})**

---
*This post is brought to you by [${CONFIG.platform.name}](${CONFIG.platform.url}) - The easiest way to sell digital products in India.*
    `
  },
  {
    title: "5 Reasons Why Sales Funnels Are Essential for Digital Product Creators",
    category: "marketing",
    keywords: ["salesfunnel", "conversion", "digitalmarketing", "onlinesales"],
    content: `
If you're selling digital products, you need a sales funnel. Here's why.

## What is a Sales Funnel?

A sales funnel is a strategic path that guides potential customers from discovery to purchase. Think of it as your 24/7 sales representative.

## Why You Need One

### 1. Higher Conversion Rates
A well-designed funnel can convert 3-5x more visitors into customers compared to a simple "buy now" button.

### 2. Build Trust Gradually
Funnels educate your audience about your product's value before asking for the sale.

### 3. Capture Leads
Even if someone doesn't buy immediately, you can capture their email for future marketing.

### 4. Upsell and Cross-sell
Increase average order value by offering complementary products.

### 5. Automated Sales
Once set up, your funnel works 24/7 without manual intervention.

## Essential Funnel Components

A high-converting funnel includes:
- 🎯 Compelling headline
- 📹 Product demo video
- 💎 Clear value proposition
- 💰 Transparent pricing
- ✅ Social proof (testimonials)
- 🔒 Secure payment gateway

## Build Your Funnel in Minutes

You don't need to be a designer or developer. Modern platforms like **${CONFIG.platform.name}** offer:
- Pre-built templates
- Drag-and-drop customization
- Mobile-responsive designs
- Payment integration
- Analytics dashboard

## Get Started

Ready to boost your sales with a professional funnel?

👉 **[Create your funnel →](${CONFIG.platform.ctaLink})**

---
*Discover how [${CONFIG.platform.name}](${CONFIG.platform.url}) helps creators build high-converting sales funnels in minutes.*
    `
  },
  {
    title: "Complete Guide to Accepting Payments for Digital Products in India",
    category: "guide",
    keywords: ["razorpay", "payments", "india", "ecommerce"],
    content: `
Accepting online payments in India has become easier than ever. Here's your complete guide.

## Payment Methods Indians Use

Your payment gateway should support:
- 💳 Credit/Debit Cards
- 📱 UPI (GPay, PhonePe, Paytm)
- 🏦 Net Banking
- 💰 Digital Wallets
- 📧 EMI options

## Why Razorpay?

Razorpay is the leading payment gateway in India because:
- Trusted by 8M+ businesses
- Supports all popular payment methods
- Quick 2-day settlements
- Competitive pricing (2% + GST)
- Easy integration

## Setting Up Payments

With the right platform, payment setup is simple:

1. **Sign up for Razorpay** (Free account)
2. **Complete KYC** (Required by RBI)
3. **Get API keys**
4. **Connect to your sales funnel**
5. **Start accepting payments**

## Important Considerations

### Transaction Fees
- Razorpay: ~2% + GST per transaction
- International cards: ~3% + GST

### Settlement Time
- Domestic: 2 working days
- International: 3-7 days

### Tax Compliance
- Collect 18% GST on digital services
- Issue proper invoices
- File GST returns

## All-in-One Solution

Platforms like **${CONFIG.platform.name}** handle everything:
- ✅ Payment gateway integration
- ✅ Automatic invoicing
- ✅ Instant product delivery
- ✅ Refund management
- ✅ Payment analytics

No coding required!

## Start Selling Today

Don't let payment complexity stop you from selling online.

👉 **[Set up in 5 minutes →](${CONFIG.platform.ctaLink})**

---
*[${CONFIG.platform.name}](${CONFIG.platform.url}) provides built-in Razorpay integration for hassle-free payment collection.*
    `
  },
  {
    title: "How I Built a ₹1 Lakh/Month Digital Product Business (No Tech Skills Required)",
    category: "case-study",
    keywords: ["entrepreneur", "passiveincome", "sidehustle", "india"],
    content: `
A year ago, I had an idea but no technical skills. Today, I'm making ₹1+ lakh monthly selling digital products. Here's my story.

## The Beginning

I'm a content writer with expertise in digital marketing. I realized I was answering the same questions repeatedly for clients. That's when I decided to create a comprehensive guide.

## My First Product

**"Complete Instagram Marketing Playbook for Indian Businesses"**
- Format: PDF eBook (120 pages)
- Price: ₹499
- Creation time: 2 weeks

## The Challenge

I didn't know:
- How to create a sales page
- How to accept payments
- How to deliver the product
- How to track sales

Hiring a developer would cost ₹20,000-50,000. That wasn't an option.

## The Solution

I found **${CONFIG.platform.name}** and everything changed.

Within 2 hours, I had:
✅ A professional sales page
✅ Razorpay payment setup
✅ Automatic PDF delivery
✅ Analytics dashboard

Total cost: Just ₹199/month

## Results

**Month 1:** 12 sales = ₹5,988
**Month 3:** 47 sales = ₹23,453
**Month 6:** 89 sales = ₹44,411
**Month 12:** 215 sales = ₹1,07,285

## What I Learned

1. **Start before you're ready**: My first version wasn't perfect, but I improved based on feedback.

2. **Marketing > Product**: A good product with great marketing beats a great product with no marketing.

3. **Leverage existing audiences**: I promoted on LinkedIn, Twitter, and Facebook groups.

4. **Collect testimonials**: Social proof is crucial for conversions.

5. **Keep learning**: I studied top funnels and applied what worked.

## My Current Setup

Today I sell:
- 📚 3 eBooks (₹299-₹999)
- 🎓 1 video course (₹2,499)
- 📋 Template bundle (₹199)

All running on **${CONFIG.platform.name}** with zero technical maintenance.

## You Can Do This Too

If a non-technical content writer can build a digital product business, so can you.

What do you know that others would pay to learn?

👉 **[Start your journey →](${CONFIG.platform.ctaLink})**

---
*Built with [${CONFIG.platform.name}](${CONFIG.platform.url}) - Create and sell digital products without coding.*
    `
  }
];

// ============================================
// PLATFORM POSTING FUNCTIONS
// ============================================

/**
 * Post to Medium
 */
async function postToMedium(article) {
  try {
    console.log('Posting to Medium...');
    
    // Get user ID first
    const userResponse = await axios.get('https://api.medium.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${CONFIG.apiKeys.medium}`,
        'Content-Type': 'application/json'
      }
    });

    const userId = userResponse.data.data.id;

    // Create post
    const response = await axios.post(
      `https://api.medium.com/v1/users/${userId}/posts`,
      {
        title: article.title,
        contentFormat: 'markdown',
        content: article.content,
        tags: article.keywords,
        publishStatus: 'public',
        canonicalUrl: CONFIG.platform.url
      },
      {
        headers: {
          'Authorization': `Bearer ${CONFIG.apiKeys.medium}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Posted to Medium:', response.data.data.url);
    return { success: true, url: response.data.data.url };
  } catch (error) {
    console.error('❌ Medium error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Post to Dev.to
 */
async function postToDevTo(article) {
  try {
    console.log('Posting to Dev.to...');
    
    const response = await axios.post(
      'https://dev.to/api/articles',
      {
        article: {
          title: article.title,
          body_markdown: article.content,
          published: true,
          tags: article.keywords.slice(0, 4), // Dev.to allows max 4 tags
          canonical_url: CONFIG.platform.url
        }
      },
      {
        headers: {
          'api-key': CONFIG.apiKeys.devto,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Posted to Dev.to:', response.data.url);
    return { success: true, url: response.data.url };
  } catch (error) {
    console.error('❌ Dev.to error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Post to Hashnode
 */
async function postToHashnode(article) {
  try {
    console.log('Posting to Hashnode...');
    
    // Updated Hashnode GraphQL API endpoint
    const response = await axios.post(
      'https://gql.hashnode.com/',
      {
        query: `
          mutation PublishPost($input: PublishPostInput!) {
            publishPost(input: $input) {
              post {
                id
                slug
                url
              }
            }
          }
        `,
        variables: {
          input: {
            title: article.title,
            contentMarkdown: article.content,
            tags: article.keywords.slice(0, 5).map(tag => ({
              slug: tag.toLowerCase().replace(/\s+/g, '-'),
              name: tag
            })),
            publicationId: CONFIG.apiKeys.hashnodePublicationId,
            // Optional: add canonical URL
            // canonicalUrl: CONFIG.platform.url
          }
        }
      },
      {
        headers: {
          'Authorization': CONFIG.apiKeys.hashnode,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.errors) {
      throw new Error(JSON.stringify(response.data.errors));
    }

    const url = response.data.data.publishPost.post.url;
    console.log('✅ Posted to Hashnode:', url);
    return { success: true, url };
  } catch (error) {
    console.error('❌ Hashnode error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Post to WordPress
 */
async function postToWordPress(article) {
  try {
    console.log('Posting to WordPress...');
    
    const auth = Buffer.from(
      `${CONFIG.apiKeys.wordpress.username}:${CONFIG.apiKeys.wordpress.password}`
    ).toString('base64');

    const response = await axios.post(
      `${CONFIG.apiKeys.wordpress.url}/wp-json/wp/v2/posts`,
      {
        title: article.title,
        content: article.content.replace(/\n/g, '<br>'),
        status: 'publish',
        tags: article.keywords
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Posted to WordPress:', response.data.link);
    return { success: true, url: response.data.link };
  } catch (error) {
    console.error('❌ WordPress error:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function publishContent() {
  console.log('🚀 Starting automatic content publishing...\n');
  console.log(`Platform: ${CONFIG.platform.name}`);
  console.log(`URL: ${CONFIG.platform.url}\n`);

  // Validate API keys
  console.log('🔑 Checking API keys...');
  const missingKeys = [];
  
  // Skip Medium validation since it's not available anymore
  if (CONFIG.enabledPlatforms.includes('devto') && !CONFIG.apiKeys.devto) {
    missingKeys.push('DEVTO_API_KEY');
  }
  if (CONFIG.enabledPlatforms.includes('hashnode') && !CONFIG.apiKeys.hashnode) {
    missingKeys.push('HASHNODE_API_KEY');
  }
  if (CONFIG.enabledPlatforms.includes('hashnode') && !CONFIG.apiKeys.hashnodePublicationId) {
    missingKeys.push('HASHNODE_PUBLICATION_ID');
  }
  if (CONFIG.enabledPlatforms.includes('wordpress') && (!CONFIG.apiKeys.wordpress.url || !CONFIG.apiKeys.wordpress.username || !CONFIG.apiKeys.wordpress.password)) {
    missingKeys.push('WORDPRESS_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD');
  }
  
  if (missingKeys.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missingKeys.forEach(key => console.error(`   - ${key}`));
    console.error('\nPlease add these to your .env file.');
    console.error('See ENV_VARIABLES_FOR_MARKETING.md for instructions.\n');
    process.exit(1);
  }
  
  console.log('✅ All required API keys found\n');

  // Select a random article or cycle through them
  const article = contentTemplates[Math.floor(Math.random() * contentTemplates.length)];
  
  console.log(`📝 Publishing: "${article.title}"\n`);

  const results = [];

  // Post to each enabled platform
  for (const platform of CONFIG.enabledPlatforms) {
    let result;
    
    switch (platform) {
      case 'medium':
        result = await postToMedium(article);
        break;
      case 'devto':
        result = await postToDevTo(article);
        break;
      case 'hashnode':
        result = await postToHashnode(article);
        break;
      case 'wordpress':
        result = await postToWordPress(article);
        break;
      default:
        console.log(`⚠️  Unknown platform: ${platform}`);
        continue;
    }

    results.push({ platform, ...result });
    
    // Wait 2 seconds between posts to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Save results to log file
  const logFile = path.join(__dirname, 'marketing-posts-log.json');
  const logs = fs.existsSync(logFile) 
    ? JSON.parse(fs.readFileSync(logFile, 'utf8')) 
    : [];
  
  logs.push({
    timestamp: new Date().toISOString(),
    article: article.title,
    results
  });
  
  fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));

  console.log('\n' + '='.repeat(50));
  console.log('📊 Publishing Summary');
  console.log('='.repeat(50));
  
  results.forEach(r => {
    const status = r.success ? '✅' : '❌';
    const info = r.success ? r.url : r.error;
    console.log(`${status} ${r.platform}: ${info}`);
  });

  console.log('\n✨ Done! Check marketing-posts-log.json for details.\n');
}

// Run the script
if (require.main === module) {
  publishContent().catch(console.error);
}

module.exports = { publishContent, contentTemplates };

