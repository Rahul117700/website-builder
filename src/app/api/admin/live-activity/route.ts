import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current time and calculate time ranges
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
    const fiveHoursAgo = new Date(now.getTime() - 5 * 60 * 60 * 1000);
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    // Get users who have been active in the last 6 hours (created funnels, made transactions)
    const recentUsers = await prisma.user.findMany({
      where: {
        NOT: { email: { startsWith: 'fake_' } },
        OR: [
          { createdAt: { gte: sixHoursAgo } },
          { funnels: { some: { createdAt: { gte: sixHoursAgo } } } },
          { transactions: { some: { createdAt: { gte: sixHoursAgo } } } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        funnels: {
          where: { createdAt: { gte: sixHoursAgo } },
          select: { id: true, name: true, createdAt: true }
        },
        transactions: {
          where: { createdAt: { gte: sixHoursAgo } },
          select: { id: true, amount: true, createdAt: true }
        }
      }
    });

    // Generate time series data for the last 6 hours
    const timeSlots = [
      { time: sixHoursAgo, label: '6h ago', users: 0, activities: 0 },
      { time: fiveHoursAgo, label: '5h ago', users: 0, activities: 0 },
      { time: fourHoursAgo, label: '4h ago', users: 0, activities: 0 },
      { time: threeHoursAgo, label: '3h ago', users: 0, activities: 0 },
      { time: twoHoursAgo, label: '2h ago', users: 0, activities: 0 },
      { time: oneHourAgo, label: '1h ago', users: 0, activities: 0 },
      { time: now, label: 'Now', users: 0, activities: 0 }
    ];

    // Calculate users and activities for each time slot
    timeSlots.forEach((slot, index) => {
      const nextSlot = timeSlots[index + 1];
      const slotEnd = nextSlot ? nextSlot.time : now;

      // Count users active in this time slot
      const activeUsers = recentUsers.filter(user => {
        const userCreated = user.createdAt >= slot.time && user.createdAt < slotEnd;
        const hasRecentFunnels = user.funnels.some(funnel =>
          funnel.createdAt >= slot.time && funnel.createdAt < slotEnd
        );
        const hasRecentTransactions = user.transactions.some(transaction =>
          transaction.createdAt >= slot.time && transaction.createdAt < slotEnd
        );

        return userCreated || hasRecentFunnels || hasRecentTransactions;
      });

      slot.users = activeUsers.length;

      // Count activities in this time slot
      let activityCount = 0;
      recentUsers.forEach(user => {
        activityCount += user.funnels.filter(funnel =>
          funnel.createdAt >= slot.time && funnel.createdAt < slotEnd
        ).length;
        activityCount += user.transactions.filter(transaction =>
          transaction.createdAt >= slot.time && transaction.createdAt < slotEnd
        ).length;
      });

      slot.activities = activityCount;
    });

    // Get current live metrics
    const totalActiveUsers = recentUsers.length;
    const currentHourActivities = timeSlots[timeSlots.length - 1].activities;
    const previousHourActivities = timeSlots[timeSlots.length - 2].activities;
    const activityGrowth = previousHourActivities > 0
      ? ((currentHourActivities - previousHourActivities) / previousHourActivities) * 100
      : 0;

    // Get top active users
    const topActiveUsers = recentUsers
      .map(user => ({
        id: user.id,
        name: user.name || user.email,
        email: user.email,
        totalActivities: user.funnels.length + user.transactions.length,
        revenue: user.transactions.reduce((sum, t) => sum + t.amount, 0)
      }))
      .sort((a, b) => b.totalActivities - a.totalActivities)
      .slice(0, 5);

    return NextResponse.json({
      timeSeriesData: timeSlots.map(slot => ({
        time: slot.time.toISOString(),
        label: slot.label,
        activeUsers: slot.users,
        activities: slot.activities
      })),
      liveMetrics: {
        totalActiveUsers,
        currentHourActivities,
        activityGrowth: Math.round(activityGrowth * 10) / 10,
        averageUsersPerHour: Math.round(timeSlots.reduce((sum, slot) => sum + slot.users, 0) / timeSlots.length)
      },
      topActiveUsers
    });

  } catch (error) {
    console.error('Error fetching live activity data:', error);
    return NextResponse.json({ error: 'Failed to fetch live activity data' }, { status: 500 });
  }
}
