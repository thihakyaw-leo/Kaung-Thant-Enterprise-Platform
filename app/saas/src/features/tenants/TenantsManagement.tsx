import {
  Globe,
  Search,
  PauseCircle,
  PlayCircle,
  Trash2,
  ExternalLink,
  Plus,
  Loader2,
  X,
  Edit3,
  Key,
  ShieldCheck,
  User,
  UserCheck,
  Check,
  Zap,
  Crown,
  Trophy,
  Rocket,
  BarChart3,
  Monitor
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTenants, useUpdateTenantStatus, useDeleteTenant, useCreateTenant, useUpdateTenant, Tenant } from './hooks/useTenants';
import { useSettings } from '../settings/hooks/useSettings';
import { api } from '../../lib/api';
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const TenantsManagement = () => {
  const { t } = useTranslation();
  const { data: tenants, isLoading } = useTenants();
  const { data: settings } = useSettings();
  const updateStatus = useUpdateTenantStatus();
  const deleteTenant = useDeleteTenant();
  const createTenant = useCreateTenant();
  const updateTenant = useUpdateTenant();

  const rootDomain = useMemo(() => {
    const domain = settings?.find(s => s.key === 'root_domain')?.value;
    if (domain) return domain;

    // Fallback to primary_domain if root_domain is missing
    const primary = settings?.find(s => s.key === 'primary_domain')?.value;
    return primary || 'kaungthant.shop';
  }, [settings]);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTenant, setNewTenant] = useState({ name: '', subdomain: '', planId: 'basic', autoBilling: false });
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  const plans = [
    { id: 'basic', name: t('tenants.plans.starter'), price: 'Free', icon: Rocket, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'standard', name: t('tenants.plans.retail_core'), price: '50k/mo', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'professional', name: t('tenants.plans.business_pro'), price: '150k/mo', icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { id: 'enterprise', name: t('tenants.plans.enterprise_edge'), price: '500k/mo', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  ];

  const filteredTenants = Array.isArray(tenants) ? tenants.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTenant.mutateAsync(newTenant);
      setIsModalOpen(false);
      setNewTenant({ name: '', subdomain: '', planId: 'basic', autoBilling: false });
    } catch (error) {
      console.error('Failed to create tenant:', error);
    }
  };

  const handleEditOpen = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    try {
      await updateTenant.mutateAsync({
        id: editingTenant.id,
        updates: editingTenant
      });
      setIsEditModalOpen(false);
      setEditingTenant(null);
    } catch (error) {
      console.error('Failed to update tenant:', error);
    }
  };

  const handleToggleStatus = (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    const message = newStatus === 'active'
      ? t('tenants.confirm_activate', { name: tenant.name })
      : t('tenants.confirm_suspend', { name: tenant.name });

    if (confirm(message)) {
      updateStatus.mutate({ id: tenant.id, status: newStatus });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(t('tenants.confirm_delete', { name }))) {
      deleteTenant.mutate(id);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-6 animate-in fade-in duration-500 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display-lg font-bold text-white tracking-tight flex items-center gap-3">
            <Globe className="text-primary" size={32} />
            {t('tenants.title')}
          </h1>
          <p className="text-on-surface/60">{t('tenants.description')}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('tenants.new_tenant')}
        </button>
      </div>

      {/* Controls - Fixed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="glass rounded-2xl p-4 md:col-span-2 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40 group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder={t('common.search')}
              className="w-full bg-surface-container-low/50 border border-outline-variant/10 rounded-xl py-2.5 pl-10 pr-4 text-on-surface outline-none focus:border-primary/50 transition-all focus:ring-1 focus:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <span className="text-on-surface/60 font-medium">{t('tenants.total_businesses')}</span>
          <span className="text-2xl font-bold text-primary">{tenants?.length || 0}</span>
        </div>
      </div>

      {/* Table Section - Scrollable */}
      <div className="glass rounded-2xl overflow-hidden border border-white/5 flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10 bg-[#1A1C1E] shadow-sm">
              <tr className="bg-white/5 border-b border-outline-variant/10">
                <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('tenants.business_name')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('tenants.subdomain')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('tenants.plan')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('common.status')}</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('tenants.created_at')}</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-on-surface/40 uppercase tracking-widest">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-on-surface/40 animate-pulse font-medium">{t('common.synchronizing')}</p>
                  </td>
                </tr>
              ) : !Array.isArray(tenants) || filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-surface-bright rounded-full flex items-center justify-center text-on-surface/20">
                        <Globe size={32} />
                      </div>
                      <p className="text-on-surface/50 font-medium">{t('tenants.no_tenants')}</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTenants.map((tenant) => {
                const plan = plans.find(p => p.id === tenant.plan_id) || plans[0];
                const PlanIcon = plan.icon;

                return (
                  <tr key={tenant.id} className="hover:bg-white/2 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                          tenant.status === 'active' ? "bg-primary/10 text-primary border-primary/20" : "bg-surface-bright text-on-surface/40 border-outline-variant/10"
                        )}>
                          <Globe size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-white leading-tight">{tenant.name}</div>
                          <div className="text-[10px] text-on-surface/40 font-mono mt-0.5">{tenant.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <code className="text-xs text-secondary font-code-sm bg-secondary/10 px-2 py-1 rounded-lg border border-secondary/20">
                        {tenant.subdomain}.{rootDomain}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider",
                        plan.color, plan.bg, plan.border
                      )}>
                        <PlanIcon size={12} />
                        {plan.name}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border",
                        tenant.status === 'active'
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}>
                        {t(`common.${tenant.status}`)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-on-surface/40 text-xs">
                      {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={() => handleEditOpen(tenant)}
                          className="p-2 hover:bg-surface-bright rounded-lg text-primary transition-all"
                          title={t('common.edit')}
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Impersonate ${tenant.name}? You will be logged into their dashboard.`)) {
                              const res = await api.post(`/api/master/tenants/${tenant.id}/impersonate`);
                              const json = res.data;
                              if (json.success) window.open(json.data.redirectUrl, '_blank');
                            }
                          }}
                          className="p-2 hover:bg-surface-bright rounded-lg text-emerald-400 transition-all"
                          title="Login as Tenant"
                        >
                          <Monitor size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className={cn(
                            "p-2 hover:bg-surface-bright rounded-lg transition-all",
                            tenant.status === 'active' ? "text-amber-400" : "text-emerald-400"
                          )}
                          title={tenant.status === 'active' ? t('common.suspend') : t('common.activate')}
                        >
                          {tenant.status === 'active' ? <PauseCircle size={18} /> : <PlayCircle size={18} />}
                        </button>
                        <a
                          href={`https://${tenant.subdomain}.${rootDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-surface-bright rounded-lg text-secondary transition-all"
                          title={t('common.open_portal')}
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button
                          onClick={() => handleDelete(tenant.id, tenant.name)}
                          className="p-2 hover:bg-error/10 rounded-lg text-on-surface/30 hover:text-error transition-all"
                          title={t('common.terminate')}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provisioning Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl border border-white/10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">{t('tenants.provisioning')}</h2>
              <button onClick={() => setIsModalOpen(false)} title={t('common.close')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="text-on-surface/60" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/60 uppercase tracking-widest">{t('tenants.business_name')}</label>
                <input
                  required
                  type="text"
                  placeholder={t('tenants.enter_business_name')}
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 text-white outline-none focus:border-primary/50 transition-all"
                  value={newTenant.name}
                  onChange={(e) => setNewTenant({...newTenant, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/60 uppercase tracking-widest">{t('tenants.subdomain')}</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="kaungthant"
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-3 px-4 pr-24 text-white outline-none focus:border-primary/50 transition-all"
                    value={newTenant.subdomain}
                    onChange={(e) => setNewTenant({...newTenant, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '')})}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface/40 text-xs font-bold">.{rootDomain}</div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-on-surface/60 uppercase tracking-widest">{t('tenants.select_plan')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {plans.map(plan => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setNewTenant({...newTenant, planId: plan.id})}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        newTenant.planId === plan.id
                          ? "bg-primary/20 border-primary text-white shadow-lg shadow-primary/10"
                          : "bg-surface-container-low border-white/5 text-on-surface/50 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <plan.icon size={14} className={newTenant.planId === plan.id ? "text-white" : "text-on-surface/40"} />
                        <p className="text-xs font-black">{plan.name}</p>
                      </div>
                      <p className="text-[10px] opacity-60 font-mono mt-1">{plan.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-billing Toggle */}
              <div className="flex items-center justify-between p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white tracking-widest uppercase">Auto-billing</div>
                  <div className="text-[10px] text-on-surface/50">Automatically renew subscription using saved payment methods.</div>
                </div>
                <button
                  type="button"
                  title="Toggle Auto-billing"
                  aria-label="Toggle Auto-billing"
                  onClick={() => setNewTenant(prev => ({...prev, autoBilling: !prev.autoBilling}))}
                  className={cn(
                    "relative w-10 h-5 rounded-full transition-all duration-300",
                    newTenant.autoBilling ? "bg-primary" : "bg-on-surface/20"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    newTenant.autoBilling ? "left-5.5" : "left-0.5"
                  )}></div>
                </button>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={createTenant.isPending}
                  className="w-full bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createTenant.isPending ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                  {t('tenants.provision_tenant')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal with Credentials */}
      {isEditModalOpen && editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
          <div className="glass w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
              <div>
                <h2 className="text-xl font-bold text-white">{t('tenants.edit_tenant')}</h2>
                <p className="text-xs text-on-surface/60 mt-1">{t('tenants.edit_description')}</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} title={t('common.close')} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} className="text-on-surface/60" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Basic Info Section */}
              <section className="space-y-4">
                  <div className="flex items-center gap-2 text-primary">
                    <Globe size={18} />
                    <h3 className="text-sm font-bold uppercase tracking-widest">{t('tenants.business_identity')}</h3>
                  </div>

                  {/* Resource Usage Monitoring */}
                  <div className="glass-lighter rounded-2xl p-6 border border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-400">
                        <BarChart3 size={18} />
                        <h3 className="text-xs font-bold uppercase tracking-widest">Resource Usage Monitoring</h3>
                      </div>
                      <span className="text-[10px] font-bold text-on-surface/40 uppercase tracking-tighter">Real-time Metrics</span>
                    </div>

                    <div className="space-y-4">
                      {/* DB Usage */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-on-surface/60">Database size</span>
                          <span className="text-white">4.2MB / 10MB</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full w-[42%]"></div>
                        </div>
                      </div>
                      {/* Storage Usage */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-on-surface/60">R2 Storage</span>
                          <span className="text-white">125MB / 1GB</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-[12.5%]"></div>
                        </div>
                      </div>
                      {/* API Usage */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                          <span className="text-on-surface/60">API Request Counts</span>
                          <span className="text-white">12,450 / 50,000</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[24.9%]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">{t('tenants.business_name')}</label>
                    <input
                      required
                      type="text"
                      title={t('tenants.business_name')}
                      placeholder={t('tenants.enter_business_name')}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-2.5 px-4 text-white outline-none focus:border-primary/50 transition-all"
                      value={editingTenant.name}
                      onChange={(e) => setEditingTenant({...editingTenant, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface/40 uppercase tracking-widest">{t('tenants.subdomain')}</label>
                    <input
                      required
                      type="text"
                      title={t('tenants.subdomain')}
                      placeholder={t('tenants.subdomain')}
                      className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl py-2.5 px-4 text-on-surface/50 outline-none cursor-not-allowed"
                      value={editingTenant.subdomain}
                      readOnly
                    />
                  </div>
                </div>
              </section>

              {/* Credentials Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2 text-secondary">
                  <Key size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-widest">POS Terminal Credentials</h3>
                </div>

                {/* Owner Account */}
                <div className="glass-lighter rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-secondary/80">
                    <ShieldCheck size={16} />
                    <span className="text-xs font-bold uppercase">Owner Role (Full Access)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface/40 font-medium">Username</label>
                      <input
                        type="text"
                        placeholder="owner_admin"
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-secondary/30"
                        value={editingTenant.ownerUsername || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, ownerUsername: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface/40 font-medium">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-secondary/30"
                        value={editingTenant.ownerPassword || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, ownerPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Manager Account */}
                <div className="glass-lighter rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-primary/80">
                    <UserCheck size={16} />
                    <span className="text-xs font-bold uppercase">Manager Role</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface/40 font-medium">Username</label>
                      <input
                        type="text"
                        placeholder="manager_pos"
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-primary/30"
                        value={editingTenant.managerUsername || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, managerUsername: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface/40 font-medium">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-primary/30"
                        value={editingTenant.managerPassword || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, managerPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                {/* Cashier Account */}
                <div className="glass-lighter rounded-2xl p-4 border border-white/5 space-y-4">
                  <div className="flex items-center gap-2 text-on-surface/60">
                    <User size={16} />
                    <span className="text-xs font-bold uppercase">Cashier Role (Sales Only)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface/40 font-medium">Username</label>
                      <input
                        type="text"
                        placeholder="cashier_01"
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-white/10"
                        value={editingTenant.cashierUsername || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, cashierUsername: e.target.value})}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-on-surface/40 font-medium">Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-black/20 border border-white/5 rounded-lg py-2 px-3 text-sm text-white outline-none focus:border-white/10"
                        value={editingTenant.cashierPassword || ''}
                        onChange={(e) => setEditingTenant({...editingTenant, cashierPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 bg-white/5 text-white py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTenant.isPending}
                  className="flex-2 bg-primary text-on-primary py-3 rounded-xl font-bold hover:bg-primary-container transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {updateTenant.isPending ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                  Save Tenant Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
