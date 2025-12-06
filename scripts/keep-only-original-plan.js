const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function keepOnlyOriginalPlan() {
  try {
    console.log('🧹 Keeping only the original Starter plan...');

    // Find the original plan (₹199/30 days)
    const originalPlan = await prisma.subscriptionPlan.findFirst({
      where: {
        name: 'Starter',
        price: 199,
        duration: 30,
        isActive: true
      }
    });

    if (!originalPlan) {
      console.log('❌ Original Starter plan not found');
      return;
    }

    console.log(`✅ Found original plan: ${originalPlan.name} - ₹${originalPlan.price}/${originalPlan.duration} days`);

    // Delete all other plans
    const plansToDelete = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true,
        id: {
          not: originalPlan.id
        }
      }
    });

    console.log(`🗑️ Deleting ${plansToDelete.length} extra plans...`);

    for (const plan of plansToDelete) {
      console.log(`   - Deleting: ${plan.name} (₹${plan.price}/${plan.duration} days)`);
      await prisma.subscriptionPlan.delete({
        where: { id: plan.id }
      });
    }

    // Verify final state
    const finalPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true }
    });

    console.log('\n✅ Cleanup complete!');
    console.log('\nRemaining plan:');
    finalPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/${plan.duration} days`);
    });

    console.log('\n🎯 You now have exactly one subscription plan as requested!');

  } catch (error) {
    console.error('❌ Error cleaning up plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

keepOnlyOriginalPlan();
