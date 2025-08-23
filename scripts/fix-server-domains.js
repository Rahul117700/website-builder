const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixServerDomains() {
  try {
    console.log('🔧 Fixing Server Database Domain Mappings...\n');
    
    // First, let's see what we have
    console.log('📋 Current state:');
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
      console.log(`🌐 ${domain.host} → ${domain.site.name} (${domain.site.subdomain})`);
    });
    
    console.log('\n🔍 Finding the issue...');
    
    // Find domains that are mapped to wrong sites
    const wrongMappings = [];
    
    for (const domain of domains) {
      // Check if domain name matches site name (e.g., nextskillpro.com should go to nextskillpro site)
      const domainName = domain.host.replace(/^www\./, '').replace(/\.com$/, '');
      const siteName = domain.site.name;
      
      if (domainName !== siteName) {
        wrongMappings.push({
          domain: domain,
          expectedSite: domainName,
          currentSite: siteName
        });
        console.log(`❌ ${domain.host} is mapped to ${siteName} site, but should go to ${domainName} site`);
      }
    }
    
    if (wrongMappings.length === 0) {
      console.log('✅ All domain mappings look correct!');
      return;
    }
    
    console.log(`\n🔧 Found ${wrongMappings.length} wrong mappings to fix...`);
    
    // Fix each wrong mapping
    for (const wrongMapping of wrongMappings) {
      const { domain, expectedSite } = wrongMapping;
      
      console.log(`\n🔧 Fixing ${domain.host}...`);
      
      // Find the correct site
      const correctSite = await prisma.site.findFirst({
        where: { name: expectedSite }
      });
      
      if (!correctSite) {
        console.log(`❌ Site '${expectedSite}' not found, skipping ${domain.host}`);
        continue;
      }
      
      console.log(`✅ Found correct site: ${correctSite.name} (${correctSite.subdomain})`);
      
      // Update the domain mapping
      await prisma.domain.update({
        where: { id: domain.id },
        data: { siteId: correctSite.id }
      });
      
      console.log(`✅ Updated ${domain.host} to point to ${correctSite.name} site`);
      
      // Update the site customDomain field
      await prisma.site.update({
        where: { id: correctSite.id },
        data: { customDomain: domain.host.replace(/^www\./, '') }
      });
      
      console.log(`✅ Updated ${correctSite.name} site customDomain to ${domain.host.replace(/^www\./, '')}`);
    }
    
    // Verify the fix
    console.log('\n📋 Verifying the fix:');
    const fixedDomains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            name: true,
            subdomain: true
          }
        }
      }
    });
    
    fixedDomains.forEach(domain => {
      console.log(`🌐 ${domain.host} → ${domain.site.name} (${domain.site.subdomain})`);
    });
    
    console.log('\n🎉 Domain mappings fixed successfully!');
    console.log('Now domains should redirect to their correct sites!');
    
  } catch (error) {
    console.error('❌ Error fixing domains:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixServerDomains();
