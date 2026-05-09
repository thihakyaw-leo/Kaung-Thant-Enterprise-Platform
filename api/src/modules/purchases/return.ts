import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql, and } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import type { Env } from '../../index';

const purchaseReturnAPI = new Hono<{ Bindings: Env }>();

/**
 * 1. GET ALL PURCHASE RETURNS
 */
purchaseReturnAPI.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const returns = await db.select({
    id: schema.purchaseReturn.id,
    returnNo: schema.purchaseReturn.returnNo,
    totalAmount: schema.purchaseReturn.totalAmount,
    transactionDate: schema.purchaseReturn.transactionDate,
    supplierName: schema.purchaseSupplier.name,
    locationName: schema.setupLocation.name,
    status: schema.setupStatus.name,
  })
  .from(schema.purchaseReturn)
  .leftJoin(schema.purchaseSupplier, eq(schema.purchaseReturn.supplierId, schema.purchaseSupplier.id))
  .leftJoin(schema.setupLocation, eq(schema.purchaseReturn.locationId, schema.setupLocation.id))
  .leftJoin(schema.setupStatus, eq(schema.purchaseReturn.statusId, schema.setupStatus.id))
  .orderBy(desc(schema.purchaseReturn.transactionDate))
  .all();

  return c.json({ success: true, data: returns });
});

/**
 * 2. GET SINGLE PURCHASE RETURN DETAIL
 */
purchaseReturnAPI.get('/:id', async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id');

  const returnHeader = await db.select()
    .from(schema.purchaseReturn)
    .where(eq(schema.purchaseReturn.id, id))
    .get();

  if (!returnHeader) return c.json({ success: false, error: 'Return not found' }, 404);

  const details = await db.select({
    id: schema.purchaseReturnDetail.id,
    stockId: schema.purchaseReturnDetail.stockId,
    productName: schema.inventoryStock.name,
    productCode: schema.inventoryStock.code,
    quantity: schema.purchaseReturnDetail.quantity,
    unitCost: schema.purchaseReturnDetail.unitCost,
    totalCost: schema.purchaseReturnDetail.totalCost,
  })
  .from(schema.purchaseReturnDetail)
  .leftJoin(schema.inventoryStock, eq(schema.purchaseReturnDetail.stockId, schema.inventoryStock.id))
  .where(eq(schema.purchaseReturnDetail.returnId, id))
  .all();

  return c.json({ success: true, data: { ...returnHeader, details } });
});

/**
 * 3. CREATE PURCHASE RETURN (With Stock Reduction)
 */
purchaseReturnAPI.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { purchaseId, locationId, supplierId, items, reason, transactionDate } = body;

  const returnId = crypto.randomUUID();
  const returnNo = `PR-${Date.now()}`; // Simplified PR number

  try {
    const queries = [];

    // 1. Insert Return Header
    queries.push(
      db.insert(schema.purchaseReturn).values({
        id: returnId,
        returnNo,
        purchaseId,
        locationId,
        supplierId,
        reason,
        totalAmount: items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitCost), 0),
        transactionDate: transactionDate || Math.floor(Date.now() / 1000),
        statusId: 'completed',
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000),
      })
    );

    for (const item of items) {
      const detailId = crypto.randomUUID();
      
      // 2. Insert Details
      queries.push(
        db.insert(schema.purchaseReturnDetail).values({
          id: detailId,
          returnId,
          stockId: item.stockId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          createdAt: Math.floor(Date.now() / 1000),
        })
      );

      // 3. Update Stock (Reduce Quantity)
      queries.push(
        db.update(schema.inventoryStockQuantity)
          .set({ 
            quantity: sql`${schema.inventoryStockQuantity.quantity} - ${item.quantity}`,
            updatedAt: Math.floor(Date.now() / 1000)
          })
          .where(and(
            eq(schema.inventoryStockQuantity.locationId, locationId),
            eq(schema.inventoryStockQuantity.stockId, item.stockId)
          ))
      );

      // 4. Log Transaction
      queries.push(
        db.insert(schema.configTransactionLog).values({
          id: crypto.randomUUID(),
          stockId: item.stockId,
          locationId,
          transactionType: 'PURCHASE_RETURN',
          referenceId: returnId,
          quantityChange: -item.quantity,
          balanceAfter: 0, // In a real system, you'd calculate this or use a trigger
          createdAt: Math.floor(Date.now() / 1000),
        })
      );
    }

    await db.batch(queries as any);

    return c.json({ success: true, data: { id: returnId, returnNo } });
  } catch (err: any) {
    console.error(err);
    return c.json({ success: false, error: err.message }, 500);
  }
});

export default purchaseReturnAPI;
