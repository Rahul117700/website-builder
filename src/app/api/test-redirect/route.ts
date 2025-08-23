import { NextRequest, NextResponse } from 'next/server';
import { findSubdomainForHost } from '../../../lib/domainUtils';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  
  try {
    // Test domain resolution
    const subdomain = await findSubdomainForHost(host || '');
    
    if (subdomain) {
      // Redirect to the subdomain
      const redirectUrl = `/s/${subdomain}`;
      console.log(`🔄 Redirecting ${host} to ${redirectUrl}`);
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    } else {
      return NextResponse.json({
        success: false,
        message: `No subdomain found for host: ${host}`,
        host: host,
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      host: host,
      timestamp: new Date().toISOString()
    });
  }
}
