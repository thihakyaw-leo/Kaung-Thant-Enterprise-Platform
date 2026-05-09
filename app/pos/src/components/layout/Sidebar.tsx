import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Monitor, 
  Package, 
  ShoppingCart, 
  Users, 
  Receipt, 
  Settings, 
  LogOut,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Monitor, label: 'Terminal', path: '/terminal' },
    { 
      icon: Package, 
      label: 'Inventory', 
      path: '/inventory',
      subItems: [
        { label: 'Categories', path: '/inventory/categories' },
        { label: 'Units', path: '/inventory/units' },
        { label: 'Transfers', path: '/inventory/transfers' },
        { label: 'Adjustments', path: '/inventory/adjustments' },
      ]
    },
    { icon: ShoppingCart, label: 'Sales', path: '/sales' },
    { icon: Receipt, label: 'Purchases', path: '/purchases' },
    { icon: CreditCard, label: 'Expenses', path: '/expenses' },
    { 
      icon: Users, 
      label: 'Contacts', 
      path: '/contacts',
      subItems: [
        { label: 'Customers', path: '/contacts/customers' },
        { label: 'Suppliers', path: '/contacts/suppliers' },
        { label: 'Agents', path: '/contacts/agents' },
      ]
    },
    { icon: TrendingUp, label: 'Reports', path: '/reports/sales' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className="w-72 h-screen bg-bg-primary border-r border-border flex flex-col fixed left-0 top-0 z-40">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
            <TrendingUp size={24} strokeWidth={3} />
          </div>
          <span className="text-xl font-black text-text-primary tracking-tighter italic">K-T POS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all group ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <item.icon size={20} strokeWidth={isActive ? 3 : 2} />
                      <span>{item.label}</span>
                    </div>
                    {item.subItems && <ChevronRight size={16} className={isActive ? 'opacity-100' : 'opacity-40'} />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-error hover:bg-error/5 transition-all"
          title="Logout"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
