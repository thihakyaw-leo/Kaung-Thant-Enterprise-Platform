import { 
  CreditCard, 
  Download, 
  AlertCircle, 
  TrendingUp, 
  DollarSign, 
  Plus, 
  Search, 
  Filter,
  Eye,
  FileText,
  ArrowUpRight,
  CheckCircle2,
  MoreVertical,
  ArrowDownLeft,
  ChevronRight,
  Globe,
  RefreshCcw,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { useInvoices } from './hooks/useSubscriptions';


export const BillingManagement = () => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'plans'>('invoices');
  // FIX #5: Use real invoices from DB instead of hardcoded mock array
  const { data: invoices, isLoading: invoicesLoading } = useInvoices();

  // Subscription tier display data (static config, not from DB)
  const tiers = [
    {
      id: 'starter',
      name: 'Starter',
      price: '50,000',
      currency: 'Kyat(ks)',
      users: 3,
      products: 500,
      color: 'text-emerald-400',
      description: 'Ideal for small retail shops starting out.'
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '150,000',
      currency: 'Kyat(ks)',
      users: 10,
      products: 5000,
      color: 'text-primary',
      description: 'Best for growing businesses with multiple staff.'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Custom',
      currency: '',
      users: 'Unlimited' as const,
      products: 'Unlimited' as const,
      color: 'text-secondary',
      description: 'Full-scale solution for multi-branch corporations.'
    },
  ];

  // Revenue projection chart data
  const projectionData = [
    { name: 'May', revenue: 42500, projection: 42500 },
    { name: 'Jun', revenue: 44000, projection: 46000 },
    { name: 'Jul', revenue: null, projection: 51000 },
    { name: 'Aug', revenue: null, projection: 58000 },
    { name: 'Sep', revenue: null, projection: 65000 },
    { name: 'Oct', revenue: null, projection: 74000 },
  ];

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    // Simulate report generation
    setTimeout(() => {
      setIsExporting(false);
      alert('Financial Report (May 2024) has been generated and downloaded.');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display-lg font-bold text-white tracking-tight flex items-center gap-3">
            <CreditCard className="text-primary" size={32} />
            Billing & Subscriptions
          </h1>
          <p className="text-on-surface/60">Revenue tracking, plan management and invoice oversight for all tenants.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 border border-white/5 uppercase tracking-widest disabled:opacity-50" 
            title="Export Financial Data"
          >
            {isExporting ? <RefreshCcw className="animate-spin" size={14} /> : <Download size={14} />}
            {isExporting ? 'Generating...' : 'Financial Report'}
          </button>
          <button 
            onClick={() => setShowPlanModal(true)}
            className="px-4 py-2 bg-primary text-on-primary rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-primary/20 uppercase tracking-widest"
          >
            <Plus size={14} />
            New Pricing Plan
          </button>
        </div>
      </div>

      {/* Pricing Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowPlanModal(false)}></div>
          <div className="glass w-full max-w-xl rounded-[32px] border border-white/10 relative z-10 overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/2">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Plus className="text-primary" size={24} />
                Create New Pricing Plan
              </h2>
              <button 
                onClick={() => setShowPlanModal(false)} 
                className="p-2 hover:bg-white/5 rounded-xl text-on-surface/40 hover:text-white transition-all"
                title="Close Modal"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Plan Name</label>
                  <input type="text" placeholder="e.g. Growth" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Monthly Price (MMK)</label>
                  <input type="text" placeholder="e.g. 250,000" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">User Limit</label>
                  <input type="number" placeholder="25" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Product Limit</label>
                  <input type="number" placeholder="10000" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Plan Description</label>
                <textarea rows={3} placeholder="Describe the target audience for this plan..." className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-all resize-none"></textarea>
              </div>
            </div>
            <div className="p-8 border-t border-white/5 bg-white/2 flex justify-end gap-3">
              <button onClick={() => setShowPlanModal(false)} className="px-6 py-3 rounded-xl text-xs font-bold text-on-surface/40 hover:text-white transition-all uppercase tracking-widest">Cancel</button>
              <button className="px-8 py-3 bg-primary text-on-primary rounded-xl text-xs font-bold shadow-lg shadow-primary/20 uppercase tracking-widest">Save Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Projection Chart */}
        <div className="lg:col-span-2 glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="text-primary" size={24} />
                Revenue Projection (6M)
              </h2>
              <p className="text-[10px] text-on-surface/40 uppercase tracking-widest mt-1">AI-based growth forecasting based on current MRR</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-emerald-400 justify-end mb-1">
                <ArrowUpRight size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">+18.4% Est. Growth</span>
              </div>
              <span className="text-2xl font-bold text-white">74,000 Kyat(ks)</span>
            </div>
          </div>
          <div className="h-[260px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1A1C1E', border: '1px solid #ffffff10', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="projection" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorProj)" name="Projected Revenue" />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" name="Actual Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex flex-col gap-6">
          {[
            { label: 'Current MRR', value: '42,500 Kyat(ks)', change: '+12.5%', icon: DollarSign, color: 'text-emerald-400', trend: 'up' },
            { label: 'Avg. Revenue / Tenant', value: '1,450 Kyat(ks)', change: '+240 Kyat(ks)', icon: TrendingUp, color: 'text-primary', trend: 'up' },
            { label: 'Unpaid Receivables', value: '3,050 Kyat(ks)', change: '5 Invoices', icon: AlertCircle, color: 'text-rose-400', trend: 'down' },
          ].map((s, i) => (
            <div key={i} className="glass p-6 rounded-[24px] border border-white/5 flex items-center justify-between group hover:border-primary/20 transition-all cursor-pointer">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{s.label}</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white">{s.value}</span>
                  <span className={cn(
                    "text-[10px] font-bold uppercase flex items-center gap-0.5",
                    s.trend === 'up' ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {s.trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                    {s.change}
                  </span>
                </div>
              </div>
              <div className={cn("p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-all", s.color)}>
                <s.icon size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="glass rounded-[32px] overflow-hidden border border-white/5 flex flex-col min-h-[500px]">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/2">
          <div className="flex gap-2 p-1 bg-black/20 rounded-2xl w-fit border border-white/5">
            <button 
              onClick={() => setActiveTab('invoices')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest",
                activeTab === 'invoices' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface/40 hover:text-white"
              )}
            >
              <FileText size={16} />
              Invoices History
            </button>
            <button 
              onClick={() => setActiveTab('plans')}
              className={cn(
                "px-8 py-3 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest",
                activeTab === 'plans' ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface/40 hover:text-white"
              )}
            >
              <Plus size={16} />
              Subscription Tiers
            </button>
          </div>
          
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" size={16} />
              <input 
                type="text" 
                placeholder={activeTab === 'invoices' ? "Search by tenant or ID..." : "Filter plans..."} 
                className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder:text-on-surface/30 focus:outline-none focus:border-primary/50 w-64 transition-all"
              />
            </div>
            <button className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-on-surface/40 hover:text-white transition-all" title="Advanced Filter">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {activeTab === 'invoices' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Invoice ID</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Tenant Name</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Payment Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Issue Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest">Due Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-on-surface/40 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoicesLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-8 py-6 bg-surface-bright/5 h-20"></td>
                    </tr>
                  ))
                ) : !invoices || invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-8 py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-on-surface/30">
                        <FileText size={40} />
                        <p className="font-medium">No invoices found</p>
                        <p className="text-xs">Invoices will appear here when tenants are billed.</p>
                      </div>
                    </td>
                  </tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-white/2 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-white tracking-wider font-mono">{inv.id}</span>
                        <span className="text-[10px] text-on-surface/40">{inv.subscriptionId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Globe size={14} className="text-primary" />
                        </div>
                        <span className="text-sm font-medium text-white">{inv.tenantName}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-mono text-white tracking-tight">
                      {inv.amount.toLocaleString()} Kyat(ks)
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter border",
                        inv.status === 'paid' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        inv.status === 'overdue' ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-on-surface/40 font-mono">
                      {new Date(inv.issuedDate * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-sm text-on-surface/40 font-mono">
                      {new Date(inv.dueDate * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-lg text-primary transition-all group-hover:scale-110" title="View Invoice">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-lg text-on-surface/40 hover:text-white transition-all" title="More Options">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div key={tier.id} className="glass p-8 rounded-[32px] border border-white/5 relative overflow-hidden flex flex-col group hover:border-primary/40 transition-all duration-500">
                <div className={cn("absolute top-0 right-0 w-40 h-40 -mr-16 -mt-16 bg-current opacity-10 blur-[60px] transition-all group-hover:opacity-20", tier.color)} />
                <div className="relative z-10 mb-6">
                  <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 border border-white/10", tier.color)}>
                    <Zap size={24} />
                  </div>
                  <h3 className={cn("text-2xl font-bold mb-2", tier.color)}>{tier.name}</h3>
                  <p className="text-sm text-on-surface/40 leading-relaxed">{tier.description}</p>
                </div>
                
                <div className="relative z-10 mb-8 border-y border-white/5 py-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-display-lg font-bold text-white">{tier.price}</span>
                    <span className="text-sm font-medium text-on-surface/40 uppercase tracking-widest">{tier.currency ? `${tier.currency} / mo` : ''}</span>
                  </div>
                </div>

                <ul className="relative z-10 space-y-4 mb-8 flex-1">
                  <li className="flex items-center gap-3 text-sm text-on-surface/70">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Up to <span className="text-white font-bold">{tier.users}</span> active users</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface/70">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span><span className="text-white font-bold">{tier.products}</span> product inventory limit</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm text-on-surface/70">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                    <span>Real-time POS Syncing</span>
                  </li>
                </ul>

                <button className={cn(
                  "relative z-10 w-full py-4 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-white/10",
                  tier.id === 'professional' ? "bg-primary text-on-primary border-none shadow-xl shadow-primary/20" : "bg-white/5 text-white hover:bg-white/10"
                )}>
                  Edit Plan Configuration
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Zap = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
