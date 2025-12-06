/**
 * Seed Brand Configuration Script
 * Initializes default branding settings in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEFAULT_CONFIG = {
  siteName: 'SellEarnDirect',
  siteTagline: 'Sell Digital Products with Ease',
  siteDescription: 'Create sales funnels and sell digital products directly to your customers',
  supportEmail: 'support@sellearndirect.com',
  companyName: 'SellEarnDirect',
  footerText: `© ${new Date().getFullYear()} SellEarnDirect. All rights reserved.`,
  logoUrl: '/logo.svg',
  faviconUrl: '/favicon.ico',
};

async function seedBrandConfig() {
  console.log('🌱 Seeding brand configuration...\n');

  try {
    // Check if branding settings already exist
    const existingSettings = await prisma.platformSettings.findMany({
      where: {
        key: {
          startsWith: 'brand.'
        }
      }
    });

    if (existingSettings.length > 0) {
      console.log('✅ Brand configuration already exists in database.');
      console.log('   To update, use the Super Admin dashboard or delete existing entries first.\n');
      console.log('   Existing settings:');
      existingSettings.forEach(setting => {
        console.log(`   - ${setting.key}: ${setting.value}`);
      });
      return;
    }

    console.log('Creating default brand configuration...\n');

    const settings = [
      { 
        key: 'brand.siteName', 
        value: DEFAULT_CONFIG.siteName, 
        description: 'Site name displayed throughout the platform',
        category: 'branding'
      },
      { 
        key: 'brand.siteTagline', 
        value: DEFAULT_CONFIG.siteTagline, 
        description: 'Site tagline or short description',
        category: 'branding'
      },
      { 
        key: 'brand.siteDescription', 
        value: DEFAULT_CONFIG.siteDescription, 
        description: 'Full site description for SEO',
        category: 'branding'
      },
      { 
        key: 'brand.supportEmail', 
        value: DEFAULT_CONFIG.supportEmail, 
        description: 'Support email address',
        category: 'branding'
      },
      { 
        key: 'brand.companyName', 
        value: DEFAULT_CONFIG.companyName, 
        description: 'Company legal name',
        category: 'branding'
      },
      { 
        key: 'brand.footerText', 
        value: DEFAULT_CONFIG.footerText, 
        description: 'Footer copyright text',
        category: 'branding'
      },
      { 
        key: 'brand.logoUrl', 
        value: DEFAULT_CONFIG.logoUrl, 
        description: 'Path to site logo',
        category: 'branding'
      },
      { 
        key: 'brand.faviconUrl', 
        value: DEFAULT_CONFIG.faviconUrl, 
        description: 'Path to favicon',
        category: 'branding'
      },
    ];

    for (const setting of settings) {
      await prisma.platformSettings.create({
        data: {
          ...setting,
          isActive: true
        }
      });
      console.log(`✅ Created: ${setting.key} = ${setting.value}`);
    }

    console.log('\n🎉 Brand configuration seeded successfully!\n');
    console.log('You can now:');
    console.log('1. View/edit settings in Super Admin dashboard > Settings tab');
    console.log('2. Change site name and branding from one place');
    console.log('3. All site references will automatically update\n');

  } catch (error) {
    console.error('❌ Error seeding brand configuration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedBrandConfig()
  .catch((error) => {
    console.error('Failed to seed brand configuration:', error);
    process.exit(1);
  });

