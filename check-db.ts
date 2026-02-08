import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    const userId = 'cml9skh8a0000w6q5gxg6jcag';
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User NOT found with ID:', userId);

        // Check all users to see if any exist
        const count = await prisma.user.count();
        console.log('Total users in DB:', count);

        const lastUsers = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
        });
        console.log('Last 5 users:', lastUsers);
    }
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
