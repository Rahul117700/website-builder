-- Seed Professional Channel Templates
-- Run this after the basic template seed to add more professional templates

-- Template 1: Modern Portfolio (Inspired by HTML5 UP Dimension)
INSERT INTO "channel_templates" (id, name, description, "previewImage", "htmlSchema", "cssSchema", "isPremium", "createdAt", "updatedAt")
VALUES (
  'modern-portfolio-pro',
  'Modern Portfolio Pro',
  'Clean, modern single-page design perfect for creators and professionals. Features smooth animations and elegant sections.',
  '/templates/modern-portfolio.jpg',
  '{
    "structure": {
      "header": {
        "type": "hero",
        "content": {
          "title": "{{channelName}}",
          "subtitle": "{{channelDescription}}",
          "avatar": "{{profileImage}}",
          "background": "{{coverImage}}"
        }
      },
      "sections": [
        {
          "id": "about",
          "type": "about",
          "title": "About",
          "content": "{{welcomeMessage}}"
        },
        {
          "id": "products",
          "type": "grid",
          "title": "Products & Content",
          "columns": 3,
          "items": "{{products}}"
        },
        {
          "id": "subscribe",
          "type": "cta",
          "title": "Subscribe",
          "content": "Get exclusive access to all content",
          "button": "Subscribe Now"
        }
      ],
      "footer": {
        "copyright": "© {{year}} {{channelName}}. All rights reserved."
      }
    }
  }',
  '{
    "colors": {
      "primary": "#6366f1",
      "secondary": "#8b5cf6",
      "background": "#0f172a",
      "surface": "#1e293b",
      "text": "#f8fafc",
      "textSecondary": "#cbd5e1"
    },
    "fonts": {
      "heading": "Inter, system-ui, sans-serif",
      "body": "Inter, system-ui, sans-serif"
    },
    "layout": {
      "maxWidth": "1200px",
      "spacing": "2rem",
      "borderRadius": "0.5rem"
    },
    "animations": {
      "transition": "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "hoverScale": "1.02"
    }
  }',
  false,
  NOW(),
  NOW()
);

-- Template 2: Minimalist Showcase (Inspired by HTML5 UP Stellar)
INSERT INTO "channel_templates" (id, name, description, "previewImage", "htmlSchema", "cssSchema", "isPremium", "createdAt", "updatedAt")
VALUES (
  'minimalist-showcase',
  'Minimalist Showcase',
  'Ultra-clean design focusing on your content. Perfect for photographers, designers, and creators who want their work to shine.',
  '/templates/minimalist-showcase.jpg',
  '{
    "structure": {
      "navigation": {
        "type": "fixed",
        "position": "top",
        "items": ["Home", "Portfolio", "About", "Contact"]
      },
      "hero": {
        "type": "fullscreen",
        "layout": "centered",
        "content": {
          "logo": "{{profileImage}}",
          "title": "{{channelName}}",
          "tagline": "{{channelDescription}}",
          "cta": "Explore"
        }
      },
      "sections": [
        {
          "id": "portfolio",
          "type": "masonry",
          "title": "Portfolio",
          "layout": "masonry",
          "items": "{{products}}"
        },
        {
          "id": "about",
          "type": "split",
          "layout": "image-text",
          "image": "{{coverImage}}",
          "content": "{{welcomeMessage}}"
        },
        {
          "id": "pricing",
          "type": "pricing",
          "title": "Access Plans",
          "showSubscription": true
        }
      ]
    }
  }',
  '{
    "colors": {
      "primary": "#000000",
      "secondary": "#ffffff",
      "accent": "#3b82f6",
      "background": "#ffffff",
      "surface": "#f9fafb",
      "text": "#111827",
      "textSecondary": "#6b7280"
    },
    "fonts": {
      "heading": "Playfair Display, serif",
      "body": "Source Sans Pro, sans-serif"
    },
    "layout": {
      "maxWidth": "1400px",
      "spacing": "4rem",
      "borderRadius": "0"
    },
    "effects": {
      "shadow": "0 10px 30px rgba(0,0,0,0.1)",
      "hoverShadow": "0 20px 40px rgba(0,0,0,0.15)"
    }
  }',
  false,
  NOW(),
  NOW()
);

-- Template 3: Creative Studio (Inspired by modern agency sites)
INSERT INTO "channel_templates" (id, name, description, "previewImage", "htmlSchema", "cssSchema", "isPremium", "createdAt", "updatedAt")
VALUES (
  'creative-studio',
  'Creative Studio',
  'Bold, creative design with vibrant colors and animations. Perfect for artists, musicians, and creative professionals.',
  '/templates/creative-studio.jpg',
  '{
    "structure": {
      "header": {
        "type": "animated",
        "style": "gradient-wave",
        "content": {
          "title": "{{channelName}}",
          "subtitle": "{{channelDescription}}",
          "background": "gradient-animated"
        }
      },
      "sections": [
        {
          "id": "intro",
          "type": "video-hero",
          "video": "{{coverImage}}",
          "overlay": true,
          "content": "{{welcomeMessage}}"
        },
        {
          "id": "featured",
          "type": "carousel",
          "title": "Featured Work",
          "items": "{{products}}",
          "autoplay": true
        },
        {
          "id": "services",
          "type": "cards",
          "title": "What I Offer",
          "layout": "3-column",
          "style": "hover-3d"
        },
        {
          "id": "cta",
          "type": "full-width-cta",
          "background": "gradient",
          "content": {
            "title": "Ready to Get Started?",
            "button": "Subscribe to Channel"
          }
        }
      ]
    }
  }',
  '{
    "colors": {
      "primary": "#ec4899",
      "secondary": "#8b5cf6",
      "accent": "#f59e0b",
      "background": "#0a0a0a",
      "surface": "#1a1a1a",
      "text": "#ffffff",
      "textSecondary": "#a1a1aa"
    },
    "fonts": {
      "heading": "Montserrat, sans-serif",
      "body": "Open Sans, sans-serif"
    },
    "layout": {
      "maxWidth": "1600px",
      "spacing": "3rem",
      "borderRadius": "1rem"
    },
    "animations": {
      "duration": "0.6s",
      "easing": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      "parallax": true
    },
    "effects": {
      "gradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
      "glow": "0 0 20px rgba(236, 72, 153, 0.5)"
    }
  }',
  true,
  NOW(),
  NOW()
);

