-- Create Master Tables
CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subdomain TEXT NOT NULL UNIQUE,
  d1_database_id TEXT NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'active',
  owner_username TEXT,
  owner_password TEXT,
  manager_username TEXT,
  manager_password TEXT,
  cashier_username TEXT,
  cashier_password TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'MMK',
  billing_cycle TEXT NOT NULL,
  max_users INTEGER NOT NULL,
  max_products INTEGER NOT NULL,
  features TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  plan_id TEXT NOT NULL REFERENCES pricing_plans(id),
  start_date INTEGER NOT NULL,
  end_date INTEGER NOT NULL,
  auto_renew INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id),
  amount REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'unpaid',
  issued_date INTEGER NOT NULL,
  due_date INTEGER NOT NULL,
  paid_date INTEGER
);

-- FIX #2: Renamed from global_users → saas_users (was Bug #2 - table mismatch)
DROP TABLE IF EXISTS saas_users;
CREATE TABLE IF NOT EXISTS saas_users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  permissions TEXT,
  last_login_at INTEGER,
  last_activity_at INTEGER,
  created_at INTEGER NOT NULL
);

-- Seed Initial Data
INSERT OR IGNORE INTO saas_users (id, email, full_name, password_hash, role, status, last_login_at, last_activity_at, created_at) VALUES 
('admin_1', 'admin@kinetic.io', 'Super Admin', '$2b$10$YourHashedPasswordHere', 'super_admin', 'active', 1714759200, 1714759200, 1714759200);

INSERT OR IGNORE INTO pricing_plans (id, name, price, currency, billing_cycle, max_users, max_products, features) VALUES 
('basic', 'Starter', 0.0, 'MMK', 'monthly', 1, 500, '{"pos":true,"inventory":false,"analytics":false}'),
('standard', 'Retail Core', 50000.0, 'MMK', 'monthly', 3, 2000, '{"pos":true,"inventory":true,"analytics":false}'),
('professional', 'Business Pro', 150000.0, 'MMK', 'monthly', 10, 10000, '{"pos":true,"inventory":true,"analytics":true,"multi_location":true}'),
('enterprise', 'Enterprise Edge', 500000.0, 'MMK', 'monthly', 100, 1000000, '{"pos":true,"inventory":true,"analytics":true,"multi_location":true,"priority_support":true}');

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  category TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

INSERT OR IGNORE INTO system_settings (key, value, category, updated_at) VALUES 
-- Core Platform Settings
('platform_name', 'Kaung Thant POS', 'general', 1714759200),
('support_email', 'support@kinetic.io', 'general', 1714759200),
('platform_logo', 'https://kinetic.io/logo.png', 'general', 1714759200),
-- FIX #10: Added missing frontend settings
('platform_tagline', 'Enterprise POS for Myanmar', 'general', 1714759200),
('platform_description', 'Multi-tenant cloud POS platform for retail businesses across Myanmar', 'general', 1714759200),
('platform_phone', '+95 9 123 456 789', 'general', 1714759200),
('platform_address', 'No. 1, Pyay Road, Yangon, Myanmar', 'general', 1714759200),
-- Security Settings
('maintenance_mode', 'false', 'security', 1714759200),
('session_timeout', '1', 'security', 1714759200),
('two_factor_auth', 'false', 'security', 1714759200),
-- Localization Settings
('default_currency', 'MMK', 'localization', 1714759200),
('default_timezone', 'Asia/Yangon', 'localization', 1714759200),
('date_format', 'DD/MM/YYYY', 'localization', 1714759200),
-- Domain Settings
('primary_domain', 'pos.kinetic.io', 'domain', 1714759200),
('root_domain', 'kaungthant.shop', 'domain', 1714759200),
('custom_domain_enabled', 'true', 'domain', 1714759200),
('ssl_provider', 'Cloudflare', 'domain', 1714759200),
('reserved_subdomains', 'admin,api,www,saas,dev,status', 'domain', 1714759200),
('min_subdomain_length', '3', 'domain', 1714759200),
('max_subdomain_length', '20', 'domain', 1714759200),
-- Communication Settings
('smtp_host', 'smtp.sendgrid.net', 'communication', 1714759200),
('smtp_port', '587', 'communication', 1714759200),
('billing_support_email', 'billing@kinetic.io', 'communication', 1714759200),
-- Invoice Settings
('invoice_prefix', 'INV-', 'invoice', 1714759200),
('invoice_date_format', 'DD/MM/YYYY', 'invoice', 1714759200),
('next_sequence', '1001', 'invoice', 1714759200),
('sequence_padding', '4', 'invoice', 1714759200),
-- Tax Configuration
('tax_rate', '0', 'invoice', 1714759200),
('tax_label', 'Tax', 'invoice', 1714759200),
('tax_number', '', 'invoice', 1714759200),
-- Payment Terms
('payment_due_days', '30', 'invoice', 1714759200),
-- Bank / Payment Details
('bank_name', '', 'invoice', 1714759200),
('bank_account', '', 'invoice', 1714759200),
('bank_holder', '', 'invoice', 1714759200),
-- Invoice Footer Notes
('invoice_notes', 'Thank you for your business. Payment is due within the stated terms.', 'invoice', 1714759200),
-- Account Settings
('admin_name', 'Super Admin', 'account', 1714759200),
('admin_email', 'admin@kinetic.io', 'account', 1714759200),
('admin_avatar', '', 'account', 1714759200);

INSERT OR IGNORE INTO tenants (id, name, subdomain, d1_database_id, plan_id, status, created_at) VALUES 
('00000000-0000-0000-0000-000000000000', 'Main Office', 'main', 'DB_MAIN', 'enterprise', 'active', 1714759200);

-- FIX #8: Added initial subscription seed (was empty before)
INSERT OR IGNORE INTO subscriptions (id, tenant_id, plan_id, start_date, end_date, auto_renew, status) VALUES
('sub_main_001', '00000000-0000-0000-0000-000000000000', 'enterprise', 1714759200, 1746295200, 1, 'active');

-- Audit Logs Table (Security & Compliance tracking)
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  actor TEXT NOT NULL,
  target TEXT NOT NULL,
  ip_address TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'success',
  metadata TEXT,
  created_at INTEGER NOT NULL
);

-- Seed initial audit records
INSERT OR IGNORE INTO audit_logs (id, action, actor, target, ip_address, status, created_at) VALUES
('alog_001', 'platform_initialized', 'System', 'Master DB', 'internal', 'success', 1714759200),
('alog_002', 'admin_created', 'System', 'saas_users', 'internal', 'success', 1714759210),
('alog_003', 'pricing_plans_seeded', 'System', 'pricing_plans', 'internal', 'success', 1714759220),
('alog_004', 'tenant_created', 'System', 'tenants', 'internal', 'success', 1714759230),
('alog_005', 'subscription_initialized', 'System', 'subscriptions', 'internal', 'success', 1714759240);

