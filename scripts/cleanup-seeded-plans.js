const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupSeededPlans() {
  try {
    console.log('🧹 Starting cleanup of seeded subscription plans...\n');

    // Fetch all subscription plans
    const allPlans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        }
      },
      orderBy: [
        { createdAt: 'asc' }
      ]
    });

    console.log(`Found ${allPlans.length} subscription plans:\n`);

    // List all plans
    allPlans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Price: ₹${plan.price}/${plan.duration} days`);
      console.log(`   Active: ${plan.isActive ? 'Yes' : 'No'}`);
      console.log(`   Subscribers: ${plan._count.subscriptions}`);
      console.log(`   Created: ${plan.createdAt.toLocaleString()}`);
      console.log(`   ID: ${plan.id}\n`);
    });

    // Delete all plans that have no active subscriptions
    console.log('🗑️  Deleting plans with no active subscriptions...\n');

    let deletedCount = 0;
    let skippedCount = 0;

    for (const plan of allPlans) {
      // Check if plan has active subscriptions
      const activeSubscriptions = await prisma.userSubscription.count({
        where: {
          planId: plan.id,
          status: 'ACTIVE'
        }
      });

      if (activeSubscriptions > 0) {
        console.log(`⚠️  Skipping "${plan.name}" - has ${activeSubscriptions} active subscription(s)`);
        skippedCount++;
      } else {
        // Delete the plan
        await prisma.subscriptionPlan.delete({
          where: { id: plan.id }
        });
        console.log(`✅ Deleted "${plan.name}"`);
        deletedCount++;
      }
    }

    console.log('\n✅ Cleanup complete!');
    console.log(`   Deleted: ${deletedCount} plans`);
    console.log(`   Skipped: ${skippedCount} plans (with active subscriptions)`);
    console.log('\n💡 Note: Plans with active subscriptions were preserved to avoid disrupting users.');
    console.log('   You can deactivate them from the Super Admin panel instead.\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupSeededPlans();

