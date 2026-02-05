import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            campaignId
        } = body;

        // Verify signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
        }

        // Update campaign status
        const campaign = await prisma.adCampaign.update({
            where: { id: campaignId },
            data: {
                status: 'ACTIVE',
                razorpayPaymentId: razorpay_payment_id,
            },
            include: { channel: true }
        });

        // If internal, set promoted status on channel
        if (campaign.type === 'INTERNAL') {
            await prisma.channel.update({
                where: { id: campaign.channelId },
                data: {
                    isPromoted: true,
                    promotionExpiry: campaign.endDate,
                }
            });
        }

        return NextResponse.json({ success: true, campaign });

    } catch (error) {
        console.error('Error verifying ad payment:', error);
        return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
    }
}
