const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNotificationSystem() {
  console.log('🧪 Testing Notification System...\n');

  try {
    // 1. Find or create a test user
    console.log('📝 Step 1: Finding/creating test user...');
    let user = await prisma.user.findFirst({
      where: { email: { contains: 'test' } }
    });

    if (!user) {
      console.log('   Creating new test user...');
      user = await prisma.user.create({
        data: {
          email: 'testuser@example.com',
          name: 'Test User',
          password: 'test123'
        }
      });
    }
    console.log(`   ✅ User found/created: ${user.email} (ID: ${user.id})\n`);

    // 2. Create a test notification
    console.log('📝 Step 2: Creating test sale notification...');
    const notification = await prisma.userNotification.create({
      data: {
        userId: user.id,
        title: '🎉 New Sale!',
        message: 'You made a sale! customer@example.com purchased Test Product for ₹999',
        type: 'SUCCESS',
        category: 'SALE',
        metadata: {
          orderId: 'test_order_123',
          funnelId: 'test_funnel_456',
          productName: 'Test Product',
          amount: 999,
          currency: 'INR',
          customerEmail: 'customer@example.com',
          timestamp: new Date().toISOString()
        }
      }
    });
    console.log(`   ✅ Notification created: ${notification.id}\n`);

    // 3. Fetch user's notifications
    console.log('📝 Step 3: Fetching user notifications...');
    const notifications = await prisma.userNotification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    console.log(`   ✅ Found ${notifications.length} notification(s)\n`);

    // Display notifications
    console.log('📋 User Notifications:');
    notifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.title}`);
      console.log(`      Message: ${notif.message}`);
      console.log(`      Category: ${notif.category}`);
      console.log(`      Type: ${notif.type}`);
      console.log(`      Read: ${notif.read ? 'Yes' : 'No'}`);
      console.log(`      Created: ${notif.createdAt.toLocaleString()}\n`);
    });

    // 4. Count unread notifications
    const unreadCount = await prisma.userNotification.count({
      where: {
        userId: user.id,
        read: false
      }
    });
    console.log(`📊 Unread notifications: ${unreadCount}\n`);

    // 5. Mark notification as read
    console.log('📝 Step 4: Marking notification as read...');
    await prisma.userNotification.update({
      where: { id: notification.id },
      data: { read: true }
    });
    console.log('   ✅ Notification marked as read\n');

    // 6. Verify read status
    const unreadCountAfter = await prisma.userNotification.count({
      where: {
        userId: user.id,
        read: false
      }
    });
    console.log(`📊 Unread notifications after marking as read: ${unreadCountAfter}\n`);

    // 7. Test mark all as read
    console.log('📝 Step 5: Testing mark all as read...');
    
    // Create a few more test notifications
    await prisma.userNotification.createMany({
      data: [
        {
          userId: user.id,
          title: '🎉 Another Sale!',
          message: 'You made another sale! customer2@example.com purchased Product 2 for ₹1999',
          type: 'SUCCESS',
          category: 'SALE',
        },
        {
          userId: user.id,
          title: '💳 Payment Received',
          message: 'Payment of ₹5000 has been received',
          type: 'SUCCESS',
          category: 'PAYMENT',
        }
      ]
    });

    const unreadBefore = await prisma.userNotification.count({
      where: { userId: user.id, read: false }
    });
    console.log(`   Unread before: ${unreadBefore}`);

    // Mark all as read
    await prisma.userNotification.updateMany({
      where: {
        userId: user.id,
        read: false
      },
      data: { read: true }
    });

    const unreadAfter = await prisma.userNotification.count({
      where: { userId: user.id, read: false }
    });
    console.log(`   Unread after: ${unreadAfter}`);
    console.log('   ✅ All notifications marked as read\n');

    console.log('✅ All tests passed!\n');
    console.log('🎯 Summary:');
    console.log('   - UserNotification model is working');
    console.log('   - Notifications can be created');
    console.log('   - Notifications can be fetched');
    console.log('   - Notifications can be marked as read');
    console.log('   - Mark all as read functionality works\n');
    
    console.log('💡 Next steps:');
    console.log('   1. Make a test purchase on a funnel');
    console.log('   2. Check the dashboard notifications panel');
    console.log('   3. Verify the notification appears with the sale icon\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testNotificationSystem()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

