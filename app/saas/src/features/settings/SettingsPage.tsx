import { lazy, Suspense, useState, useCallback } from 'react';
import { Settings as SettingsIcon, Globe, CreditCard, FileText, Mail, UserCircle, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSettings, useUpdateSettings } from './hooks/useSettings';
import { Route } from '../../routes/dashboard/settings';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

// Lazy-loaded tab components — each tab is a separate JS chunk
const GeneralTab      = lazy(() => import('./components/GeneralTab'));
const DomainTab       = lazy(() => import('./components/DomainTab'));
const BillingTab      = lazy(() => import('./components/BillingTab'));
const InvoiceTab      = lazy(() => import('./components/InvoiceTab'));
const NotificationsTab = lazy(() => import('./components/NotificationsTab'));
const AccountTab      = lazy(() => import('./components/AccountTab'));



function TabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-surface-bright/10 rounded-xl w-48" />
      <div className="h-40 bg-surface-bright/5 rounded-2xl" />
      <div className="h-24 bg-surface-bright/5 rounded-2xl" />
    </div>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const { data: settings, isLoading, isError } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="h-10 bg-surface-bright/10 rounded-xl w-48 animate-pulse" />
        <div className="h-96 bg-surface-container-low/40 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 glass rounded-3xl border border-white/5 space-y-4">
        <div className="p-4 bg-error/10 rounded-full text-error">
          <AlertTriangle size={40} />
        </div>
        <div className="text-center">
          <h3 className="text-xl font-bold text-white">{t('settings.unavailable_title', { defaultValue: 'System Settings Unavailable' })}</h3>
          <p className="text-on-surface/50 max-w-xs mx-auto mt-2">{t('settings.unavailable_desc', { defaultValue: 'Failed to synchronize with master database.' })}</p>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-all">
          {t('common.retry', { defaultValue: 'Retry Connection' })}
        </button>
      </div>
    );
  }

  return <SettingsForm initialSettings={settings} />;
}

interface SettingsFormProps {
  initialSettings: { key: string; value: string }[];
}

function SettingsForm({ initialSettings }: SettingsFormProps) {
  const { t } = useTranslation();
  const { tab } = Route.useSearch();
  const updateSettings = useUpdateSettings();
  const activeTab = tab || 'general';

  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const data: Record<string, string> = {};
    initialSettings.forEach(s => { data[s.key] = s.value; });
    return data;
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSave = useCallback(() => {
    const updates = Object.entries(formData).map(([key, value]) => ({ key, value }));
    updateSettings.mutate(updates, {
      onSuccess: () => {
        setIsSuccess(true);
        setTimeout(() => setIsSuccess(false), 3000);
      },
    });
  }, [formData, updateSettings]);

  const tabs = [
    { id: 'general',       label: t('settings.tabs.general'),       icon: Globe },
    { id: 'domain',        label: t('settings.tabs.domain'),         icon: SettingsIcon },
    { id: 'billing',       label: t('settings.tabs.billing'),        icon: CreditCard },
    { id: 'invoice',       label: t('settings.tabs.invoice'),        icon: FileText },
    { id: 'notifications', label: t('settings.tabs.notifications'),  icon: Mail },
    { id: 'account',       label: 'Account Settings',                icon: UserCircle },
  ];

  const tabProps = { formData, setFormData };

  const renderTab = () => {
    switch (activeTab) {
      case 'general':       return <GeneralTab {...tabProps} />;
      case 'domain':        return <DomainTab {...tabProps} />;
      case 'billing':       return <BillingTab {...tabProps} />;
      case 'invoice':       return <InvoiceTab {...tabProps} />;
      case 'notifications': return <NotificationsTab {...tabProps} />;
      case 'account':       return <AccountTab />;
      default:              return <p className="text-on-surface/50 italic py-8 text-center">Section implementation in progress…</p>;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('settings.title')}</h1>
        <p className="text-on-surface/60 mt-1">{t('settings.description')}</p>
      </div>
      <div className="bg-surface-container-low/40 backdrop-blur-md border border-outline-variant/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl">
              <SettingsIcon className="text-primary w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
          </div>

          {/* Lazy tab with Suspense skeleton */}
          <Suspense fallback={<TabSkeleton />}>
            {renderTab()}
          </Suspense>

          <div className={cn("mt-12 pt-8 border-t border-outline-variant/10 flex items-center justify-end gap-4", activeTab === 'account' && 'hidden')}>
            <button
              type="button"
              onClick={handleSave}
              disabled={updateSettings.isPending || isSuccess}
              className={cn(
                "relative flex items-center gap-2 px-10 py-3.5 rounded-2xl font-bold transition-all duration-500 active:scale-95 overflow-hidden",
                isSuccess 
                  ? "bg-success text-on-success shadow-lg shadow-success/20" 
                  : "bg-primary text-on-primary hover:shadow-xl hover:shadow-primary/30"
              )}
            >
              {/* Spinner/Icon layer */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                {updateSettings.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 animate-in zoom-in fade-in duration-300" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
              </div>

              {/* Text layer */}
              <span className="tracking-wide">
                {updateSettings.isPending 
                  ? t('common.saving', { defaultValue: 'Saving Changes...' }) 
                  : isSuccess 
                    ? t('common.saved', { defaultValue: 'Success!' }) 
                    : t('common.save', { defaultValue: 'Save Settings' })}
              </span>

              {/* Success pulse effect */}
              {isSuccess && (
                <div className="absolute inset-0 bg-white/20 animate-ping pointer-events-none" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
