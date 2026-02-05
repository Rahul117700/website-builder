const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        const templatesCount = await prisma.channelTemplate.count();
        const channelsCount = await prisma.channel.count();
        const usersCount = await prisma.user.count();

        console.log('Database Status:');
        console.log(`- Users: ${usersCount}`);
        console.log(`- Channel Templates: ${templatesCount}`);
        console.log(`- Channels: ${channelsCount}`);

        if (templatesCount === 0) {
            console.log('\n❌ WARNING: No Channel Templates found. Auto-creation will fail.');
        }
    } catch (error) {
        console.error('Error checking database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
