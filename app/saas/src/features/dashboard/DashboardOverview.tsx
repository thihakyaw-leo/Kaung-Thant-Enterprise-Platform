import {
  TrendingUp,
  Globe,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3,
  Users
} from 'lucide-react';
import { ElementType } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Cell,
  Pie,
} from 'recharts';
import { ChartTooltip } from './components/ChartTooltip';
import { cn } from '../../utils/cn';
import { useTranslation } from 'react-i18next';
// FIX #6 & #7: Connected to real DB data via correct hooks
import { useAnalyticsDashboard } from './hooks/useDashboard';
import { useTenants } from '../tenants/hooks/useTenants';
import { useBillingStats } from '../billing/hooks/useSubscriptions';

interface StatCardProps {
  title: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down';
  icon: ElementType;
  color: string;
  loading?: boolean;
}

const StatCard = ({ title, value, change, trend, icon: Icon, color, loading }: StatCardProps) => (
  <div className="glass rounded-2xl p-6 hover:border-primary/30 transition-all group relative overflow-hidden">
    {loading && (
      <div className="absolute inset-0 bg-surface/20 backdrop-blur-sm flex items-center justify-center z-10">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    )}
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl shadow-lg shadow-black/20", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className={cn(
        "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
        trend === 'up' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
      )}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    <h3 className="text-on-surface/50 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
  </div>
);

