import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Receipt,
  X
} from 'lucide-react';
import { api } from '../../lib/api';
import type { ExpenseType } from '../../types';

const ExpenseTypes: React.FC = () => {
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<ExpenseType | null>(null);
  const [formData, setFormData] = useState({ name: '' });
  const [saving, setSaving] = useState(false);

  const fetchTypes = React.useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const data = await api.getExpenseTypes();
      setTypes(data as unknown as ExpenseType[]);
    } catch (err) {
      console.error('Failed to fetch expense types:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    
    const loadData = async () => {
      try {
        const data = await api.getExpenseTypes();
        if (!ignore) {
          setTypes(data as unknown as ExpenseType[]);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch expense types:', err);
        if (!ignore) setLoading(false);
      }
    };

    loadData();
    return () => { ignore = true; };
  }, []);

  const handleAdd = () => {
    setEditingType(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (type: ExpenseType) => {
    setEditingType(type);
    setFormData({ name: type.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense type?')) return;
    
    try {
      await api.deleteExpenseType(id);
      fetchTypes();
    } catch (err) {
      console.error('Failed to delete expense type:', err);
      alert('Failed to delete. This type might be in use.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      if (editingType) {
        await api.updateExpenseType(editingType.id, formData);
      } else {
        await api.createExpenseType(formData);
      }
      fetchTypes();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to save expense type:', err);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredTypes = types.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
            <Receipt className="text-primary" size={32} />
            Expense Types
          </h1>
          <p className="text-text-secondary font-medium">Manage categories for your business expenses.</p>
        </div>
        <button 
          className="btn btn-primary shadow-primary/30 font-bold"
          onClick={handleAdd}
        >
          <Plus size={20} />
          Add Expense Type
        </button>
      </div>

      {/* Search & List */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border bg-bg-secondary/50">
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search types..." 
              title="Search Expense Types"
              className="input-field-search pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-primary" size={40} />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Type Name</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">ID</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTypes.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-text-muted font-medium">
                      No expense types found.
                    </td>
                  </tr>
                ) : (
                  filteredTypes.map((type) => (
                    <tr key={type.id} className="hover:bg-bg-secondary transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-bold text-text-primary">{type.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-mono text-text-muted">{type.id}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="Edit Type"
                            onClick={() => handleEdit(type)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Type"
                            onClick={() => handleDelete(type.id)}
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-bg-primary w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-border bg-bg-secondary">
              <h2 className="text-xl font-black text-text-primary">
                {editingType ? 'Edit Expense Type' : 'Add Expense Type'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="type_name" className="block text-xs font-black text-text-secondary mb-2 uppercase tracking-widest">
                  Type Name *
                </label>
                <input 
                  id="type_name"
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Utilities, Rent, Salaries"
                  className="input-field-modal w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button" 
                  className="btn btn-secondary flex-1 py-3 font-black uppercase text-xs"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-1 py-3 font-black uppercase text-xs shadow-lg shadow-primary/20"
                  disabled={saving}
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .input-field-search {
          background-color: white;
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.625rem 1rem;
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field-search:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        }
        .input-field-modal {
          background-color: var(--bg-tertiary);
          border: 1px solid var(--border);
          border-radius: 1rem;
          padding: 0.875rem 1.25rem;
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field-modal:focus {
          border-color: var(--primary);
          background-color: white;
          box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1);
        }
      `}</style>
    </div>
  );
};

export default ExpenseTypes;
