import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import { Env } from '../../index';

import { SettingsService } from '../../shared/lib/settings';

const settingAPI = new Hono<{ Bindings: Env }>();

/**
 * 1. GET BUSINESS PROFILE
 */
settingAPI.get('/business', async (c) => {
  const db = drizzle(c.env.DB);
  const business = await db.select()
    .from(schema.setupBusiness)
    .get();

  return c.json({ success: true, data: business || {} });
});

/**
 * 2. UPDATE BUSINESS PROFILE
 */
settingAPI.post('/business', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const now = Math.floor(Date.now() / 1000);

  const existing = await db.select().from(schema.setupBusiness).get();

  if (existing) {
    await db.update(schema.setupBusiness)
      .set({ ...body, updatedAt: now })
      .where(eq(schema.setupBusiness.id, existing.id))
      .run();
  } else {
    await db.insert(schema.setupBusiness)
      .values({ 
        id: crypto.randomUUID(), 
        ...body, 
        createdAt: now, 
        updatedAt: now 
      })
      .run();
  }

  return c.json({ success: true });
});

/**
 * 3. GET ALL SETTINGS (With KV Cache)
 */
settingAPI.get('/settings', async (c) => {
  const settingsService = new SettingsService(c.env);
  const settingsObj = await settingsService.getAll();
  return c.json({ success: true, data: settingsObj });
});

/**
 * 4. UPDATE SETTINGS (Batch with KV Sync)
 */
settingAPI.post('/settings', async (c) => {
  const settingsService = new SettingsService(c.env);
  const body = await c.req.json(); // { key: value, ... }

  for (const [key, value] of Object.entries(body)) {
    await settingsService.set(key, String(value));
  }

  return c.json({ success: true });
});

export default settingAPI;
