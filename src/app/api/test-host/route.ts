import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  const url = req.nextUrl;
  
  return NextResponse.json({
    success: true,
    host: host,
    url: url.toString(),
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString()
  });
}
