import React, { useEffect, useState } from 'react';
import { X, Loader2, Package, Barcode, Tag, DollarSign, Box, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';
import type { Stock, Category, Unit } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingProduct: Stock | null;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, editingProduct }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  // Derive fetching state: true if open but data hasn't arrived yet
  const fetchingData = isOpen && !isDataLoaded;
  
  const [formData, setFormData] = useState<Partial<Stock>>(
    editingProduct 
      ? { ...editingProduct } 
      : {
          name: '',
          sku: '',
          barcode: '',
          category_id: '',
          unit_id: '',
          selling_price: 0,
          cost_price: 0,
          quantity: 0,
          reorder_level: 5,
          image: ''
        }
  );

  useEffect(() => {
    let ignore = false;

    if (isOpen) {
      const loadData = async () => {
        try {
          const [catRes, unitRes] = await Promise.all([
            api.getCategories(),
            api.getUnits()
          ]);
          if (!ignore) {
            setCategories(catRes as unknown as Category[]);
            setUnits(unitRes as unknown as Unit[]);
            setIsDataLoaded(true);
          }
        } catch (err) {
          console.error('Failed to fetch modal data:', err);
        }
      };
      loadData();
    }

    return () => { ignore = true; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setLoading(true);
    try {
      if (editingProduct) {
        await api.updateStock(editingProduct.id, formData);
      } else {
        await api.createStock(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
      alert('Failed to save product. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
      <div className="bg-bg-primary w-full max-w-2xl rounded-3xl shadow-2xl border border-border overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-bg-secondary">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Package size={24} />
            </div>
            <h2 className="text-xl font-black text-text-primary">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
          </div>
          <button 
            type="button"
            title="Close Modal"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <Tag size={14} /> Basic Information
              </h3>
              
              <div>
                <label htmlFor="product_name" className="block text-xs font-black text-text-secondary mb-1 uppercase">Product Name *</label>
                <input 
                  id="product_name"
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Premium Coffee Beans"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label htmlFor="product_sku" className="block text-xs font-black text-text-secondary mb-1 uppercase">SKU / Code</label>
                <div className="relative">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                  <input 
                    id="product_sku"
                    type="text"
                    className="input-field pl-10"
                    placeholder="e.g. PCB-001"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="product_category" className="block text-xs font-black text-text-secondary mb-1 uppercase">Category</label>
                  <select
                    id="product_category"
                    title="Select Category"
                    className="input-field"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                  >
                    <option value="">{fetchingData ? 'Loading...' : 'Select Category'}</option>
                    {!fetchingData && categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="product_unit" className="block text-xs font-black text-text-secondary mb-1 uppercase">Unit</label>
                  <select
                    id="product_unit"
                    title="Select Unit"
                    className="input-field"
                    value={formData.unit_id}
                    onChange={(e) => setFormData({...formData, unit_id: e.target.value})}
                  >
                    <option value="">{fetchingData ? 'Loading...' : 'Select Unit'}</option>
                    {!fetchingData && units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing & Stock */}
            <div className="space-y-4">
              <h3 className="text-sm font-black text-text-muted uppercase tracking-widest mb-2 flex items-center gap-2">
                <DollarSign size={14} /> Pricing & Inventory
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="selling_price" className="block text-xs font-black text-text-secondary mb-1 uppercase">Selling Price *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-muted">MMK</span>
                    <input 
                      id="selling_price"
                      type="number"
                      required
                      className="input-field pl-12"
                      placeholder="0"
                      value={formData.selling_price}
                      onChange={(e) => setFormData({...formData, selling_price: Number(e.target.value)})}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="cost_price" className="block text-xs font-black text-text-secondary mb-1 uppercase">Cost Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-muted">MMK</span>
                    <input 
                      id="cost_price"
                      type="number"
                      className="input-field pl-12"
                      placeholder="0"
                      value={formData.cost_price}
                      onChange={(e) => setFormData({...formData, cost_price: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="initial_stock" className="block text-xs font-black text-text-secondary mb-1 uppercase">Initial Stock</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                    <input 
                      id="initial_stock"
                      type="number"
                      className="input-field pl-10"
                      placeholder="0"
                      disabled={!!editingProduct}
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                    />
                  </div>
                  {editingProduct && (
                    <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                      <AlertCircle size={10} /> Use Stock Adjustment to update
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="reorder_level" className="block text-xs font-black text-text-secondary mb-1 uppercase">Reorder Level</label>
                  <input 
                    id="reorder_level"
                    type="number"
                    className="input-field"
                    placeholder="5"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({...formData, reorder_level: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="image_url" className="block text-xs font-black text-text-secondary mb-1 uppercase">Image URL</label>
                <input 
                  id="image_url"
                  type="text"
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-border">
            <button 
              type="button" 
              className="btn btn-secondary flex-1 py-4 font-black uppercase tracking-widest text-xs"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary flex-1 py-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
      
      <style>{`
        .input-field {
          width: 100%;
          background-color: var(--bg-tertiary);
          border: 1px border var(--border);
          border-radius: 1rem;
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.2s;
          outline: none;
        }
        .input-field:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
          background-color: white;
        }
      `}</style>
    </div>
  );
};

export default ProductModal;
