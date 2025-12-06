const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicateFunnels() {
  try {
    console.log('🧹 Cleaning up duplicate funnels...\n');

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

    // Get all funnels for this user
    const allFunnels = await prisma.funnel.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        published: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    console.log(`👤 User: ${user.name || user.email}`);
    console.log(`📋 Current funnels: ${allFunnels.length}\n`);

    // Find duplicates (funnels with "Copy" in the name)
    const duplicates = allFunnels.filter(funnel => 
      funnel.name.includes('(Copy)') || funnel.name.includes('Copy')
    );

    console.log(`🔍 Found ${duplicates.length} duplicate funnels:`);
    duplicates.forEach((funnel, i) => {
      console.log(`   ${i + 1}. ${funnel.name} (${funnel.published ? 'Published' : 'Draft'}) - ${new Date(funnel.createdAt).toLocaleDateString()}`);
    });

    if (duplicates.length === 0) {
      console.log('✅ No duplicate funnels found!');
      return;
    }

    // Keep only the 2 original funnels (the ones from 10/9/2025)
    const originalFunnels = allFunnels.filter(funnel => 
      !funnel.name.includes('(Copy)') && !funnel.name.includes('Copy')
    );

    console.log(`\n📋 Original funnels (will be kept):`);
    originalFunnels.forEach((funnel, i) => {
      console.log(`   ${i + 1}. ${funnel.name} (${funnel.published ? 'Published' : 'Draft'}) - ${new Date(funnel.createdAt).toLocaleDateString()}`);
    });

    // Delete duplicates
    console.log(`\n🗑️  Deleting ${duplicates.length} duplicate funnels...`);
    
    for (const duplicate of duplicates) {
      console.log(`   - Deleting: ${duplicate.name}`);
      await prisma.funnel.delete({
        where: { id: duplicate.id }
      });
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`📊 Result:`);
    console.log(`   - Original funnels: ${originalFunnels.length}`);
    console.log(`   - Duplicates removed: ${duplicates.length}`);
    console.log(`   - Total funnels now: ${originalFunnels.length}`);

    // Verify the cleanup
    const remainingFunnels = await prisma.funnel.count({
      where: { userId: user.id }
    });

    console.log(`\n🔍 Verification: ${remainingFunnels} funnels remaining`);

    // Check plan limits
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        endDate: { gte: new Date() }
      },
      include: { plan: true }
    });

    if (subscription) {
      const plan = subscription.plan;
      console.log(`\n📋 Plan Status:`);
      console.log(`   - Plan: ${plan.name}`);
      console.log(`   - Funnels: ${remainingFunnels} / ${plan.maxFunnels}`);
      console.log(`   - Status: ${remainingFunnels <= plan.maxFunnels ? '✅ Within limits' : '⚠️ Still over limit'}`);
    }

  } catch (error) {
    console.error('❌ Error cleaning up duplicate funnels:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicateFunnels();
