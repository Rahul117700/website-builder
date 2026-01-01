const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateTemplates() {
  console.log('🧹 Cleaning up duplicate channel templates...\n');

  try {
    // Get all templates
    const allTemplates = await prisma.channelTemplate.findMany({
      orderBy: {
        createdAt: 'asc', // Keep the oldest ones
      },
    });

    console.log(`Found ${allTemplates.length} total templates\n`);

    // Group by name
    const templatesByName = {};
    allTemplates.forEach(template => {
      if (!templatesByName[template.name]) {
        templatesByName[template.name] = [];
      }
      templatesByName[template.name].push(template);
    });

    // Find duplicates
    let totalDeleted = 0;
    for (const [name, templates] of Object.entries(templatesByName)) {
      if (templates.length > 1) {
        console.log(`\n📋 Found ${templates.length} templates named "${name}"`);
        
        // Keep the first one (oldest), delete the rest
        const toKeep = templates[0];
        const toDelete = templates.slice(1);
        
        console.log(`   ✅ Keeping: ${toKeep.id} (created: ${toKeep.createdAt})`);
        
        for (const template of toDelete) {
          console.log(`   ❌ Deleting: ${template.id} (created: ${template.createdAt})`);
          await prisma.channelTemplate.delete({
            where: { id: template.id },
          });
          totalDeleted++;
        }
      } else {
        console.log(`✓ "${name}" - no duplicates`);
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   - Deleted: ${totalDeleted} duplicate templates`);
    console.log(`   - Remaining: ${allTemplates.length - totalDeleted} unique templates`);

    // List remaining templates
    const remainingTemplates = await prisma.channelTemplate.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    console.log(`\n📚 Final template list:`);
    remainingTemplates.forEach((template, index) => {
      console.log(`   ${index + 1}. ${template.name} (${template.category})`);
    });

  } catch (error) {
    console.error('❌ Error cleaning up templates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateTemplates()
  .catch((error) => {
    console.error('Failed to cleanup templates:', error);
    process.exit(1);
  });

