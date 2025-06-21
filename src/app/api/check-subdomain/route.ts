import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/check-subdomain?subdomain=example
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      );
    }

    // Validate subdomain format
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) {
      return NextResponse.json(
        {
          available: false,
          error: 'Subdomain can only contain lowercase letters, numbers, and hyphens. It cannot start or end with a hyphen.',
        },
        { status: 400 }
      );
    }

    // Check if subdomain is reserved
    const reservedSubdomains = ['www', 'app', 'api', 'admin', 'dashboard', 'billing', 'auth', 'login', 'register', 'mail'];
    if (reservedSubdomains.includes(subdomain)) {
      return NextResponse.json(
        {
          available: false,
          error: 'This subdomain is reserved and cannot be used.',
        },
        { status: 400 }
      );
    }

    // Check if subdomain is already taken
    const existingSite = await prisma.site.findUnique({
      where: {
        subdomain,
      },
    });

    return NextResponse.json({
      available: !existingSite,
      subdomain,
    });
  } catch (error) {
    console.error('Error checking subdomain:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
