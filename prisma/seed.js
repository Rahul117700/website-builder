const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create or update admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'i.am.rahul4550@gmail.com' },
      update: { 
        role: 'ADMIN',
        name: 'Rahul117700'
      },
      create: {
        email: 'i.am.rahul4550@gmail.com',
        name: 'Rahul117700',
        role: 'ADMIN',
        password: null,
      },
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log(`👤 User ID: ${adminUser.id}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`🔑 Role: ${adminUser.role}`);
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  }); 