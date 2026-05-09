import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { SettingsTabProps } from './SettingsTabProps';

export default function DomainTab({ formData, setFormData }: SettingsTabProps) {
  const { t } = useTranslation();
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-8">
      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Globe size={20} className="text-primary" />
          {t('settings.domain.root_configuration')}
        </h3>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="root_domain" className="text-sm font-semibold text-on-surface/70">{t('settings.domain.main_domain')}</label>
            <input type="text" id="root_domain" title={t('settings.domain.main_domain')} value={formData.root_domain || ''} onChange={set('root_domain')} className="w-full px-4 py-2.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-mono" />
          </div>
          <div className="space-y-2">
            <label htmlFor="primary_domain" className="text-sm font-semibold text-on-surface/70">Primary SaaS Domain</label>
            <input type="text" id="primary_domain" title="Primary SaaS Domain" value={formData.primary_domain || ''} onChange={set('primary_domain')} className="w-full px-4 py-2.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-mono" />
          </div>
          <div className="space-y-2">
            <label htmlFor="reserved_subdomains" className="text-sm font-semibold text-on-surface/70">Reserved Subdomains (comma-separated)</label>
            <input type="text" id="reserved_subdomains" title="Reserved Subdomains" value={formData.reserved_subdomains || ''} onChange={set('reserved_subdomains')} className="w-full px-4 py-2.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all font-mono" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="min_sub_len" className="text-sm font-semibold text-on-surface/70">Min Subdomain Length</label>
              <input type="number" id="min_sub_len" title="Min Subdomain Length" value={formData.min_subdomain_length || '3'} onChange={set('min_subdomain_length')} className="w-full px-4 py-2.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
            </div>
            <div className="space-y-2">
              <label htmlFor="max_sub_len" className="text-sm font-semibold text-on-surface/70">Max Subdomain Length</label>
              <input type="number" id="max_sub_len" title="Max Subdomain Length" value={formData.max_subdomain_length || '20'} onChange={set('max_subdomain_length')} className="w-full px-4 py-2.5 bg-surface-container-high/40 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
        <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
        <div>
          <p className="text-sm font-bold text-white">SSL Provider: <span className="text-emerald-400">{formData.ssl_provider || 'Cloudflare'}</span></p>
          <p className="text-xs text-on-surface/40">Custom domains are {formData.custom_domain_enabled === 'true' ? 'enabled' : 'disabled'} for all tenants.</p>
        </div>
      </div>
    </div>
  );
}
