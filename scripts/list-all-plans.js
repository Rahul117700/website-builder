const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function listAllPlans() {
  try {
    console.log('📋 Listing all subscription plans...\n');

    // Fetch all subscription plans
    const allPlans = await prisma.subscriptionPlan.findMany({
      include: {
        _count: {
          select: {
            subscriptions: true
          }
        },
        subscriptions: {
          where: {
            status: 'ACTIVE'
          },
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: [
        { createdAt: 'asc' }
      ]
    });

    console.log(`Found ${allPlans.length} subscription plans:\n`);
    console.log('=' .repeat(80));

    // List all plans with details
    allPlans.forEach((plan, index) => {
      console.log(`\n${index + 1}. ${plan.name}`);
      console.log(`   Description: ${plan.description || 'N/A'}`);
      console.log(`   Price: ₹${plan.price}/${plan.duration} days`);
      console.log(`   Max Funnels: ${plan.maxFunnels === -1 ? 'Unlimited' : plan.maxFunnels}`);
      console.log(`   Max Products: ${plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts}`);
      console.log(`   Max Custom Domains: ${plan.maxCustomDomains}`);
      console.log(`   Active: ${plan.isActive ? 'Yes' : 'No'}`);
      console.log(`   Priority: ${plan.priority}`);
      console.log(`   Total Subscribers: ${plan._count.subscriptions}`);
      console.log(`   Active Subscribers: ${plan.subscriptions.length}`);
      
      if (plan.subscriptions.length > 0) {
        console.log(`   Active Users:`);
        plan.subscriptions.forEach(sub => {
          console.log(`      - ${sub.user.name} (${sub.user.email})`);
        });
      }
      
      console.log(`   Created: ${plan.createdAt.toLocaleString()}`);
      console.log(`   ID: ${plan.id}`);
      console.log('-'.repeat(80));
    });

    console.log('\n✅ Done!\n');
    console.log('💡 To delete unwanted plans:');
    console.log('   1. Use the Super Admin panel (Dashboard → Super Admin → Plans tab)');
    console.log('   2. Run: node scripts/cleanup-seeded-plans.js');
    console.log('\n   Note: Plans with active subscriptions cannot be deleted.\n');

  } catch (error) {
    console.error('❌ Error listing plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listAllPlans();

