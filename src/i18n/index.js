import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './locales/en.json';
import teTranslation from './locales/te.json';

const STORAGE_KEY = 'telugubandham-language';

// Read saved language from localStorage (or fallback to 'en')
const getSavedLanguage = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'te' || saved === 'en') {
      return saved;
    }
  } catch {
    // ignore storage access errors
  }
  return 'en';
};

const initialLanguage = getSavedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      te: {
        translation: teTranslation
      }
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

// Keep HTML lang attribute and localStorage synced
if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLanguage;
}

i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem(STORAGE_KEY, lng);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lng;
    }
  } catch {
    // ignore storage access errors
  }
});

export default i18n;
