const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDomain() {
  try {
    // First, let's check if the site exists
    const site = await prisma.site.findFirst({
      where: {
        subdomain: 'nextskillpro'
      }
    });

    if (!site) {
      console.log('❌ Site with subdomain "nextskillpro" not found.');
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
          { host: 'nextskillpro.com' },
          { host: 'www.nextskillpro.com' }
        ]
      }
    });

    if (existingDomain) {
      console.log('✅ Domain already exists:', existingDomain);
      return;
    }

    // Add the domain record
    const domain = await prisma.domain.create({
      data: {
        host: 'nextskillpro.com',
        siteId: site.id
      }
    });

    console.log('✅ Domain created successfully:', domain);

    // Also add www version
    const wwwDomain = await prisma.domain.create({
      data: {
        host: 'www.nextskillpro.com',
        siteId: site.id
      }
    });

    console.log('✅ WWW domain created successfully:', wwwDomain);

    // Also update the site's customDomain field as a backup
    await prisma.site.update({
      where: { id: site.id },
      data: { customDomain: 'nextskillpro.com' }
    });

    console.log('✅ Updated site customDomain field');

  } catch (error) {
    console.error('❌ Error adding domain:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addDomain();
