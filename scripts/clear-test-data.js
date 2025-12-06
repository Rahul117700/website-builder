const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearTestData() {
  try {
    console.log('\n⚠️  WARNING: This will clear all test data from your funnel!\n');
    console.log('This will delete:');
    console.log('  - All analytics entries');
    console.log('  - All completed orders');
    console.log('  - Reset funnel metrics to 0\n');
    
    const funnelId = 'cmgbalb2v0004k3efbyft6jcw'; // Your test funnel
    
    // Delete analytics
    const deletedAnalytics = await prisma.funnelAnalytics.deleteMany({
      where: { funnelId: funnelId }
    });
    console.log(`✅ Deleted ${deletedAnalytics.count} analytics entries`);
    
    // Delete orders
    const deletedOrders = await prisma.funnelOrder.deleteMany({
      where: { funnelId: funnelId }
    });
    console.log(`✅ Deleted ${deletedOrders.count} orders`);
    
    // Reset funnel metrics
    await prisma.funnel.update({
      where: { id: funnelId },
      data: {
        visitors: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0
      }
    });
    console.log(`✅ Reset funnel metrics to 0`);
    
    console.log('\n✨ Test data cleared! You can now track real customer data.\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Uncomment the line below to run this script
// clearTestData();

console.log('\n⚠️  This script is disabled by default for safety.');
console.log('To clear test data, open scripts/clear-test-data.js');
console.log('and uncomment the last line: clearTestData();\n');

