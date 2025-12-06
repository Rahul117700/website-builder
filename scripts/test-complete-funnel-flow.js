const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testCompleteFunnelFlow() {
  try {
    console.log('🧪 Testing complete funnel flow...');

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

    // Create a test funnel with customizations
    const testFunnel = await prisma.funnel.create({
      data: {
        name: 'Complete Test Funnel',
        description: 'Testing complete funnel flow with customizations',
        userId: user.id,
        templateId: templates[0].id,
        status: 'DRAFT',
        published: false,
        customizations: {
          headline: 'Amazing Software Solution',
          subheadline: 'Transform your business with our powerful tool',
          primaryColor: '#8B5CF6',
          secondaryColor: '#EC4899',
          cta: 'Get Started Now',
          previewImage: '/uploads/funnels/test-preview.jpg'
        }
      },
      include: {
        template: true
      }
    });

    console.log('✅ Test funnel created with customizations');
    console.log(`  - ID: ${testFunnel.id}`);
    console.log(`  - Name: ${testFunnel.name}`);
    console.log(`  - Status: ${testFunnel.status}`);
    console.log(`  - Published: ${testFunnel.published}`);
    console.log(`  - Customizations: ${JSON.stringify(testFunnel.customizations, null, 2)}`);

    // Test publishing the funnel
    const publishedFunnel = await prisma.funnel.update({
      where: { id: testFunnel.id },
      data: {
        published: true,
        url: `/f/${testFunnel.id}`,
        status: 'ACTIVE',
      }
    });

    console.log('✅ Funnel published successfully');
    console.log(`  - Published: ${publishedFunnel.published}`);
    console.log(`  - Status: ${publishedFunnel.status}`);
    console.log(`  - URL: ${publishedFunnel.url}`);

    // Test fetching the published funnel
    const fetchedFunnel = await prisma.funnel.findUnique({
      where: { id: testFunnel.id },
      include: {
        template: true,
        product: true
      }
    });

    console.log('✅ Published funnel fetched successfully');
    console.log(`  - Name: ${fetchedFunnel.name}`);
    console.log(`  - Template: ${fetchedFunnel.template?.name}`);
    console.log(`  - Preview Image: ${fetchedFunnel.customizations?.previewImage}`);
    console.log(`  - Headline: ${fetchedFunnel.customizations?.headline}`);

    // Test unpublishing
    const unpublishedFunnel = await prisma.funnel.update({
      where: { id: testFunnel.id },
      data: {
        published: false,
        url: null,
        status: 'DRAFT',
      }
    });

    console.log('✅ Funnel unpublished successfully');
    console.log(`  - Published: ${unpublishedFunnel.published}`);
    console.log(`  - Status: ${unpublishedFunnel.status}`);

    // Clean up
    await prisma.funnel.delete({
      where: { id: testFunnel.id }
    });
    console.log('🧹 Test funnel cleaned up');

    console.log('🎉 Complete funnel flow test passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCompleteFunnelFlow();
