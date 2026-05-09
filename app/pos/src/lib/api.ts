// ============================================================
// API Service for app/pos — Cloudflare Workers backend
// ============================================================

function getBaseUrl(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (typeof env === 'string' && env.trim() !== '') return env.trim().replace(/\/$/, '');
  return import.meta.env.DEV ? '/api' : 'http://localhost:8787/api';
}

const BASE = getBaseUrl();

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('kt_token');
  const url = `${BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('kt_token');
    window.location.href = '/login';
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Network error' }));
    throw err;
  }

  const data = await res.json();
  return (data.success ? data.data : data) as T;
}

export const api = {
  // Auth
  getToken: () => localStorage.getItem('kt_token'),
  setToken: (t: string) => localStorage.setItem('kt_token', t),
  clearToken: () => localStorage.removeItem('kt_token'),

  login: (username: string, password: string) =>
    request<{ token: string; redirect_url?: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Dashboard / Reports
  getDailySales: (locationId?: string) => request<Record<string, any>[]>(`/reports/daily-sales?location_id=${locationId || ''}`),
  getSalesByCategory: (params: Record<string, string | undefined> = {}) => 
    request<Record<string, any>[]>(`/reports/sales-by-category?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getTopProducts: (params: Record<string, string | undefined> = {}) => 
    request<Record<string, any>[]>(`/reports/top-products?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getStockValuation: (locationId?: string) => request<any>(`/reports/stock-valuation?location_id=${locationId || ''}`),

  getProfitLoss: (params: { start_date?: string; end_date?: string; location_id?: string }) =>
    request<{ total_sales: number; total_cost: number; gross_profit: number; total_expenses: number; net_profit: number }>(
      `/reports/profit-loss?${new URLSearchParams(params as Record<string, string>).toString()}`
    ),

  getSalesReport: (params: Record<string, string | undefined>) =>
    request<Record<string, unknown>[]>(`/reports/sales?${new URLSearchParams(params as Record<string, string>).toString()}`),

  // Sales
  getSales: (params: Record<string, string | number | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/sales?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getSaleDetails: (id: string) => request<Record<string, unknown>>(`/sales/${id}`),

  createSale: (data: unknown) =>
    request<{ id: string }>('/sales', { method: 'POST', body: JSON.stringify(data) }),

  getSalesReturns: () => request<Record<string, unknown>[]>('/sales/returns'),
  createSalesReturn: (data: unknown) =>
    request<{ id: string }>('/sales/returns', { method: 'POST', body: JSON.stringify(data) }),

  // Inventory
  getStocks: (params: Record<string, string | number | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/inventory/stock?${new URLSearchParams(params as Record<string, string>).toString()}`),

  createStock: (data: unknown) =>
    request<{ id: string }>('/inventory/stock', { method: 'POST', body: JSON.stringify(data) }),

  updateStock: (id: string, data: unknown) =>
    request<{ id: string }>(`/inventory/stock/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteStock: (id: string) => request<void>(`/inventory/stock/${id}`, { method: 'DELETE' }),

  getCategories: () => request<Record<string, unknown>[]>('/inventory/categories'),
  createCategory: (data: unknown) =>
    request<{ id: string }>('/inventory/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: unknown) =>
    request<{ id: string }>(`/inventory/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id: string) => request<void>(`/inventory/categories/${id}`, { method: 'DELETE' }),

  getUnits: () => request<Record<string, unknown>[]>('/inventory/units'),
  createUnit: (data: unknown) =>
    request<{ id: string }>('/inventory/units', { method: 'POST', body: JSON.stringify(data) }),
  updateUnit: (id: string, data: unknown) =>
    request<{ id: string }>(`/inventory/units/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUnit: (id: string) => request<void>(`/inventory/units/${id}`, { method: 'DELETE' }),

  getMovements: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/inventory/movements?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getTransfers: () => request<Record<string, unknown>[]>('/inventory/transfers'),
  createTransfer: (data: unknown) =>
    request<{ id: string }>('/inventory/transfers', { method: 'POST', body: JSON.stringify(data) }),
  getTransferDetail: (id: string) => request<Record<string, unknown>>(`/inventory/transfers/${id}`),

  getStockQuantities: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/inventory/quantities?${new URLSearchParams(params as Record<string, string>).toString()}`),

  getAdjustments: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/inventory/stock-management/adjustments?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createAdjustment: (data: unknown) =>
    request<{ id: string }>('/inventory/stock-management/adjust', { method: 'POST', body: JSON.stringify(data) }),

  // Customers
  getCustomers: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/contacts/customers?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createCustomer: (data: unknown) =>
    request<{ id: string }>('/contacts/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id: string, data: unknown) =>
    request<{ id: string }>(`/contacts/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id: string) => request<void>(`/contacts/customers/${id}`, { method: 'DELETE' }),

  // Suppliers
  getSuppliers: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/contacts/suppliers?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createSupplier: (data: unknown) =>
    request<{ id: string }>('/contacts/suppliers', { method: 'POST', body: JSON.stringify(data) }),
  updateSupplier: (id: string, data: unknown) =>
    request<{ id: string }>(`/contacts/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSupplier: (id: string) => request<void>(`/contacts/suppliers/${id}`, { method: 'DELETE' }),

  // Agents
  getAgents: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/contacts/agents?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createAgent: (data: unknown) =>
    request<{ id: string }>('/contacts/agents', { method: 'POST', body: JSON.stringify(data) }),
  updateAgent: (id: string, data: unknown) =>
    request<{ id: string }>(`/contacts/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAgent: (id: string) => request<void>(`/contacts/agents/${id}`, { method: 'DELETE' }),

  // Purchases
  getPurchases: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/purchases?${new URLSearchParams(params as Record<string, string>).toString()}`),
  getPurchaseDetails: (id: string) => request<Record<string, unknown>>(`/purchases/${id}`),
  createPurchase: (data: unknown) =>
    request<{ id: string }>('/purchases', { method: 'POST', body: JSON.stringify(data) }),
  deletePurchase: (id: string) => request<void>(`/purchases/${id}`, { method: 'DELETE' }),

  getPurchaseReturns: () => request<Record<string, unknown>[]>('/purchase-returns'),
  createPurchaseReturn: (data: unknown) =>
    request<{ id: string }>('/purchase-returns', { method: 'POST', body: JSON.stringify(data) }),
  getPurchaseReturnDetail: (id: string) => request<Record<string, unknown>>(`/purchase-returns/${id}`),

  // Expenses
  getExpenses: (params: Record<string, string | undefined> = {}) =>
    request<Record<string, unknown>[]>(`/expenses?${new URLSearchParams(params as Record<string, string>).toString()}`),
  createExpense: (data: unknown) =>
    request<{ id: string }>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  deleteExpense: (id: string) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),

  getExpenseTypes: () => request<Record<string, unknown>[]>('/expenses/types'),
  createExpenseType: (data: unknown) =>
    request<{ id: string }>('/expenses/types', { method: 'POST', body: JSON.stringify(data) }),
  updateExpenseType: (id: string, data: unknown) =>
    request<{ id: string }>(`/expenses/types/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpenseType: (id: string) => request<void>(`/expenses/types/${id}`, { method: 'DELETE' }),

  // Config & Settings
  getBusinessProfile: () => request<Record<string, unknown>>('/config/business'),
  updateBusinessProfile: (data: unknown) => 
    request<void>('/config/business', { method: 'POST', body: JSON.stringify(data) }),
  getSettings: () => request<Record<string, string>>('/config/settings'),
  updateSettings: (data: unknown) =>
    request<void>('/config/settings', { method: 'POST', body: JSON.stringify(data) }),

  // Setup
  getStatuses: () => request<Record<string, unknown>[]>('/setup/statuses'),
  getLocations: () => request<Record<string, unknown>[]>('/setup/locations'),
  getCurrencies: () => request<Record<string, unknown>[]>('/setup/currencies'),
  getTaxes: () => request<Record<string, unknown>[]>('/setup/taxes'),
};
