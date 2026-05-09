import { Context, Next } from 'hono';

export type Role = 'owner' | 'admin' | 'super_admin' | 'manager' | 'cashier';

/**
 * Standard Permission Mapping
 */
const PERMISSIONS: Record<Role, string[]> = {
  owner: ['*'], // Access to everything
  super_admin: ['*'], // Access to everything globally
  admin: ['sales.*', 'inventory.*', 'reports.*', 'config.*'],
  manager: ['sales.*', 'inventory.*', 'reports.view'],
  cashier: ['sales.create', 'sales.view', 'inventory.view'],
};

/**
 * RBAC Middleware: Check if the user has the required permission
 */
export const hasPermission = (requiredPermission: string) => {
  return async (c: Context, next: Next) => {
    const user = c.get('user');
    if (!user || !user.role) {
      return c.json({ success: false, error: 'Forbidden: No role assigned' }, 403);
    }

    const userRole = user.role as Role;
    const userPermissions = PERMISSIONS[userRole] || [];

    // Check for superuser permission
    if (userPermissions.includes('*')) {
      await next();
      return;
    }

    // Check for exact match or wildcard match
    const hasAccess = userPermissions.some(p => {
      if (p === requiredPermission) return true;
      if (p.endsWith('.*')) {
        const base = p.split('.')[0];
        return requiredPermission.startsWith(`${base}.`);
      }
      return false;
    });

    if (!hasAccess) {
      return c.json({ 
        success: false, 
        error: `Forbidden: You do not have permission [${requiredPermission}]` 
      }, 403);
    }

    await next();
  };
};
