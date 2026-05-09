import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { 
  LayoutDashboard, 
  Globe, 
  CreditCard, 
  Users, 
  Activity, 
  Settings, 
  Menu, 
  X,
  Bell,
  Search,
  LucideIcon,
  LifeBuoy,
  ChevronDown,
  LogOut,
  UserCircle,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useUIStore } from '../../store/useUIStore';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTenants } from '../../features/tenants/hooks/useTenants';
import { useAuthStore } from '../../features/auth/useAuthStore';

interface SidebarItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

const SidebarItem = ({ to, icon: Icon, label }: SidebarItemProps) => (
  <Link
    to={to}
    activeProps={{ className: 'bg-primary/20 text-primary border-primary/50' }}
    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-on-surface/70 hover:bg-surface-bright/50 transition-all group border border-transparent"
  >
    <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
    {label && <span className="font-medium text-sm">{label}</span>}
  </Link>
);

interface CollapsibleSidebarItemProps {
  label: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
  isSidebarOpen: boolean;
}

const CollapsibleSidebarItem = ({ label, icon: Icon, children, isOpen, onClick, isSidebarOpen }: CollapsibleSidebarItemProps) => (
  <div className="space-y-1">
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-on-surface/70 hover:bg-surface-bright/50 transition-all group border border-transparent",
        isOpen && "bg-surface-bright/30 text-white"
      )}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {isSidebarOpen && <span className="font-medium">{label}</span>}
      </div>
      {isSidebarOpen && (
        <ChevronDown 
          size={16} 
          className={cn("transition-transform duration-300", isOpen && "rotate-180")} 
        />
      )}
    </button>
    <div className={cn(
      "overflow-hidden transition-all duration-300 ease-in-out",
      isOpen && isSidebarOpen ? "max-h-64 opacity-100 py-1" : "max-h-0 opacity-0"
    )}>
      <div className="pl-12 space-y-1">
        {children}
      </div>
    </div>
  </div>
);

