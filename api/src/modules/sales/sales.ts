import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, and, desc } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import { checkoutSchema } from '../../shared/schemas/sales';
import { Env } from '../../index';
import { hasPermission } from '../../shared/middleware/permissions';
import { trackTransaction } from '../../shared/utils/analytics';
import { KVSettingsService } from '../config/kv_settings';

const salesAPI = new Hono<{ 
  Bindings: Env,
  Variables: { userId: string }
}>();

/**
 * CHECKOUT (POS Transaction)
 */
salesAPI.post('/checkout', hasPermission('sales.create'), async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();
  const settingsService = new KVSettingsService(c.env);
  const taxSettings = await settingsService.getTaxSettings();
  
  const validation = checkoutSchema.safeParse(body);

  if (!validation.success) {
    return c.json({ success: false, data: null, error: validation.error.message }, 400);
  }

  const { items, ...saleData } = validation.data;
  
  // Apply dynamic tax if enabled in KV
  let finalTaxAmount = saleData.taxAmount || 0;
  if (taxSettings.enabled && !saleData.taxAmount) {
    finalTaxAmount = (saleData.totalAmount * taxSettings.rate) / 100;
  }

  const saleId = crypto.randomUUID();
  const invoiceNo = `INV-${Date.now()}`;
  const now = Math.floor(Date.now() / 1000);

  try {
    // 1. Prepare Batch Statements
    const statements: any[] = [];

    // A. Insert Sale Header
    statements.push(db.insert(schema.saleSale).values([{
      id: saleId,
      invoiceNo,
      ...saleData,
      taxAmount: finalTaxAmount,
      transactionDate: now,
      createdAt: now,
      updatedAt: now,
    }]));

    // B. Process Items
    for (const item of items) {
      const detailId = crypto.randomUUID();
      const totalPrice = item.quantity * item.unitPrice;

      // Detail record
      statements.push(db.insert(schema.saleSaleDetail).values({
        id: detailId,
        saleId,
        stockId: item.stockId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        createdAt: now,
      }));

      // Update Quantity (Note: In batch, we can't easily read current qty and update in one go without subqueries or separate steps)
      // For robustness, we'll use a single update statement with math
      statements.push(db.update(schema.inventoryStockQuantity)
        .set({ 
          quantity: sql`${schema.inventoryStockQuantity.quantity} - ${item.quantity}`, 
          updatedAt: now 
        })
        .where(and(
          eq(schema.inventoryStockQuantity.stockId, item.stockId),
          eq(schema.inventoryStockQuantity.locationId, item.locationId)
        ))
      );

      // Log Transaction
      statements.push(db.insert(schema.configTransactionLog).values({
        id: crypto.randomUUID(),
        stockId: item.stockId,
        locationId: item.locationId,
        transactionType: 'SALE',
        referenceId: saleId,
        quantityChange: -item.quantity,
        balanceAfter: sql`(SELECT quantity FROM ${schema.inventoryStockQuantity} WHERE stock_id = ${item.stockId} AND location_id = ${item.locationId})`,
        createdAt: now,
      }));
    }

    // 2. Execute Batch
    await db.batch(statements as any);

    // 3. ARCHIVE TO R2 & ANALYTICS
    const archivePath = `receipts/${new Date().getFullYear()}/${invoiceNo}.json`;
    const archivePromise = c.env.R2_ARCHIVE.put(archivePath, JSON.stringify({ saleId, invoiceNo, ...body }));
    
    const analyticsPromise = trackTransaction(c.env, {
      type: 'SALE',
      amount: body.total_amount,
      paymentMethod: body.payment_method,
      locationId: body.items[0]?.locationId || 'default',
      userId: c.get('userId')
    });

    c.executionCtx.waitUntil(Promise.all([archivePromise, analyticsPromise]).catch(err => {
      console.error('Post-transaction background tasks failed:', err);
    }));

    return c.json({ 
      success: true, 
      data: { saleId, invoiceNo }, 
      error: null 
    });
  } catch (error: unknown) {
    console.error('Checkout Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ success: false, data: null, error: message }, 500);
  }
});

salesAPI.get('/history', hasPermission('sales.view'), async (c) => {
  const db = drizzle(c.env.DB);
  const sales = await db.select().from(schema.saleSale).orderBy(desc(schema.saleSale.createdAt));
  return c.json({ success: true, data: sales, error: null });
});

salesAPI.get('/:id', hasPermission('sales.view'), async (c) => {
  const db = drizzle(c.env.DB);
  const id = c.req.param('id') as string;
  const sale = await db.select().from(schema.saleSale).where(eq(schema.saleSale.id, id)).get();
  if (!sale) return c.json({ success: false, data: null, error: 'Sale not found' }, 404);
  const details = await db.select().from(schema.saleSaleDetail).where(eq(schema.saleSaleDetail.saleId, id));
  return c.json({ success: true, data: { ...sale, details }, error: null });
});

export default salesAPI;
