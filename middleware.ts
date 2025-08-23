import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host');
  
  console.log('🔥 [Middleware] MIDDLEWARE IS RUNNING!');
  console.log('🌐 [Middleware] Host:', host);
  console.log('📍 [Middleware] URL:', req.nextUrl.toString());
  
  // Simple test - if host contains 'nextskillpro', redirect
  if (host && host.includes('nextskillpro')) {
    console.log('✅ [Middleware] Redirecting nextskillpro to /s/nextskillpro');
    return NextResponse.redirect(new URL('/s/nextskillpro', req.url));
  }
  
  console.log('➡️ [Middleware] Continuing with normal routing');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};


