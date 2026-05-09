import React from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Bell, User, Menu } from 'lucide-react';
import { LanguageSwitcher } from '../shared/LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="h-20 bg-bg-primary/80 backdrop-blur-md border-b border-border sticky top-0 z-30 px-8 flex items-center justify-between">
      <div className="flex items-center gap-6 flex-1">
        <button className="lg:hidden p-2 hover:bg-bg-secondary rounded-lg" title="Open Menu">
          <Menu size={20} />
        </button>
        
        <div className="hidden md:flex items-center max-w-md w-full bg-bg-secondary border border-border rounded-2xl px-4 py-2.5 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
          <Search size={18} className="text-text-muted" />
          <input 
            type="text" 
            placeholder={t('search_placeholder') || "Search..."}
            title="Search"
            className="bg-transparent border-none outline-none text-sm ml-3 w-full font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        
        <button className="p-2.5 rounded-xl hover:bg-bg-secondary text-text-secondary relative" title="Notifications">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-bg-primary"></span>
        </button>

        <div className="h-8 w-px bg-border mx-2"></div>

        <div className="flex items-center gap-3 pl-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-text-primary">Admin User</p>
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Store Manager</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
