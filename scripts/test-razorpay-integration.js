const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRazorpayIntegration() {
  try {
    console.log('🧪 Testing Razorpay Integration...\n');

    // 1. Check Platform Razorpay Config
    console.log('1. Checking Platform Razorpay Configuration...');
    const platformConfig = await prisma.platformRazorpayConfig.findFirst({
      where: { isActive: true }
    });

    if (platformConfig) {
      console.log('✅ Platform Razorpay Config Found:');
      console.log(`   - Key ID: ${platformConfig.keyId}`);
      console.log(`   - Environment: ${platformConfig.environment}`);
      console.log(`   - Active: ${platformConfig.isActive}`);
    } else {
      console.log('❌ No Platform Razorpay Config Found');
      return;
    }

    // 2. Check Subscription Plans
    console.log('\n2. Checking Subscription Plans...');
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priority: 'asc' }
    });

    if (plans.length > 0) {
      console.log(`✅ Found ${plans.length} Active Subscription Plans:`);
      plans.forEach(plan => {
        console.log(`   - ${plan.name}: ₹${plan.price}/${plan.duration === 365 ? 'year' : `${plan.duration} days`}`);
      });
    } else {
      console.log('❌ No Subscription Plans Found');
      return;
    }

    // 3. Test Razorpay Package
    console.log('\n3. Testing Razorpay Package...');
    try {
      const Razorpay = require('razorpay');
      const razorpay = new Razorpay({
        key_id: platformConfig.keyId,
        key_secret: platformConfig.keySecret
      });
      console.log('✅ Razorpay package loaded successfully');
      console.log(`   - Using Key ID: ${platformConfig.keyId}`);
    } catch (error) {
      console.log('❌ Error loading Razorpay package:', error.message);
      return;
    }

    // 4. Check API Routes
    console.log('\n4. Checking API Routes...');
    const fs = require('fs');
    const path = require('path');
    
    const purchaseRoute = path.join(process.cwd(), 'src', 'app', 'api', 'user', 'subscriptions', 'purchase', 'route.ts');
    const verifyRoute = path.join(process.cwd(), 'src', 'app', 'api', 'user', 'subscriptions', 'verify', 'route.ts');
    
    if (fs.existsSync(purchaseRoute)) {
      console.log('✅ Purchase API route exists');
    } else {
      console.log('❌ Purchase API route missing');
    }
    
    if (fs.existsSync(verifyRoute)) {
      console.log('✅ Verify API route exists');
    } else {
      console.log('❌ Verify API route missing');
    }

    console.log('\n🎉 Razorpay Integration Test Complete!');
    console.log('\nNext Steps:');
    console.log('1. Make sure your .env.local file has the correct Razorpay credentials');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Navigate to /auth/dashboard/plans to test the payment flow');
    console.log('4. Use Razorpay test credentials for testing payments');

  } catch (error) {
    console.error('❌ Error testing Razorpay integration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testRazorpayIntegration();
