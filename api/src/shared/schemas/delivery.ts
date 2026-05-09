import { z } from 'zod';

export const deliveryProviderSchema = z.object({
  name: z.string().min(2),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  statusId: z.string().uuid().optional(),
});

export const saleDeliverySchema = z.object({
  saleId: z.string().uuid(),
  providerId: z.string().uuid().optional(),
  deliveryAddress: z.string().min(5),
  recipientName: z.string().min(2),
  recipientPhone: z.string().min(5),
  deliveryFee: z.number().nonnegative().default(0),
  trackingNumber: z.string().optional().nullable(),
  deliveryStatus: z.enum(['Pending', 'Dispatched', 'Delivered', 'Cancelled']).default('Pending'),
});
