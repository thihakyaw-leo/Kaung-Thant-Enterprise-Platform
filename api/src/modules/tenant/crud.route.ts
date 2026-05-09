import { Hono } from 'hono';
import * as tenantSchema from '../../db/tenant.schema';
import { createCrudRouter } from '../../shared/factory/crudFactory';

const tenantCrudApp = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret } }>();

// Dynamically expose all tables in the tenant schema
for (const [key, table] of Object.entries(tenantSchema)) {
  // Mount each table under its exported name (e.g., /api/crud/inventoryStock)
  tenantCrudApp.route(`/${key}`, createCrudRouter(table as any));
}

export default tenantCrudApp;
