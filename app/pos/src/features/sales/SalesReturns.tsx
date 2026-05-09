import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  RotateCcw, 
  MapPin, 
  Calendar, 
  Loader2,
  ChevronRight,
  ArrowLeft,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const SalesReturns: React.FC = () => {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchReturns = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const data = await api.getSalesReturns();
      setReturns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchReturns(true);
    };
    init();
  }, [fetchReturns]);

  const filteredReturns = useMemo(() => {
    return returns.filter(r => 
      r.returnNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [returns, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/sales')}
            className="p-2 hover:bg-bg-secondary rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Back to Sales"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-text-primary">Sales Returns</h1>
            <p className="text-text-secondary font-medium">History of items returned by customers.</p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/sales/returns/new')}
          className="btn btn-primary bg-primary hover:bg-primary/90 shadow-primary/30 font-bold"
          title="New Return"
          aria-label="New Return"
        >
          <Plus size={20} />
          New Return
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-primary bg-linear-to-br from-primary/5 to-transparent">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-black text-text-muted uppercase tracking-widest">Total Returns</p>
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><RotateCcw size={16} /></div>
          </div>
          <h4 className="text-3xl font-black text-text-primary">{returns.length} <span className="text-sm font-bold text-text-muted">Records</span></h4>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2.5 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by return no or customer..." 
              title="Search Returns"
              aria-label="Search Returns"
              className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/30" size={40} /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Return No / Customer</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Date / Location</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium italic">
                      No sales return records found.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-bg-secondary/50 transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <span className="font-black text-text-primary block">{ret.returnNo}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                          <User size={10} /> {ret.customerName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-text-secondary flex items-center gap-1">
                            <Calendar size={12} className="text-text-muted" />
                            {new Date(ret.transactionDate * 1000).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] font-black text-text-muted uppercase flex items-center gap-1">
                            <MapPin size={10} /> {ret.locationName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-lg font-black text-text-primary">
                          {ret.totalAmount?.toLocaleString()} <span className="text-[10px] text-text-muted uppercase">MMK</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="badge badge-success">Completed</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-all"
                          title="View Details"
                          aria-label="View Details"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesReturns;
