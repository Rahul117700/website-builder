const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeFirstSuperAdmin() {
  try {
    console.log('Making first user Super Admin...');
    
    // Find the first user
    const firstUser = await prisma.user.findFirst({
      orderBy: { createdAt: 'asc' }
    });

    if (!firstUser) {
      console.log('❌ No users found in database');
      return;
    }

    // Check if already super admin
    if (firstUser.role === 'SUPER_ADMIN') {
      console.log('✅ User is already Super Admin:', firstUser.email);
      return;
    }

    // Update to Super Admin
    const updatedUser = await prisma.user.update({
      where: { id: firstUser.id },
      data: { 
        role: 'SUPER_ADMIN',
        updatedAt: new Date()
      }
    });

    console.log('✅ Successfully made user Super Admin:', updatedUser.email);
    console.log('🎉 You can now access the Super Admin dashboard at /auth/dashboard/super-admin');
    
  } catch (error) {
    console.error('❌ Error making user super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeFirstSuperAdmin();
