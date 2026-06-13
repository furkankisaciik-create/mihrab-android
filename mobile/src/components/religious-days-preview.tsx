import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getIstanbulDateKey } from '@/services/daily-content-date';
import {
  formatReligiousCountdown,
  formatReligiousDayDate,
  getDaysUntil,
  getNextReligiousDay,
} from '@/services/religious-days';

export function ReligiousDaysPreview() {
  const router = useRouter();
  const todayKey = getIstanbulDateKey();
  const nextDay = getNextReligiousDay(todayKey);

  if (!nextDay) {
    return null;
  }

  const daysUntil = getDaysUntil(nextDay.dateKey, todayKey);

  return (
    <Pressable
      accessibilityLabel="Dini günler ve geceler takvimini aç"
      accessibilityRole="button"
      onPress={() => router.push('/holy-days' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>✦</Text>
      </View>

      <View style={styles.copy}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.eyebrow}>SIRADAKİ DİNİ GÜN</Text>
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>
              {formatReligiousCountdown(daysUntil)}
            </Text>
          </View>
        </View>
        <Text style={styles.title}>{nextDay.name}</Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {formatReligiousDayDate(nextDay.dateKey)} · {nextDay.hijriDate}
        </Text>
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#E9F2ED',
    borderColor: '#C7DDD2',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 15,
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#174D42',
    borderRadius: 17,
    height: 54,
    justifyContent: 'center',
    marginRight: 13,
    width: 54,
  },
  iconText: {
    color: '#F1CF82',
    fontSize: 22,
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
    color: '#1D6555',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1,
  },
  countdownBadge: {
    backgroundColor: '#D4E6DD',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  countdownText: {
    color: '#1A594B',
    fontSize: 7,
    fontWeight: '900',
  },
  title: {
    color: '#263A33',
    fontSize: 15,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#71827B',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#668078',
    fontSize: 27,
    marginLeft: 7,
  },
});
