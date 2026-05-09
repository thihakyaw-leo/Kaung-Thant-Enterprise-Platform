import { Building2, MapPin, Coins, ShieldCheck, Save, Loader2 } from 'lucide-react';
import { useState } from 'react';

export const BusinessSetup = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Business Setup</h1>
          <p className="text-on-surface/60">Configure your store's core identity and regional settings.</p>
        </div>
        <button 
          onClick={() => setIsLoading(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
          Save Configuration
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <section className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
              <Building2 size={16} /> Business Profile
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface/40 ml-1">Business Name</label>
                <input className="w-full bg-surface-container-low border border-white/5 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all" placeholder="e.g. Kaung Thant Mart" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface/40 ml-1">Contact Phone</label>
                <input className="w-full bg-surface-container-low border border-white/5 rounded-xl p-3 text-white focus:border-primary/50 outline-none transition-all" placeholder="+95 9..." />
              </div>
            </div>
          </section>

          {/* Locations Management */}
          <section className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-secondary font-bold uppercase tracking-widest text-xs">
                <MapPin size={16} /> Store Locations
              </div>
              <button title="Add New Store Branch" className="text-xs text-secondary hover:underline font-bold">+ Add Branch</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 group hover:border-secondary/30 transition-all">
                <div>
                  <div className="font-bold text-white">Main Branch (Default)</div>
                  <div className="text-xs text-on-surface/40">Yangon, Myanmar</div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button title="Branch Actions" className="p-2 hover:bg-white/10 rounded-lg text-on-surface/60"><ShieldCheck size={16} /></button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-xs">
              <Coins size={16} /> Regional Settings
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-on-surface/40 ml-1">Primary Currency</label>
                <select title="Select Primary Currency" className="w-full bg-surface-container-low border border-white/5 rounded-xl p-3 text-white focus:border-primary/50 outline-none appearance-none">
                  <option>MMK (Burmese Kyat)</option>
                  <option>USD (US Dollar)</option>
                  <option>THB (Thai Baht)</option>
                </select>
              </div>
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                <div className="text-[10px] text-amber-400 font-bold uppercase mb-1">Exchange Rate</div>
                <div className="text-xl font-bold text-white font-mono">1.00 <span className="text-xs font-normal text-on-surface/40">Default</span></div>
              </div>
            </div>
          </div>

          <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="text-[10px] text-on-surface/40 font-bold uppercase tracking-widest">Setup Status</div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="text-sm text-on-surface/70">Database Provisioned</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                <span className="text-sm text-on-surface/70">Configuration Pending</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
