// test-payment-endpoint.js
// Run this to test payment success endpoint locally

const http = require('http');

// Test the payment success endpoint
function testPaymentSuccess(txnid) {
  const data = JSON.stringify({
    txnid: txnid || 'TEST_TXN_' + Date.now()
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/payment/success',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  console.log('\n🧪 Testing Payment Success Endpoint');
  console.log('URL: http://localhost:5000/api/payment/success');
  console.log('Sending:', data);

  const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
      responseData += chunk;
    });

    res.on('end', () => {
      console.log('\n✅ Response Status:', res.statusCode);
      console.log('Response Headers:', res.headers);
      console.log('Response Body:');
      try {
        const parsed = JSON.parse(responseData);
        console.log(JSON.stringify(parsed, null, 2));
        
        if (parsed.success) {
          console.log('\n✅ SUCCESS! Endpoint working correctly');
        } else {
          console.log('\n❌ Failed:', parsed.message);
        }
      } catch (e) {
        console.log(responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.log('\nMake sure backend is running:');
    console.log('  npm start (in backend folder)');
    console.log('  OR');
    console.log('  node server.js');
  });

  req.write(data);
  req.end();
}

// Usage
const txnid = process.argv[2] || null;
testPaymentSuccess(txnid);
