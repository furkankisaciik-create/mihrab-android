import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useHomeWidget } from '@/hooks/use-home-widget';
import type { HomeWidgetSnapshot } from '@/types/home-widget';

type WidgetMockupProps = {
  snapshot: HomeWidgetSnapshot | null;
  large?: boolean;
};

function formatUpdatedAt(value?: string) {
  if (!value) {
    return 'Henüz senkron yok';
  }

  return new Intl.DateTimeFormat('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function HomeWidgetMockup({ snapshot, large = false }: WidgetMockupProps) {
  const visiblePrayers = snapshot?.prayers.slice(0, large ? 4 : 3) ?? [];

  return (
    <View style={[styles.mockup, large && styles.mockupLarge]}>
      <View style={styles.mockupTop}>
        <View style={styles.mockupCopy}>
          <Text numberOfLines={1} style={styles.mockupLocation}>
            {snapshot?.location ?? 'MIHRAB'}
          </Text>
          <Text numberOfLines={1} style={styles.mockupDate}>
            {snapshot?.hijriDate ?? 'Diyanet vakitleri'}
          </Text>
        </View>
        <Text style={styles.mockupBrand}>MIHRAB</Text>
      </View>

      <View style={styles.mockupHero}>
        <View style={styles.mockupCopy}>
          <Text style={styles.mockupNext}>
            {snapshot?.nextPrayerName ?? 'Vakitler hazır değil'}
          </Text>
          <Text style={styles.mockupRemaining}>
            {snapshot?.remainingLabel ?? "MIHRAB'ı açıp konumu yenileyin"}
          </Text>
        </View>
        <Text style={styles.mockupTime}>{snapshot?.nextPrayerTime ?? '--:--'}</Text>
      </View>

      <View style={styles.mockupRows}>
        {visiblePrayers.length ? (
          visiblePrayers.map((prayer) => (
            <View key={`${prayer.key}-${prayer.dateTime}`} style={styles.mockupRow}>
              <Text numberOfLines={1} style={styles.mockupRowName}>
                {prayer.name}
              </Text>
              <Text style={styles.mockupRowTime}>{prayer.time}</Text>
            </View>
          ))
        ) : (
          <View style={styles.mockupRow}>
            <Text style={styles.mockupRowName}>Vakit bekleniyor</Text>
            <Text style={styles.mockupRowTime}>--:--</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export function HomeWidgetPreview() {
  const router = useRouter();
  const { snapshot, nativeAvailable, loading } = useHomeWidget();

  return (
    <Pressable
      accessibilityLabel="Ana ekran widget ayarlarını aç"
      accessibilityRole="button"
      onPress={() => router.push('/home-widget' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <HomeWidgetMockup snapshot={snapshot} />

      <View style={styles.previewCopy}>
        <View style={styles.previewLabelRow}>
          <Text style={styles.eyebrow}>ANA EKRAN WIDGET'I</Text>
          <View
            style={[
              styles.badge,
              nativeAvailable ? styles.badgeReady : styles.badgePreview,
            ]}>
            <Text
              style={[
                styles.badgeText,
                nativeAvailable ? styles.badgeTextReady : styles.badgeTextPreview,
              ]}>
              {nativeAvailable ? 'APK HAZIR' : 'ÖNİZLEME'}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>
          {snapshot
            ? `${snapshot.nextPrayerName} ${snapshot.nextPrayerTime}`
            : 'Vakit kartı ana ekrana hazır'}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {loading
            ? 'Widget verisi hazırlanıyor'
            : `Son senkron: ${formatUpdatedAt(snapshot?.updatedAt)}`}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#133F36',
    borderRadius: 24,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 13,
  },
  pressed: {
    opacity: 0.84,
  },
  mockup: {
    backgroundColor: '#0F302A',
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    marginRight: 13,
    padding: 9,
    width: 112,
  },
  mockupLarge: {
    borderRadius: 24,
    marginRight: 0,
    padding: 15,
    width: '100%',
  },
  mockupTop: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mockupCopy: {
    flex: 1,
    minWidth: 0,
  },
  mockupLocation: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  mockupDate: {
    color: '#BBD0C8',
    fontSize: 7,
    marginTop: 1,
  },
  mockupBrand: {
    color: '#F1CF82',
    fontSize: 6,
    fontWeight: '900',
    marginLeft: 5,
  },
  mockupHero: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  mockupNext: {
    color: '#F1CF82',
    fontSize: 14,
    fontWeight: '900',
  },
  mockupRemaining: {
    color: '#BBD0C8',
    fontSize: 7,
    marginTop: 1,
  },
  mockupTime: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 5,
  },
  mockupRows: {
    gap: 4,
    marginTop: 8,
  },
  mockupRow: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 19,
    paddingHorizontal: 7,
  },
  mockupRowName: {
    color: '#FFFFFF',
    flex: 1,
    fontSize: 7,
    fontWeight: '800',
  },
  mockupRowTime: {
    color: '#F1CF82',
    fontSize: 7,
    fontWeight: '900',
    marginLeft: 5,
  },
  previewCopy: {
    flex: 1,
  },
  previewLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeReady: {
    backgroundColor: '#D6E9DF',
  },
  badgePreview: {
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badgeText: {
    fontSize: 7,
    fontWeight: '900',
  },
  badgeTextReady: {
    color: '#1A594B',
  },
  badgeTextPreview: {
    color: '#DDEBE6',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 5,
  },
  subtitle: {
    color: '#BBD0C8',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#DDEBE6',
    fontSize: 27,
    marginLeft: 7,
  },
});
