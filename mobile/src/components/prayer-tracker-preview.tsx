import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { usePrayerTracker } from '@/hooks/use-prayer-tracker';
import { TRACKED_PRAYERS } from '@/services/prayer-tracker';

export function PrayerTrackerPreview() {
  const router = useRouter();
  const { state, loading, summary } = usePrayerTracker();
  const today = state.days[state.currentDateKey];
  const progress = (summary.todayCompleted / TRACKED_PRAYERS.length) * 100;

  return (
    <Pressable
      accessibilityLabel="Namaz takibini aç"
      accessibilityRole="button"
      onPress={() => router.push('/tracker')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>NAMAZ TAKİBİ</Text>
          <Text style={styles.title}>
            {loading
              ? 'Hazırlanıyor'
              : summary.todayCompleted === TRACKED_PRAYERS.length
                ? 'Bugünün namazları tamam'
                : `${summary.todayCompleted} / ${TRACKED_PRAYERS.length} namaz kılındı`}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.prayerDots}>
        {TRACKED_PRAYERS.map((prayer) => {
          const completed = Boolean(today?.prayers[prayer.key]);
          return (
            <View key={prayer.key} style={styles.prayerDotItem}>
              <View style={[styles.prayerDot, completed && styles.prayerDotCompleted]}>
                <Text style={[styles.prayerDotText, completed && styles.prayerDotTextCompleted]}>
                  {completed ? '✓' : prayer.symbol}
                </Text>
              </View>
              <Text style={styles.prayerName}>{prayer.name}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF5DE',
    borderColor: '#EAD9AA',
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
    padding: 16,
  },
  pressed: {
    opacity: 0.78,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  iconText: {
    color: '#F1CF82',
    fontSize: 17,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#876D32',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: '#3F3725',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  chevron: {
    color: '#8B7A51',
    fontSize: 26,
  },
  prayerDots: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  prayerDotItem: {
    alignItems: 'center',
  },
  prayerDot: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderColor: '#E5D7B3',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  prayerDotCompleted: {
    backgroundColor: '#1A594B',
    borderColor: '#1A594B',
  },
  prayerDotText: {
    color: '#8A7B55',
    fontSize: 12,
  },
  prayerDotTextCompleted: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  prayerName: {
    color: '#857651',
    fontSize: 8,
    fontWeight: '700',
    marginTop: 4,
  },
  progressTrack: {
    backgroundColor: '#E9DCBA',
    borderRadius: 6,
    height: 6,
    marginTop: 13,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1A594B',
    borderRadius: 6,
    height: '100%',
  },
});
