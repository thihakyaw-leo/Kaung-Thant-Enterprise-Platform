import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Save, 
  Loader2, 
  Package, 
  MapPin,
  Trash2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

// Helper to get timestamp outside of component render scope
const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const CreateTransfer: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<any[]>([]);
  const [fromLocationId, setFromLocationId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [stockQuantities, setStockQuantities] = useState<any[]>([]);
  const [transferItems, setTransferItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const l = await api.getLocations();
      setLocations(l);
      if (l.length > 0) setFromLocationId(l[0].id as string);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, [fetchData]);

  const fetchStock = useCallback(async () => {
    if (!fromLocationId) return;
    try {
      const data = await api.getStockQuantities({ locationId: fromLocationId });
      setStockQuantities(data);
    } catch (err) {
      console.error(err);
    }
  }, [fromLocationId]);

  useEffect(() => {
    const init = async () => {
      await fetchStock();
    };
    init();
  }, [fetchStock]);

  const filteredStock = useMemo(() => {
    return stockQuantities.filter(s => 
      s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.productCode?.toLowerCase().includes(searchTerm.toLowerCase())
    ).filter(s => !transferItems.find(item => item.stockId === s.stockId));
  }, [stockQuantities, searchTerm, transferItems]);

  const addItem = (stock: any) => {
    setTransferItems(prev => [...prev, { ...stock, transferQty: 1 }]);
    setSearchTerm('');
  };

  const removeItem = (stockId: string) => {
    setTransferItems(prev => prev.filter(item => item.stockId !== stockId));
  };

  const handleQtyChange = (stockId: string, qty: number) => {
    setTransferItems(prev => prev.map(item => {
      if (item.stockId === stockId) {
        // Can't transfer more than available
        const finalQty = Math.min(qty, item.quantity);
        return { ...item, transferQty: Math.max(1, finalQty) };
      }
      return item;
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromLocationId || !toLocationId || transferItems.length === 0) {
      alert('Please select locations and at least one item.');
      return;
    }

    if (fromLocationId === toLocationId) {
      alert('Source and destination locations cannot be the same.');
      return;
    }

    const now = getCurrentTimestamp();
    setSubmitting(true);
    try {
      await api.createTransfer({
        fromLocationId,
        toLocationId,
        transactionDate: now,
        items: transferItems.map(item => ({
          stockId: item.stockId,
          quantity: item.transferQty
        }))
      });
      navigate('/inventory/transfers');
    } catch (err) {
      console.error(err);
      alert('Failed to save transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/30" size={40} /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/inventory/transfers')}
            className="p-2 hover:bg-bg-secondary rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Back to Transfers"
            aria-label="Back to Transfers"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-text-primary">New Stock Transfer</h1>
            <p className="text-text-secondary font-medium">Create a movement record between locations.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-secondary/30">
            <div>
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="from-location">From Location (Source)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-error" />
                <select 
                  id="from-location"
                  title="Source Location"
                  className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none shadow-sm"
                  value={fromLocationId}
                  onChange={(e) => {
                    setFromLocationId(e.target.value);
                    setTransferItems([]); // Reset items if source changes
                  }}
                >
                  {locations.map(l => <option key={l.id} value={l.id as string}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="to-location">To Location (Destination)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-success" />
                <select 
                  id="to-location"
                  title="Destination Location"
                  className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none shadow-sm"
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                >
                  <option value="">Select Destination...</option>
                  {locations.filter(l => l.id !== fromLocationId).map(l => <option key={l.id} value={l.id as string}>{l.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4 bg-bg-secondary border-b border-border flex items-center gap-3">
              <Search size={18} className="text-text-muted" />
              <input 
                type="text" 
                placeholder="Search products in source location..." 
                title="Search Stock"
                aria-label="Search Stock"
                className="bg-transparent border-none outline-none text-sm font-bold w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <div className="max-h-60 overflow-y-auto border-b border-border bg-white divide-y divide-border shadow-inner">
                {filteredStock.length === 0 ? (
                  <div className="p-4 text-center text-text-muted text-sm italic">No items found or already added.</div>
                ) : (
                  filteredStock.map(s => (
                    <div 
                      key={s.stockId}
                      onClick={() => addItem(s)}
                      className="p-4 hover:bg-bg-secondary cursor-pointer flex justify-between items-center group transition-colors"
                    >
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{s.productName}</p>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">{s.productCode} • Available: {s.quantity}</p>
                      </div>
                      <Plus size={18} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                )}
              </div>
            )}

            <table className="w-full text-left">
              <thead>
                <tr className="bg-bg-secondary/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Item</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Available</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Transfer Qty</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transferItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-text-muted font-medium italic bg-bg-secondary/10">
                      Select items to transfer.
                    </td>
                  </tr>
                ) : (
                  transferItems.map((item) => (
                    <tr key={item.stockId} className="hover:bg-bg-secondary/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-primary block">{item.productName}</span>
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{item.productCode}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-text-secondary">{item.quantity}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <input 
                            type="number" 
                            title="Transfer Quantity"
                            aria-label={`Transfer Quantity for ${item.productName}`}
                            className="w-20 bg-white border border-border rounded-lg px-2 py-1 text-center font-black text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                            value={item.transferQty}
                            onChange={(e) => handleQtyChange(item.stockId, Number(e.target.value))}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => removeItem(item.stockId)}
                          className="p-2 text-text-muted hover:text-error transition-all"
                          title="Remove Item"
                          aria-label={`Remove ${item.productName}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-8 bg-primary text-white shadow-xl shadow-primary/20 sticky top-8">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2">
              <Package size={20} /> Transfer Info
            </h3>
            <div className="space-y-4 mb-8 border-b border-white/20 pb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Source Location</span>
                <span className="font-bold text-lg">{locations.find(l => l.id === fromLocationId)?.name || '-'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Target Location</span>
                <span className="font-bold text-lg">{locations.find(l => l.id === toLocationId)?.name || 'Not Selected'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Items</span>
                <span className="font-bold text-lg">{transferItems.length} Products</span>
              </div>
            </div>

            {fromLocationId === toLocationId && toLocationId !== '' && (
              <div className="bg-white/10 p-4 rounded-xl flex items-start gap-3 mb-6">
                <AlertCircle size={20} className="text-white shrink-0" />
                <p className="text-xs font-bold leading-relaxed">Source and destination must be different.</p>
              </div>
            )}

            <button 
              onClick={handleSubmit}
              disabled={submitting || transferItems.length === 0 || !toLocationId || fromLocationId === toLocationId}
              title="Confirm Transfer"
              aria-label="Confirm Transfer"
              className="btn w-full mt-4 py-4 bg-white text-primary hover:bg-white/90 shadow-lg font-black text-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Confirm Transfer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransfer;
