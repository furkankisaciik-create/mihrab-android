export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

export type NearbyMosque = MapCoordinates & {
  id: string;
  name: string;
  category: 'Cami' | 'Mescit';
  distanceKm: number;
  bearing: number;
  address: string | null;
  operator: string | null;
  openingHours: string | null;
  wheelchair: 'yes' | 'no' | 'limited' | null;
  osmUrl: string;
};

export type NearbyMosquesSnapshot = {
  origin: MapCoordinates & {
    accuracy: number | null;
  };
  radiusMeters: number;
  mosques: NearbyMosque[];
  fetchedAt: string;
  isCached?: boolean;
};
