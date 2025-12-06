// Simple script to get Razorpay Account ID in TEST mode
// Instructions: Replace YOUR_TEST_KEY_ID and YOUR_TEST_KEY_SECRET with your actual test credentials

const KEY_ID = 'YOUR_TEST_KEY_ID'; // Your test Key ID (starts with rzp_test_)
const KEY_SECRET = 'YOUR_TEST_KEY_SECRET'; // Your test Key Secret

async function getAccountId() {
  try {
    console.log('🔍 Fetching Razorpay Account ID from TEST mode...');
    console.log('📝 Make sure you\'re using TEST credentials!');
    
    // Create base64 encoded credentials
    const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');
    
    // Try to fetch account info
    const response = await fetch('https://api.razorpay.com/v1/account', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const accountData = await response.json();
      console.log('✅ Account ID found:', accountData.id);
      console.log('📋 Account Details:', {
        id: accountData.id,
        name: accountData.name,
        email: accountData.email
      });
      return accountData.id;
    } else {
      const errorData = await response.text();
      console.log('❌ API Error:', response.status, errorData);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Alternative methods:');
    console.log('1. Go to Razorpay Dashboard (TEST mode)');
    console.log('2. Settings → Account & Settings → Account Details');
    console.log('3. Or check any test transaction for Account ID');
  }
}

// Instructions for user
console.log('🚀 Razorpay Test Account ID Fetcher');
console.log('=====================================');
console.log('1. Replace YOUR_TEST_KEY_ID with your test Key ID (rzp_test_...)');
console.log('2. Replace YOUR_TEST_KEY_SECRET with your test Key Secret');
console.log('3. Run: node scripts/get-test-account-id.js');
console.log('');

// Check if credentials are still placeholder
if (KEY_ID === 'YOUR_TEST_KEY_ID' || KEY_SECRET === 'YOUR_TEST_KEY_SECRET') {
  console.log('⚠️  Please update the credentials in this file first!');
  console.log('📝 Edit scripts/get-test-account-id.js and add your actual test credentials');
} else {
  getAccountId();
}
