import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get total templates
    const totalTemplates = await prisma.template.count();
    
    // Get total revenue from completed payments
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'completed',
        templateId: { not: null }
      },
      _sum: {
        amount: true
      }
    });
    
    // Get total purchases
    const totalPurchases = await prisma.purchasedTemplate.count();
    
    // Get average template price
    const averagePrice = await prisma.template.aggregate({
      _avg: {
        price: true
      }
    });
    
    // Get top performing categories
    const topCategories = await prisma.template.groupBy({
      by: ['category'],
      _count: {
        category: true
      },
      _sum: {
        price: true
      },
      orderBy: {
        _count: {
          category: 'desc'
        }
      },
      take: 5
    });
    
    // Calculate revenue per category
    const categoryStats = await Promise.all(
      topCategories.map(async (cat) => {
        const categoryRevenue = await prisma.payment.aggregate({
          where: {
            status: 'completed',
            template: {
              category: cat.category
            }
          },
          _sum: {
            amount: true
          }
        });
        
        return {
          category: cat.category,
          count: cat._count.category,
          revenue: categoryRevenue._sum.amount || 0
        };
      })
    );
    
    return NextResponse.json({
      totalTemplates,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalPurchases,
      averagePrice: averagePrice._avg.price || 0,
      topCategories: categoryStats
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
