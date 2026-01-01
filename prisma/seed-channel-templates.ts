const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 🎨 Minimalist Template Only
const channelTemplates = [
  {
    name: 'Minimalist',
    description: 'Clean and simple design perfect for any type of content. Focus on your work without distractions.',
    category: 'Minimal',
    isDefault: true,
    isActive: true,
    isPremium: false,
    previewImage: '/templates/minimalist-preview.jpg',
    layout: {
      type: 'single-column',
      header: 'centered',
      productGrid: '3-column',
      spacing: 'comfortable'
    },
    sections: {
      hero: {
        enabled: true,
        style: 'minimal',
        showCover: true,
        showProfile: true,
        showWelcome: true
      },
      products: {
        enabled: true,
        layout: 'grid',
        columns: 3,
        showPrice: true,
        showDescription: true
      },
      about: {
        enabled: true,
        position: 'sidebar'
      },
      subscription: {
        enabled: true,
        style: 'card',
        position: 'top'
      }
    },
    defaultTheme: {
      colors: {
        primary: '#000000',
        secondary: '#ffffff',
        accent: '#6366f1',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        background: '#ffffff',
        cardBackground: '#f8fafc'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      },
      borderRadius: '12px',
      shadows: {
        small: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        large: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    }
  }
];


// 🎨 Professional Channel Templates
const channelTemplates_OLD = [
  {
    name: 'Minimalist',
    description: 'Modern gradient design with bold typography. Perfect for tech products, software, and SaaS offerings.',
    category: 'Tech',
    isDefault: false,
    isActive: true,
    isPremium: false,
    previewImage: '/templates/tech-preview.jpg',
    layout: {
      type: 'split-screen',
      header: 'left-aligned',
      productGrid: '2-column',
      spacing: 'compact'
    },
    sections: {
      hero: {
        enabled: true,
        style: 'gradient',
        showCover: true,
        showProfile: true,
        showWelcome: true,
        showStats: true
      },
      products: {
        enabled: true,
        layout: 'grid',
        columns: 2,
        showPrice: true,
        showDescription: true,
        showTags: true
      },
      about: {
        enabled: true,
        position: 'main'
      },
      subscription: {
        enabled: true,
        style: 'banner',
        position: 'floating'
      },
      testimonials: {
        enabled: true
      }
    },
    defaultTheme: {
      colors: {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        text: '#0f172a',
        textSecondary: '#475569',
        border: '#e2e8f0',
        background: '#ffffff',
        cardBackground: '#f8fafc'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      },
      borderRadius: '16px',
      shadows: {
        small: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        large: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    }
  },
  {
    name: 'Education',
    description: 'Warm and inviting design for courses and educational content. Makes learning feel accessible.',
    category: 'Education',
    isDefault: false,
    isActive: true,
    isPremium: false,
    previewImage: '/templates/education-preview.jpg',
    layout: {
      type: 'sidebar-right',
      header: 'centered',
      productGrid: '2-column',
      spacing: 'comfortable'
    },
    sections: {
      hero: {
        enabled: true,
        style: 'welcoming',
        showCover: true,
        showProfile: true,
        showWelcome: true,
        showCredentials: true
      },
      products: {
        enabled: true,
        layout: 'list',
        showPrice: true,
        showDescription: true,
        showDuration: true,
        showLevel: true
      },
      about: {
        enabled: true,
        position: 'sidebar'
      },
      subscription: {
        enabled: true,
        style: 'card',
        position: 'sidebar'
      },
      faq: {
        enabled: true
      }
    },
    defaultTheme: {
      colors: {
        primary: '#f59e0b',
        secondary: '#10b981',
        accent: '#3b82f6',
        text: '#1e293b',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        background: '#fffbeb',
        cardBackground: '#ffffff'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      },
      borderRadius: '12px',
      shadows: {
        small: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        large: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    }
  },
  {
    name: 'Creative Portfolio',
    description: 'Bold and artistic design that puts your work front and center. Perfect for designers and creators.',
    category: 'Creative',
    isDefault: false,
    isActive: true,
    isPremium: true,
    previewImage: '/templates/creative-preview.jpg',
    layout: {
      type: 'masonry',
      header: 'overlay',
      productGrid: 'masonry',
      spacing: 'tight'
    },
    sections: {
      hero: {
        enabled: true,
        style: 'fullscreen',
        showCover: true,
        showProfile: true,
        showWelcome: true,
        showPortfolio: true
      },
      products: {
        enabled: true,
        layout: 'masonry',
        showPrice: true,
        showDescription: false,
        hoverEffect: 'zoom'
      },
      about: {
        enabled: true,
        position: 'main'
      },
      subscription: {
        enabled: true,
        style: 'minimal',
        position: 'bottom'
      },
      gallery: {
        enabled: true
      }
    },
    defaultTheme: {
      colors: {
        primary: '#1a1a1a',
        secondary: '#ec4899',
        accent: '#f59e0b',
        text: '#0f172a',
        textSecondary: '#64748b',
        border: '#e2e8f0',
        background: '#ffffff',
        cardBackground: '#fafafa'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      },
      borderRadius: '8px',
      shadows: {
        small: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        large: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    }
  },
  {
    name: 'Business Professional',
    description: 'Corporate and trustworthy design for business services and professional consulting.',
    category: 'Business',
    isDefault: false,
    isActive: true,
    isPremium: false,
    previewImage: '/templates/business-preview.jpg',
    layout: {
      type: 'sidebar-left',
      header: 'professional',
      productGrid: '2-column',
      spacing: 'comfortable'
    },
    sections: {
      hero: {
        enabled: true,
        style: 'professional',
        showCover: true,
        showProfile: true,
        showWelcome: true,
        showCredentials: true,
        showStats: true
      },
      products: {
        enabled: true,
        layout: 'list',
        showPrice: true,
        showDescription: true,
        showFeatures: true
      },
      about: {
        enabled: true,
        position: 'main'
      },
      subscription: {
        enabled: true,
        style: 'professional',
        position: 'sidebar'
      },
      testimonials: {
        enabled: true
      },
      contact: {
        enabled: true
      }
    },
    defaultTheme: {
      colors: {
        primary: '#1e40af',
        secondary: '#0891b2',
        accent: '#10b981',
        text: '#0f172a',
        textSecondary: '#475569',
        border: '#cbd5e1',
        background: '#f8fafc',
        cardBackground: '#ffffff'
      },
      fonts: {
        heading: 'Inter',
        body: 'Inter',
        mono: 'JetBrains Mono'
      },
      borderRadius: '8px',
      shadows: {
        small: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        medium: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        large: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }
    }
  }
];

async function seedChannelTemplates() {
  console.log('🌱 Seeding channel templates...');

  try {
    // Step 1: Find or create Minimalist template
    let minimalistTemplate = await prisma.channelTemplate.findFirst({
      where: { name: 'Minimalist' }
    });

    if (!minimalistTemplate) {
      console.log('📝 Creating Minimalist template...');
      minimalistTemplate = await prisma.channelTemplate.create({
        data: channelTemplates[0]
      });
      console.log(`  ✅ Created template: ${minimalistTemplate.name}`);
    } else {
      console.log('🔄 Updating Minimalist template...');
      minimalistTemplate = await prisma.channelTemplate.update({
        where: { id: minimalistTemplate.id },
        data: channelTemplates[0]
      });
      console.log(`  ✅ Updated template: ${minimalistTemplate.name}`);
    }

    // Step 2: Update all channels to use Minimalist template
    console.log('🔄 Updating all channels to use Minimalist template...');
    const updatedChannels = await prisma.channel.updateMany({
      where: {
        templateId: {
          not: minimalistTemplate.id
        }
      },
      data: {
        templateId: minimalistTemplate.id
      }
    });
    console.log(`  ✅ Updated ${updatedChannels.count} channel(s) to use Minimalist template`);

    // Step 3: Delete all other templates (now safe since no channels reference them)
    console.log('🗑️  Deleting all other templates...');
    const deleted = await prisma.channelTemplate.deleteMany({
      where: {
        id: {
          not: minimalistTemplate.id
        }
      }
    });
    console.log(`  ✅ Deleted ${deleted.count} other template(s)`);

    // Step 4: Ensure Minimalist is set as default
    await prisma.channelTemplate.update({
      where: { id: minimalistTemplate.id },
      data: {
        isDefault: true,
        isActive: true
      }
    });

    console.log('\n🎉 Successfully seeded channel templates!');
    console.log('   - Template: Minimalist (Default)');
    console.log('   - Only one template available for users');
    console.log(`   - All ${updatedChannels.count} existing channel(s) updated to use Minimalist`);

  } catch (error) {
    console.error('❌ Error seeding templates:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedChannelTemplates()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

module.exports = { seedChannelTemplates, channelTemplates };

