import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, UserCheck, X, Phone, Mail, MapPin, Percent } from 'lucide-react';
import { api } from '../../lib/api';

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '',
    commissionRate: 0
  });

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const data = await api.getAgents();
      setAgents(data);
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
        const data = await api.getAgents();
        if (!ignore) {
          setAgents(data);
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

  const handleOpenModal = (agent: any = null) => {
    if (agent) {
      setEditingId(agent.id);
      setFormData({ 
        name: agent.name, 
        phone: agent.phone || '', 
        email: agent.email || '', 
        address: agent.address || '',
        commissionRate: agent.commissionRate || 0
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', address: '', commissionRate: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', address: '', commissionRate: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateAgent(editingId, formData);
      } else {
        await api.createAgent(formData);
      }
      handleCloseModal();
      fetchAgents();
    } catch (err) {
      console.error('Failed to save agent', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this agent?')) return;
    
    try {
      await api.deleteAgent(id);
      fetchAgents();
    } catch (err) {
      console.error('Failed to delete agent', err);
    }
  };

  const filteredAgents = agents.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.phone?.includes(searchTerm) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Sales Agents</h1>
          <p className="text-text-secondary font-medium">Manage agents and their sales commission structures.</p>
        </div>
        <button 
          className="btn btn-primary shadow-primary/30 font-bold"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Agent
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by agent name..." 
              title="Search Agents"
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
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Agent</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Contact Info</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Commission</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted font-medium">
                      No agents found.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border">
                            <UserCheck size={20} />
                          </div>
                          <div>
                            <span className="font-bold block text-text-primary">{agent.name}</span>
                            <span className="text-xs text-text-muted font-medium">{agent.address || 'No address'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {agent.phone && (
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <Phone size={14} className="text-text-muted" />
                              {agent.phone}
                            </div>
                          )}
                          {agent.email && (
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <Mail size={14} className="text-text-muted" />
                              {agent.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1 rounded-full w-fit border border-success/20">
                          <Percent size={14} />
                          <span className="text-sm font-black">{agent.commissionRate}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="Edit Agent"
                            onClick={() => handleOpenModal(agent)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Agent"
                            onClick={() => handleDelete(agent.id)}
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
          <div className="bg-bg-primary w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-up">
            <div className="flex justify-between items-center p-6 border-b border-border bg-bg-secondary">
              <h2 className="text-xl font-black text-text-primary">
                {editingId ? 'Edit Agent' : 'Add Agent'}
              </h2>
              <button 
                onClick={handleCloseModal}
                title="Close Modal"
                className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-text-secondary mb-2">Agent Name</label>
                  <div className="relative">
                    <UserCheck size={18} className="absolute left-4 top-3.5 text-text-muted" />
                    <input 
                      type="text"
                      required
                      className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="Enter agent's full name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-3.5 text-text-muted" />
                    <input 
                      type="tel"
                      className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="09..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-secondary mb-2">Commission Rate (%)</label>
                  <div className="relative">
                    <Percent size={18} className="absolute left-4 top-3.5 text-text-muted" />
                    <input 
                      type="number"
                      step="0.01"
                      className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="0.00"
                      value={formData.commissionRate}
                      onChange={(e) => setFormData({...formData, commissionRate: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-text-muted" />
                  <input 
                    type="email"
                    className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="agent@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-secondary mb-2">Home/Office Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-3.5 text-text-muted" />
                  <textarea 
                    className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Enter agent's full address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
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
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Save Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
