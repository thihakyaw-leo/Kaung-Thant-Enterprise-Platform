const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJ1c3Jfc3VwZXJhZG1pbiIsImVtYWlsIjoiYWRtaW5Aa2F1bmd0aGFudC5zaG9wIiwicm9sZSI6InN1cGVyX2FkbWluIiwiaWF0IjoxNzc4MzEzMjIxLCJleHAiOjE3NzgzOTk2MjF9.PLEZuPT5pa7BkIOKxifoZ6EhaMBW_xWmB-3YrdATt0M';

async function testTenantUpdate() {
  try {
    // 1. Get a tenant ID
    const tenantsRes = await fetch('https://kaung-thant-pos-api-production.kaungthant.workers.dev/api/master/tenants', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const tenants = await tenantsRes.json();
    if (!tenants.success || tenants.data.length === 0) {
      console.log("No tenants found");
      return;
    }
    const tenant = tenants.data[0];
    console.log(`Testing with tenant: ${tenant.name} (${tenant.id})`);

    // 2. Try to update credentials
    const updateRes = await fetch(`https://kaung-thant-pos-api-production.kaungthant.workers.dev/api/master/tenants/${tenant.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ownerUsername: 'new_owner',
        ownerPassword: 'secret_password_123'
      })
    });
    console.log("Update Result:", await updateRes.json());

    // 3. Verify if saved
    const verifyRes = await fetch('https://kaung-thant-pos-api-production.kaungthant.workers.dev/api/master/tenants', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const verifyData = await verifyRes.json();
    const updatedTenant = verifyData.data.find(t => t.id === tenant.id);
    console.log("Updated Tenant Owner:", updatedTenant.ownerUsername);
    console.log("Updated Tenant Password:", updatedTenant.ownerPassword);

    if (updatedTenant.ownerPassword === 'secret_password_123') {
       console.log("SUCCESS: Password saved (Wait, I thought it wouldn't be?)");
    } else {
       console.log("FAILURE: Password NOT saved (As expected, whitelist issue)");
    }

  } catch (err) {
    console.error("Test Error:", err);
  }
}

testTenantUpdate();
