import { Context, Next } from 'hono';
import { verifyToken } from '../lib/security';
import { resolveTenantFromHost } from '../lib/tenant';
import { Env } from '../../index';

export const authGuard = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, data: null, error: 'Unauthorized: Missing token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  if (!c.env.JWT_SECRET) {
    return c.json({ success: false, data: null, error: 'Internal Server Error: Missing configuration' }, 500);
  }
  
  const jwtSecret = c.env.JWT_SECRET;
  const payload = await verifyToken(token, jwtSecret);
  
  if (!payload) {
    return c.json({ success: false, data: null, error: 'Unauthorized: Invalid or expired token' }, 401);
  }

  // Inject user info into context
  c.set('user', payload);
  c.set('userId', payload.id || payload.userId || payload.sub); // Guarantee userId exists for RBAC
  await next();
};
