const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding pricing plans...');

  // Delete existing plans
  await prisma.plan.deleteMany({});

  // Create default plans
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      price: 0,
      currency: 'INR',
      interval: 'month',
      numberOfWebsites: 1,
      unlimitedWebsites: false,
      supportLevel: 'Basic',
      customDomain: true,
      advancedAnalytics: false,
      customIntegrations: false,
      teamManagement: false,
      communityAccess: true,
    },
    {
      name: 'Pro',
      description: 'Great for growing businesses',
      price: 999,
      currency: 'INR',
      interval: 'month',
      numberOfWebsites: 10,
      unlimitedWebsites: false,
      supportLevel: 'Priority',
      customDomain: true,
      advancedAnalytics: true,
      customIntegrations: false,
      teamManagement: false,
      communityAccess: true,
    },
    {
      name: 'Business',
      description: 'For established businesses',
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
  ];

  for (const plan of plans) {
    await prisma.plan.create({
      data: plan,
    });
    console.log(`✅ Created plan: ${plan.name}`);
  }

  console.log('🎉 Pricing plans seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 