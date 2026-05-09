CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`target` text NOT NULL,
	`ip_address` text DEFAULT 'internal' NOT NULL,
	`status` text DEFAULT 'success' NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`subscription_id` text NOT NULL,
	`amount` real NOT NULL,
	`status` text DEFAULT 'unpaid' NOT NULL,
	`issued_date` integer NOT NULL,
	`due_date` integer NOT NULL,
	`paid_date` integer,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pricing_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`currency` text DEFAULT 'MMK' NOT NULL,
	`billing_cycle` text NOT NULL,
	`max_users` integer NOT NULL,
	`max_products` integer NOT NULL,
	`features` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `saas_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`permissions` text,
	`last_login_at` integer,
	`last_activity_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `saas_users_email_unique` ON `saas_users` (`email`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`plan_id` text NOT NULL,
	`start_date` integer NOT NULL,
	`end_date` integer NOT NULL,
	`auto_renew` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`tenant_id`) REFERENCES `tenants`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `pricing_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `system_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`category` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subdomain` text NOT NULL,
	`d1_database_id` text NOT NULL,
	`plan_id` text DEFAULT 'basic' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`owner_username` text,
	`owner_password` text,
	`manager_username` text,
	`manager_password` text,
	`cashier_username` text,
	`cashier_password` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_subdomain_unique` ON `tenants` (`subdomain`);--> statement-breakpoint
CREATE TABLE `t_sale_customergroup` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`discount_percent` real DEFAULT 0,
	`min_points` integer DEFAULT 0,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `t_sale_customer` ADD `customer_group_id` text;--> statement-breakpoint
ALTER TABLE `t_sale_customer` ADD `loyalty_points` integer DEFAULT 0;