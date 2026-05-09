import {
  Package,
  Save,
  Loader2,
  CreditCard
} from 'lucide-react';
import { usePricingPlans, useUpdatePricingPlan, PricingPlan } from './hooks/useSubscriptions';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { motion } from 'framer-motion';

export function BillingSettings() {
  const { t } = useTranslation();
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null);


  const { data: plans, isLoading: plansLoading } = usePricingPlans();
  const updatePlan = useUpdatePricingPlan();

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <Loader2 className="w-6 h-6 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Plans Management */}
      <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="text-primary" size={24} />
              {t('subscriptions.tabs.plans')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans?.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "glass p-6 rounded-2xl border transition-all cursor-pointer group",
                  editingPlan?.id === plan.id ? "border-primary bg-primary/5" : "border-outline-variant/10 hover:border-primary/30"
                )}
                onClick={() => setEditingPlan(plan)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <CreditCard size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-surface-bright/50 rounded-md text-on-surface/60">
                    {plan.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-2xl font-black text-white tracking-tight">
                  {plan.price.toLocaleString()} <span className="text-xs font-medium text-on-surface/40 uppercase">{plan.currency}</span>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-secondary/10 text-secondary rounded-full border border-secondary/20">
                    {plan.maxUsers} Users
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-tertiary/10 text-tertiary rounded-full border border-tertiary/20">
                    {plan.maxProducts} Products
                  </span>
                </div>
              </div>
            ))}
          </div>

          {editingPlan && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-8 rounded-3xl border border-primary/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">{t('subscriptions.plans.edit')}: {editingPlan.name}</h3>
                  <button
                    onClick={() => setEditingPlan(null)}
                    className="text-on-surface/40 hover:text-white transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>

                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updatePlan.mutate({
                    id: editingPlan.id,
                    updates: {
                      name: formData.get('name') as string,
                      price: Number(formData.get('price')),
                      maxUsers: Number(formData.get('maxUsers')),
                      maxProducts: Number(formData.get('maxProducts')),
                    }
                  }, {
                    onSuccess: () => setEditingPlan(null)
                  });
                }}>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface/60 ml-1">Plan Name</label>
                    <input
                      name="name"
                      title="Plan Name"
                      type="text"
                      defaultValue={editingPlan.name}
                      className="w-full px-4 py-3 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface/60 ml-1">{t('subscriptions.plans.price')} ({editingPlan.currency})</label>
                    <input
                      name="price"
                      title={t('subscriptions.plans.price')}
                      type="number"
                      defaultValue={editingPlan.price}
                      className="w-full px-4 py-3 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface/60 ml-1">Max Users</label>
                    <input
                      name="maxUsers"
                      title="Max Users"
                      type="number"
                      defaultValue={editingPlan.maxUsers}
                      className="w-full px-4 py-3 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-on-surface/60 ml-1">Max Products</label>
                    <input
                      name="maxProducts"
                      title="Max Products"
                      type="number"
                      defaultValue={editingPlan.maxProducts}
                      className="w-full px-4 py-3 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button
                    type="submit"
                    disabled={updatePlan.isPending}
                    className="md:col-span-2 py-4 bg-primary text-on-primary font-black uppercase tracking-widest rounded-2xl hover:shadow-2xl hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatePlan.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                    {t('common.save')}
                  </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
      </div>
    </div>
  );
}
