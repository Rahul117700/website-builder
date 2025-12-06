import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { createNotification } from '@/lib/notificationService';
import { sendOrderConfirmationEmail, sendSaleNotificationEmail } from '@/lib/email';
import { triggerWebhook } from '@/app/api/webhooks/route';

// POST /api/payment/verify - Verify Razorpay payment signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      funnelId,
      customerEmail,
      amount
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ 
        error: 'Missing payment verification fields' 
      }, { status: 400 });
    }

    if (!funnelId || !customerEmail || !amount) {
      return NextResponse.json({ 
        error: 'Missing order details' 
      }, { status: 400 });
    }

    // Get the funnel and user's Razorpay config
    const funnel = await prisma.funnel.findUnique({
      where: { id: funnelId },
      include: {
        user: {
          include: {
            razorpayConfigs: {
              where: {
                isActive: true
              },
              take: 1
            }
          }
        },
        product: true
      }
    });

    if (!funnel) {
      return NextResponse.json({ error: 'Funnel not found' }, { status: 404 });
    }

    const razorpayConfig = funnel.user.razorpayConfigs[0];
    
    if (!razorpayConfig) {
      return NextResponse.json({ 
        error: 'Payment configuration not found' 
      }, { status: 400 });
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ 
        error: 'Invalid payment signature. Payment verification failed.' 
      }, { status: 400 });
    }

    // Payment is verified - Create order in database
    const order = await prisma.funnelOrder.create({
      data: {
        funnelId: funnelId,
        customerEmail: customerEmail,
        amount: amount,
        currency: 'INR',
        status: 'COMPLETED',
        paymentId: razorpay_payment_id,
        paymentMethod: 'RAZORPAY',
        metadata: {
          orderId: razorpay_order_id,
          funnelName: funnel.name,
          productName: funnel.product?.name,
          productType: funnel.product?.type
        }
      }
    });

    // Update funnel metrics
    const completedOrders = await prisma.funnelOrder.findMany({
      where: {
        funnelId: funnelId,
        status: 'COMPLETED'
      }
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.amount, 0);
    const conversions = completedOrders.length;

    await prisma.funnel.update({
      where: { id: funnelId },
      data: {
        revenue: totalRevenue,
        conversions: conversions
      }
    });

    // Update product metrics if exists
    if (funnel.product) {
      await prisma.digitalProduct.update({
        where: { id: funnel.product.id },
        data: {
          sales: { increment: 1 },
          revenue: { increment: amount }
        }
      });
    }

    // Track conversion analytics
    await prisma.funnelAnalytics.create({
      data: {
        funnelId: funnelId,
        event: 'conversion',
        metadata: {
          orderId: order.id,
          amount: amount,
          paymentId: razorpay_payment_id
        }
      }
    });

    // Create notification for the seller
    try {
      await createNotification({
        userId: funnel.userId,
        title: '🎉 New Sale!',
        message: `You made a sale! ${customerEmail} purchased ${funnel.product?.name || 'your product'} for ₹${amount}`,
        type: 'SUCCESS',
        category: 'PAYMENT',
        metadata: {
          orderId: order.id,
          funnelId: funnelId,
          funnelName: funnel.name,
          productName: funnel.product?.name,
          productType: funnel.product?.type,
          amount: amount,
          currency: 'INR',
          customerEmail: customerEmail,
          paymentId: razorpay_payment_id,
          timestamp: new Date().toISOString()
        }
      });
    } catch (notificationError) {
      // Log error but don't fail the payment
      console.error('Failed to create notification:', notificationError);
    }

    // Send emails (non-blocking)
    Promise.all([
      // Send order confirmation to customer
      sendOrderConfirmationEmail(customerEmail, {
        orderId: order.id,
        productName: funnel.product?.name || 'Product',
        amount: amount,
        currency: 'INR',
        downloadUrl: `/download/${order.id}`,
        funnelName: funnel.name,
      }),
      // Send sale notification to seller
      sendSaleNotificationEmail(funnel.user.email || '', {
        orderId: order.id,
        productName: funnel.product?.name || 'Product',
        customerEmail: customerEmail,
        amount: amount,
        currency: 'INR',
        funnelName: funnel.name,
      }),
    ]).catch((emailError) => {
      // Log but don't fail payment
      console.error('Failed to send emails:', emailError);
    });

    // Trigger webhook (non-blocking)
    triggerWebhook('order.completed', {
      orderId: order.id,
      funnelId: funnelId,
      productName: funnel.product?.name,
      amount: amount,
      currency: 'INR',
      customerEmail: customerEmail,
    }, funnel.userId).catch((webhookError) => {
      console.error('Failed to trigger webhook:', webhookError);
    });

    return NextResponse.json({ 
      success: true,
      message: 'Payment verified successfully',
      order: {
        id: order.id,
        amount: order.amount,
        status: order.status
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      error: 'Failed to verify payment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
