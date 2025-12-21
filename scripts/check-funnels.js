const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFunnels() {
  try {
    console.log('📊 Checking Funnels in Database...\n');

    const funnels = await prisma.funnel.findMany({
      include: {
        product: true,
        template: true,
        user: {
          select: {
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Total Funnels: ${funnels.length}\n`);

    if (funnels.length === 0) {
      console.log('❌ No funnels found in database');
      return;
    }

    funnels.forEach((funnel, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Funnel #${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`ID: ${funnel.id}`);
      console.log(`Name: ${funnel.name}`);
      console.log(`Status: ${funnel.status}`);
      console.log(`Published: ${funnel.published ? '✅ YES' : '❌ NO'}`);
      console.log(`URL: ${funnel.url || 'Not set'}`);
      console.log(`Template: ${funnel.template?.name || 'None'}`);
      console.log(`Product: ${funnel.product?.name || 'None'}`);
      console.log(`Owner: ${funnel.user?.name} (${funnel.user?.email})`);
      
      if (funnel.published && funnel.status === 'ACTIVE') {
        console.log(`\n🌐 Public URL: http://localhost:3000/f/${funnel.id}`);
      } else {
        console.log(`\n⚠️  NOT ACCESSIBLE (${!funnel.published ? 'Not published' : 'Status: ' + funnel.status})`);
      }
    });

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFunnels();

