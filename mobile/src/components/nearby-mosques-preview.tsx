import { type Href, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { loadNearbyMosquesCache } from '@/services/mosque-cache';
import { formatMosqueDistance } from '@/services/mosques';
import type { NearbyMosquesSnapshot } from '@/types/mosque';

export function NearbyMosquesPreview() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<NearbyMosquesSnapshot | null>(null);

  useEffect(() => {
    loadNearbyMosquesCache().then(setSnapshot).catch(() => undefined);
  }, []);

  const nearest = snapshot?.mosques[0] ?? null;

  return (
    <Pressable
      accessibilityLabel="Yakındaki camileri haritada aç"
      accessibilityRole="button"
      onPress={() => router.push('/mosques' as Href)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}>
        <View style={styles.dome} />
        <View style={styles.mosqueBody}>
          <View style={styles.door} />
        </View>
        <View style={styles.minaret} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>YAKINDAKİ CAMİLER</Text>
        <Text numberOfLines={1} style={styles.title}>
          {nearest ? nearest.name : 'Haritada yakınındaki camileri bul'}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {nearest
            ? `${formatMosqueDistance(nearest.distanceKm)} uzakta · ${snapshot?.mosques.length ?? 0} sonuç`
            : 'Konumuna göre mesafe, harita ve yol tarifi'}
        </Text>
      </View>

      <View style={styles.action}>
        <Text style={styles.actionText}>HARİTA</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#F0E9DA',
    borderColor: '#E0D1B2',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 24,
    padding: 15,
  },
  pressed: {
    opacity: 0.82,
  },
  icon: {
    alignItems: 'center',
    height: 54,
    justifyContent: 'flex-end',
    marginRight: 13,
    position: 'relative',
    width: 54,
  },
  dome: {
    backgroundColor: '#1A594B',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 15,
    width: 38,
  },
  mosqueBody: {
    alignItems: 'center',
    backgroundColor: '#1A594B',
    height: 23,
    justifyContent: 'flex-end',
    width: 42,
  },
  door: {
    backgroundColor: '#F1CF82',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    height: 14,
    width: 10,
  },
  minaret: {
    backgroundColor: '#C28A2E',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    height: 41,
    position: 'absolute',
    right: 2,
    top: 5,
    width: 5,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: '#8B6428',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 1.05,
  },
  title: {
    color: '#263A33',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  subtitle: {
    color: '#786D59',
    fontSize: 9,
    marginTop: 3,
  },
  action: {
    alignItems: 'center',
    marginLeft: 8,
  },
  actionText: {
    color: '#8B6428',
    fontSize: 7,
    fontWeight: '900',
  },
  chevron: {
    color: '#8B6428',
    fontSize: 25,
    lineHeight: 25,
  },
});
