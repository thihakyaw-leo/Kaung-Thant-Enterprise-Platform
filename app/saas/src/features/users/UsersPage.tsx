import { 
  UserPlus, 
  Search, 
  Shield, 
  ShieldCheck,
  Mail,
  Calendar,
  Trash2,
  UserCheck,
  UserX,
  Edit2
} from 'lucide-react';
import { useUsers, useUpdateUser, useDeleteUser, useCreateUser, SaasUser } from './hooks/useUsers';
import { cn } from '../../utils/cn';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function UsersPage() {
  const { t } = useTranslation();
  const { data: users, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SaasUser | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin',
    permissions: [] as string[]
  });

  const availablePermissions = [
    { id: 'tenants', label: t('tenants.title'), actions: ['view', 'manage'] },
    { id: 'users', label: t('users.title'), actions: ['view', 'manage'] },
    { id: 'billing', label: t('subscriptions.title'), actions: ['view', 'manage'] },
    { id: 'settings', label: t('settings.title'), actions: ['view', 'manage'] },
  ];

  const filteredUsers = users?.filter(user => 
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStatusToggle = (id: string, currentStatus: string) => {
    updateUser.mutate({ 
      id, 
      updates: { status: currentStatus === 'active' ? 'suspended' : 'active' } 
    });
  };

  const handleEditClick = (user: SaasUser) => {
    setEditingUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '', 
      role: user.role,
      permissions: user.permissions ? JSON.parse(user.permissions) : []
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('users.remove_confirm'))) {
      deleteUser.mutate(id);
    }
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createUser.mutate(formData, {
      onSuccess: () => {
        setIsInviteModalOpen(false);
        setFormData({ fullName: '', email: '', password: '', role: 'admin', permissions: [] });
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser.mutate({
      id: editingUser.id,
      updates: {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        permissions: formData.permissions
      }
    }, {
      onSuccess: () => {
        setIsEditModalOpen(false);
        setEditingUser(null);
        setFormData({ fullName: '', email: '', password: '', role: 'admin', permissions: [] });
      }
    });
  };

  const togglePermission = (permId: string, action: string) => {
    const key = `${permId}:${action}`;
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(key)
        ? prev.permissions.filter(p => p !== key)
        : [...prev.permissions, key]
    }));
  };

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-6 animate-in fade-in duration-700">
      {/* Header - Fixed at top */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display-lg font-bold text-white tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-primary" size={32} />
            {t('users.title')}
          </h1>
          <p className="text-on-surface/60">{t('users.description')}</p>
        </div>
        <button 
          onClick={() => {
            setFormData({ fullName: '', email: '', password: '', role: 'admin', permissions: [] });
            setIsInviteModalOpen(true);
          }}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10"
        >
          <UserPlus size={20} />
          <span>{t('users.invite')}</span>
        </button>
      </div>


      {/* Invite/Edit Modal */}
      <AnimatePresence>
        {(isInviteModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsInviteModalOpen(false);
                setIsEditModalOpen(false);
                setEditingUser(null);
              }}
              className="absolute inset-0 bg-surface-bright/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-4xl bg-surface-container-low border border-outline-variant/20 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header - Fixed */}
              <div className="relative z-20 px-10 pt-10 pb-6 border-b border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary shadow-[0_0_20px_rgba(var(--color-primary),0.1)]">
                      {isEditModalOpen ? <Edit2 size={28} /> : <UserPlus size={28} />}
                    </div>
                    <div>
                      <h2 className="text-3xl font-black text-white tracking-tight">{isEditModalOpen ? t('users.edit') : t('users.new')}</h2>
                      <p className="text-sm text-on-surface/50 font-medium">Configure platform access and granular permissions</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setIsInviteModalOpen(false);
                      setIsEditModalOpen(false);
                      setEditingUser(null);
                    }}
                    aria-label="Close modal"
                    className="p-2 hover:bg-white/5 rounded-full text-on-surface/40 transition-colors"
                  >
                    <Trash2 size={20} className="rotate-45" /> 
                  </button>
                </div>
              </div>

              <form onSubmit={isEditModalOpen ? handleEditSubmit : handleInviteSubmit} className="flex flex-col flex-1 overflow-hidden">
                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto px-10 py-8 space-y-8 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                      <div className="space-y-1.5">
                        <label htmlFor="full_name" className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Identity</label>
                        <input 
                          required
                          id="full_name"
                          type="text" 
                          placeholder="Full Name (e.g. Mg Mg)"
                          value={formData.fullName}
                          onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                          className="w-full px-5 py-3.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-2xl text-white outline-none focus:border-primary/50 transition-all placeholder:text-on-surface/20"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="email" className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Contact</label>
                        <input 
                          required
                          id="email"
                          type="email" 
                          placeholder="Email (e.g. name@kinetic.io)"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-5 py-3.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-2xl text-white outline-none focus:border-primary/50 transition-all placeholder:text-on-surface/20"
                        />
                      </div>

                      {!isEditModalOpen && (
                        <div className="space-y-1.5">
                          <label htmlFor="temp_password" className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Security</label>
                          <input 
                            required
                            id="temp_password"
                            type="password" 
                            placeholder="Temporary Password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full px-5 py-3.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-2xl text-white outline-none focus:border-primary/50 transition-all placeholder:text-on-surface/20"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label htmlFor="platform_role" className="text-xs font-bold text-primary uppercase tracking-widest ml-1">Access Tier</label>
                        <div className="relative group">
                          <select 
                            id="platform_role"
                            aria-label="Select Platform Role"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'super_admin'})}
                            className="w-full px-5 py-3.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-2xl text-white outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                          >
                            <option value="admin" className="bg-surface-container-high">Administrator (Scoped)</option>
                            <option value="super_admin" className="bg-surface-container-high">Super Admin (All access)</option>
                          </select>
                          <Shield className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/30 group-focus-within:text-primary transition-colors" size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="space-y-6">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-bold text-secondary uppercase tracking-widest">Platform Permissions</label>
                        {formData.role === 'super_admin' && (
                          <span className="text-[10px] font-black bg-secondary/10 text-secondary px-2 py-0.5 rounded uppercase">Full System</span>
                        )}
                      </div>
                      
                      <div className={cn(
                        "space-y-3 p-4 bg-black/20 rounded-3xl border border-outline-variant/5 transition-opacity",
                        formData.role === 'super_admin' ? "opacity-50 pointer-events-none" : "opacity-100"
                      )}>
                        {availablePermissions.map(perm => (
                          <div key={perm.id} className="p-4 bg-surface-bright/5 rounded-2xl border border-outline-variant/5 hover:border-outline-variant/10 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-xs font-bold text-white/80">{perm.label}</span>
                              <div className="flex gap-1.5">
                                {perm.actions.map(action => (
                                  <button
                                    key={action}
                                    type="button"
                                    onClick={() => togglePermission(perm.id, action)}
                                    className={cn(
                                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border",
                                      formData.permissions.includes(`${perm.id}:${action}`)
                                        ? "bg-secondary text-on-secondary border-secondary shadow-[0_0_10px_rgba(var(--color-secondary),0.2)]"
                                        : "bg-white/5 text-on-surface/40 border-white/5 hover:border-secondary/30"
                                    )}
                                  >
                                    {action}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                               <div className={cn(
                                 "h-full transition-all duration-500",
                                 formData.permissions.some(p => p.startsWith(perm.id)) ? "bg-secondary w-full" : "bg-white/0 w-0"
                               )} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer - Fixed */}
                <div className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/80 backdrop-blur-md">
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => {
                        setIsInviteModalOpen(false);
                        setIsEditModalOpen(false);
                        setEditingUser(null);
                      }}
                      className="flex-1 py-4 bg-surface-container-high/50 text-white font-bold rounded-2xl hover:bg-surface-container-high transition-all"
                    >
                      Discard Changes
                    </button>
                    <button 
                      type="submit"
                      disabled={createUser.isPending || updateUser.isPending}
                      className="flex-2 py-4 bg-primary text-on-primary font-black uppercase tracking-widest rounded-2xl hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {createUser.isPending || updateUser.isPending ? 'Processing...' : (isEditModalOpen ? 'Save Settings' : 'Confirm & Send Invite')}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Controls - Fixed below header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-container-low/60 backdrop-blur-md p-4 rounded-2xl border border-outline-variant/10 shrink-0 shadow-sm">
        <div className="relative flex-1 w-full">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 pl-10 pr-4 py-2.5 bg-surface-container-low/50 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
          >
            <UserPlus size={20} />
            {t('users.invite')}
          </button>
        </div>
      </div>


      {/* SaaS User Scrollable Area */}
      <div className="flex-1 min-h-0 bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-2xl overflow-hidden flex flex-col shadow-inner">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-surface-container-high/90 backdrop-blur-md border-b border-outline-variant/10">
                    <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('users.full_name')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('users.role')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('common.status')}</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('users.permissions')}</th>
                    <th className="px-6 py-4 text-right text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">

              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8 bg-surface-bright/5"></td>
                  </tr>
                ))
              ) : filteredUsers?.map((user) => (
                <tr key={user.id} className="hover:bg-surface-bright/5 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold">
                        {user.fullName.substring(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-white text-base">{user.fullName}</p>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface/50">
                          <Mail size={12} />
                          <span>{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {user.role === 'super_admin' ? (
                        <ShieldCheck size={16} className="text-secondary" />
                      ) : (
                        <Shield size={16} className="text-primary" />
                      )}
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                        user.role === 'super_admin' ? "bg-primary/10 text-primary border border-primary/20" : "bg-secondary/10 text-secondary border border-secondary/20"
                      )}>
                        {t(`users.roles.${user.role}`)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      type="button"
                      onClick={() => handleStatusToggle(user.id, user.status)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border",
                        user.status === 'active' 
                          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                          : "bg-error/10 text-error border-error/20 hover:bg-error/20"
                      )}
                    >
                      {user.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </button>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">
                        {user.lastActivityAt ? (
                          (() => {
                            const diff = Math.floor(Date.now() / 1000) - user.lastActivityAt;
                            if (diff < 60) return 'Just now';
                            if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                            if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                            return `${Math.floor(diff / 86400)}d ago`;
                          })()
                        ) : 'Never'}
                      </span>
                      <span className="text-[10px] text-on-surface/40">Last active</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-on-surface/60 text-sm">
                      <Calendar size={14} />
                      <span>{new Date(user.createdAt * 1000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        type="button"
                        onClick={() => handleEditClick(user)}
                        className="p-2 text-on-surface/40 hover:text-primary transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-on-surface/40 hover:text-error transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