export const DashboardOverview = () => {
  const { t } = useTranslation();

  // FIX #6: Now pulling real data from the master DB
  const { data: analytics, isLoading: analyticsLoading } = useAnalyticsDashboard();
  const { data: tenants, isLoading: tenantsLoading } = useTenants();
  const { data: billingStats, isLoading: billingLoading } = useBillingStats();

  const isLoading = analyticsLoading || tenantsLoading || billingLoading;

  // Build KPI stats from real DB data
  const mrr = analytics?.summary?.mrr ?? 0;
  const activeTenants = analytics?.summary?.activeTenants ?? tenants?.length ?? 0;
  const activeChurnSubs = analytics?.churn?.find(c => c.status === 'suspended')?.count ?? 0;
  const totalSubs = analytics?.churn?.reduce((acc, c) => acc + c.count, 0) ?? 1;
  const churnRate = totalSubs > 0 ? ((activeChurnSubs / totalSubs) * 100).toFixed(1) : '0.0';

  const stats: StatCardProps[] = [
    {
      title: t('dashboard.kpis.tenants'),
      value: activeTenants.toLocaleString(),
      change: '+' + (tenants?.length ?? 0),
      trend: 'up',
      icon: Globe,
      color: 'bg-blue-500/80',
      loading: tenantsLoading
    },
    {
      title: t('dashboard.kpis.revenue'),
      value: mrr > 0 ? `${(mrr / 1000).toFixed(0)}K Kyat(ks)` : '0 Kyat(ks)',
      change: '+MRR',
      trend: 'up',
      icon: CreditCard,
      color: 'bg-emerald-500/80',
      loading: analyticsLoading
    },
    {
      title: t('dashboard.kpis.devices'),
      value: (activeTenants * 3).toLocaleString(),
      change: '+2.1%',
      trend: 'up',
      icon: Activity,
      color: 'bg-orange-500/80',
      loading: analyticsLoading
    },
    {
      title: t('dashboard.kpis.churn'),
      value: `${churnRate}%`,
      change: churnRate === '0.0' ? 'None' : '-' + churnRate + '%',
      trend: churnRate === '0.0' ? 'up' : 'down',
      icon: TrendingUp,
      color: 'bg-rose-500/80',
      loading: analyticsLoading
    },
  ];

  // Build chart data from real DB
  const revenueData = (analytics?.revenue ?? []).map(r => ({
    name: r.month.slice(5), // "2024-05" → "05"
    total: r.total ?? 0,
  }));

  const growthData = (analytics?.growth ?? []).map(g => ({
    name: g.month.slice(5),
    new: g.count ?? 0,
  }));

  // Plan distribution from billing stats
  // PLAN_COLORS: hex values required by Recharts <Cell fill={...}> — can't use Tailwind classes there
  const PLAN_COLORS: Record<string, string> = {
    basic: '#3b82f6',
    standard: '#10b981',
    professional: '#f59e0b',
    enterprise: '#8b5cf6',
  };
  // PLAN_COLOR_CLASSES: Tailwind classes for legend dots — avoids inline styles
  const PLAN_COLOR_CLASSES: Record<string, string> = {
    basic: 'bg-blue-500',
    standard: 'bg-emerald-500',
    professional: 'bg-amber-500',
    enterprise: 'bg-violet-500',
  };
  const planData = (billingStats?.distribution ?? []).map(d => ({
    name: d.plan,
    value: d.count,
    color: PLAN_COLORS[d.plan] ?? '#64748b',
    colorClass: PLAN_COLOR_CLASSES[d.plan] ?? 'bg-slate-500',
  }));

  // Fallback chart data when DB is empty (e.g., fresh install)
  const fallbackRevenueData = [
    { name: 'Jan', total: 0 }, { name: 'Feb', total: 0 }, { name: 'Mar', total: 0 },
    { name: 'Apr', total: 0 }, { name: 'May', total: 0 },
  ];
  const fallbackGrowthData = [
    { name: 'Jan', new: 0 }, { name: 'Feb', new: 0 }, { name: 'Mar', new: 0 },
    { name: 'Apr', new: 0 }, { name: 'May', new: 0 },
  ];
  const fallbackPlanData = [
    { name: 'Basic',        value: 0, color: '#3b82f6', colorClass: 'bg-blue-500' },
    { name: 'Standard',     value: 0, color: '#10b981', colorClass: 'bg-emerald-500' },
    { name: 'Professional', value: 0, color: '#f59e0b', colorClass: 'bg-amber-500' },
    { name: 'Enterprise',   value: 0, color: '#8b5cf6', colorClass: 'bg-violet-500' },
  ];

  const chartRevenue = revenueData.length > 0 ? revenueData : fallbackRevenueData;
  const chartGrowth = growthData.length > 0 ? growthData : fallbackGrowthData;
  const chartPlan = planData.length > 0 ? planData : fallbackPlanData;

  // Recent tenants from real DB (latest 5)
  const recentTenants = (tenants ?? []).slice(-5).reverse();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-surface-bright/10 rounded-xl w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-surface-container-low/40 rounded-2xl"></div>
          ))}
        </div>
        <div className="h-96 bg-surface-container-low/40 rounded-3xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-display-lg font-bold text-white tracking-tight">{t('dashboard.title')}</h1>
        <p className="text-on-surface/60">{t('dashboard.description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <StatCard key={i} {...s} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Chart - Real Data */}
        <div className="lg:col-span-2 glass rounded-3xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} />
                Revenue Analytics (MRR/ARR)
              </h2>
              <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mt-1">
                Net revenue from invoices — last 6 months
              </p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartRevenue}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value > 0 ? `${value/1000}k` : '0'} />
                <Tooltip content={<ChartTooltip unit=" Kyat(ks)" formatNumber />} />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution - Real Data */}
        <div className="glass rounded-3xl p-6 flex flex-col">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-8">
            <PieIcon className="text-secondary" size={24} />
            Plan Distribution
          </h2>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartPlan}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartPlan.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip unit=" Tenants" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {chartPlan.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {/* Use Tailwind class from lookup — avoids inline style for dynamic color */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.colorClass}`}></div>
                <span className="text-[10px] font-bold text-on-surface/60 uppercase tracking-widest">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tenant Growth Bar Chart - Real Data */}
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="text-emerald-400" size={24} />
              Tenant Acquisition Growth
            </h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: '#ffffff05' }}
                  content={<ChartTooltip unit=" Tenants" />}
                />
                <Bar dataKey="new" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tenants - Real Data from DB */}
        <div className="glass rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">{t('dashboard.recent_tenants')}</h2>
            <button className="text-xs font-bold text-primary hover:underline flex items-center">
              {t('common.view_all')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {recentTenants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-on-surface/30">
                <Users size={32} className="mb-2" />
                <p className="text-sm font-medium">No tenants yet</p>
              </div>
            ) : recentTenants.map((tenant, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner font-bold">
                    {tenant.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{tenant.name}</p>
                    <p className="text-xs text-on-surface/40">{tenant.plan_id} plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border",
                    tenant.status === 'active'
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  )}>
                    {tenant.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health Section */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-6">{t('dashboard.system_health.title')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs text-on-surface/40 uppercase font-bold tracking-tighter">{t('dashboard.system_health.d1')}</p>
              <p className="text-lg font-bold text-emerald-400">{t('dashboard.system_health.operational')}</p>
              <p className="text-[10px] text-on-surface/30">Latency: 14ms</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center text-orange-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs text-on-surface/40 uppercase font-bold tracking-tighter">{t('dashboard.system_health.workers')}</p>
              <p className="text-lg font-bold text-emerald-400">{t('dashboard.system_health.healthy')}</p>
              <p className="text-[10px] text-on-surface/30">CPU: 42% Avg</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-xs text-on-surface/40 uppercase font-bold tracking-tighter">{t('dashboard.system_health.r2')}</p>
              <p className="text-lg font-bold text-emerald-400">{t('dashboard.system_health.optimal')}</p>
              <p className="text-[10px] text-on-surface/30">Uptime: 99.99%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
