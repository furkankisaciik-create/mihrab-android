export type QadaPrayerKey = 'sabah' | 'ogle' | 'ikindi' | 'aksam' | 'yatsi' | 'vitir';

export type QadaPrayer = {
  key: QadaPrayerKey;
  name: string;
  detail: string;
  symbol: string;
};

export type QadaActivityType = 'completed' | 'added' | 'adjusted';

export type QadaActivity = {
  id: string;
  type: QadaActivityType;
  prayerKey: QadaPrayerKey;
  quantity: number;
  previousRemaining?: number;
  occurredAt: string;
};

export type QadaTrackerState = {
  version: 1;
  remaining: Record<QadaPrayerKey, number>;
  completed: Record<QadaPrayerKey, number>;
  dailyTarget: number;
  activities: QadaActivity[];
  updatedAt: string;
};
