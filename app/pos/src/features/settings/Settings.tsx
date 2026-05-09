import React, { useState, useEffect, useCallback } from 'react';
import { 
  Settings as SettingsIcon, 
  Building2, 
  Globe, 
  ShieldCheck, 
  Save, 
  Loader2, 
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../lib/api';

interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxNumber: string;
}

interface SystemSettings {
  tax_rate: string;
  currency_symbol: string;
  pos_header_text: string;
  pos_footer_text: string;
  enable_tax: string;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'business' | 'system' | 'defaults'>('business');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Business State
  const [business, setBusiness] = useState<BusinessProfile>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxNumber: '',
  });

  // Settings State
  const [settings, setSettings] = useState<SystemSettings>({
    tax_rate: '0',
    currency_symbol: 'MMK',
    pos_header_text: '',
    pos_footer_text: 'Thank you for shopping with us!',
    enable_tax: 'true',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bData, sData] = await Promise.all([
        api.getBusinessProfile(),
        api.getSettings()
      ]);
      if (bData) setBusiness(prev => ({ ...prev, ...(bData as any) }));
      if (sData) setSettings(prev => ({ ...prev, ...(sData as any) }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchData();
    };
    init();
  }, [fetchData]);

  const handleBusinessChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBusiness(prev => ({ ...prev, [name]: value }));
  };

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const saveBusiness = async () => {
    setSaving(true);
    try {
      await api.updateBusinessProfile(business);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save business profile.');
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary/30" size={40} /></div>;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-text-primary flex items-center gap-3">
            <SettingsIcon className="text-primary" size={32} /> Settings
          </h1>
          <p className="text-text-secondary font-medium tracking-tight">Configure your business profile and POS system preferences.</p>
        </div>
        {showSuccess && (
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl animate-bounce">
            <CheckCircle2 size={18} />
            <span className="text-sm font-bold">Changes saved successfully!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('business')}
            title="Business Profile Settings"
            aria-label="Business Profile"
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'business' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}`}
          >
            <Building2 size={20} /> Business Profile
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            title="System Settings"
            aria-label="System Settings"
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'system' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}`}
          >
            <Globe size={20} /> System Settings
          </button>
          <button 
            onClick={() => setActiveTab('defaults')}
            title="Application Defaults"
            aria-label="Application Defaults"
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all ${activeTab === 'defaults' ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white text-text-secondary hover:bg-bg-secondary hover:text-text-primary'}`}
          >
            <ShieldCheck size={20} /> POS Defaults
          </button>
        </div>

        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'business' && (
            <div className="card p-8 space-y-8 animate-slide-up">
              <div className="flex items-center gap-6 pb-8 border-b border-border">
                <div className="w-24 h-24 rounded-3xl bg-bg-secondary flex flex-col items-center justify-center border-2 border-dashed border-border group cursor-pointer hover:border-primary transition-all">
                  <ImageIcon size={24} className="text-text-muted group-hover:text-primary transition-all" />
                  <span className="text-[10px] font-black text-text-muted uppercase mt-1">Upload Logo</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary">Logo & Branding</h3>
                  <p className="text-sm text-text-secondary font-medium">This logo will appear on your printed receipts.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="biz-name">Business Name</label>
                  <input 
                    id="biz-name"
                    name="name"
                    type="text" 
                    title="Business Name"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={business.name}
                    onChange={handleBusinessChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="biz-tax">Tax Number / TIN</label>
                  <input 
                    id="biz-tax"
                    name="taxNumber"
                    type="text" 
                    title="Tax Number"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={business.taxNumber}
                    onChange={handleBusinessChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="biz-phone">Phone Number</label>
                  <input 
                    id="biz-phone"
                    name="phone"
                    type="text" 
                    title="Phone Number"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={business.phone}
                    onChange={handleBusinessChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="biz-email">Email Address</label>
                  <input 
                    id="biz-email"
                    name="email"
                    type="email" 
                    title="Email Address"
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    value={business.email}
                    onChange={handleBusinessChange}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="biz-address">Business Address</label>
                  <textarea 
                    id="biz-address"
                    name="address"
                    title="Business Address"
                    rows={3}
                    className="w-full bg-bg-secondary border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    value={business.address}
                    onChange={handleBusinessChange}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button 
                  onClick={saveBusiness}
                  disabled={saving}
                  title="Save Profile"
                  aria-label="Save Profile"
                  className="btn btn-primary px-8 font-black flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Changes</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="card p-8 space-y-8 animate-slide-up">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-primary rounded-full"></span> Financial Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-2xl border border-border group hover:border-primary transition-all">
                      <div>
                        <p className="text-sm font-black text-text-primary">Enable Sales Tax (VAT)</p>
                        <p className="text-[10px] font-bold text-text-secondary uppercase">Apply tax to all sales transactions</p>
                      </div>
                      <input 
                        type="checkbox" 
                        title="Enable Tax"
                        className="w-6 h-6 rounded-lg border-2 border-border text-primary focus:ring-primary/20 transition-all cursor-pointer"
                        checked={settings.enable_tax === 'true'}
                        onChange={(e) => setSettings({...settings, enable_tax: e.target.checked ? 'true' : 'false'})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="tax-rate">Default Tax Rate (%)</label>
                      <input 
                        id="tax-rate"
                        name="tax_rate"
                        type="number" 
                        title="Tax Rate"
                        className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        value={settings.tax_rate}
                        onChange={handleSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="currency">Base Currency Symbol</label>
                      <input 
                        id="currency"
                        name="currency_symbol"
                        type="text" 
                        title="Currency Symbol"
                        className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        value={settings.currency_symbol}
                        onChange={handleSettingChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-black text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-error rounded-full"></span> Receipt Customization
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="receipt-header">Receipt Header Text</label>
                      <textarea 
                        id="receipt-header"
                        name="pos_header_text"
                        title="Receipt Header"
                        className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                        rows={3}
                        placeholder="e.g. Welcome to our store!"
                        value={settings.pos_header_text}
                        onChange={handleSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1" htmlFor="receipt-footer">Receipt Footer Text</label>
                      <textarea 
                        id="receipt-footer"
                        name="pos_footer_text"
                        title="Receipt Footer"
                        className="w-full bg-white border border-border rounded-xl px-4 py-3 text-sm font-bold text-text-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                        rows={3}
                        value={settings.pos_footer_text}
                        onChange={handleSettingChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end">
                <button 
                  onClick={saveSettings}
                  disabled={saving}
                  title="Save Settings"
                  aria-label="Save Settings"
                  className="btn btn-primary px-8 font-black flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Save Settings</>}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'defaults' && (
            <div className="card p-12 flex flex-col items-center justify-center text-center space-y-4 animate-slide-up">
              <div className="p-6 rounded-full bg-bg-secondary text-text-muted">
                <ShieldCheck size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-text-primary">Advanced POS Controls</h3>
                <p className="text-text-secondary font-medium max-w-sm mx-auto">Configure default locations, customer groups, and inventory behaviors. (Module coming soon)</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
