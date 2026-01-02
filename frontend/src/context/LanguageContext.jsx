import React, { createContext, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageContext = createContext();

export default function LanguageProvider({ children }) {
  const { i18n } = useTranslation();

  // Get current language
  const currentLanguage = i18n.language;

  // Change language function
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('streamLanguage', lang);
  };

  // Toggle between English and Urdu
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'ur' : 'en';
    changeLanguage(newLang);
  };

  // Initialize language from localStorage on mount (only once)
  useEffect(() => {
    const savedLanguage = localStorage.getItem('streamLanguage') || 'en';
    if (savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  const value = {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    t: (key) => i18n.t(key) // Expose translation function
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

