const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful\n');

    // Check if we can query the Site table
    console.log('📋 Checking Site table:');
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        subdomain: true,
        name: true,
        customDomain: true
      }
    });

    if (sites.length === 0) {
      console.log('❌ No sites found in database');
    } else {
      console.log(`✅ Found ${sites.length} sites:`);
      sites.forEach(site => {
        console.log(`  - ${site.subdomain}: ${site.name} (${site.customDomain || 'no custom domain'})`);
      });
    }

    // Check if we can query the Domain table
    console.log('\n📋 Checking Domain table:');
    const domains = await prisma.domain.findMany({
      select: {
        id: true,
        host: true,
        siteId: true
      }
    });

    if (domains.length === 0) {
      console.log('❌ No domains found in database');
    } else {
      console.log(`✅ Found ${domains.length} domains:`);
      domains.forEach(domain => {
        console.log(`  - ${domain.host} -> Site ID: ${domain.siteId}`);
      });
    }

    // Check User table
    console.log('\n📋 Checking User table:');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✅ Found ${users.length} users:`);
      users.forEach(user => {
        console.log(`  - ${user.email}: ${user.name} (${user.role})`);
      });
    }

    // Check environment variables
    console.log('\n🔧 Environment check:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');

  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
