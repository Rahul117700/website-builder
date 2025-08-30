const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Create or update super admin user
    const superAdmin = await prisma.user.upsert({
      where: { email: 'i.am.rahul4550@gmail.com' },
      update: { 
        role: 'SUPER_ADMIN',
        name: 'Rahul117700',
        enabled: true
      },
      create: {
        email: 'i.am.rahul4550@gmail.com',
        name: 'Rahul117700',
        role: 'SUPER_ADMIN',
        enabled: true,
        marketingEmails: false,
        productEmails: false,
        password: null,
      },
    });

    console.log('✅ Super admin user created/updated successfully!');
    console.log(`👤 User ID: ${superAdmin.id}`);
    console.log(`📧 Email: ${superAdmin.email}`);
    console.log(`🔑 Role: ${superAdmin.role}`);
    
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