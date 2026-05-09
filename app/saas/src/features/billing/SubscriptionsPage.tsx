import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  AlertCircle,
  ArrowUpRight,
  MoreVertical,
  Search,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { BillingSettings } from './BillingSettings';
import { useSubscriptions, useBillingStats } from './hooks/useSubscriptions';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export function SubscriptionsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'plans'>('overview');
  const { data: subscriptions, isLoading: subsLoading } = useSubscriptions();
  const { data: stats } = useBillingStats();

  const kpis = [
    {
      label: t('subscriptions.kpis.mrr'),
      value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString()} MMK` : '0 MMK',
      change: '+12.5%',
      icon: TrendingUp,
      color: 'text-primary',
      bg: 'bg-primary/10'
    },
    {
      label: t('subscriptions.kpis.active'),
      value: subscriptions?.length || 0,
      change: '+3 this month',
      icon: Users,
      color: 'text-secondary',
      bg: 'bg-secondary/10'
    },
    {
      label: t('subscriptions.kpis.renewal'),
      value: '98.2%',
      change: '+0.4%',
      icon: CreditCard,
      color: 'text-tertiary',
      bg: 'bg-tertiary/10'
    },
    {
      label: t('subscriptions.kpis.pending'),
      value: '2',
      change: 'Action Required',
      icon: AlertCircle,
      color: 'text-error',
      bg: 'bg-error/10'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('nav.pricing_plans')}</h1>
          <p className="text-on-surface/60 mt-1">{t('subscriptions.description')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-semibold",
              activeTab === 'overview' 
                ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" 
                : "bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface/70 border-outline-variant/10"
            )}
          >
            <TrendingUp size={18} />
            <span>Overview</span>
          </button>
          <button 
            type="button"
            onClick={() => setActiveTab('plans')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-semibold",
              activeTab === 'plans' 
                ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20" 
                : "bg-surface-container-high/50 hover:bg-surface-container-high text-on-surface/70 border-outline-variant/10"
            )}
          >
            <CreditCard size={18} />
            <span>{t('settings.tabs.pricing_plans')}</span>
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpis.map((kpi, i) => (
              <div key={i} className="group p-6 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-2xl hover:border-primary/30 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl", kpi.bg)}>
                    <kpi.icon className={cn("w-6 h-6", kpi.color)} />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-medium text-primary">
                    <span>{kpi.change}</span>
                    <ArrowUpRight size={14} />
                  </div>
                </div>
                <p className="text-on-surface/50 text-sm font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Subscriptions Table */}
            <div className="lg:col-span-2 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-xl font-bold text-white">Recent Subscriptions</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" size={16} />
                    <input 
                      type="text" 
                      title="Filter tenants"
                      placeholder="Filter tenants..." 
                      className="pl-10 pr-4 py-2 bg-surface-container-high/30 border border-outline-variant/10 rounded-lg text-sm outline-none focus:border-primary/50 w-64 text-white"
                    />
                  </div>
                  <button 
                    type="button"
                    aria-label="Filter subscriptions"
                    className="p-2 bg-surface-container-high/30 border border-outline-variant/10 rounded-lg hover:bg-surface-container-high transition-colors text-on-surface/70"
                  >
                    <Filter size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-container-high/20">
                      <th className="px-6 py-4 text-xs font-bold text-on-surface/40 uppercase tracking-wider">Tenant</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface/40 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface/40 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface/40 uppercase tracking-wider">Renewal Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-on-surface/40 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {subsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={5} className="px-6 py-8 h-16 bg-surface-bright/5"></td>
                        </tr>
                      ))
                    ) : subscriptions?.map((sub) => (
                      <tr key={sub.id} className="hover:bg-surface-bright/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                              {sub.tenantName.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-white">{sub.tenantName}</p>
                              <p className="text-xs text-on-surface/50">{sub.subdomain}.kinetic.io</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-semibold text-white border border-outline-variant/20">
                            {sub.planName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <div className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              sub.status === 'active' ? "bg-primary shadow-[0_0_8px_rgba(var(--color-primary),0.6)]" : "bg-on-surface/30"
                            )}></div>
                            <span className={cn(
                              "text-sm font-medium",
                              sub.status === 'active' ? "text-primary" : "text-on-surface/50"
                            )}>
                              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-on-surface/70 text-sm">
                            <Clock size={14} />
                            <span>{new Date(sub.endDate * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            type="button"
                            aria-label="View subscription options"
                            className="p-2 text-on-surface/40 hover:text-white transition-colors"
                          >
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-4 border-t border-outline-variant/10 flex items-center justify-between">
                <p className="text-xs text-on-surface/40 font-medium">Showing {subscriptions?.length || 0} active subscriptions</p>
                <div className="flex gap-2">
                  <button type="button" disabled className="px-3 py-1 text-xs bg-surface-container-high/50 text-on-surface/30 rounded border border-outline-variant/10">Previous</button>
                  <button type="button" disabled className="px-3 py-1 text-xs bg-surface-container-high/50 text-on-surface/30 rounded border border-outline-variant/10">Next</button>
                </div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="space-y-6">
              <div className="bg-linear-to-br from-primary/20 to-secondary/10 backdrop-blur-md border border-primary/20 rounded-2xl p-6 relative overflow-hidden group shadow-2xl">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-lg font-bold text-white mb-6">Plan Distribution</h3>
                <div className="space-y-6 relative z-10">
                  {stats?.distribution.map((item, i) => {
                    const planInfo = {
                      starter: { name: t('tenants.plans.starter'), color: 'bg-emerald-500' },
                      retail_core: { name: t('tenants.plans.retail_core'), color: 'bg-primary' },
                      business_pro: { name: t('tenants.plans.business_pro'), color: 'bg-secondary' },
                      enterprise: { name: t('tenants.plans.enterprise_edge'), color: 'bg-purple-500' },
                    }[item.plan] || { name: item.plan, color: 'bg-primary' };

                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between text-sm items-baseline">
                          <span className="text-white font-bold">{planInfo.name}</span>
                          <div className="flex items-center gap-2">
                             <span className="text-xs text-white/40">{item.count} Tenants</span>
                             <span className="text-white font-mono font-black">{Math.round((item.count / (subscriptions?.length || 1)) * 100)}%</span>
                          </div>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / (subscriptions?.length || 1)) * 100}%` }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className={cn("h-full shadow-[0_0_12px_rgba(var(--color-primary),0.3)]", planInfo.color)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="text-primary w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white">Billing Health</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-white">Auto-billing active</p>
                      <p className="text-xs text-on-surface/50">95% of tenants have valid payment methods.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5"></div>
                    <div>
                      <p className="text-sm font-semibold text-white">Upcoming renewals</p>
                      <p className="text-xs text-on-surface/50">12 subscriptions renew in the next 7 days.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <BillingSettings />
      )}
    </div>
  );
}
