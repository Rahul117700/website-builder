const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔌 Testing database connection...');
    console.log('📍 Database URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@') || 'Not set');
    console.log('');
    
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');
    
    // Test basic queries
    console.log('📊 Running test queries...');
    
    const userCount = await prisma.user.count();
    console.log(`   Users: ${userCount}`);
    
    const funnelCount = await prisma.funnel.count();
    console.log(`   Funnels: ${funnelCount}`);
    
    const templateCount = await prisma.funnelTemplate.count();
    console.log(`   Funnel Templates: ${templateCount}`);
    
    const productCount = await prisma.digitalProduct.count();
    console.log(`   Digital Products: ${productCount}`);
    
    console.log('\n✅ All tests passed! Database is ready.');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: node scripts/setup-test-data.js');
    console.log('   2. Run: npm run dev');
    console.log('   3. Visit: http://localhost:3000/auth/dashboard/funnels');
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\n💡 Solutions:');
    console.error('   1. Check if PostgreSQL is running');
    console.error('   2. Verify DATABASE_URL in .env file');
    console.error('   3. Run: npx prisma db push (if schema not synced)');
    console.error('   4. See DATABASE_CONNECTION_FIX.md for detailed help');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();


