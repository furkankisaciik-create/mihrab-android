import { type Href, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useQuranProgress } from '@/hooks/use-quran-progress';
import { getQuranSurah, TOTAL_QURAN_VERSES } from '@/services/quran-metadata';

export function QuranPreview() {
  const router = useRouter();
  const { state, loading } = useQuranProgress();
  const lastSurah = state.lastRead ? getQuranSurah(state.lastRead.surahNumber) : null;

  return (
    <Pressable
      accessibilityLabel="Kur’an-ı Kerim modülünü aç"
      accessibilityRole="button"
      onPress={() => router.push('/quran' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>ق</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>KUR’AN-I KERİM</Text>
        <Text style={styles.title}>
          {loading
            ? 'Okuma bilgisi hazırlanıyor'
            : lastSurah && state.lastRead
              ? `${lastSurah.name} · ${state.lastRead.verseNumber}. ayetten devam`
              : `114 sure · ${TOTAL_QURAN_VERSES} ayet`}
        </Text>
        <Text style={styles.subtitle}>Arapça metin, Türkçe meal ve çevrimdışı önbellek</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#E9F2ED',
    borderColor: '#C8DDD2',
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
    backgroundColor: '#174D42',
    borderRadius: 15,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  iconText: {
    color: '#F1CF82',
    fontSize: 21,
    fontWeight: '800',
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
    fontSize: 14,
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
