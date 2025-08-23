import { NextRequest, NextResponse } from 'next/server';
import { findSubdomainForHost } from '../../../lib/domainUtils';

export async function GET(req: NextRequest) {
  const host = req.headers.get('host');
  
  try {
    console.log('🔍 [Test DB] Testing database connection...');
    console.log('🌐 [Test DB] Host:', host);
    
    // Test domain resolution
    const subdomain = await findSubdomainForHost(host || '');
    
    console.log('📋 [Test DB] Subdomain found:', subdomain);
    
    return NextResponse.json({
      success: true,
      message: 'Database connection test',
      host: host,
      subdomain: subdomain,
      expectedRedirect: subdomain ? `/s/${subdomain}` : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ [Test DB] Database error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      host: host,
      timestamp: new Date().toISOString()
    });
  }
}
