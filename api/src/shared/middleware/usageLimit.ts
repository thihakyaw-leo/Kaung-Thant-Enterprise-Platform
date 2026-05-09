import { Context, Next } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as masterSchema from '../../db/master.schema';
import * as tenantSchema from '../../db/tenant.schema';

export const checkUsageLimit = (resource: 'users' | 'products') => {
  return async (c: Context, next: Next) => {
    // Note: Bindings should be available in c.env
    const dbMaster = drizzle(c.env.DB);
    const dbTenant = drizzle(c.env.DB);
    
    // 1. Get Tenant and Plan info
    const tenantId = c.get('tenantId'); 
    if (!tenantId) return c.json({ error: "Unauthorized: No Tenant ID found" }, 401);

    const tenant = await dbMaster.select().from(masterSchema.tenants).where(eq(masterSchema.tenants.id, tenantId)).get();
    if (!tenant) return c.json({ error: "Tenant not found" }, 404);

    const plan = await dbMaster.select().from(masterSchema.pricingPlans).where(eq(masterSchema.pricingPlans.id, tenant.plan_id)).get();
    if (!plan) return c.json({ error: "Plan not found" }, 404);

    // 2. Check current usage against plan limits
    if (resource === 'users') {
      const users = await dbTenant.select().from(tenantSchema.configUser).all();
      if (users.length >= plan.maxUsers) {
        return c.json({ 
          success: false, 
          error: `Plan Limit Reached: Your ${plan.name} plan only allows ${plan.maxUsers} users. Please upgrade.` 
        }, 403);
      }
    }

    if (resource === 'products') {
      const products = await dbTenant.select().from(tenantSchema.inventoryStock).all();
      if (products.length >= plan.maxProducts) {
        return c.json({ 
          success: false, 
          error: `Plan Limit Reached: Your ${plan.name} plan only allows ${plan.maxProducts} products. Please upgrade.` 
        }, 403);
      }
    }

    await next();
  };
};
