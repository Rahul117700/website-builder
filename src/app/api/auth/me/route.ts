import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, image } = await req.json();
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, image },
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const userId = session.user.id;
    // Get all sites owned by the user
    const sites = await prisma.site.findMany({ where: { userId } });
    for (const site of sites) {
      await prisma.page.deleteMany({ where: { siteId: site.id } });
      await prisma.booking.deleteMany({ where: { siteId: site.id } });
      await prisma.submission.deleteMany({ where: { siteId: site.id } });
      await prisma.analytics.deleteMany({ where: { siteId: site.id } });
      await prisma.payment.deleteMany({ where: { siteId: site.id } });
    }
    // Delete the sites
    await prisma.site.deleteMany({ where: { userId } });
    // Delete all direct user-related records
    await prisma.notification.deleteMany({ where: { userId } });
    await prisma.payment.deleteMany({ where: { userId } });
    await prisma.analytics.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.account.deleteMany({ where: { userId } });
    await prisma.session.deleteMany({ where: { userId } });
    // Finally, delete the user
    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
} 