import { useCallback, useEffect, useState } from 'react';

import {
  loadHomeWidgetSnapshot,
  syncHomeWidget,
} from '@/services/home-widget';
import { refreshNativeHomeWidget } from '@/services/home-widget-native';
import { loadPrayerSnapshot } from '@/services/prayer-cache';
import type { HomeWidgetSnapshot } from '@/types/home-widget';

type HomeWidgetState = {
  snapshot: HomeWidgetSnapshot | null;
  nativeAvailable: boolean;
  loading: boolean;
  syncing: boolean;
  error: string | null;
};

function getMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Ana ekran widget verisi güncellenemedi.';
}

export function useHomeWidget() {
  const [state, setState] = useState<HomeWidgetState>({
    snapshot: null,
    nativeAvailable: false,
    loading: true,
    syncing: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({
      ...current,
      syncing: true,
      error: null,
    }));

    try {
      const prayerSnapshot = await loadPrayerSnapshot();
      if (!prayerSnapshot) {
        setState((current) => ({
          ...current,
          loading: false,
          syncing: false,
          error: 'Önce Diyanet vakitleri alınmalı. Ana ekranda konumu yenileyin.',
        }));
        return null;
      }

      const result = await syncHomeWidget(prayerSnapshot);
      await refreshNativeHomeWidget();

      setState({
        snapshot: result?.snapshot ?? null,
        nativeAvailable: Boolean(result?.nativeAvailable),
        loading: false,
        syncing: false,
        error: null,
      });

      return result;
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        syncing: false,
        error: getMessage(error),
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;

    loadHomeWidgetSnapshot()
      .then(async (stored) => {
        if (active) {
          setState((current) => ({
            ...current,
            snapshot: stored,
            loading: !stored,
          }));
        }
        await refresh();
      })
      .catch((error) => {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            error: getMessage(error),
          }));
        }
      });

    return () => {
      active = false;
    };
  }, [refresh]);

  return {
    ...state,
    refresh,
  };
}
