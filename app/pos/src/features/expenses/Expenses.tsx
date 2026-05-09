import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Loader2,
  Receipt,
  X,
  MapPin,
  FileText,
  DollarSign,
  PieChart,
  ChevronRight,
  Settings
} from 'lucide-react';
import { api } from '../../lib/api';

// Helper to get timestamp outside of component render scope to satisfy compiler purity rules
const getCurrentTimestamp = () => Math.floor(Date.now() / 1000);

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [expenseTypeId, setExpenseTypeId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Type Form State
  const [newTypeName, setNewTypeName] = useState('');

  const fetchData = useCallback(async (isInitial = false) => {
    if (!isInitial) setLoading(true);
    try {
      const [e, t, l] = await Promise.all([
        api.getExpenses(),
        api.getExpenseTypes(),
        api.getLocations()
      ]);
      setExpenses(e);
      setTypes(t);
      setLocations(l);
      
      // Only set initial location if not already set
      if (l.length > 0) {
        setLocationId(prev => prev || (l[0].id as string));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Avoid synchronous state updates in effect body
    const init = async () => {
      await fetchData(true);
    };
    init();
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTypeId || !locationId || !amount) return;

    const now = getCurrentTimestamp();
    setSubmitting(true);
    try {
      await api.createExpense({
        expenseTypeId,
        locationId,
        amount: Number(amount),
        note,
        referenceNo,
        transactionDate: now
      });
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to save expense.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTypeName) return;
    try {
      await api.createExpenseType({ name: newTypeName });
      setNewTypeName('');
      const t = await api.getExpenseTypes();
      setTypes(t);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record?')) return;
    try {
      await api.deleteExpense(id);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setExpenseTypeId('');
    setAmount('');
    setNote('');
    setReferenceNo('');
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => 
      e.expenseTypeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.note?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [expenses, searchTerm]);

  const totalAmount = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary">Expense Tracking</h1>
          <p className="text-text-secondary font-medium">Log and monitor shop operational costs.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowTypeModal(true)}
            className="btn btn-secondary shadow-sm font-bold"
            title="Manage Categories"
            aria-label="Manage Categories"
          >
            <Settings size={20} />
            Categories
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="btn btn-primary bg-error hover:bg-error/90 shadow-error/30 font-bold"
            title="Log Expense"
            aria-label="Log Expense"
          >
            <Plus size={20} />
            Log Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-error bg-linear-to-br from-error/5 to-transparent">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-black text-text-muted uppercase tracking-widest">Total Monthly</p>
            <div className="p-2 rounded-lg bg-error/10 text-error"><DollarSign size={16} /></div>
          </div>
          <h4 className="text-3xl font-black text-text-primary">{totalAmount.toLocaleString()} <span className="text-sm font-bold text-text-muted">MMK</span></h4>
        </div>
        <div className="card p-6 border-l-4 border-primary bg-linear-to-br from-primary/5 to-transparent">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-black text-text-muted uppercase tracking-widest">Transaction Count</p>
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><FileText size={16} /></div>
          </div>
          <h4 className="text-3xl font-black text-text-primary">{expenses.length} <span className="text-sm font-bold text-text-muted">Records</span></h4>
        </div>
        <div className="card p-6 border-l-4 border-success bg-linear-to-br from-success/5 to-transparent">
          <div className="flex justify-between items-start mb-2">
            <p className="text-xs font-black text-text-muted uppercase tracking-widest">Expense Share</p>
            <div className="p-2 rounded-lg bg-success/10 text-success"><PieChart size={16} /></div>
          </div>
          <h4 className="text-3xl font-black text-text-primary">100% <span className="text-sm font-bold text-text-muted">Logged</span></h4>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between bg-bg-secondary">
          <div className="flex-1 flex items-center bg-white border border-border rounded-xl px-4 py-2.5 focus-within:ring-4 focus-within:ring-error/10 transition-all shadow-sm">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by category, note or reference..." 
              title="Search Expenses"
              className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-error/30" size={40} /></div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-bg-secondary/30">
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Category / Location</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Date / Ref</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Note</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest">Amount</th>
                  <th className="px-6 py-4 text-xs font-black text-text-muted uppercase tracking-widest text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-text-muted font-medium italic">
                      No expense records found.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-bg-secondary/50 transition-colors group animate-slide-up">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-error/5 text-error border border-error/10"><Receipt size={20} /></div>
                          <div>
                            <span className="font-black text-text-primary block">{expense.expenseTypeName || 'Uncategorized'}</span>
                            <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                              <MapPin size={10} /> {expense.locationName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-text-secondary block">
                          {new Date(expense.transactionDate * 1000).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-black text-text-muted uppercase">{expense.referenceNo || 'No Ref'}</span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <p className="text-sm text-text-secondary font-medium truncate italic">
                          {expense.note ? `"${expense.note}"` : '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-lg font-black text-error">
                          {expense.amount?.toLocaleString()} <span className="text-[10px] text-text-muted">MMK</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(expense.id)}
                          className="p-2 rounded-lg hover:bg-error/10 text-text-muted hover:text-error transition-all opacity-0 group-hover:opacity-100" 
                          title="Delete Expense"
                          aria-label="Delete Expense"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-md animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg-secondary/50">
              <h3 className="text-xl font-black text-text-primary">Log Operational Expense</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="p-2 hover:bg-bg-secondary rounded-lg transition-all" 
                title="Close Modal"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="expense-type">Category</label>
                <select 
                  id="expense-type"
                  required
                  title="Select Category"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-error/10 outline-none transition-all appearance-none"
                  value={expenseTypeId}
                  onChange={(e) => setExpenseTypeId(e.target.value)}
                >
                  <option value="">Select Category...</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="expense-location">Location</label>
                <select 
                  id="expense-location"
                  required
                  title="Select Location"
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-error/10 outline-none transition-all appearance-none"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                >
                  {locations.map(l => <option key={l.id} value={l.id as string}>{l.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="expense-amount">Amount (MMK)</label>
                  <input 
                    id="expense-amount"
                    type="number" 
                    required
                    placeholder="0"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-black text-text-primary focus:ring-4 focus:ring-error/10 outline-none transition-all"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="expense-ref">Reference No.</label>
                  <input 
                    id="expense-ref"
                    type="text" 
                    placeholder="Optional"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-error/10 outline-none transition-all"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-text-muted uppercase tracking-widest mb-2" htmlFor="expense-note">Note / Description</label>
                <textarea 
                  id="expense-note"
                  placeholder="What was this expense for?"
                  rows={3}
                  className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-medium text-text-primary focus:ring-4 focus:ring-error/10 outline-none transition-all resize-none"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                title="Confirm Payment"
                aria-label="Confirm and save expense"
                className="btn btn-primary w-full py-4 bg-error hover:bg-error/90 shadow-xl shadow-error/20 font-black text-lg"
              >
                {submitting ? <Loader2 size={24} className="animate-spin" /> : 'Confirm Payment'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Types Modal */}
      {showTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md animate-slide-up overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center bg-bg-secondary/50">
              <h3 className="text-xl font-black text-text-primary">Expense Categories</h3>
              <button 
                onClick={() => setShowTypeModal(false)} 
                className="p-2 hover:bg-bg-secondary rounded-lg transition-all" 
                title="Close Modal"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <form onSubmit={handleCreateType} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="New Category Name..."
                  title="New Category Name"
                  className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm font-bold text-text-primary focus:ring-4 focus:ring-error/10 outline-none transition-all"
                  value={newTypeName}
                  onChange={(e) => setNewTypeName(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary bg-error px-4 py-2.5 shadow-error/20"
                  title="Add Category"
                  aria-label="Add Category"
                >
                  <Plus size={18} />
                </button>
              </form>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                {types.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-bg-secondary rounded-xl border border-border group hover:border-error/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-error" />
                      <span className="font-bold text-text-primary">{t.name}</span>
                    </div>
                    <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;
