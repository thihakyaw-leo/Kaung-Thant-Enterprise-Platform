import { Package, Plus, Barcode, Search } from 'lucide-react';

export const InventoryManager = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Package className="text-primary" /> Inventory Master
        </h1>
        <button 
          title="Add New Product"
          className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Search & Filters */}
      <div className="glass p-4 rounded-2xl flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
          <input 
            title="Search Products"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-primary/50 outline-none" 
            placeholder="Search by name or barcode (SKU)..." 
          />
        </div>
        <select 
          title="Filter by Category"
          className="bg-white/5 border border-white/10 rounded-xl px-4 text-on-surface/60 outline-none"
        >
          <option>All Categories</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-on-surface/40 border-b border-white/5">
            <tr>
              <th className="px-6 py-4">Product Info</th>
              <th className="px-6 py-4">SKU/Barcode</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Stock Level</th>
              <th className="px-6 py-4 text-right">Unit Price</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr className="hover:bg-white/2 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-bold text-white group-hover:text-primary transition-colors">Premium Coffee Beans</div>
                <div className="text-xs text-on-surface/40">Dark Roast, 500g</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 font-mono text-sm text-primary">
                  <Barcode size={14} className="text-on-surface/20" />
                  850123456789
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="bg-blue-500/10 text-blue-400 text-[10px] px-2 py-1 rounded-md border border-blue-500/20 uppercase font-bold">Beverages</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </div>
                  <span className="text-xs text-white font-medium">145 Packs</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right font-bold text-white">
                <div className="flex flex-col items-end">
                  <span className="text-sm">12,500 MMK</span>
                  <span className="text-[10px] text-on-surface/30 font-normal">Retail</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
