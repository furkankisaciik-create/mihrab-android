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
  createDefaultDuaFavoritesState,
  loadDuaFavoritesState,
  saveDuaFavoritesState,
  toggleDuaFavorite,
} from '@/services/dua-favorites';
import type { DuaFavoritesState } from '@/types/dua-favorites';

type DuaFavoritesContextValue = {
  state: DuaFavoritesState;
  loading: boolean;
  count: number;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
};

const DuaFavoritesContext = createContext<DuaFavoritesContextValue | null>(null);

export function DuaFavoritesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(createDefaultDuaFavoritesState);
  const [loading, setLoading] = useState(true);
  const stateRef = useRef(state);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback((next: DuaFavoritesState) => {
    if (next === stateRef.current) {
      return false;
    }

    stateRef.current = next;
    setState(next);
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      void saveDuaFavoritesState(stateRef.current);
    }, 200);
    return true;
  }, []);

  useEffect(() => {
    let active = true;

    loadDuaFavoritesState()
      .then((stored) => {
        if (!active) {
          return;
        }
        stateRef.current = stored;
        setState(stored);
      })
      .catch(() => {
        if (active) {
          const fallback = createDefaultDuaFavoritesState();
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
      void saveDuaFavoritesState(stateRef.current);
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') {
        void saveDuaFavoritesState(stateRef.current);
      }
    });
    return () => subscription.remove();
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      if (commit(toggleDuaFavorite(stateRef.current, id))) {
        void Haptics.selectionAsync().catch(() => {});
      }
    },
    [commit],
  );

  const favoriteIds = useMemo(() => new Set(state.ids), [state.ids]);
  const value = useMemo<DuaFavoritesContextValue>(
    () => ({
      state,
      loading,
      count: state.ids.length,
      isFavorite: (id) => favoriteIds.has(id),
      toggleFavorite,
    }),
    [favoriteIds, loading, state, toggleFavorite],
  );

  return (
    <DuaFavoritesContext.Provider value={value}>
      {children}
    </DuaFavoritesContext.Provider>
  );
}

export function useDuaFavorites() {
  const context = useContext(DuaFavoritesContext);
  if (!context) {
    throw new Error('useDuaFavorites must be used inside DuaFavoritesProvider.');
  }
  return context;
}
