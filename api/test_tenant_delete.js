const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c3Jfc3VwZXJhZG1pbiIsImVtYWlsIjoiYWRtaW5Aa2F1bmd0aGFudC5zaG9wIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzc4MzEzMjIxLCJleHAiOjE3NzgzOTk2MjF9.PLEZuPT5pa7BkIOKxifoZ6EhaMBW_xWmB-3YrdATt0M';

async function testTenantDelete() {
  try {
    // 1. Create a temp tenant to delete
    const createRes = await fetch('https://kaung-thant-pos-api-production.kaungthant.workers.dev/api/master/tenants', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Temp Tenant to Delete',
        subdomain: `temp-${Date.now()}`,
        planId: 'basic'
      })
    });
    const createData = await createRes.json();
    const tenantId = createData.data.id;
    console.log(`Created temp tenant: ${tenantId}`);

    // 2. Delete it
    const deleteRes = await fetch(`https://kaung-thant-pos-api-production.kaungthant.workers.dev/api/master/tenants/${tenantId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log("Delete Result:", await deleteRes.json());

    // 3. Verify if gone
    const verifyRes = await fetch('https://kaung-thant-pos-api-production.kaungthant.workers.dev/api/master/tenants', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    const deletedExists = verifyData.data.some(t => t.id === tenantId);
    
    if (!deletedExists) {
       console.log("SUCCESS: Tenant deleted from API!");
    } else {
       console.log("FAILURE: Tenant still exists!");
    }

  } catch (err) {
    console.error("Test Error:", err);
  }
}

testTenantDelete();
