const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkServerDatabase() {
  try {
    console.log('🔍 Checking SERVER Database State...\n');
    
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
    
    // Check for the specific issue
    console.log('🔍 CHECKING FOR THE ISSUE:');
    console.log('============================');
    
    const nextskillproDomain = domains.find(d => d.host === 'nextskillpro.com');
    if (nextskillproDomain) {
      console.log(`🌐 nextskillpro.com is mapped to: ${nextskillproDomain.site.name} site`);
      if (nextskillproDomain.site.name !== 'nextskillpro') {
        console.log(`❌ PROBLEM: nextskillpro.com should be mapped to 'nextskillpro' site, not '${nextskillproDomain.site.name}'`);
      } else {
        console.log(`✅ nextskillpro.com is correctly mapped to nextskillpro site`);
      }
    } else {
      console.log(`❌ nextskillpro.com is not found in Domain table`);
    }
    
    // Check if agoda site has wrong domain
    const agodaSite = sites.find(s => s.name === 'agoda');
    if (agodaSite) {
      console.log(`🏠 agoda site has customDomain: ${agodaSite.customDomain || 'null'}`);
      if (agodaSite.customDomain === 'nextskillpro.com') {
        console.log(`❌ PROBLEM: agoda site has nextskillpro.com as customDomain`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking server database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServerDatabase();
