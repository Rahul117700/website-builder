import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizeHost(rawHost: string): string {
  const host = rawHost.toLowerCase();
  const withoutPort = host.replace(/:\d+$/, '');
  return withoutPort.replace(/^www\./, '');
}

export async function GET(req: NextRequest) {
  try {
    const hostParam = req.nextUrl.searchParams.get('host') || '';
    if (!hostParam) {
      return NextResponse.json({ ok: false, error: 'Missing host' }, { status: 400 });
    }

    const host = normalizeHost(hostParam);

    // Look up by custom domain (support both with and without www)
    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { customDomain: host },
          { customDomain: `www.${host}` },
        ],
      },
      select: { subdomain: true },
    });

    if (!site) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    return NextResponse.json({ ok: true, subdomain: site.subdomain });
  } catch (error) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}


