const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function removeExtraTemplates() {
  console.log('🧹 Removing extra/invalid templates...\n');

  try {
    // These templates were created by mistake and don't match our design system
    const templatesToRemove = [
      'Modern Portfolio Pro',
      'Minimalist Showcase', 
      'Creative Studio'
    ];

    for (const name of templatesToRemove) {
      const template = await prisma.channelTemplate.findFirst({
        where: { name },
      });

      if (template) {
        await prisma.channelTemplate.delete({
          where: { id: template.id },
        });
        console.log(`❌ Deleted: ${name}`);
      } else {
        console.log(`⚠️  Not found: ${name}`);
      }
    }

    // List remaining templates
    const remainingTemplates = await prisma.channelTemplate.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`\n✅ Final template count: ${remainingTemplates.length}`);
    console.log(`\n📚 Available templates:`);
    remainingTemplates.forEach((template, index) => {
      const defaultTag = template.isDefault ? ' [DEFAULT]' : '';
      console.log(`   ${index + 1}. ${template.name} (${template.category})${defaultTag}`);
    });

  } catch (error) {
    console.error('❌ Error removing templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

removeExtraTemplates()
  .catch((error) => {
    console.error('Failed to remove templates:', error);
    process.exit(1);
  });

