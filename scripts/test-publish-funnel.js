const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPublishFunnel() {
  try {
    console.log('🧪 Testing funnel publishing...');

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

    // Create a test funnel
    const testFunnel = await prisma.funnel.create({
      data: {
        name: 'Test Publish Funnel',
        description: 'Testing funnel publishing functionality',
        userId: user.id,
        templateId: templates[0].id,
        status: 'DRAFT',
        published: false,
        customizations: {
          headline: 'Test Headline',
          primaryColor: '#8B5CF6',
          previewImage: '/uploads/funnels/test-image.jpg'
        }
      }
    });

    console.log('✅ Test funnel created:', testFunnel.name);

    // Try to publish the funnel
    const publishedFunnel = await prisma.funnel.update({
      where: { id: testFunnel.id },
      data: {
        published: true,
        url: `/f/${testFunnel.id}`,
        status: 'ACTIVE',
      }
    });

    console.log('✅ Funnel published successfully:');
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

    console.log('✅ Published funnel fetched:');
    console.log(`  - Name: ${fetchedFunnel.name}`);
    console.log(`  - Published: ${fetchedFunnel.published}`);
    console.log(`  - Customizations: ${JSON.stringify(fetchedFunnel.customizations)}`);

    // Clean up
    await prisma.funnel.delete({
      where: { id: testFunnel.id }
    });
    console.log('🧹 Test funnel cleaned up');

    console.log('🎉 Publish test passed!');

  } catch (error) {
    console.error('❌ Publish test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPublishFunnel();
