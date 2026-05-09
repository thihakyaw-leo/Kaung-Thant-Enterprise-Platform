import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, Scale, X } from 'lucide-react';
import { api } from '../../lib/api';

const Units: React.FC = () => {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ name: '', shortName: '' });

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const data = await api.getUnits();
      setUnits(data);
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
        const data = await api.getUnits();
        if (!ignore) {
          setUnits(data);
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

  const handleOpenModal = (unit: any = null) => {
    if (unit) {
      setEditingId(unit.id);
      setFormData({ name: unit.name, shortName: unit.shortName || '' });
    } else {
      setEditingId(null);
      setFormData({ name: '', shortName: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', shortName: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortName.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateUnit(editingId, { 
          name: formData.name, 
          shortName: formData.shortName 
        });
      } else {
        await api.createUnit({ 
          name: formData.name, 
          shortName: formData.shortName 
        });
      }
      handleCloseModal();
      fetchUnits();
    } catch (err) {
      console.error('Failed to save unit', err);
      // TODO: Show toast notification
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    
    try {
      await api.deleteUnit(id);
      fetchUnits();
    } catch (err) {
      console.error('Failed to delete unit', err);
      // TODO: Show toast notification
    }
  };

  const filteredUnits = units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    unit.shortName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Units of Measurement</h1>
          <p className="text-text-secondary font-medium">Manage how your products are measured and sold.</p>
        </div>
        <button 
          className="btn btn-primary shadow-primary/30 font-bold"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Unit
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search units..." 
              title="Search Units"
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
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Short Name (Symbol)</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-text-muted font-medium">
                      No units found.
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border">
                            <Scale size={20} />
                          </div>
                          <span className="font-bold text-text-primary">{unit.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-black text-text-secondary bg-bg-tertiary border border-border px-3 py-1 rounded-full uppercase">
                          {unit.shortName || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="Edit Unit"
                            onClick={() => handleOpenModal(unit)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Unit"
                            onClick={() => handleDelete(unit.id)}
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
                {editingId ? 'Edit Unit' : 'Add Unit'}
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
                <label className="block text-sm font-bold text-text-secondary mb-2">Unit Name</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. Kilogram, Piece, Box"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Short Name (Symbol)</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-bg-tertiary border border-border rounded-xl px-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="e.g. kg, pc, box"
                  value={formData.shortName}
                  onChange={(e) => setFormData({...formData, shortName: e.target.value})}
                />
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
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Save Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Units;
