import { z } from 'zod';

export const checkoutItemSchema = z.object({
  stockId: z.string().uuid(),
  locationId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

export const checkoutSchema = z.object({
  customerId: z.string().uuid().optional().nullable(),
  locationId: z.string().uuid(),
  currencyId: z.string().uuid().optional(),
  items: z.array(checkoutItemSchema).min(1),
  totalAmount: z.number().nonnegative(),
  taxAmount: z.number().nonnegative().default(0),
  discountAmount: z.number().nonnegative().default(0),
  payableAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  changeAmount: z.number().nonnegative().default(0),
  paymentMethod: z.string().default('cash'),
});
