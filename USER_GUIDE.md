# 📚 Complete User Guide - Website Builder SaaS

## Table of Contents
1. [Getting Started](#getting-started)
2. [Setting Up Your Payment Gateway](#setting-up-payment-gateway)
3. [Creating Your First Funnel](#creating-your-first-funnel)
4. [Customizing Your Funnel](#customizing-your-funnel)
5. [Adding Products](#adding-products)
6. [Publishing Your Funnel](#publishing-your-funnel)
7. [Sharing and Promoting](#sharing-and-promoting)
8. [Managing Sales and Analytics](#managing-sales-and-analytics)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Welcome!

Welcome to the Website Builder SaaS platform! This platform allows you to create professional sales funnels to sell your digital products online. Whether you're selling software, videos, courses, documents, or images, we've got you covered.

### What You'll Need

Before you start, make sure you have:

✅ An account on our platform (sign up if you haven't already)  
✅ A Razorpay account for accepting payments (free to create)  
✅ Your digital product files ready to upload  
✅ Basic information about your product (name, description, price)  

---

## 💳 Setting Up Payment Gateway

**⚠️ IMPORTANT:** You **MUST** configure your payment gateway before you can publish any funnel. This is required to accept payments from customers.

### Why Razorpay?

Razorpay is India's leading payment gateway that allows you to:
- Accept credit/debit cards, UPI, net banking, and wallets
- Get instant settlements
- Track all transactions in real-time
- Secure and PCI DSS compliant

### Step 1: Create a Razorpay Account

1. Visit [https://dashboard.razorpay.com/signup](https://dashboard.razorpay.com/signup)
2. Sign up with your email and business details
3. Complete KYC verification (required for live payments)
4. For testing, you can use test mode without KYC

### Step 2: Get Your API Keys

1. Log in to your [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys** (left sidebar)
3. Click **Generate Test Keys** (for testing) or **Generate Live Keys** (for production)
4. You'll see two keys:
   - **Key ID**: Starts with `rzp_test_` or `rzp_live_`
   - **Key Secret**: Keep this private and secure

> **🔒 Security Note:** Never share your Key Secret with anyone. It's like your bank password!

### Step 3: Add Keys to Your Account

1. Log in to your dashboard
2. Click on your profile picture → **Settings**
3. Go to the **Payment Gateway** tab
4. Enter your Razorpay credentials:
   ```
   Razorpay Key ID: rzp_test_XXXXXXXXXXXX
   Razorpay Key Secret: YYYYYYYYYYYYYYYY
   Webhook Secret: (Optional - leave blank for now)
   ```
5. Click **Save Configuration**
6. You'll see a success message: "Razorpay configuration saved successfully!"

### Step 4: Verify Configuration

To verify your payment gateway is configured:
1. Check for the green checkmark next to "Payment Gateway Configured"
2. You should no longer see the yellow warning banner in your funnel customizer

---

## 🎨 Creating Your First Funnel

### What is a Funnel?

A funnel is a dedicated sales page for your product. It includes:
- Product showcase with images/videos
- Product description and features
- Pricing information
- Secure payment checkout
- Instant product delivery after payment

### Step 1: Navigate to Funnels

1. From your dashboard, click **My Funnels** in the left sidebar
2. Click the **"+ Create New Funnel"** button (top right)

### Step 2: Choose a Template

Select a template based on your product type:

| Template Type | Best For | Features |
|--------------|----------|----------|
| **Software Funnel** | Apps, tools, plugins | Clean design, feature highlights |
| **Video Sales Funnel** | Courses, tutorials, videos | 2-minute preview, video player |
| **Image Portfolio** | Photos, graphics, designs | Gallery view, image showcase |
| **Document Sales** | eBooks, PDFs, templates | Document preview, benefits list |
| **Course Funnel** | Online courses, masterclasses | Curriculum display, lesson overview |

### Step 3: Name Your Funnel

1. Enter a descriptive name (e.g., "Premium Video Course - Web Development")
2. Add an optional description
3. Click **"Create Funnel"**

🎉 Congratulations! Your funnel is created. Now let's customize it!

---

## 🎨 Customizing Your Funnel

After creating your funnel, you'll be taken to the **Funnel Customizer**. This is where you make your funnel unique.

### Understanding the Customizer Interface

The customizer has three main sections:

1. **Left Panel:** Customization tabs (Design, Content, Product, Seller Info)
2. **Center Panel:** Live preview of your funnel
3. **Top Bar:** Actions (Preview, Copy URL, Save, Publish)

### Design Tab 🎨

#### Colors
- **Primary Color:** Main theme color (buttons, highlights)
- **Secondary Color:** Accent color (gradients, secondary elements)
- **Button Color:** Call-to-action button color

**Quick Color Presets:**
- 🔮 Purple/Pink (Modern, Creative)
- 💙 Blue/Cyan (Professional, Tech)
- 💚 Green/Orange (Fresh, Energetic)
- ❤️ Red/Orange (Bold, Urgent)

#### Typography
Choose fonts that match your brand:
- **Inter:** Clean, modern, great for tech products
- **Poppins:** Friendly, rounded, good for creative products
- **Roboto:** Professional, readable, versatile
- **Playfair Display:** Elegant, premium, luxury products

#### Preview Modes
- 🖥️ **Desktop:** Full-screen view (most common)
- 📱 **Tablet:** iPad view
- 📱 **Mobile:** Smartphone view (test responsive design)

### Content Tab ✍️

#### Main Headline
- Your main selling point
- Keep it clear and benefit-focused
- Example: "Master Web Development in 30 Days"

#### Subheadline
- Supporting text that adds context
- Explain the value or outcome
- Example: "Complete video course with 50+ lessons and real-world projects"

#### Call-to-Action (CTA) Button
- Action text on your buy button
- Use action words: "Get Started Now", "Buy Now", "Start Learning"

#### Product Features
Add 4-8 key features or benefits:
- ✅ Professional quality and design
- ✅ Instant download after purchase
- ✅ Lifetime access and updates
- ✅ 24/7 customer support

**Tips for Features:**
- Focus on benefits, not just features
- Use checkmarks or icons
- Keep them concise (one line each)
- Prioritize the most important ones

#### About Section
- **Title:** "About This Product" or customize it
- **Description:** Detailed information about what's included
- Tell your product story
- Explain who it's for

### Product Tab 📦

This is where you upload and configure your digital product.

#### Product Details

1. **Product Name**
   - Clear, descriptive name
   - Example: "Complete Python Programming Course"

2. **Description**
   - Detailed product description
   - What's included, what they'll learn/get
   - 2-3 paragraphs recommended

3. **Price**
   - Enter amount in your currency
   - Example: 999 (for ₹999 or $999)
   - Make sure it's fair and competitive

4. **Product Type**
   - Software
   - Videos
   - Images
   - Documents
   - Code
   - Course

#### Uploading Your Product

1. Click **"Choose File"** button
2. Select your product file from your computer
3. Click **"Upload Product"**
4. Wait for upload to complete (progress bar will show)

**File Size Limits:**
- Regular products: 50MB max
- Videos: 500MB max
- For larger files, consider hosting externally and providing download link

**Supported Formats:**
- **Software:** .zip, .exe, .dmg, .app
- **Videos:** .mp4, .mov, .webm, .ogg
- **Images:** .jpg, .png, .gif, .svg
- **Documents:** .pdf, .doc, .docx, .txt
- **Code:** .zip (containing code files)

#### Product Images

**Main Preview Image:**
- This is the primary image customers see
- Recommended size: 1200x800px
- Clear, high-quality image
- Shows your product or outcome

**Additional Images (up to 5):**
- Screenshots, mockups, or demo images
- Gallery view for multiple angles
- Not required for video products (video serves as preview)

**Tips for Images:**
- Use professional-looking images
- Show your product in action
- Include before/after shots if relevant
- Avoid blurry or pixelated images

### Seller Info Tab 👤

Build trust with your customers by sharing your information.

#### Basic Information

1. **Name:** Your name or business name
2. **Email:** Contact email for customer support
3. **Phone:** (Optional) Phone number for inquiries
4. **Website:** (Optional) Your website URL
5. **Bio:** Short description about you or your business

#### Profile Picture

- Upload a professional photo or logo
- Recommended: 200x200px square image
- Shows next to your contact information

#### Social Links (Optional)

Add your social media profiles:
- Twitter/X
- LinkedIn  
- Instagram
- Facebook

**Why Add Seller Info?**
- Builds trust and credibility
- Provides customer support channel
- Makes your funnel look professional
- Helps with customer questions

---

## 🎥 Special: Video Funnels

Video funnels have unique features for selling video content.

### Video Preview Feature

Your video funnel includes a **free 2-minute preview** that:
- Plays the first 2 minutes of your video
- Shows a countdown timer
- Prompts purchase after 2 minutes
- Helps customers see quality before buying

### After Upload

Once you upload a video:
1. Preview player appears in the customizer
2. You can test the preview (1 minute in editor)
3. Thumbnail images are automatically generated
4. Video is compressed for fast loading

### Video Best Practices

✅ **DO:**
- Start with your best content in first 2 minutes
- Use high-quality video (1080p recommended)
- Include clear audio
- Add an intro that hooks viewers

❌ **DON'T:**
- Put title cards for full 2 minutes
- Use poor quality video
- Have long silent introductions
- Reveal everything in the preview

---

## 🚀 Publishing Your Funnel

### Pre-Publication Checklist

Before publishing, make sure you have:

- ✅ Configured Razorpay payment gateway (Settings → Payment Gateway)
- ✅ Added a product (Product tab)
- ✅ Set a valid price
- ✅ Added product images or video
- ✅ Customized headline and description
- ✅ Added seller information
- ✅ Previewed your funnel on different devices

### Publishing Steps

1. **Click "Save"** to save all your changes
2. **Click "Preview"** to see how customers will see it
3. **Click "Publish"** button (top right)

### What Happens When You Publish?

When you click Publish:

1. ✅ Funnel goes live instantly
2. ✅ Unique URL is generated
3. ✅ Payment checkout is activated
4. ✅ Status changes to "Active"
5. ✅ You can start sharing the link

### If Publishing Fails

You might see these error messages:

#### ⚠️ "Payment gateway not configured"

**Solution:**
1. Click "Go to Settings" button in the error message
2. Or navigate to Settings → Payment Gateway
3. Add your Razorpay credentials
4. Return to funnel and try publishing again

#### ⚠️ "Product not configured"

**Solution:**
1. Go to the Product tab in customizer
2. Fill in product name, description, and price
3. Upload your product file
4. Click Save and try publishing again

#### ⚠️ "Product incomplete"

**Solution:**
1. Check that product name is filled
2. Check that price is greater than 0
3. Verify product description is added
4. Save changes and publish again

### Unpublishing

To take your funnel offline:
1. Click **"Unpublish"** button
2. Confirm the action
3. Funnel is no longer accessible to customers
4. You can edit and republish anytime

---

## 📢 Sharing and Promoting

### Your Funnel URL

After publishing, your funnel gets a unique URL:
```
https://yourdomain.com/f/[unique-funnel-id]
```

### Copying the URL

1. Click the **"Copy URL"** button in the funnel customizer
2. You'll see a success message: "Funnel URL copied to clipboard!"
3. Paste it anywhere you want to share

### Where to Share Your Funnel

#### Social Media
- Facebook posts and groups
- Twitter/X tweets
- LinkedIn articles
- Instagram bio link
- Pinterest pins

#### Email Marketing
- Email newsletters
- Email signature
- Welcome emails
- Follow-up sequences

#### Website/Blog
- Blog posts
- Landing pages
- Footer links
- Popup forms

#### Advertising
- Facebook Ads
- Google Ads
- Instagram Ads
- YouTube video descriptions

#### Community Platforms
- Reddit (where allowed)
- Discord servers
- Slack communities
- Forum signatures

### Marketing Tips

1. **Create urgency:** "Limited time offer - 50% off!"
2. **Show social proof:** "Join 1,000+ satisfied customers"
3. **Offer guarantees:** "30-day money-back guarantee"
4. **Use testimonials:** Share customer success stories
5. **Run promotions:** Seasonal sales, bundle deals

---

## 📊 Managing Sales and Analytics

### Dashboard Analytics

Your dashboard shows key metrics:

- **Total Views:** How many people visited your funnel
- **Conversions:** How many purchases were made
- **Revenue:** Total money earned
- **Conversion Rate:** Percentage of visitors who bought

### Viewing Orders

1. Go to **My Funnels** page
2. Find your funnel
3. Click on **"View Analytics"** or **"Orders"**
4. See list of all purchases

### Order Information

Each order shows:
- Customer email
- Purchase date and time
- Amount paid
- Payment ID
- Order status

### Razorpay Dashboard

For detailed payment information:
1. Log in to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. View all transactions
3. See settlement status
4. Download financial reports
5. Process refunds if needed

### Customer Support

When customers contact you:

1. **For product delivery issues:**
   - Send the download link manually
   - Check order status in dashboard
   - Verify payment in Razorpay

2. **For refund requests:**
   - Process refunds through Razorpay dashboard
   - Payments → Select transaction → Issue Refund
   - Full or partial refunds available

3. **For technical issues:**
   - Check product file is accessible
   - Test download link yourself
   - Provide alternative delivery method

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot publish funnel"

**Possible Causes:**
1. Payment gateway not configured
2. No product added
3. Product missing required fields

**Solution:**
1. Check Settings → Payment Gateway
2. Go to Product tab and add product
3. Fill in all required product fields
4. Save and try again

---

#### Issue: "Product upload failed"

**Possible Causes:**
1. File too large
2. Unsupported file format
3. Network connection issue

**Solution:**
1. Check file size (under 50MB for regular, 500MB for videos)
2. Use supported formats (.zip, .pdf, .mp4, etc.)
3. Try again with stable internet
4. Compress file if too large

---

#### Issue: "Payment not working for customers"

**Possible Causes:**
1. Razorpay credentials incorrect
2. Test mode vs live mode mismatch
3. Razorpay account not activated

**Solution:**
1. Verify Razorpay keys in Settings
2. Use test keys for testing, live keys for production
3. Complete KYC in Razorpay for live payments
4. Test a purchase yourself

---

#### Issue: "Customers not receiving product"

**Possible Causes:**
1. Email going to spam
2. Download link expired
3. Product file missing

**Solution:**
1. Ask customer to check spam folder
2. Resend download link from orders page
3. Verify product file is uploaded correctly
4. Test download link yourself

---

#### Issue: "Funnel looks broken on mobile"

**Solution:**
1. Use mobile preview in customizer
2. Test on real device
3. Avoid very long text without breaks
4. Use responsive images
5. Keep design simple

---

## 💡 Best Practices

### Product Pricing

**Research Your Market:**
- Check competitor prices
- Consider your target audience
- Factor in payment gateway fees (2-3%)
- Test different price points

**Pricing Psychology:**
- ₹999 looks better than ₹1000
- Bundle products for higher value
- Offer tiered pricing (Basic, Pro, Premium)
- Use early bird discounts

### Product Quality

**Deliver Value:**
- High-quality files
- Well-organized content
- Include bonus materials
- Regular updates

**Professional Presentation:**
- Clear product images
- Detailed descriptions
- Proper file naming
- Include instructions or guide

### Customer Experience

**Fast Delivery:**
- Instant download after payment
- Clear download instructions
- Multiple file formats if applicable
- Backup delivery method

**Communication:**
- Respond to queries quickly
- Set expectations clearly
- Provide excellent support
- Ask for feedback

### Marketing

**Content Marketing:**
- Write blog posts about your product
- Create YouTube demos
- Share free samples or previews
- Build an email list

**Social Proof:**
- Collect testimonials
- Share success stories
- Show number of customers
- Display ratings/reviews

**SEO Optimization:**
- Use descriptive product names
- Write keyword-rich descriptions
- Add alt text to images
- Share on multiple platforms

### Security

**Protect Your Business:**
- Use strong passwords
- Enable 2FA on Razorpay
- Never share API secrets
- Regular backup of product files
- Monitor transactions for fraud

### Legal Considerations

**Important Notes:**
- Have clear refund policy
- Include terms of service
- Comply with local tax laws
- Collect only necessary customer data
- Respect copyright on content

---

## 🎯 Success Checklist

Use this checklist to ensure your funnel is set up for success:

### Before Publishing
- [ ] Razorpay payment gateway configured
- [ ] Product uploaded and tested
- [ ] Price set correctly
- [ ] Product images/video added
- [ ] Headline is clear and compelling
- [ ] Features list is complete
- [ ] Seller information added
- [ ] Contact email is correct
- [ ] Funnel tested on mobile
- [ ] Download link tested
- [ ] Typos and errors checked

### After Publishing
- [ ] Funnel URL copied and saved
- [ ] Test purchase completed
- [ ] Product delivery verified
- [ ] Shared on at least 3 platforms
- [ ] Added to email signature
- [ ] Linked from your website
- [ ] Set up analytics tracking
- [ ] Prepared customer support plan
- [ ] Created follow-up email sequence
- [ ] Planned first promotion

### Ongoing
- [ ] Check orders daily
- [ ] Respond to customer emails within 24 hours
- [ ] Update product based on feedback
- [ ] Analyze conversion rates monthly
- [ ] Test different price points
- [ ] A/B test headlines and images
- [ ] Add new products regularly
- [ ] Share customer testimonials
- [ ] Keep Razorpay account active
- [ ] Monitor for technical issues

---

## 🆘 Getting Help

### Support Resources

**Documentation:**
- This user guide
- Video tutorials (coming soon)
- FAQ section
- Knowledge base

**Contact Support:**
- Email: support@yourwebsite.com
- Live chat: Available in dashboard
- Support ticket: Submit from Help page

**Community:**
- Join our Facebook group
- Follow us on Twitter
- Subscribe to newsletter
- Attend webinars

### Common Questions

**Q: How long does it take to set up?**
A: Most users complete setup in 15-30 minutes.

**Q: Do I need coding skills?**
A: No! Everything is point-and-click.

**Q: Can I change funnel after publishing?**
A: Yes, unpublish, edit, and republish anytime.

**Q: How do I get paid?**
A: Payments go directly to your Razorpay account, then to your bank.

**Q: What are the fees?**
A: Only Razorpay's standard transaction fees (typically 2% + GST).

**Q: Can I sell physical products?**
A: Currently, platform is designed for digital products only.

**Q: Is there a limit on funnels or products?**
A: Check your plan details in dashboard for limits.

**Q: Can I offer discounts or coupons?**
A: Adjust price in product settings for promotions.

---

## 🎓 Video Tutorials

Coming soon! We're creating step-by-step video tutorials covering:

- Setting up Razorpay
- Creating your first funnel
- Customizing designs
- Uploading products
- Marketing strategies
- Scaling your business

Subscribe to our YouTube channel to get notified!

---

## 🚀 Next Steps

Congratulations on completing the user guide! Here's what to do next:

1. **Day 1:** Set up Razorpay payment gateway
2. **Day 2:** Create and customize your first funnel
3. **Day 3:** Upload your product and test everything
4. **Day 4:** Publish and share with your audience
5. **Day 5:** Make your first sale! 🎉

### Start Your Journey

Ready to start selling? Follow these quick steps:

1. [Configure Payment Gateway](#setting-up-payment-gateway)
2. [Create Your Funnel](#creating-your-first-funnel)
3. [Add Your Product](#adding-products)
4. [Publish and Share](#publishing-your-funnel)

---

## 📝 Quick Reference

### Essential Links

- **Razorpay Dashboard:** https://dashboard.razorpay.com/
- **Settings:** Dashboard → Settings
- **Create Funnel:** Dashboard → My Funnels → Create New
- **View Analytics:** Dashboard → Analytics

### Keyboard Shortcuts

- `Ctrl/Cmd + S` - Save funnel
- `Ctrl/Cmd + P` - Preview funnel
- `Esc` - Close modal/popups

### File Size Limits

- Regular products: 50MB
- Videos: 500MB
- Images: 5MB each
- Maximum 5 additional images

### Support Contact

- **Email:** support@yourwebsite.com
- **Response Time:** Within 24 hours
- **Emergency:** Tag as urgent in subject line

---

## 🎉 Conclusion

You now have everything you need to create successful sales funnels and start selling your digital products online!

Remember:
- **Quality matters** - Create great products
- **Marketing is key** - Share your funnels everywhere
- **Customer service** - Respond quickly and professionally
- **Keep learning** - Test, optimize, and improve

**We're here to help you succeed!** 🚀

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Happy selling! 💰

---

*Last Updated: January 2025*  
*Version: 1.0*

