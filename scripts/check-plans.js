const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlans() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });

    console.log('Current subscription plans in database:');
    console.log('=====================================');
    plans.forEach((plan, index) => {
      console.log(`${index + 1}. ${plan.name}`);
      console.log(`   Price: ₹${plan.price}/${plan.duration} days`);
      console.log(`   Priority: ${plan.priority}`);
      console.log(`   ID: ${plan.id}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error checking plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlans();
