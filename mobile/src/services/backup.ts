import AsyncStorage from '@react-native-async-storage/async-storage';
import { Share } from 'react-native';

const BACKUP_VERSION = '1.0';

// Keys that represent user data worth backing up
const USER_DATA_KEYS = [
  '@mihrab/prayer-tracker-v1',
  '@mihrab/qada-tracker-v1',
  '@mihrab/dhikr-counter-v1',
  '@mihrab/dua-favorites-v1',
  '@mihrab/quran-progress-v1',
  '@mihrab_family',
  '@mihrab_user_profile',
  '@mihrab_widget_settings',
  'mihrab:language',
];

export type BackupData = {
  version: string;
  exportedAt: string;
  app: 'MIHRAB';
  data: Record<string, unknown>;
};

export type BackupStats = {
  keys: string[];
  sizeBytes: number;
};

export async function getBackupStats(): Promise<BackupStats> {
  const pairs = await AsyncStorage.multiGet(USER_DATA_KEYS);
  const keys: string[] = [];
  let sizeBytes = 0;
  for (const [key, value] of pairs) {
    if (value !== null) {
      keys.push(key);
      sizeBytes += value.length;
    }
  }
  return { keys, sizeBytes };
}

export async function createBackup(): Promise<BackupData> {
  const pairs = await AsyncStorage.multiGet(USER_DATA_KEYS);
  const data: Record<string, unknown> = {};
  for (const [key, value] of pairs) {
    if (value !== null) {
      try {
        data[key] = JSON.parse(value);
      } catch {
        data[key] = value;
      }
    }
  }
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    app: 'MIHRAB',
    data,
  };
}

export async function exportBackup(): Promise<void> {
  const backup = await createBackup();
  const json = JSON.stringify(backup, null, 2);
  const fileName = `MIHRAB_yedek_${new Date().toISOString().slice(0, 10)}.json`;
  await Share.share({
    message: json,
    title: fileName,
  });
}

export type RestoreResult = {
  success: boolean;
  restoredKeys: string[];
  error?: string;
};

export async function restoreBackup(json: string): Promise<RestoreResult> {
  try {
    const backup = JSON.parse(json) as Partial<BackupData>;

    if (backup.app !== 'MIHRAB' || !backup.data) {
      return { success: false, restoredKeys: [], error: 'Geçersiz MIHRAB yedek dosyası.' };
    }

    const pairs: [string, string][] = [];
    const restoredKeys: string[] = [];

    for (const key of USER_DATA_KEYS) {
      const value = backup.data[key];
      if (value !== undefined) {
        pairs.push([key, JSON.stringify(value)]);
        restoredKeys.push(key);
      }
    }

    if (pairs.length === 0) {
      return { success: false, restoredKeys: [], error: 'Yedek dosyasında kullanıcı verisi bulunamadı.' };
    }

    await AsyncStorage.multiSet(pairs);
    return { success: true, restoredKeys };
  } catch {
    return { success: false, restoredKeys: [], error: 'Yedek dosyası okunamadı. JSON formatı hatalı olabilir.' };
  }
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const KEY_LABELS: Record<string, string> = {
  '@mihrab/prayer-tracker-v1': 'Namaz takibi',
  '@mihrab/qada-tracker-v1': 'Kaza namazları',
  '@mihrab/dhikr-counter-v1': 'Zikir sayacı',
  '@mihrab/dua-favorites-v1': 'Favori dualar',
  '@mihrab/quran-progress-v1': 'Kuran okuma ilerlemesi',
  '@mihrab_family': 'Aile grubu',
  '@mihrab_user_profile': 'Kullanıcı profili',
  '@mihrab_widget_settings': 'Widget ayarları',
  'mihrab:language': 'Dil ayarı',
};

export function getKeyLabel(key: string): string {
  return KEY_LABELS[key] ?? key;
}
