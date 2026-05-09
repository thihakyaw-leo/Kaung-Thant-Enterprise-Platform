import { useRef, useState, useEffect } from 'react';
import { UserCircle, Key, Activity, Users, CheckCircle2, AlertCircle, Upload, Loader2, Save } from 'lucide-react';
import { api } from '../../../lib/api';
import { cn } from '../../../utils/cn';
import { useProfile, useUpdateProfile, useUpdatePassword } from '../hooks/useProfile';

export default function AccountTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const updatePassword = useUpdatePassword();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    email: '',
    avatarUrl: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [passStatus, setPassStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const initialized = useRef(false);
  useEffect(() => {
    if (profile && !initialized.current) {
      setPersonalInfo({
        fullName: profile.fullName || '',
        email: profile.email || '',
        avatarUrl: profile.avatarUrl || ''
      });
      initialized.current = true;
    }
  }, [profile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const body = new FormData();
    body.append('file', file);
    try {
      // Do NOT manually set Content-Type — browser must set it with the correct multipart boundary
      const res = await api.post('/api/master/upload-avatar', body);
      if (res.data.success) {
        setPersonalInfo(prev => ({ ...prev, avatarUrl: res.data.url }));
        await updateProfile.mutateAsync({ avatarUrl: res.data.url });
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setStatus('saving');
    try {
      await updateProfile.mutateAsync(personalInfo);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
    }
  };

  const handleSavePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setPassStatus('saving');
    try {
      await updatePassword.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPassStatus('success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPassStatus('idle'), 3000);
    } catch {
      setPassStatus('error');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-8 bg-surface-container-high/20 rounded-3xl border border-outline-variant/10 flex flex-col items-center text-center">
            <div className="relative group">
              <input type="file" ref={fileInputRef} title="Upload Avatar" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              <div className="w-32 h-32 rounded-full bg-linear-to-tr from-primary to-secondary p-[2px]">
                <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
                  {personalInfo.avatarUrl
                    ? <img src={personalInfo.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    : <Users size={64} className="text-white/20" />}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              </div>
              <button type="button" title="Upload Avatar" disabled={isUploading} onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-primary text-on-primary rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50">
                <Upload size={16} />
              </button>
            </div>
            <div className="mt-4">
              <h4 className="text-xl font-bold text-white uppercase tracking-tight">{personalInfo.fullName || 'Admin User'}</h4>
              <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest mt-2 inline-block">{profile?.role}</div>
            </div>
          </div>
        </div>

        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Info Form */}
          <div className="p-6 bg-surface-container-high/10 rounded-3xl border border-outline-variant/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserCircle size={20} className="text-primary" />Personal Information
              </h3>
              <button 
                onClick={handleSaveProfile}
                disabled={status === 'saving'}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                  status === 'success' ? "bg-success text-on-success" : "bg-primary/10 text-primary hover:bg-primary/20"
                )}
              >
                {status === 'saving' ? <Loader2 size={14} className="animate-spin" /> : status === 'success' ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {status === 'saving' ? 'Saving...' : status === 'success' ? 'Saved' : 'Save Changes'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/50 uppercase tracking-widest">Full Name</label>
                <input type="text" className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" value={personalInfo.fullName} onChange={e => setPersonalInfo(p => ({ ...p, fullName: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/50 uppercase tracking-widest">Email Address</label>
                <input type="email" className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-primary/50 transition-all" value={personalInfo.email} onChange={e => setPersonalInfo(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Security Form */}
          <div className="p-6 bg-surface-container-high/10 rounded-3xl border border-outline-variant/10 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key size={20} className="text-secondary" />Security & Credentials
              </h3>
              <button 
                onClick={handleSavePassword}
                disabled={passStatus === 'saving' || !passwordData.newPassword}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all",
                  passStatus === 'success' ? "bg-success text-on-success" : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                )}
              >
                {passStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : passStatus === 'success' ? <CheckCircle2 size={14} /> : <Save size={14} />}
                {passStatus === 'saving' ? 'Updating...' : passStatus === 'success' ? 'Updated' : 'Update Password'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/50 uppercase tracking-widest">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-secondary/50 transition-all" value={passwordData.currentPassword} onChange={e => setPasswordData(p => ({ ...p, currentPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/50 uppercase tracking-widest">New Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-secondary/50 transition-all" value={passwordData.newPassword} onChange={e => setPasswordData(p => ({ ...p, newPassword: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface/50 uppercase tracking-widest">Confirm Password</label>
                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-surface-container-high/30 border border-outline-variant/10 rounded-xl text-white outline-none focus:border-secondary/50 transition-all" value={passwordData.confirmPassword} onChange={e => setPasswordData(p => ({ ...p, confirmPassword: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="p-6 bg-surface-container-high/10 rounded-3xl border border-outline-variant/10 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity size={20} className="text-primary" />Security Activity & Logs
            </h3>
            <div className="space-y-3">
              {[
                { action: 'Successful Login', device: 'Chrome on Windows', time: 'Just now', status: 'success' },
                { action: 'Profile Updated', device: 'Web App', time: '2 mins ago', status: 'info' },
                { action: 'Password Changed', device: 'System Entry', time: '3 months ago', status: 'info' },
              ].map((log, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={cn('p-2 rounded-lg', log.status === 'success' ? 'bg-success/10 text-success' : log.status === 'error' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary')}>
                      {log.status === 'success' ? <CheckCircle2 size={16} /> : log.status === 'error' ? <AlertCircle size={16} /> : <Activity size={16} />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{log.action}</div>
                      <div className="text-[10px] text-on-surface/40 uppercase tracking-widest mt-1">{log.device}</div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-on-surface/30 uppercase tracking-widest">{log.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

