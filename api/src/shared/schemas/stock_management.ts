import { z } from 'zod';

export const stockTransferSchema = z.object({
  fromLocationId: z.string().uuid(),
  toLocationId: z.string().uuid(),
  items: z.array(z.object({
    stockId: z.string().uuid(),
    quantity: z.number().positive(),
  })).min(1),
  reason: z.string().optional(),
});

export const stockAdjustSchema = z.object({
  locationId: z.string().uuid(),
  stockId: z.string().uuid(),
  type: z.enum(['IN', 'OUT']),
  quantity: z.number().positive(),
  reason: z.string().optional(),
});
