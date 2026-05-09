CREATE TABLE `t_config_auditlog` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`module` text NOT NULL,
	`reference_id` text,
	`old_value` text,
	`new_value` text,
	`ip_address` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `t_config_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_config_role` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`permissions` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_config_role_name_unique` ON `t_config_role` (`name`);--> statement-breakpoint
CREATE TABLE `t_config_transactionlog` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_id` text,
	`location_id` text,
	`transaction_type` text NOT NULL,
	`reference_id` text,
	`quantity_change` real NOT NULL,
	`balance_after` real NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_config_user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`password_hash` text NOT NULL,
	`full_name` text,
	`status_id` text,
	`last_login` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_config_user_username_unique` ON `t_config_user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `t_config_user_email_unique` ON `t_config_user` (`email`);--> statement-breakpoint
CREATE TABLE `t_config_userrole` (
	`user_id` text,
	`role_id` text,
	`created_at` integer NOT NULL,
	`created_by` text,
	PRIMARY KEY(`user_id`, `role_id`),
	FOREIGN KEY (`user_id`) REFERENCES `t_config_user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `t_config_role`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_inventory_category` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`parent_id`) REFERENCES `t_inventory_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_inventory_stock` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`category_id` text,
	`unit_id` text,
	`stock_type_id` text,
	`tax_id` text,
	`image_url` text,
	`status_id` text,
	`avg_cost` real DEFAULT 0,
	`last_cost` real DEFAULT 0,
	`reorder_level` real DEFAULT 0,
	`is_deleted` integer DEFAULT false,
	`deleted_at` integer,
	`deleted_by` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`category_id`) REFERENCES `t_inventory_category`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`unit_id`) REFERENCES `t_inventory_unit`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_type_id`) REFERENCES `t_inventory_stocktype`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tax_id`) REFERENCES `t_setup_tax`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_inventory_stock_code_unique` ON `t_inventory_stock` (`code`);--> statement-breakpoint
CREATE TABLE `tx_inventory_stockadjust` (
	`id` text PRIMARY KEY NOT NULL,
	`adjust_no` text NOT NULL,
	`location_id` text,
	`stock_id` text,
	`type` text NOT NULL,
	`quantity` real DEFAULT 0,
	`reason` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tx_inventory_stockadjust_adjust_no_unique` ON `tx_inventory_stockadjust` (`adjust_no`);--> statement-breakpoint
CREATE TABLE `t_inventory_stockbarcode` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_id` text,
	`barcode` text NOT NULL,
	`is_primary` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_inventory_stockbarcode_barcode_unique` ON `t_inventory_stockbarcode` (`barcode`);--> statement-breakpoint