export const DashboardLayout = () => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Global keyboard shortcut: Ctrl+K or Cmd+K opens search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(true);
      setTimeout(() => searchRef.current?.querySelector('input')?.focus(), 50);
    }
    if (e.key === 'Escape') setSearchOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Fetch tenants for search
  const { data: tenants } = useTenants();
  const searchResults = searchQuery.trim().length > 1
    ? (tenants ?? []).filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subdomain?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Use Zustand store logout — clears token from memory + persistence
    useAuthStore.getState().logout();
    navigate({ to: '/login' });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-body-base">
      {/* Sidebar */}
      <aside 
        className={cn(
          "h-full bg-surface-container border-r border-outline-variant/10 transition-all duration-300 ease-in-out flex flex-col shrink-0 relative z-20",
          sidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* Sidebar Header */}
        <Link 
          to="/dashboard"
          className="p-6 flex items-center gap-4 hover:bg-surface-bright/30 transition-all cursor-pointer group/logo"
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 group-hover/logo:scale-110 transition-transform overflow-hidden">
            <img src="/Kaung-Thant.png" alt="Kaung Thant Logo" className="w-full h-full object-contain" />
          </div>
          {sidebarOpen && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <h1 className="text-sm font-black text-white leading-tight uppercase tracking-tighter">
                Kaung Thant
                <span className="block text-[10px] text-primary font-black opacity-80">Enterprise Platform</span>
              </h1>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          <div className="space-y-1">
            <SidebarItem to="/dashboard" icon={LayoutDashboard} label={sidebarOpen ? t('nav.dashboard') : ""} />
            <SidebarItem to="/dashboard/tenants" icon={Globe} label={sidebarOpen ? t('nav.tenants') : ""} />
            <SidebarItem to="/dashboard/billing" icon={CreditCard} label={sidebarOpen ? t('nav.pricing_plans') : ""} />
            <SidebarItem to="/dashboard/subscriptions" icon={Receipt} label={sidebarOpen ? 'Subscriptions' : ""} />
            <SidebarItem to="/dashboard/users" icon={Users} label={sidebarOpen ? t('nav.saas_users') : ""} />
            <SidebarItem to="/dashboard/health" icon={Activity} label={sidebarOpen ? t('nav.health') : ""} />
            <SidebarItem to="/dashboard/security" icon={ShieldCheck} label={sidebarOpen ? 'Security & Compliance' : ""} />
            <SidebarItem to="/dashboard/support" icon={LifeBuoy} label={sidebarOpen ? t('nav.support') : ""} />
            
            <CollapsibleSidebarItem 
              label={t('nav.settings')} 
              icon={Settings} 
              isOpen={settingsOpen} 
              onClick={() => setSettingsOpen(!settingsOpen)}
              isSidebarOpen={sidebarOpen}
            >
              <Link
                to="/dashboard/settings"
                search={{ tab: 'general' }}
                activeProps={{ className: 'text-primary' }}
                className="block py-1.5 text-sm text-on-surface/50 hover:text-white transition-colors"
              >
                {t('settings.tabs.general')}
              </Link>
              <Link
                to="/dashboard/settings"
                search={{ tab: 'domain' }}
                activeProps={{ className: 'text-primary' }}
                className="block py-1.5 text-sm text-on-surface/50 hover:text-white transition-colors"
              >
                {t('settings.tabs.domain')}
              </Link>
              <Link
                to="/dashboard/settings"
                search={{ tab: 'invoice' }}
                activeProps={{ className: 'text-primary' }}
                className="block py-1.5 text-sm text-on-surface/50 hover:text-white transition-colors"
              >
                {t('settings.tabs.invoice')}
              </Link>
              <Link
                to="/dashboard/settings"
                search={{ tab: 'account' }}
                activeProps={{ className: 'text-primary' }}
                className="block py-1.5 text-sm text-on-surface/50 hover:text-white transition-colors"
              >
                {t('settings.tabs.account')}
              </Link>
            </CollapsibleSidebarItem>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-outline-variant/10">
          <button 
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-bright/50 transition-all text-on-surface/40 hover:text-white group"
          >
            <Menu className={cn("w-5 h-5 transition-transform", !sidebarOpen && "rotate-180")} />
            {sidebarOpen && <span className="text-sm font-medium">{t('common.collapse')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -mr-64 -mt-64 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none"></div>

        {/* Header */}
        <header className="h-16 shrink-0 bg-surface-container-low/40 backdrop-blur-md border-b border-outline-variant/10 px-6 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
              className="p-2 hover:bg-surface-bright rounded-md text-on-surface/70 lg:hidden"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {/* Global Search */}
            <div className="hidden md:block relative" ref={searchRef}>
              <div
                className="flex items-center gap-2 bg-surface-container-low/50 px-3 py-1.5 rounded-full border border-outline-variant/10 cursor-text hover:border-primary/30 transition-colors"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={16} className="text-on-surface/40 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  placeholder={t('common.search_placeholder')}
                  aria-label={t('common.search')}
                  className="bg-transparent border-none outline-none text-sm w-52 placeholder:text-on-surface/30"
                />
                <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-white/5 rounded border border-white/10 text-on-surface/30">
                  ⌘K
                </kbd>
              </div>
              {/* Search results dropdown */}
              {searchOpen && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 left-0 w-80 glass-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
                  <p className="px-4 pt-3 pb-1 text-[10px] font-black text-on-surface/30 uppercase tracking-widest">Tenants</p>
                  {searchResults.map(tenant => (
                    <button
                      key={tenant.id}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 transition-all text-left group"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchOpen(false);
                        navigate({ to: '/dashboard/tenants' });
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                        {tenant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-primary transition-colors">{tenant.name}</p>
                        <p className="text-xs text-on-surface/40 truncate">{tenant.subdomain ?? tenant.plan_id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {searchOpen && searchQuery.trim().length > 1 && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 left-0 w-72 glass-dark rounded-2xl border border-white/10 shadow-2xl p-4 z-50 animate-in fade-in duration-150">
                  <p className="text-sm text-on-surface/40 text-center">No tenants found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            
            <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              <span className="text-xs font-bold text-primary uppercase">{t('common.production_mode')}</span>
            </div>
            
            <button 
              aria-label="View notifications"
              title="Notifications"
              className="relative p-2 text-on-surface/70 hover:text-primary transition-colors"
            >
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className={cn(
                  "flex items-center gap-3 pl-4 border-l border-outline-variant/10 group transition-all",
                  profileOpen ? "opacity-100" : "opacity-80 hover:opacity-100"
                )}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-white">{t('users.roles.super_admin')}</p>
                  <p className="text-xs text-on-surface/50">{t('common.platform_owner')}</p>
                </div>
                <div className={cn(
                  "w-10 h-10 rounded-full bg-linear-to-tr from-primary to-secondary p-[2px] transition-transform",
                  profileOpen && "scale-110"
                )}>
                  <div className="w-full h-full rounded-full bg-surface-container flex items-center justify-center overflow-hidden">
                    <Users size={20} className="text-white/70" />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-3 w-56 glass-dark rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="p-4 border-b border-white/5 bg-white/5">
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Signed in as</p>
                    <p className="text-sm font-bold text-white mt-1">Super Admin</p>
                  </div>
                  <div className="p-2">
                    <Link
                      to="/dashboard/settings"
                      search={{ tab: 'account' }}
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-on-surface/70 hover:bg-primary/10 hover:text-primary transition-all group"
                    >
                      <UserCircle size={18} className="group-hover:scale-110 transition-transform" />
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-error hover:bg-error/10 transition-all group"
                    >
                      <LogOut size={18} className="group-hover:scale-110 transition-transform" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
