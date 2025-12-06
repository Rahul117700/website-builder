const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFunnelCreationWithUser() {
  try {
    console.log('🧪 Testing funnel creation with Rahul user...');

    // Get the Rahul user
    const user = await prisma.user.findUnique({
      where: { email: 'i.am.rahul4550@gmail.com' }
    });

    if (!user) {
      console.log('❌ Rahul user not found');
      return;
    }

    console.log(`👤 Found user: ${user.name} (${user.email})`);

    // Get templates
    const templates = await prisma.funnelTemplate.findMany();
    console.log(`📋 Found ${templates.length} templates`);

    if (templates.length === 0) {
      console.log('❌ No templates found');
      return;
    }

    // Create a test funnel
    const testFunnel = await prisma.funnel.create({
      data: {
        name: 'Test Funnel from Script',
        description: 'Testing funnel creation with proper user ID',
        userId: user.id, // Use the correct user ID
        templateId: templates[0].id,
        status: 'DRAFT',
        published: false,
        customizations: {
          headline: 'Test Headline',
          primaryColor: '#8B5CF6'
        }
      },
      include: {
        template: true
      }
    });

    console.log('✅ Funnel created successfully:');
    console.log(`  - ID: ${testFunnel.id}`);
    console.log(`  - Name: ${testFunnel.name}`);
    console.log(`  - User ID: ${testFunnel.userId}`);
    console.log(`  - Template: ${testFunnel.template?.name || 'None'}`);

    // List all funnels for this user
    const userFunnels = await prisma.funnel.findMany({
      where: { userId: user.id },
      include: { template: true }
    });

    console.log(`📊 User now has ${userFunnels.length} funnels:`);
    userFunnels.forEach(funnel => {
      console.log(`  - ${funnel.name} (${funnel.status})`);
    });

    // Clean up the test funnel
    await prisma.funnel.delete({
      where: { id: testFunnel.id }
    });
    console.log('🧹 Test funnel cleaned up');

    console.log('🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testFunnelCreationWithUser();
