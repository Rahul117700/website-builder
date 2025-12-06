import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Webhooks API
 * Free to implement - allows integration with Zapier, Make.com, and custom services
 * 
 * Events supported:
 * - order.completed
 * - funnel.published
 * - user.registered
 * - payment.verified
 */

interface WebhookEvent {
  event: string;
  data: any;
  timestamp: string;
  userId?: string;
}

/**
 * POST /api/webhooks - Trigger webhook for an event
 * This is called internally when events occur
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, data, userId } = body;

    if (!event || !data) {
      return NextResponse.json({ error: 'Missing event or data' }, { status: 400 });
    }

    // Get user's webhook URLs if userId provided
    // TODO: WebhookConfig model needs to be added to schema
    let webhookUrls: string[] = [];
    
    // Placeholder until WebhookConfig model is added
    // if (userId) {
    //   const user = await prisma.user.findUnique({
    //     where: { id: userId },
    //     include: {
    //       webhookConfigs: {
    //         where: { isActive: true },
    //       },
    //     },
    //   });

    //   if (user?.webhookConfigs) {
    //     webhookUrls = user.webhookConfigs
    //       .filter(config => config.events.includes(event))
    //       .map(config => config.url);
    //   }
    // }

    // Also get global webhooks (if you want platform-wide webhooks)
    // const globalWebhooks = await prisma.webhookConfig.findMany({
    //   where: {
    //     isActive: true,
    //     isGlobal: true,
    //     events: {
    //       array_contains: [event],
    //     },
    //   },
    // });

    // webhookUrls.push(...globalWebhooks.map(w => w.url));

    // Prepare webhook payload
    const payload: WebhookEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      userId: userId || undefined,
    };

    // Send webhooks to all configured URLs
    const results = await Promise.allSettled(
      webhookUrls.map(async (url) => {
        const signature = generateWebhookSignature(JSON.stringify(payload));
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed: ${response.statusText}`);
        }

        return { url, success: true };
      })
    );

    // Log webhook results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      webhooksSent: webhookUrls.length,
      successful,
      failed,
      results: results.map((r, i) => ({
        url: webhookUrls[i],
        status: r.status,
        ...(r.status === 'rejected' ? { error: r.reason?.message } : {}),
      })),
    });
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return NextResponse.json(
      { error: 'Failed to trigger webhook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Generate webhook signature for security
 */
function generateWebhookSignature(payload: string): string {
  const secret = process.env.WEBHOOK_SECRET || 'your-webhook-secret';
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Verify webhook signature (for receiving webhooks)
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = generateWebhookSignature(payload);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Helper function to trigger webhooks from anywhere in your app
 */
export async function triggerWebhook(event: string, data: any, userId?: string) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/webhooks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ event, data, userId }),
    });

    if (!response.ok) {
      console.error('Failed to trigger webhook:', await response.text());
    }

    return response.ok;
  } catch (error) {
    console.error('Error triggering webhook:', error);
    return false;
  }
}

