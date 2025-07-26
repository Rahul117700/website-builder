import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// GET /api/templates - List all templates
export async function GET(req: NextRequest) {
  const templates = await prisma.template.findMany({
    select: { id: true, name: true, slug: true, price: true, html: true, css: true, js: true, category: true, description: true, preview: true, createdBy: true, approved: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(templates);
}

 