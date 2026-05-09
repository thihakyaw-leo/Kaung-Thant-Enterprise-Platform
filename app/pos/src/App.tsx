import { useState, useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './i18n';
import { api } from './lib/api';

// Layout Components
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';

// Pages - Lazy Loading
const Login = lazy(() => import('./features/auth/Login'));
const Dashboard = lazy(() => import('./features/dashboard/Dashboard'));
const Terminal = lazy(() => import('./features/sales/Terminal'));
const Inventory = lazy(() => import('./features/inventory/Inventory'));
const Transfers = lazy(() => import('./features/inventory/Transfers'));
const CreateTransfer = lazy(() => import('./features/inventory/CreateTransfer'));
const Categories = lazy(() => import('./features/inventory/Categories'));
const Units = lazy(() => import('./features/inventory/Units'));
const StockAdjustments = lazy(() => import('./features/inventory/StockAdjustments'));
const CreateAdjustment = lazy(() => import('./features/inventory/CreateAdjustment'));
const StockMovements = lazy(() => import('./features/inventory/InventoryMovements'));
const SalesHistory = lazy(() => import('./features/sales/SalesHistory'));
const SalesReturns = lazy(() => import('./features/sales/SalesReturns'));
const CreateSalesReturn = lazy(() => import('./features/sales/CreateSalesReturn'));
const Expenses = lazy(() => import('./features/expenses/Expenses'));
const Settings = lazy(() => import('./features/settings/Settings'));
const ExpenseTypes = lazy(() => import('./features/expenses/ExpenseTypes'));

// Contacts
const Customers = lazy(() => import('./features/contacts/Customers'));
const Suppliers = lazy(() => import('./features/contacts/Suppliers'));
const Agents = lazy(() => import('./features/contacts/Agents'));

// Purchases
const Purchases = lazy(() => import('./features/purchases/Purchases'));
const CreatePurchase = lazy(() => import('./features/purchases/CreatePurchase'));
const PurchaseReturns = lazy(() => import('./features/purchases/PurchaseReturns'));
const CreatePurchaseReturn = lazy(() => import('./features/purchases/CreatePurchaseReturn'));

// Reports
const Reports = lazy(() => import('./features/reports/Reports'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const [token, setToken] = useState(api.getToken());

  const handleLogin = (newToken: string) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    api.clearToken();
    setToken(null);
  };

  // Set initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  if (!token) {
    return (
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </Router>
    );
  }

  return (
    <Router>
      <div className="dashboard-layout">
        <Sidebar onLogout={handleLogout} />
        <main className="main-content">
          <Header />
          <div className="page-container">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/terminal" element={<Terminal />} />
                
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/inventory/categories" element={<Categories />} />
                <Route path="/inventory/units" element={<Units />} />
                <Route path="/inventory/movements" element={<StockMovements />} />
                <Route path="/inventory/transfers" element={<Transfers />} />
                <Route path="/inventory/transfers/new" element={<CreateTransfer />} />
                <Route path="/inventory/adjustments" element={<StockAdjustments />} />
                <Route path="/inventory/adjustments/new" element={<CreateAdjustment />} />
                
                <Route path="/sales" element={<SalesHistory />} />
                <Route path="/sales/returns" element={<SalesReturns />} />
                <Route path="/sales/returns/new" element={<CreateSalesReturn />} />
                
                <Route path="/purchases" element={<Purchases />} />
                <Route path="/purchases/new" element={<CreatePurchase />} />
                <Route path="/purchases/returns" element={<PurchaseReturns />} />
                <Route path="/purchases/returns/new" element={<CreatePurchaseReturn />} />
                
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/expenses/types" element={<ExpenseTypes />} />
                
                <Route path="/contacts/customers" element={<Customers />} />
                <Route path="/contacts/suppliers" element={<Suppliers />} />
                <Route path="/contacts/agents" element={<Agents />} />
                
                <Route path="/reports/sales" element={<Reports />} />
                <Route path="/reports/inventory" element={<Reports />} />
                <Route path="/reports/profit-loss" element={<Reports />} />
                
                <Route path="/settings" element={<Settings />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
