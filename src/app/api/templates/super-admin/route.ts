import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const templates = await prisma.template.findMany({
    where: { approved: true, createdBy: 'super_admin' },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true }
  });
  return NextResponse.json(templates);
} 