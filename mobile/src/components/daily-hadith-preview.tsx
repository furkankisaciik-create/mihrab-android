import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useDailyHadith } from '@/hooks/use-daily-hadith';

export function DailyHadithPreview() {
  const router = useRouter();
  const { hadith, loading } = useDailyHadith();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Günün hadisini aç"
      onPress={() => router.push({ pathname: '/verse', params: { view: 'hadith' } })}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>GÜNÜN HADİSİ</Text>
          <Text numberOfLines={2} style={styles.title}>
            {hadith?.title ?? 'Hazırlanıyor'}
          </Text>
        </View>
        <View style={styles.openButton}>
          <Text style={styles.openButtonText}>›</Text>
        </View>
      </View>

      {loading && !hadith ? (
        <View style={styles.loading}>
          <ActivityIndicator color="#1A594B" />
          <Text style={styles.loadingText}>Bugünün hadisi getiriliyor</Text>
        </View>
      ) : (
        <Text numberOfLines={3} style={styles.hadithText}>
          {hadith?.text ?? 'Günlük hadis ekranını açın.'}
        </Text>
      )}

      <View style={styles.footer}>
        <Text style={styles.source}>Hadis Tercüme Ansiklopedisi</Text>
        {hadith ? <Text style={styles.grade}>{hadith.grade}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF3D8',
    borderColor: '#E9D8AA',
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 24,
    padding: 18,
  },
  cardPressed: {
    opacity: 0.82,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerCopy: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: '#8B6720',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#3E3829',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 5,
  },
  openButton: {
    alignItems: 'center',
    backgroundColor: '#F1E0B8',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  openButtonText: {
    color: '#6E531C',
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
    color: '#786B4F',
    fontSize: 12,
  },
  hadithText: {
    color: '#554D3A',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 15,
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 13,
  },
  source: {
    color: '#8D7C58',
    flexShrink: 1,
    fontSize: 9,
  },
  grade: {
    color: '#1A594B',
    fontSize: 9,
    fontWeight: '800',
    marginLeft: 10,
  },
});
