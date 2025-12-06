const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugFunnelCount() {
  try {
    console.log('🔍 Debugging funnel count discrepancy...\n');

    // Get user
    const user = await prisma.user.findFirst({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE'
          }
        }
      }
    });

    if (!user) {
      console.log('❌ No user found');
      return;
    }

    console.log(`👤 User: ${user.name || user.email} (ID: ${user.id})\n`);

    // Method 1: Direct count
    const directCount = await prisma.funnel.count({
      where: { userId: user.id }
    });
    console.log(`1️⃣ Direct Count: ${directCount} funnels`);

    // Method 2: With _count
    const userWithCount = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: {
          select: { funnels: true }
        }
      }
    });
    console.log(`2️⃣ _count Method: ${userWithCount?._count.funnels} funnels`);

    // Method 3: Get all funnels and count
    const allFunnels = await prisma.funnel.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        published: true,
        createdAt: true
      }
    });
    console.log(`3️⃣ Array Length: ${allFunnels.length} funnels`);

    console.log(`\n📋 All Funnels for this user:`);
    allFunnels.forEach((funnel, i) => {
      console.log(`   ${i + 1}. ${funnel.name} (${funnel.published ? 'Published' : 'Draft'}) - ${new Date(funnel.createdAt).toLocaleDateString()}`);
    });

    // Check for funnels from other users
    const allFunnelsInSystem = await prisma.funnel.findMany({
      select: {
        id: true,
        name: true,
        userId: true,
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    console.log(`\n📋 All Funnels in System:`);
    allFunnelsInSystem.forEach((funnel, i) => {
      const isCurrentUser = funnel.userId === user.id;
      console.log(`   ${i + 1}. ${funnel.name} - ${funnel.user?.name || funnel.user?.email} ${isCurrentUser ? '(YOU)' : ''}`);
    });

    // Check if there are any orphaned funnels
    const orphanedFunnels = await prisma.funnel.findMany({
      where: {
        user: null
      }
    });

    if (orphanedFunnels.length > 0) {
      console.log(`\n⚠️  Found ${orphanedFunnels.length} orphaned funnels (no user)`);
      orphanedFunnels.forEach((funnel, i) => {
        console.log(`   ${i + 1}. ${funnel.name} (User ID: ${funnel.userId})`);
      });
    }

    // Check for duplicate funnels
    const funnelNames = allFunnels.map(f => f.name);
    const duplicateNames = funnelNames.filter((name, index) => funnelNames.indexOf(name) !== index);
    
    if (duplicateNames.length > 0) {
      console.log(`\n⚠️  Found duplicate funnel names:`);
      duplicateNames.forEach(name => {
        console.log(`   - ${name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error debugging funnel count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugFunnelCount();
