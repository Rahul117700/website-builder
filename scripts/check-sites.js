const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSites() {
  try {
    console.log('🔍 Checking sites in database...');
    
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        userId: true
      }
    });
    
    console.log('📊 Sites found:');
    sites.forEach(site => {
      console.log(`  ${site.name} (${site.subdomain}) - ID: ${site.id}`);
    });
    
    console.log(`\n📈 Total sites: ${sites.length}`);
    
    // Also check domains
    console.log('\n🌐 Checking domains...');
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            id: true,
            name: true,
            subdomain: true
          }
        }
      }
    });
    
    console.log('📊 Domain mappings:');
    domains.forEach(domain => {
      console.log(`  ${domain.host} → ${domain.site.name} (${domain.site.subdomain})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking sites:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSites();
