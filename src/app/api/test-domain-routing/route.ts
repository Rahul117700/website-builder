import { NextRequest, NextResponse } from 'next/server';
import { getDomainMappings, findSubdomainForHost } from '@/lib/domainUtils';

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('host') || 'unknown';
    const url = req.nextUrl;
    
    // Get all domain mappings
    const mappings = await getDomainMappings();
    
    // Test finding subdomain for current host
    const subdomain = await findSubdomainForHost(host);
    
    // Test finding subdomain for a specific domain
    const testDomain = 'nextskillpro.com';
    const testSubdomain = await findSubdomainForHost(testDomain);
    
    return NextResponse.json({
      success: true,
      currentHost: host,
      currentUrl: url.toString(),
      allMappings: mappings,
      currentHostSubdomain: subdomain,
      testDomain: testDomain,
      testDomainSubdomain: testSubdomain,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test-domain-routing:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
