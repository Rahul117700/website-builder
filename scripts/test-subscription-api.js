const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSubscriptionAPI() {
  try {
    console.log('🧪 Testing subscription API data...\n');

    // Simulate the API call that the frontend makes
    const user = await prisma.user.findFirst({
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
            published: true
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

    if (!user) {
      console.log('❌ No user with active subscription found');
      return;
    }

    const subscription = user.subscriptions[0];
    const plan = subscription?.plan;

    // Calculate usage data (same as what the frontend should receive)
    const usage = {
      funnels: user._count.funnels,
      products: user._count.products,
      maxFunnels: plan?.maxFunnels || 0,
      maxProducts: plan?.maxProducts || 0,
      daysRemaining: subscription ? Math.ceil((new Date(subscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
    };

    console.log('📊 API Response Data:');
    console.log(JSON.stringify({
      hasActivePlan: true,
      activeSubscription: {
        plan: {
          name: plan?.name,
          maxFunnels: plan?.maxFunnels,
          maxProducts: plan?.maxProducts
        },
        endDate: subscription?.endDate
      },
      usage: usage
    }, null, 2));

    console.log('\n🔍 Verification:');
    console.log(`- User: ${user.name || user.email}`);
    console.log(`- Plan: ${plan?.name}`);
    console.log(`- Funnels: ${usage.funnels} / ${usage.maxFunnels}`);
    console.log(`- Products: ${usage.products} / ${usage.maxProducts}`);
    console.log(`- Days Remaining: ${usage.daysRemaining}`);

    // Check for discrepancies
    if (usage.funnels > usage.maxFunnels) {
      console.log(`\n⚠️  FUNNEL LIMIT EXCEEDED:`);
      console.log(`   You have ${usage.funnels} funnels but your plan allows only ${usage.maxFunnels}`);
      console.log(`   Excess: ${usage.funnels - usage.maxFunnels} funnels`);
    } else {
      console.log(`\n✅ FUNNEL LIMITS: Within limits (${usage.funnels}/${usage.maxFunnels})`);
    }

    if (usage.products > usage.maxProducts) {
      console.log(`\n⚠️  PRODUCT LIMIT EXCEEDED:`);
      console.log(`   You have ${usage.products} products but your plan allows only ${usage.maxProducts}`);
      console.log(`   Excess: ${usage.products - usage.maxProducts} products`);
    } else {
      console.log(`\n✅ PRODUCT LIMITS: Within limits (${usage.products}/${usage.maxProducts})`);
    }

  } catch (error) {
    console.error('❌ Error testing subscription API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSubscriptionAPI();
