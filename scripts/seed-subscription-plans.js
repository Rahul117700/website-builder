const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedSubscriptionPlans() {
  try {
    console.log('🌱 Seeding subscription plans...');

    // Delete existing plans (optional - comment out if you want to keep existing plans)
    // await prisma.subscriptionPlan.deleteMany({});

    const plans = [
      {
        name: 'Starter',
        description: 'Perfect for beginners getting started with funnels',
        price: 499,
        currency: 'INR',
        duration: 30, // 30 days
        features: [
          'Basic Analytics',
          'Email Support',
          'Standard Templates'
        ],
        maxFunnels: 5,
        maxProducts: 10,
        maxCustomDomains: 0,
        priority: 1,
        isActive: true
      },
      {
        name: 'Professional',
        description: 'Most popular plan for growing businesses',
        price: 999,
        currency: 'INR',
        duration: 30, // 30 days
        features: [
          'Advanced Analytics',
          'Priority Email Support',
          'All Templates',
          'Custom Branding',
          'A/B Testing'
        ],
        maxFunnels: 25,
        maxProducts: 50,
        maxCustomDomains: 2,
        priority: 2, // Higher priority (will be shown as popular)
        isActive: true
      },
      {
        name: 'Business',
        description: 'Unlimited everything for serious businesses',
        price: 1999,
        currency: 'INR',
        duration: 30, // 30 days
        features: [
          'Unlimited Analytics',
          'Priority Phone & Email Support',
          'All Premium Templates',
          'Custom Branding',
          'A/B Testing',
          'White Label',
          'API Access',
          'Dedicated Account Manager'
        ],
        maxFunnels: -1, // Unlimited
        maxProducts: -1, // Unlimited
        maxCustomDomains: 5,
        priority: 3,
        isActive: true
      },
      {
        name: 'Annual Starter',
        description: 'Save 20% with annual billing - Great for beginners',
        price: 4999,
        currency: 'INR',
        duration: 365, // 1 year
        features: [
          'Basic Analytics',
          'Email Support',
          'Standard Templates',
          '2 months FREE'
        ],
        maxFunnels: 5,
        maxProducts: 10,
        maxCustomDomains: 0,
        priority: 1,
        isActive: true
      },
      {
        name: 'Annual Professional',
        description: 'Save 20% with annual billing - Most popular',
        price: 9999,
        currency: 'INR',
        duration: 365, // 1 year
        features: [
          'Advanced Analytics',
          'Priority Email Support',
          'All Templates',
          'Custom Branding',
          'A/B Testing',
          '2 months FREE'
        ],
        maxFunnels: 25,
        maxProducts: 50,
        maxCustomDomains: 2,
        priority: 2,
        isActive: true
      },
      {
        name: 'Annual Business',
        description: 'Save 20% with annual billing - Unlimited everything',
        price: 19999,
        currency: 'INR',
        duration: 365, // 1 year
        features: [
          'Unlimited Analytics',
          'Priority Phone & Email Support',
          'All Premium Templates',
          'Custom Branding',
          'A/B Testing',
          'White Label',
          'API Access',
          'Dedicated Account Manager',
          '2 months FREE'
        ],
        maxFunnels: -1, // Unlimited
        maxProducts: -1, // Unlimited
        maxCustomDomains: 10,
        priority: 3,
        isActive: true
      }
    ];

    for (const planData of plans) {
      const plan = await prisma.subscriptionPlan.create({
        data: planData
      });
      console.log(`✅ Created plan: ${plan.name} - ₹${plan.price}/${plan.duration} days`);
    }

    console.log('\n🎉 Successfully seeded subscription plans!');
    console.log('\nPlans Summary:');
    console.log('- Starter: ₹499/month (5 funnels, 10 products)');
    console.log('- Professional: ₹999/month (25 funnels, 50 products) [POPULAR]');
    console.log('- Business: ₹1999/month (Unlimited funnels & products)');
    console.log('- Annual plans available with 20% discount');

  } catch (error) {
    console.error('❌ Error seeding subscription plans:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSubscriptionPlans();

