import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'tr' | 'en' | 'ar';

export const SUPPORTED_LANGUAGES: Language[] = ['tr', 'en', 'ar'];

const KEY = 'mihrab:language';

export async function getStoredLanguage(): Promise<Language | null> {
  try {
    const val = await AsyncStorage.getItem(KEY);
    if (val === 'tr' || val === 'en' || val === 'ar') return val;
  } catch {}
  return null;
}

export async function setStoredLanguage(lang: Language): Promise<void> {
  await AsyncStorage.setItem(KEY, lang);
}
