import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's channels with subscriptions, products, and purchases (for all stats)
    // Include ALL subscribers (not just ACTIVE) to calculate total revenue correctly
    const channels = await prisma.channel.findMany({
      where: { userId: user.id },
      include: {
        subscribers: {
          // Include all subscribers to calculate total revenue
          // We'll filter by status when needed
        },
        products: {
          include: {
            purchases: {
              where: {
                status: 'COMPLETED',
              },
            },
          },
        },
      },
    });

    // Calculate overall stats from CHANNELS ONLY
    console.log(`[Dashboard Analytics] Processing ${channels.length} channels for user ${user.id}`);
    let totalVisitors = 0;
    let totalConversions = 0;
    let totalRevenue = 0; // CHANNEL SUBSCRIPTIONS ONLY
    let totalChannels = channels.length;
    let publishedChannels = 0;
    let totalSubscribers = 0; // Total active subscriptions across all channels

    channels.forEach(channel => {
      // Sum all product views
      const channelViews = channel.products.reduce((sum, product) => sum + (product.viewCount || 0), 0);
      totalVisitors += channelViews;

      // Sum all product purchases (conversions)
      const channelPurchases = channel.products.reduce((sum, product) => sum + product.purchases.length, 0);
      totalConversions += channelPurchases;

      // Count active subscribers for this channel
      const activeSubscribers = channel.subscribers.filter(s => 
        s.status === 'ACTIVE' && new Date(s.endDate) > new Date()
      ).length;
      totalSubscribers += activeSubscribers;

      // Count published channels
      if (channel.published) publishedChannels++;
    });

    // Calculate revenue from CHANNEL SUBSCRIPTIONS ONLY
    channels.forEach(channel => {
      channel.subscribers.forEach(subscription => {
        // Only count active subscriptions that haven't expired
        if (subscription.status === 'ACTIVE' && new Date(subscription.endDate) > new Date()) {
          // Get subscription amount - try multiple ways to extract the value
          let subAmount = 0;
          
          if (subscription.amount !== null && subscription.amount !== undefined) {
            if (typeof subscription.amount === 'object' && 'toNumber' in subscription.amount) {
              // Prisma Decimal type
              subAmount = Number(subscription.amount.toNumber());
            } else if (typeof subscription.amount === 'string') {
              subAmount = parseFloat(subscription.amount) || 0;
            } else {
              subAmount = Number(subscription.amount) || 0;
            }
          } else {
            // If amount is null, try to get it from channel subscription price
            // Note: channel is already in scope from the outer forEach loop
            if (channel.subscriptionPrice !== null && channel.subscriptionPrice !== undefined) {
              const channelPrice = typeof channel.subscriptionPrice === 'object' && channel.subscriptionPrice !== null && 'toNumber' in channel.subscriptionPrice
                ? Number(channel.subscriptionPrice.toNumber())
                : typeof channel.subscriptionPrice === 'string'
                ? parseFloat(channel.subscriptionPrice)
                : Number(channel.subscriptionPrice || 0);
              subAmount = channelPrice;
            }
          }
          
          totalRevenue += subAmount;
          console.log(`[Dashboard Analytics] Adding subscription revenue: ${subAmount} from channel ${channel.name} (subscription ${subscription.id}), total now: ${totalRevenue}`);
        } else {
          console.log(`[Dashboard Analytics] Skipping subscription ${subscription.id}: status=${subscription.status}, endDate=${subscription.endDate}, isExpired=${new Date(subscription.endDate) <= new Date()}`);
        }
      });
    });

    console.log(`[Dashboard Analytics] Total revenue from subscriptions: ${totalRevenue}, Total subscriptions: ${channels.reduce((sum, ch) => sum + ch.subscribers.length, 0)}`);

    const conversionRate = totalVisitors > 0 ? (totalConversions / totalVisitors) * 100 : 0;

    // Generate 7-day revenue chart data - CHANNEL SUBSCRIPTIONS ONLY
    // Get all subscriptions for all channels to calculate daily revenue and orders
    const allSubscriptions = await prisma.channelSubscription.findMany({
      where: {
        channel: { userId: user.id },
      },
      select: {
        createdAt: true,
        amount: true,
        status: true,
        channelId: true,
      },
    });

    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get revenue and orders for this day from channel subscriptions
      let dayRevenue = 0;
      let dayOrders = 0;
      
      allSubscriptions.forEach(subscription => {
        const subscriptionDate = subscription.createdAt.toISOString().split('T')[0];
        if (subscriptionDate === dateStr) {
          // Count as an order (new subscription)
          dayOrders++;
          
          // Calculate revenue for this subscription
          let subAmount = 0;
          if (subscription.amount !== null && subscription.amount !== undefined) {
            if (typeof subscription.amount === 'object' && 'toNumber' in subscription.amount) {
              subAmount = Number(subscription.amount.toNumber());
            } else if (typeof subscription.amount === 'string') {
              subAmount = parseFloat(subscription.amount) || 0;
            } else {
              subAmount = Number(subscription.amount) || 0;
            }
          } else {
            // If amount is null, get it from channel subscription price
            const channel = channels.find(c => c.id === subscription.channelId);
            if (channel && channel.subscriptionPrice !== null && channel.subscriptionPrice !== undefined) {
              const channelPrice = typeof channel.subscriptionPrice === 'object' && channel.subscriptionPrice !== null && 'toNumber' in channel.subscriptionPrice
                ? Number(channel.subscriptionPrice.toNumber())
                : typeof channel.subscriptionPrice === 'string'
                ? parseFloat(channel.subscriptionPrice)
                : Number(channel.subscriptionPrice || 0);
              subAmount = channelPrice;
            }
          }
          
          dayRevenue += subAmount;
        }
      });

      last7Days.push({
        date: dateStr,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders // Count of new subscriptions (orders) per day
      });
    }

    console.log(`[Dashboard Analytics] 7-day chart data:`, last7Days);

    // Get top performing channels (by subscription revenue, or by views if no revenue)
    const topChannels = channels
      .map(channel => {
        // Calculate subscription revenue for this channel
        // Include revenue from ALL subscriptions (not just ACTIVE) to show total revenue
        let channelRevenue = 0;
        channel.subscribers.forEach(subscription => {
          // Calculate revenue from all subscriptions
          // Include all active subscriptions that haven't expired
          const isActive = subscription.status === 'ACTIVE' && new Date(subscription.endDate) > new Date();
          
          if (isActive) {
            let subAmount = 0;
            if (subscription.amount !== null && subscription.amount !== undefined) {
              if (typeof subscription.amount === 'object' && subscription.amount !== null && 'toNumber' in subscription.amount) {
                subAmount = Number(subscription.amount.toNumber());
              } else if (typeof subscription.amount === 'string') {
                subAmount = parseFloat(subscription.amount) || 0;
              } else {
                subAmount = Number(subscription.amount) || 0;
              }
            } else {
              // If amount is null, try to get it from channel subscription price
              // Note: channel is already in scope from the outer forEach loop
              if (channel.subscriptionPrice !== null && channel.subscriptionPrice !== undefined) {
                const channelPrice = typeof channel.subscriptionPrice === 'object' && channel.subscriptionPrice !== null && 'toNumber' in channel.subscriptionPrice
                  ? Number(channel.subscriptionPrice.toNumber())
                  : typeof channel.subscriptionPrice === 'string'
                  ? parseFloat(channel.subscriptionPrice)
                  : Number(channel.subscriptionPrice || 0);
                subAmount = channelPrice;
              }
            }
            channelRevenue += subAmount;
          }
        });

        // Get channel views from products
        const channelProducts = channel.products || [];
        const visitors = channelProducts.reduce((sum, product) => sum + (product.viewCount || 0), 0);
        const conversions = channel.subscribers.filter(s => s.status === 'ACTIVE' && new Date(s.endDate) > new Date()).length;
        const conversionRate = visitors > 0 ? (conversions / visitors) * 100 : 0;

        return {
          id: channel.id,
          name: channel.name,
          visitors,
          conversions,
          revenue: channelRevenue,
          conversionRate: Math.round(conversionRate * 10) / 10,
          status: channel.status,
          published: channel.published
        };
      })
      .sort((a, b) => {
        // Sort by revenue first, then by visitors if revenue is the same
        if (b.revenue !== a.revenue) {
          return b.revenue - a.revenue;
        }
        return b.visitors - a.visitors;
      })
      .slice(0, 5);
    
    console.log(`[Dashboard Analytics] Found ${channels.length} total channels, ${topChannels.length} top channels`);
    console.log(`[Dashboard Analytics] Top channels:`, topChannels.map(c => ({ 
      name: c.name, 
      revenue: c.revenue, 
      visitors: c.visitors,
      subscribers: channels.find(ch => ch.id === c.id)?.subscribers.length || 0
    })));
    
    // Debug: Log each channel's revenue calculation
    channels.forEach(channel => {
      const channelProducts = channel.products || [];
      const visitors = channelProducts.reduce((sum, product) => sum + (product.viewCount || 0), 0);
      let debugRevenue = 0;
      channel.subscribers.forEach(sub => {
        const subAmount = typeof sub.amount === 'object' && sub.amount !== null && 'toNumber' in sub.amount
          ? Number(sub.amount.toNumber())
          : typeof sub.amount === 'string'
          ? parseFloat(sub.amount)
          : Number(sub.amount || 0);
        debugRevenue += subAmount;
      });
      console.log(`[Dashboard Analytics] Channel "${channel.name}": ${channel.subscribers.length} subscribers, revenue: ${debugRevenue}, visitors: ${visitors}`);
    });
    
    // Ensure we always return at least one channel if channels exist
    if (topChannels.length === 0 && channels.length > 0) {
      // If no channels in topChannels but channels exist, add the first channel
      const firstChannel = channels[0];
      const channelProducts = firstChannel.products || [];
      const visitors = channelProducts.reduce((sum, product) => sum + (product.viewCount || 0), 0);
      topChannels.push({
        id: firstChannel.id,
        name: firstChannel.name,
        visitors,
        conversions: firstChannel.subscribers.length,
        revenue: 0,
        conversionRate: 0,
        status: firstChannel.status,
        published: firstChannel.published
      });
      console.log(`[Dashboard Analytics] Added first channel to topChannels:`, firstChannel.name);
    }

    // Get recent activity from channels and products
    const recentActivity: any[] = [];

    // Get recent channel creations
    const recentChannels = await prisma.channel.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    recentChannels.forEach(channel => {
      recentActivity.push({
        id: `channel_${channel.id}`,
        type: 'channel_created',
        title: `Created ${channel.name}`,
        description: 'New channel created',
        timestamp: channel.createdAt.toISOString(),
        icon: 'plus',
      });
    });

    // Get recent product views - show products with views in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    // Get all products with views
    const allProductsWithViews = await prisma.channelProduct.findMany({
      where: {
        channel: { userId: user.id },
        viewCount: { gt: 0 },
      },
      include: {
        channel: {
          select: { name: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    console.log(`[Dashboard Analytics] Found ${allProductsWithViews.length} total products with views for user ${user.id}`);

    // Filter to only show products updated in last 7 days (recent views)
    const recentProducts = allProductsWithViews.filter(product => {
      const viewTime = new Date(product.updatedAt);
      const daysSinceView = (new Date().getTime() - viewTime.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceView <= 7;
    });

    console.log(`[Dashboard Analytics] Found ${recentProducts.length} products with views in last 7 days`);

    // Add each recent product view as an activity entry
    recentProducts.slice(0, 20).forEach(product => {
      recentActivity.push({
        id: `product_view_${product.id}_${new Date(product.updatedAt).getTime()}`,
        type: 'product_view',
        title: `New view on ${product.title || 'Product'}`,
        description: 'Someone viewed your product',
        timestamp: product.updatedAt.toISOString(),
        icon: 'eye',
      });
    });

    // Get recent purchases
    const recentPurchases = await prisma.productPurchase.findMany({
      where: {
        product: {
          channel: { userId: user.id },
        },
        status: 'COMPLETED',
      },
      include: {
        product: {
          include: {
            channel: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Get more subscriptions for better activity feed
    });

    recentPurchases.forEach(purchase => {
      recentActivity.push({
        id: `purchase_${purchase.id}`,
        type: 'order_completed',
        title: `Purchase on ${purchase.product.title || 'Product'}`,
        description: 'New order completed',
        timestamp: purchase.createdAt.toISOString(),
        icon: 'dollar',
      });
    });

    // Get recent channel subscriptions - Get ALL subscriptions (not just ACTIVE) for recent activity
    const recentSubscriptions = await prisma.channelSubscription.findMany({
      where: {
        channel: { userId: user.id },
      },
      include: {
        channel: {
          select: { name: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Get more subscriptions for better activity feed
    });

    console.log(`[Dashboard Analytics] Found ${recentSubscriptions.length} recent subscriptions for user ${user.id}`);

    recentSubscriptions.forEach(subscription => {
      // Get subscription amount for display
      let subAmount = 0;
      if (subscription.amount !== null && subscription.amount !== undefined) {
        if (typeof subscription.amount === 'object' && 'toNumber' in subscription.amount) {
          subAmount = Number(subscription.amount.toNumber());
        } else if (typeof subscription.amount === 'string') {
          subAmount = parseFloat(subscription.amount) || 0;
        } else {
          subAmount = Number(subscription.amount) || 0;
        }
      }
      
      const subscriberName = subscription.user.name || subscription.user.email || 'Anonymous';
      const amountText = subAmount > 0 ? ` for ₹${subAmount}` : '';
      
      recentActivity.push({
        id: `subscription_${subscription.id}`,
        type: 'order_completed',
        title: `🎉 New Subscription!`,
        description: `${subscriberName} subscribed to "${subscription.channel.name}"${amountText}`,
        timestamp: subscription.createdAt.toISOString(),
        icon: 'dollar',
      });
    });

    // Sort by timestamp (newest first) and prioritize subscriptions
    recentActivity.sort((a, b) => {
      // Prioritize subscription activities
      const aIsSubscription = a.id?.startsWith('subscription_');
      const bIsSubscription = b.id?.startsWith('subscription_');
      
      if (aIsSubscription && !bIsSubscription) return -1;
      if (!aIsSubscription && bIsSubscription) return 1;
      
      // Then sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
    
    // Take latest 20 activities to show more subscription history
    const topRecentActivity = recentActivity.slice(0, 20);
    
    console.log(`[Dashboard Analytics] Recent activity summary:`, {
      total: recentActivity.length,
      subscriptions: recentActivity.filter(a => a.id?.startsWith('subscription_')).length,
      purchases: recentActivity.filter(a => a.id?.startsWith('purchase_')).length,
      productViews: recentActivity.filter(a => a.id?.startsWith('product_view_')).length,
      channels: recentActivity.filter(a => a.id?.startsWith('channel_')).length,
      returning: topRecentActivity.length
    });

    // Calculate growth rates
    const previous7Days = last7Days.slice(0, 3).reduce((sum, day) => sum + day.revenue, 0);
    const current7Days = last7Days.slice(-3).reduce((sum, day) => sum + day.revenue, 0);
    const revenueGrowth = previous7Days > 0 ? ((current7Days - previous7Days) / previous7Days) * 100 : 0;

    const response = {
      overview: {
        totalChannels,
        publishedChannels,
        totalRevenue: Math.round(totalRevenue),
        totalVisitors,
        totalConversions,
        totalSubscribers, // Add total subscribers count
        conversionRate: Math.round(conversionRate * 10) / 10,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10
      },
      chartData: {
        revenue7Days: last7Days,
        topChannels: topChannels
      },
      recentActivity: topRecentActivity
    };

    console.log(`[Dashboard Analytics] Returning channel analytics:`, {
      totalChannels: response.overview.totalChannels,
      totalVisitors: response.overview.totalVisitors,
      totalConversions: response.overview.totalConversions,
      totalRevenue: response.overview.totalRevenue,
      topChannelsCount: response.chartData.topChannels.length,
      recentActivityCount: response.recentActivity.length
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
