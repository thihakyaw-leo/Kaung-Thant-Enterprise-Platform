import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Package, 
  ArrowUpRight, 
  ArrowDownRight,
  ShoppingCart,
  DollarSign,
  Loader2,
  RefreshCw,
  PieChart
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { api } from '../../lib/api';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    total_revenue: 0,
    daily_transactions: 0,
    net_profit: 0,
    stock_valuation: 0
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [salesRes, plRes, valuationRes] = await Promise.all([
        api.getDailySales(),
        api.getProfitLoss({}),
        api.getStockValuation()
      ]);

      setSalesData(salesRes || []);
      setSummary({
        total_revenue: plRes?.total_sales || 0,
        daily_transactions: (salesRes as any)?.[(salesRes as any)?.length - 1]?.transaction_count || 0,
        net_profit: plRes?.net_profit || 0,
        stock_valuation: valuationRes?.total_valuation || 0
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchDashboardData();
    });
  }, []);

  const stats = [
    { 
      label: t('total_revenue'), 
      value: `${summary.total_revenue.toLocaleString()} MMK`, 
      change: '+12.5%', 
      isPositive: true,
      icon: TrendingUp,
      color: 'primary'
    },
    { 
      label: t('net_profit'), 
      value: `${summary.net_profit.toLocaleString()} MMK`, 
      change: '+5.2%', 
      isPositive: true,
      icon: DollarSign,
      color: 'success'
    },
    { 
      label: t('daily_transactions'), 
      value: summary.daily_transactions.toString(), 
      change: '-2.1%', 
      isPositive: false,
      icon: ShoppingCart,
      color: 'warning'
    },
    { 
      label: t('stock_valuation'), 
      value: `${summary.stock_valuation.toLocaleString()} MMK`, 
      change: 'Stable', 
      isPositive: true,
      icon: Package,
      color: 'info'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">{t('dashboard')}</h1>
          <p className="text-text-secondary font-medium mt-1">Real-time overview of your business performance.</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          disabled={loading}
          className="btn btn-secondary shadow-sm"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
          {t('refresh')}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="card animate-slide-up">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-primary/10 text-primary`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.isPositive ? 'text-success' : 'text-error'}`}>
                {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.change}
              </div>
            </div>
            <p className="text-sm font-bold text-text-muted uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl font-black text-text-primary mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-text-primary">{t('sales_trend')}</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-2 text-xs font-bold text-text-muted">
                <div className="w-3 h-3 rounded-full bg-primary" /> {t('total_revenue')}
              </span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary/30" />
              </div>
            ) : salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={salesData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: 'var(--text-muted)', fontWeight: 600}}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--card-bg)',
                      borderColor: 'var(--border-color)',
                      borderRadius: '1rem',
                      boxShadow: 'var(--card-shadow)',
                      border: 'none'
                    }}
                    itemStyle={{ fontWeight: 700, color: 'var(--primary)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total_revenue" 
                    stroke="var(--primary)" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-text-muted gap-2">
                <PieChart size={48} className="opacity-20" />
                <p className="font-bold">{t('no_data')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Side Stats */}
        <div className="card flex flex-col">
          <h3 className="text-xl font-black text-text-primary mb-8">{t('recent_performance')}</h3>
          <div className="space-y-8 flex-1">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-secondary border border-border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-text-primary">{t('todays_orders')}</p>
                  <p className="text-xs text-text-muted font-bold">Total volume today</p>
                </div>
              </div>
              <span className="text-2xl font-black text-text-primary">{summary.daily_transactions}</span>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-black text-text-muted uppercase tracking-[0.2em]">{t('quick_stats')}</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-secondary">{t('gross_margin')}</span>
                  <span className="text-sm font-black text-success">24.8%</span>
                </div>
                <div className="w-full bg-bg-tertiary h-2 rounded-full overflow-hidden">
                  <div className="bg-success h-full w-[24.8%]"></div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-secondary">{t('inventory_items')}</span>
                  <span className="text-sm font-black text-text-primary">1,248</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-text-secondary">{t('low_stock_items')}</span>
                  <span className="text-sm font-black text-error">12</span>
                </div>
              </div>
            </div>
          </div>
          
          <button className="btn btn-primary w-full mt-8 shadow-lg">
            {t('full_report')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
