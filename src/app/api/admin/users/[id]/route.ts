import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users/[id] - Get user details
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      sites: true,
      subscriptions: { include: { plan: true } },
    },
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json(user);
}

// PATCH /api/admin/users/[id] - Update user
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const data = await req.json();
  const { name, email, role, marketingEmails, productEmails, enabled, planId } = data;
  // Update user fields
  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(role !== undefined && { role }),
      ...(marketingEmails !== undefined && { marketingEmails }),
      ...(productEmails !== undefined && { productEmails }),
      ...(enabled !== undefined && { enabled }),
    },
  });
  // Change plan if planId provided
  let subscription = null;
  if (planId) {
    // Cancel existing active subscriptions
    await prisma.subscription.updateMany({
      where: { userId: user.id, status: 'active' },
      data: { status: 'cancelled' },
    });
    // Create new subscription
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (plan) {
      const now = new Date();
      let endDate;
      if (plan.interval === 'monthly' || plan.interval === 'month') {
        endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (plan.interval === 'yearly' || plan.interval === 'year') {
        endDate = new Date(now);
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate = new Date(now); // fallback
      }
      const renewalDate = new Date(endDate); // always a new object
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          planId: plan.id,
          status: 'active',
          startDate: now,
          endDate,
          renewalDate,
        },
      });
      // Increment Revenue table (single row)
      const revenueRows = await prisma.revenue.findMany();
      if (revenueRows.length === 0) {
        await prisma.revenue.create({ data: { total: plan.price } });
      } else {
        await prisma.revenue.update({
          where: { id: revenueRows[0].id },
          data: { total: { increment: plan.price } },
        });
      }
    }
  }
  return NextResponse.json({ user, subscription });
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Delete user and cascade (prisma should handle relations)
  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
} 