import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {
      approved: true
    };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Get templates with pagination
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder
        },
        include: {
          _count: {
            select: {
              purchases: true
            }
          }
        }
      }),
      prisma.template.count({ where })
    ]);
    
    // Get categories for filtering
    const categories = await prisma.template.groupBy({
      by: ['category'],
      where: { approved: true },
      _count: {
        category: true
      }
    });
    
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      templates: templates.map(template => ({
        ...template,
        purchaseCount: template._count.purchases
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      categories: categories.map(cat => ({
        name: cat.category,
        count: cat._count.category
      })),
      filters: {
        category,
        search,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

 