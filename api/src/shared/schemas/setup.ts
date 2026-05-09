import { z } from 'zod';

export const locationSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  statusId: z.string().uuid().optional(),
});

export const taxSchema = z.object({
  name: z.string().min(2),
  ratePercent: z.number().min(0).max(100),
  statusId: z.string().uuid().optional(),
});

export const currencySchema = z.object({
  code: z.string().length(3), // ISO 4217 e.g., MMK, USD
  name: z.string().min(2),
  symbol: z.string().min(1),
  exchangeRate: z.number().positive().default(1.0),
  isDefault: z.boolean().default(false),
  statusId: z.string().uuid().optional(),
});
