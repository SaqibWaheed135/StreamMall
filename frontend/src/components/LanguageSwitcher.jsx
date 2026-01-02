import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSwitcher = ({ className = '', variant = 'default' }) => {
  const { currentLanguage, toggleLanguage } = useLanguage();

  // Different style variants
  const getButtonClasses = () => {
    const baseClasses = 'flex items-center gap-2 px-3 py-2 rounded-lg transition-all';
    
    switch (variant) {
      case 'light':
        return `${baseClasses} bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white ${className}`;
      case 'dark':
        return `${baseClasses} bg-black/80 hover:bg-black/90 backdrop-blur-md border border-white/20 text-white ${className}`;
      case 'pink':
        return `${baseClasses} bg-pink-600 hover:bg-pink-700 text-white ${className}`;
      default:
        return `${baseClasses} bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 ${className}`;
    }
  };

  return (
    <button
      onClick={toggleLanguage}
      className={getButtonClasses()}
      title={currentLanguage === 'en' ? 'Switch to Urdu' : 'Switch to English'}
      aria-label="Toggle language"
    >
      <Globe className="w-4 h-4" />
      <span className="text-sm font-semibold">
        {currentLanguage === 'en' ? 'English' : 'اردو'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

