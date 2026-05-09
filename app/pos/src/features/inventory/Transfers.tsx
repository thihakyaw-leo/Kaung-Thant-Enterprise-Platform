import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  ArrowRightLeft, 
  MapPin, 
  Calendar, 
  Loader2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const Transfers: React.FC = () => {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchTransfers = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const data = await api.getTransfers();
      setTransfers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchTransfers(true);
    };
    init();
  }, [fetchTransfers]);

  const filteredTransfers = useMemo(() => {
    return transfers.filter(t => 
      t.transferNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.fromLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [transfers, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Stock Transfers</h1>
          <p className="text-text-secondary font-medium">Move inventory between your shop locations.</p>
        </div>
        <button 
          onClick={() => navigate('/inventory/transfers/new')}
          className="btn btn-primary bg-primary hover:bg-primary/90 shadow-primary/30 font-bold"
          title="New Transfer"
          aria-label="New Transfer"
        >
          <Plus size={20} />
          New Transfer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-primary bg-linear-to-br from-primary/5 to-transparent">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-black text-text-muted uppercase tracking-widest">Total Movements</p>
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><ArrowRightLeft size={16} /></div>
          </div>
          <h4 className="text-3xl font-black text-text-primary">{transfers.length} <span className="text-sm font-bold text-text-muted">Records</span></h4>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2.5 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by transfer no or location..." 
              title="Search Transfers"
              aria-label="Search Transfers"
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
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Transfer No</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">From / To</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Date</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium italic">
                      No transfer records found.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((t) => (
                    <tr key={t.id} className="hover:bg-bg-secondary/50 transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <span className="font-black text-text-primary block">{t.transferNo}</span>
                        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Reference ID</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-text-primary flex items-center gap-1">
                              <MapPin size={12} className="text-error" /> {t.fromLocation}
                            </span>
                            <div className="flex justify-center my-1">
                              <ArrowRight size={12} className="text-text-muted" />
                            </div>
                            <span className="text-sm font-bold text-text-primary flex items-center gap-1">
                              <MapPin size={12} className="text-success" /> {t.toLocation}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-text-secondary flex items-center justify-center gap-1">
                          <Calendar size={12} className="text-text-muted" />
                          {new Date(t.transactionDate * 1000).toLocaleDateString()}
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

export default Transfers;
