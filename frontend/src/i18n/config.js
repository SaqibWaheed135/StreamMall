import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import urTranslations from '../locales/ur.json';

// Get saved language from localStorage or default to 'en'
const getSavedLanguage = () => {
  const saved = localStorage.getItem('streamLanguage');
  return saved || 'en';
};

// Get saved language
const savedLanguage = getSavedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations
      },
      ur: {
        translation: urTranslations
      }
    },
    lng: savedLanguage, // Default language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false // Disable suspense for better compatibility
    }
  });

// Update document direction based on language
const updateDocumentDirection = (lang) => {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  
  // Update body class for RTL styling
  if (lang === 'ur') {
    document.body.classList.add('rtl');
    document.body.classList.remove('ltr');
  } else {
    document.body.classList.add('ltr');
    document.body.classList.remove('rtl');
  }
};

// Set initial direction
updateDocumentDirection(savedLanguage);

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('streamLanguage', lng);
  updateDocumentDirection(lng);
});

export default i18n;

