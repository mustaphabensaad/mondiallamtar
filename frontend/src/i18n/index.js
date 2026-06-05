import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(initReactI18next)
  .init({
    lng:           localStorage.getItem('lang') || 'fr',
    fallbackLng:   'fr',
    supportedLngs: ['ar', 'fr', 'en'],
    backend: {
      loadPath: '/locales/{{lng}}/translation.json',
    },
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', (lng) => {
  document.dir                   = lng === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang  = lng;
  localStorage.setItem('lang', lng);
});

export default i18n;
