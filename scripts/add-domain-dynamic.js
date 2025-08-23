const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDomainDynamic() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length !== 2) {
      console.log('❌ Usage: node scripts/add-domain-dynamic.js <domain> <site_name>');
      console.log('Example: node scripts/add-domain-dynamic.js mysite.com mysite');
      console.log('Example: node scripts/add-domain-dynamic.js example.com example');
      return;
    }
    
    const domain = args[0];
    const siteName = args[1];
    
    console.log(`🔧 Adding domain ${domain} to site ${siteName}...\n`);
    
    // Find the site
    const site = await prisma.site.findFirst({
      where: { name: siteName }
    });
    
    if (!site) {
      console.log(`❌ Site '${siteName}' not found!`);
      console.log('\nAvailable sites:');
      const allSites = await prisma.site.findMany({
        select: { name: true, subdomain: true }
      });
      allSites.forEach(s => console.log(`   - ${s.name} (${s.subdomain})`));
      return;
    }
    
    console.log(`✅ Found site: ${site.name} (${site.subdomain})`);
    
    // Check if domain already exists
    const existingDomain = await prisma.domain.findFirst({
      where: { host: domain }
    });
    
    if (existingDomain) {
      console.log(`⚠️ Domain ${domain} already exists and is mapped to ${existingDomain.siteId}`);
      
      // Ask if user wants to update it
      console.log(`Do you want to update ${domain} to point to ${site.name} site? (y/n)`);
      // For now, just update it automatically
      console.log('Auto-updating...');
      
      await prisma.domain.update({
        where: { id: existingDomain.id },
        data: { siteId: site.id }
      });
      
      console.log(`✅ Updated ${domain} to point to ${site.name} site`);
    } else {
      // Create new domain mapping
      await prisma.domain.create({
        data: {
          host: domain,
          siteId: site.id
        }
      });
      
      console.log(`✅ Created new domain mapping: ${domain} → ${site.name}`);
    }
    
    // Also add www version
    const wwwDomain = domain.startsWith('www.') ? domain : `www.${domain}`;
    const existingWwwDomain = await prisma.domain.findFirst({
      where: { host: wwwDomain }
    });
    
    if (!existingWwwDomain) {
      await prisma.domain.create({
        data: {
          host: wwwDomain,
          siteId: site.id
        }
      });
      console.log(`✅ Created www version: ${wwwDomain} → ${site.name}`);
    }
    
    // Update site customDomain
    await prisma.site.update({
      where: { id: site.id },
      data: { customDomain: domain.replace(/^www\./, '') }
    });
    
    console.log(`✅ Updated ${site.name} site customDomain to ${domain.replace(/^www\./, '')}`);
    
    // Verify the result
    console.log('\n📋 Final result:');
    const finalDomains = await prisma.domain.findMany({
      where: { siteId: site.id },
      include: { site: { select: { name: true, subdomain: true } } }
    });
    
    finalDomains.forEach(d => {
      console.log(`🌐 ${d.host} → ${d.site.name} (${d.site.subdomain})`);
    });
    
    console.log(`\n🎉 Domain ${domain} successfully added to ${site.name} site!`);
    console.log(`Now when users visit ${domain}, they will be redirected to /s/${site.subdomain}`);
    
  } catch (error) {
    console.error('❌ Error adding domain:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDomainDynamic();
