import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Loader2, User, X, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { api } from '../../lib/api';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
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
    creditLimit: 0
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api.getCustomers();
      setCustomers(data);
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
        const data = await api.getCustomers();
        if (!ignore) {
          setCustomers(data);
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

  const handleOpenModal = (customer: any = null) => {
    if (customer) {
      setEditingId(customer.id);
      setFormData({ 
        name: customer.name, 
        phone: customer.phone || '', 
        email: customer.email || '', 
        address: customer.address || '',
        creditLimit: customer.creditLimit || 0
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', phone: '', email: '', address: '', creditLimit: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', phone: '', email: '', address: '', creditLimit: 0 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.updateCustomer(editingId, formData);
      } else {
        await api.createCustomer(formData);
      }
      handleCloseModal();
      fetchCustomers();
    } catch (err) {
      console.error('Failed to save customer', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    
    try {
      await api.deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      console.error('Failed to delete customer', err);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone?.includes(searchTerm) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Customers</h1>
          <p className="text-text-secondary font-medium">Manage your customer database and credit limits.</p>
        </div>
        <button 
          className="btn btn-primary shadow-primary/30 font-bold"
          onClick={() => handleOpenModal()}
        >
          <Plus size={20} />
          Add Customer
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, phone or email..." 
              title="Search Customers"
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
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Customer</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Contact</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Balance / Limit</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text-muted font-medium">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-bg-secondary transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-bg-tertiary flex items-center justify-center text-primary border border-border">
                            <User size={20} />
                          </div>
                          <div>
                            <span className="font-bold block text-text-primary">{customer.name}</span>
                            <span className="text-xs text-text-muted font-medium">{customer.address || 'No address'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {customer.phone && (
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <Phone size={14} className="text-text-muted" />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <Mail size={14} className="text-text-muted" />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-black text-text-primary">
                            {customer.balance?.toLocaleString()} <span className="text-[10px] text-text-muted">MMK</span>
                          </div>
                          <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            Limit: {customer.creditLimit?.toLocaleString()} MMK
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-primary transition-all" 
                            title="Edit Customer"
                            onClick={() => handleOpenModal(customer)}
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            className="p-2 rounded-lg hover:bg-bg-tertiary text-error transition-all" 
                            title="Delete Customer"
                            onClick={() => handleDelete(customer.id)}
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
                {editingId ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button 
                onClick={handleCloseModal}
                title="Close Modal"
                className="p-2 rounded-full hover:bg-bg-tertiary text-text-muted transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-secondary mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-3.5 text-text-muted" />
                  <input 
                    type="text"
                    required
                    className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Enter customer name"
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
                <label className="block text-sm font-bold text-text-secondary mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-3.5 text-text-muted" />
                  <input 
                    type="email"
                    className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="example@mail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-secondary mb-2">Address</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-4 top-3.5 text-text-muted" />
                  <textarea 
                    className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    placeholder="Enter full address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-text-secondary mb-2">Credit Limit (MMK)</label>
                <div className="relative">
                  <CreditCard size={18} className="absolute left-4 top-3.5 text-text-muted" />
                  <input 
                    type="number"
                    className="w-full bg-bg-tertiary border border-border rounded-xl pl-11 pr-4 py-3 text-text-primary font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="0"
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({...formData, creditLimit: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="md:col-span-2 flex gap-3 pt-4">
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
                  {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
