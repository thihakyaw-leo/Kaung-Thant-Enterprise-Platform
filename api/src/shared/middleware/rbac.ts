import { Context, Next } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';

/**
 * RBAC MIDDLEWARE
 * Verifies if the authenticated user has the required permission
 */
export const checkPermission = (requiredPermission: string) => {
  return async (c: Context, next: Next) => {
    const db = drizzle(c.env.DB);
    
    // Get userId from context (assumes auth middleware ran first)
    const userId = c.get('userId'); 

    if (!userId) {
      return c.json({ success: false, error: 'Unauthorized: User ID not found' }, 401);
    }

    try {
      // 1. Fetch user's roles and permissions
      const roles = await db
        .select({
          permissions: schema.configRole.permissions
        })
        .from(schema.configUserRole)
        .innerJoin(schema.configRole, eq(schema.configUserRole.roleId, schema.configRole.id))
        .where(eq(schema.configUserRole.userId, userId))
        .all();

      // 2. Extract and check permissions
      // Permissions are stored as JSON strings in the database
      const allPermissions = new Set<string>();
      roles.forEach(role => {
        try {
          const perms = JSON.parse(role.permissions || '[]');
          perms.forEach((p: string) => allPermissions.add(p));
        } catch (e) {
          console.error('Failed to parse permissions for role');
        }
      });

      // 3. Permission Check (Support wildcards or specific match)
      const hasPermission = allPermissions.has(requiredPermission) || allPermissions.has('admin.all');

      if (hasPermission) {
        await next();
      } else {
        return c.json({ 
          success: false, 
          error: `Forbidden: You do not have permission to [${requiredPermission}]` 
        }, 403);
      }
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
      return c.json({ success: false, error: message }, 500);
    }
  };
};
