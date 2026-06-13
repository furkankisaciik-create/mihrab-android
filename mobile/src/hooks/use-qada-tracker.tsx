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
import { AppState } from 'react-native';

import {
  addQadaDebt,
  createDefaultQadaTrackerState,
  getQadaTrackerSummary,
  loadQadaTrackerState,
  recordQadaCompleted,
  saveQadaTrackerState,
  setQadaBalance,
  setQadaDailyTarget,
  undoLatestQadaActivity,
} from '@/services/qada-tracker';
import type { QadaPrayerKey, QadaTrackerState } from '@/types/qada';

type QadaTrackerContextValue = {
  state: QadaTrackerState;
  loading: boolean;
  summary: ReturnType<typeof getQadaTrackerSummary>;
  complete: (key: QadaPrayerKey) => void;
  addDebt: (key: QadaPrayerKey, quantity?: number) => void;
  setBalance: (key: QadaPrayerKey, value: number) => void;
  setDailyTarget: (target: number) => void;
  undoLatest: () => void;
};

const QadaTrackerContext = createContext<QadaTrackerContextValue | null>(null);

export function QadaTrackerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDefaultQadaTrackerState);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: QadaTrackerState) => {
    if (next === stateRef.current) {
      return false;
    }

    stateRef.current = next;
    setState(next);

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      void saveQadaTrackerState(stateRef.current);
    }, 250);
    return true;
  }, []);

  useEffect(() => {
    let active = true;

    loadQadaTrackerState()
      .then((stored) => {
        if (!active) {
          return;
        }
        stateRef.current = stored;
        setState(stored);
      })
      .catch(() => {
        if (active) {
          const fallback = createDefaultQadaTrackerState();
          stateRef.current = fallback;
          setState(fallback);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      void saveQadaTrackerState(stateRef.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void saveQadaTrackerState(stateRef.current);
      }
    });
    return () => subscription.remove();
  }, []);

  const complete = useCallback(
    (key: QadaPrayerKey) => {
      const changed = commit(recordQadaCompleted(stateRef.current, key));
      if (changed) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    },
    [commit],
  );

  const addDebt = useCallback(
    (key: QadaPrayerKey, quantity = 1) => {
      if (commit(addQadaDebt(stateRef.current, key, quantity))) {
        void Haptics.selectionAsync().catch(() => {});
      }
    },
    [commit],
  );

  const setBalance = useCallback(
    (key: QadaPrayerKey, value: number) => {
      commit(setQadaBalance(stateRef.current, key, value));
    },
    [commit],
  );

  const updateDailyTarget = useCallback(
    (target: number) => {
      commit(setQadaDailyTarget(stateRef.current, target));
    },
    [commit],
  );

  const undoLatest = useCallback(() => {
    if (commit(undoLatestQadaActivity(stateRef.current))) {
      void Haptics.selectionAsync().catch(() => {});
    }
  }, [commit]);

  const value = useMemo<QadaTrackerContextValue>(
    () => ({
      state,
      loading,
      summary: getQadaTrackerSummary(state),
      complete,
      addDebt,
      setBalance,
      setDailyTarget: updateDailyTarget,
      undoLatest,
    }),
    [addDebt, complete, loading, setBalance, state, undoLatest, updateDailyTarget],
  );

  return (
    <QadaTrackerContext.Provider value={value}>
      {children}
    </QadaTrackerContext.Provider>
  );
}

export function useQadaTracker() {
  const context = useContext(QadaTrackerContext);
  if (!context) {
    throw new Error('useQadaTracker must be used inside QadaTrackerProvider.');
  }
  return context;
}
