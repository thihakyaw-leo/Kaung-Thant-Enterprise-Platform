import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, asc } from 'drizzle-orm';
import { SQLiteTable, getTableConfig } from 'drizzle-orm/sqlite-core';
import type { Env } from '../../index';
import { checkPermission } from '../middleware/rbac';
import { cacheMiddleware } from '../middleware/cache';

/**
 * Creates a generic CRUD router for a given Drizzle SQLite table.
 * Supports tables with a single primary key named `id`.
 */
export function createCrudRouter<T extends SQLiteTable>(table: T) {
  const router = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret } }>();
  const { name: tableName } = getTableConfig(table);

  // Apply cache middleware to all GET routes in this generic router
  router.use('/*', cacheMiddleware(60));

  // GET / -> List all records with Pagination, Sorting, and Filtering
  router.get('/', async (c) => {
    try {
      const db = drizzle(c.env.DB);
      const queryParams = c.req.query();
      
      const limitVal = parseInt(queryParams.limit || '50', 10);
      const offsetVal = parseInt(queryParams.offset || '0', 10);
      
      const limit = isNaN(limitVal) ? 50 : Math.min(Math.max(1, limitVal), 1000); // Enforce max 1000 limit
      const offset = isNaN(offsetVal) ? 0 : Math.max(0, offsetVal);
      
      const sortBy = queryParams.sortBy;
      const order = queryParams.order === 'desc' ? 'desc' : 'asc';
      
      const filters = [];
      const tableColumns = table as any;
      
      // Dynamic Filtering
      for (const [key, value] of Object.entries(queryParams)) {
        if (key !== 'limit' && key !== 'offset' && key !== 'sortBy' && key !== 'order') {
          if (tableColumns[key]) {
            filters.push(eq(tableColumns[key], value));
          }
        }
      }

      let query = db.select().from(table).$dynamic();
      
      if (filters.length > 0) {
        query = query.where(and(...filters));
      }
      
      if (sortBy && tableColumns[sortBy]) {
        query = query.orderBy(order === 'desc' ? desc(tableColumns[sortBy]) : asc(tableColumns[sortBy]));
      } else if (tableColumns['createdAt']) {
        query = query.orderBy(desc(tableColumns['createdAt'])); // Default sort by newest
      }

      const data = await query.limit(limit).offset(offset);

      return c.json({
        success: true,
        data,
        meta: {
          limit,
          offset,
          count: data.length
        }
      });
    } catch (error: any) {
      return c.json({ success: false, data: null, error: error.message }, 500);
    }
  });

  // GET /:id -> Get a single record
  router.get('/:id', async (c) => {
    try {
      const db = drizzle(c.env.DB);
      const id = c.req.param('id');
      
      const tableWithId = table as any;
      if (!tableWithId.id) {
          return c.json({ success: false, data: null, error: 'Table does not have an ID column' }, 400);
      }
      
      const data = await db.select().from(table).where(eq(tableWithId.id, id)).limit(1);
      
      if (data.length === 0) {
        return c.json({ success: false, data: null, error: 'Record not found' }, 404);
      }
      return c.json({ success: true, data: data[0] });
    } catch (error: any) {
      return c.json({ success: false, data: null, error: error.message }, 500);
    }
  });

  // POST / -> Create a new record
  router.post('/', checkPermission(`create:${tableName}`), async (c) => {
    try {
      const db = drizzle(c.env.DB);
      const body = await c.req.json();
      
      const now = Math.floor(Date.now() / 1000);
      if (body.createdAt === undefined && (table as any).createdAt) {
          body.createdAt = now;
      }
      if (body.updatedAt === undefined && (table as any).updatedAt) {
          body.updatedAt = now;
      }

      const data = await db.insert(table).values(body).returning();
      return c.json({ success: true, data: data[0] });
    } catch (error: any) {
      return c.json({ success: false, data: null, error: error.message }, 500);
    }
  });

  // PATCH /:id -> Update a record
  router.patch('/:id', checkPermission(`update:${tableName}`), async (c) => {
    try {
      const db = drizzle(c.env.DB);
      const id = c.req.param('id');
      const body = await c.req.json();
      
      const tableWithId = table as any;
      if (!tableWithId.id) {
          return c.json({ success: false, data: null, error: 'Table does not have an ID column' }, 400);
      }

      if (body.updatedAt === undefined && tableWithId.updatedAt) {
          body.updatedAt = Math.floor(Date.now() / 1000);
      }

      const data = await db.update(table).set(body).where(eq(tableWithId.id, id)).returning();
      
      if (data.length === 0) {
        return c.json({ success: false, data: null, error: 'Record not found' }, 404);
      }
      return c.json({ success: true, data: data[0] });
    } catch (error: any) {
      return c.json({ success: false, data: null, error: error.message }, 500);
    }
  });

  // DELETE /:id -> Delete a record
  router.delete('/:id', checkPermission(`delete:${tableName}`), async (c) => {
    try {
      const db = drizzle(c.env.DB);
      const id = c.req.param('id');
      
      const tableWithId = table as any;
      if (!tableWithId.id) {
          return c.json({ success: false, data: null, error: 'Table does not have an ID column' }, 400);
      }

      const data = await db.delete(table).where(eq(tableWithId.id, id)).returning();
      
      if (data.length === 0) {
        return c.json({ success: false, data: null, error: 'Record not found' }, 404);
      }
      return c.json({ success: true, data: data[0] });
    } catch (error: any) {
      return c.json({ success: false, data: null, error: error.message }, 500);
    }
  });

  return router;
}
