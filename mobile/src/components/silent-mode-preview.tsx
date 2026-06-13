import { type Href, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { loadPrayerSnapshot } from '@/services/prayer-cache';
import {
  buildSilentModeWindows,
  formatSilentWindowRange,
  getActiveSilentModeWindow,
  getNextSilentModeWindow,
} from '@/services/silent-mode';
import {
  createDefaultSilentModeSettings,
  loadSilentModeSettings,
} from '@/services/silent-mode-settings';
import type { PrayerTimesSnapshot } from '@/types/prayer';
import type { SilentModeSettings } from '@/types/silent-mode';

export function SilentModePreview() {
  const router = useRouter();
  const [now, setNow] = useState(new Date());
  const [settings, setSettings] = useState<SilentModeSettings>(
    createDefaultSilentModeSettings(),
  );
  const [snapshot, setSnapshot] = useState<PrayerTimesSnapshot | null>(null);

  useEffect(() => {
    Promise.all([loadSilentModeSettings(), loadPrayerSnapshot()])
      .then(([storedSettings, storedSnapshot]) => {
        setSettings(storedSettings);
        setSnapshot(storedSnapshot);
      })
      .catch(() => undefined);

    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const status = useMemo(() => {
    const windows = snapshot
      ? buildSilentModeWindows(snapshot, settings)
      : [];
    const active = getActiveSilentModeWindow(windows, now);
    const next = getNextSilentModeWindow(windows, now);

    if (!settings.enabled) {
      return {
        title: 'Sessiz zaman planı kapalı',
        subtitle: 'Namaz vakitleri için kişisel planını oluştur',
        badge: 'KAPALI',
      };
    }
    if (active) {
      return {
        title: `${active.prayerName} sessiz zamanı aktif`,
        subtitle: formatSilentWindowRange(active),
        badge: 'AKTİF',
      };
    }
    if (next) {
      return {
        title: `Sıradaki: ${next.prayerName}`,
        subtitle: `${formatSilentWindowRange(next)} · Diyanet vaktine göre`,
        badge: 'PLANLI',
      };
    }
    return {
      title: 'Sessiz zaman planı hazır',
      subtitle: 'Yeni Diyanet vakitleriyle otomatik yenilenir',
      badge: 'AÇIK',
    };
  }, [now, settings, snapshot]);

  return (
    <Pressable
      accessibilityLabel="Otomatik sessiz mod ayarlarını aç"
      accessibilityRole="button"
      onPress={() => router.push('/silent-mode' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.moon}>☾</Text>
        <View style={styles.slash} />
      </View>

      <View style={styles.copy}>
        <View style={styles.labelRow}>
          <Text style={styles.eyebrow}>OTOMATİK SESSİZ MOD</Text>
          <View
            style={[
              styles.badge,
              settings.enabled && styles.badgeEnabled,
            ]}>
            <Text
              style={[
                styles.badgeText,
                settings.enabled && styles.badgeTextEnabled,
              ]}>
              {status.badge}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{status.title}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {status.subtitle}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#E8EDF4',
    borderColor: '#CCD6E2',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 15,
  },
  pressed: {
    opacity: 0.82,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#263D50',
    borderRadius: 17,
    height: 54,
    justifyContent: 'center',
    marginRight: 13,
    position: 'relative',
    width: 54,
  },
  moon: {
    color: '#F1CF82',
    fontSize: 30,
  },
  slash: {
    backgroundColor: '#FFFFFF',
    height: 2,
    position: 'absolute',
    transform: [{ rotate: '-42deg' }],
    width: 30,
  },
  copy: {
    flex: 1,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  eyebrow: {
    color: '#425D73',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#D7DEE6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeEnabled: {
    backgroundColor: '#D6E9DF',
  },
  badgeText: {
    color: '#647484',
    fontSize: 7,
    fontWeight: '900',
  },
  badgeTextEnabled: {
    color: '#1A594B',
  },
  title: {
    color: '#263846',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#6D7F8C',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#5D7180',
    fontSize: 27,
    marginLeft: 7,
  },
});
