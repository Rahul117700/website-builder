const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProfessionalTemplates() {
  console.log('🎨 Seeding professional channel templates...');

  const templates = [
    {
      id: 'modern-portfolio-pro',
      name: 'Modern Portfolio Pro',
      description: 'Clean, modern single-page design perfect for creators and professionals. Features smooth animations and elegant sections.',
      category: 'Creative',
      previewImage: '/templates/modern-portfolio.jpg',
      layout: {
        type: 'single-page',
        structure: {
          header: { type: 'hero', hasAvatar: true, hasBackground: true },
          sections: ['about', 'products-grid', 'cta'],
          footer: { hasCopyright: true },
        },
      },
      sections: {
        hero: { enabled: true, customizable: true },
        about: { enabled: true, layout: 'centered' },
        productsGrid: { enabled: true, columns: 3 },
        subscribe: { enabled: true, style: 'cta' },
      },
      defaultTheme: {
        colors: {
          primary: '#6366f1',
          secondary: '#8b5cf6',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          textSecondary: '#cbd5e1',
        },
        fonts: {
          heading: 'Inter, system-ui, sans-serif',
          body: 'Inter, system-ui, sans-serif',
        },
        spacing: '2rem',
        borderRadius: '0.5rem',
      },
      isDefault: false,
      isActive: true,
      isPremium: false,
    },
    {
      id: 'minimalist-showcase',
      name: 'Minimalist Showcase',
      description: 'Ultra-clean design focusing on your content. Perfect for photographers, designers, and creators who want their work to shine.',
      category: 'Minimal',
      previewImage: '/templates/minimalist-showcase.jpg',
      layout: {
        type: 'multi-page',
        structure: {
          navigation: { type: 'fixed', position: 'top' },
          hero: { type: 'fullscreen', layout: 'centered' },
          sections: ['portfolio-masonry', 'about-split', 'pricing'],
        },
      },
      sections: {
        navigation: { enabled: true, style: 'fixed' },
        hero: { enabled: true, layout: 'fullscreen' },
        portfolio: { enabled: true, layout: 'masonry' },
        about: { enabled: true, layout: 'split' },
        pricing: { enabled: true },
      },
      defaultTheme: {
        colors: {
          primary: '#000000',
          secondary: '#ffffff',
          accent: '#3b82f6',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#111827',
          textSecondary: '#6b7280',
        },
        fonts: {
          heading: 'Playfair Display, serif',
          body: 'Source Sans Pro, sans-serif',
        },
        spacing: '4rem',
        borderRadius: '0',
      },
      isDefault: false,
      isActive: true,
      isPremium: false,
    },
    {
      id: 'creative-studio',
      name: 'Creative Studio',
      description: 'Bold, creative design with vibrant colors and animations. Perfect for artists, musicians, and creative professionals.',
      category: 'Creative',
      previewImage: '/templates/creative-studio.jpg',
      layout: {
        type: 'animated',
        structure: {
          header: { type: 'animated', style: 'gradient-wave' },
          sections: ['video-hero', 'carousel', 'cards-3d', 'full-width-cta'],
        },
      },
      sections: {
        header: { enabled: true, animated: true },
        videoHero: { enabled: true, hasOverlay: true },
        carousel: { enabled: true, autoplay: true },
        services: { enabled: true, layout: '3-column', style: 'hover-3d' },
        cta: { enabled: true, fullWidth: true },
      },
      defaultTheme: {
        colors: {
          primary: '#ec4899',
          secondary: '#8b5cf6',
          accent: '#f59e0b',
          background: '#0a0a0a',
          surface: '#1a1a1a',
          text: '#ffffff',
          textSecondary: '#a1a1aa',
        },
        fonts: {
          heading: 'Montserrat, sans-serif',
          body: 'Open Sans, sans-serif',
        },
        spacing: '3rem',
        borderRadius: '1rem',
        effects: {
          gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
          glow: '0 0 20px rgba(236, 72, 153, 0.5)',
        },
      },
      isDefault: false,
      isActive: true,
      isPremium: true,
    },
    {
      id: 'business-professional',
      name: 'Business Professional',
      description: 'Professional corporate design for consultants, coaches, and business professionals. Clean, trustworthy, and conversion-focused.',
      category: 'Business',
      previewImage: '/templates/business-professional.jpg',
      layout: {
        type: 'corporate',
        structure: {
          header: { type: 'standard', hasLogo: true, hasNavigation: true, hasCTA: true },
          hero: { type: 'split', hasImage: true, hasBadge: true },
          sections: ['icon-grid', 'testimonials', 'bio', 'contact-form'],
        },
      },
      sections: {
        header: { enabled: true, style: 'corporate' },
        hero: { enabled: true, layout: 'split' },
        services: { enabled: true, layout: '4-column', hasIcons: true },
        testimonials: { enabled: true, slider: true },
        about: { enabled: true, layout: 'sidebar-content' },
        contact: { enabled: true, hasForm: true },
      },
      defaultTheme: {
        colors: {
          primary: '#2563eb',
          secondary: '#1e40af',
          accent: '#10b981',
          background: '#ffffff',
          surface: '#f3f4f6',
          text: '#1f2937',
          textSecondary: '#6b7280',
        },
        fonts: {
          heading: 'Poppins, sans-serif',
          body: 'Inter, sans-serif',
        },
        spacing: '3rem',
        borderRadius: '0.375rem',
      },
      isDefault: false,
      isActive: true,
      isPremium: true,
    },
    {
      id: 'tech-saas',
      name: 'Tech & SaaS',
      description: 'Modern, sleek design perfect for tech creators, developers, and SaaS products. Features dark mode and tech-focused aesthetics.',
      category: 'Tech',
      previewImage: '/templates/tech-saas.jpg',
      layout: {
        type: 'tech-modern',
        structure: {
          header: { type: 'glass', style: 'glassmorphism', darkMode: true },
          hero: { type: 'gradient-tech', hasParticles: true, hasCode: true },
          sections: ['bento-grid', 'interactive-demo', 'pricing-comparison'],
        },
      },
      sections: {
        header: { enabled: true, style: 'glass', darkMode: true },
        hero: { enabled: true, animated: true, hasParticles: true },
        features: { enabled: true, layout: 'bento-grid' },
        demo: { enabled: true, interactive: true },
        pricing: { enabled: true, style: 'comparison' },
      },
      defaultTheme: {
        colors: {
          primary: '#3b82f6',
          secondary: '#06b6d4',
          accent: '#10b981',
          background: '#0f172a',
          surface: '#1e293b',
          surfaceLight: '#334155',
          text: '#f1f5f9',
          textSecondary: '#94a3b8',
          code: '#f472b6',
        },
        fonts: {
          heading: 'Space Grotesk, monospace',
          body: 'Inter, sans-serif',
          code: 'Fira Code, monospace',
        },
        spacing: '4rem',
        borderRadius: '1rem',
        effects: {
          glass: 'backdrop-blur(10px) bg-white/10',
          glow: '0 0 30px rgba(59, 130, 246, 0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      },
      isDefault: false,
      isActive: true,
      isPremium: true,
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const template of templates) {
    try {
      const existing = await prisma.channelTemplate.findUnique({
        where: { id: template.id },
      });

      if (existing) {
        console.log(`⏭️  Skipping "${template.name}" - already exists`);
        skipped++;
        continue;
      }

      await prisma.channelTemplate.create({
        data: template,
      });

      console.log(`✅ Created template: "${template.name}" ${template.isPremium ? '(Premium)' : '(Free)'}`);
      created++;
    } catch (error) {
      console.error(`❌ Error creating template "${template.name}":`, error);
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total: ${created + skipped}`);
}

seedProfessionalTemplates()
  .then(async () => {
    console.log('\n🎉 Professional templates seeded successfully!');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error seeding templates:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

module.exports = { seedProfessionalTemplates };
