import { useCallback, useEffect, useState } from 'react';

import { detectDiyanetLocation, LocationPermissionError } from '@/services/device-location';
import {
  getDistricts,
  getPrayerTimes,
  getTurkeyCities,
} from '@/services/diyanet';
import { syncHomeWidget } from '@/services/home-widget';
import { loadPrayerSnapshot, savePrayerSnapshot } from '@/services/prayer-cache';
import { syncPrayerNotifications } from '@/services/prayer-notifications';
import { syncSilentModeNotifications } from '@/services/silent-mode-notifications';
import type {
  DiyanetCity,
  DiyanetDistrict,
  PrayerLocation,
  PrayerTimesSnapshot,
} from '@/types/prayer';

type PrayerState = {
  snapshot: PrayerTimesSnapshot | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  notice: string | null;
  permissionDenied: boolean;
};

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Beklenmeyen bir hata oluştu.';
}

export function usePrayerTimes() {
  const [state, setState] = useState<PrayerState>({
    snapshot: null,
    loading: true,
    refreshing: false,
    error: null,
    notice: null,
    permissionDenied: false,
  });

  const applyLocation = useCallback(async (location: PrayerLocation, refreshing = true) => {
    setState((current) => ({
      ...current,
      loading: current.snapshot ? false : !refreshing,
      refreshing,
      error: null,
      notice: null,
    }));

    try {
      const snapshot = await getPrayerTimes(location);
      await savePrayerSnapshot(snapshot);
      void syncPrayerNotifications(snapshot);
      void syncSilentModeNotifications(snapshot);
      void syncHomeWidget(snapshot);
      setState({
        snapshot,
        loading: false,
        refreshing: false,
        error: null,
        notice: location.usedCityCenterFallback
          ? `${location.detectedDistrict ?? 'Bulunduğunuz ilçe'} için Diyanet'in ${location.district.name} bölgesi kullanılıyor.`
          : null,
        permissionDenied: false,
      });
      return snapshot;
    } catch (error) {
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: current.snapshot ? null : getMessage(error),
        notice: current.snapshot
          ? 'Bağlantı kurulamadı. Son kaydedilen Diyanet vakitleri gösteriliyor.'
          : null,
      }));
      throw error;
    }
  }, []);

  const refreshFromDevice = useCallback(async () => {
    setState((current) => ({
      ...current,
      loading: !current.snapshot,
      refreshing: Boolean(current.snapshot),
      error: null,
      notice: null,
    }));

    try {
      const location = await detectDiyanetLocation();
      await applyLocation(location);
    } catch (error) {
      const permissionDenied = error instanceof LocationPermissionError;
      setState((current) => ({
        ...current,
        loading: false,
        refreshing: false,
        error: current.snapshot ? null : getMessage(error),
        notice: current.snapshot
          ? permissionDenied
            ? 'Konum izni kapalı. Son seçilen bölgenin vakitleri gösteriliyor.'
            : 'Konum yenilenemedi. Son kaydedilen Diyanet vakitleri gösteriliyor.'
          : null,
        permissionDenied,
      }));
    }
  }, [applyLocation]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const cached = await loadPrayerSnapshot();
      if (!active) {
        return;
      }

      if (cached) {
        setState((current) => ({
          ...current,
          snapshot: {
            ...cached,
            isCached: true,
          },
          loading: false,
        }));
        void syncPrayerNotifications(cached);
        void syncSilentModeNotifications(cached);
        void syncHomeWidget(cached);
      }

      await refreshFromDevice();
    }

    initialize();
    return () => {
      active = false;
    };
  }, [refreshFromDevice]);

  const selectLocation = useCallback(
    async (city: DiyanetCity, district: DiyanetDistrict) =>
      applyLocation({ city, district }, true),
    [applyLocation],
  );

  const refreshCurrent = useCallback(async () => {
    if (state.snapshot) {
      return applyLocation(state.snapshot.location, true);
    }
    return refreshFromDevice();
  }, [applyLocation, refreshFromDevice, state.snapshot]);

  return {
    ...state,
    refreshFromDevice,
    refreshCurrent,
    selectLocation,
    getCities: getTurkeyCities,
    getDistricts,
  };
}
