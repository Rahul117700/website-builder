const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedInstances() {
  try {
    console.log('🌱 Seeding instances...');

    // Create sample instances
    const instances = [
      {
        port: 3001,
        url: 'http://31.97.233.221:3001',
        status: 'AVAILABLE'
      },
      {
        port: 3002,
        url: 'http://31.97.233.221:3002',
        status: 'AVAILABLE'
      },
      {
        port: 3003,
        url: 'http://31.97.233.221:3003',
        status: 'AVAILABLE'
      },
      {
        port: 3004,
        url: 'http://31.97.233.221:3004',
        status: 'MAINTENANCE'
      }
    ];

    for (const instanceData of instances) {
      const instance = await prisma.instance.create({
        data: instanceData
      });
      console.log(`✅ Created instance: ${instance.url} (Port: ${instance.port})`);
    }

    console.log('🎉 Instance seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding instances:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedInstances();
