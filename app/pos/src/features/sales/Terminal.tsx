import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  Loader2,
  Package,
  Barcode,
  Users,
  Percent,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { api } from '../../lib/api';
import type { CartItem, Customer, Stock } from '../../types';
import ReceiptModal from './ReceiptModal';
import { savePendingSale, getPendingSales, clearPendingSales } from '../../shared/lib/db';
import { RBACWrapper } from '../../shared/components/RBACWrapper';

const Terminal: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Stock[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank'>('cash');
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [orderDiscount, setOrderDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'fixed' | 'percent'>('fixed');
  const [lastOrder, setLastOrder] = useState<any | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [barcodeBuffer, setBarcodeBuffer] = useState('');
  const lastKeyTime = useRef<number>(0);

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // 1. Connectivity Monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial pending count check
    getPendingSales().then(sales => setPendingCount(sales.length));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchInitialData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const [prodRes, catRes, custRes] = await Promise.all([
        api.getStocks(),
        api.getCategories(),
        api.getCustomers()
      ]);
      setProducts(prodRes as unknown as Stock[]);
      setCategories(catRes);
      setCustomers(custRes as unknown as Customer[]);
    } catch (err) {
      console.error('Failed to fetch POS data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = useCallback(async () => {
    const pending = await getPendingSales();
    if (pending.length === 0) return;

    setIsSyncing(true);
    try {
      for (const sale of pending) {
        await api.createSale(sale);
      }
      await clearPendingSales();
      setPendingCount(0);
      alert('Offline sales synced successfully!');
      fetchInitialData();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchInitialData]);

  // 2. Background Sync
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      Promise.resolve().then(() => {
        handleSync();
      });
    }
  }, [isOnline, pendingCount, isSyncing, handleSync]);

  const addToCart = useCallback((product: Stock) => {
    if (product.quantity <= 0) {
      alert(`${product.name} is out of stock!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert(`Not enough stock for ${product.name}`);
          return prev;
        }
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price } 
            : item
        );
      }
      return [...prev, {
        product_id: product.id,
        name: product.name,
        quantity: 1,
        price: product.selling_price,
        total: product.selling_price
      }];
    });
  }, []);

  const processBarcode = useCallback((code: string) => {
    const product = products.find(p => p.barcode === code || p.sku === code);
    if (product) {
      addToCart(product);
    }
  }, [products, addToCart]);

  const handleCheckout = useCallback(async () => {
    if (cart.length === 0 || submitting) return;
    
    const currentSubtotal = cart.reduce((sum, item) => sum + item.total, 0);
    const currentDiscountAmount = discountType === 'fixed' 
      ? orderDiscount 
      : (currentSubtotal * orderDiscount) / 100;
    const cartTotal = Math.max(0, currentSubtotal - currentDiscountAmount);

    const saleData = {
      items: cart,
      total_amount: cartTotal,
      discount_amount: currentDiscountAmount,
      customer_id: selectedCustomer?.id || null,
      payment_method: paymentMethod,
      status: 'completed'
    };

    if (!isOnline) {
      // 3. Offline Checkout Fallback
      await savePendingSale(saleData);
      setPendingCount(prev => prev + 1);
      
      setLastOrder({
        ...saleData,
        subtotal: currentSubtotal,
        discount: currentDiscountAmount,
        total: cartTotal,
        customer: selectedCustomer,
        transactionId: 'OFFLINE-' + Date.now(),
        date: new Date().toLocaleString()
      });
      
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomer(null);
      setOrderDiscount(0);
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createSale(saleData);
      
      setLastOrder({
        ...saleData,
        subtotal: currentSubtotal,
        discount: currentDiscountAmount,
        total: cartTotal,
        customer: selectedCustomer,
        transactionId: response.id,
        date: new Date().toLocaleString()
      });
      
      setShowReceipt(true);
      setCart([]);
      setSelectedCustomer(null);
      setOrderDiscount(0);
      fetchInitialData();
    } catch (err) {
      console.error('Checkout failed:', err);
      alert('Failed to process sale.');
    } finally {
      setSubmitting(false);
    }
  }, [cart, submitting, discountType, orderDiscount, selectedCustomer, paymentMethod, fetchInitialData, isOnline]);

  useEffect(() => {
    let ignore = false;
    const loadData = async () => {
      try {
        const [prodRes, catRes, custRes] = await Promise.all([
          api.getStocks(),
          api.getCategories(),
          api.getCustomers()
        ]);
        if (!ignore) {
          setProducts(prodRes as unknown as Stock[]);
          setCategories(catRes);
          setCustomers(custRes as unknown as Customer[]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch POS data:', err);
        if (!ignore) setLoading(false);
      }
    };
    loadData();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime.current > 50) {
        setBarcodeBuffer('');
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3) {
          processBarcode(barcodeBuffer);
          setBarcodeBuffer('');
        }
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        setBarcodeBuffer(prev => prev + e.key);
      }

      lastKeyTime.current = currentTime;

      if (e.key === 'F1') { e.preventDefault(); setPaymentMethod('cash'); }
      if (e.key === 'F2') { e.preventDefault(); setPaymentMethod('card'); }
      if (e.key === 'F3') { e.preventDefault(); setPaymentMethod('bank'); }
      if (e.ctrlKey && e.key === 'Enter') { e.preventDefault(); handleCheckout(); }
      if (e.key === 'Escape') { e.preventDefault(); setCart([]); }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [barcodeBuffer, processBarcode, handleCheckout]);

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find(p => p.id === productId);
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && product && newQty > product.quantity) {
          alert(`Maximum stock reached for ${product?.name}`);
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = discountType === 'fixed' 
    ? orderDiscount 
    : (subtotal * orderDiscount) / 100;
  const cartTotal = Math.max(0, subtotal - discountAmount);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.barcode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || p.category_id === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="h-full flex gap-8 animate-fade-in overflow-hidden relative">
      {/* Offline Status Bar */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-60 flex items-center gap-3 bg-white/90 backdrop-blur border border-border px-4 py-1.5 rounded-full shadow-lg">
        {isOnline ? (
          <div className="flex items-center gap-2 text-success text-[10px] font-black uppercase">
            <Wifi size={14} /> Online
          </div>
        ) : (
          <div className="flex items-center gap-2 text-error text-[10px] font-black uppercase">
            <WifiOff size={14} /> Offline Mode
          </div>
        )}
        {pendingCount > 0 && (
          <>
            <div className="w-px h-3 bg-border" />
            <button 
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="flex items-center gap-2 text-primary text-[10px] font-black uppercase hover:opacity-70 disabled:opacity-30"
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              {pendingCount} Pending Sync
            </button>
          </>
        )}
      </div>

      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 flex items-center bg-white border border-border rounded-2xl px-4 py-3 shadow-sm focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all">
            <Search size={20} className="text-text-muted" />
            <input 
              id="terminal-search"
              type="text" 
              placeholder={t('search_products')} 
              className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select 
              className="btn btn-secondary px-6 font-black text-xs uppercase"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              title="Filter by Category"
            >
              <option value="all">{t('all_categories')}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center"><Loader2 size={40} className="animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map(p => (
                <button 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className={`card p-3 flex flex-col items-start text-left group transition-all relative ${p.quantity <= 0 ? 'opacity-50 grayscale pointer-events-none' : 'hover:border-primary'}`}
                  title={`Add ${p.name} to cart`}
                >
                  {p.quantity <= 0 && (
                    <div className="absolute top-2 right-2 z-10 bg-error text-white text-[10px] font-black px-2 py-0.5 rounded-full">SOLD OUT</div>
                  )}
                  <div className="w-full aspect-square bg-bg-tertiary rounded-xl mb-3 flex items-center justify-center text-text-muted group-hover:scale-105 transition-transform overflow-hidden">
                    {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <Package size={32} />}
                  </div>
                  <h4 className="text-sm font-black text-text-primary line-clamp-2 mb-1">{p.name}</h4>
                  <div className="flex items-center gap-2 mb-2">
                    <Barcode size={12} className="text-text-muted" />
                    <p className="text-[10px] text-text-muted font-bold tracking-wider">{p.sku || 'No SKU'}</p>
                  </div>
                  <div className="mt-auto flex justify-between items-center w-full">
                    <span className="text-sm font-black text-primary">{p.selling_price?.toLocaleString()} MMK</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${p.quantity < 5 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                      {p.quantity} PCS
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Order Panel */}
      <div className="w-[450px] flex flex-col bg-white border border-border rounded-3xl shadow-xl overflow-hidden animate-slide-up">
        {/* Header with Customer Selection */}
        <div className="p-6 border-b border-border bg-bg-secondary space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-xl">
                <ShoppingCart size={24} />
              </div>
              <h3 className="text-xl font-black text-text-primary">Current Order</h3>
            </div>
            <button 
              onClick={() => setCart([])}
              className="text-xs font-black text-error hover:underline uppercase"
              title="Clear Cart"
            >
              Clear
            </button>
          </div>

          <div className="relative">
            <Users size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <select 
              id="customer-select"
              className="w-full bg-white border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm font-bold appearance-none outline-none focus:border-primary transition-colors"
              value={selectedCustomer?.id || ''}
              onChange={(e) => {
                const customer = customers.find(c => c.id === e.target.value);
                setSelectedCustomer(customer || null);
              }}
              title="Select Customer"
            >
              <option value="">Guest Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>)}
            </select>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-text-muted opacity-20">
              <ShoppingCart size={80} className="mb-4" />
              <p className="font-black text-xl uppercase tracking-widest">Cart is empty</p>
              <p className="text-xs font-bold mt-2">Scan barcodes or click products</p>
            </div>
          ) : cart.map(item => (
            <div key={item.product_id} className="flex gap-4 p-4 bg-bg-secondary rounded-2xl border border-border group relative">
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-black text-text-primary truncate">{item.name}</h5>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-primary font-black">{item.price.toLocaleString()} MMK</span>
                  <span className="text-[10px] text-text-muted font-bold">Total: {item.total.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white border border-border rounded-xl overflow-hidden shadow-sm">
                  <button onClick={() => updateQuantity(item.product_id, -1)} className="p-2 hover:bg-bg-tertiary transition-colors" title="Decrease Quantity"><Minus size={14} /></button>
                  <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, 1)} className="p-2 hover:bg-bg-tertiary transition-colors" title="Increase Quantity"><Plus size={14} /></button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.product_id)} 
                  className="p-2 text-error bg-error/10 rounded-xl hover:bg-error hover:text-white transition-all"
                  title="Remove from Cart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Totals & Discounts */}
        <div className="p-6 bg-bg-secondary border-t border-border space-y-6 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <div className="space-y-4">
            <RBACWrapper permission="sales.discount">
              <div className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-border">
                <div className="flex items-center gap-2 text-text-muted">
                  <Percent size={18} />
                  <span className="text-xs font-black uppercase tracking-wider">Discount</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <input 
                    type="number"
                    placeholder="0"
                    className="w-full text-right bg-transparent border-none outline-none font-black text-primary"
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(Math.max(0, Number(e.target.value)))}
                    title="Order Discount"
                  />
                  <select 
                    className="bg-bg-tertiary text-[10px] font-black p-1 rounded border-none outline-none cursor-pointer"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    title="Discount Type"
                  >
                    <option value="fixed">MMK</option>
                    <option value="percent">%</option>
                  </select>
                </div>
              </div>
            </RBACWrapper>

            <div className="space-y-2 px-2">
              <div className="flex justify-between text-xs font-bold text-text-muted uppercase">
                <span>Subtotal</span>
                <span>{subtotal.toLocaleString()} MMK</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-xs font-bold text-error uppercase">
                  <span>Discount</span>
                  <span>-{discountAmount.toLocaleString()} MMK</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2 border-t border-border/50">
                <span className="text-lg font-black text-text-primary uppercase tracking-widest">Total</span>
                <span className="text-3xl font-black text-primary">{cartTotal.toLocaleString()} MMK</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => setPaymentMethod('cash')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all relative ${paymentMethod === 'cash' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-border bg-white text-text-muted hover:border-text-muted'}`}
            >
              <div className="text-[10px] absolute top-1 right-2 font-black opacity-50">F1</div>
              <Banknote size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Cash</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all relative ${paymentMethod === 'card' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-border bg-white text-text-muted hover:border-text-muted'}`}
            >
              <div className="text-[10px] absolute top-1 right-2 font-black opacity-50">F2</div>
              <CreditCard size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Card</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('bank')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all relative ${paymentMethod === 'bank' ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10' : 'border-border bg-white text-text-muted hover:border-text-muted'}`}
            >
              <div className="text-[10px] absolute top-1 right-2 font-black opacity-50">F3</div>
              <Loader2 size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest">Bank</span>
            </button>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || submitting}
            className="w-full py-6 bg-primary text-white rounded-3xl font-black text-xl uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none flex items-center justify-center gap-4"
          >
            {submitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <CreditCard size={24} />
                <span>Checkout</span>
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showReceipt && lastOrder && (
          <ReceiptModal 
            isOpen={showReceipt}
            orderData={lastOrder} 
            onClose={() => setShowReceipt(false)} 
          />
        )}
      </AnimatePresence>

      {/* Barcode Flash Overlay */}
      {barcodeBuffer && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-6 py-2 rounded-full shadow-2xl animate-bounce flex items-center gap-3">
          <Barcode size={20} />
          <span className="font-mono font-black tracking-widest">{barcodeBuffer}</span>
        </div>
      )}
    </div>
  );
};

export default Terminal;
