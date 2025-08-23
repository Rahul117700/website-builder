const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDomains() {
  try {
    console.log('🔍 Checking domain status...\n');
    
    // Check all domains in the Domain table
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            id: true,
            subdomain: true,
            name: true
          }
        }
      }
    });
    
    console.log('📋 Domains in Domain table:');
    if (domains.length === 0) {
      console.log('  ❌ No domains found');
    } else {
      domains.forEach(domain => {
        console.log(`  ✅ ${domain.host} -> Site: ${domain.site.subdomain} (${domain.site.name})`);
      });
    }
    
    // Check all sites with customDomain
    const sites = await prisma.site.findMany({
      select: {
        id: true,
        subdomain: true,
        name: true,
        customDomain: true
      }
    });
    
    console.log('\n🌐 Sites with customDomain:');
    sites.forEach(site => {
      if (site.customDomain) {
        console.log(`  ✅ Site: ${site.subdomain} (${site.name}) -> Domain: ${site.customDomain}`);
      } else {
        console.log(`  ❌ Site: ${site.subdomain} (${site.name}) -> No custom domain`);
      }
    });
    
    // Test specific domain lookup
    console.log('\n🧪 Testing domain resolution:');
    const testDomains = ['nextskillpro.com', 'www.nextskillpro.com', 'agoda.com', 'www.agoda.com'];
    
    for (const testDomain of testDomains) {
      console.log(`\nTesting: ${testDomain}`);
      
      // Check Domain table
      const domainMatch = domains.find(d => d.host === testDomain);
      if (domainMatch) {
        console.log(`  ✅ Found in Domain table: ${domainMatch.host} -> ${domainMatch.site.subdomain}`);
      } else {
        console.log(`  ❌ Not found in Domain table`);
      }
      
      // Check Site table
      const siteMatch = sites.find(s => s.customDomain === testDomain);
      if (siteMatch) {
        console.log(`  ✅ Found in Site table: ${testDomain} -> ${siteMatch.subdomain}`);
      } else {
        console.log(`  ❌ Not found in Site table`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking domains:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDomains();
