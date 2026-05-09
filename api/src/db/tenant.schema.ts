import { sqliteTable, text, integer, real, primaryKey, unique, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * 1. Setup & Status
 */
export const configSetting = sqliteTable('t_config_setting', {
  key: text('key').primaryKey(),
  value: text('value'),
  description: text('description'),
  updatedAt: integer('updated_at').notNull(),
  updatedBy: text('updated_by'),
});

export const setupStatus = sqliteTable('t_setup_status', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const setupLocation = sqliteTable('t_setup_location', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const setupCurrency = sqliteTable('t_setup_currency', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  symbol: text('symbol'),
  exchangeRate: real('exchange_rate').default(1.0),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const setupBusiness = sqliteTable('t_setup_business', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  taxNumber: text('tax_number'),
  logoUrl: text('logo_url'),
  currencyId: text('currency_id').references(() => setupCurrency.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  updatedBy: text('updated_by'),
});

export const setupTax = sqliteTable('t_setup_tax', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  ratePercent: real('rate_percent').default(0.0),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const setupWebhook = sqliteTable('t_setup_webhook', {
  id: text('id').primaryKey(),
  url: text('url').notNull(),
  eventType: text('event_type').notNull(),
  secret: text('secret'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
});

/**
 * 2. Auth & Audit
 */
export const configRole = sqliteTable('t_config_role', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  permissions: text('permissions'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const configUser = sqliteTable('t_config_user', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name'),
  statusId: text('status_id').references(() => setupStatus.id),
  lastLogin: integer('last_login'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const configUserRole = sqliteTable('t_config_userrole', {
  userId: text('user_id').references(() => configUser.id),
  roleId: text('role_id').references(() => configRole.id),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

export const saleShift = sqliteTable('tx_sale_shift', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => configUser.id),
  startTime: integer('start_time').notNull(),
  endTime: integer('end_time'),
  openingBalance: real('opening_balance').default(0.0),
  closingBalance: real('closing_balance').default(0.0),
  actualClosingBalance: real('actual_closing_balance').default(0.0),
  status: text('status').default('Open'),
  createdAt: integer('created_at').notNull(),
});

export const configAuditLog = sqliteTable('t_config_auditlog', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => configUser.id),
  action: text('action').notNull(),
  module: text('module').notNull(),
  referenceId: text('reference_id'),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  ipAddress: text('ip_address'),
  createdAt: integer('created_at').notNull(),
});

export const configTransactionLog = sqliteTable('t_config_transactionlog', {
  id: text('id').primaryKey(),
  stockId: text('stock_id').references(() => inventoryStock.id),
  locationId: text('location_id').references(() => setupLocation.id),
  transactionType: text('transaction_type').notNull(), // SALE, PURCHASE, ADJUST, TRANSFER
  referenceId: text('reference_id'),
  quantityChange: real('quantity_change').notNull(),
  balanceAfter: real('balance_after').notNull(),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
});

/**
 * 3. Inventory
 */
export const inventoryCategory = sqliteTable('t_inventory_category', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  parentId: text('parent_id').references((): any => inventoryCategory.id),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const inventoryUnit = sqliteTable('t_inventory_unit', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const inventoryStockType = sqliteTable('t_inventory_stocktype', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const inventoryStock = sqliteTable('t_inventory_stock', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  categoryId: text('category_id').references(() => inventoryCategory.id),
  unitId: text('unit_id').references(() => inventoryUnit.id),
  stockTypeId: text('stock_type_id').references(() => inventoryStockType.id),
  taxId: text('tax_id').references(() => setupTax.id),
  imageUrl: text('image_url'),
  statusId: text('status_id').references(() => setupStatus.id),
  avgCost: real('avg_cost').default(0.0),
  lastCost: real('last_cost').default(0.0),
  reorderLevel: real('reorder_level').default(0.0),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  deletedAt: integer('deleted_at'),
  deletedBy: text('deleted_by'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  codeIdx: index('stock_code_idx').on(table.code),
  nameIdx: index('stock_name_idx').on(table.name),
}));

export const inventoryStockQuantity = sqliteTable('t_inventory_stockquantity', {
  locationId: text('location_id').references(() => setupLocation.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  quantity: real('quantity').default(0.0),
  updatedAt: integer('updated_at').notNull(),
  updatedBy: text('updated_by'),
}, (table) => ({
  pk: primaryKey({ columns: [table.locationId, table.stockId] }),
  locationIdx: index('idx_stock_qty_location').on(table.locationId),
  stockIdx: index('idx_stock_qty_stock').on(table.stockId),
}));

export const inventoryStockPrice = sqliteTable('t_inventory_stockprice', {
  id: text('id').primaryKey(),
  stockId: text('stock_id').references(() => inventoryStock.id),
  priceType: text('price_type').notNull(),
  amount: real('amount').default(0.0),
  currencyId: text('currency_id').references(() => setupCurrency.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const inventoryStockBarcode = sqliteTable('t_inventory_stockbarcode', {
  id: text('id').primaryKey(),
  stockId: text('stock_id').references(() => inventoryStock.id),
  barcode: text('barcode').notNull().unique(),
  isPrimary: integer('is_primary', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const saleCustomerGroup = sqliteTable('t_sale_customergroup', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  discountPercent: real('discount_percent').default(0.0),
  minPoints: integer('min_points').default(0),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

/**
 * 4. Contacts
 */
export const saleCustomer = sqliteTable('t_sale_customer', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  customerGroupId: text('customer_group_id'),
  loyaltyPoints: integer('loyalty_points').default(0),
  creditLimit: real('credit_limit').default(0.0),
  balance: real('balance').default(0.0),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const purchaseSupplier = sqliteTable('t_purchase_supplier', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  balance: real('balance').default(0.0),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const saleAgent = sqliteTable('t_sale_agent', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  commissionRate: real('commission_rate').default(0.0),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

/**
 * 5. Transactions
 */
export const saleSale = sqliteTable('tx_sale_sale', {
  id: text('id').primaryKey(),
  invoiceNo: text('invoice_no').notNull().unique(),
  locationId: text('location_id').references(() => setupLocation.id),
  customerId: text('customer_id').references(() => saleCustomer.id),
  currencyId: text('currency_id').references(() => setupCurrency.id),
  totalAmount: real('total_amount').default(0.0),
  taxAmount: real('tax_amount').default(0.0),
  discountAmount: real('discount_amount').default(0.0),
  payableAmount: real('payable_amount').default(0.0),
  paidAmount: real('paid_amount').default(0.0),
  changeAmount: real('change_amount').default(0.0),
  paymentMethod: text('payment_method'),
  statusId: text('status_id').references(() => setupStatus.id),
  transactionDate: integer('transaction_date').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  dateIdx: index('sale_date_idx').on(table.transactionDate),
  locationIdx: index('sale_location_idx').on(table.locationId),
  invoiceIdx: index('sale_invoice_idx').on(table.invoiceNo),
}));

export const saleSaleDetail = sqliteTable('tx_sale_saledetail', {
  id: text('id').primaryKey(),
  saleId: text('sale_id').references(() => saleSale.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  quantity: real('quantity').default(0.0),
  unitPrice: real('unit_price').default(0.0),
  totalPrice: real('total_price').default(0.0),
  discountAmount: real('discount_amount').default(0.0),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
}, (table) => ({
  saleIdx: index('sale_detail_sale_idx').on(table.saleId),
  stockIdx: index('sale_detail_stock_idx').on(table.stockId),
}));

export const saleRefund = sqliteTable('tx_sale_refund', {
  id: text('id').primaryKey(),
  refundNo: text('refund_no').notNull().unique(),
  saleId: text('sale_id').references(() => saleSale.id),
  refundAmount: real('refund_amount').default(0.0),
  reason: text('reason'),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
});

export const saleReturn = sqliteTable('tx_sale_return', {
  id: text('id').primaryKey(),
  returnNo: text('return_no').notNull().unique(),
  saleId: text('sale_id').references(() => saleSale.id),
  locationId: text('location_id').references(() => setupLocation.id),
  customerId: text('customer_id').references(() => saleCustomer.id),
  totalAmount: real('total_amount').default(0.0),
  reason: text('reason'),
  transactionDate: integer('transaction_date').notNull(),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const saleReturnDetail = sqliteTable('tx_sale_returndetail', {
  id: text('id').primaryKey(),
  returnId: text('return_id').references(() => saleReturn.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  quantity: real('quantity').default(0.0),
  unitPrice: real('unit_price').default(0.0),
  totalPrice: real('total_price').default(0.0),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
});

export const purchasePurchase = sqliteTable('tx_purchase_purchase', {
  id: text('id').primaryKey(),
  grnNo: text('grn_no').notNull().unique(),
  locationId: text('location_id').references(() => setupLocation.id),
  supplierId: text('supplier_id').references(() => purchaseSupplier.id),
  currencyId: text('currency_id').references(() => setupCurrency.id),
  totalAmount: real('total_amount').default(0.0),
  taxAmount: real('tax_amount').default(0.0),
  paidAmount: real('paid_amount').default(0.0),
  statusId: text('status_id').references(() => setupStatus.id),
  transactionDate: integer('transaction_date').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const purchasePurchaseDetail = sqliteTable('tx_purchase_purchasedetail', {
  id: text('id').primaryKey(),
  purchaseId: text('purchase_id').references(() => purchasePurchase.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  quantity: real('quantity').default(0.0),
  unitCost: real('unit_cost').default(0.0),
  totalCost: real('total_cost').default(0.0),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
});

export const purchaseReturn = sqliteTable('tx_purchase_return', {
  id: text('id').primaryKey(),
  returnNo: text('return_no').notNull().unique(),
  purchaseId: text('purchase_id').references(() => purchasePurchase.id),
  locationId: text('location_id').references(() => setupLocation.id),
  supplierId: text('supplier_id').references(() => purchaseSupplier.id),
  totalAmount: real('total_amount').default(0.0),
  reason: text('reason'),
  transactionDate: integer('transaction_date').notNull(),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

export const purchaseReturnDetail = sqliteTable('tx_purchase_returndetail', {
  id: text('id').primaryKey(),
  returnId: text('return_id').references(() => purchaseReturn.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  quantity: real('quantity').default(0.0),
  unitCost: real('unit_cost').default(0.0),
  totalCost: real('total_cost').default(0.0),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
});

export const inventoryTransfer = sqliteTable('tx_inventory_transfer', {
  id: text('id').primaryKey(),
  transferNo: text('transfer_no').notNull().unique(),
  fromLocationId: text('from_location_id').references(() => setupLocation.id),
  toLocationId: text('to_location_id').references(() => setupLocation.id),
  statusId: text('status_id').references(() => setupStatus.id),
  transactionDate: integer('transaction_date').notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  transferNoIdx: uniqueIndex('idx_transfer_no').on(table.transferNo),
  fromLocIdx: index('idx_transfer_from_loc').on(table.fromLocationId),
  toLocIdx: index('idx_transfer_to_loc').on(table.toLocationId),
  dateIdx: index('idx_transfer_date').on(table.transactionDate),
}));

export const inventoryTransferDetail = sqliteTable('tx_inventory_transferdetail', {
  id: text('id').primaryKey(),
  transferId: text('transfer_id').references(() => inventoryTransfer.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  quantity: real('quantity').default(0.0),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).default(false),
  deletedAt: integer('deleted_at'),
  deletedBy: text('deleted_by'),
  createdAt: integer('created_at').notNull(),
  createdBy: text('created_by'),
});

export const inventoryStockAdjust = sqliteTable('tx_inventory_stockadjust', {
  id: text('id').primaryKey(),
  adjustNo: text('adjust_no').notNull().unique(),
  locationId: text('location_id').references(() => setupLocation.id),
  stockId: text('stock_id').references(() => inventoryStock.id),
  type: text('type').notNull(),
  quantity: real('quantity').default(0.0),
  reason: text('reason'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

/**
 * 6. Delivery
 */
export const setupDeliveryProvider = sqliteTable('t_setup_deliveryprovider', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  phone: text('phone'),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  tenantNameUnique: unique().on(table.tenantId, table.name),
}));

export const saleDelivery = sqliteTable('tx_sale_delivery', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  saleId: text('sale_id').notNull().unique().references(() => saleSale.id),
  providerId: text('provider_id').references(() => setupDeliveryProvider.id),
  deliveryAddress: text('delivery_address'),
  recipientName: text('recipient_name'),
  recipientPhone: text('recipient_phone'),
  deliveryFee: real('delivery_fee').default(0.0),
  trackingNumber: text('tracking_number'),
  deliveryStatus: text('delivery_status').default('Pending'), // Pending, Dispatched, Delivered, Cancelled
  dispatchTime: integer('dispatch_time'),
  deliveredTime: integer('delivered_time'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

/**
 * 7. Expenses
 */
export const expenseType = sqliteTable('t_expense_type', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  tenantNameUnique: unique().on(table.tenantId, table.name),
}));

export const expenseExpense = sqliteTable('tx_expense_expense', {
  id: text('id').primaryKey(),
  tenantId: text('tenant_id').notNull(),
  expenseTypeId: text('expense_type_id').references(() => expenseType.id),
  locationId: text('location_id').references(() => setupLocation.id),
  amount: real('amount').default(0.0),
  referenceNo: text('reference_no'),
  note: text('note'),
  transactionDate: integer('transaction_date').notNull(),
  statusId: text('status_id').references(() => setupStatus.id),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
}, (table) => ({
  dateIdx: index('expense_date_idx').on(table.transactionDate),
  locationIdx: index('expense_location_idx').on(table.locationId),
}));
