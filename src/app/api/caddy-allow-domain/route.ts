import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function stripProtocol(value: string): string {
  return value.replace(/^https?:\/\//i, '');
}

function normalizeHost(raw: string): string {
  const host = stripProtocol(raw).toLowerCase();
  const withoutPath = host.split('/')[0] || host;
  const withoutPort = withoutPath.replace(/:\d+$/, '');
  return withoutPort.replace(/^www\./, '');
}

export async function GET(req: NextRequest) {
  try {
    const domainParam = req.nextUrl.searchParams.get('domain') || req.nextUrl.searchParams.get('host') || '';
    if (!domainParam) {
      return new NextResponse('missing domain', { status: 400 });
    }
    const host = normalizeHost(domainParam);

    const variations = Array.from(new Set([
      host,
      `www.${host}`,
      `http://${host}`,
      `https://${host}`,
      `http://www.${host}`,
      `https://www.${host}`,
    ]));

    const site = await prisma.site.findFirst({
      where: {
        OR: variations.map((v) => ({ customDomain: { equals: v, mode: 'insensitive' as const } })),
      },
      select: { id: true },
    });

    if (!site) {
      return new NextResponse('not allowed', { status: 404 });
    }
    return new NextResponse('ok', { status: 200 });
  } catch {
    return new NextResponse('error', { status: 500 });
  }
}


