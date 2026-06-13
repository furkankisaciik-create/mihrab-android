import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useDuaFavorites } from '@/hooks/use-dua-favorites';
import { DUAS } from '@/services/dua-library';

export function DuaLibraryPreview() {
  const router = useRouter();
  const { count, loading } = useDuaFavorites();

  return (
    <Pressable
      accessibilityLabel="Dua kütüphanesini aç"
      accessibilityRole="button"
      onPress={() => router.push('/duas')}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>D</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>DUA KÜTÜPHANESİ</Text>
        <Text style={styles.title}>{DUAS.length} kaynaklı Kur’an duası</Text>
        <Text style={styles.subtitle}>
          {loading ? 'Favoriler hazırlanıyor' : `${count} favori · Ara, kategori seç ve kaydet`}
        </Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFF4DC',
    borderColor: '#E8D6A9',
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
    backgroundColor: '#8A6825',
    borderRadius: 15,
    height: 40,
    justifyContent: 'center',
    marginRight: 12,
    width: 40,
  },
  iconText: {
    color: '#FFF4D4',
    fontSize: 15,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#8A6825',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  title: {
    color: '#3F3828',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },
  subtitle: {
    color: '#80745C',
    fontSize: 9,
    marginTop: 3,
  },
  chevron: {
    color: '#8A7650',
    fontSize: 26,
  },
});
