import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, FunnelType } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const whereClause = type && Object.values(FunnelType).includes(type as FunnelType) 
      ? { type: type as FunnelType } 
      : {};

    const templates = await prisma.funnelTemplate.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching funnel templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, htmlSchema, previewUrl } = body;

    if (!name || !type || !htmlSchema) {
      return NextResponse.json({ error: 'Name, type, and HTML schema are required' }, { status: 400 });
    }

    const template = await prisma.funnelTemplate.create({
      data: {
        name,
        type: type as FunnelType,
        description,
        htmlSchema,
        previewUrl
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating funnel template:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
