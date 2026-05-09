import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2),
  parentId: z.string().uuid().optional().nullable(),
  statusId: z.string().uuid().optional(),
});

export const unitSchema = z.object({
  name: z.string().min(1),
  shortName: z.string().min(1),
});

export const stockSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(2),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  unitId: z.string().uuid().optional(),
  stockTypeId: z.string().uuid().optional(),
  taxId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional().nullable(),
  avgCost: z.number().nonnegative().default(0),
  lastCost: z.number().nonnegative().default(0),
  reorderLevel: z.number().nonnegative().default(0),
});

export const stockPriceSchema = z.object({
  stockId: z.string().uuid(),
  priceType: z.string().min(1), // e.g., Retail, Wholesale
  amount: z.number().positive(),
  currencyId: z.string().uuid(),
});

export const stockBarcodeSchema = z.object({
  stockId: z.string().uuid(),
  barcode: z.string().min(1),
  isPrimary: z.boolean().default(false),
});
