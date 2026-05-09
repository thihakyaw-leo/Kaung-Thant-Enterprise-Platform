import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  RefreshCcw, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  MapPin,
  MoreVertical,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';

const StockAdjustments: React.FC = () => {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState('');

  const fetchAdjustments = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const data = await api.getAdjustments({ 
        location_id: selectedLocation || undefined,
        search: searchTerm || undefined
      });
      setAdjustments(data);
    } catch (err) {
      console.error('Failed to fetch adjustments', err);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation, searchTerm]);

  useEffect(() => {
    const init = async () => {
      try {
        const locs = await api.getLocations();
        setLocations(locs);
        if (locs.length > 0) setSelectedLocation(locs[0].id as string);
        await fetchAdjustments(true);
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, [fetchAdjustments]);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Stock Adjustments</h1>
          <p className="text-text-secondary font-medium tracking-tight">Track and manage inventory reconciliation records.</p>
        </div>
        <Link to="/inventory/adjustments/new" className="btn btn-primary shadow-lg shadow-primary/20 font-black px-8">
          <Plus size={18} className="mr-2" /> New Adjustment
        </Link>
      </div>

      <div className="card p-4 bg-bg-secondary/50 border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text"
            title="Search Adjustments"
            placeholder="Search by Adjustment No..."
            className="w-full bg-white border border-border rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            title="Filter by Location"
            className="flex-1 md:w-64 bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm appearance-none"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">All Locations</option>
            {locations.map(l => <option key={l.id} value={l.id as string}>{l.name}</option>)}
          </select>
          <button 
            onClick={() => fetchAdjustments()}
            title="Refresh Data"
            className="p-3 bg-white border border-border rounded-xl text-text-muted hover:text-primary transition-all shadow-sm"
          >
            <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="card overflow-hidden border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-secondary border-b border-border">
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Adjustment Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Product</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-center">Qty</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest">Reason</th>
                <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6"><div className="h-10 bg-bg-secondary rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : adjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4 opacity-20">
                      <ClipboardList size={64} />
                      <p className="font-black text-xl">No adjustments found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr key={adj.id} className="hover:bg-bg-secondary/30 transition-all group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-text-primary group-hover:text-primary transition-colors uppercase tracking-tight">{adj.adjustNo}</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase mt-1">
                          <Calendar size={10} /> {new Date(adj.createdAt * 1000).toLocaleDateString()}
                          <span className="opacity-20">•</span>
                          <MapPin size={10} /> {adj.locationName}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex flex-col">
                          <span className="font-black text-text-primary">{adj.stockName}</span>
                          <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{adj.stockCode}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {adj.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success/10 text-success text-[10px] font-black uppercase tracking-widest ring-1 ring-success/20">
                          <ArrowUpRight size={12} /> Stock In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/10 text-error text-[10px] font-black uppercase tracking-widest ring-1 ring-error/20">
                          <ArrowDownLeft size={12} /> Stock Out
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-lg font-black ${adj.type === 'IN' ? 'text-success' : 'text-error'}`}>
                        {adj.type === 'IN' ? '+' : '-'}{adj.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-text-secondary line-clamp-1">{adj.reason || '-'}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button title="Options" className="p-2 text-text-muted hover:text-primary transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustments;
