const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDynamicRouting() {
  try {
    console.log('🔍 Testing Dynamic Domain Routing...\n');
    
    // Get all domains from database
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            subdomain: true,
            name: true
          }
        }
      }
    });
    
    console.log('📋 Current Domain Mappings in Database:');
    console.log('=====================================');
    
    domains.forEach(domain => {
      console.log(`🌐 Domain: ${domain.host}`);
      console.log(`   → Site: ${domain.site.name} (${domain.site.subdomain})`);
      console.log(`   → Redirects to: /s/${domain.site.subdomain}`);
      console.log('');
    });
    
    // Test specific domains
    const testDomains = [
      'nextskillpro.com',
      'www.nextskillpro.com',
      'agoda.com',
      'test.com'
    ];
    
    console.log('🧪 Testing Domain Resolution:');
    console.log('============================');
    
    for (const testDomain of testDomains) {
      const mapping = domains.find(d => 
        d.host === testDomain || 
        d.host === testDomain.replace(/^www\./, '') ||
        d.host === `www.${testDomain.replace(/^www\./, '')}`
      );
      
      if (mapping) {
        console.log(`✅ ${testDomain} → /s/${mapping.site.subdomain} (${mapping.site.name})`);
      } else {
        console.log(`❌ ${testDomain} → No mapping found`);
      }
    }
    
    console.log('\n🎯 Expected Behavior:');
    console.log('====================');
    console.log('• When user visits nextskillpro.com → Should redirect to /s/nextskillpro');
    console.log('• When user visits www.nextskillpro.com → Should redirect to /s/nextskillpro');
    console.log('• When user visits agoda.com → Should redirect to /s/agoda');
    console.log('• When user visits test.com → Should redirect to /s/test');
    
  } catch (error) {
    console.error('❌ Error testing dynamic routing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDynamicRouting();
