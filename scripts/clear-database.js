const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log('🗑️ Starting database cleanup...');
  
  try {
    // Clear tables in order (respecting foreign key constraints)
    console.log('Clearing analytics...');
    await prisma.analytics.deleteMany();
    
    console.log('Clearing bookings...');
    await prisma.booking.deleteMany();
    
    console.log('Clearing submissions...');
    await prisma.submission.deleteMany();
    
    console.log('Clearing pages...');
    await prisma.page.deleteMany();
    
    console.log('Clearing domains...');
    await prisma.domain.deleteMany();
    
    console.log('Clearing sites...');
    await prisma.site.deleteMany();
    
    console.log('Clearing notifications...');
    await prisma.notification.deleteMany();
    
    console.log('Clearing activities...');
    await prisma.activity.deleteMany();
    
    console.log('Clearing sessions...');
    await prisma.session.deleteMany();
    
    console.log('Clearing accounts...');
    await prisma.account.deleteMany();
    
    console.log('Clearing verification tokens...');
    await prisma.verificationToken.deleteMany();
    
    console.log('Clearing payments...');
    await prisma.payment.deleteMany();
    
    console.log('Clearing subscriptions...');
    await prisma.subscription.deleteMany();
    
    console.log('Clearing plans...');
    await prisma.plan.deleteMany();
    
    console.log('Clearing templates...');
    await prisma.template.deleteMany();
    
    console.log('Clearing frontend content...');
    await prisma.frontendContent.deleteMany();
    
    console.log('Clearing revenue...');
    await prisma.revenue.deleteMany();
    
    console.log('Clearing commission settings...');
    await prisma.commissionSetting.deleteMany();
    
    console.log('Clearing users...');
    await prisma.user.deleteMany();
    
    console.log('✅ Database cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

clearDatabase()
  .catch((e) => {
    console.error('❌ Database cleanup failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed');
  });
