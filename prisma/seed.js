const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing plans first
  await prisma.plan.deleteMany({});
  
  // Create comprehensive pricing plans
  await prisma.plan.createMany({
    data: [
      {
        name: 'Free',
        description: 'Perfect for getting started with your first website.',
        price: 0,
        currency: 'INR',
        interval: 'month',
        numberOfWebsites: 1,
        unlimitedWebsites: false,
        supportLevel: 'Basic',
        customDomain: false,
        advancedAnalytics: false,
        customIntegrations: false,
        teamManagement: false,
        communityAccess: false,
      },
      {
        name: 'Pro',
        description: 'Advanced features for growing businesses and professionals.',
        price: 999,
        currency: 'INR',
        interval: 'month',
        numberOfWebsites: 5,
        unlimitedWebsites: false,
        supportLevel: 'Priority',
        customDomain: true,
        advancedAnalytics: true,
        customIntegrations: true,
        teamManagement: false,
        communityAccess: true,
      },
      {
        name: 'Business',
        description: 'Complete solution for large organizations and teams.',
        price: 2499,
        currency: 'INR',
        interval: 'month',
        numberOfWebsites: null,
        unlimitedWebsites: true,
        supportLevel: 'Dedicated',
        customDomain: true,
        advancedAnalytics: true,
        customIntegrations: true,
        teamManagement: true,
        communityAccess: true,
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
      name: 'Rahul117700',
      role: 'SUPER_ADMIN',
      marketingEmails: false,
      productEmails: false,
      password: null,
    },
  });

  console.log('✅ Plans and super admin user created successfully!');
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