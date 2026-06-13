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
  createDefaultDhikrState,
  DHIKR_PRESETS,
  ensureDhikrDate,
  getDhikrSummary,
  incrementDhikr,
  loadDhikrState,
  resetDhikrSession,
  saveDhikrState,
  selectDhikr,
  setDhikrHaptics,
  setDhikrTarget,
  undoDhikr,
} from '@/services/dhikr-counter';
import { getIstanbulDateKey } from '@/services/daily-content-date';
import type { DhikrKey, DhikrState } from '@/types/dhikr';

type DhikrContextValue = {
  state: DhikrState;
  loading: boolean;
  selectedPreset: (typeof DHIKR_PRESETS)[number];
  selectedSession: DhikrState['sessions'][DhikrKey];
  summary: ReturnType<typeof getDhikrSummary>;
  select: (key: DhikrKey) => void;
  increment: () => void;
  undo: () => void;
  reset: () => void;
  setTarget: (target: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
};

const DhikrContext = createContext<DhikrContextValue | null>(null);

export function DhikrProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDefaultDhikrState);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: DhikrState) => {
    stateRef.current = next;
    setState(next);

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      void saveDhikrState(stateRef.current);
    }, 250);
  }, []);

  useEffect(() => {
    let active = true;

    loadDhikrState().then((stored) => {
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
      void saveDhikrState(stateRef.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void saveDhikrState(stateRef.current);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = ensureDhikrDate(stateRef.current, getIstanbulDateKey());
      if (next !== stateRef.current) {
        commit(next);
      }
    }, 60_000);
    return () => clearInterval(timer);
  }, [commit]);

  const performHaptic = useCallback(async (completedTarget: boolean) => {
    if (!stateRef.current.hapticsEnabled) {
      return;
    }

    try {
      if (completedTarget) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else if (Platform.OS === 'android') {
        await Haptics.performAndroidHapticsAsync(
          Haptics.AndroidHaptics.Segment_Frequent_Tick,
        );
      } else {
        await Haptics.selectionAsync();
      }
    } catch {
      // Some devices or browsers do not expose a haptics engine.
    }
  }, []);

  const increment = useCallback(() => {
    const result = incrementDhikr(stateRef.current);
    commit(result.state);
    void performHaptic(result.completedTarget);
  }, [commit, performHaptic]);

  const value = useMemo<DhikrContextValue>(() => {
    const selectedPreset =
      DHIKR_PRESETS.find((preset) => preset.key === state.selectedKey) ??
      DHIKR_PRESETS[0];

    return {
      state,
      loading,
      selectedPreset,
      selectedSession: state.sessions[state.selectedKey],
      summary: getDhikrSummary(state),
      select: (key) => commit(selectDhikr(stateRef.current, key)),
      increment,
      undo: () => commit(undoDhikr(stateRef.current)),
      reset: () => commit(resetDhikrSession(stateRef.current)),
      setTarget: (target) => commit(setDhikrTarget(stateRef.current, target)),
      setHapticsEnabled: (enabled) =>
        commit(setDhikrHaptics(stateRef.current, enabled)),
    };
  }, [commit, increment, loading, state]);

  return <DhikrContext.Provider value={value}>{children}</DhikrContext.Provider>;
}

export function useDhikrCounter() {
  const context = useContext(DhikrContext);
  if (!context) {
    throw new Error('useDhikrCounter must be used inside DhikrProvider.');
  }
  return context;
}
