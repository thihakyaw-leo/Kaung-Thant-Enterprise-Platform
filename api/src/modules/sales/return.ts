import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, sql, and } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import type { Env } from '../../index';

const saleReturnAPI = new Hono<{ Bindings: Env }>();

/**
 * 1. GET ALL SALES RETURNS
 */
saleReturnAPI.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const returns = await db.select({
    id: schema.saleReturn.id,
    returnNo: schema.saleReturn.returnNo,
    customerName: schema.saleCustomer.name,
    locationName: schema.setupLocation.name,
    totalAmount: schema.saleReturn.totalAmount,
    transactionDate: schema.saleReturn.transactionDate,
    createdAt: schema.saleReturn.createdAt,
  })
  .from(schema.saleReturn)
  .leftJoin(schema.saleCustomer, eq(schema.saleReturn.customerId, schema.saleCustomer.id))
  .leftJoin(schema.setupLocation, eq(schema.saleReturn.locationId, schema.setupLocation.id))
  .orderBy(desc(schema.saleReturn.createdAt))
  .all();

  return c.json({ success: true, data: returns });
});

/**
 * 2. CREATE SALES RETURN
 */
saleReturnAPI.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { saleId, locationId, customerId, items, reason, transactionDate } = body;

  const returnId = crypto.randomUUID();
  const returnNo = `SRT-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    const queries = [];

    // 1. Insert Return Header
    queries.push(
      db.insert(schema.saleReturn).values({
        id: returnId,
        returnNo,
        saleId,
        locationId,
        customerId,
        reason,
        totalAmount: items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0),
        transactionDate: transactionDate || now,
        statusId: 'completed',
        createdAt: now,
        updatedAt: now,
      })
    );

    for (const item of items) {
      const detailId = crypto.randomUUID();

      // 2. Insert Detail
      queries.push(
        db.insert(schema.saleReturnDetail).values({
          id: detailId,
          returnId,
          stockId: item.stockId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          createdAt: now,
        })
      );

      // 3. Update Stock (Increase because it's a return)
      queries.push(
        db.insert(schema.inventoryStockQuantity)
          .values({
            locationId,
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

      // 4. Log Transaction
      queries.push(
        db.insert(schema.configTransactionLog).values({
          id: crypto.randomUUID(),
          stockId: item.stockId,
          locationId,
          transactionType: 'SALE_RETURN',
          referenceId: returnId,
          quantityChange: item.quantity,
          balanceAfter: 0,
          createdAt: now,
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

export default saleReturnAPI;
