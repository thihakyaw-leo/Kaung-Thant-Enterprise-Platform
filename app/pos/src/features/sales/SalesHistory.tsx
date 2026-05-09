import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Eye, 
  Printer, 
  Download,
  Loader2,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';
import { api } from '../../lib/api';

const SalesHistory: React.FC = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = await api.getSales();
      setSales(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      void fetchSales();
    });
  }, []);

  const filteredSales = sales.filter(sale => 
    sale.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Sales History</h1>
          <p className="text-text-secondary font-medium">Review and manage past transactions.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary gap-2 font-bold">
            <Calendar size={18} />
            Filter Date
          </button>
          <button className="btn btn-primary shadow-primary/30 font-bold">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by ID or Customer..." 
              title="Search Sales"
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
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Transaction ID</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-black text-primary bg-primary/5 px-2 py-1 rounded">#{sale.id.slice(-8)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary">{new Date(sale.transaction_date).toLocaleDateString()}</span>
                        <span className="text-[10px] text-text-muted font-bold flex items-center gap-1"><Clock size={10} /> {new Date(sale.transaction_date).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-text-secondary">{sale.customer_name || 'Walk-in Customer'}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-text-primary text-lg">
                      {sale.total_amount?.toLocaleString()} <span className="text-[10px] text-text-muted uppercase">MMK</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-[10px] font-black uppercase">
                        <CheckCircle size={10} />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-primary transition-all" title="Print Receipt" aria-label="Print"><Printer size={18} /></button>
                        <button className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-primary transition-all" title="View Details" aria-label="View"><Eye size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
