# SellEarnDirect Branding Guide

## 🎨 Modern & Classy Logo System

We've created a premium, modern logo system for **SellEarnDirect** with refined aesthetics and professional polish.

### Logo Variants

1. **logo.svg** - Full horizontal logo (for light backgrounds)
   - Stacked "Sell" and "Earn" text with "Direct" accent
   - Modern typography with tight letter-spacing
   - Perfect for headers, marketing materials

2. **logo-white.svg** - Full horizontal logo (for dark backgrounds)
   - White/light variant optimized for dark surfaces
   - Maintains gradient effects for visual interest
   - Perfect for footers, dark hero sections

3. **logo-icon.svg** - Premium icon (40x40)
   - Enhanced with glow effects and subtle shadows
   - Refined arrow and dollar symbol design
   - Perfect for navigation bars, favicons, app icons

4. **favicon.ico** - Browser icon (32x32)
   - Optimized for small sizes
   - Maintains brand recognition at any scale

## Brand Identity

### Logo Design Philosophy
- **Modern & Classy**: Clean lines, refined gradients, premium feel
- **Arrow Symbol**: Directional flow representing "Direct" connection to customers
- **Dollar Icon**: Emerald green accent for earning and monetization
- **Gradient Effects**: Sophisticated indigo → purple → pink gradient
- **Glow & Shadow**: Subtle depth effects for premium appearance
- **Typography**: SF Pro Display-inspired, bold, tight spacing

### Color Palette
- Primary: Indigo (#6366F1)
- Secondary: Purple (#8B5CF6)
- Accent: Pink (#EC4899)
- Success: Green (#10B981)

### Brand Message
"Create sales funnels and sell digital products with ease"

## Usage in Code

### React Component (Recommended)
```tsx
import Logo from '@/components/Logo';

// Default usage
<Logo />

// Icon only
<Logo showText={false} />

// White variant (for dark backgrounds)
<Logo variant="white" />

// Gradient text variant (modern & classy)
<Logo variant="gradient" />

// With subtitle (for dashboard)
<Logo showSubtitle={true} size="lg" />

// Different sizes
<Logo size="sm" />   // Small (h-6 w-6)
<Logo size="md" />   // Medium (h-8 w-8) - default
<Logo size="lg" />   // Large (h-10 w-10)
<Logo size="xl" />   // Extra Large (h-12 w-12)

// Custom styling
<Logo className="h-16 w-16" textClassName="text-2xl" />

// No link (just display)
<Logo href="" />
```

### Direct Image Usage
```tsx
// Light backgrounds
<img src="/logo-icon.svg" alt="SellEarnDirect" className="h-8 w-8" />

// Dark backgrounds
<img src="/logo-white.svg" alt="SellEarnDirect" className="h-8 w-8" />
```

## Where the Logo is Used

### Public Pages
- ✅ **Header** (src/components/Header.tsx)
- ✅ **Navbar** (src/components/Navbar.tsx)
- ✅ **Landing Page** (src/app/page.tsx)
- ✅ **Landing V2** (src/app/landing/page.tsx)
- ✅ **Footer** (all pages)
- ✅ **Browser Tab** (favicon)

### Dashboard
- ✅ **Desktop Sidebar** (src/components/layouts/dashboard-layout.tsx)
  - Collapsible with hover expand
  - Gradient text treatment
  - "Sales Funnels" subtitle
  
- ✅ **Mobile Sidebar** (src/components/layouts/dashboard-layout.tsx)
  - Full logo with branding
  - Optimized touch target
  
### SEO & Metadata
- ✅ **Page Title** (SEO metadata)
- ✅ **Open Graph Images** (social sharing)
- ✅ **Apple Touch Icons** (iOS devices)

## SEO & Metadata

The site metadata has been updated in `src/app/layout.tsx`:
```tsx
title: 'SellEarnDirect - Create Sales Funnels & Sell Digital Products'
description: 'Create high-converting sales funnels and sell your digital products with ease...'
icons: {
  icon: '/favicon.ico',
  apple: '/logo-icon.svg',
}
```

## Brand Guidelines

### Do's
✅ Use the logo with clear space around it
✅ Maintain aspect ratio when scaling
✅ Use provided color palette
✅ Use white variant on dark backgrounds

### Don'ts
❌ Don't distort or stretch the logo
❌ Don't change colors arbitrarily
❌ Don't add effects (shadows, outlines) to logo
❌ Don't use low-resolution versions

## Future Updates

If you need to update the logo:
1. Update the SVG files in `/public`
2. Clear browser cache
3. Test on all pages
4. Update this guide if needed

---

**Last Updated:** October 2025
**Brand Name:** SellEarnDirect
**Created for:** Website Builder SaaS Platform
