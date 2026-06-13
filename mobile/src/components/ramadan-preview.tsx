import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getIstanbulDateKey } from '@/services/daily-content-date';
import {
  buildRamadanSchedules,
  formatRamadanDate,
  getUpcomingRamadan,
} from '@/services/ramadan';
import type { PrayerTimesSnapshot } from '@/types/prayer';

type RamadanPreviewProps = {
  snapshot: PrayerTimesSnapshot | null;
};

export function RamadanPreview({ snapshot }: RamadanPreviewProps) {
  const router = useRouter();
  const todayKey = getIstanbulDateKey();
  const schedules = buildRamadanSchedules(snapshot?.schedule ?? []);
  const upcoming = getUpcomingRamadan(todayKey, schedules);
  const location = snapshot
    ? `${snapshot.location.district.name}, ${snapshot.location.city.name}`
    : 'Konum hazırlanıyor';

  return (
    <Pressable
      accessibilityLabel="Ramazan imsakiyesini aç"
      accessibilityRole="button"
      onPress={() => router.push('/ramadan' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.moon}>☾</Text>
        <Text style={styles.star}>✦</Text>
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>RAMAZAN İMSAKİYESİ</Text>
        <Text style={styles.title}>
          {upcoming.daysUntil > 0
            ? `${upcoming.hijriYear} Ramazan’a ${upcoming.daysUntil} gün`
            : upcoming.daysUntil === 0
              ? 'Ramazan bugün başlıyor'
              : 'Ramazan imsakiyesi'}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {formatRamadanDate(upcoming.startDateKey)} · {location}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#173F38',
    borderRadius: 22,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 15,
  },
  pressed: {
    opacity: 0.86,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderRadius: 17,
    height: 55,
    justifyContent: 'center',
    marginRight: 13,
    position: 'relative',
    width: 55,
  },
  moon: {
    color: '#F1CF82',
    fontSize: 30,
  },
  star: {
    color: '#FFFFFF',
    fontSize: 8,
    position: 'absolute',
    right: 10,
    top: 10,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#AFC8BF',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#D2E0DB',
    fontSize: 27,
    marginLeft: 7,
  },
});
