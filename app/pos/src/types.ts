// ============================================================
// Shared TypeScript Interfaces for app/pos
// ============================================================

export interface User {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface Stock {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category_id: string;
  category_name?: string;
  unit_id: string;
  unit_name?: string;
  selling_price: number;
  cost_price: number;
  avg_cost?: number;
  quantity: number;
  reorder_level?: number;
  status_id?: string;
  image?: string;
  created_at?: string;
}

export interface SaleItem {
  stock_id: string;
  name: string;
  code: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total_price: number;
}

export interface Sale {
  id: string;
  transaction_date: string;
  customer_id?: string;
  customer_name?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  payment_method: string;
  status_id: string;
  created_by?: string;
  note?: string;
}

export interface SaleDetail extends Sale {
  items: SaleItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  balance: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Unit {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Expense {
  id: string;
  expense_type_id: string;
  expense_type_name?: string;
  amount: number;
  note?: string;
  created_at: string;
}

export interface ExpenseType {
  id: string;
  name: string;
}

export interface Purchase {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  transaction_date: string;
  total_amount: number;
  status_id: string;
}

export interface DailySales {
  date: string;
  total_revenue: number;
  transaction_count: number;
}

export interface DashboardSummary {
  total_revenue: number;
  daily_transactions: number;
  net_profit: number;
  stock_valuation: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string;
  barcode?: string;
  price: number;
  cost?: number;
  stock: number;
  category_id?: string;
  category_name?: string;
  unit_id?: string;
  unit_name?: string;
  image?: string;
}

export interface CartItem {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
}

export interface StockMovement {
  id: string;
  stock_id: string;
  product_name: string;
  sku: string;
  type: 'sale' | 'purchase' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  transaction_date: string;
  reference_id?: string;
  note?: string;
  user_name?: string;
}
