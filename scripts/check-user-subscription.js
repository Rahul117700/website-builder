const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUserSubscription() {
  try {
    console.log('🔍 Checking user subscription and funnel usage...\n');

    // Find users with funnel count exceeding their plan limits
    const usersWithExceededLimits = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date()
            }
          }
        }
      },
      include: {
        subscriptions: {
          where: {
            status: 'ACTIVE',
            endDate: {
              gte: new Date()
            }
          },
          include: {
            plan: true
          },
          take: 1
        },
        funnels: {
          select: {
            id: true,
            name: true,
            published: true,
            createdAt: true
          }
        },
        products: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            funnels: true,
            products: true
          }
        }
      }
    });

    console.log(`Found ${usersWithExceededLimits.length} users with active subscriptions:\n`);

    usersWithExceededLimits.forEach((user, index) => {
      const subscription = user.subscriptions[0];
      const plan = subscription?.plan;
      
      if (!plan) {
        console.log(`${index + 1}. ${user.name || user.email} - No active plan`);
        return;
      }

      const funnelCount = user._count.funnels;
      const productCount = user._count.products;
      const funnelLimit = plan.maxFunnels;
      const productLimit = plan.maxProducts;

      console.log(`${index + 1}. ${user.name || user.email}`);
      console.log(`   Plan: ${plan.name} (₹${plan.price}/${plan.duration} days)`);
      console.log(`   Funnels: ${funnelCount} / ${funnelLimit === -1 ? 'Unlimited' : funnelLimit}`);
      console.log(`   Products: ${productCount} / ${productLimit === -1 ? 'Unlimited' : productLimit}`);
      
      // Check for limit violations
      const funnelExceeded = funnelLimit !== -1 && funnelCount > funnelLimit;
      const productExceeded = productLimit !== -1 && productCount > productLimit;
      
      if (funnelExceeded || productExceeded) {
        console.log(`   ⚠️  LIMIT VIOLATIONS:`);
        if (funnelExceeded) {
          console.log(`      - Funnels exceeded by ${funnelCount - funnelLimit}`);
        }
        if (productExceeded) {
          console.log(`      - Products exceeded by ${productCount - productLimit}`);
        }
        
        // Show funnel details
        if (funnelExceeded) {
          console.log(`   📋 Funnels:`);
          user.funnels.forEach((funnel, i) => {
            console.log(`      ${i + 1}. ${funnel.name} (${funnel.published ? 'Published' : 'Draft'}) - ${new Date(funnel.createdAt).toLocaleDateString()}`);
          });
        }
      } else {
        console.log(`   ✅ Within limits`);
      }
      console.log('');
    });

    // Show available plans
    const availablePlans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });

    console.log('📋 Available Plans:');
    availablePlans.forEach(plan => {
      console.log(`- ${plan.name}: ₹${plan.price}/${plan.duration} days`);
      console.log(`  Funnels: ${plan.maxFunnels === -1 ? 'Unlimited' : plan.maxFunnels}`);
      console.log(`  Products: ${plan.maxProducts === -1 ? 'Unlimited' : plan.maxProducts}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking user subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUserSubscription();
