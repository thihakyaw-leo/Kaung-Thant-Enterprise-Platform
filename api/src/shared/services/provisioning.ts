import { D1Database } from '@cloudflare/workers-types';
import { drizzle } from 'drizzle-orm/d1';

import * as tenantSchema from '../../db/tenant.schema';

export class ProvisioningService {
  private db: any;

  constructor(d1: D1Database) {
    this.db = drizzle(d1);
  }

  /**
   * Run the initial setup for a new tenant
   */
  async initializeTenant() {
    try {
      // 1. Seed Default Statuses
      const statuses = [
        { id: crypto.randomUUID(), name: 'Active', description: 'Account is active', createdAt: Math.floor(Date.now() / 1000), updatedAt: Math.floor(Date.now() / 1000) },
        { id: crypto.randomUUID(), name: 'Inactive', description: 'Account is suspended', createdAt: Math.floor(Date.now() / 1000), updatedAt: Math.floor(Date.now() / 1000) },
        { id: crypto.randomUUID(), name: 'Pending', description: 'Waiting for verification', createdAt: Math.floor(Date.now() / 1000), updatedAt: Math.floor(Date.now() / 1000) }
      ];

      await this.db.insert(tenantSchema.setupStatus).values(statuses).onConflictDoNothing();

      // 2. Seed Default Currencies
      const currencies = [
        { 
          id: crypto.randomUUID(), 
          code: 'MMK', 
          name: 'Myanmar Kyat', 
          symbol: 'K', 
          isDefault: true, 
          createdAt: Math.floor(Date.now() / 1000), 
          updatedAt: Math.floor(Date.now() / 1000) 
        },
        { 
          id: crypto.randomUUID(), 
          code: 'USD', 
          name: 'US Dollar', 
          symbol: '$', 
          isDefault: false, 
          createdAt: Math.floor(Date.now() / 1000), 
          updatedAt: Math.floor(Date.now() / 1000) 
        }
      ];

      await this.db.insert(tenantSchema.setupCurrency).values(currencies).onConflictDoNothing();

      // 3. Create Default Admin Role
      const adminRole = {
        id: crypto.randomUUID(),
        name: 'Administrator',
        permissions: JSON.stringify(['*']),
        createdAt: Math.floor(Date.now() / 1000),
        updatedAt: Math.floor(Date.now() / 1000)
      };

      await this.db.insert(tenantSchema.configRole).values(adminRole).onConflictDoNothing();

      return { success: true, message: 'Tenant provisioned successfully' };
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Provisioning Error:', error);
      throw new Error(`Failed to provision tenant: ${message}`);
    }
  }

  /**
   * Seed realistic test data for development
   */
  async seedTestData() {
    try {
      const now = Math.floor(Date.now() / 1000);

      // 1. Locations
      const locations = [
        { id: crypto.randomUUID(), name: 'Main Branch (Downtown)', address: 'No. 123, Merchant St, Yangon', createdAt: now, updatedAt: now },
        { id: crypto.randomUUID(), name: 'Warehouse (East Dagon)', address: 'Industrial Zone 1, Yangon', createdAt: now, updatedAt: now }
      ];
      await this.db.insert(tenantSchema.setupLocation).values(locations).onConflictDoNothing();

      // 2. Categories
      const catId = crypto.randomUUID();
      await this.db.insert(tenantSchema.inventoryCategory).values({
        id: catId,
        name: 'Beverages',
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing();

      // 3. Suppliers & Customers
      const supplierId = crypto.randomUUID();
      await this.db.insert(tenantSchema.purchaseSupplier).values({
        id: supplierId,
        name: 'Global Foods Co., Ltd',
        phone: '09123456789',
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing();

      const customerId = crypto.randomUUID();
      await this.db.insert(tenantSchema.saleCustomer).values({
        id: customerId,
        name: 'Walk-in Customer',
        phone: '09000000000',
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing();

      // 4. Stocks (Products)
      const stockId = crypto.randomUUID();
      await this.db.insert(tenantSchema.inventoryStock).values({
        id: stockId,
        code: 'PROD-001',
        name: 'Organic Arabica Coffee (250g)',
        categoryId: catId,
        avgCost: 15000,
        lastCost: 15000,
        reorderLevel: 10,
        createdAt: now,
        updatedAt: now
      }).onConflictDoNothing();

      // 5. Initial Quantity
      await this.db.insert(tenantSchema.inventoryStockQuantity).values({
        stockId,
        locationId: locations[0].id,
        quantity: 50,
        updatedAt: now
      }).onConflictDoNothing();

      return { success: true, message: 'Test data seeded successfully' };
    } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Seeding Error:', error);
      throw new Error(`Failed to seed data: ${message}`);
    }
  }
}
