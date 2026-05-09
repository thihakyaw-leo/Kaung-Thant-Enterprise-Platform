import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import type { Env } from '../../index';

const setupAPI = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret } }>();

/**
 * GET ALL SETUP INFO
 */
setupAPI.get('/info', async (c) => {
  const db = drizzle(c.env.DB);
  
  try {
    const locations = await db.select().from(schema.setupLocation);
    const currencies = await db.select().from(schema.setupCurrency);
    const taxes = await db.select().from(schema.setupTax);

    return c.json({
      success: true,
      data: { locations, currencies, taxes }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * INITIALIZE STORE SETTINGS
 */
setupAPI.post('/init', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  
  const now = Math.floor(Date.now() / 1000);

  try {
    // 1. Create Default Currency if not exists
    await db.insert(schema.setupCurrency).values({
      id: crypto.randomUUID(),
      code: 'MMK',
      name: 'Kyat',
      symbol: 'K',
      isDefault: true,
      createdAt: now,
      updatedAt: now
    }).onConflictDoNothing();

    // 2. Create Initial Location
    await db.insert(schema.setupLocation).values({
      id: crypto.randomUUID(),
      name: body.locationName || 'Main Store',
      address: body.address || 'Yangon',
      createdAt: now,
      updatedAt: now
    });

    return c.json({ success: true, message: "Store initialized successfully." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

export default setupAPI;
