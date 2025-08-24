import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  console.log('🚀 [Dynamic Redirects] API called');
  console.log('📅 [Dynamic Redirects] Timestamp:', new Date().toISOString());
  
  try {
    console.log('🔍 [Dynamic Redirects] Fetching domains from database...');
    
    // Get all connected domains from database
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

    console.log(`📊 [Dynamic Redirects] Found ${domains.length} domains in database`);
    
    // Log each domain for debugging
    domains.forEach((domain, index) => {
      console.log(`  ${index + 1}. ${domain.host} → ${domain.site.subdomain} (${domain.site.name})`);
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
    
    return NextResponse.json({
      success: true,
      redirects: redirects,
      count: redirects.length
    });

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
