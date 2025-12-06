import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getBrandConfig, updateBrandConfig } from '@/lib/brand-config';

/**
 * GET /api/brand-config
 * Get current brand configuration
 */
export async function GET() {
  try {
    const config = await getBrandConfig(true);
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching brand config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand configuration' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/brand-config
 * Update brand configuration
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Only SUPER_ADMIN can update brand configuration
    if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    await updateBrandConfig(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating brand config:', error);
    return NextResponse.json(
      { error: 'Failed to update brand configuration' },
      { status: 500 }
    );
  }
}

