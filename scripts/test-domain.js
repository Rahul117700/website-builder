const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDomain() {
  try {
    console.log('🔍 Testing domain resolution...\n');

    // 1. Check all domains in the database
    console.log('📋 All domains in database:');
    const allDomains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            id: true,
            subdomain: true,
            name: true,
            customDomain: true
          }
        }
      }
    });

    if (allDomains.length === 0) {
      console.log('❌ No domains found in database');
      return;
    }

    allDomains.forEach(domain => {
      console.log(`  - ${domain.host} -> Site: ${domain.site.subdomain} (${domain.site.name})`);
    });

    // 2. Test specific domain resolution
    console.log('\n🔍 Testing specific domain resolution:');
    const testHosts = ['nextskillpro.com', 'www.nextskillpro.com'];
    
    for (const host of testHosts) {
      console.log(`\nTesting host: ${host}`);
      
      // Check Domain table
      const domainRow = await prisma.domain.findFirst({
        where: { host: { equals: host, mode: 'insensitive' } },
        include: { site: { select: { subdomain: true } } }
      });

      if (domainRow) {
        console.log(`  ✅ Found in Domain table: ${domainRow.host} -> ${domainRow.site.subdomain}`);
      } else {
        console.log(`  ❌ Not found in Domain table`);
      }

      // Check Site table (legacy fallback)
      const site = await prisma.site.findFirst({
        where: { customDomain: { equals: host, mode: 'insensitive' } },
        select: { subdomain: true }
      });

      if (site) {
        console.log(`  ✅ Found in Site table (legacy): ${host} -> ${site.subdomain}`);
      } else {
        console.log(`  ❌ Not found in Site table (legacy)`);
      }
    }

    // 3. Test the exact query from the API
    console.log('\n🔍 Testing API query logic:');
    const testHost = 'nextskillpro.com';
    const variations = [
      testHost,
      `www.${testHost}`,
      `http://${testHost}`,
      `https://${testHost}`,
      `http://www.${testHost}`,
      `https://www.${testHost}`,
    ];

    console.log(`Variations for ${testHost}:`, variations);

    const domainRow = await prisma.domain.findFirst({
      where: {
        OR: variations.map((v) => ({ host: { equals: v, mode: 'insensitive' } })),
      },
      include: { site: { select: { subdomain: true } } },
    });

    if (domainRow) {
      console.log(`✅ Domain table result: ${domainRow.host} -> ${domainRow.site.subdomain}`);
    } else {
      console.log(`❌ Domain table: No match found`);
    }

    const site = await prisma.site.findFirst({
      where: {
        OR: variations.map((v) => ({ customDomain: { equals: v, mode: 'insensitive' } })),
      },
      select: { subdomain: true },
    });

    if (site) {
      console.log(`✅ Site table result: ${testHost} -> ${site.subdomain}`);
    } else {
      console.log(`❌ Site table: No match found`);
    }

  } catch (error) {
    console.error('❌ Error testing domain:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDomain();
