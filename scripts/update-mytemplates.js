const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateMyTemplates() {
  try {
    console.log('Starting MyTemplate update...');
    
    // Get all MyTemplate records
    const myTemplates = await prisma.myTemplate.findMany({
      include: {
        template: true
      }
    });
    
    console.log(`Found ${myTemplates.length} MyTemplate records to update`);
    
    let updatedCount = 0;
    
    for (const myTemplate of myTemplates) {
      if (myTemplate.template && myTemplate.template.pages && !myTemplate.pages) {
        // Update with pages data from the template
        await prisma.myTemplate.update({
          where: { id: myTemplate.id },
          data: {
            pages: myTemplate.template.pages
          }
        });
        
        updatedCount++;
        console.log(`Updated MyTemplate: ${myTemplate.name}`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} MyTemplate records`);
    
  } catch (error) {
    console.error('Error updating MyTemplates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateMyTemplates(); 