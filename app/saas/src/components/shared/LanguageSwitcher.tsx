import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'mm' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-300",
        "bg-surface-container-low/50 border border-outline-variant/10 hover:border-primary/30 group"
      )}
      title={i18n.language === 'en' ? "Switch to Myanmar" : "Switch to English"}
    >
      <Globe className="w-4 h-4 text-on-surface/50 group-hover:text-primary transition-colors" />
      <span className="text-xs font-bold text-white uppercase tracking-wider">
        {i18n.language === 'en' ? 'EN' : 'MM'}
      </span>
    </button>
  );
};
