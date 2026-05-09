import React, { useEffect, useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCcw, 
  FileText, 
  Calendar,
  Loader2,
  Package,
  User
} from 'lucide-react';
import { api } from '../../lib/api';
import type { StockMovement } from '../../types';

const InventoryMovements: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  const fetchMovements = React.useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (dateFilter.start) params.start_date = dateFilter.start;
      if (dateFilter.end) params.end_date = dateFilter.end;
      
      const data = await api.getMovements(params);
      setMovements(data as unknown as StockMovement[]);
    } catch (err) {
      console.error('Failed to fetch movements:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, dateFilter]);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      try {
        const params: any = {};
        if (typeFilter !== 'all') params.type = typeFilter;
        if (dateFilter.start) params.start_date = dateFilter.start;
        if (dateFilter.end) params.end_date = dateFilter.end;
        
        const data = await api.getMovements(params);
        if (!ignore) {
          setMovements(data as unknown as StockMovement[]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch movements:', err);
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => { ignore = true; };
  }, [typeFilter, dateFilter]);

  const filteredMovements = movements.filter(m => 
    m.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reference_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'purchase': return <ArrowDownLeft className="text-success" size={18} />;
      case 'sale': return <ArrowUpRight className="text-error" size={18} />;
      case 'adjustment': return <RefreshCcw className="text-primary" size={18} />;
      case 'transfer': return <RefreshCcw className="text-warning" size={18} />;
      case 'return': return <ArrowDownLeft className="text-info" size={18} />;
      default: return <History className="text-text-muted" size={18} />;
    }
  };

  const getMovementBadge = (type: string) => {
    const baseClass = "text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border";
    switch (type) {
      case 'purchase': return <span className={`${baseClass} bg-success/10 text-success border-success/20`}>Stock In (Purchase)</span>;
      case 'sale': return <span className={`${baseClass} bg-error/10 text-error border-error/20`}>Stock Out (Sale)</span>;
      case 'adjustment': return <span className={`${baseClass} bg-primary/10 text-primary border-primary/20`}>Adjustment</span>;
      case 'transfer': return <span className={`${baseClass} bg-warning/10 text-warning border-warning/20`}>Transfer</span>;
      case 'return': return <span className={`${baseClass} bg-info/10 text-info border-info/20`}>Return</span>;
      default: return <span className={`${baseClass} bg-bg-tertiary text-text-muted border-border`}>{type}</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
            <History className="text-primary" size={32} />
            Inventory Movements
          </h1>
          <p className="text-text-secondary font-medium">Track every stock transaction and movement history.</p>
        </div>
        <button 
          onClick={() => fetchMovements(true)}
          className="btn btn-secondary gap-2 font-bold"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Filters Card */}
      <div className="card p-6 bg-bg-secondary/50 border-dashed">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input 
                type="text"
                placeholder="Product or SKU..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Type</label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <select 
                title="Filter by Type"
                className="input-field pl-10"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Movements</option>
                <option value="sale">Sales</option>
                <option value="purchase">Purchases</option>
                <option value="adjustment">Adjustments</option>
                <option value="transfer">Transfers</option>
                <option value="return">Returns</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="date"
                title="Start Date"
                className="input-field pl-10"
                value={dateFilter.start}
                onChange={(e) => setDateFilter({...dateFilter, start: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
              <input 
                type="date"
                title="End Date"
                className="input-field pl-10"
                value={dateFilter.end}
                onChange={(e) => setDateFilter({...dateFilter, end: e.target.value})}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Movements Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-text-muted font-bold animate-pulse">Fetching history...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Quantity</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Reference</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">User</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <History size={48} className="mb-4" />
                        <p className="font-black text-lg">No movements found</p>
                        <p className="text-sm font-medium">Try adjusting your filters or search terms.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-text-primary">
                            {new Date(m.transaction_date).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-black text-text-muted uppercase">
                            {new Date(m.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border group-hover:scale-110 transition-transform">
                            <Package size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-black text-text-primary">{m.product_name}</span>
                            <span className="text-[10px] font-mono text-text-muted font-bold uppercase">{m.sku}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getMovementIcon(m.type)}
                          {getMovementBadge(m.type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-sm font-black ${m.quantity > 0 ? 'text-success' : 'text-error'}`}>
                          {m.quantity > 0 ? '+' : ''}{m.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-muted">
                          <FileText size={14} />
                          <span className="text-xs font-bold font-mono">{m.reference_id || 'N/A'}</span>
                        </div>
                        {m.note && <p className="text-[10px] text-text-muted mt-1 italic line-clamp-1">{m.note}</p>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User size={12} />
                          </div>
                          <span className="text-xs font-bold">{m.user_name || 'System'}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background-color: white;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        }
      `}</style>
    </div>
  );
};

export default InventoryMovements;
