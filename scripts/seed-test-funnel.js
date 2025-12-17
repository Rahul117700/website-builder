const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedTestFunnel() {
  try {
    console.log('🌱 Starting test funnel seed...\n');

    // 1. Create or get test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    
    let testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
          name: 'Test User',
          role: 'USER',
          status: 'ACTIVE',
          emailVerified: new Date(),
        }
      });
      console.log('✅ Test user created:', testUser.email);
    } else {
      console.log('✅ Test user already exists:', testUser.email);
    }

    // 2. Create or get Razorpay config for test user
    console.log('\n💳 Setting up Razorpay config...');
    let razorpayConfig = await prisma.razorpayConfig.findFirst({
      where: { userId: testUser.id, isActive: true }
    });

    if (!razorpayConfig) {
      razorpayConfig = await prisma.razorpayConfig.create({
        data: {
          userId: testUser.id,
          keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_SAMPLE_KEY_ID',
          keySecret: process.env.RAZORPAY_KEY_SECRET || 'sample_secret',
          webhookSecret: 'sample_webhook',
          accountId: 'test_account',
          isActive: true,
        }
      });
      console.log('✅ Razorpay config created');
    } else {
      console.log('✅ Razorpay config already exists');
    }

    // 3. Create or get funnel template
    console.log('\n🎨 Creating funnel template...');
    let template = await prisma.funnelTemplate.findFirst({
      where: { name: 'Test Template' }
    });

    if (!template) {
      template = await prisma.funnelTemplate.create({
        data: {
          name: 'Test Template',
          description: 'Test funnel template for automated testing',
          type: 'SOFTWARE',
          previewUrl: '/images/template-preview.jpg',
          htmlSchema: {
            colors: {
              primary: '#6366f1',
              secondary: '#8b5cf6',
              background: '#ffffff',
            },
            layout: 'modern',
            sections: ['hero', 'features', 'pricing', 'cta']
          },
          isActive: true,
        }
      });
      console.log('✅ Template created');
    } else {
      console.log('✅ Template already exists');
    }

    // 4. Create or get digital product
    console.log('\n📦 Creating digital product...');
    let product = await prisma.digitalProduct.findFirst({
      where: { 
        userId: testUser.id,
        name: 'Test Digital Product'
      }
    });

    if (!product) {
      product = await prisma.digitalProduct.create({
        data: {
          userId: testUser.id,
          name: 'Test Digital Product',
          description: 'This is a test product for automated testing. Contains valuable test content!',
          price: 2999,
          currency: 'INR',
          type: 'EBOOK',
          fileUrl: '/test-files/sample-ebook.pdf',
          previewUrl: '/test-files/preview.jpg',
          status: 'ACTIVE',
          sales: 42,
          revenue: 125958,
        }
      });
      console.log('✅ Digital product created');
    } else {
      console.log('✅ Digital product already exists');
    }

    // 5. Create or update test funnel with specific ID
    console.log('\n🎯 Creating test funnel...');
    
    // Delete existing test funnel if it exists
    await prisma.funnel.deleteMany({
      where: { id: 'test-funnel-123' }
    });

    const testFunnel = await prisma.funnel.create({
      data: {
        id: 'test-funnel-123', // Specific ID for tests
        name: 'Test Product Funnel',
        description: 'A test funnel for automated Playwright testing',
        userId: testUser.id,
        templateId: template.id,
        productId: product.id,
        status: 'ACTIVE',
        published: true,
        customizations: {
          colors: {
            primary: '#6366f1',
            secondary: '#8b5cf6',
            button: '#10b981',
          },
          headline: 'Amazing Test Product - Limited Time Offer!',
          subheadline: 'Get this incredible test product now',
          ctaText: 'Buy Now',
          features: [
            'High quality test content',
            'Instant delivery',
            '30-day money back guarantee',
          ],
        },
        sellerInfo: {
          name: 'Test Seller',
          email: 'seller@example.com',
          phone: '+91 9876543210',
          website: 'https://example.com',
          bio: 'Professional test seller with years of experience in testing.',
        },
        visitors: 1234,
        conversions: 42,
        revenue: 125958,
        conversionRate: 3.4,
      }
    });

    console.log('✅ Test funnel created with ID:', testFunnel.id);
    console.log('   URL: /f/test-funnel-123');

    // 6. Create some test analytics
    console.log('\n📊 Creating test analytics...');
    await prisma.funnelAnalytics.create({
      data: {
        funnelId: testFunnel.id,
        event: 'view',
        metadata: {
          source: 'direct',
          device: 'desktop',
        }
      }
    });
    console.log('✅ Analytics data created');

    // 7. Create a test order (completed)
    console.log('\n🛒 Creating test order...');
    await prisma.funnelOrder.create({
      data: {
        funnelId: testFunnel.id,
        customerEmail: 'customer@example.com',
        amount: 2999,
        currency: 'INR',
        status: 'COMPLETED',
        paymentId: 'pay_test_' + Date.now(),
        paymentMethod: 'RAZORPAY',
        metadata: {
          productName: product.name,
          test: true,
        }
      }
    });
    console.log('✅ Test order created');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 TEST FUNNEL SEED COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    console.log('\n📝 Summary:');
    console.log(`   User: ${testUser.email}`);
    console.log(`   Funnel ID: ${testFunnel.id}`);
    console.log(`   Funnel URL: /f/${testFunnel.id}`);
    console.log(`   Product: ${product.name}`);
    console.log(`   Status: PUBLISHED ✅`);
    console.log(`   Payment Config: CONFIGURED ✅`);
    console.log('\n🧪 You can now run tests that require a published funnel!');
    console.log('   npx playwright test tests/funnel-complete.spec.ts\n');

  } catch (error) {
    console.error('❌ Error seeding test funnel:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTestFunnel()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

