const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompletePurchaseFlow() {
  try {
    console.log('🧪 Testing complete purchase flow...');

    // Get the Rahul user
    const user = await prisma.user.findUnique({
      where: { email: 'i.am.rahul4550@gmail.com' }
    });

    if (!user) {
      console.log('❌ Rahul user not found');
      return;
    }

    // Get templates
    const templates = await prisma.funnelTemplate.findMany();
    if (templates.length === 0) {
      console.log('❌ No templates found');
      return;
    }

    console.log(`👤 User: ${user.name} (${user.email})`);
    console.log(`📋 Available templates: ${templates.length}`);

    // Create a test funnel with product
    const testFunnel = await prisma.funnel.create({
      data: {
        name: 'Test Purchase Funnel',
        description: 'Testing complete purchase flow',
        userId: user.id,
        templateId: templates[0].id,
        status: 'ACTIVE',
        published: true,
        url: '/f/test-purchase-funnel',
        customizations: {
          headline: 'Amazing Digital Product',
          subheadline: 'Get instant access to premium content',
          primaryColor: '#8B5CF6',
          secondaryColor: '#EC4899',
          cta: 'Buy Now'
        }
      },
      include: {
        template: true
      }
    });

    console.log('✅ Test funnel created:', testFunnel.name);

    // Create a test product
    const testProduct = await prisma.digitalProduct.create({
      data: {
        name: 'Premium Software Package',
        description: 'Complete software solution with all features',
        type: 'SOFTWARE',
        price: 2999,
        currency: 'INR',
        fileUrl: '/uploads/products/test-software.zip',
        previewUrl: '/uploads/funnels/test-preview.jpg',
        userId: user.id,
        sales: 0
      }
    });

    console.log('✅ Test product created:', testProduct.name);

    // Link product to funnel
    const updatedFunnel = await prisma.funnel.update({
      where: { id: testFunnel.id },
      data: { productId: testProduct.id },
      include: { product: true }
    });

    console.log('✅ Product linked to funnel');

    // Simulate a purchase
    const testOrder = await prisma.funnelOrder.create({
      data: {
        funnelId: testFunnel.id,
        customerEmail: 'test@example.com',
        amount: testProduct.price,
        currency: 'INR',
        status: 'COMPLETED',
        paymentId: 'pay_test_123',
        paymentMethod: 'RAZORPAY',
        metadata: {
          funnelName: testFunnel.name,
          productName: testProduct.name,
          productType: testProduct.type
        }
      }
    });

    console.log('✅ Test order created:', testOrder.id);

    // Update product sales
    await prisma.digitalProduct.update({
      where: { id: testProduct.id },
      data: { sales: { increment: 1 } }
    });

    console.log('✅ Product sales updated');

    // Create analytics event
    await prisma.funnelAnalytics.create({
      data: {
        funnelId: testFunnel.id,
        event: 'PURCHASE',
        metadata: {
          orderId: testOrder.id,
          amount: testProduct.price,
          customerEmail: 'test@example.com'
        },
        userAgent: 'Test Agent',
        ipAddress: '127.0.0.1'
      }
    });

    console.log('✅ Analytics event created');

    // Test fetching order for download page
    const fetchedOrder = await prisma.funnelOrder.findUnique({
      where: { id: testOrder.id },
      include: {
        funnel: {
          include: {
            product: true
          }
        }
      }
    });

    console.log('✅ Order fetched for download page');
    console.log(`  - Download URL: /download/${testOrder.id}`);
    console.log(`  - Product: ${fetchedOrder.funnel.product.name}`);
    console.log(`  - Amount: ₹${fetchedOrder.amount}`);

    // Clean up
    await prisma.funnelAnalytics.deleteMany({
      where: { funnelId: testFunnel.id }
    });
    await prisma.funnelOrder.delete({
      where: { id: testOrder.id }
    });
    await prisma.digitalProduct.delete({
      where: { id: testProduct.id }
    });
    await prisma.funnel.delete({
      where: { id: testFunnel.id }
    });
    console.log('🧹 Test data cleaned up');

    console.log('🎉 Complete purchase flow test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompletePurchaseFlow();
