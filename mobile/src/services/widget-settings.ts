import AsyncStorage from '@react-native-async-storage/async-storage';

export type WidgetSize = 'small' | 'medium' | 'large';
export type WidgetTheme = 'dark' | 'light' | 'minimal';

export type WidgetSettings = {
  size: WidgetSize;
  theme: WidgetTheme;
  showHijriDate: boolean;
  showTrackerDots: boolean;
};

const STORAGE_KEY = '@mihrab_widget_settings';

const DEFAULT_SETTINGS: WidgetSettings = {
  size: 'medium',
  theme: 'dark',
  showHijriDate: true,
  showTrackerDots: false,
};

export async function loadWidgetSettings(): Promise<WidgetSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<WidgetSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveWidgetSettings(settings: WidgetSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
