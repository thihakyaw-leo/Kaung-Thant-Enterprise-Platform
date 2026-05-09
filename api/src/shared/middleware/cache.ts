import type { Context, Next } from 'hono';

/**
 * Cloudflare KV-based GET Request Caching Middleware
 * @param ttlSeconds Expiration time for the cache (default: 60 seconds)
 */
export const cacheMiddleware = (ttlSeconds: number = 60) => {
  return async (c: Context, next: Next) => {
    // Only cache GET requests
    if (c.req.method !== 'GET') {
      return await next();
    }

    const kv = c.env.KV_CACHE as KVNamespace | undefined;
    if (!kv) {
      return await next();
    }

    // Isolate cache by userId to prevent cross-user/cross-tenant data leakage
    const userId = c.get('userId') || 'anonymous';
    
    // Cache key incorporates the full URL (including query parameters)
    const key = `cache:${userId}:${c.req.url}`;

    try {
      const cached = await kv.get(key);
      if (cached) {
        c.header('X-Cache', 'HIT');
        c.header('Content-Type', 'application/json; charset=utf-8');
        return c.body(cached);
      }
    } catch (error) {
      console.error('[Cache] KV Read Error:', error);
    }

    c.header('X-Cache', 'MISS');
    await next();

    // After route handler executes, if response is successful (200), cache it
    if (c.res.status === 200) {
      try {
        // We must clone the response to read its body without consuming it for the client
        const responseClone = c.res.clone();
        const body = await responseClone.text();
        
        // Use waitUntil for non-blocking, asynchronous KV writes
        c.executionCtx.waitUntil(
          kv.put(key, body, { expirationTtl: ttlSeconds })
        );
      } catch (error) {
        console.error('[Cache] KV Write Error:', error);
      }
    }
  };
};
