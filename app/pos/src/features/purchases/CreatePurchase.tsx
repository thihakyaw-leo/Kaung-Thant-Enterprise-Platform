import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Trash2, 
  Loader2, 
  ArrowLeft, 
  Search, 
  Package, 
  ShoppingCart,
  User,
  MapPin,
  FileText
} from 'lucide-react';
import { api } from '../../lib/api';

const CreatePurchase: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  
  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  
  // UI State
  const [itemSearch, setItemSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, l, st] = await Promise.all([
          api.getSuppliers(),
          api.getLocations(),
          api.getStocks()
        ]);
        setSuppliers(s);
        setLocations(l);
        setStocks(st);
        if (l.length > 0) setLocationId(l[0].id as string);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);

  const filteredStocks = useMemo(() => {
    if (itemSearch.trim().length > 1) {
      return stocks.filter(s => 
        s.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
        s.code.toLowerCase().includes(itemSearch.toLowerCase())
      ).slice(0, 5);
    }
    return [];
  }, [itemSearch, stocks]);

  const addToCart = (stock: any) => {
    const exists = cart.find(item => item.id === stock.id);
    if (exists) {
      setCart(cart.map(item => item.id === stock.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...stock, qty: 1, costPrice: stock.lastCost || 0 }]);
    }
    setItemSearch('');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateCartItem = (id: string, field: string, value: number) => {
    setCart(cart.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.qty * item.costPrice), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || cart.length === 0) return;

    setLoading(true);
    try {
      await api.createPurchase({
        supplierId,
        locationId,
        referenceNo,
        items: cart,
        totalAmount,
        taxAmount: 0,
        paidAmount: totalAmount // Default to fully paid for now
      });
      navigate('/purchases');
    } catch (err) {
      console.error('Failed to create purchase', err);
      alert('Failed to save purchase. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/purchases')}
          className="p-2.5 rounded-xl hover:bg-bg-secondary text-text-muted transition-all"
          title="Back to Purchases"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black text-text-primary">Receive Stock</h1>
          <p className="text-text-secondary font-medium">Record a new purchase and update inventory.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Item Search Card */}
          <div className="card p-6">
            <label className="block text-sm font-black text-text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
              <Package size={16} /> Select Items
            </label>
            <div className="relative">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-3.5 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search by product name or code..."
                  title="Search Items"
                  className="w-full bg-bg-secondary border border-border rounded-2xl pl-12 pr-4 py-4 text-text-primary font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all"
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                />
              </div>

              {filteredStocks.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-2xl shadow-2xl z-20 overflow-hidden divide-y divide-border animate-slide-up">
                  {filteredStocks.map(stock => (
                    <button
                      key={stock.id}
                      type="button"
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-bg-secondary transition-colors text-left"
                      onClick={() => addToCart(stock)}
                      title={`Add ${stock.name}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border font-black text-xs">
                          {stock.code}
                        </div>
                        <div>
                          <p className="font-black text-text-primary">{stock.name}</p>
                          <p className="text-xs text-text-muted font-bold">In Stock: {stock.totalQty || 0} {stock.unitName}</p>
                        </div>
                      </div>
                      <Plus size={18} className="text-primary" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Table */}
            <div className="mt-8 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-bg-secondary/30">
                    <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Product</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Quantity</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Cost (MMK)</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Total</th>
                    <th className="px-4 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {cart.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-text-muted font-medium italic">
                        No items added to purchase list yet.
                      </td>
                    </tr>
                  ) : (
                    cart.map((item) => (
                      <tr key={item.id} className="animate-slide-up">
                        <td className="px-4 py-4 font-bold text-text-primary text-sm">{item.name}</td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            min="1"
                            title={`Quantity for ${item.name}`}
                            className="w-20 bg-bg-tertiary border border-border rounded-lg px-2 py-1.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            value={item.qty}
                            onChange={(e) => updateCartItem(item.id, 'qty', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input 
                            type="number" 
                            min="0"
                            title={`Unit cost for ${item.name}`}
                            className="w-28 bg-bg-tertiary border border-border rounded-lg px-2 py-1.5 text-sm font-bold text-text-primary focus:ring-2 focus:ring-primary/20 outline-none"
                            value={item.costPrice}
                            onChange={(e) => updateCartItem(item.id, 'costPrice', Number(e.target.value))}
                          />
                        </td>
                        <td className="px-4 py-4 text-sm font-black text-text-primary">
                          {(item.qty * item.costPrice).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button 
                            type="button"
                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-all"
                            onClick={() => removeFromCart(item.id)}
                            title={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} />
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

        {/* Sidebar Info Card */}
        <div className="space-y-6">
          <div className="card p-6 space-y-6 sticky top-28">
            <h3 className="text-xl font-black text-text-primary flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" /> Summary
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <User size={14} /> Supplier
                </label>
                <select 
                  required
                  title="Select Supplier"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">Choose Supplier...</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <MapPin size={14} /> Receiving Location
                </label>
                <select 
                  required
                  title="Select Location"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                  <FileText size={14} /> GRN / Ref No.
                </label>
                <input 
                  type="text" 
                  placeholder="Auto-generated if empty"
                  title="Reference Number"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-text-secondary">Subtotal</span>
                <span className="text-sm font-black text-text-primary">{totalAmount.toLocaleString()} MMK</span>
              </div>
              <div className="flex justify-between items-center text-xl pt-2">
                <span className="font-black text-text-primary tracking-tighter">Grand Total</span>
                <span className="font-black text-primary">{totalAmount.toLocaleString()} MMK</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || cart.length === 0 || !supplierId}
              className="btn btn-primary w-full py-4 text-lg shadow-xl shadow-primary/30"
            >
              {loading ? <Loader2 size={24} className="animate-spin" /> : 'Confirm Purchase'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchase;
