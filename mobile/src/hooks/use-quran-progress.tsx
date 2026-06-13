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
  createDefaultQuranProgressState,
  loadQuranProgressState,
  saveQuranProgressState,
  setQuranArabicFontSize,
  setQuranLastRead,
} from '@/services/quran-progress';
import type { QuranProgressState } from '@/types/quran';

type QuranProgressContextValue = {
  state: QuranProgressState;
  loading: boolean;
  markLastRead: (surahNumber: number, verseNumber: number) => void;
  changeArabicFontSize: (fontSize: number) => void;
};

const QuranProgressContext = createContext<QuranProgressContextValue | null>(null);

export function QuranProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDefaultQuranProgressState);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: QuranProgressState) => {
    if (next === stateRef.current) {
      return false;
    }
    stateRef.current = next;
    setState(next);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      void saveQuranProgressState(stateRef.current);
    }, 200);
    return true;
  }, []);

  useEffect(() => {
    let active = true;
    loadQuranProgressState()
      .then((stored) => {
        if (active) {
          stateRef.current = stored;
          setState(stored);
        }
      })
      .catch(() => {
        if (active) {
          const fallback = createDefaultQuranProgressState();
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
      void saveQuranProgressState(stateRef.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void saveQuranProgressState(stateRef.current);
      }
    });
    return () => subscription.remove();
  }, []);

  const markLastRead = useCallback(
    (surahNumber: number, verseNumber: number) => {
      if (commit(setQuranLastRead(stateRef.current, surahNumber, verseNumber))) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    },
    [commit],
  );

  const value = useMemo<QuranProgressContextValue>(
    () => ({
      state,
      loading,
      markLastRead,
      changeArabicFontSize: (fontSize) =>
        commit(setQuranArabicFontSize(stateRef.current, fontSize)),
    }),
    [commit, loading, markLastRead, state],
  );

  return (
    <QuranProgressContext.Provider value={value}>
      {children}
    </QuranProgressContext.Provider>
  );
}

export function useQuranProgress() {
  const context = useContext(QuranProgressContext);
  if (!context) {
    throw new Error('useQuranProgress must be used inside QuranProgressProvider.');
  }
  return context;
}
