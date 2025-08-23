import { NextRequest, NextResponse } from 'next/server';
import { findSubdomainForHost } from '@/lib/domainUtils';

export async function GET(req: NextRequest) {
  try {
    const host = req.headers.get('host');
    
    if (!host) {
      console.log('❌ [API] No host header found');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    console.log(`🔍 [API] Resolving domain for host: ${host}`);
    
    // Skip localhost and development domains
    if (host.includes('localhost') || host.includes('127.0.0.1') || host.includes('.local')) {
      console.log('⏭️ [API] Skipping localhost/development domain');
      return NextResponse.redirect(new URL('/', req.url));
    }
    
    // Find the corresponding subdomain for this host
    const subdomain = await findSubdomainForHost(host);
    
    if (subdomain) {
      console.log(`✅ [API] Found subdomain: ${subdomain} for host: ${host}`);
      
      // Build the redirect URL
      const redirectUrl = new URL(`/s/${subdomain}`, req.url);
      
      // Preserve the original path if it's not just the root
      const path = req.nextUrl.pathname;
      if (path !== '/') {
        redirectUrl.searchParams.set('page', path.substring(1));
        console.log(`📄 [API] Preserving path: ${path} -> page=${path.substring(1)}`);
      }
      
      // Preserve query parameters
      req.nextUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
        console.log(`🔗 [API] Preserving query param: ${key}=${value}`);
      });
      
      console.log(`🔄 [API] Redirecting to: ${redirectUrl.toString()}`);
      
      return NextResponse.redirect(redirectUrl);
    } else {
      console.log(`❌ [API] No subdomain found for host: ${host}`);
      
      // If no subdomain found, redirect to main site
      return NextResponse.redirect(new URL('/', req.url));
    }
  } catch (error) {
    console.error('❌ [API] Error in resolve-domain-redirect:', error);
    
    // On error, redirect to main site
    return NextResponse.redirect(new URL('/', req.url));
  }
}
