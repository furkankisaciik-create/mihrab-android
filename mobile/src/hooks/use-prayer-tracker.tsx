import * as Haptics from 'expo-haptics';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Platform } from 'react-native';

import {
  createDefaultPrayerTrackerState,
  ensurePrayerTrackerDate,
  getPrayerTrackerSummary,
  loadPrayerTrackerState,
  savePrayerTrackerState,
  toggleTrackedPrayer,
} from '@/services/prayer-tracker';
import { getIstanbulDateKey } from '@/services/daily-content-date';
import type { PrayerTrackerState, TrackedPrayerKey } from '@/types/prayer-tracker';

type PrayerTrackerContextValue = {
  state: PrayerTrackerState;
  loading: boolean;
  summary: ReturnType<typeof getPrayerTrackerSummary>;
  toggle: (key: TrackedPrayerKey) => void;
};

const PrayerTrackerContext = createContext<PrayerTrackerContextValue | null>(null);

export function PrayerTrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDefaultPrayerTrackerState);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: PrayerTrackerState) => {
    stateRef.current = next;
    setState(next);

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      void savePrayerTrackerState(stateRef.current);
    }, 250);
  }, []);

  useEffect(() => {
    let active = true;

    loadPrayerTrackerState().then((stored) => {
      if (!active) {
        return;
      }
      stateRef.current = stored;
      setState(stored);
      setLoading(false);
    });

    return () => {
      active = false;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      void savePrayerTrackerState(stateRef.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void savePrayerTrackerState(stateRef.current);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = ensurePrayerTrackerDate(stateRef.current, getIstanbulDateKey());
      if (next !== stateRef.current) {
        commit(next);
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [commit]);

  const toggle = useCallback(
    (key: TrackedPrayerKey) => {
      const result = toggleTrackedPrayer(stateRef.current, key);
      commit(result.state);

      void (async () => {
        try {
          if (result.completed) {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else if (Platform.OS === 'android') {
            await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Segment_Tick);
          } else {
            await Haptics.selectionAsync();
          }
        } catch {
          // Haptic feedback is optional and may not exist on every device.
        }
      })();
    },
    [commit],
  );

  const value = useMemo<PrayerTrackerContextValue>(
    () => ({
      state,
      loading,
      summary: getPrayerTrackerSummary(state),
      toggle,
    }),
    [loading, state, toggle],
  );

  return (
    <PrayerTrackerContext.Provider value={value}>
      {children}
    </PrayerTrackerContext.Provider>
  );
}

export function usePrayerTracker() {
  const context = useContext(PrayerTrackerContext);
  if (!context) {
    throw new Error('usePrayerTracker must be used inside PrayerTrackerProvider.');
  }
  return context;
}
