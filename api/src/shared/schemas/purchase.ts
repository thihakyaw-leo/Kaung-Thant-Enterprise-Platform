import { z } from 'zod';

export const purchaseItemSchema = z.object({
  stockId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().positive(),
  unitCost: z.number().nonnegative(),
});

export const purchaseSchema = z.object({
  supplierId: z.string().uuid(),
  locationId: z.string().uuid(),
  currencyId: z.string().uuid().optional(),
  items: z.array(purchaseItemSchema).min(1),
  totalAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  statusId: z.string().uuid().optional(),
  transactionDate: z.number().optional(),
});
