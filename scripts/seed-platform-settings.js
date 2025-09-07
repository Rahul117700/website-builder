const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedPlatformSettings() {
  try {
    console.log('🌱 Seeding platform settings...\n');

    // Check if settings already exist
    const existingSettings = await prisma.platformSetting.findMany();
    if (existingSettings.length > 0) {
      console.log('✅ Platform settings already exist, skipping seed...');
      return;
    }

    const settings = [
      // Database Configuration
      {
        key: 'database_url',
        value: process.env.DATABASE_URL || 'your-database-url-here',
        category: 'database',
        description: 'Database connection URL',
        isEncrypted: true
      },

      // Authentication
      {
        key: 'nextauth_url',
        value: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        category: 'auth',
        description: 'NextAuth.js base URL',
        isEncrypted: false
      },
      {
        key: 'nextauth_secret',
        value: process.env.NEXTAUTH_SECRET || 'your-nextauth-secret-key-change-this-in-production',
        category: 'auth',
        description: 'NextAuth.js secret key',
        isEncrypted: true
      },

      // OAuth Providers
      {
        key: 'google_client_id',
        value: process.env.GOOGLE_CLIENT_ID || 'your-google-client-id-here',
        category: 'oauth',
        description: 'Google OAuth Client ID',
        isEncrypted: true
      },
      {
        key: 'google_client_secret',
        value: process.env.GOOGLE_CLIENT_SECRET || 'your-google-client-secret-here',
        category: 'oauth',
        description: 'Google OAuth Client Secret',
        isEncrypted: true
      },
      {
        key: 'github_id',
        value: process.env.GITHUB_ID || 'your-github-oauth-app-id-here',
        category: 'oauth',
        description: 'GitHub OAuth App ID',
        isEncrypted: true
      },
      {
        key: 'github_secret',
        value: process.env.GITHUB_SECRET || 'your-github-oauth-app-secret-here',
        category: 'oauth',
        description: 'GitHub OAuth App Secret',
        isEncrypted: true
      },

      // AI Services
      {
        key: 'openai_api_key',
        value: process.env.OPENAI_API_KEY || 'your-openai-api-key-here',
        category: 'ai',
        description: 'OpenAI API Key',
        isEncrypted: true
      },
      {
        key: 'gemini_api_key',
        value: process.env.GEMINI_API_KEY || 'your-gemini-api-key-here',
        category: 'ai',
        description: 'Google Gemini API Key',
        isEncrypted: true
      },

      // Payment Processing
      {
        key: 'razorpay_key_id',
        value: process.env.RAZORPAY_KEY_ID || 'your-razorpay-key-id-here',
        category: 'payment',
        description: 'Razorpay Key ID',
        isEncrypted: true
      },
      {
        key: 'razorpay_key_secret',
        value: process.env.RAZORPAY_KEY_SECRET || 'your-razorpay-key-secret-here',
        category: 'payment',
        description: 'Razorpay Key Secret',
        isEncrypted: true
      },

      // Analytics
      {
        key: 'google_analytics_id',
        value: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
        category: 'analytics',
        description: 'Google Analytics Measurement ID',
        isEncrypted: false
      },

      // Domain Configuration
      {
        key: 'custom_domain_enabled',
        value: process.env.CUSTOM_DOMAIN_ENABLED || 'false',
        category: 'domain',
        description: 'Enable custom domain functionality',
        isEncrypted: false
      }
    ];

    console.log(`📝 Creating ${settings.length} platform settings...`);

    for (const setting of settings) {
      await prisma.platformSetting.create({
        data: setting
      });
      console.log(`✅ Created setting: ${setting.key}`);
    }

    console.log('\n🎉 Platform settings seeded successfully!');
    console.log('💡 Remember to update your .env file with actual values for production.');

  } catch (error) {
    console.error('❌ Error seeding platform settings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedPlatformSettings();
