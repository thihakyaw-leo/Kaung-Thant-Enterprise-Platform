import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';

import * as schema from '../../db/tenant.schema';
import type { Env } from '../../index';
import { deliveryProviderSchema, saleDeliverySchema } from '../../shared/schemas/delivery';
import { checkPermission } from '../../shared/middleware/rbac';

type Variables = {
  user: any;
  tenantId?: string;
  userId: string;
};

const deliveryAPI = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret }, Variables: Variables }>();

/**
 * DELIVERY PROVIDERS
 */
deliveryAPI.get('/providers', checkPermission('read:setup_delivery_provider'), async (c) => {
  const db = drizzle(c.env.DB);
  const tenantId = c.get('user').tenantId;
  const providers = await db.select().from(schema.setupDeliveryProvider).where(eq(schema.setupDeliveryProvider.tenantId, tenantId));
  return c.json({ success: true, data: providers, error: null });
});

deliveryAPI.post('/providers', checkPermission('create:setup_delivery_provider'), async (c) => {
  const db = drizzle(c.env.DB);
  const tenantId = c.get('user').tenantId;
  const body = await c.req.json();
  const validation = deliveryProviderSchema.safeParse(body);

  if (!validation.success) return c.json({ success: false, error: validation.error.message }, 400);

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    await db.insert(schema.setupDeliveryProvider).values({
      id,
      tenantId,
      ...validation.data,
      createdAt: now,
      updatedAt: now,
    });
    return c.json({ success: true, data: { id } });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

/**
 * DISPATCH DELIVERY
 */
deliveryAPI.post('/dispatch', checkPermission('create:sale_delivery'), async (c) => {
  const db = drizzle(c.env.DB);
  const tenantId = c.get('user').tenantId;
  const body = await c.req.json();
  const validation = saleDeliverySchema.safeParse(body);

  if (!validation.success) return c.json({ success: false, error: validation.error.message }, 400);

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    await db.insert(schema.saleDelivery).values({
      id,
      tenantId,
      ...validation.data,
      dispatchTime: now,
      createdAt: now,
      updatedAt: now,
    });
    return c.json({ success: true, data: { id } });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

/**
 * UPDATE STATUS
 */
deliveryAPI.put('/status/:id', checkPermission('update:sale_delivery'), async (c) => {
  const db = drizzle(c.env.DB);
  const tenantId = c.get('user').tenantId;
  const id = c.req.param('id') as string;
  const { status } = await c.req.json();

  const now = Math.floor(Date.now() / 1000);
  const updateData: any = { deliveryStatus: status, updatedAt: now };
  if (status === 'Delivered') updateData.deliveredTime = now;

  try {
    await db.update(schema.saleDelivery)
      .set(updateData)
      .where(and(eq(schema.saleDelivery.id, id), eq(schema.saleDelivery.tenantId, tenantId)));
    return c.json({ success: true });
  } catch (e: any) { return c.json({ success: false, error: e.message }, 500); }
});

export default deliveryAPI;
