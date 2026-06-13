import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MapCoordinates, NearbyMosque } from '@/types/mosque';

type MosqueMapProps = {
  origin: MapCoordinates;
  radiusMeters: number;
  mosques: NearbyMosque[];
  selectedMosqueId: string | null;
  onSelectMosque: (mosqueId: string) => void;
};

type IframeProps = {
  loading: 'lazy';
  referrerPolicy: string;
  src: string;
  style: React.CSSProperties;
  title: string;
};

const Iframe = 'iframe' as unknown as React.ComponentType<IframeProps>;

function getEmbedUrl(
  origin: MapCoordinates,
  radiusMeters: number,
  selected: NearbyMosque | null,
) {
  const latitudeSpan = Math.max(0.015, radiusMeters / 111000);
  const longitudeSpan =
    latitudeSpan /
    Math.max(0.35, Math.cos((origin.latitude * Math.PI) / 180));
  const marker = selected ?? origin;
  const query = new URLSearchParams({
    bbox: [
      origin.longitude - longitudeSpan,
      origin.latitude - latitudeSpan,
      origin.longitude + longitudeSpan,
      origin.latitude + latitudeSpan,
    ].join(','),
    layer: 'mapnik',
    marker: `${marker.latitude},${marker.longitude}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${query.toString()}`;
}

export function MosqueMap({
  origin,
  radiusMeters,
  mosques,
  selectedMosqueId,
  onSelectMosque,
}: MosqueMapProps) {
  const selected =
    mosques.find((mosque) => mosque.id === selectedMosqueId) ?? null;

  return (
    <View style={styles.container}>
      <Iframe
        loading="lazy"
        referrerPolicy="no-referrer"
        src={getEmbedUrl(origin, radiusMeters, selected)}
        style={{
          border: 0,
          height: '100%',
          width: '100%',
        }}
        title="Yakındaki camiler haritası"
      />
      <View style={styles.webBadge}>
        <Text style={styles.webBadgeText}>
          {selected ? selected.name : `${mosques.length} cami bulundu`}
        </Text>
      </View>
      <View style={styles.markerRail}>
        {mosques.slice(0, 5).map((mosque, index) => (
          <Text
            accessibilityRole="button"
            key={mosque.id}
            onPress={() => onSelectMosque(mosque.id)}
            style={[
              styles.markerNumber,
              mosque.id === selectedMosqueId && styles.markerNumberSelected,
            ]}>
            {index + 1}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DCE9E2',
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  webBadge: {
    backgroundColor: 'rgba(18,62,54,0.9)',
    borderRadius: 12,
    left: 12,
    maxWidth: '72%',
    paddingHorizontal: 10,
    paddingVertical: 7,
    position: 'absolute',
    top: 12,
  },
  webBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  markerRail: {
    bottom: 12,
    flexDirection: 'row',
    gap: 6,
    left: 12,
    position: 'absolute',
  },
  markerNumber: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    color: '#1A594B',
    fontSize: 10,
    fontWeight: '900',
    height: 27,
    lineHeight: 27,
    overflow: 'hidden',
    textAlign: 'center',
    width: 27,
  },
  markerNumberSelected: {
    backgroundColor: '#C28A2E',
    color: '#FFFFFF',
  },
});
