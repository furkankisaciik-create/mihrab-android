import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { getStoredLanguage, SUPPORTED_LANGUAGES, type Language } from '@/services/language';
import ar from './locales/ar.json';
import en from './locales/en.json';
import tr from './locales/tr.json';

export async function initI18n(): Promise<void> {
  const stored = await getStoredLanguage();
  const deviceCode = Localization.getLocales()[0]?.languageCode ?? 'tr';
  const lng: Language =
    stored ?? (SUPPORTED_LANGUAGES.includes(deviceCode as Language) ? (deviceCode as Language) : 'tr');

  await i18n.use(initReactI18next).init({
    lng,
    fallbackLng: 'tr',
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      ar: { translation: ar },
    },
    interpolation: { escapeValue: false },
  });
}

export default i18n;
