import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useDhikrCounter } from '@/hooks/use-dhikr-counter';

export function DhikrPreview() {
  const router = useRouter();
  const { loading, selectedPreset, selectedSession, summary } = useDhikrCounter();
  const progress = Math.min(100, (selectedSession.count / selectedSession.target) * 100);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Zikir sayacını aç"
      onPress={() => router.push('/dhikr')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>●</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.eyebrow}>ZİKİR SAYACI</Text>
          <Text style={styles.title}>{loading ? 'Hazırlanıyor' : selectedPreset.title}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>

      <View style={styles.statusRow}>
        <Text style={styles.count}>
          {selectedSession.count}
          <Text style={styles.target}> / {selectedSession.target}</Text>
        </Text>
        <Text style={styles.today}>Bugün {summary.today.total} zikir</Text>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E8F1EC',
    borderRadius: 20,
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
    fontSize: 15,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#537168',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  title: {
    color: '#233B34',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  chevron: {
    color: '#537168',
    fontSize: 26,
  },
  statusRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  count: {
    color: '#174D42',
    fontSize: 22,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  target: {
    color: '#72847D',
    fontSize: 12,
    fontWeight: '700',
  },
  today: {
    color: '#667972',
    fontSize: 10,
    fontWeight: '700',
  },
  progressTrack: {
    backgroundColor: '#D1E0D9',
    borderRadius: 6,
    height: 6,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#1A594B',
    borderRadius: 6,
    height: '100%',
  },
});
