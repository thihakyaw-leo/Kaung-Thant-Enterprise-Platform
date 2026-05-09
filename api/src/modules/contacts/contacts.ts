import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';

import * as schema from '../../db/tenant.schema';
import type { Env } from '../../index';
import { customerSchema, supplierSchema, agentSchema } from '../../shared/schemas/contact';

const contactsAPI = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret } }>();

/**
 * CUSTOMERS
 */
contactsAPI.get('/customers', async (c) => {
  const db = drizzle(c.env.DB);
  const customers = await db.select().from(schema.saleCustomer);
  return c.json({ success: true, data: customers, error: null });
});

contactsAPI.post('/customers', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = customerSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    await db.insert(schema.saleCustomer).values({
      id,
      ...validation.data,
      balance: 0,
      createdAt: now,
      updatedAt: now,
    });
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

contactsAPI.put('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = customerSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    await db.update(schema.saleCustomer)
      .set({
        ...validation.data,
        updatedAt: now,
      })
      .where(eq(schema.saleCustomer.id, id));
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

contactsAPI.delete('/customers/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);

  try {
    await db.delete(schema.saleCustomer).where(eq(schema.saleCustomer.id, id));
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

/**
 * SUPPLIERS
 */
contactsAPI.get('/suppliers', async (c) => {
  const db = drizzle(c.env.DB);
  const suppliers = await db.select().from(schema.purchaseSupplier);
  return c.json({ success: true, data: suppliers, error: null });
});

contactsAPI.post('/suppliers', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = supplierSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    await db.insert(schema.purchaseSupplier).values({
      id,
      ...validation.data,
      balance: 0,
      createdAt: now,
      updatedAt: now,
    });
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

contactsAPI.put('/suppliers/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = supplierSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    await db.update(schema.purchaseSupplier)
      .set({
        ...validation.data,
        updatedAt: now,
      })
      .where(eq(schema.purchaseSupplier.id, id));
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

contactsAPI.delete('/suppliers/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);

  try {
    await db.delete(schema.purchaseSupplier).where(eq(schema.purchaseSupplier.id, id));
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

/**
 * AGENTS
 */
contactsAPI.get('/agents', async (c) => {
  const db = drizzle(c.env.DB);
  const agents = await db.select().from(schema.saleAgent);
  return c.json({ success: true, data: agents, error: null });
});

contactsAPI.post('/agents', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = agentSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    await db.insert(schema.saleAgent).values({
      id,
      ...validation.data,
      createdAt: now,
      updatedAt: now,
    });
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

contactsAPI.put('/agents/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = agentSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  try {
    await db.update(schema.saleAgent)
      .set({
        ...validation.data,
        updatedAt: now,
      })
      .where(eq(schema.saleAgent.id, id));
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

contactsAPI.delete('/agents/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);

  try {
    await db.delete(schema.saleAgent).where(eq(schema.saleAgent.id, id));
    return c.json({ success: true, data: { id }, error: null });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

export default contactsAPI;
