import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql, and, inArray } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import { Env } from '../../index';
import { hasPermission } from '../../shared/middleware/permissions';

const transferAPI = new Hono<{ 
  Bindings: Env,
  Variables: { userId: string }
}>();

// Apply broad permission for all transfer operations
transferAPI.use('*', hasPermission('inventory.*'));

/**
 * 1. GET ALL TRANSFERS
 */
transferAPI.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const transfers = await db.select({
    id: schema.inventoryTransfer.id,
    transferNo: schema.inventoryTransfer.transferNo,
    fromLocation: schema.setupLocation.name,
    toLocation: sql<string>`(SELECT name FROM t_setup_location WHERE id = ${schema.inventoryTransfer.toLocationId})`,
    status: schema.setupStatus.name,
    transactionDate: schema.inventoryTransfer.transactionDate,
    createdAt: schema.inventoryTransfer.createdAt,
  })
  .from(schema.inventoryTransfer)
  .leftJoin(schema.setupLocation, eq(schema.inventoryTransfer.fromLocationId, schema.setupLocation.id))
  .leftJoin(schema.setupStatus, eq(schema.inventoryTransfer.statusId, schema.setupStatus.id))
  .orderBy(desc(schema.inventoryTransfer.createdAt))
  .all();

  return c.json({ success: true, data: transfers });
});

/**
 * 2. GET TRANSFER DETAILS
 */
transferAPI.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  const transfer = await db.select()
    .from(schema.inventoryTransfer)
    .where(eq(schema.inventoryTransfer.id, id))
    .get();

  if (!transfer) return c.json({ success: false, error: 'Transfer not found' }, 404);

  const details = await db.select({
    id: schema.inventoryTransferDetail.id,
    stockId: schema.inventoryTransferDetail.stockId,
    productName: schema.inventoryStock.name,
    productCode: schema.inventoryStock.code,
    quantity: schema.inventoryTransferDetail.quantity,
  })
  .from(schema.inventoryTransferDetail)
  .leftJoin(schema.inventoryStock, eq(schema.inventoryTransferDetail.stockId, schema.inventoryStock.id))
  .where(eq(schema.inventoryTransferDetail.transferId, id))
  .all();

  return c.json({ success: true, data: { ...transfer, details } });
});

/**
 * 3. CREATE TRANSFER (With Stock Validation)
 */
transferAPI.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { fromLocationId, toLocationId, items, transactionDate } = body;

  if (fromLocationId === toLocationId) {
    return c.json({ success: false, error: 'Source and destination locations must be different' }, 400);
  }

  // 1. Validate Stock Availability at Source
  const stockIds = items.map((i: any) => i.stockId);
  const currentStocks = await db.select()
    .from(schema.inventoryStockQuantity)
    .where(and(
      eq(schema.inventoryStockQuantity.locationId, fromLocationId),
      inArray(schema.inventoryStockQuantity.stockId, stockIds)
    ))
    .all();

  for (const item of items) {
    const current = currentStocks.find(s => s.stockId === item.stockId);
    if (!current || (current.quantity || 0) < item.quantity) {
      return c.json({ 
        success: false, 
        error: `Insufficient stock for item: ${item.stockId}. Current: ${current?.quantity || 0}` 
      }, 400);
    }
  }

  const transferId = crypto.randomUUID();
  const transferNo = `TRF-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const queries = [];

    // 2. Insert Transfer Header
    queries.push(
      db.insert(schema.inventoryTransfer).values({
        id: transferId,
        transferNo,
        fromLocationId,
        toLocationId,
        transactionDate: transactionDate || now,
        statusId: 'completed',
        createdAt: now,
        updatedAt: now,
        createdBy: c.get('userId') || 'system',
        updatedBy: c.get('userId') || 'system'
      })
    );

    for (const item of items) {
      const detailId = crypto.randomUUID();

      // 3. Insert Detail
      queries.push(
        db.insert(schema.inventoryTransferDetail).values({
          id: detailId,
          transferId,
          stockId: item.stockId,
          quantity: item.quantity,
          createdAt: now,
          createdBy: c.get('userId') || 'system'
        })
      );

      // 4. Update From Location Stock (Decrease)
      queries.push(
        db.update(schema.inventoryStockQuantity)
          .set({ 
            quantity: sql`${schema.inventoryStockQuantity.quantity} - ${item.quantity}`,
            updatedAt: now 
          })
          .where(and(
            eq(schema.inventoryStockQuantity.locationId, fromLocationId),
            eq(schema.inventoryStockQuantity.stockId, item.stockId)
          ))
      );

      // 5. Update To Location Stock (Increase/Upsert)
      queries.push(
        db.insert(schema.inventoryStockQuantity)
          .values({
            locationId: toLocationId,
            stockId: item.stockId,
            quantity: item.quantity,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [schema.inventoryStockQuantity.locationId, schema.inventoryStockQuantity.stockId],
            set: { 
              quantity: sql`${schema.inventoryStockQuantity.quantity} + ${item.quantity}`,
              updatedAt: now 
            }
          })
      );

      // 6. Log Transactions
      queries.push(
        db.insert(schema.configTransactionLog).values({
          id: crypto.randomUUID(),
          stockId: item.stockId,
          locationId: fromLocationId,
          transactionType: 'TRANSFER_OUT',
          referenceId: transferId,
          quantityChange: -item.quantity,
          balanceAfter: 0, // In a real scenario, calculate this
          createdAt: now,
        })
      );

      queries.push(
        db.insert(schema.configTransactionLog).values({
          id: crypto.randomUUID(),
          stockId: item.stockId,
          locationId: toLocationId,
          transactionType: 'TRANSFER_IN',
          referenceId: transferId,
          quantityChange: item.quantity,
          balanceAfter: 0,
          createdAt: now,
        })
      );
    }

    await db.batch(queries as any);

    return c.json({ success: true, data: { id: transferId, transferNo } });
  } catch (err: any) {
    console.error(err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default transferAPI;
