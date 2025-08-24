const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixDomainMappings() {
  try {
    console.log('🔧 Fixing domain mappings...');
    
    // First, let's see what we have
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
    
    console.log('📊 Current domain mappings:');
    domains.forEach(domain => {
      console.log(`  ${domain.host} → ${domain.site.name} (${domain.site.subdomain})`);
    });
    
    // Fix the mappings
    // 1. nextskillpro.com should go to nextskillpro site
    // 2. agoda.com should go to agoda site
    
    // Find the sites
    const nextskillproSite = await prisma.site.findFirst({
      where: { subdomain: 'nextskillpro' }
    });
    
    const agodaSite = await prisma.site.findFirst({
      where: { subdomain: 'agoda' }
    });
    
    if (!nextskillproSite || !agodaSite) {
      console.log('❌ Sites not found!');
      return;
    }
    
    console.log('✅ Found sites:');
    console.log(`  nextskillpro: ${nextskillproSite.id}`);
    console.log(`  agoda: ${agodaSite.id}`);
    
    // Update domain mappings
    await prisma.domain.updateMany({
      where: { host: 'nextskillpro.com' },
      data: { siteId: nextskillproSite.id }
    });
    
    await prisma.domain.updateMany({
      where: { host: 'agoda.com' },
      data: { siteId: agodaSite.id }
    });
    
    // Also fix www versions
    await prisma.domain.updateMany({
      where: { host: 'www.nextskillpro.com' },
      data: { siteId: nextskillproSite.id }
    });
    
    await prisma.domain.updateMany({
      where: { host: 'www.agoda.com' },
      data: { siteId: agodaSite.id }
    });
    
    console.log('✅ Domain mappings fixed!');
    
    // Show updated mappings
    const updatedDomains = await prisma.domain.findMany({
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
    
    console.log('📊 Updated domain mappings:');
    updatedDomains.forEach(domain => {
      console.log(`  ${domain.host} → ${domain.site.name} (${domain.site.subdomain})`);
    });
    
  } catch (error) {
    console.error('❌ Error fixing domain mappings:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDomainMappings();
