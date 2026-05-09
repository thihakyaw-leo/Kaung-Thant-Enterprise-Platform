import { Hono } from 'hono';
import * as masterSchema from '../../db/master.schema';
import { createCrudRouter } from '../../shared/factory/crudFactory';
import { checkPermission } from '../../shared/middleware/rbac';

const masterCrudApp = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret } }>();

// Apply RBAC: Only super admins can access master CRUD routes
masterCrudApp.use('*', checkPermission('admin.all'));

// Dynamically expose all tables in the master schema
for (const [key, table] of Object.entries(masterSchema)) {
  // Mount each table under its exported name
  masterCrudApp.route(`/${key}`, createCrudRouter(table as any));
}

export default masterCrudApp;
