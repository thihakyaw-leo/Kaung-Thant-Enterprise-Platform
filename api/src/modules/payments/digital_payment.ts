import { Hono } from 'hono';
import { Env } from '../../index';
import { trackTransaction } from '../../shared/utils/analytics';

const paymentAPI = new Hono<{ 
  Bindings: Env,
  Variables: { userId: string }
}>();

/**
 * KBZPay Payment Request
 */
paymentAPI.post('/kbzpay/precreate', async (c) => {
  const { amount, orderId, callbackUrl } = await c.req.json();
  
  // In production, you would use env.KBZ_PAY_APP_KEY etc.
  // For now, we simulate the request flow
  
  const payload = {
    merch_code: c.env.KBZ_MERCHANT_CODE || 'SIMULATED_MERCHANT',
    appid: 'POS_APP_001',
    method: 'kbz.payment.precreate',
    nonce_str: crypto.randomUUID().replace(/-/g, ''),
    biz_content: {
      merch_order_id: orderId,
      total_amount: amount,
      trade_type: 'PAY_BY_QRCODE',
      title: `POS Order ${orderId}`,
      callback_info: encodeURIComponent(callbackUrl)
    }
  };

  // Logic for HMAC-SHA256 signing would go here
  // const signature = await signWithAppKey(payload, env.KBZ_PAY_APP_KEY);

  return c.json({
    success: true,
    qr_code: `kbzpay://simulated-payment?id=${orderId}&amt=${amount}`,
    transactionId: `KBZ-${Date.now()}`
  });
});

/**
 * WavePay Payment Request
 */
paymentAPI.post('/wavepay/request', async (c) => {
  const { amount, orderId, callbackUrl } = await c.req.json();

  const payload = {
    merchantId: c.env.WAVE_MERCHANT_ID || 'SIMULATED_WAVE_MERCH',
    orderId,
    amount,
    backendUrl: callbackUrl,
    frontendUrl: callbackUrl,
    timeStamp: Math.floor(Date.now() / 1000)
  };

  return c.json({
    success: true,
    paymentUrl: `https://wavepay.com.mm/pay?order=${orderId}&amount=${amount}`,
    orderId
  });
});

import { verifyHmacSignature } from '../../shared/utils/crypto';

/**
 * Universal Payment Callback (Webhook)
 */
paymentAPI.post('/callback/:provider', async (c) => {
  const provider = c.req.param('provider');
  const signature = c.req.header('X-Signature'); // Provider-specific header
  const rawBody = await c.req.text();
  const data = JSON.parse(rawBody);
  
  // 1. Verify Signature (Security Best Practice)
  const secret = provider === 'kbzpay' ? c.env.KBZ_APP_KEY : c.env.WAVE_MERCHANT_ID;
  
  if (signature) {
    const isValid = await verifyHmacSignature(rawBody, signature, secret);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid Signature' }, 401);
    }
  } else if (c.env.ENVIRONMENT === 'production') {
    // In production, signature is MANDATORY
    return c.json({ success: false, error: 'Signature Required' }, 401);
  }

  // 2. Track Real-time Analytics on Success
  if (data.status === 'SUCCESS' || data.result === '0') {
    await trackTransaction(c.env, {
      type: 'SALE',
      amount: Number(data.amount),
      paymentMethod: provider.toUpperCase(),
      locationId: data.locationId || 'default',
      userId: 'system' // Webhooks usually don't have user context
    });
  }

  return c.json({ state: 'OK' });
});

export default paymentAPI;
