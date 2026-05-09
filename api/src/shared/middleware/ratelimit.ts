import type { Context, Next } from 'hono';

/**
 * Cloudflare KV-based Fixed Window Rate Limiter
 * @param limit Max number of requests allowed in the window
 * @param windowSecs Time window in seconds (default: 60)
 * @param prefix Cache key prefix for isolation
 */
export const rateLimit = (limit: number, windowSecs: number = 60, prefix: string = 'rl') => {
  return async (c: Context, next: Next) => {
    const kv = c.env.KV_CACHE as KVNamespace | undefined;
    
    // If KV is not properly bound, safely bypass rate limiting to prevent API crash
    if (!kv) {
      return await next();
    }

    const ip = c.req.header('cf-connecting-ip') || 'unknown';
    const window = Math.floor(Date.now() / 1000 / windowSecs);
    const key = `${prefix}:${ip}:${window}`;

    try {
      const currentVal = await kv.get(key);
      const count = currentVal ? parseInt(currentVal, 10) : 0;

      if (count >= limit) {
        return c.json({
          success: false,
          data: null,
          error: 'Too Many Requests. Please try again later.'
        }, 429);
      }

      // Use waitUntil to perform the KV write asynchronously, reducing latency
      // We set expirationTtl slightly higher than the window to ensure it cleans up automatically
      c.executionCtx.waitUntil(
        kv.put(key, (count + 1).toString(), { expirationTtl: windowSecs + 60 })
      );

    } catch (error) {
      console.error('[RateLimit] KV Error:', error);
      // In case of a temporary KV failure, we fail open (allow the request)
    }

    await next();
  };
};
