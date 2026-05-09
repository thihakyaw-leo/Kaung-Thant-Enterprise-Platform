import { IconSearch, IconShoppingCart, IconUser, IconPrinter, IconMinus, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../../components/shared/LanguageSwitcher';

export const POSTerminal = () => {
  const { t } = useTranslation();
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [cart, setCart] = useState([
    { id: '1', name: 'Premium Coffee Beans', price: 12500, qty: 2 },
  ]);

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const taxAmount = subtotal * 0.05;
  const payableAmount = subtotal + taxAmount;

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };

  if (!isShiftOpen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="glass w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl relative">
          <div className="absolute top-4 right-4">
            <LanguageSwitcher />
          </div>
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold text-white">{t('open_shift')}</h2>
            <p className="text-on-surface/40 text-sm">{t('opening_shift_desc')}</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs text-on-surface/40 ml-1 font-bold uppercase tracking-widest">{t('opening_balance')} (MMK)</label>
              <input 
                title={t('opening_balance')}
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-2xl font-mono text-primary text-center outline-none focus:border-primary/50 transition-all" 
                placeholder="0.00" 
              />
            </div>
            <button 
              onClick={() => setIsShiftOpen(true)}
              className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              {t('start_selling')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] gap-6 animate-in slide-in-from-bottom duration-500">
      {/* Left: Search & Items */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="glass p-3 rounded-2xl flex gap-3 border border-white/5">
          <div className="flex-1 relative">
            <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={20} />
            <input 
              title={t('search_placeholder')}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white text-lg focus:border-primary/50 outline-none transition-all" 
              placeholder={t('search_placeholder')}
              autoFocus 
            />
          </div>
          <button title={t('customer')} className="glass px-5 rounded-xl border border-white/5 text-on-surface/60 hover:text-primary transition-colors flex items-center gap-2">
            <IconUser size={20} />
            <span className="text-xs font-bold uppercase hidden lg:inline">{t('customer')}</span>
          </button>
          <LanguageSwitcher />
        </div>

        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="glass p-4 rounded-2xl border border-white/5 hover:border-primary/30 transition-all cursor-pointer group active:scale-95">
            <div className="aspect-square bg-white/5 rounded-xl mb-3 flex items-center justify-center text-on-surface/20">
              <IconShoppingCart size={40} />
            </div>
            <div className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors">Coffee Beans</div>
            <div className="text-lg font-bold text-white font-mono">12,500 <span className="text-[10px] text-on-surface/40">MMK</span></div>
          </div>
        </div>
      </div>

      {/* Right: Cart & Payment */}
      <div className="w-96 flex flex-col gap-4">
        <div className="flex-1 glass rounded-[2rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
          <div className="p-5 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconShoppingCart className="text-primary" size={20} />
              <h3 className="font-bold text-white tracking-tight">{t('cart_title')}</h3>
            </div>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-1 rounded-md font-bold uppercase">{cart.length} {t('items')}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center group animate-in fade-in slide-in-from-right-4">
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{item.name}</div>
                  <div className="text-xs text-on-surface/40 font-mono">{item.price.toLocaleString()} MMK</div>
                </div>
                <div className="flex items-center gap-3 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    title="Decrease" 
                    className="p-1.5 hover:bg-white/10 rounded-lg text-on-surface/40 hover:text-white transition-colors"
                  >
                    <IconMinus size={14} />
                  </button>
                  <span className="text-sm font-bold text-white min-w-[20px] text-center">{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    title="Increase" 
                    className="p-1.5 hover:bg-white/10 rounded-lg text-primary transition-colors"
                  >
                    <IconPlus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white/[0.02] border-t border-white/5 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface/40 font-medium">{t('subtotal')}</span>
                <span className="text-white font-mono">{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface/40 font-medium">{t('tax')} (5%)</span>
                <span className="text-white font-mono">{taxAmount.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-between items-end pt-2">
              <span className="text-sm font-bold text-white/60 uppercase tracking-widest">{t('total')}</span>
              <div className="text-3xl font-bold text-primary tracking-tighter">
                {payableAmount.toLocaleString()} <span className="text-xs font-normal">MMK</span>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full bg-primary text-on-primary py-5 rounded-[1.5rem] font-bold text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
          <IconPrinter size={24} /> {t('pay_button')}
        </button>
      </div>
    </div>
  );
};
