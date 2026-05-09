import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  subdomain: text('subdomain').notNull().unique(),
  d1_database_id: text('d1_database_id').notNull(),
  plan_id: text('plan_id').notNull().default('basic'),
  status: text('status').notNull().default('active'),
  ownerUsername: text('owner_username'),
  ownerPassword: text('owner_password'),
  managerUsername: text('manager_username'),
  managerPassword: text('manager_password'),
  cashierUsername: text('cashier_username'),
  cashierPassword: text('cashier_password'),
  createdAt: integer('created_at').notNull()
});

// Pricing Plans Table
export const pricingPlans = sqliteTable('pricing_plans', {
  id: text('id').primaryKey(), // starter, professional, enterprise
  name: text('name').notNull(),
  price: real('price').notNull(),
  currency: text('currency').notNull().default('MMK'),
  billingCycle: text('billing_cycle').notNull(), // monthly, yearly
  maxUsers: integer('max_users').notNull(),
  maxProducts: integer('max_products').notNull(),
  features: text('features').notNull(), // JSON string
});

// Subscription Tracking
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  planId: text('plan_id').notNull().references(() => pricingPlans.id),
  startDate: integer('start_date').notNull(),
  endDate: integer('end_date').notNull(),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull().default(true),
  status: text('status').notNull().default('active'),
});

// Invoices Table
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull().references(() => tenants.id),
  subscriptionId: text('subscription_id').notNull().references(() => subscriptions.id),
  amount: real('amount').notNull(),
  status: text('status').notNull().default('unpaid'),
  issuedDate: integer('issued_date').notNull(),
  dueDate: integer('due_date').notNull(),
  paidDate: integer('paid_date'),
});

export const saasUsers = sqliteTable('saas_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'admin', 'super_admin'
  status: text('status').notNull().default('active'),
  avatarUrl: text('avatar_url'),
  permissions: text('permissions'), // JSON string of permission keys
  lastLoginAt: integer('last_login_at'),
  lastActivityAt: integer('last_activity_at'),
  createdAt: integer('created_at').notNull()
});

export const systemSettings = sqliteTable('system_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  category: text('category').notNull(),
  updatedAt: integer('updated_at').notNull()
});

// Audit Logs Table — records all significant platform events for Security & Compliance
export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  actor: text('actor').notNull(),
  target: text('target').notNull(),
  ipAddress: text('ip_address').notNull().default('internal'),
  status: text('status').notNull().default('success'), // 'success' | 'warning' | 'failed'
  metadata: text('metadata'), // optional JSON string for extra context
  createdAt: integer('created_at').notNull(),
});

