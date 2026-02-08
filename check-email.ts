import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserByEmail() {
    const email = 'i.am.rahul4550@gmail.com';
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log('User found by email:', user);
    } else {
        console.log('User NOT found by email:', email);
    }
}

checkUserByEmail()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
