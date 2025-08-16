import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, '');
}

function normalizeHost(rawHost: string): string {
  const host = stripProtocol(rawHost).toLowerCase();
  const withoutPath = host.split('/')[0] || host; // remove any path/query accidentally passed
  const withoutPort = withoutPath.replace(/:\d+$/, '');
  return withoutPort.replace(/^www\./, '');
}

export async function GET(req: NextRequest) {
  try {
    const hostParam = req.nextUrl.searchParams.get('host') || '';
    if (!hostParam) {
      return NextResponse.json({ ok: false, error: 'Missing host' }, { status: 400 });
    }

    const host = normalizeHost(hostParam);

    const variations = Array.from(new Set([
      host,
      `www.${host}`,
      `http://${host}`,
      `https://${host}`,
      `http://www.${host}`,
      `https://www.${host}`,
    ]));

    // Look up by custom domain with variations and case-insensitive match
    const site = await prisma.site.findFirst({
      where: {
        OR: variations.map((v) => ({ customDomain: { equals: v, mode: 'insensitive' as const } })),
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


