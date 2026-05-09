import { Env } from '../../index';
import { z } from 'zod';

/**
 * Settings Schema Definitions
 */
export const TaxSettingsSchema = z.object({
  rate: z.number().default(5),
  type: z.enum(['inclusive', 'exclusive']).default('exclusive'),
  enabled: z.boolean().default(true),
});

export const CurrencySettingsSchema = z.object({
  code: z.string().default('MMK'),
  symbol: z.string().default('Ks'),
  decimalPlaces: z.number().default(0),
});

export type TaxSettings = z.infer<typeof TaxSettingsSchema>;
export type CurrencySettings = z.infer<typeof CurrencySettingsSchema>;

// Local cache to reduce KV read costs and latency within the same isolate
let settingsCache: Record<string, { data: any, expiry: number }> = {};
const CACHE_TTL = 60000; // 1 minute

/**
 * KV Settings Service
 * Optimized for Edge performance with local in-memory caching
 */
export class KVSettingsService {
  constructor(private env: Env) {}

  private async getFromKV<T>(key: string, schema: z.ZodSchema<T>): Promise<T> {
    const now = Date.now();
    
    // 1. Check Memory Cache
    if (settingsCache[key] && settingsCache[key].expiry > now) {
      return settingsCache[key].data;
    }

    // 2. Fetch from KV
    const kvData = await this.env.POS_SETTINGS.get(key);
    let result: T;

    if (kvData) {
      try {
        const parsed = JSON.parse(kvData);
        result = schema.parse(parsed);
      } catch (e) {
        console.error(`KV Parse Error for ${key}:`, e);
        result = schema.parse({}); // Fallback to defaults
      }
    } else {
      result = schema.parse({}); // Default settings
    }

    // 3. Update Memory Cache
    settingsCache[key] = {
      data: result,
      expiry: now + CACHE_TTL
    };

    return result;
  }

  /**
   * Get Tax Settings
   */
  async getTaxSettings(): Promise<TaxSettings> {
    return this.getFromKV('settings:tax', TaxSettingsSchema);
  }

  /**
   * Get Currency Settings
   */
  async getCurrencySettings(): Promise<CurrencySettings> {
    return this.getFromKV('settings:currency', CurrencySettingsSchema);
  }

  /**
   * Update Setting (Admin only)
   */
  async updateSetting(key: string, value: any): Promise<void> {
    await this.env.POS_SETTINGS.put(key, JSON.stringify(value));
    // Invalidate local cache
    delete settingsCache[key];
  }
}