-- Template 4: Business Professional (Clean corporate style)
INSERT INTO "channel_templates" (id, name, description, "previewImage", "htmlSchema", "cssSchema", "isPremium", "createdAt", "updatedAt")
VALUES (
  'business-professional',
  'Business Professional',
  'Professional corporate design for consultants, coaches, and business professionals. Clean, trustworthy, and conversion-focused.',
  '/templates/business-professional.jpg',
  '{
    "structure": {
      "header": {
        "type": "standard",
        "logo": "{{profileImage}}",
        "navigation": ["Services", "Portfolio", "About", "Contact"],
        "cta": "Get Started"
      },
      "hero": {
        "type": "split-hero",
        "image": "{{coverImage}}",
        "content": {
          "badge": "Professional Services",
          "title": "{{channelName}}",
          "description": "{{channelDescription}}",
          "buttons": ["View Services", "Schedule Call"]
        }
      },
      "sections": [
        {
          "id": "services",
          "type": "icon-grid",
          "title": "Services Offered",
          "layout": "4-column",
          "items": "{{products}}"
        },
        {
          "id": "testimonials",
          "type": "testimonial-slider",
          "title": "Client Success Stories"
        },
        {
          "id": "about",
          "type": "bio",
          "layout": "sidebar-content",
          "content": "{{welcomeMessage}}"
        },
        {
          "id": "contact",
          "type": "contact-form",
          "title": "Lets Work Together"
        }
      ]
    }
  }',
  '{
    "colors": {
      "primary": "#2563eb",
      "secondary": "#1e40af",
      "accent": "#10b981",
      "background": "#ffffff",
      "surface": "#f3f4f6",
      "text": "#1f2937",
      "textSecondary": "#6b7280"
    },
    "fonts": {
      "heading": "Poppins, sans-serif",
      "body": "Inter, sans-serif"
    },
    "layout": {
      "maxWidth": "1280px",
      "spacing": "3rem",
      "borderRadius": "0.375rem"
    },
    "components": {
      "button": {
        "padding": "0.75rem 2rem",
        "fontWeight": "600",
        "shadow": "0 4px 6px rgba(0,0,0,0.1)"
      },
      "card": {
        "padding": "2rem",
        "shadow": "0 1px 3px rgba(0,0,0,0.1)"
      }
    }
  }',
  true,
  NOW(),
  NOW()
);

-- Template 5: Tech & SaaS (Modern tech product style)
INSERT INTO "channel_templates" (id, name, description, "previewImage", "htmlSchema", "cssSchema", "isPremium", "createdAt", "updatedAt")
VALUES (
  'tech-saas',
  'Tech & SaaS',
  'Modern, sleek design perfect for tech creators, developers, and SaaS products. Features dark mode and tech-focused aesthetics.',
  '/templates/tech-saas.jpg',
  '{
    "structure": {
      "header": {
        "type": "glass",
        "style": "glassmorphism",
        "logo": "{{profileImage}}",
        "navigation": ["Features", "Docs", "Pricing"],
        "darkMode": true
      },
      "hero": {
        "type": "gradient-tech",
        "animation": "particles",
        "content": {
          "title": "{{channelName}}",
          "subtitle": "{{channelDescription}}",
          "code": true,
          "buttons": ["Get Started", "View Docs"]
        }
      },
      "sections": [
        {
          "id": "features",
          "type": "feature-grid",
          "title": "What You Get",
          "layout": "bento-grid",
          "items": "{{products}}"
        },
        {
          "id": "demo",
          "type": "interactive-demo",
          "title": "See It In Action"
        },
        {
          "id": "pricing",
          "type": "pricing-table",
          "title": "Choose Your Plan",
          "style": "comparison"
        }
      ]
    }
  }',
  '{
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#06b6d4",
      "accent": "#10b981",
      "background": "#0f172a",
      "surface": "#1e293b",
      "surfaceLight": "#334155",
      "text": "#f1f5f9",
      "textSecondary": "#94a3b8",
      "code": "#f472b6"
    },
    "fonts": {
      "heading": "Space Grotesk, monospace",
      "body": "Inter, sans-serif",
      "code": "Fira Code, monospace"
    },
    "layout": {
      "maxWidth": "1400px",
      "spacing": "4rem",
      "borderRadius": "1rem"
    },
    "effects": {
      "glass": "backdrop-blur(10px) bg-white/10",
      "glow": "0 0 30px rgba(59, 130, 246, 0.3)",
      "border": "1px solid rgba(255,255,255,0.1)"
    }
  }',
  true,
  NOW(),
  NOW()
);

