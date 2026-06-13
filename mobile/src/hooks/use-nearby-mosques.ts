import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  loadNearbyMosquesCache,
  saveNearbyMosquesCache,
} from '@/services/mosque-cache';
import { getNearbyMosques } from '@/services/mosques';
import type { NearbyMosquesSnapshot } from '@/types/mosque';

export type NearbyMosquesStatus =
  | 'loading'
  | 'ready'
  | 'empty'
  | 'permission-denied'
  | 'location-disabled'
  | 'error';

type NearbyMosquesState = {
  status: NearbyMosquesStatus;
  snapshot: NearbyMosquesSnapshot | null;
  selectedMosqueId: string | null;
  error: string | null;
  refreshing: boolean;
};

const INITIAL_STATE: NearbyMosquesState = {
  status: 'loading',
  snapshot: null,
  selectedMosqueId: null,
  error: null,
  refreshing: false,
};

export function useNearbyMosques(initialRadiusMeters = 5000) {
  const [radiusMeters, setRadiusMeters] = useState(initialRadiusMeters);
  const [state, setState] = useState<NearbyMosquesState>(INITIAL_STATE);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const radiusRef = useRef(initialRadiusMeters);

  const refresh = useCallback(
    async (requestedRadiusMeters?: number) => {
      const nextRadiusMeters =
        requestedRadiusMeters ?? radiusRef.current;
      const requestId = ++requestIdRef.current;
      const isCurrent = () =>
        mountedRef.current && requestId === requestIdRef.current;
      radiusRef.current = nextRadiusMeters;
      setRadiusMeters(nextRadiusMeters);
      setState((current) => ({
        ...current,
        status: current.snapshot ? current.status : 'loading',
        refreshing: true,
        error: null,
      }));

      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!isCurrent()) return;
        if (!permission.granted) {
          setState((current) => ({
            ...current,
            status: 'permission-denied',
            error: 'Yakındaki camileri bulmak için konum izni gereklidir.',
            refreshing: false,
          }));
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!isCurrent()) return;
        if (!servicesEnabled) {
          setState((current) => ({
            ...current,
            status: 'location-disabled',
            error: 'Telefonunuzun konum hizmetlerini açın.',
            refreshing: false,
          }));
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        if (!isCurrent()) return;

        const snapshot = await getNearbyMosques(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          nextRadiusMeters,
        );
        if (!isCurrent()) return;

        await saveNearbyMosquesCache(snapshot).catch(() => undefined);
        if (!isCurrent()) return;
        setState({
          status: snapshot.mosques.length ? 'ready' : 'empty',
          snapshot,
          selectedMosqueId: snapshot.mosques[0]?.id ?? null,
          error: snapshot.mosques.length
            ? null
            : 'Bu arama alanında kayıtlı cami bulunamadı.',
          refreshing: false,
        });
      } catch (error) {
        if (!isCurrent()) return;
        setState((current) => ({
          ...current,
          status: 'error',
          error:
            error instanceof Error
              ? error.message
              : 'Yakındaki camiler alınamadı.',
          refreshing: false,
        }));
      }
    },
    [],
  );

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    loadNearbyMosquesCache()
      .then((cached) => {
        if (!cached || cancelled || !mountedRef.current) {
          return;
        }
        radiusRef.current = cached.radiusMeters;
        setRadiusMeters(cached.radiusMeters);
        setState({
          status: cached.mosques.length ? 'ready' : 'empty',
          snapshot: cached,
          selectedMosqueId: cached.mosques[0]?.id ?? null,
          error: null,
          refreshing: true,
        });
      })
      .finally(() => {
        if (!cancelled && mountedRef.current) {
          void refresh();
        }
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [refresh]);

  const selectMosque = useCallback((mosqueId: string) => {
    setState((current) => ({ ...current, selectedMosqueId: mosqueId }));
  }, []);

  return {
    ...state,
    radiusMeters,
    selectedMosque:
      state.snapshot?.mosques.find(
        (mosque) => mosque.id === state.selectedMosqueId,
      ) ?? null,
    refresh,
    selectMosque,
  };
}
