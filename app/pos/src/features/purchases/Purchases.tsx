import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, Loader2, Receipt, Calendar, User, MapPin } from 'lucide-react';
import { api } from '../../lib/api';

const Purchases: React.FC = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPurchases = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getPurchases();
      setPurchases(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPurchases();
    });
  }, [fetchPurchases]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this purchase? This will reverse stock updates.')) return;
    try {
      await api.deletePurchase(id);
      await fetchPurchases();
    } catch (err) {
      console.error('Failed to delete purchase', err);
    }
  };

  const filteredPurchases = React.useMemo(() => {
    return purchases.filter(p => 
      p.grnNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Purchases</h1>
          <p className="text-text-secondary font-medium">History of stock arrivals and supplier invoices.</p>
        </div>
        <button 
          className="btn btn-primary shadow-primary/30 font-bold"
          onClick={() => navigate('/purchases/new')}
        >
          <Plus size={20} />
          Receive Stock
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by GRN No or Supplier..." 
              title="Search Purchases"
              className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">GRN No / Date</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Supplier</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Total Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-text-muted font-medium">
                      No purchases found.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border">
                            <Receipt size={20} />
                          </div>
                          <div>
                            <span className="font-bold block text-text-primary">{p.grnNo}</span>
                            <span className="text-xs text-text-muted font-medium flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(p.transactionDate * 1000).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-secondary">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-text-muted" />
                          {p.supplierName || 'Walk-in Supplier'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-text-secondary">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-text-muted" />
                          {p.locationName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-black text-text-primary">
                          {p.totalAmount?.toLocaleString()} <span className="text-[10px] text-text-muted">MMK</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="View Details"
                            onClick={() => navigate(`/purchases/${p.id}`)}
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Purchase"
                            onClick={() => handleDelete(p.id)}
                          >
                            <Trash2 size={18} />
                          </button>
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
    </div>
  );
};

export default Purchases;
