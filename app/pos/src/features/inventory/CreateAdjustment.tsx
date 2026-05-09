import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, 
  Save, 
  Search, 
  Package, 
  MapPin, 
  AlertCircle,
  PlusCircle,
  MinusCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

const CreateAdjustment: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    locationId: '',
    stockId: '',
    type: 'IN' as 'IN' | 'OUT',
    quantity: 0,
    reason: ''
  });

  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [stockQuantities, setStockQuantities] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const locs = await api.getLocations();
        setLocations(locs);
        if (locs.length > 0) setFormData(prev => ({ ...prev, locationId: locs[0].id as string }));
      } catch (err) {
        console.error(err);
      }
    };
    init();
  }, []);

  const searchStocks = useCallback(async (q: string) => {
    if (q.length < 2) {
      setStocks([]);
      return;
    }
    try {
      const data = await api.getStocks({ search: q });
      setStocks(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchStocks(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchStocks]);

  const handleStockSelect = async (stock: any) => {
    setSelectedStock(stock);
    setFormData(prev => ({ ...prev, stockId: stock.id }));
    setSearchQuery('');
    setStocks([]);
    
    // Fetch current quantities for this stock across locations
    try {
      const data = await api.getStockQuantities({ stock_id: stock.id });
      setStockQuantities(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.locationId || !formData.stockId || formData.quantity <= 0) return;

    setSubmitting(true);
    try {
      await api.createAdjustment(formData);
      navigate('/inventory/adjustments');
    } catch (err) {
      console.error(err);
      alert('Failed to save adjustment');
    } finally {
      setSubmitting(false);
    }
  };

  const currentStockAtLocation = stockQuantities.find(q => q.locationId === formData.locationId)?.quantity || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/inventory/adjustments')}
          className="group flex items-center text-text-muted hover:text-primary transition-colors font-black uppercase text-xs tracking-widest"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to History
        </button>
      </div>

      <div>
        <h1 className="text-4xl font-black text-text-primary tracking-tight">Stock Reconciliation</h1>
        <p className="text-text-secondary font-medium mt-1">Manually adjust inventory levels for damage, loss, or corrections.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Location & Product */}
          <div className="card p-8 space-y-8 shadow-xl shadow-bg-secondary border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <MapPin size={12} className="text-primary" /> Adjustment Location
                  </label>
                  <select
                    title="Select Location"
                    className="w-full bg-bg-secondary border border-border rounded-2xl px-5 py-4 font-bold text-text-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none appearance-none"
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    required
                  >
                    {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={12} className="text-primary" /> Adjustment Type
                  </label>
                  <div className="flex gap-2 p-1.5 bg-bg-secondary rounded-2xl border border-border">
                    <button
                      type="button"
                      title="Stock In"
                      onClick={() => setFormData({ ...formData, type: 'IN' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                        formData.type === 'IN' ? 'bg-white text-success shadow-sm scale-105' : 'text-text-muted opacity-60'
                      }`}
                    >
                      <PlusCircle size={16} /> Stock In
                    </button>
                    <button
                      type="button"
                      title="Stock Out"
                      onClick={() => setFormData({ ...formData, type: 'OUT' })}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${
                        formData.type === 'OUT' ? 'bg-white text-error shadow-sm scale-105' : 'text-text-muted opacity-60'
                      }`}
                    >
                      <MinusCircle size={16} /> Stock Out
                    </button>
                  </div>
               </div>
            </div>

            <div className="space-y-3 relative">
              <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                <Package size={12} className="text-primary" /> Search Product to Adjust
              </label>
              <div className="relative group">
                <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors" />
                <input 
                  type="text"
                  title="Search Product"
                  placeholder="Enter product name or barcode..."
                  className="w-full bg-bg-secondary border border-border rounded-2xl pl-14 pr-5 py-5 font-bold text-text-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {stocks.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-slide-up">
                  {stocks.map(stock => (
                    <button
                      key={stock.id}
                      type="button"
                      title="Select Product"
                      onClick={() => handleStockSelect(stock)}
                      className="w-full flex items-center justify-between p-5 hover:bg-bg-secondary border-b border-border/50 last:border-0 transition-colors group"
                    >
                      <div className="text-left">
                        <p className="font-black text-text-primary group-hover:text-primary transition-colors">{stock.name}</p>
                        <p className="text-[10px] font-black text-text-muted uppercase">{stock.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-text-secondary uppercase">Last Cost: {stock.lastCost?.toLocaleString()} MMK</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStock && (
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 animate-fade-in flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm border border-primary/5">
                      <Package size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-black text-primary uppercase tracking-widest">Active Product</p>
                      <p className="text-xl font-black text-text-primary">{selectedStock.name}</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-text-muted uppercase mb-1">Stock @ Location</p>
                   <p className="text-2xl font-black text-text-primary">{currentStockAtLocation} <span className="text-sm font-bold opacity-40">units</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Details */}
          <div className="card p-8 space-y-8 shadow-xl shadow-bg-secondary border-border/50">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Adjustment Quantity</label>
                   <input 
                    type="number"
                    title="Quantity"
                    className="w-full bg-bg-secondary border border-border rounded-2xl px-6 py-5 text-2xl font-black text-text-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Final Balance After</label>
                   <div className="w-full bg-bg-secondary/50 border border-dashed border-border rounded-2xl px-6 py-5 flex items-center justify-between">
                      <span className="text-sm font-bold text-text-muted">Calculated:</span>
                      <span className={`text-2xl font-black ${formData.type === 'IN' ? 'text-success' : 'text-error'}`}>
                        {formData.type === 'IN' ? currentStockAtLocation + formData.quantity : currentStockAtLocation - formData.quantity}
                      </span>
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                  <FileText size={12} className="text-primary" /> Reason / Notes
                </label>
                <textarea 
                  title="Reason"
                  placeholder="Why is this adjustment being made? (e.g. Damaged goods, Stock count error...)"
                  className="w-full bg-bg-secondary border border-border rounded-2xl px-6 py-4 font-bold text-text-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none min-h-[120px]"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-8 bg-sidebar-bg text-white shadow-2xl shadow-sidebar-bg/20 space-y-6 sticky top-8">
            <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
               <AlertCircle className="text-primary" /> Review Action
            </h3>
            <div className="space-y-4 border-y border-white/10 py-6">
               <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-white/40 uppercase tracking-widest">Action</span>
                  <span className={`font-black uppercase tracking-widest px-2 py-1 rounded-lg ${formData.type === 'IN' ? 'bg-success text-white' : 'bg-error text-white'}`}>
                    Stock {formData.type}
                  </span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-white/40 uppercase tracking-widest">Product</span>
                  <span className="font-black text-white/90 text-right truncate max-w-[150px]">{selectedStock?.name || 'Not Selected'}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-white/40 uppercase tracking-widest">Quantity</span>
                  <span className="font-black text-xl text-primary">{formData.quantity}</span>
               </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !formData.stockId || formData.quantity <= 0}
              className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:scale-100 disabled:grayscale"
            >
              {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
              Confirm & Save
            </button>
            <p className="text-[10px] text-center font-bold text-white/30 uppercase leading-relaxed">
              This action will update inventory balances immediately and cannot be reversed.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateAdjustment;
