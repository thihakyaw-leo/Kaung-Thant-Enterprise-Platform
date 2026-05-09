import { drizzle } from 'drizzle-orm/d1';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';

export class InventorySyncService {
  constructor(private db: any) {}

  /**
   * ATOMIC STOCK ADJUSTMENT
   * Syncs quantity and logs transaction in a single atomic batch
   */
  async adjustStock(
    stockId: string, 
    locationId: string, 
    quantityDelta: number, 
    transactionType: 'SALE' | 'PURCHASE' | 'RETURN' | 'ADJUSTMENT',
    referenceId: string,
    userId: string
  ) {
    const now = Math.floor(Date.now() / 1000);

    try {
      await this.db.batch([
        // 1. Update Current Quantity in specific location
        this.db.update(schema.inventoryStockQuantity)
          .set({
            quantity: sql`${schema.inventoryStockQuantity.quantity} + ${quantityDelta}`,
            updatedAt: now
          })
          .where(and(
            eq(schema.inventoryStockQuantity.stockId, stockId),
            eq(schema.inventoryStockQuantity.locationId, locationId)
          )),

        // 2. Insert Transaction Log for Audit Trail
        this.db.insert(schema.configTransactionLog).values({
          id: crypto.randomUUID(),
          stockId,
          locationId,
          transactionType,
          referenceId,
          quantityChange: quantityDelta,
          balanceAfter: 0, // Should be calculated in real production using triggers or separate select
          createdAt: now,
          createdBy: userId
        })
      ]);
      return { success: true };
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Inventory Sync Error:', message);
      return { success: false, error: message };
    }
  }
}
