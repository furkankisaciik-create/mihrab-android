import MapView, { Circle, Marker, type Region } from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

import type { MapCoordinates, NearbyMosque } from '@/types/mosque';

type MosqueMapProps = {
  origin: MapCoordinates;
  radiusMeters: number;
  mosques: NearbyMosque[];
  selectedMosqueId: string | null;
  onSelectMosque: (mosqueId: string) => void;
};

function getRegion(
  origin: MapCoordinates,
  radiusMeters: number,
): Region {
  const latitudeDelta = Math.max(0.025, (radiusMeters / 111000) * 2.35);
  const longitudeDelta =
    latitudeDelta /
    Math.max(0.35, Math.cos((origin.latitude * Math.PI) / 180));

  return {
    ...origin,
    latitudeDelta,
    longitudeDelta,
  };
}

export function MosqueMap({
  origin,
  radiusMeters,
  mosques,
  selectedMosqueId,
  onSelectMosque,
}: MosqueMapProps) {
  const region = getRegion(origin, radiusMeters);

  return (
    <View style={styles.container}>
      <MapView
        initialRegion={region}
        region={region}
        showsCompass
        showsMyLocationButton
        showsUserLocation
        style={StyleSheet.absoluteFill}>
        <Circle
          center={origin}
          fillColor="rgba(26,89,75,0.06)"
          radius={radiusMeters}
          strokeColor="rgba(26,89,75,0.36)"
          strokeWidth={1}
        />
        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            coordinate={mosque}
            description={`${mosque.category} · ${mosque.distanceKm.toFixed(1)} km`}
            onPress={() => onSelectMosque(mosque.id)}
            pinColor={mosque.id === selectedMosqueId ? '#C28A2E' : '#1A594B'}
            title={mosque.name}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DCE9E2',
    flex: 1,
  },
});
