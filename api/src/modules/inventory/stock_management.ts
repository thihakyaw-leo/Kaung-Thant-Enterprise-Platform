import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, and } from 'drizzle-orm';

import * as schema from '../../db/tenant.schema';
import { stockTransferSchema, stockAdjustSchema } from '../../shared/schemas/stock_management';
import { Env } from '../../index';
import { hasPermission } from '../../shared/middleware/permissions';

const stockManagementAPI = new Hono<{ 
  Bindings: Env,
  Variables: { userId: string }
}>();

// Apply permission guard for all inventory management operations
stockManagementAPI.use('*', hasPermission('inventory.manage'));

/**
 * 1. STOCK TRANSFER (Atomic)
 */
stockManagementAPI.post('/transfer', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = stockTransferSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const { fromLocationId, toLocationId, items } = validation.data;
  const transferId = crypto.randomUUID();
  const transferNo = `TRF-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const queries = [];
    
    // Header
    queries.push(db.insert(schema.inventoryTransfer).values([{
      id: transferId,
      transferNo,
      fromLocationId,
      toLocationId,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
      createdBy: (c.get('userId') as string) || 'system'
    }]));

    for (const item of items) {
      // Detail
      queries.push(db.insert(schema.inventoryTransferDetail).values([{
        id: crypto.randomUUID(),
        transferId,
        stockId: item.stockId,
        quantity: item.quantity,
        createdAt: now,
        createdBy: (c.get('userId') as string) || 'system'
      }]));

      // Decrease from Source
      queries.push(db.update(schema.inventoryStockQuantity)
        .set({ 
          quantity: sql`${schema.inventoryStockQuantity.quantity} - ${item.quantity}`, 
          updatedAt: now 
        })
        .where(and(
          eq(schema.inventoryStockQuantity.stockId, item.stockId), 
          eq(schema.inventoryStockQuantity.locationId, fromLocationId)
        )));

      // Increase/Upsert Destination
      queries.push(db.insert(schema.inventoryStockQuantity)
        .values({
          stockId: item.stockId,
          locationId: toLocationId,
          quantity: item.quantity,
          updatedAt: now
        })
        .onConflictDoUpdate({
          target: [schema.inventoryStockQuantity.locationId, schema.inventoryStockQuantity.stockId],
          set: { 
            quantity: sql`${schema.inventoryStockQuantity.quantity} + ${item.quantity}`, 
            updatedAt: now 
          }
        }));
    }

    await db.batch(queries as any);
    return c.json({ success: true, data: { transferId, transferNo } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * 2. STOCK ADJUSTMENT
 */
stockManagementAPI.post('/adjust', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const validation = stockAdjustSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, error: validation.error.message }, 400);
  }

  const { locationId, stockId, type, quantity, reason } = validation.data;
  const adjustId = crypto.randomUUID();
  const adjustNo = `ADJ-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);
  const qtyChange = type === 'IN' ? quantity : -quantity;

  try {
    const queries = [];
    
    // Header
    queries.push(db.insert(schema.inventoryStockAdjust).values([{
      id: adjustId,
      adjustNo,
      locationId,
      stockId,
      type,
      quantity,
      reason,
      createdAt: now,
      updatedAt: now,
      createdBy: (c.get('userId') as string) || 'system'
    }]));

    // Update Quantity
    queries.push(db.insert(schema.inventoryStockQuantity)
      .values([{
        stockId,
        locationId,
        quantity: qtyChange,
        updatedAt: now
      }])
      .onConflictDoUpdate({
        target: [schema.inventoryStockQuantity.locationId, schema.inventoryStockQuantity.stockId],
        set: { 
          quantity: sql`${schema.inventoryStockQuantity.quantity} + ${qtyChange}`, 
          updatedAt: now 
        }
      }));

    await db.batch(queries as any);
    return c.json({ success: true, data: { adjustId, adjustNo } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * 3. STOCK RECONCILIATION (Bulk Adjustment)
 */
stockManagementAPI.post('/reconcile', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json(); // { locationId, items: [{ stockId, actualQuantity }] }
  const { locationId, items } = body;
  const now = Math.floor(Date.now() / 1000);

  try {
    const queries = [];

    for (const item of items) {
      const adjustId = crypto.randomUUID();
      
      // Calculate difference and adjust directly
      queries.push(db.update(schema.inventoryStockQuantity)
        .set({ 
          quantity: item.actualQuantity, 
          updatedAt: now 
        })
        .where(and(
          eq(schema.inventoryStockQuantity.stockId, item.stockId),
          eq(schema.inventoryStockQuantity.locationId, locationId)
        )));

      // Log the reconciliation as an adjustment
      queries.push(db.insert(schema.inventoryStockAdjust).values([{
        id: adjustId,
        adjustNo: `REC-${Date.now()}-${item.stockId.slice(0,4)}`,
        locationId,
        stockId: item.stockId,
        type: 'RECONCILE',
        quantity: item.actualQuantity,
        reason: 'Periodic Stock Take',
        createdAt: now,
        updatedAt: now,
        createdBy: (c.get('userId') as string) || 'system'
      }]));
    }

    await db.batch(queries as any);
    return c.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

export default stockManagementAPI;
