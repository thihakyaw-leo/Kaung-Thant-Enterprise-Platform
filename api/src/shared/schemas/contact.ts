import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  creditLimit: z.number().nonnegative().default(0),
  statusId: z.string().uuid().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  statusId: z.string().uuid().optional(),
});

export const agentSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
  commissionRate: z.number().min(0).max(100).default(0),
  statusId: z.string().uuid().optional(),
});
