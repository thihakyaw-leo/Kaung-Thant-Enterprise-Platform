import { Context, Next } from 'hono';

/**
 * Cloudflare Analytics Engine Middleware
 * Records metrics for each API request.
 */
export const analyticsMiddleware = async (c: Context, next: Next) => {
  const start = Date.now();
  
  await next();
  
  const latency = Date.now() - start;
  
  if (c.env.API_METRICS) {
    c.env.API_METRICS.writeDataPoint({
      blobs: [
        c.req.method,
        c.req.path,
        c.res.status.toString(),
        (c.req.raw.cf?.colo as string) || 'local',
        (c.req.raw.cf?.country as string) || 'local'
      ],
      doubles: [
        latency, // Metric 1: Request Latency
        1        // Metric 2: Request Count
      ]
    });
  }
};
