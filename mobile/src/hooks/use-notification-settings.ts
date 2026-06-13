import { useCallback, useEffect, useState } from 'react';

import {
  createDefaultNotificationSettings,
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationPermissionState,
  type NotificationScheduleSummary,
  type NotificationSettings,
  type ReminderOffset,
} from '@/services/notification-settings';
import {
  getNotificationPermissionState,
  getNotificationScheduleSummary,
  initializeNotificationRuntime,
  requestNotificationPermission,
  syncPrayerNotifications,
} from '@/services/prayer-notifications';
import { loadPrayerSnapshot } from '@/services/prayer-cache';
import type { PrayerKey } from '@/types/prayer';

type NotificationSettingsState = {
  settings: NotificationSettings;
  permission: NotificationPermissionState;
  summary: NotificationScheduleSummary;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const EMPTY_SUMMARY: NotificationScheduleSummary = {
  count: 0,
  scheduledUntil: null,
  updatedAt: null,
};

function getMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Bildirim ayarları güncellenemedi.';
}

export function useNotificationSettings() {
  const [state, setState] = useState<NotificationSettingsState>({
    settings: createDefaultNotificationSettings(),
    permission: 'undetermined',
    summary: EMPTY_SUMMARY,
    loading: true,
    saving: false,
    error: null,
  });

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        await initializeNotificationRuntime();
        const [settings, permission, summary] = await Promise.all([
          loadNotificationSettings(),
          getNotificationPermissionState(),
          getNotificationScheduleSummary(),
        ]);

        let currentSummary = summary;
        if (settings.enabled && permission === 'granted') {
          currentSummary = await syncPrayerNotifications(await loadPrayerSnapshot(), settings);
        }

        if (active) {
          setState({
            settings,
            permission,
            summary: currentSummary,
            loading: false,
            saving: false,
            error: null,
          });
        }
      } catch (error) {
        if (active) {
          setState((current) => ({
            ...current,
            loading: false,
            error: getMessage(error),
          }));
        }
      }
    }

    initialize();
    return () => {
      active = false;
    };
  }, []);

  const saveAndSync = useCallback(
    async (settings: NotificationSettings, permission = state.permission) => {
      setState((current) => ({
        ...current,
        settings,
        permission,
        saving: true,
        error: null,
      }));

      try {
        await saveNotificationSettings(settings);
        const summary = await syncPrayerNotifications(await loadPrayerSnapshot(), settings);
        setState((current) => ({
          ...current,
          settings,
          permission,
          summary,
          saving: false,
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          saving: false,
          error: getMessage(error),
        }));
      }
    },
    [state.permission],
  );

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      if (!enabled) {
        await saveAndSync({ ...state.settings, enabled: false });
        return;
      }

      setState((current) => ({ ...current, saving: true, error: null }));
      const permission = await requestNotificationPermission();

      if (permission !== 'granted') {
        const error =
          permission === 'unsupported'
            ? 'Web önizlemesinde bildirim zamanlanmaz. Android veya iOS cihaz kullanın.'
            : 'Bildirim izni verilmedi. Telefon ayarlarından MIHRAB bildirimlerini açabilirsiniz.';
        setState((current) => ({
          ...current,
          permission,
          saving: false,
          error,
        }));
        return;
      }

      await saveAndSync({ ...state.settings, enabled: true }, permission);
    },
    [saveAndSync, state.settings],
  );

  const updatePrayer = useCallback(
    async (
      prayerKey: PrayerKey,
      update: (current: NotificationSettings['prayers'][PrayerKey]) => NotificationSettings['prayers'][PrayerKey],
    ) => {
      const settings = {
        ...state.settings,
        prayers: {
          ...state.settings.prayers,
          [prayerKey]: update(state.settings.prayers[prayerKey]),
        },
      };
      await saveAndSync(settings);
    },
    [saveAndSync, state.settings],
  );

  const setPrayerEnabled = useCallback(
    (prayerKey: PrayerKey, enabled: boolean) =>
      updatePrayer(prayerKey, (current) => ({ ...current, enabled })),
    [updatePrayer],
  );

  const setPrayerSound = useCallback(
    (prayerKey: PrayerKey, soundEnabled: boolean) =>
      updatePrayer(prayerKey, (current) => ({ ...current, soundEnabled })),
    [updatePrayer],
  );

  const toggleReminder = useCallback(
    (prayerKey: PrayerKey, offset: ReminderOffset) =>
      updatePrayer(prayerKey, (current) => {
        const reminders = current.reminders.includes(offset)
          ? current.reminders.filter((value) => value !== offset)
          : [...current.reminders, offset].sort((left, right) => right - left);
        return { ...current, reminders };
      }),
    [updatePrayer],
  );

  const refreshPermission = useCallback(async () => {
    const permission = await getNotificationPermissionState();
    setState((current) => ({ ...current, permission }));
    if (permission === 'granted' && state.settings.enabled) {
      await saveAndSync(state.settings, permission);
    }
  }, [saveAndSync, state.settings]);

  return {
    ...state,
    setEnabled,
    setPrayerEnabled,
    setPrayerSound,
    toggleReminder,
    refreshPermission,
  };
}
