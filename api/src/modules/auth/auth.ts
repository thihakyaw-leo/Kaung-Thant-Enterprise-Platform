import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { saasUsers, tenants } from '../../db/master.schema';
import { hashPassword, verifyPassword, signToken } from '../../shared/lib/security';
import { loginSchema, registerSchema } from '../../shared/schemas/auth';
import { ProvisioningService } from '../../shared/services/provisioning';
import { rateLimit } from '../../shared/middleware/ratelimit';
import { Env } from '../../index';

const authAPI = new Hono<{ Bindings: Env }>();

// REGISTER: Create Global User and Tenant
authAPI.post('/register', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  
  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const { email, password, name, subdomain } = validation.data;

  try {
    // 1. Check if user or subdomain already exists
    const existingUser = await db.select().from(saasUsers).where(eq(saasUsers.email, email)).limit(1);
    if (existingUser.length > 0) {
      return c.json({ success: false, data: null, error: 'Email already registered' }, 400);
    }

    const existingTenant = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).limit(1);
    if (existingTenant.length > 0) {
      return c.json({ success: false, data: null, error: 'Subdomain already taken' }, 400);
    }

    // 2. Create User and Tenant in a transaction
    const userId = crypto.randomUUID();
    const tenantId = crypto.randomUUID();
    const hashedPassword = await hashPassword(password);

    await db.batch([
      db.insert(saasUsers).values({
        id: userId,
        email,
        fullName: name,
        passwordHash: hashedPassword,
        role: 'owner',
        createdAt: Math.floor(Date.now() / 1000),
      }),
      db.insert(tenants).values({
        id: tenantId,
        name,
        subdomain,
        d1_database_id: `DB_${subdomain.toUpperCase()}`, // Mocking binding name
        status: 'active',
        createdAt: Math.floor(Date.now() / 1000),
      })
    ]);

    // 3. PROVISIONING PIPELINE: Initialize the tenant's private database
    // In a real scenario, you'd dynamically resolve the D1 binding.
    // For this template, we use the DB_TENANT binding as a placeholder.
    const provisioning = new ProvisioningService(c.env.DB);
    c.executionCtx.waitUntil(provisioning.initializeTenant());

    return c.json({ 
      success: true, 
      data: { userId, tenantId, subdomain, provisioned: true }, 
      error: null 
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

// Strict Rate Limit: Max 5 login attempts per minute per IP
const loginRateLimiter = rateLimit(5, 60, 'auth_login');

// LOGIN: Global Login
authAPI.post('/login', loginRateLimiter, async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const { email, password } = validation.data;

  try {
    const user = await db.select().from(saasUsers).where(eq(saasUsers.email, email)).limit(1);
    if (user.length === 0) {
      return c.json({ success: false, data: null, error: 'Invalid email or password' }, 401);
    }

    const isValid = await verifyPassword(password, user[0].passwordHash);
    if (!isValid) {
      return c.json({ success: false, data: null, error: 'Invalid email or password' }, 401);
    }

    // Find the tenant associated with this user (Simplification: assuming 1 tenant for now)
    // In a full RBAC system, you'd check tenant_users_map
    const tenant = await db.select().from(tenants).limit(1); // Placeholder logic
    
    const token = await signToken({
      userId: user[0].id,
      email: user[0].email,
      role: user[0].role,
      subdomain: tenant[0]?.subdomain
    }, c.env.JWT_SECRET);

    return c.json({ success: true, data: { token }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

export default authAPI;
