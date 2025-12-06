const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFunnelCreation() {
  try {
    console.log('🧪 Testing funnel creation...');

    // First, check if we have templates
    const templates = await prisma.funnelTemplate.findMany();
    console.log(`📋 Found ${templates.length} templates:`);
    templates.forEach(template => {
      console.log(`  - ${template.name} (${template.type})`);
    });

    if (templates.length === 0) {
      console.log('❌ No templates found. Please run seed-funnel-templates.js first.');
      return;
    }

    // Check if we have users
    const users = await prisma.user.findMany();
    console.log(`👥 Found ${users.length} users:`);
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email})`);
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please create a user first.');
      return;
    }

    // Test funnel creation
    const testFunnel = await prisma.funnel.create({
      data: {
        name: 'Test Funnel',
        description: 'This is a test funnel',
        userId: users[0].id,
        templateId: templates[0].id,
        status: 'DRAFT',
        published: false,
        customizations: {
          headline: 'Test Headline',
          primaryColor: '#8B5CF6'
        }
      },
      include: {
        template: true,
        user: true
      }
    });

    console.log('✅ Funnel created successfully:');
    console.log(`  - ID: ${testFunnel.id}`);
    console.log(`  - Name: ${testFunnel.name}`);
    console.log(`  - User: ${testFunnel.user.name}`);
    console.log(`  - Template: ${testFunnel.template?.name || 'None'}`);

    // Test funnel listing
    const userFunnels = await prisma.funnel.findMany({
      where: {
        userId: users[0].id
      },
      include: {
        template: true
      }
    });

    console.log(`📊 User has ${userFunnels.length} funnels total`);

    // Clean up test funnel
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

testFunnelCreation();
