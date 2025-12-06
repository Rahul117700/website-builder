// Simple text-based Razorpay Account ID fetcher
// Replace with your actual credentials
const KEY_ID = 'YOUR_KEY_ID_HERE';
const KEY_SECRET = 'YOUR_KEY_SECRET_HERE';

// Create base64 encoded credentials for API calls
const credentials = Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64');

async function getAccountId() {
  try {
    console.log('🔍 Fetching Razorpay Account ID...');
    
    // Method 1: Try to get account details
    try {
      const account = await razorpay.accounts.fetch();
      console.log('✅ Account ID found:', account.id);
      return account.id;
    } catch (error) {
      console.log('❌ Account API not available:', error.message);
    }
    
    // Method 2: Check from orders
    try {
      const orders = await razorpay.orders.all({ count: 1 });
      if (orders.items && orders.items.length > 0) {
        const order = orders.items[0];
        console.log('✅ Account ID from order:', order.account_id);
        return order.account_id;
      }
    } catch (error) {
      console.log('❌ Orders API error:', error.message);
    }
    
    // Method 3: Check from payments
    try {
      const payments = await razorpay.payments.all({ count: 1 });
      if (payments.items && payments.items.length > 0) {
        const payment = payments.items[0];
        console.log('✅ Account ID from payment:', payment.account_id);
        return payment.account_id;
      }
    } catch (error) {
      console.log('❌ Payments API error:', error.message);
    }
    
    console.log('❌ Could not find Account ID through API methods');
    console.log('💡 Please check your Razorpay Dashboard manually');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the script
getAccountId();
