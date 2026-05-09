import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, FolderTree, X } from 'lucide-react';
import { api } from '../../lib/api';

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', parentId: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function initFetch() {
      try {
        const data = await api.getCategories();
        if (!ignore) {
          setCategories(data);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) setLoading(false);
      }
    }
    initFetch();
    return () => { ignore = true; };
  }, []);

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingId(category.id);
      setFormData({ name: category.name, parentId: category.parentId || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', parentId: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', parentId: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateCategory(editingId, { 
          name: formData.name, 
          parentId: formData.parentId || null 
        });
      } else {
        await api.createCategory({ 
          name: formData.name, 
          parentId: formData.parentId || null 
        });
      }
      handleCloseModal();
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category', err);
      // TODO: Show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    
    try {
      await api.deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category', err);
      // TODO: Show toast notification
    }
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Categories</h1>
          <p className="text-text-secondary font-medium">Manage product categories and hierarchy.</p>
        </div>
        <button 
          className="btn btn-primary shadow-primary/30 font-bold"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search categories..." 
              title="Search Categories"
              className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Parent Category</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Created At</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted font-medium">
                      No categories found.
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border">
                            <FolderTree size={20} />
                          </div>
                          <span className="font-bold text-text-primary">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-text-secondary">
                          {cat.parentId ? categories.find(c => c.id === cat.parentId)?.name || cat.parentId : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-text-muted">
                          {new Date(cat.createdAt * 1000).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="Edit Category"
                            onClick={() => handleOpenModal(cat)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Category"
                            onClick={() => handleDelete(cat.id)}
                          >
                            <Trash2 size={18} />
                          </button>
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-bg-primary w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-border bg-bg-secondary">
              <h2 className="text-xl font-black text-text-primary">
                {editingId ? 'Edit Category' : 'Add Category'}
              </h2>
              <button 
                type="button"
                title="Close Modal"
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Category Name</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Beverages"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Parent Category (Optional)</label>
                <select
                  title="Parent Category"
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={formData.parentId}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                >
                  <option value="">None (Top Level)</option>
                  {categories.filter(c => c.id !== editingId).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary flex-1"
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
