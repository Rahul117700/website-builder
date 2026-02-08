import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const userId = 'cml9skh8a0000w6q5gxg6jcag'; // From logs
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (user) {
        console.log('User found:', user);
    } else {
        console.log('User NOT found in database.');

        // Search by email to see if ID matches
        const email = 'i.am.rahul4550@gmail.com';
        const userByEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (userByEmail) {
            console.log('User found by email instead:', userByEmail);
            console.log('Database ID:', userByEmail.id);
            console.log('Session ID:', userId);
        } else {
            console.log('User also NOT found by email.');
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
