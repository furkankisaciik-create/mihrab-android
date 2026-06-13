import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDailyVerse } from '@/hooks/use-daily-verse';

export function DailyVersePreview() {
  const router = useRouter();
  const { verse, loading } = useDailyVerse();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Günün ayetini aç"
      onPress={() => router.push('/verse')}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>GÜNÜN AYETİ</Text>
          <Text style={styles.title}>
            {verse ? `${verse.surahName} Suresi · ${verse.verseNumber}. Ayet` : 'Hazırlanıyor'}
          </Text>
        </View>
        <View style={styles.openButton}>
          <Text style={styles.openButtonText}>›</Text>
        </View>
      </View>

      {loading && !verse ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#F1CF82" />
          <Text style={styles.loadingText}>Bugünün ayeti getiriliyor</Text>
        </View>
      ) : (
        <Text numberOfLines={3} style={styles.translation}>
          {verse?.translation ?? 'Günlük ayet ekranını açın.'}
        </Text>
      )}

      <Text style={styles.source}>Kur’an Mealleri Ansiklopedisi</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#174D42',
    borderRadius: 22,
    marginBottom: 24,
    padding: 18,
    shadowColor: '#173E35',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.9,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: '#F1CF82',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },
  openButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  openButtonText: {
    color: '#FFFFFF',
    fontSize: 25,
    lineHeight: 27,
  },
  loading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 58,
    paddingTop: 17,
  },
  loadingText: {
    color: '#C5D9D1',
    fontSize: 12,
  },
  translation: {
    color: '#EAF2EF',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 17,
  },
  source: {
    color: '#9DBBB0',
    fontSize: 9,
    marginTop: 13,
  },
});
