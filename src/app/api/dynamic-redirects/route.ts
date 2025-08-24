import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Create Prisma client with no caching
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(req: NextRequest) {
  console.log('🚀 [Dynamic Redirects] API called');
  console.log('📅 [Dynamic Redirects] Timestamp:', new Date().toISOString());
  console.log('🌐 [Dynamic Redirects] Database URL:', process.env.DATABASE_URL?.substring(0, 20) + '...');
  
  try {
    console.log('🔍 [Dynamic Redirects] Fetching domains from database...');
    
    // Force fresh data by adding timestamp to query
    const timestamp = Date.now();
    console.log('⏰ [Dynamic Redirects] Query timestamp:', timestamp);
    
    // Get all connected domains from database with no caching
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            id: true,
            subdomain: true,
            name: true,
            customDomain: true
          }
        }
      }
    });

    console.log(`📊 [Dynamic Redirects] Found ${domains.length} domains in database`);
    
    // Log each domain with full details for debugging
    domains.forEach((domain, index) => {
      console.log(`  ${index + 1}. Domain: ${domain.host}`);
      console.log(`     - Domain ID: ${domain.id}`);
      console.log(`     - Site ID: ${domain.siteId}`);
      console.log(`     - Site Name: ${domain.site.name}`);
      console.log(`     - Site Subdomain: ${domain.site.subdomain}`);
      console.log(`     - Site Custom Domain: ${domain.site.customDomain}`);
      console.log(`     - Site Full ID: ${domain.site.id}`);
      console.log('');
    });

    // Generate redirects array
    console.log('🔧 [Dynamic Redirects] Generating redirects array...');
    const redirects = domains.map(domain => ({
      source: '/',
      has: [
        {
          type: 'host',
          value: domain.host,
        },
      ],
      destination: `/s/${domain.site.subdomain}`,
      permanent: false,
    }));

    console.log('✅ [Dynamic Redirects] Successfully generated redirects:');
    redirects.forEach((redirect, index) => {
      console.log(`  ${index + 1}. ${redirect.has[0].value} → ${redirect.destination}`);
    });

    console.log(`🎯 [Dynamic Redirects] Returning ${redirects.length} redirects`);
    
    // Create response with no-cache headers
    const response = NextResponse.json({
      success: true,
      redirects: redirects,
      count: redirects.length,
      timestamp: timestamp,
      debug: {
        domains: domains.map(d => ({
          host: d.host,
          siteId: d.siteId,
          siteName: d.site.name,
          siteSubdomain: d.site.subdomain,
          siteCustomDomain: d.site.customDomain
        }))
      }
    });

    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('X-Query-Timestamp', timestamp.toString());

    return response;

  } catch (error) {
    console.error('❌ [Dynamic Redirects] Error occurred:', error);
    console.error('📋 [Dynamic Redirects] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch redirects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    console.log('🔌 [Dynamic Redirects] Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ [Dynamic Redirects] Database disconnected');
  }
}
