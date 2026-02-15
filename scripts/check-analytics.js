const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    try {
        const pageViewCount = await prisma.pageView.count();
        const sessionCount = await prisma.userSession.count();
        const interactionCount = await prisma.userInteraction.count();
        const exitPointCount = await prisma.exitPoint.count();
        const conversionCount = await prisma.conversionEvent.count();

        console.log('📊 Analytics Data in Database:');
        console.log('================================');
        console.log(`Page Views: ${pageViewCount}`);
        console.log(`Sessions: ${sessionCount}`);
        console.log(`Interactions: ${interactionCount}`);
        console.log(`Exit Points: ${exitPointCount}`);
        console.log(`Conversions: ${conversionCount}`);
        console.log('================================');

        if (pageViewCount === 0) {
            console.log('\n⚠️  No data found! The seed script may have failed.');
            console.log('Run: node scripts/seed-analytics.js');
        } else {
            console.log('\n✅ Data exists! Check the API response.');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
