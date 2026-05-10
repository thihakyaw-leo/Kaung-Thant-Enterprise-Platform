import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
});

export const posLoginSchema = z.object({
  subdomain: z.string(),
  username: z.string(),
  password: z.string(),
});
