import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useQadaTracker } from '@/hooks/use-qada-tracker';

export function QadaTrackerPreview() {
  const router = useRouter();
  const { loading, summary } = useQadaTracker();

  return (
    <Pressable
      accessibilityLabel="Kaza namazı takibini aç"
      accessibilityRole="button"
      onPress={() => router.push('/qada')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>K</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>KAZA NAMAZI TAKİBİ</Text>
        <Text style={styles.title}>
          {loading ? 'Hazırlanıyor' : `${summary.totalRemaining} kaza namazı kaldı`}
        </Text>
        <Text style={styles.subtitle}>
          Bugün {summary.todayCompleted} / {summary.dailyTarget} hedef
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
    borderColor: '#CADFD4',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    marginTop: -10,
    padding: 16,
  },
  pressed: {
    opacity: 0.78,
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
    fontWeight: '900',
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#1D6555',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    color: '#263A33',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  subtitle: {
    color: '#71827B',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#668078',
    fontSize: 26,
  },
});