CREATE TABLE `t_inventory_stockprice` (
	`id` text PRIMARY KEY NOT NULL,
	`stock_id` text,
	`price_type` text NOT NULL,
	`amount` real DEFAULT 0,
	`currency_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `t_setup_currency`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_inventory_stockquantity` (
	`location_id` text,
	`stock_id` text,
	`quantity` real DEFAULT 0,
	`updated_at` integer NOT NULL,
	`updated_by` text,
	PRIMARY KEY(`location_id`, `stock_id`),
	FOREIGN KEY (`location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_inventory_stocktype` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_inventory_stocktype_name_unique` ON `t_inventory_stocktype` (`name`);--> statement-breakpoint
CREATE TABLE `tx_inventory_transfer` (
	`id` text PRIMARY KEY NOT NULL,
	`transfer_no` text NOT NULL,
	`from_location_id` text,
	`to_location_id` text,
	`status_id` text,
	`transaction_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`from_location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tx_inventory_transfer_transfer_no_unique` ON `tx_inventory_transfer` (`transfer_no`);--> statement-breakpoint
CREATE TABLE `tx_inventory_transferdetail` (
	`id` text PRIMARY KEY NOT NULL,
	`transfer_id` text,
	`stock_id` text,
	`quantity` real DEFAULT 0,
	`is_deleted` integer DEFAULT false,
	`deleted_at` integer,
	`deleted_by` text,
	`created_at` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`transfer_id`) REFERENCES `tx_inventory_transfer`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_inventory_unit` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`short_name` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE TABLE `tx_purchase_purchase` (
	`id` text PRIMARY KEY NOT NULL,
	`grn_no` text NOT NULL,
	`location_id` text,
	`supplier_id` text,
	`currency_id` text,
	`total_amount` real DEFAULT 0,
	`tax_amount` real DEFAULT 0,
	`paid_amount` real DEFAULT 0,
	`status_id` text,
	`transaction_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`supplier_id`) REFERENCES `t_purchase_supplier`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `t_setup_currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tx_purchase_purchase_grn_no_unique` ON `tx_purchase_purchase` (`grn_no`);--> statement-breakpoint
CREATE TABLE `tx_purchase_purchasedetail` (
	`id` text PRIMARY KEY NOT NULL,
	`purchase_id` text,
	`stock_id` text,
	`quantity` real DEFAULT 0,
	`unit_cost` real DEFAULT 0,
	`total_cost` real DEFAULT 0,
	`created_at` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`purchase_id`) REFERENCES `tx_purchase_purchase`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_purchase_supplier` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`balance` real DEFAULT 0,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_sale_customer` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`email` text,
	`address` text,
	`credit_limit` real DEFAULT 0,
	`balance` real DEFAULT 0,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tx_sale_delivery` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`sale_id` text NOT NULL,
	`provider_id` text,
	`delivery_address` text,
	`recipient_name` text,
	`recipient_phone` text,
	`delivery_fee` real DEFAULT 0,
	`tracking_number` text,
	`delivery_status` text DEFAULT 'Pending',
	`dispatch_time` integer,
	`delivered_time` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`sale_id`) REFERENCES `tx_sale_sale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`provider_id`) REFERENCES `t_setup_deliveryprovider`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tx_sale_delivery_sale_id_unique` ON `tx_sale_delivery` (`sale_id`);--> statement-breakpoint
CREATE TABLE `tx_sale_refund` (
	`id` text PRIMARY KEY NOT NULL,
	`refund_no` text NOT NULL,
	`sale_id` text,
	`refund_amount` real DEFAULT 0,
	`reason` text,
	`created_at` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`sale_id`) REFERENCES `tx_sale_sale`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tx_sale_refund_refund_no_unique` ON `tx_sale_refund` (`refund_no`);--> statement-breakpoint
CREATE TABLE `tx_sale_sale` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice_no` text NOT NULL,
	`location_id` text,
	`customer_id` text,
	`currency_id` text,
	`total_amount` real DEFAULT 0,
	`tax_amount` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`payable_amount` real DEFAULT 0,
	`paid_amount` real DEFAULT 0,
	`change_amount` real DEFAULT 0,
	`payment_method` text,
	`status_id` text,
	`transaction_date` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`location_id`) REFERENCES `t_setup_location`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `t_sale_customer`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`currency_id`) REFERENCES `t_setup_currency`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tx_sale_sale_invoice_no_unique` ON `tx_sale_sale` (`invoice_no`);--> statement-breakpoint
CREATE TABLE `tx_sale_saledetail` (
	`id` text PRIMARY KEY NOT NULL,
	`sale_id` text,
	`stock_id` text,
	`quantity` real DEFAULT 0,
	`unit_price` real DEFAULT 0,
	`total_price` real DEFAULT 0,
	`discount_amount` real DEFAULT 0,
	`created_at` integer NOT NULL,
	`created_by` text,
	FOREIGN KEY (`sale_id`) REFERENCES `tx_sale_sale`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`stock_id`) REFERENCES `t_inventory_stock`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tx_sale_shift` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`start_time` integer NOT NULL,
	`end_time` integer,
	`opening_balance` real DEFAULT 0,
	`closing_balance` real DEFAULT 0,
	`actual_closing_balance` real DEFAULT 0,
	`status` text DEFAULT 'Open',
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `t_config_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_setup_currency` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`symbol` text,
	`exchange_rate` real DEFAULT 1,
	`is_default` integer DEFAULT false,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_setup_currency_code_unique` ON `t_setup_currency` (`code`);--> statement-breakpoint
CREATE TABLE `t_setup_deliveryprovider` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`phone` text,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_setup_deliveryprovider_tenant_id_name_unique` ON `t_setup_deliveryprovider` (`tenant_id`,`name`);--> statement-breakpoint
CREATE TABLE `t_setup_location` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`address` text,
	`phone` text,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_setup_status` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `t_setup_status_name_unique` ON `t_setup_status` (`name`);--> statement-breakpoint
CREATE TABLE `t_setup_tax` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`rate_percent` real DEFAULT 0,
	`status_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text,
	`updated_by` text,
	FOREIGN KEY (`status_id`) REFERENCES `t_setup_status`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `t_setup_webhook` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`event_type` text NOT NULL,
	`secret` text,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text
);
