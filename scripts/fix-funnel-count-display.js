const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixFunnelCountDisplay() {
  try {
    console.log('🔧 Investigating funnel count display issue...\n');

    // Get user details
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

    if (!user) {
      console.log('❌ No user found with active subscription');
      return;
    }

    const subscription = user.subscriptions[0];
    const plan = subscription?.plan;

    console.log(`👤 User: ${user.name || user.email}`);
    console.log(`📋 Plan: ${plan?.name || 'No plan'}`);
    console.log(`📊 Database Counts:`);
    console.log(`   - Funnels: ${user._count.funnels}`);
    console.log(`   - Products: ${user._count.products}`);
    console.log(`📋 Plan Limits:`);
    console.log(`   - Max Funnels: ${plan?.maxFunnels || 'N/A'}`);
    console.log(`   - Max Products: ${plan?.maxProducts || 'N/A'}`);
    
    console.log(`\n📋 Actual Funnels:`);
    user.funnels.forEach((funnel, i) => {
      console.log(`   ${i + 1}. ${funnel.name} (${funnel.published ? 'Published' : 'Draft'}) - ${new Date(funnel.createdAt).toLocaleDateString()}`);
    });

    console.log(`\n📋 Actual Products:`);
    user.products.forEach((product, i) => {
      console.log(`   ${i + 1}. ${product.name}`);
    });

    // Check if there are any draft or deleted funnels that might be causing confusion
    const allFunnels = await prisma.funnel.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true,
        name: true,
        published: true,
        createdAt: true
      }
    });

    console.log(`\n🔍 All Funnels (including drafts):`);
    allFunnels.forEach((funnel, i) => {
      console.log(`   ${i + 1}. ${funnel.name} (${funnel.published ? 'Published' : 'Draft'}) - ${new Date(funnel.createdAt).toLocaleDateString()}`);
    });

    // Solutions
    console.log(`\n💡 Solutions:`);
    
    if (user._count.funnels > (plan?.maxFunnels || 0)) {
      console.log(`1. ⚠️  You have ${user._count.funnels} funnels but your plan allows only ${plan?.maxFunnels}`);
      console.log(`   - Upgrade to a higher plan`);
      console.log(`   - Delete some funnels`);
      console.log(`   - Contact admin to increase your limit`);
    } else {
      console.log(`1. ✅ You are within your funnel limits`);
    }

    if (user._count.products > (plan?.maxProducts || 0)) {
      console.log(`2. ⚠️  You have ${user._count.products} products but your plan allows only ${plan?.maxProducts}`);
      console.log(`   - Upgrade to a higher plan`);
      console.log(`   - Delete some products`);
      console.log(`   - Contact admin to increase your limit`);
    } else {
      console.log(`2. ✅ You are within your product limits`);
    }

    console.log(`\n🔄 Possible UI Issues:`);
    console.log(`- Frontend cache might be outdated`);
    console.log(`- API might be returning incorrect counts`);
    console.log(`- Browser cache needs to be cleared`);

  } catch (error) {
    console.error('❌ Error investigating funnel count:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixFunnelCountDisplay();
