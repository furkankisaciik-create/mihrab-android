export type DhikrKey =
  | 'subhanallah'
  | 'alhamdulillah'
  | 'allahu-akbar'
  | 'la-ilaha-illallah'
  | 'astaghfirullah'
  | 'salawat';

export type DhikrPreset = {
  key: DhikrKey;
  title: string;
  arabic: string;
  meaning: string;
  defaultTarget: number;
};

export type DhikrSession = {
  count: number;
  target: number;
};

export type DhikrDailyStats = {
  total: number;
  completedRounds: number;
  byDhikr: Partial<Record<DhikrKey, number>>;
};

export type DhikrState = {
  version: 1;
  currentDateKey: string;
  selectedKey: DhikrKey;
  hapticsEnabled: boolean;
  sessions: Record<DhikrKey, DhikrSession>;
  daily: Record<string, DhikrDailyStats>;
  updatedAt: string;
};
