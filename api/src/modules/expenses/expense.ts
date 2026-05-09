import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import { Env } from '../../index';
import { hasPermission } from '../../shared/middleware/permissions';

const expenseAPI = new Hono<{ Bindings: Env }>();

/**
 * 1. EXPENSE TYPES (Categories)
 */
expenseAPI.get('/types', hasPermission('reports.view'), async (c) => {
  const db = drizzle(c.env.DB);
  const types = await db.select().from(schema.expenseType).all();
  return c.json({ success: true, data: types });
});

expenseAPI.post('/types', hasPermission('reports.edit'), async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const id = crypto.randomUUID();

  await db.insert(schema.expenseType).values({
    id,
    tenantId: 'default', // TODO: Get from context
    name: body.name,
    description: body.description,
    statusId: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  }).run();

  return c.json({ success: true, data: { id } });
});

expenseAPI.delete('/types/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');
  await db.delete(schema.expenseType).where(eq(schema.expenseType.id, id)).run();
  return c.json({ success: true });
});

/**
 * 2. EXPENSES
 */
expenseAPI.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const results = await db.select({
    id: schema.expenseExpense.id,
    amount: schema.expenseExpense.amount,
    note: schema.expenseExpense.note,
    referenceNo: schema.expenseExpense.referenceNo,
    transactionDate: schema.expenseExpense.transactionDate,
    expenseTypeName: schema.expenseType.name,
    locationName: schema.setupLocation.name,
    createdAt: schema.expenseExpense.createdAt,
  })
  .from(schema.expenseExpense)
  .leftJoin(schema.expenseType, eq(schema.expenseExpense.expenseTypeId, schema.expenseType.id))
  .leftJoin(schema.setupLocation, eq(schema.expenseExpense.locationId, schema.setupLocation.id))
  .orderBy(desc(schema.expenseExpense.transactionDate))
  .all();

  return c.json({ success: true, data: results });
});

expenseAPI.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const id = crypto.randomUUID();

  await db.insert(schema.expenseExpense).values({
    id,
    tenantId: 'default', // TODO: Get from context
    expenseTypeId: body.expenseTypeId,
    locationId: body.locationId,
    amount: Number(body.amount),
    referenceNo: body.referenceNo,
    note: body.note,
    transactionDate: body.transactionDate || Math.floor(Date.now() / 1000),
    statusId: 'active',
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  }).run();

  return c.json({ success: true, data: { id } });
});

expenseAPI.delete('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');
  await db.delete(schema.expenseExpense).where(eq(schema.expenseExpense.id, id)).run();
  return c.json({ success: true });
});

export default expenseAPI;
