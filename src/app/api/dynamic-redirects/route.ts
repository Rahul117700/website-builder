import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Get all connected domains from database
    const domains = await prisma.domain.findMany({
      include: {
        site: {
          select: {
            subdomain: true,
            name: true
          }
        }
      },
      where: {
        // Only get domains that are connected (you can add status check here)
        site: {
          isNot: null
        }
      }
    });

    // Generate redirects array
    const redirects = domains.map(domain => ({
      source: '/',
      has: [
        {
          type: 'host',
          value: domain.host,
        },
      ],
      destination: `/s/${domain.site.subdomain}`,
      permanent: false,
    }));

    return NextResponse.json({
      success: true,
      redirects: redirects,
      count: redirects.length
    });

  } catch (error) {
    console.error('Error fetching dynamic redirects:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch redirects'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
