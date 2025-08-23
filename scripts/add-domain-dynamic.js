const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDomain() {
  try {
    // Get command line arguments
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      console.log('❌ Usage: node add-domain-dynamic.js <domain> <subdomain>');
      console.log('Example: node add-domain-dynamic.js example.com example');
      return;
    }
    
    const domain = args[0];
    const subdomain = args[1];
    
    console.log(`🔍 Adding domain: ${domain} -> subdomain: ${subdomain}`);
    
    // First, check if the site exists
    const site = await prisma.site.findFirst({
      where: {
        subdomain: subdomain
      }
    });

    if (!site) {
      console.log(`❌ Site with subdomain "${subdomain}" not found.`);
      console.log('Available sites:');
      const allSites = await prisma.site.findMany({
        select: { subdomain: true, name: true }
      });
      allSites.forEach(s => console.log(`  - ${s.subdomain} (${s.name})`));
      return;
    }

    console.log('✅ Found site:', {
      id: site.id,
      subdomain: site.subdomain,
      name: site.name
    });

    // Check if domain already exists
    const existingDomain = await prisma.domain.findFirst({
      where: {
        OR: [
          { host: domain },
          { host: `www.${domain}` }
        ]
      }
    });

    if (existingDomain) {
      console.log('✅ Domain already exists:', existingDomain);
      return;
    }

    // Add the domain record
    const domainRecord = await prisma.domain.create({
      data: {
        host: domain,
        siteId: site.id
      }
    });

    console.log('✅ Domain created successfully:', domainRecord);

    // Also add www version
    const wwwDomain = await prisma.domain.create({
      data: {
        host: `www.${domain}`,
        siteId: site.id
      }
    });

    console.log('✅ WWW domain created successfully:', wwwDomain);

    // Also update the site's customDomain field as a backup
    await prisma.site.update({
      where: { id: site.id },
      data: { customDomain: domain }
    });

    console.log('✅ Updated site customDomain field');

    console.log('\n🎉 Domain setup complete!');
    console.log(`Now ${domain} and www.${domain} will redirect to /s/${subdomain}`);

  } catch (error) {
    console.error('❌ Error adding domain:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDomain();
