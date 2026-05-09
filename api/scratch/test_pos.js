// Native fetch is available in Node 18+
const BASE_URL = 'http://127.0.0.1:8787';
const AUTH_HEADER = { 'Authorization': 'Bearer DEV_TOKEN' };

async function runTest() {
  console.log('--- STARTING ENHANCED POS SYSTEM TEST ---');

  try {
    // 1. Seed the system
    console.log('1. Seeding test data...');
    const seedRes = await fetch(`${BASE_URL}/api/setup/seed`, { method: 'POST', headers: AUTH_HEADER });
    const seedData = await seedRes.json();
    console.log('Seed Result:', seedData.success ? 'SUCCESS' : 'FAILED');

    // 2. Fetch required IDs
    console.log('\n2. Fetching IDs for transaction...');
    
    const stockRes = await fetch(`${BASE_URL}/api/inventory/stocks`, { headers: AUTH_HEADER });
    const stocks = await stockRes.json();
    const stock = stocks.data[0];

    const locRes = await fetch(`${BASE_URL}/api/setup/locations`, { headers: AUTH_HEADER });
    const locs = await locRes.json();
    const location = locs.data[0];

    const cusRes = await fetch(`${BASE_URL}/api/contacts/customers`, { headers: AUTH_HEADER });
    const cuss = await cusRes.json();
    const customer = cuss.data[0];

    console.log(`Stock: ${stock.name} (${stock.id})`);
    console.log(`Location: ${location.name} (${location.id})`);
    console.log(`Customer: ${customer.name} (${customer.id})`);

    // 3. Try Checkout with VALID IDs
    console.log('\n3. Simulating Valid Checkout...');
    const checkoutRes = await fetch(`${BASE_URL}/api/sales/checkout`, {
        method: 'POST',
        headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            locationId: location.id,
            customerId: customer.id,
            items: [{ 
                stockId: stock.id, 
                locationId: location.id,
                quantity: 2, 
                unitPrice: 20000,
                subTotal: 40000
            }],
            totalAmount: 40000,
            payableAmount: 40000,
            paidAmount: 40000,
            paymentStatus: 'Paid'
        })
    });
    const checkoutData = await checkoutRes.json();
    console.log('Checkout Result:', checkoutData.success ? 'SUCCESS' : 'FAILED');
    if (!checkoutData.success) console.log('Error:', checkoutData.error);

    // 4. Check Inventory Balance (Should be 48 now, started at 50)
    console.log('\n4. Checking Stock Balance...');
    const invRes = await fetch(`${BASE_URL}/api/inventory/stocks`, { headers: AUTH_HEADER });
    const invData = await invRes.json();
    // In our simplified API, we might need a specific balance endpoint, 
    // but let's check if we can see it in stocks or audit logs.
    
    // 5. Check Transaction Logs
    console.log('\n5. Verifying Audit Trail...');
    const auditRes = await fetch(`${BASE_URL}/api/audit/transactions`, { headers: AUTH_HEADER });
    const auditData = await auditRes.json();
    console.log('Latest Transaction:', auditData.data[0]?.transactionType, '| Change:', auditData.data[0]?.quantityChange);

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

runTest();
