import { NextRequest, NextResponse } from 'next/server';
import { findSubdomainForHost } from '../../../lib/domainUtils';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  const url = req.nextUrl;
  
  // Test domain resolution
  let resolvedSubdomain = null;
  let error = null;
  
  if (host) {
    try {
      resolvedSubdomain = await findSubdomainForHost(host);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }
  }
  
  return NextResponse.json({
    success: true,
    test: 'Domain Routing Logic',
    host: host,
    url: url.toString(),
    resolvedSubdomain: resolvedSubdomain,
    error: error,
    expectedRedirect: resolvedSubdomain ? `/s/${resolvedSubdomain}` : null,
    timestamp: new Date().toISOString()
  });
}
