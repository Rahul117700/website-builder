const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupPlatformRazorpay() {
  try {
    console.log('Setting up platform Razorpay configuration...');

    // Check if platform config already exists
    const existingConfig = await prisma.platformRazorpayConfig.findFirst({
      where: { isActive: true }
    });

    if (existingConfig) {
      console.log('Platform Razorpay config already exists, updating...');
      
      await prisma.platformRazorpayConfig.update({
        where: { id: existingConfig.id },
        data: {
          keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_CVUkKFwRrXn78s",
          keySecret: process.env.RAZORPAY_KEY_SECRET || "1Mr2sIJ2LW6FLty5RPEdLKTR",
          accountId: process.env.RAZORPAY_ACCOUNT_ID || "test_account",
          webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret",
          environment: process.env.NODE_ENV === "production" ? "live" : "test",
          isActive: true
        }
      });
    } else {
      console.log('Creating new platform Razorpay config...');
      
      await prisma.platformRazorpayConfig.create({
        data: {
          keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_CVUkKFwRrXn78s",
          keySecret: process.env.RAZORPAY_KEY_SECRET || "1Mr2sIJ2LW6FLty5RPEdLKTR",
          accountId: process.env.RAZORPAY_ACCOUNT_ID || "test_account",
          webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "test_webhook_secret",
          environment: process.env.NODE_ENV === "production" ? "live" : "test",
          isActive: true
        }
      });
    }

    console.log('✅ Platform Razorpay configuration setup completed successfully!');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID || "rzp_test_CVUkKFwRrXn78s");
    console.log('Environment:', process.env.NODE_ENV === "production" ? "live" : "test");

  } catch (error) {
    console.error('❌ Error setting up platform Razorpay configuration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupPlatformRazorpay();
