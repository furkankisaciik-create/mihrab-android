import { useCallback, useState } from 'react';
import { I18nManager } from 'react-native';

import i18n from '@/i18n';
import { setStoredLanguage, type Language } from '@/services/language';

export function useLanguage() {
  const [current, setCurrent] = useState<Language>(i18n.language as Language);

  const changeLanguage = useCallback(async (lang: Language) => {
    await i18n.changeLanguage(lang);
    await setStoredLanguage(lang);
    const shouldBeRTL = lang === 'ar';
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
    setCurrent(lang);
  }, []);

  return { current, changeLanguage };
}
