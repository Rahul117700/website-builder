import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function normalizeHost(raw: string): string {
  return raw.toLowerCase().replace(/:^\d+$/, '').replace(/^www\./, '');
}

export async function GET(req: NextRequest) {
  try {
    const domainParam = req.nextUrl.searchParams.get('domain') || req.nextUrl.searchParams.get('host') || '';
    if (!domainParam) {
      return new NextResponse('missing domain', { status: 400 });
    }
    const host = normalizeHost(domainParam);

    const site = await prisma.site.findFirst({
      where: {
        OR: [
          { customDomain: host },
          { customDomain: `www.${host}` },
        ],
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


