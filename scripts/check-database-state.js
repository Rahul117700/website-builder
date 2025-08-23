const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabaseState() {
  try {
    console.log('🔍 Checking Database State...\n');
    
    // Check Domain table
    console.log('📋 DOMAIN TABLE:');
    console.log('================');
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            id: true,
            name: true,
            subdomain: true,
            customDomain: true
          }
        }
      }
    });
    
    domains.forEach(domain => {
      console.log(`🌐 Domain: ${domain.host}`);
      console.log(`   → Site ID: ${domain.siteId}`);
      console.log(`   → Site Name: ${domain.site.name}`);
      console.log(`   → Site Subdomain: ${domain.site.subdomain}`);
      console.log(`   → Site CustomDomain: ${domain.site.customDomain || 'null'}`);
      console.log('');
    });
    
    // Check Site table
    console.log('🏠 SITE TABLE:');
    console.log('==============');
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        name: true,
        subdomain: true,
        customDomain: true
      }
    });
    
    sites.forEach(site => {
      console.log(`🏠 Site: ${site.name}`);
      console.log(`   → ID: ${site.id}`);
      console.log(`   → Subdomain: ${site.subdomain}`);
      console.log(`   → CustomDomain: ${site.customDomain || 'null'}`);
      console.log('');
    });
    
    // Check for any mismatches
    console.log('🔍 CHECKING FOR MISMATCHES:');
    console.log('============================');
    
    const nextskillproSite = sites.find(s => s.name === 'nextskillpro');
    const agodaSite = sites.find(s => s.name === 'agoda');
    
    if (nextskillproSite) {
      console.log(`✅ nextskillpro site exists with subdomain: ${nextskillproSite.subdomain}`);
      console.log(`   → CustomDomain: ${nextskillproSite.customDomain || 'null'}`);
    }
    
    if (agodaSite) {
      console.log(`✅ agoda site exists with subdomain: ${agodaSite.subdomain}`);
      console.log(`   → CustomDomain: ${agodaSite.customDomain || 'null'}`);
    }
    
    // Check if nextskillpro.com is mapped to the wrong site
    const nextskillproDomain = domains.find(d => d.host === 'nextskillpro.com');
    if (nextskillproDomain) {
      if (nextskillproDomain.site.name === 'nextskillpro') {
        console.log('✅ nextskillpro.com is correctly mapped to nextskillpro site');
      } else {
        console.log(`❌ nextskillpro.com is INCORRECTLY mapped to ${nextskillproDomain.site.name} site`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseState();
