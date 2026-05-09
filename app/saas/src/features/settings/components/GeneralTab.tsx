import { ShieldCheck } from 'lucide-react';
import { Phone, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../utils/cn';
import type { SettingsTabProps } from './SettingsTabProps';

export default function GeneralTab({ formData, setFormData }: SettingsTabProps) {
  const { t } = useTranslation();
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="platform_name" className="text-sm font-semibold text-on-surface/70">{t('settings.general.platform_name')}</label>
          <input type="text" id="platform_name" title={t('settings.general.platform_name')} placeholder={t('settings.general.enter_name')} value={formData.platform_name || ''} onChange={set('platform_name')} className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
        </div>
        <div className="space-y-2">
          <label htmlFor="platform_tagline" className="text-sm font-semibold text-on-surface/70">{t('settings.general.platform_tagline')}</label>
          <input type="text" id="platform_tagline" title={t('settings.general.platform_tagline')} placeholder={t('settings.general.enter_tagline')} value={formData.platform_tagline || ''} onChange={set('platform_tagline')} className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="platform_description" className="text-sm font-semibold text-on-surface/70">{t('settings.general.platform_description')}</label>
        <textarea id="platform_description" title={t('settings.general.platform_description')} placeholder={t('settings.general.enter_description')} rows={4} value={formData.platform_description || ''} onChange={set('platform_description')} className="w-full px-4 py-3 bg-surface-container-high/30 border border-outline-variant/10 rounded-2xl text-white outline-none focus:border-primary/50 transition-all resize-none" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10">
        <div className="space-y-2">
          <label htmlFor="platform_phone" className="text-sm font-semibold text-on-surface/70">{t('settings.general.platform_phone')}</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface/40" size={18} />
            <input type="text" id="platform_phone" title={t('settings.general.platform_phone')} value={formData.platform_phone || ''} onChange={set('platform_phone')} className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="platform_address" className="text-sm font-semibold text-on-surface/70">{t('settings.general.platform_address')}</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-on-surface/40" size={18} />
            <textarea id="platform_address" title={t('settings.general.platform_address')} rows={2} value={formData.platform_address || ''} onChange={set('platform_address')} className="w-full pl-10 pr-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all resize-none" />
          </div>
        </div>
      </div>
      <div className="space-y-6 pt-6 border-t border-outline-variant/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ShieldCheck size={20} className="text-secondary" />
          Security Settings
        </h3>
        <div className="flex items-center justify-between p-4 bg-surface-container-high/20 rounded-2xl border border-outline-variant/10">
          <div className="space-y-1">
            <div className="font-bold text-white">Two-Factor Authentication</div>
            <div className="text-xs text-on-surface/50">Require 2FA for all administrator accounts.</div>
          </div>
          <button
            type="button"
            title="Toggle Two-Factor Authentication"
            onClick={() => setFormData(prev => ({ ...prev, two_factor_auth: prev.two_factor_auth === 'true' ? 'false' : 'true' }))}
            className={cn('relative w-10 h-5 rounded-full transition-all duration-300', formData.two_factor_auth === 'true' ? 'bg-primary' : 'bg-on-surface/20')}
          >
            <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all', formData.two_factor_auth === 'true' ? 'left-5.5' : 'left-0.5')} />
          </button>
        </div>
      </div>
    </div>
  );
}
