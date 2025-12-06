const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifySuperAdmin() {
  try {
    console.log('Verifying Super Admin status...');
    
    // Find Rahul's user
    const user = await prisma.user.findUnique({
      where: { email: 'john@gmail.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      console.log('❌ User not found with email: john@gmail.com');
      return;
    }

    console.log('✅ User found:');
    console.log(`   ID: ${user.id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status || 'ACTIVE (default)'}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log(`   Updated: ${user.updatedAt}`);
    
    if (user.role === 'SUPER_ADMIN') {
      console.log('\n🎉 SUCCESS: User is properly configured as Super Admin!');
      console.log('📊 The Super Admin dashboard should now work correctly.');
      console.log('🔗 Access URL: /auth/dashboard/super-admin');
    } else {
      console.log('\n❌ ISSUE: User is not a Super Admin');
      console.log(`   Current role: ${user.role}`);
      console.log('   Expected role: SUPER_ADMIN');
    }

    // Check total users count
    const totalUsers = await prisma.user.count();
    console.log(`\n📈 Total users in database: ${totalUsers}`);
    
    // Check other super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: 'SUPER_ADMIN' },
      select: { name: true, email: true, role: true }
    });
    
    console.log(`👑 Total Super Admins: ${superAdmins.length}`);
    superAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.name || 'No name'} (${admin.email})`);
    });

  } catch (error) {
    console.error('❌ Error verifying super admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySuperAdmin();
