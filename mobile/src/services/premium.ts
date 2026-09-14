import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@mihrab_premium';

export type PremiumPlan = 'monthly' | 'yearly' | null;

export interface PremiumStatus {
  active: boolean;
  plan: PremiumPlan;
  expiresAt: string | null;
}

const DEFAULT_STATUS: PremiumStatus = { active: false, plan: null, expiresAt: null };

export async function getPremiumStatus(): Promise<PremiumStatus> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATUS;
    const parsed: PremiumStatus = JSON.parse(raw);
    if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return DEFAULT_STATUS;
    }
    return parsed;
  } catch {
    return DEFAULT_STATUS;
  }
}

export async function setPremiumStatus(status: PremiumStatus): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(status));
  } catch {}
}

export async function clearPremiumStatus(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export const PREMIUM_PRICES = {
  monthly: { tr: '₺49,99', en: '$2.99', ar: '2.99$' },
  yearly: { tr: '₺399,99', en: '$19.99', ar: '19.99$' },
  yearlySaving: { tr: '%33 tasarruf', en: '33% off', ar: 'وفّر 33٪' },
};

export const PREMIUM_FEATURES = [
  { iconTr: '✦', key: 'ai_unlimited' },
  { iconTr: '📊', key: 'advanced_stats' },
  { iconTr: '👨‍👩‍👧‍👦', key: 'family' },
  { iconTr: '☁️', key: 'cloud_sync' },
  { iconTr: '🎨', key: 'themes' },
  { iconTr: '🔔', key: 'custom_adhan' },
];
