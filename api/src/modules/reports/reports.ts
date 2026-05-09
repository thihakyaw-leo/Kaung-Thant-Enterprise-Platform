import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, sum, count, and, gte, lte, desc } from 'drizzle-orm';
import * as schema from '../../db/tenant.schema';
import { Env } from '../../index';

const reportsAPI = new Hono<{ Bindings: Env }>();

/**
 * DASHBOARD SUMMARY
 */
reportsAPI.get('/summary', async (c) => {
  const db = drizzle(c.env.DB);
  const now = Math.floor(Date.now() / 1000);
  const startOfDay = Math.floor(new Date().setHours(0,0,0,0) / 1000);

  const sales = await db.select({
    todayRevenue: sql<number>`SUM(CASE WHEN ${schema.saleSale.transactionDate} >= ${startOfDay} THEN ${schema.saleSale.payableAmount} ELSE 0 END)`,
    totalRevenue: sum(schema.saleSale.payableAmount),
    count: count(schema.saleSale.id)
  }).from(schema.saleSale).get();

  const inventory = await db.select({
    count: count(schema.inventoryStock.id),
    lowStock: sql<number>`COUNT(CASE WHEN ${schema.inventoryStock.reorderLevel} > 0 THEN 1 END)`
  }).from(schema.inventoryStock).get();

  return c.json({
    success: true,
    data: {
      today_revenue: sales?.todayRevenue || 0,
      total_revenue: sales?.totalRevenue || 0,
      total_sales_count: sales?.count || 0,
      total_items: inventory?.count || 0,
      low_stock_count: inventory?.lowStock || 0
    }
  });
});

/**
 * DAILY SALES REPORT
 */
reportsAPI.get('/daily-sales', async (c) => {
  const db = drizzle(c.env.DB);
  const locationId = c.req.query('location_id');

  let query = db.select({
    date: sql<string>`date(transaction_date, 'unixepoch')`,
    total_revenue: sum(schema.saleSale.payableAmount),
    transaction_count: count(schema.saleSale.id)
  })
  .from(schema.saleSale);

  if (locationId) {
    query.where(eq(schema.saleSale.locationId, locationId));
  }

  const results = await query
    .groupBy(sql`date(transaction_date, 'unixepoch')`)
    .orderBy(sql`date(transaction_date, 'unixepoch') DESC`)
    .limit(30);

  return c.json({ success: true, data: results });
});

/**
 * SALES BY CATEGORY
 */
reportsAPI.get('/sales-by-category', async (c) => {
  const db = drizzle(c.env.DB);
  const { start_date, end_date, location_id } = c.req.query();

  const start = start_date ? Math.floor(new Date(start_date).getTime() / 1000) : 0;
  const end = end_date ? Math.floor(new Date(end_date).getTime() / 1000) : Math.floor(Date.now() / 1000);

  const results = await db.select({
    categoryName: schema.inventoryCategory.name,
    totalSales: sum(schema.saleSaleDetail.totalPrice),
    quantity: sum(schema.saleSaleDetail.quantity)
  })
  .from(schema.saleSaleDetail)
  .innerJoin(schema.saleSale, eq(schema.saleSaleDetail.saleId, schema.saleSale.id))
  .innerJoin(schema.inventoryStock, eq(schema.saleSaleDetail.stockId, schema.inventoryStock.id))
  .innerJoin(schema.inventoryCategory, eq(schema.inventoryStock.categoryId, schema.inventoryCategory.id))
  .where(and(
    gte(schema.saleSale.transactionDate, start),
    lte(schema.saleSale.transactionDate, end),
    location_id ? eq(schema.saleSale.locationId, location_id) : sql`1=1`
  ))
  .groupBy(schema.inventoryCategory.id)
  .orderBy(desc(sql`SUM(${schema.saleSaleDetail.totalPrice})`))
  .all();

  return c.json({ success: true, data: results });
});

/**
 * TOP PRODUCTS
 */
reportsAPI.get('/top-products', async (c) => {
  const db = drizzle(c.env.DB);
  const { start_date, end_date, location_id } = c.req.query();

  const start = start_date ? Math.floor(new Date(start_date).getTime() / 1000) : 0;
  const end = end_date ? Math.floor(new Date(end_date).getTime() / 1000) : Math.floor(Date.now() / 1000);

  const results = await db.select({
    productName: schema.inventoryStock.name,
    productCode: schema.inventoryStock.code,
    totalSales: sum(schema.saleSaleDetail.totalPrice),
    quantity: sum(schema.saleSaleDetail.quantity)
  })
  .from(schema.saleSaleDetail)
  .innerJoin(schema.saleSale, eq(schema.saleSaleDetail.saleId, schema.saleSale.id))
  .innerJoin(schema.inventoryStock, eq(schema.saleSaleDetail.stockId, schema.inventoryStock.id))
  .where(and(
    gte(schema.saleSale.transactionDate, start),
    lte(schema.saleSale.transactionDate, end),
    location_id ? eq(schema.saleSale.locationId, location_id) : sql`1=1`
  ))
  .groupBy(schema.inventoryStock.id)
  .orderBy(desc(sql`SUM(${schema.saleSaleDetail.totalPrice})`))
  .limit(10)
  .all();

  return c.json({ success: true, data: results });
});

