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
        features: ['1 Website', 'Basic Support', 'Community Access'],
      },
      {
        name: 'Pro',
        description: 'Advanced features for growing businesses.',
        price: 999,
        currency: 'INR',
        interval: 'month',
        features: ['10 Websites', 'Priority Support', 'Custom Domain', 'Advanced Analytics'],
      },
      {
        name: 'Business',
        description: 'All features for large organizations.',
        price: 2499,
        currency: 'INR',
        interval: 'month',
        features: ['Unlimited Websites', 'Dedicated Support', 'Custom Integrations', 'Team Management'],
      },
    ],
    skipDuplicates: true,
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