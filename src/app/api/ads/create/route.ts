import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { channelId, goal, type, budget, duration, interests, regions } = body;

        // Verify channel ownership
        const channel = await prisma.channel.findUnique({
            where: { id: channelId, userId: session.user.id }
        });

        if (!channel) {
            return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
        }

        // Create Razorpay order
        const order = await razorpay.orders.create({
            amount: budget * 100, // amount in paisa
            currency: 'INR',
            receipt: `ad_camp_${Date.now()}`,
        });

        // Create pending ad campaign
        const campaign = await prisma.adCampaign.create({
            data: {
                channelId,
                userId: session.user.id,
                goal,
                type,
                budget,
                startDate: new Date(),
                endDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000),
                status: 'PENDING',
                razorpayOrderId: order.id,
                targeting: { interests, regions },
            }
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            campaignId: campaign.id
        });

    } catch (error) {
        console.error('Error creating ad campaign:', error);
        return NextResponse.json({ error: 'Failed to create ad campaign' }, { status: 500 });
    }
}
