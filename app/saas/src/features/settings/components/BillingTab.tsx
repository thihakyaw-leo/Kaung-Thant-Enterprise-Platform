import { CreditCard, Zap, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SettingsTabProps } from './SettingsTabProps';

export default function BillingTab({ formData, setFormData }: SettingsTabProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <CreditCard size={20} className="text-tertiary" />
        {t('subscriptions.config.payment_methods')}
      </h3>

      {/* Default Currency */}
      <div className="space-y-2">
        <label htmlFor="billing_currency" className="text-sm font-semibold text-on-surface/70">
          Default Billing Currency
        </label>
        <select
          id="billing_currency"
          title="Default Billing Currency"
          value={formData.default_currency || 'MMK'}
          onChange={e => setFormData(prev => ({ ...prev, default_currency: e.target.value }))}
          className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all cursor-pointer"
        >
          <option value="MMK">MMK — Myanmar Kyat</option>
          <option value="USD">USD — US Dollar</option>
          <option value="SGD">SGD — Singapore Dollar</option>
          <option value="THB">THB — Thai Baht</option>
        </select>
      </div>

      {/* Trial Days */}
      <div className="space-y-2">
        <label htmlFor="trial_days" className="text-sm font-semibold text-on-surface/70">
          Free Trial Period (days)
        </label>
        <input
          type="number"
          id="trial_days"
          title="Free trial days for new tenants"
          min={0}
          max={90}
          value={formData.trial_days || '14'}
          onChange={e => setFormData(prev => ({ ...prev, trial_days: e.target.value }))}
          className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all"
        />
      </div>

      {/* Payment Gateway Notice */}
      <div className="p-6 bg-surface-container-high/20 rounded-2xl border border-outline-variant/10 space-y-3">
        <div className="flex items-center gap-2 text-white font-bold">
          <Zap size={16} className="text-amber-400" />
          Payment Gateway Integrations
        </div>
        <p className="text-sm text-on-surface/50">
          Payment gateways (Stripe, KBZPay, Wave Money) are configured via external dashboard integrations.
          Contact your platform administrator to enable or update gateway credentials.
        </p>
        <div className="flex items-center gap-2 pt-2">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-xs text-emerald-400 font-semibold">PCI-DSS compliant — credentials never stored in this system</span>
        </div>
      </div>
    </div>
  );
}