/**
 * STOCK VALUATION REPORT
 */
reportsAPI.get('/stock-valuation', async (c) => {
  const db = drizzle(c.env.DB);
  const locationId = c.req.query('location_id');

  let query = db.select({
    id: schema.inventoryStock.id,
    name: schema.inventoryStock.name,
    code: schema.inventoryStock.code,
    lastCost: schema.inventoryStock.lastCost,
    currentQuantity: sql<number>`SUM(${schema.inventoryStockQuantity.quantity})`,
    valuation: sql<number>`SUM(${schema.inventoryStockQuantity.quantity} * ${schema.inventoryStock.lastCost})`
  })
  .from(schema.inventoryStock)
  .leftJoin(schema.inventoryStockQuantity, eq(schema.inventoryStock.id, schema.inventoryStockQuantity.stockId));

  if (locationId) {
    query.where(eq(schema.inventoryStockQuantity.locationId, locationId));
  }

  const items = await query.groupBy(schema.inventoryStock.id).all();
  const totalValuation = items.reduce((acc, item) => acc + (item.valuation || 0), 0);

  return c.json({ 
    success: true, 
    data: { 
      items, 
      total_valuation: totalValuation 
    } 
  });
});

/**
 * PROFIT & LOSS REPORT
 */
reportsAPI.get('/profit-loss', async (c) => {
  const db = drizzle(c.env.DB);
  const { start_date, end_date, location_id } = c.req.query();

  const start = start_date ? Math.floor(new Date(start_date).getTime() / 1000) : 0;
  const end = end_date ? Math.floor(new Date(end_date).getTime() / 1000) : Math.floor(Date.now() / 1000);

  // 1. Total Sales
  const salesQuery = db.select({
    total_sales: sum(schema.saleSale.payableAmount),
  }).from(schema.saleSale);

  const salesFilters = [gte(schema.saleSale.transactionDate, start), lte(schema.saleSale.transactionDate, end)];
  if (location_id) salesFilters.push(eq(schema.saleSale.locationId, location_id));
  const sales = await salesQuery.where(and(...salesFilters)).get();

  // 2. Total Cost of Goods Sold (COGS)
  const cogsQuery = db.select({
    total_cost: sum(sql`${schema.saleSaleDetail.quantity} * ${schema.inventoryStock.avgCost}`),
  })
  .from(schema.saleSaleDetail)
  .innerJoin(schema.saleSale, eq(schema.saleSaleDetail.saleId, schema.saleSale.id))
  .innerJoin(schema.inventoryStock, eq(schema.saleSaleDetail.stockId, schema.inventoryStock.id));

  const cogsFilters = [gte(schema.saleSale.transactionDate, start), lte(schema.saleSale.transactionDate, end)];
  if (location_id) cogsFilters.push(eq(schema.saleSale.locationId, location_id));
  const cogs = await cogsQuery.where(and(...cogsFilters)).get();

  // 3. Total Expenses (Breakdown by type)
  const expensesQuery = db.select({
    typeName: schema.expenseType.name,
    amount: sum(schema.expenseExpense.amount),
  })
  .from(schema.expenseExpense)
  .leftJoin(schema.expenseType, eq(schema.expenseExpense.expenseTypeId, schema.expenseType.id))
  .groupBy(schema.expenseType.id);

  const expenseFilters = [gte(schema.expenseExpense.transactionDate, start), lte(schema.expenseExpense.transactionDate, end)];
  if (location_id) expenseFilters.push(eq(schema.expenseExpense.locationId, location_id));
  const expensesBreakdown = await expensesQuery.where(and(...expenseFilters)).all();

  const totalSales = Number(sales?.total_sales || 0);
  const totalCost = Number(cogs?.total_cost || 0);
  const totalExpenses = expensesBreakdown.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const grossProfit = totalSales - totalCost;
  const netProfit = grossProfit - totalExpenses;

  return c.json({
    success: true,
    data: {
      total_sales: totalSales,
      total_cost: totalCost,
      gross_profit: grossProfit,
      total_expenses: totalExpenses,
      net_profit: netProfit,
      expenses_breakdown: expensesBreakdown
    }
  });
});

/**
 * EXPORT MONTHLY SALES (Workflow Trigger)
 */
reportsAPI.post('/export/monthly-sales', async (c) => {
  const { month, year, location_id } = await c.req.json();
  
  if (!month || !year || !location_id) {
    return c.json({ success: false, error: 'Missing required parameters' }, 400);
  }

  // Trigger Cloudflare Workflow
  const instance = await c.env.REPORT_WORKFLOW.create({
    params: {
      month: month.toString(),
      year: parseInt(year),
      locationId: location_id
    }
  });

  return c.json({ 
    success: true, 
    data: { 
      instance_id: instance.id,
      message: 'Monthly report generation started in background' 
    } 
  });
});

export default reportsAPI;
