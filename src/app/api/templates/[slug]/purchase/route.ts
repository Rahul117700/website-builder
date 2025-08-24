import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const prisma = new PrismaClient();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    const { currency = 'USD' } = await request.json();
    
    // Get template details
    const template = await prisma.template.findUnique({
      where: { slug }
    });
    
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }
    
    // Check if user already purchased this template
    const existingPurchase = await prisma.purchasedTemplate.findUnique({
      where: {
        userId_templateId: {
          userId: session.user.id,
          templateId: template.id
        }
      }
    });
    
    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Template already purchased' },
        { status: 400 }
      );
    }
    
    // Convert price to appropriate currency (simplified - you might want to use real exchange rates)
    let amount = template.price;
    let currencyCode = 'USD';
    
    if (currency === 'INR') {
      amount = Math.round(template.price * 83); // Approximate USD to INR conversion
      currencyCode = 'INR';
    } else if (currency === 'EUR') {
      amount = Math.round(template.price * 0.92 * 100) / 100; // Approximate USD to EUR conversion
      currencyCode = 'EUR';
    }
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Razorpay expects amount in smallest currency unit
      currency: currencyCode,
      receipt: `template_${template.id}_${Date.now()}`,
      notes: {
        templateId: template.id,
        templateName: template.name,
        userId: session.user.id
      }
    });
    
    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: amount,
        currency: currencyCode,
        status: 'pending',
        paymentMethod: 'razorpay',
        paymentIntentId: order.id,
        countryCode: 'US', // You might want to get this from user profile
        taxAmount: 0,
        taxRate: 0,
        // Link to template instead of plan
        templateId: template.id
      }
    });
    
    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: currencyCode,
      paymentId: payment.id,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { slug } = params;
    const { paymentId, razorpayPaymentId, razorpaySignature } = await request.json();
    
    // Verify payment signature
    const body = paymentId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");
    
    if (razorpaySignature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
    
    // Get payment and template details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { template: true }
    });
    
    if (!payment || !payment.template) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }
    
    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'completed',
        updatedAt: new Date()
      }
    });
    
    // Create purchased template record
    await prisma.purchasedTemplate.create({
      data: {
        userId: session.user.id,
        templateId: payment.template.id
      }
    });
    
    // Create seller earning record (for system templates, earnings go to platform)
    await prisma.sellerEarning.create({
      data: {
        sellerId: 'system', // System templates
        templateId: payment.template.id,
        paymentId: payment.id,
        grossAmount: payment.amount,
        commissionRate: 0.3, // Platform keeps 30%
        commissionAmount: payment.amount * 0.3,
        netAmount: payment.amount * 0.7
      }
    });
    
    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'template_purchase',
        message: `Congratulations! You've successfully purchased the ${payment.template.name} template. You can now download it from your dashboard.`
      }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Template purchased successfully!'
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
