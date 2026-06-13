import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  formatGregorianCalendarDate,
  getHijriDate,
} from '@/services/hijri-calendar';
import { getIstanbulDateKey } from '@/services/daily-content-date';
import type { PrayerTimesSnapshot } from '@/types/prayer';

type HijriCalendarPreviewProps = {
  snapshot: PrayerTimesSnapshot | null;
};

export function HijriCalendarPreview({
  snapshot,
}: HijriCalendarPreviewProps) {
  const router = useRouter();
  const todayKey = getIstanbulDateKey();
  const hijri = getHijriDate(todayKey, snapshot?.schedule ?? []);
  const location = snapshot
    ? `${snapshot.location.district.name}, ${snapshot.location.city.name}`
    : 'Türkiye saatine göre';

  return (
    <Pressable
      accessibilityLabel="Hicri takvimi aç"
      accessibilityRole="button"
      onPress={() => router.push('/calendar' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.dateBlock}>
        <Text style={styles.day}>{hijri.day}</Text>
        <Text numberOfLines={1} style={styles.month}>
          {hijri.month}
        </Text>
      </View>

      <View style={styles.copy}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>HİCRİ TAKVİM</Text>
          {hijri.isOfficial ? (
            <View style={styles.officialBadge}>
              <Text style={styles.officialText}>DİYANET</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title}>{hijri.label}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {formatGregorianCalendarDate(todayKey)} · {location}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFF4DA',
    borderColor: '#E9D39B',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  dateBlock: {
    alignItems: 'center',
    backgroundColor: '#174D42',
    borderRadius: 17,
    height: 58,
    justifyContent: 'center',
    marginRight: 13,
    width: 58,
  },
  day: {
    color: '#F1CF82',
    fontSize: 23,
    fontWeight: '900',
    lineHeight: 25,
  },
  month: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    maxWidth: 50,
  },
  copy: {
    flex: 1,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  eyebrow: {
    color: '#8A651E',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  officialBadge: {
    backgroundColor: '#E6D5A8',
    borderRadius: 7,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  officialText: {
    color: '#72551C',
    fontSize: 7,
    fontWeight: '900',
  },
  title: {
    color: '#383528',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    color: '#7F755D',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#856D39',
    fontSize: 27,
    marginLeft: 7,
  },
});
