import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Lock, AlertCircle, Loader2, Globe, CheckCircle2, Zap } from 'lucide-react';
import { api } from '../../lib/api';

interface LoginProps {
  onLogin(token: string): void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'mm' : 'en');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password);
      api.setToken(data.token);
      onLogin(data.token);
    } catch (err: any) {
      setError(err.message || t('login_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden font-['Plus_Jakarta_Sans']">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]"></div>

      <div className="relative z-10 w-full max-w-[1100px] flex flex-col lg:flex-row items-stretch gap-0 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-2xl overflow-hidden m-4 lg:m-8">
        
        {/* Left Section: Branding & Info */}
        <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/10">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Zap className="text-white fill-white" size={24} />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Kaung Thant</h2>
            </div>

            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-none tracking-tighter">
                {t('login_title')}
              </h1>
              <p className="text-slate-400 text-xl font-medium max-w-[360px]">
                {t('login_subtitle')}
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Durable Objects Native
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-semibold">
                <CheckCircle2 size={16} className="text-emerald-400" />
                Atomic Transactions
              </div>
            </div>
          </div>

          <div className="mt-20">
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest flex items-center gap-4">
              {t('copyright')} 
              <span className="w-8 h-px bg-slate-800"></span>
              {t('version')}
            </p>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="lg:w-1/2 p-12 lg:p-20 bg-white/2 flex flex-col justify-center">
          <div className="max-w-[400px] mx-auto w-full">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-bold text-white tracking-tight">Clock In</h3>
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-bold transition-all active:scale-95"
              >
                <Globe size={16} className="text-indigo-400" />
                {i18n.language === 'en' ? 'မြန်မာစာ' : 'English'}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 animate-shake">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <p className="text-sm font-bold leading-tight">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1" htmlFor="username">
                  {t('employee_id')}
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <User size={20} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-semibold outline-none focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                    placeholder="EMP-001"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-400 ml-1" htmlFor="password">
                  {t('passcode')}
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-white font-semibold outline-none focus:border-indigo-500 focus:bg-white/10 focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-600"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 rounded-2xl bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-all hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="relative z-10">{t('login_button')}</span>
                    <Zap className="relative z-10 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" size={20} />
                  </>
                )}
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-500 ease-in-out skew-x-[-20deg]"></div>
              </button>
            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .animate-pulse {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.1); }
        }
      `}} />
    </div>
  );
};

export default Login;
