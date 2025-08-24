const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupTestData() {
  try {
    console.log('🚀 Setting up test data...');
    
    // Create a test user
    console.log('👤 Creating test user...');
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        name: 'Test User',
        preferredCurrency: 'USD'
      }
    });
    console.log(`  ✅ User created: ${user.email}`);
    
    // Create test sites
    console.log('\n🌐 Creating test sites...');
    
    const agodaSite = await prisma.site.create({
      data: {
        name: 'agoda',
        description: 'Agoda website',
        subdomain: 'agoda',
        template: 'general',
        userId: user.id
      }
    });
    console.log(`  ✅ Site created: ${agodaSite.name} (${agodaSite.subdomain})`);
    
    const nextskillproSite = await prisma.site.create({
      data: {
        name: 'nextskillpro',
        description: 'NextSkillPro website',
        subdomain: 'nextskillpro',
        template: 'general',
        userId: user.id
      }
    });
    console.log(`  ✅ Site created: ${nextskillproSite.name} (${nextskillproSite.subdomain})`);
    
    // Create test domains
    console.log('\n🔗 Creating test domains...');
    
    const agodaDomain = await prisma.domain.create({
      data: {
        host: 'agoda.com',
        siteId: agodaSite.id
      }
    });
    console.log(`  ✅ Domain created: ${agodaDomain.host} → ${agodaSite.name}`);
    
    const nextskillproDomain = await prisma.domain.create({
      data: {
        host: 'nextskillpro.com',
        siteId: nextskillproSite.id
      }
    });
    console.log(`  ✅ Domain created: ${nextskillproDomain.host} → ${nextskillproSite.name}`);
    
    // Create www versions
    const agodaWwwDomain = await prisma.domain.create({
      data: {
        host: 'www.agoda.com',
        siteId: agodaSite.id
      }
    });
    console.log(`  ✅ Domain created: ${agodaWwwDomain.host} → ${agodaSite.name}`);
    
    const nextskillproWwwDomain = await prisma.domain.create({
      data: {
        host: 'www.nextskillpro.com',
        siteId: nextskillproSite.id
      }
    });
    console.log(`  ✅ Domain created: ${nextskillproWwwDomain.host} → ${nextskillproSite.name}`);
    
    console.log('\n🎉 Test data setup completed successfully!');
    
    // Show summary
    const siteCount = await prisma.site.count();
    const domainCount = await prisma.domain.count();
    const userCount = await prisma.user.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`  Users: ${userCount}`);
    console.log(`  Sites: ${siteCount}`);
    console.log(`  Domains: ${domainCount}`);
    
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestData();
