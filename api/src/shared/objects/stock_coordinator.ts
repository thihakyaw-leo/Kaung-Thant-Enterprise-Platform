import { DurableObject } from 'cloudflare:workers';
import { Env } from '../../index';

/**
 * Durable Object for Real-time Stock Coordination
 * Ensures all terminals at a location see consistent stock levels.
 */
export class LocationStockCoordinator extends DurableObject<Env> {
  private stockLevels: Map<string, number> = new Map();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    // Initialize from storage if needed
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get<Record<string, number>>('stock');
      if (stored) {
        this.stockLevels = new Map(Object.entries(stored));
      }
    });
  }

  /**
   * Atomic Stock Operations
   */
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.searchParams.get('action'); // 'get', 'increment', 'decrement'
    const stockId = url.searchParams.get('stockId');

    if (!stockId) return new Response('Missing stockId', { status: 400 });

    return await this.ctx.storage.transaction(async (tx) => {
      const currentStock = (await tx.get<number>(`stock:${stockId}`)) || 0;
      let newStock = currentStock;

      if (action === 'increment') {
        const { quantity } = (await request.json()) as { quantity: number };
        newStock = currentStock + quantity;
        await tx.put(`stock:${stockId}`, newStock);
      } else if (action === 'decrement') {
        const { quantity } = (await request.json()) as { quantity: number };
        // POS Logic: Allow negative if needed, or prevent here
        if (currentStock < quantity) {
           // Low stock warning logic could go here
        }
        newStock = currentStock - quantity;
        await tx.put(`stock:${stockId}`, newStock);
      }

      return Response.json({ 
        stockId, 
        balance: newStock,
        timestamp: Date.now()
      });
    });
  }
}
