import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowDownLeft, 
  AlertTriangle, 
  Loader2, 
  Tag
} from 'lucide-react';
import { api } from '../../lib/api';
import ProductModal from './ProductModal';
import type { Stock } from '../../types';

const Inventory: React.FC = () => {
  const { t } = useTranslation();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Stock | null>(null);

  const fetchStocks = React.useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await api.getStocks();
      setStocks(data as unknown as Stock[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    
    const loadData = async () => {
      try {
        const data = await api.getStocks();
        if (!ignore) {
          setStocks(data as unknown as Stock[]);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => { ignore = true; };
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (stock: Stock) => {
    setEditingProduct(stock);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await api.deleteStock(id);
      fetchStocks();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product.');
    }
  };

  const filteredStocks = stocks.filter(stock => 
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">{t('inventory')}</h1>
          <p className="text-text-secondary font-medium">Monitor and manage your product stock levels.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary gap-2 font-bold" onClick={() => window.location.href='/inventory/adjustments/new'}>
            <ArrowDownLeft size={18} />
            Stock Adjustment
          </button>
          <button 
            className="btn btn-primary shadow-primary/30 font-bold"
            onClick={handleAddProduct}
          >
            <Plus size={20} />
            {t('add_new_product')}
          </button>
        </div>
      </div>

      {/* Inventory Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-5 border-l-4 border-primary">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest">Total Items</p>
          <h4 className="text-2xl font-black text-text-primary mt-1">{stocks.length}</h4>
        </div>
        <div className="card p-5 border-l-4 border-success">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest">In Stock</p>
          <h4 className="text-2xl font-black text-text-primary mt-1">{stocks.filter(s => s.quantity > 0).length}</h4>
        </div>
        <div className="card p-5 border-l-4 border-error">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest">Low Stock</p>
          <h4 className="text-2xl font-black text-text-primary mt-1">{stocks.filter(s => s.quantity < (s.reorder_level || 10) && s.quantity > 0).length}</h4>
        </div>
        <div className="card p-5 border-l-4 border-text-muted">
          <p className="text-xs font-black text-text-muted uppercase tracking-widest">Out of Stock</p>
          <h4 className="text-2xl font-black text-text-primary mt-1">{stocks.filter(s => s.quantity === 0).length}</h4>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              title="Search Inventory"
              className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary gap-2 font-bold">
              <Filter size={18} />
              Filter
            </button>
            <button className="btn btn-secondary gap-2 font-bold" onClick={() => window.location.href='/inventory/categories'}>
              <Tag size={18} />
              Categories
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Product</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">SKU</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Category</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Price</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Stock</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredStocks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-text-muted font-medium">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredStocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border">
                            {stock.image ? (
                              <img src={stock.image} alt={stock.name} title={stock.name} className="w-full h-full object-cover rounded-xl" />
                            ) : (
                              <Package size={20} />
                            )}
                          </div>
                          <span className="font-bold text-text-primary">{stock.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-text-muted font-bold">{stock.sku || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-text-secondary bg-bg-tertiary px-3 py-1 rounded-full uppercase">
                          {stock.category_name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-text-primary text-right">
                        {stock.selling_price?.toLocaleString()} <span className="text-[10px] text-text-muted uppercase">MMK</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={`text-sm font-black ${stock.quantity < (stock.reorder_level || 10) ? 'text-error' : 'text-success'}`}>
                            {stock.quantity} {stock.unit_name}
                          </span>
                          {stock.quantity < (stock.reorder_level || 10) && <AlertTriangle size={14} className="text-error" />}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="Edit Product"
                            onClick={() => handleEditProduct(stock)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Product"
                            onClick={() => handleDeleteProduct(stock.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted transition-all" title="More Options"><MoreVertical size={18} /></button>
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

      <ProductModal 
        key={isModalOpen ? (editingProduct?.id || 'new') : 'closed'}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => fetchStocks(true)}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default Inventory;
