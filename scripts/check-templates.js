const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    const templates = await prisma.channelTemplate.findMany();
    console.log('Channel Templates in DB:');
    templates.forEach(t => {
      console.log(`- ID: ${t.id}, Name: ${t.name}, Active: ${t.isActive}, Default: ${t.isDefault}`);
    });
  } catch (error) {
    console.error('Error checking templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTemplates();
