import { NextRequest, NextResponse } from 'next/server';
import { clearDomainMappingsCache } from '@/lib/domainUtils';

export async function POST(req: NextRequest) {
  try {
    // Clear the domain mappings cache
    clearDomainMappingsCache();
    
    return NextResponse.json({
      success: true,
      message: 'Domain cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing domain cache:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // Clear the domain mappings cache
    clearDomainMappingsCache();
    
    return NextResponse.json({
      success: true,
      message: 'Domain cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing domain cache:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
