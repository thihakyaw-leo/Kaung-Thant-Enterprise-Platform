import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import { Env } from '../../index';

export class SettingsService {
  constructor(private env: Env) {}

  /**
   * Get a single setting by key (with KV caching)
   */
  async get(key: string): Promise<string | null> {
    // 1. Try KV cache first
    const cached = await this.env.POS_SETTINGS.get(key);
    if (cached) return cached;

    // 2. Fallback to D1
    const db = drizzle(this.env.DB);
    const result = await db.select()
      .from(schema.configSetting)
      .where(eq(schema.configSetting.key, key))
      .get();

    if (result?.value) {
      // 3. Update KV for next time
      await this.env.POS_SETTINGS.put(key, result.value, { expirationTtl: 3600 }); // Cache for 1 hour
      return result.value;
    }

    return null;
  }

  /**
   * Set a setting (Updates both D1 and KV)
   */
  async set(key: string, value: string): Promise<void> {
    const db = drizzle(this.env.DB);
    const now = Math.floor(Date.now() / 1000);

    // 1. Update D1
    await db.insert(schema.configSetting)
      .values({ key, value, updatedAt: now })
      .onConflictDoUpdate({
        target: schema.configSetting.key,
        set: { value, updatedAt: now }
      })
      .run();

    // 2. Update KV
    await this.env.POS_SETTINGS.put(key, value, { expirationTtl: 3600 });
  }

  /**
   * Get all settings as an object
   */
  async getAll(): Promise<Record<string, string>> {
    const db = drizzle(this.env.DB);
    const settings = await db.select().from(schema.configSetting).all();
    
    const obj: Record<string, string> = {};
    for (const s of settings) {
      obj[s.key] = s.value || '';
      // Proactively warm up KV
      await this.env.POS_SETTINGS.put(s.key, s.value || '', { expirationTtl: 3600 });
    }
    return obj;
  }
}
