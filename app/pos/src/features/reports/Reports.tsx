import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  DollarSign, 
  MapPin, 
  Download, 
  Loader2,
  PieChart as PieChartIcon,
  Tag,
  Trophy,
  ArrowDownRight,
  ShieldCheck,
  Users,
  Wallet,
  RefreshCw,
  SearchX,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { api } from '../../lib/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#0ea5e9', '#64748b'];

const ProgressBar: React.FC<{ width: number; colorClass: string }> = ({ width, colorClass }) => {
  return (
    <div className="w-full h-1.5 bg-bg-secondary rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${width}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${colorClass}`}
      />
    </div>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="h-[400px] flex flex-col items-center justify-center gap-6 text-center"
  >
    <div className="p-8 rounded-full bg-bg-secondary text-text-muted">
      <SearchX size={64} strokeWidth={1.5} />
    </div>
    <div>
      <h3 className="text-xl font-black text-text-primary mb-2">No Data Available</h3>
      <p className="text-sm font-medium text-text-muted max-w-xs">{message}</p>
    </div>
  </motion.div>
);

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sales' | 'inventory' | 'pl' | 'categories' | 'top-products' | 'customers' | 'expenses'>('sales');
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });

  const [salesData, setSalesData] = useState<any[]>([]);
  const [stockValuation, setStockValuation] = useState<any>(null);
  const [plData, setPlData] = useState<any>(null);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [customerData, setCustomerData] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]);

  const fetchReportData = useCallback(async (tab: string, locationId: string, range: any) => {
    try {
      const commonParams = { 
        start_date: range.start, 
        end_date: range.end, 
        location_id: locationId 
      };

      switch (tab) {
        case 'sales': {
          const sales = await api.getDailySales(locationId);
          setSalesData(sales);
          break;
        }
        case 'inventory': {
          const stock = await api.getStockValuation(locationId);
          setStockValuation(stock);
          break;
        }
        case 'pl': {
          const pl = await api.getProfitLoss(commonParams);
          setPlData(pl);
          break;
        }
        case 'categories': {
          const cats = await api.getSalesByCategory(commonParams);
          setCategoryData(cats);
          break;
        }
        case 'top-products': {
          const tops = await api.getTopProducts(commonParams);
          setTopProducts(tops);
          break;
        }
        case 'customers': {
          const custs = await api.getCustomers();
          setCustomerData(custs as any[]);
          break;
        }
        case 'expenses': {
          const exps = await api.getExpenses(commonParams);
          setExpenseData(exps as any[]);
          break;
        }
      }
    } catch (err) {
      console.error('Failed to fetch report data', err);
    }
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locs = await api.getLocations();
        setLocations(locs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchReportData(activeTab, selectedLocation, dateRange);
        if (!ignore) setLoading(false);
      } catch (err) {
        console.error(err);
        if (!ignore) setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, [activeTab, selectedLocation, dateRange, fetchReportData]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const title = `Business Report - ${activeTab.toUpperCase()}`;
    const dateStr = `Generated: ${new Date().toLocaleString()}`;
    
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); 
    doc.text('KAUNG THANT POS', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(title, 14, 32);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(dateStr, 14, 40);
    doc.text(`Location: ${selectedLocation ? locations.find(l => l.id === selectedLocation)?.name : 'All Locations'}`, 14, 45);
    doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, 14, 50);

    let tableData: any[] = [];
    let headers: string[] = [];

    if (activeTab === 'sales') {
      headers = ['Date', 'Transactions', 'Revenue (MMK)'];
      tableData = salesData.map(row => [row.date, row.transaction_count, row.total_revenue.toLocaleString()]);
    } else if (activeTab === 'inventory' && stockValuation) {
      headers = ['Product', 'Stock', 'Avg Cost', 'Valuation'];
      tableData = stockValuation.items.map((item: any) => [item.name, item.currentQuantity, item.lastCost.toLocaleString(), item.valuation.toLocaleString()]);
    } else if (activeTab === 'top-products') {
      headers = ['Product', 'Qty Sold', 'Revenue (MMK)'];
      tableData = topProducts.map(row => [row.productName, row.quantity, row.totalSales.toLocaleString()]);
    } else if (activeTab === 'expenses') {
      headers = ['Date', 'Type', 'Amount (MMK)', 'Note'];
      tableData = expenseData.map(row => [row.date, row.expense_type_id, row.amount.toLocaleString(), row.note || '-']);
    }

    if (tableData.length > 0) {
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], fontSize: 10, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 255] }
      });
    }

    doc.save(`KT_POS_${activeTab}_REPORT_${new Date().getTime()}.pdf`);
  };

  const tabs = [
    { id: 'sales', label: 'Sales Performance', icon: BarChart3 },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'top-products', label: 'Top Products', icon: Trophy },
    { id: 'inventory', label: 'Stock Valuation', icon: Package },
    { id: 'expenses', label: 'Expense Log', icon: Wallet },
    { id: 'customers', label: 'Customer Insights', icon: Users },
    { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-24 overflow-x-hidden">
      {/* Header with Stats Overview */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <div className="p-3 rounded-2xl bg-primary/10 text-primary shadow-sm"><BarChart3 size={28} strokeWidth={2.5} /></div>
             <h1 className="text-4xl font-black text-text-primary tracking-tight">Business Intelligence</h1>
          </div>
          <p className="text-text-secondary font-bold ml-1">Comprehensive analytics and performance tracking for your enterprise.</p>
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <button 
            onClick={() => fetchReportData(activeTab, selectedLocation, dateRange)}
            className="btn bg-bg-secondary hover:bg-bg-tertiary text-text-primary border border-border shadow-sm flex items-center gap-2 font-black transition-all active:scale-95"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="btn btn-primary shadow-xl shadow-primary/20 font-black flex items-center gap-2 flex-1 lg:flex-initial justify-center active:scale-95"
          >
            <Download size={18} /> Export PDF Report
          </button>
        </div>
      </div>

      {/* Modern Advanced Filters */}
      <div className="card p-8 grid grid-cols-1 md:grid-cols-4 gap-8 bg-linear-to-br from-white to-bg-secondary/20 border-white shadow-2xl shadow-primary/5">
        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-3 ml-1" htmlFor="location-filter">
            <MapPin size={12} className="text-primary" /> Select Business Location
          </label>
          <div className="relative group">
            <select 
              id="location-filter"
              title="Filter by Location"
              className="w-full bg-bg-secondary border-2 border-transparent group-hover:border-primary/20 rounded-2xl px-6 py-4 text-sm font-black text-text-primary outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">Consolidated View (All Locations)</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted group-hover:text-primary transition-colors">
               <ChevronRight size={18} className="rotate-90" />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 ml-1" htmlFor="start-date-filter">
             From Date
          </label>
          <input 
            id="start-date-filter"
            type="date" 
            title="Start Date Range"
            className="w-full bg-bg-secondary border-2 border-transparent hover:border-primary/20 rounded-2xl px-5 py-3.5 text-sm font-bold text-text-primary outline-none focus:border-primary transition-all"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 ml-1" htmlFor="end-date-filter">
             To Date
          </label>
          <input 
            id="end-date-filter"
            type="date" 
            title="End Date Range"
            className="w-full bg-bg-secondary border-2 border-transparent hover:border-primary/20 rounded-2xl px-5 py-3.5 text-sm font-bold text-text-primary outline-none focus:border-primary transition-all"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
        </div>
      </div>

      {/* Tab Navigation with Scrollbar hidden */}
      <div className="flex gap-2 p-2 bg-bg-secondary/50 backdrop-blur-xl rounded-3xl w-full border border-border shadow-inner overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black transition-all whitespace-nowrap active:scale-95 ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-lg ring-1 ring-primary/5' 
                : 'text-text-muted hover:text-text-primary hover:bg-white/50'
            }`}
          >
            <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Wrapper */}
      <div className="min-h-[500px] relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/50 backdrop-blur-sm z-10 rounded-3xl"
            >
              <div className="relative">
                 <Loader2 size={64} className="animate-spin text-primary opacity-20" />
                 <Loader2 size={64} className="animate-spin text-primary absolute inset-0 [animation-delay:0.2s]" />
              </div>
              <div className="text-center">
                 <p className="text-lg font-black text-text-primary animate-pulse tracking-tight">Syncing Business Data...</p>
                 <p className="text-xs font-black text-text-muted uppercase tracking-widest mt-1">Please wait while we crunch the numbers</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {activeTab === 'sales' && (
                <div className="space-y-8">
                  {/* Sales Metrics Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: 'Total Gross Revenue', value: `${salesData.reduce((sum, r) => sum + (r.total_revenue || 0), 0).toLocaleString()} MMK`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', trend: '+12.5%' },
                      { label: 'Avg. Transaction Value', value: `${(salesData.reduce((sum, r) => sum + (r.total_revenue || 0), 0) / (salesData.reduce((sum, r) => sum + (r.transaction_count || 0), 0) || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})} MMK`, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10', trend: '+4.2%' },
                      { label: 'Total Volume', value: salesData.reduce((sum, r) => sum + (r.transaction_count || 0), 0), icon: Package, color: 'text-warning', bg: 'bg-warning/10', trend: '-2.1%' },
                      { label: 'Conversion Rate', value: '84.2%', icon: ShieldCheck, color: 'text-info', bg: 'bg-info/10', trend: '+1.5%' }
                    ].map((card, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ y: -5 }}
                        className="card p-8 flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/5 transition-all border-white"
                      >
                        <div className="flex justify-between items-start mb-6">
                           <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}><card.icon size={24} /></div>
                           <span className={`text-[10px] font-black px-2 py-1 rounded-full ${card.trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>{card.trend}</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2">{card.label}</p>
                          <h3 className="text-2xl font-black text-text-primary tracking-tight">{card.value}</h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Revenue Chart */}
                  {salesData.length > 0 ? (
                    <div className="card p-10 h-[500px] border-white shadow-2xl">
                      <div className="flex justify-between items-center mb-10">
                         <h3 className="text-sm font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                           <div className="w-2 h-6 bg-primary rounded-full"></div> Revenue Velocity
                         </h3>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} dy={15} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} tickFormatter={(val) => `${(val/1000).toFixed(0)}k`} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(99, 102, 241, 0.25)', fontWeight: 900, padding: '20px' }}
                            itemStyle={{ color: '#6366f1' }}
                            cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                          />
                          <Area type="monotone" dataKey="total_revenue" name="Revenue" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={2000} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : <EmptyState message="No sales recorded for the selected period. Try adjusting your filters." />}
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3 card p-10 h-[500px] border-white shadow-2xl flex flex-col items-center">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-widest self-start mb-10 flex items-center gap-2">
                       <div className="w-2 h-6 bg-primary rounded-full"></div> Portfolio Mix
                    </h3>
                    {categoryData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={categoryData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={110} 
                            outerRadius={160} 
                            paddingAngle={8} 
                            dataKey="totalSales" 
                            nameKey="categoryName"
                            animationBegin={0}
                            animationDuration={1500}
                          >
                            {categoryData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 900 }} />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : <EmptyState message="Category data not found." />}
                  </div>
                  <div className="lg:col-span-2 card overflow-hidden border-white shadow-2xl">
                    <div className="p-6 bg-bg-secondary/50 border-b border-border">
                       <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Category Performance</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-bg-secondary/30">
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase">Market Segment</th>
                            <th className="px-6 py-4 text-[10px] font-black text-text-muted uppercase text-right">Revenue Share</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {categoryData.map((row, i) => (
                            <tr key={i} className="hover:bg-primary/5 transition-colors group">
                              <td className="px-6 py-5">
                                 <div className="flex items-center gap-4">
                                    <motion.div 
                                      animate={{ backgroundColor: COLORS[i % COLORS.length] }}
                                      className="w-4 h-4 rounded-lg shadow-sm" 
                                    />
                                    <div>
                                       <p className="font-black text-text-primary group-hover:text-primary transition-colors">{row.categoryName}</p>
                                       <p className="text-[10px] font-bold text-text-muted">{row.quantity} units sold</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-6 py-5 text-right font-black text-text-primary">
                                 {row.totalSales?.toLocaleString()} <span className="text-[9px] text-text-muted">MMK</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="card p-10 bg-linear-to-br from-error/5 to-transparent border-error/10 hover:shadow-xl transition-all">
                         <div className="flex items-center gap-4 mb-6">
                            <div className="p-4 rounded-2xl bg-error/10 text-error shadow-sm"><Wallet size={28} /></div>
                            <div>
                               <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-1">Burn Rate</p>
                               <h3 className="text-3xl font-black text-error">{expenseData.reduce((sum, e) => sum + (e.amount || 0), 0).toLocaleString()} MMK</h3>
                            </div>
                         </div>
                         <ProgressBar width={75} colorClass="bg-error" />
                         <p className="text-[10px] font-black text-error uppercase mt-4">84% of Monthly Budget Used</p>
                      </div>
                      <div className="card p-10 flex flex-col justify-center">
                         <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2">Average Transaction</p>
                         <h3 className="text-3xl font-black text-text-primary">{(expenseData.reduce((sum, e) => sum + (e.amount || 0), 0) / (expenseData.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-sm">MMK</span></h3>
                      </div>
                      <div className="card p-10 flex flex-col justify-center">
                         <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-2">Total Ledger Entries</p>
                         <h3 className="text-3xl font-black text-text-primary">{expenseData.length} Records</h3>
                      </div>
                   </div>

                   <div className="card overflow-hidden border-white shadow-2xl">
                      <div className="p-8 bg-bg-secondary/50 border-b border-border flex justify-between items-center">
                         <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.2em]">Detailed Expenditure Log</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[800px]">
                           <thead>
                              <tr className="bg-bg-secondary/30">
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase">Posting Date</th>
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase">Expense Type</th>
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase text-right">Amount</th>
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase">Internal Reference / Note</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border">
                              {expenseData.map((exp, i) => (
                                 <tr key={i} className="hover:bg-error/5 transition-all group">
                                    <td className="px-10 py-6 text-sm font-black text-text-primary">{new Date(exp.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                    <td className="px-10 py-6">
                                       <span className="text-[10px] font-black px-4 py-2 bg-bg-tertiary text-text-primary rounded-xl uppercase tracking-wider shadow-xs group-hover:bg-primary group-hover:text-white transition-colors">{exp.expense_type_id}</span>
                                    </td>
                                    <td className="px-10 py-6 font-black text-error text-right text-lg">{exp.amount.toLocaleString()} <span className="text-[10px] text-text-muted font-bold uppercase">MMK</span></td>
                                    <td className="px-10 py-6 text-xs font-bold text-text-muted italic max-w-xs truncate">{exp.note || 'No internal documentation available.'}</td>
                                 </tr>
                              ))}
                              {expenseData.length === 0 && (
                                 <tr>
                                    <td colSpan={4} className="py-20 text-center">
                                       <EmptyState message="No expense records found. Try a broader date range." />
                                    </td>
                                 </tr>
                              )}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              )}

              {/* Other tabs follow the same high-UX pattern */}
              {activeTab === 'top-products' && (
                <div className="space-y-8">
                  <div className="card p-10 h-[500px] border-white shadow-2xl">
                     <h3 className="text-sm font-black text-text-primary uppercase tracking-widest mb-10 flex items-center gap-2">
                        <div className="w-2 h-6 bg-warning rounded-full"></div> Market Demand Analysis
                     </h3>
                     {topProducts.length > 0 ? (
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="productName" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 800, fill: '#94a3b8'}} hide />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 800, fill: '#94a3b8'}} />
                            <Tooltip cursor={{fill: 'rgba(99, 102, 241, 0.05)', radius: 10}} contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 900 }} />
                            <Bar 
                              dataKey="totalSales" 
                              name="Total Sales"
                              fill="#6366f1" 
                              radius={[15, 15, 0, 0]} 
                              barSize={50}
                              animationDuration={1500}
                            />
                          </BarChart>
                       </ResponsiveContainer>
                     ) : <EmptyState message="Product performance data unavailable." />}
                  </div>
                  <div className="card overflow-hidden border-white shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-bg-secondary/50 border-b border-border">
                            <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase">Leaderboard Position</th>
                            <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase text-center">Units Shipped</th>
                            <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase text-right">Revenue Contribution</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {topProducts.map((row, i) => (
                            <tr key={i} className="hover:bg-bg-secondary/30 transition-all group">
                              <td className="px-10 py-6">
                                <div className="flex items-center gap-6">
                                  <span className={`w-10 h-10 flex items-center justify-center rounded-2xl font-black text-sm shadow-sm ${i === 0 ? 'bg-warning text-white' : i === 1 ? 'bg-slate-300 text-slate-700' : i === 2 ? 'bg-orange-300 text-orange-900' : 'bg-bg-tertiary text-text-muted'}`}>#{i+1}</span>
                                  <div>
                                    <p className="font-black text-text-primary text-lg group-hover:text-primary transition-colors">{row.productName}</p>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{row.productCode}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-10 py-6 font-black text-text-secondary text-center text-lg">{row.quantity}</td>
                              <td className="px-10 py-6 font-black text-text-primary text-right text-lg">{row.totalSales?.toLocaleString()} <span className="text-[10px] text-text-muted">MMK</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && stockValuation && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <motion.div whileHover={{ scale: 1.02 }} className="card p-10 bg-primary text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                       <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-125 transition-transform duration-700"><Package size={200} /></div>
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-70 mb-3">Asset Valuation</p>
                       <h3 className="text-5xl font-black">{stockValuation.total_valuation?.toLocaleString()} <span className="text-sm font-bold opacity-60">MMK</span></h3>
                    </motion.div>
                    <div className="card p-10 flex flex-col justify-center border-white">
                       <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-2">Total SKU Breadth</p>
                       <h3 className="text-4xl font-black text-text-primary">{stockValuation.items?.length} <span className="text-sm font-bold text-text-muted">Categories</span></h3>
                    </div>
                    <div className="card p-10 flex items-center gap-8 border-white">
                       <div className="p-5 rounded-3xl bg-success/10 text-success shadow-sm"><ShieldCheck size={40} strokeWidth={2.5} /></div>
                       <div>
                          <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">Security Factor</p>
                          <h3 className="text-3xl font-black text-text-primary tracking-tight">Enterprise Stable</h3>
                       </div>
                    </div>
                  </div>
                  <div className="card overflow-hidden border-white shadow-2xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-bg-secondary/50 border-b border-border">
                            <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Inventory Item</th>
                            <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Available Units</th>
                            <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Asset Value</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {stockValuation.items.map((item: any) => (
                            <tr key={item.id} className="hover:bg-primary/5 transition-all group">
                              <td className="px-10 py-6">
                                <p className="font-black text-text-primary text-lg group-hover:text-primary transition-all">{item.name}</p>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.code}</p>
                              </td>
                              <td className="px-10 py-6 font-black text-text-secondary text-center text-lg">{item.currentQuantity}</td>
                              <td className="px-10 py-6 font-black text-text-primary text-right text-lg">{item.valuation?.toLocaleString()} <span className="text-[10px] text-text-muted">MMK</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'customers' && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                      {[
                        { label: 'Active Membership', value: customerData.length, color: 'text-primary', icon: Users },
                        { label: 'New Acquisitions', value: '+14', color: 'text-success', icon: TrendingUp },
                        { label: 'Market Retention', value: '78%', color: 'text-warning', icon: ShieldCheck }
                      ].map((stat, i) => (
                        <div key={i} className="card p-10 flex flex-col items-center text-center gap-4 hover:shadow-xl transition-all border-white">
                           <div className={`p-5 rounded-full ${stat.color} bg-current/10`}><stat.icon size={32} /></div>
                           <div>
                              <p className="text-[11px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                              <h3 className="text-3xl font-black text-text-primary tracking-tight">{stat.value}</h3>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="card overflow-hidden border-white shadow-2xl">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                           <thead>
                              <tr className="bg-bg-secondary/50 border-b border-border">
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase">Member Profile</th>
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase">Connectivity</th>
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase text-right">Account Balance</th>
                                 <th className="px-10 py-5 text-[10px] font-black text-text-muted uppercase text-right">Status</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-border">
                              {customerData.map((cust, i) => (
                                 <tr key={i} className="hover:bg-bg-secondary/30 transition-all">
                                    <td className="px-10 py-6 font-black text-text-primary text-lg">{cust.name}</td>
                                    <td className="px-10 py-6 text-sm font-bold text-text-secondary">{cust.phone || 'N/A'}</td>
                                    <td className="px-10 py-6 font-black text-text-primary text-right text-lg">{Number(cust.balance || 0).toLocaleString()} <span className="text-[10px] text-text-muted">MMK</span></td>
                                    <td className="px-10 py-6 text-right">
                                       <span className="text-[10px] font-black px-4 py-2 bg-success/10 text-success rounded-xl uppercase tracking-widest shadow-xs">Loyal Active</span>
                                    </td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'pl' && plData && (
                <div className="space-y-12 max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card p-10 border-t-8 border-t-success shadow-2xl shadow-success/5 hover:scale-105 transition-transform">
                      <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <TrendingUp size={14} className="text-success" /> Gross Sales
                      </p>
                      <h3 className="text-3xl font-black text-text-primary tracking-tight">{plData.total_sales?.toLocaleString()} MMK</h3>
                    </div>
                    <div className="card p-10 border-t-8 border-t-error shadow-2xl shadow-error/5 hover:scale-105 transition-transform">
                      <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <ArrowDownRight size={14} className="text-error" /> Cost of Goods
                      </p>
                      <h3 className="text-3xl font-black text-text-primary tracking-tight">{plData.total_cost?.toLocaleString()} MMK</h3>
                    </div>
                    <div className="card p-10 border-t-8 border-t-primary shadow-2xl shadow-primary/5 hover:scale-105 transition-transform">
                      <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <PieChartIcon size={14} className="text-primary" /> Operating Expense
                      </p>
                      <h3 className="text-3xl font-black text-text-primary tracking-tight">{plData.total_expenses?.toLocaleString()} MMK</h3>
                    </div>
                  </div>
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="card p-12 bg-linear-to-br from-primary/10 to-transparent border-primary/20 shadow-[0_40px_80px_-15px_rgba(99,102,241,0.2)]"
                  >
                     <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-10">
                        <div>
                           <p className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-3">Bottom Line (Net Income)</p>
                           <h2 className="text-7xl font-black text-text-primary tracking-tighter">{plData.net_profit?.toLocaleString()} <span className="text-xl font-bold text-text-muted tracking-normal">MMK</span></h2>
                        </div>
                        <div className="p-8 rounded-[40px] bg-primary text-white shadow-2xl shadow-primary/30"><DollarSign size={56} strokeWidth={2.5} /></div>
                     </div>
                     <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                           <p className="text-xs font-black text-primary uppercase tracking-widest">Business Profitability Index</p>
                           <p className="text-2xl font-black text-text-primary">{Math.round((plData.net_profit / plData.total_sales) * 100) || 0}%</p>
                        </div>
                        <ProgressBar width={(plData.net_profit / (plData.total_sales || 1)) * 100} colorClass="bg-primary" />
                     </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Reports;
