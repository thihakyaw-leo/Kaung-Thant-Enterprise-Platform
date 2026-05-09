import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'mm' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button 
      onClick={toggleLanguage}
      title={t('switch_lang')}
      className="glass px-3 py-2 rounded-xl border border-white/10 flex items-center gap-2 hover:bg-white/10 transition-colors shadow-lg active:scale-95"
    >
      <Languages size={18} className="text-primary" />
      <span className="text-[10px] font-bold text-white uppercase tracking-widest">
        {i18n.language === 'en' ? 'MM' : 'EN'}
      </span>
    </button>
  );
};
