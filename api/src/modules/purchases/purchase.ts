import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql, desc } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import type { Env } from '../../index';

const purchaseAPI = new Hono<{ Bindings: Env & { SECRET: SecretsStoreSecret } }>();

/**
 * LIST PURCHASES
 */
purchaseAPI.get('/', async (c) => {
  const db = drizzle(c.env.DB);
  const purchases = await db.select({
    id: schema.purchasePurchase.id,
    grnNo: schema.purchasePurchase.grnNo,
    locationName: schema.setupLocation.name,
    supplierName: schema.purchaseSupplier.name,
    totalAmount: schema.purchasePurchase.totalAmount,
    statusId: schema.purchasePurchase.statusId,
    transactionDate: schema.purchasePurchase.transactionDate,
  })
  .from(schema.purchasePurchase)
  .leftJoin(schema.setupLocation, eq(schema.purchasePurchase.locationId, schema.setupLocation.id))
  .leftJoin(schema.purchaseSupplier, eq(schema.purchasePurchase.supplierId, schema.purchaseSupplier.id))
  .orderBy(desc(schema.purchasePurchase.transactionDate));

  return c.json({ success: true, data: purchases });
});

/**
 * GET PURCHASE DETAILS
 */
purchaseAPI.get('/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);
  
  const purchase = await db.select()
    .from(schema.purchasePurchase)
    .where(eq(schema.purchasePurchase.id, id))
    .get();

  if (!purchase) {
    return c.json({ success: false, error: 'Purchase not found' }, 404);
  }

  const items = await db.select({
    id: schema.purchasePurchaseDetail.id,
    stockId: schema.purchasePurchaseDetail.stockId,
    stockName: schema.inventoryStock.name,
    quantity: schema.purchasePurchaseDetail.quantity,
    unitCost: schema.purchasePurchaseDetail.unitCost,
    totalCost: schema.purchasePurchaseDetail.totalCost,
  })
  .from(schema.purchasePurchaseDetail)
  .leftJoin(schema.inventoryStock, eq(schema.purchasePurchaseDetail.stockId, schema.inventoryStock.id))
  .where(eq(schema.purchasePurchaseDetail.purchaseId, id));

  return c.json({ success: true, data: { ...purchase, items } });
});

/**
 * CREATE PURCHASE (RECEIVE STOCK)
 */
purchaseAPI.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const { items, supplierId, locationId, userId, referenceNo, totalAmount, taxAmount, paidAmount } = body;
  
  const now = Math.floor(Date.now() / 1000);
  const purchaseId = crypto.randomUUID();

  try {
    const operations: any[] = [];

    // 1. Create Purchase Header
    operations.push(
      db.insert(schema.purchasePurchase).values({
        id: purchaseId,
        grnNo: referenceNo || `GRN-${now}`, 
        supplierId,
        locationId,
        totalAmount: totalAmount || 0,
        taxAmount: taxAmount || 0,
        paidAmount: paidAmount || 0,
        statusId: 'completed',
        transactionDate: now,
        createdAt: now,
        updatedAt: now,
        createdBy: userId
      })
    );

    // 2. Process each item
    for (const item of items) {
      const detailId = crypto.randomUUID();
      operations.push(
        db.insert(schema.purchasePurchaseDetail).values({
          id: detailId,
          purchaseId,
          stockId: item.id,
          quantity: item.qty,
          unitCost: item.costPrice,
          totalCost: item.costPrice * item.qty,
          createdAt: now,
          createdBy: userId
        })
      );

      // Update Stock Quantity (+)
      operations.push(
        db.update(schema.inventoryStockQuantity)
          .set({ 
            quantity: sql`${schema.inventoryStockQuantity.quantity} + ${item.qty}`,
            updatedAt: now 
          })
          .where(and(
            eq(schema.inventoryStockQuantity.stockId, item.id),
            eq(schema.inventoryStockQuantity.locationId, locationId)
          ))
      );

      // Update Last Cost in Stock Master
      operations.push(
        db.update(schema.inventoryStock)
          .set({ lastCost: item.costPrice, updatedAt: now })
          .where(eq(schema.inventoryStock.id, item.id))
      );

      // Log Transaction
      operations.push(
        db.insert(schema.configTransactionLog).values({
          id: crypto.randomUUID(),
          stockId: item.id,
          locationId,
          transactionType: 'PURCHASE',
          referenceId: referenceNo || purchaseId,
          quantityChange: item.qty,
          balanceAfter: 0, // Should be calculated if needed
          createdAt: now,
          createdBy: userId
        })
      );
    }

    await db.batch(operations as any);
    return c.json({ success: true, data: { id: purchaseId } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

/**
 * DELETE PURCHASE (REVERSE STOCK)
 */
purchaseAPI.delete('/:id', async (c) => {
  const id = c.req.param('id');
  const db = drizzle(c.env.DB);
  
  try {
    const purchase = await db.select().from(schema.purchasePurchase).where(eq(schema.purchasePurchase.id, id)).get();
    if (!purchase) return c.json({ success: false, error: 'Not found' }, 404);

    const items = await db.select().from(schema.purchasePurchaseDetail).where(eq(schema.purchasePurchaseDetail.purchaseId, id));
    const operations: any[] = [];

    for (const item of items) {
      // Reverse Stock Quantity (-)
      operations.push(
        db.update(schema.inventoryStockQuantity)
          .set({ 
            quantity: sql`${schema.inventoryStockQuantity.quantity} - ${item.quantity}`,
            updatedAt: Math.floor(Date.now() / 1000) 
          })
          .where(and(
            eq(schema.inventoryStockQuantity.stockId, item.stockId!),
            eq(schema.inventoryStockQuantity.locationId, purchase.locationId!)
          ))
      );
    }

    // Delete details and header
    operations.push(db.delete(schema.purchasePurchaseDetail).where(eq(schema.purchasePurchaseDetail.purchaseId, id)));
    operations.push(db.delete(schema.purchasePurchase).where(eq(schema.purchasePurchase.id, id)));

    await db.batch(operations as any);
    return c.json({ success: true, data: { id } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, error: message }, 500);
  }
});

export default purchaseAPI;
