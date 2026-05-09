import { MiddlewareHandler } from 'hono';

/**
 * Structured JSON Logger Middleware
 * Integrates with Cloudflare Observability
 */
export const structuredLogger = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    const rayId = c.req.header('cf-ray') || 'local';

    await next();

    const ms = Date.now() - start;
    const userId = c.get('userId') || 'anonymous';
    
    const logData = {
      level: c.error ? 'ERROR' : 'INFO',
      timestamp: new Date().toISOString(),
      rayId,
      method: c.req.method,
      path: c.req.path,
      status: c.res.status,
      duration: `${ms}ms`,
      userId,
      ip: c.req.header('cf-connecting-ip') || 'unknown',
      userAgent: c.req.header('user-agent'),
      error: c.error ? {
        message: c.error.message,
        stack: c.error.stack
      } : undefined
    };

    // Log as a single JSON line for Cloudflare Logpush/Observability to parse
    console.log(JSON.stringify(logData));
  };
};
