import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getNotificationPermissionState,
  requestNotificationPermission,
} from '@/services/prayer-notifications';
import { loadPrayerSnapshot } from '@/services/prayer-cache';
import {
  getSilentModeScheduleSummary,
  syncSilentModeNotifications,
} from '@/services/silent-mode-notifications';
import {
  createDefaultSilentModeSettings,
  loadSilentModeSettings,
  saveSilentModeSettings,
} from '@/services/silent-mode-settings';
import {
  buildSilentModeWindows,
  getActiveSilentModeWindow,
  getNextSilentModeWindow,
  getTodaySilentModeWindows,
} from '@/services/silent-mode';
import type { NotificationPermissionState } from '@/services/notification-settings';
import type { PrayerKey, PrayerTimesSnapshot } from '@/types/prayer';
import type {
  SilentModeScheduleSummary,
  SilentModeSettings,
} from '@/types/silent-mode';

type SilentModeState = {
  settings: SilentModeSettings;
  snapshot: PrayerTimesSnapshot | null;
  summary: SilentModeScheduleSummary;
  permission: NotificationPermissionState;
  loading: boolean;
  saving: boolean;
  error: string | null;
};

const EMPTY_SUMMARY: SilentModeScheduleSummary = {
  count: 0,
  scheduledUntil: null,
  updatedAt: null,
};

function getMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Sessiz mod planı güncellenemedi.';
}

export function useSilentMode() {
  const [now, setNow] = useState(new Date());
  const [state, setState] = useState<SilentModeState>({
    settings: createDefaultSilentModeSettings(),
    snapshot: null,
    summary: EMPTY_SUMMARY,
    permission: 'undetermined',
    loading: true,
    saving: false,
    error: null,
  });

  useEffect(() => {
    let active = true;

    Promise.all([
      loadSilentModeSettings(),
      loadPrayerSnapshot(),
      getSilentModeScheduleSummary(),
      getNotificationPermissionState(),
    ])
      .then(async ([settings, snapshot, summary, permission]) => {
        const currentSummary =
          settings.enabled && settings.remindersEnabled
            ? await syncSilentModeNotifications(snapshot, settings)
            : summary;

        if (active) {
          setState({
            settings,
            snapshot,
            summary: currentSummary,
            permission,
            loading: false,
            saving: false,
            error: null,
          });
        }
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

    const timer = setInterval(() => setNow(new Date()), 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const saveAndSync = useCallback(
    async (
      settings: SilentModeSettings,
      permission = state.permission,
      warning: string | null = null,
    ) => {
      setState((current) => ({
        ...current,
        settings,
        permission,
        saving: true,
        error: warning,
      }));

      try {
        await saveSilentModeSettings(settings);
        const snapshot = state.snapshot ?? (await loadPrayerSnapshot());
        const summary = await syncSilentModeNotifications(snapshot, settings);
        setState((current) => ({
          ...current,
          settings,
          snapshot,
          summary,
          permission,
          saving: false,
          error: warning,
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          saving: false,
          error: getMessage(error),
        }));
      }
    },
    [state.permission, state.snapshot],
  );

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      let permission = state.permission;
      let warning: string | null = null;

      if (enabled && state.settings.remindersEnabled) {
        permission = await requestNotificationPermission();
        if (permission !== 'granted') {
          warning =
            permission === 'unsupported'
              ? 'Web önizlemesinde sessiz hatırlatmalar zamanlanmaz. Plan telefonda çalışır.'
              : 'Plan açıldı; bildirim izni kapalı olduğu için sessiz hatırlatmalar çalışmayacak.';
        }
      }

      await saveAndSync(
        { ...state.settings, enabled },
        permission,
        warning,
      );
    },
    [saveAndSync, state.permission, state.settings],
  );

  const setRemindersEnabled = useCallback(
    async (remindersEnabled: boolean) => {
      let permission = state.permission;
      let warning: string | null = null;
      if (remindersEnabled) {
        permission = await requestNotificationPermission();
        if (permission !== 'granted') {
          warning =
            permission === 'unsupported'
              ? 'Sessiz hatırlatmalar Android ve iOS cihazlarda çalışır.'
              : 'Bildirim izni verilmedi. Telefon ayarlarından MIHRAB bildirimlerini açın.';
        }
      }

      await saveAndSync(
        { ...state.settings, remindersEnabled },
        permission,
        warning,
      );
    },
    [saveAndSync, state.permission, state.settings],
  );

  const setStartBeforeMinutes = useCallback(
    (startBeforeMinutes: number) =>
      saveAndSync({ ...state.settings, startBeforeMinutes }),
    [saveAndSync, state.settings],
  );

  const setEndAfterMinutes = useCallback(
    (endAfterMinutes: number) =>
      saveAndSync({ ...state.settings, endAfterMinutes }),
    [saveAndSync, state.settings],
  );

  const setPrayerEnabled = useCallback(
    (prayerKey: PrayerKey, enabled: boolean) =>
      saveAndSync({
        ...state.settings,
        prayers: {
          ...state.settings.prayers,
          [prayerKey]: { enabled },
        },
      }),
    [saveAndSync, state.settings],
  );

  const windows = useMemo(
    () =>
      state.snapshot
        ? buildSilentModeWindows(state.snapshot, state.settings)
        : [],
    [state.settings, state.snapshot],
  );

  return {
    ...state,
    now,
    windows,
    activeWindow: getActiveSilentModeWindow(windows, now),
    nextWindow: getNextSilentModeWindow(windows, now),
    todayWindows: getTodaySilentModeWindows(windows, now),
    setEnabled,
    setRemindersEnabled,
    setStartBeforeMinutes,
    setEndAfterMinutes,
    setPrayerEnabled,
  };
}
