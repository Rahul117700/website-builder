const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanupDuplicatePlans() {
  try {
    console.log('🧹 Cleaning up duplicate plans...');

    // Find all Starter plans
    const starterPlans = await prisma.subscriptionPlan.findMany({
      where: {
        name: 'Starter',
        isActive: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    console.log(`Found ${starterPlans.length} Starter plans`);

    if (starterPlans.length > 1) {
      // Keep the first one (oldest), delete the rest
      const plansToDelete = starterPlans.slice(1);
      
      for (const plan of plansToDelete) {
        console.log(`Deleting duplicate Starter plan: ${plan.id} (₹${plan.price})`);
        await prisma.subscriptionPlan.delete({
          where: { id: plan.id }
        });
      }
      
      console.log('✅ Duplicate plans cleaned up');
    } else {
      console.log('✅ No duplicate plans found');
    }

    // Show final plans
    const finalPlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });

    console.log('\nFinal plans:');
    finalPlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/${plan.duration} days`);
    });

  } catch (error) {
    console.error('❌ Error cleaning up plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupDuplicatePlans();
