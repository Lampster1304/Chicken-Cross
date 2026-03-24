import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from '../locales/en.json';
import esTranslations from '../locales/es.json';

// Función para detectar idioma inicial
const getInitialLanguage = (): string => {
  const saved = localStorage.getItem('language');
  if (saved === 'en' || saved === 'es') {
    return saved;
  }

  const browserLanguage = navigator.language.split('-')[0];
  if (browserLanguage === 'es') {
    return 'es';
  }

  return 'en';
};

const resources = {
  en: { translation: enTranslations },
  es: { translation: esTranslations },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
