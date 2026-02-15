const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearAnalyticsData() {
    console.log('🗑️  Clearing test analytics data...');

    try {
        await prisma.conversionEvent.deleteMany({});
        await prisma.exitPoint.deleteMany({});
        await prisma.userInteraction.deleteMany({});
        await prisma.pageView.deleteMany({});
        await prisma.userSession.deleteMany({});

        console.log('✅ All test analytics data cleared!');
        console.log('📊 The system will now track only REAL user activity.');
        console.log('🚀 Browse your site to generate new analytics data!');
    } catch (error) {
        console.error('❌ Error clearing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

clearAnalyticsData();
