import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ur' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md transition-all border border-white/20 ${className}`}
      title={i18n.language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {i18n.language === 'en' ? 'English' : 'اردو'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

