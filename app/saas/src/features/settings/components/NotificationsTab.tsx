import { Mail, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SettingsTabProps } from './SettingsTabProps';

export default function NotificationsTab({ formData, setFormData }: SettingsTabProps) {
  const { t } = useTranslation();
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Mail size={20} className="text-secondary" />
        {t('subscriptions.config.notifications')}
      </h3>
      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="notif_email" className="text-sm font-semibold text-on-surface/70">Billing Support Email</label>
          <input type="email" id="notif_email" title="Billing Support Email" value={formData.billing_support_email || 'billing@kinetic.io'} onChange={set('billing_support_email')} className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
        </div>
        <div className="space-y-2">
          <label htmlFor="support_email" className="text-sm font-semibold text-on-surface/70">General Support Email</label>
          <input type="email" id="support_email" title="General Support Email" value={formData.support_email || 'support@kinetic.io'} onChange={set('support_email')} className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
        </div>
      </div>

      {/* SMTP Configuration */}
      <div className="space-y-4 pt-6 border-t border-outline-variant/10">
        <h4 className="text-base font-bold text-white flex items-center gap-2">
          <Server size={16} className="text-primary" />
          SMTP Configuration
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="smtp_host" className="text-sm font-semibold text-on-surface/70">SMTP Host</label>
            <input
              type="text" id="smtp_host" title="SMTP Host"
              value={formData.smtp_host || 'smtp.sendgrid.net'}
              onChange={set('smtp_host')}
              className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-mono"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="smtp_port" className="text-sm font-semibold text-on-surface/70">SMTP Port</label>
            <input
              type="number" id="smtp_port" title="SMTP Port"
              value={formData.smtp_port || '587'}
              onChange={set('smtp_port')}
              className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-xs text-on-surface/50">All system emails use these addresses as sender and reply-to. SMTP credentials are managed via Cloudflare Secrets Store.</p>
      </div>
    </div>
  );
}
