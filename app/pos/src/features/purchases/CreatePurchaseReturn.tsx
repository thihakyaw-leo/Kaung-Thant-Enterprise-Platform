import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  ArrowLeft, 
  Save, 
  Loader2, 
  Package, 
  FileText,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const CreatePurchaseReturn: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPurchases = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
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
    // Avoid synchronous state setting in effect
    const init = async () => {
      await fetchPurchases(true);
    };
    init();
  }, [fetchPurchases]);

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => 
      p.grnNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchases, searchTerm]);

  const handleSelectPurchase = async (p: any) => {
    setLoading(true);
    try {
      const detail = await api.getPurchaseDetails(p.id) as any;
      setSelectedPurchase(detail);
      setReturnItems(detail.details.map((item: any) => ({
        ...item,
        returnQty: 0
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (stockId: string, qty: number) => {
    setReturnItems(prev => prev.map(item => {
      if (item.stockId === stockId) {
        const finalQty = Math.min(qty, item.quantity);
        return { ...item, returnQty: Math.max(0, finalQty) };
      }
      return item;
    }));
  };

  const totalAmount = useMemo(() => {
    return returnItems.reduce((sum, item) => sum + (item.returnQty * item.unitCost), 0);
  }, [returnItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToReturn = returnItems.filter(item => item.returnQty > 0);
    if (itemsToReturn.length === 0) {
      alert('Please select at least one item to return.');
      return;
    }

    setSubmitting(true);
    try {
      const now = Math.floor(Date.now() / 1000);
      await api.createPurchaseReturn({
        purchaseId: selectedPurchase.id,
        locationId: selectedPurchase.locationId,
        supplierId: selectedPurchase.supplierId,
        reason,
        transactionDate: now,
        items: itemsToReturn.map(item => ({
          stockId: item.stockId,
          quantity: item.returnQty,
          unitCost: item.unitCost
        }))
      });
      navigate('/purchases/returns');
    } catch (err) {
      console.error(err);
      alert('Failed to save purchase return.');
    } finally {
      setSubmitting(false);
    }
  };

  if (selectedPurchase) {
    return (
      <div className="space-y-8 animate-fade-in pb-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedPurchase(null)}
              className="p-2 hover:bg-bg-secondary rounded-xl transition-all text-text-muted hover:text-text-primary"
              title="Change Purchase"
              aria-label="Back to selection"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-text-primary">Return Items</h1>
              <p className="text-text-secondary font-medium">Selecting items from GRN: {selectedPurchase.grnNo}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/30" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-bg-secondary border-b border-border">
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Product</th>
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Purchased</th>
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-center">Return Qty</th>
                      <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {returnItems.map((item) => (
                      <tr key={item.id} className="hover:bg-bg-secondary/30 transition-colors">
                        <td className="px-6 py-4">
                          <span className="font-bold text-text-primary block">{item.productName}</span>
                          <span className="text-[10px] font-black text-text-muted uppercase">{item.productCode}</span>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-text-secondary">{item.quantity}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center">
                            <input 
                              type="number" 
                              title="Return Quantity"
                              aria-label={`Return Quantity for ${item.productName}`}
                              className="w-20 bg-white border border-border rounded-lg px-2 py-1 text-center font-black text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              value={item.returnQty}
                              onChange={(e) => handleQtyChange(item.stockId, Number(e.target.value))}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-text-primary">
                          {(item.returnQty * item.unitCost).toLocaleString()} MMK
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card p-6 space-y-4">
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="return-reason">Reason for Return</label>
                <textarea 
                  id="return-reason"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                  placeholder="e.g. Damaged goods, Wrong items..."
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="card p-8 bg-primary text-white shadow-xl shadow-primary/20 sticky top-8">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <FileText size={20} /> Return Summary
                </h3>
                <div className="space-y-4 mb-8 border-b border-white/20 pb-6">
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Supplier</span>
                    <span className="font-bold">{selectedPurchase.supplierName}</span>
                  </div>
                  <div className="flex justify-between text-sm opacity-80">
                    <span>Location</span>
                    <span className="font-bold">{selectedPurchase.locationName}</span>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm font-black uppercase tracking-widest opacity-80">Total Return Value</span>
                  <div className="text-right">
                    <h2 className="text-3xl font-black">{totalAmount.toLocaleString()}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-widest">MMK</span>
                  </div>
                </div>
                <button 
                  onClick={handleSubmit}
                  disabled={submitting || totalAmount === 0}
                  title="Confirm Return"
                  aria-label="Confirm and save return"
                  className="btn w-full mt-8 py-4 bg-white text-primary hover:bg-white/90 shadow-lg font-black text-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Confirm Return</>}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/purchases/returns')}
            className="p-2 hover:bg-bg-secondary rounded-xl transition-all text-text-muted hover:text-text-primary"
            title="Back to Returns"
            aria-label="Back"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-text-primary">Select Purchase</h1>
            <p className="text-text-secondary font-medium">Choose a GRN record to initiate a return.</p>
          </div>
        </div>
      </div>

      <div className="card p-6 bg-bg-secondary/50 border-white/5 flex items-center gap-4">
        <Search size={20} className="text-text-muted" />
        <input 
          type="text" 
          placeholder="Search by GRN No or Supplier..."
          title="Search Purchases"
          aria-label="Search Purchases"
          className="bg-transparent border-none outline-none text-lg font-bold text-text-primary w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/30" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.length === 0 ? (
            <div className="col-span-full py-20 text-center text-text-muted font-medium italic">
              No purchase records found.
            </div>
          ) : (
            filteredPurchases.map((p) => (
              <div 
                key={p.id}
                onClick={() => handleSelectPurchase(p)}
                className="card p-6 cursor-pointer hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 transition-all group animate-slide-up"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Package size={24} />
                  </div>
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{p.grnNo}</span>
                </div>
                <h3 className="text-xl font-black text-text-primary mb-1">{p.supplierName}</h3>
                <p className="text-sm font-medium text-text-secondary mb-4">{new Date(p.transactionDate * 1000).toLocaleDateString()}</p>
                <div className="flex justify-between items-end border-t border-border pt-4">
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase">Total Value</p>
                    <p className="font-black text-text-primary">{p.totalAmount?.toLocaleString()} MMK</p>
                  </div>
                  <button className="p-2 rounded-lg bg-bg-secondary text-primary group-hover:bg-primary group-hover:text-white transition-all" title="Select GRN" aria-label={`Select GRN ${p.grnNo}`}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CreatePurchaseReturn;
