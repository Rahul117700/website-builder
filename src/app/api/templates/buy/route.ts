import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { prisma } from '../../../../lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const runtime = 'nodejs';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID!,
  key_secret: RAZORPAY_KEY_SECRET!,
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    const { templateId } = await req.json();
    if (!templateId) return NextResponse.json({ error: 'Missing templateId' }, { status: 400 });
    // Check if already purchased
    const alreadyPurchased = await prisma.purchasedTemplate.findUnique({ where: { userId_templateId: { userId: user.id, templateId } } });
    if (alreadyPurchased) {
      return NextResponse.json({ error: 'Template already purchased' }, { status: 400 });
    }
    // Fetch template from DB
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      select: { id: true, name: true, price: true },
    });
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    const amount = Math.round(template.price * 100); // Razorpay expects paise
    const order = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `tpl_${templateId}_${Date.now()}`,
      notes: { templateId },
    });
    return NextResponse.json({
      orderId: order.id,
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: template.name,
    });
  } catch (err: any) {
    console.error('Error creating template order:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create order' }, { status: 500 });
  }
} 