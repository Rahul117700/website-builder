const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeRahulSuperAdmin() {
  try {
    console.log('Making Rahul kumar (john@gmail.com) Super Admin...');
    
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: 'john@gmail.com' }
    });

    if (!user) {
      console.log('❌ User not found with email: john@gmail.com');
      return;
    }

    // Check if already super admin
    if (user.role === 'SUPER_ADMIN') {
      console.log('✅ User is already Super Admin:', user.email);
      console.log('📊 Current user details:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status || 'ACTIVE'}`);
      return;
    }

    // Update to Super Admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { 
        role: 'SUPER_ADMIN',
        updatedAt: new Date()
      }
    });

    console.log('✅ Successfully made user Super Admin!');
    console.log('📊 Updated user details:');
    console.log(`   Name: ${updatedUser.name}`);
    console.log(`   Email: ${updatedUser.email}`);
    console.log(`   Role: ${updatedUser.role}`);
    console.log(`   Status: ${updatedUser.status || 'ACTIVE'}`);
    console.log(`   Updated: ${updatedUser.updatedAt}`);
    console.log('');
    console.log('🎉 Rahul can now access the Super Admin dashboard at /auth/dashboard/super-admin');
    console.log('🔧 Super Admin features available:');
    console.log('   - User management (enable/disable users)');
    console.log('   - Platform analytics and monitoring');
    console.log('   - Live funnel monitoring');
    console.log('   - System health tracking');
    console.log('   - Promote other users to Super Admin');
    
  } catch (error) {
    console.error('❌ Error making user super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

makeRahulSuperAdmin();
