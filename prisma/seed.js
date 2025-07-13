const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: 'Free',
        description: 'Basic features for getting started.',
        price: 0,
        currency: 'INR',
        interval: 'month',
      },
      {
        name: 'Pro',
        description: 'Advanced features for growing businesses.',
        price: 999,
        currency: 'INR',
        interval: 'month',
      },
      {
        name: 'Business',
        description: 'All features for large organizations.',
        price: 2499,
        currency: 'INR',
        interval: 'month',
      },
    ],
    skipDuplicates: true,
  });

  // Create or update super admin user
  await prisma.user.upsert({
    where: { email: 'i.am.rahul4550@gmail.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'i.am.rahul4550@gmail.com',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      marketingEmails: false,
      productEmails: false,
      password: null,
    },
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function clearReactCode() {
  await prisma.page.updateMany({
    data: { reactCode: null },
  });
  console.log('All reactCode values set to null.');
}

clearReactCode().finally(() => prisma.$disconnect()); 