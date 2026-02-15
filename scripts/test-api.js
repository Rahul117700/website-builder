const fetch = require('node-fetch');

async function testAPI() {
    try {
        console.log('🧪 Testing User Behavior API...\n');

        const response = await fetch('http://localhost:3000/api/admin/user-behavior?timeRange=7d');

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        const data = await response.json();

        if (response.ok) {
            console.log('\n✅ API Response:');
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.log('\n❌ API Error:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('❌ Fetch Error:', error.message);
    }
}

testAPI();
