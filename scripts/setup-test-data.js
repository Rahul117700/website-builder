const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🚀 Setting up test data...\n');

    // Step 1: Seed Funnel Templates
    console.log('📝 Step 1: Creating funnel templates...');
    
    const funnelTemplates = [
      {
        id: 'template_software',
        name: 'Software Sales Funnel',
        type: 'SOFTWARE',
        description: 'Perfect for selling software, apps, or digital tools. Includes landing page, checkout, and download page.',
        previewUrl: '/templates/software.jpg',
        htmlSchema: {
          sections: [
            {
              type: 'hero',
              title: 'Revolutionary Software Solution',
              subtitle: 'Transform your business with our cutting-edge software',
              buttonText: 'Get Started Now',
            }
          ]
        }
      },
      {
        id: 'template_code',
        name: 'Code Package Funnel',
        type: 'CODE',
        description: 'Great for selling code snippets, scripts, or development tools.',
        previewUrl: '/templates/code.jpg',
        htmlSchema: { sections: [] }
      },
      {
        id: 'template_documents',
        name: 'Document Sales Funnel',
        type: 'DOCUMENTS',
        description: 'Perfect for selling PDFs, ebooks, guides, or templates.',
        previewUrl: '/templates/documents.jpg',
        htmlSchema: { sections: [] }
      }
    ];

    for (const template of funnelTemplates) {
      await prisma.funnelTemplate.upsert({
        where: { id: template.id },
        update: template,
        create: template
      });
      console.log(`  ✅ Created template: ${template.name}`);
    }

    // Step 2: Find or create test user
    console.log('\n👤 Step 2: Setting up test user...');
    const bcrypt = require('bcryptjs');
    
    let testUser = await prisma.user.findUnique({
      where: { email: 'i.am.rahul4550@gmail.com' }
    });

    if (!testUser) {
      const hashedPassword = await bcrypt.hash('temp_password_' + Date.now(), 12);
      testUser = await prisma.user.create({
        data: {
          name: 'Rahul Kumar',
          email: 'i.am.rahul4550@gmail.com',
          password: hashedPassword,
          role: 'USER',
          emailVerified: new Date(),
        }
      });
      console.log('  ✅ Created test user');
    } else {
      console.log('  ✅ Test user already exists');
    }

    // Step 3: Create test digital product
    console.log('\n📦 Step 3: Creating test product...');
    
    let testProduct = await prisma.digitalProduct.findFirst({
      where: {
        userId: testUser.id,
        name: 'Business Pro Software'
      }
    });

    if (!testProduct) {
      testProduct = await prisma.digitalProduct.create({
        data: {
          name: 'Business Pro Software',
          description: 'Complete business management solution with advanced features',
          type: 'SOFTWARE',
          price: 2999,
          currency: 'INR',
          status: 'ACTIVE',
          fileUrl: '/downloads/business-pro.zip',
          previewUrl: '/previews/business-pro.jpg',
          userId: testUser.id,
        }
      });
      console.log('  ✅ Created test product');
    } else {
      console.log('  ✅ Test product already exists');
    }

    // Step 4: Create test funnel with data
    console.log('\n🎯 Step 4: Creating test funnel...');
    
    let testFunnel = await prisma.funnel.findFirst({
      where: {
        userId: testUser.id,
        name: 'Premium Software Package'
      }
    });

    if (!testFunnel) {
      testFunnel = await prisma.funnel.create({
        data: {
          name: 'Premium Software Package',
          description: 'High-quality software solution for businesses',
          userId: testUser.id,
          templateId: 'template_software',
          productId: testProduct.id,
          status: 'ACTIVE',
          published: true,
          url: `/f/test-funnel`,
          customizations: {
            headline: 'Transform Your Business Today',
            subheadline: 'Get the complete software package',
            buttonText: 'Buy Now',
            colors: {
              primary: '#7c3aed',
              secondary: '#ec4899'
            }
          },
          sellerInfo: {
            name: 'Rahul Kumar',
            email: 'i.am.rahul4550@gmail.com',
            bio: 'Software entrepreneur and developer',
          },
          visitors: 1250,
          conversions: 45,
          revenue: 134955,
          conversionRate: 3.6,
        }
      });
      console.log('  ✅ Created test funnel');
    } else {
      console.log('  ✅ Test funnel already exists');
      // Update it with metrics
      testFunnel = await prisma.funnel.update({
        where: { id: testFunnel.id },
        data: {
          visitors: 1250,
          conversions: 45,
          revenue: 134955,
          conversionRate: 3.6,
          published: true,
          status: 'ACTIVE',
        }
      });
      console.log('  ✅ Updated test funnel metrics');
    }

    // Step 5: Create analytics data
    console.log('\n📊 Step 5: Creating analytics data...');
    
    const existingAnalytics = await prisma.funnelAnalytics.count({
      where: { funnelId: testFunnel.id }
    });

    if (existingAnalytics === 0) {
      // Create view analytics (1250 views)
      const viewAnalytics = [];
      for (let i = 0; i < 100; i++) {
        viewAnalytics.push({
          funnelId: testFunnel.id,
          event: 'VIEW',
          metadata: { source: 'organic' },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        });
      }
      
      await prisma.funnelAnalytics.createMany({
        data: viewAnalytics
      });
      console.log('  ✅ Created 100 view analytics entries (representing 1250 total views)');

      // Create conversion analytics (45 conversions)
      const conversionAnalytics = [];
      for (let i = 0; i < 45; i++) {
        conversionAnalytics.push({
          funnelId: testFunnel.id,
          event: 'PURCHASE',
          metadata: { amount: 2999, currency: 'INR' },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        });
      }
      
      await prisma.funnelAnalytics.createMany({
        data: conversionAnalytics
      });
      console.log('  ✅ Created 45 conversion analytics entries');
    } else {
      console.log(`  ✅ Analytics data already exists (${existingAnalytics} entries)`);
    }

    // Step 6: Create order data
    console.log('\n💰 Step 6: Creating order data...');
    
    const existingOrders = await prisma.funnelOrder.count({
      where: { funnelId: testFunnel.id }
    });

    if (existingOrders === 0) {
      const orders = [];
      for (let i = 0; i < 45; i++) {
        orders.push({
          funnelId: testFunnel.id,
          customerEmail: `customer${i}@example.com`,
          amount: 2999,
          currency: 'INR',
          status: 'COMPLETED',
          paymentId: `pay_${Date.now()}_${i}`,
          paymentMethod: 'RAZORPAY',
          metadata: { productId: testProduct.id },
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        });
      }
      
      await prisma.funnelOrder.createMany({
        data: orders
      });
      console.log('  ✅ Created 45 completed orders');
    } else {
      console.log(`  ✅ Order data already exists (${existingOrders} orders)`);
    }

    console.log('\n✨ Test data setup complete!\n');
    console.log('📌 Summary:');
    console.log(`   - User: ${testUser.email}`);
    console.log(`   - Product: ${testProduct.name}`);
    console.log(`   - Funnel: ${testFunnel.name}`);
    console.log(`   - Funnel ID: ${testFunnel.id}`);
    console.log(`   - Visitors: ${testFunnel.visitors}`);
    console.log(`   - Conversions: ${testFunnel.conversions}`);
    console.log(`   - Revenue: ₹${testFunnel.revenue}`);
    console.log(`   - Conversion Rate: ${testFunnel.conversionRate}%`);
    console.log('\n🎉 You can now log in and see your funnel data!');

  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
