import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  console.log('🔥 [Middleware] MIDDLEWARE IS RUNNING!');
  console.log('🚀 [Middleware] Request started');
  console.log('🏠 [Middleware] Host:', req.headers.get('host'));
  console.log('📍 [Middleware] URL:', req.nextUrl.toString());
  
  // Always continue for now - just testing if middleware loads
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|static|.*\\..*).*)'],
};


