import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// PATCH /api/plans/:id - Update a plan by id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, price, description, interval, currency, numberOfWebsites, unlimitedWebsites, supportLevel, customDomain, advancedAnalytics, customIntegrations, teamManagement, communityAccess } = await req.json();
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
  }
  const plan = await prisma.plan.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price: Number(price) }),
      ...(interval !== undefined && { interval }),
      ...(currency !== undefined && { currency }),
      ...(description !== undefined && { description }),
      ...(numberOfWebsites !== undefined && { numberOfWebsites: unlimitedWebsites ? null : (numberOfWebsites ? Number(numberOfWebsites) : null) }),
      ...(unlimitedWebsites !== undefined && { unlimitedWebsites: Boolean(unlimitedWebsites) }),
      ...(supportLevel !== undefined && { supportLevel }),
      ...(customDomain !== undefined && { customDomain: Boolean(customDomain) }),
      ...(advancedAnalytics !== undefined && { advancedAnalytics: Boolean(advancedAnalytics) }),
      ...(customIntegrations !== undefined && { customIntegrations: Boolean(customIntegrations) }),
      ...(teamManagement !== undefined && { teamManagement: Boolean(teamManagement) }),
      ...(communityAccess !== undefined && { communityAccess: Boolean(communityAccess) }),
    },
  });
  return NextResponse.json(plan);
}

// DELETE /api/plans/:id - Delete a plan by id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const id = params.id;
  if (!id) {
    return NextResponse.json({ error: 'Plan id is required' }, { status: 400 });
  }
  try {
    // Delete all payments referencing this plan
    await prisma.payment.deleteMany({ where: { planId: id } });
    // Delete all subscriptions referencing this plan
    await prisma.subscription.deleteMany({ where: { planId: id } });
    // Now delete the plan
    const plan = await prisma.plan.delete({ where: { id } });
    return NextResponse.json(plan);
  } catch (error: any) {
    if (error.code === 'P2003' || error.message.includes('Foreign key constraint')) {
      return NextResponse.json({ error: 'Cannot delete plan: it is still referenced.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to delete plan.' }, { status: 500 });
  }
} 