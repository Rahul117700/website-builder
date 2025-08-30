import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent activities from multiple sources
    const activities = [];

    // Get recent template creations
    const recentTemplates = await prisma.template.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        createdAt: true
      }
    });

    recentTemplates.forEach(template => {
      activities.push({
        id: `template_${template.id}`,
        type: 'template_created',
        message: `Template "${template.name}" was created`,
        createdAt: template.createdAt
      });
    });

    // Get recent template sales (payments for templates created by user)
    const recentSales = await prisma.payment.findMany({
      where: {
        status: 'completed'
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        amount: true,
        createdAt: true
      }
    });

    recentSales.forEach(sale => {
      activities.push({
        id: `sale_${sale.id}`,
        type: 'template_sold',
        message: `Payment received: ₹${sale.amount}`,
        createdAt: sale.createdAt
      });
    });

    // Get recent site updates
    const recentSiteUpdates = await prisma.site.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 5,
      select: {
        id: true,
        name: true,
        updatedAt: true
      }
    });

    recentSiteUpdates.forEach(site => {
      activities.push({
        id: `site_${site.id}`,
        type: 'site_updated',
        message: `Site "${site.name}" was updated`,
        createdAt: site.updatedAt
      });
    });

    // Sort all activities by date and take the most recent 10
    const sortedActivities = activities
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json(sortedActivities);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
