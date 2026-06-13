import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';

import {
  calculateDistanceToKaaba,
  calculateQiblaBearing,
  smoothHeading,
} from '@/services/qibla';

export type QiblaCompassStatus =
  | 'loading'
  | 'ready'
  | 'permission-denied'
  | 'location-disabled'
  | 'sensor-unavailable'
  | 'web-preview'
  | 'error';

type QiblaCompassState = {
  status: QiblaCompassStatus;
  qiblaBearing: number | null;
  heading: number | null;
  headingAccuracy: number;
  usesTrueNorth: boolean;
  distanceKm: number | null;
  locationAccuracy: number | null;
  error: string | null;
};

const INITIAL_STATE: QiblaCompassState = {
  status: 'loading',
  qiblaBearing: null,
  heading: null,
  headingAccuracy: 0,
  usesTrueNorth: false,
  distanceKm: null,
  locationAccuracy: null,
  error: null,
};

function getHeadingValue(heading: Location.LocationHeadingObject) {
  return heading.trueHeading >= 0 ? heading.trueHeading : heading.magHeading;
}

export function useQiblaCompass() {
  const [state, setState] = useState<QiblaCompassState>(INITIAL_STATE);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const stopHeading = useCallback(() => {
    subscriptionRef.current?.remove();
    subscriptionRef.current = null;
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isCurrent = () => mountedRef.current && requestId === requestIdRef.current;
    stopHeading();
    setState((current) => ({ ...current, status: 'loading', error: null }));

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!isCurrent()) return;
      if (!permission.granted) {
        setState((current) => ({
          ...current,
          status: 'permission-denied',
          error: 'Kıble yönünü hesaplamak için konum izni gereklidir.',
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
        }));
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (!isCurrent()) return;
      const { latitude, longitude, accuracy } = position.coords;
      const qiblaBearing = calculateQiblaBearing(latitude, longitude);
      const distanceKm = calculateDistanceToKaaba(latitude, longitude);

      if (Platform.OS === 'web') {
        setState({
          status: 'web-preview',
          qiblaBearing,
          heading: 0,
          headingAccuracy: 0,
          usesTrueNorth: false,
          distanceKm,
          locationAccuracy: accuracy,
          error: null,
        });
        return;
      }

      const initialHeading = await Location.getHeadingAsync();
      if (!isCurrent()) return;
      const initialValue = getHeadingValue(initialHeading);
      setState({
        status: 'ready',
        qiblaBearing,
        heading: initialValue,
        headingAccuracy: initialHeading.accuracy,
        usesTrueNorth: initialHeading.trueHeading >= 0,
        distanceKm,
        locationAccuracy: accuracy,
        error: null,
      });

      const subscription = await Location.watchHeadingAsync(
        (heading) => {
          if (!mountedRef.current) {
            return;
          }
          const nextHeading = getHeadingValue(heading);
          setState((current) => ({
            ...current,
            heading: smoothHeading(current.heading, nextHeading),
            headingAccuracy: heading.accuracy,
            usesTrueNorth: heading.trueHeading >= 0,
          }));
        },
        () => {
          if (mountedRef.current) {
            setState((current) => ({
              ...current,
              status: 'sensor-unavailable',
              error: 'Bu cihazda pusula sensörü okunamadı.',
            }));
          }
        },
      );

      if (!isCurrent()) {
        subscription.remove();
      } else {
        subscriptionRef.current = subscription;
      }
    } catch (error) {
      if (!isCurrent()) return;
      const message = error instanceof Error ? error.message : 'Kıble pusulası başlatılamadı.';
      setState((current) => ({
        ...current,
        status: message.toLocaleLowerCase('tr-TR').includes('sensor')
          ? 'sensor-unavailable'
          : 'error',
        error: message,
      }));
    }
  }, [stopHeading]);

  useEffect(() => {
    mountedRef.current = true;
    void refresh();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
      stopHeading();
    };
  }, [refresh, stopHeading]);

  return {
    ...state,
    refresh,
  };
}
