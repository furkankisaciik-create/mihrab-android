import { Platform } from 'react-native';

import { normalizeDegrees } from '@/services/qibla';
import type {
  MapCoordinates,
  NearbyMosque,
  NearbyMosquesSnapshot,
} from '@/types/mosque';

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
] as const;
const REQUEST_TIMEOUT_MS = 18000;
const EARTH_RADIUS_KM = 6371.0088;
const MAX_RESULTS = 80;

type OsmTags = Record<string, string | undefined>;

type OverpassElement = {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: OsmTags;
};

type OverpassPayload = {
  elements?: OverpassElement[];
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

export function calculateDistanceKm(
  origin: MapCoordinates,
  destination: MapCoordinates,
) {
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function calculateBearing(
  origin: MapCoordinates,
  destination: MapCoordinates,
) {
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const longitudeDelta = toRadians(
    destination.longitude - origin.longitude,
  );
  const y = Math.sin(longitudeDelta) * Math.cos(destinationLatitude);
  const x =
    Math.cos(originLatitude) * Math.sin(destinationLatitude) -
    Math.sin(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.cos(longitudeDelta);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

function buildOverpassQuery(
  latitude: number,
  longitude: number,
  radiusMeters: number,
) {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;

  return `[out:json][timeout:16];
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"]${around};
  nwr["building"="mosque"]${around};
);
out center tags;`;
}

function getElementCoordinates(element: OverpassElement) {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return null;
  }

  return { latitude, longitude };
}

function getMosqueName(tags: OsmTags, category: NearbyMosque['category']) {
  return (
    tags['name:tr']?.trim() ||
    tags.name?.trim() ||
    tags['official_name']?.trim() ||
    (category === 'Mescit' ? 'İsimsiz mescit' : 'İsimsiz cami')
  );
}

function getAddress(tags: OsmTags) {
  const street = [tags['addr:street'], tags['addr:housenumber']]
    .filter(Boolean)
    .join(' ');
  const parts = [
    street,
    tags['addr:neighbourhood'] || tags['addr:suburb'],
    tags['addr:district'],
    tags['addr:city'],
  ].filter((value): value is string => Boolean(value?.trim()));

  return parts.length ? [...new Set(parts)].join(', ') : null;
}

function parseWheelchair(value?: string): NearbyMosque['wheelchair'] {
  if (value === 'yes' || value === 'no' || value === 'limited') {
    return value;
  }
  return null;
}

export function parseNearbyMosques(
  payload: OverpassPayload,
  origin: MapCoordinates,
  radiusMeters: number,
) {
  const seen = new Set<string>();
  const mosques: NearbyMosque[] = [];

  for (const element of payload.elements ?? []) {
    const coordinates = getElementCoordinates(element);
    if (!coordinates) {
      continue;
    }

    const tags = element.tags ?? {};
    if (
      tags.building === 'construction' ||
      tags.construction === 'mosque'
    ) {
      continue;
    }

    const rawName =
      tags['name:tr']?.trim() ||
      tags.name?.trim() ||
      tags.official_name?.trim() ||
      '';
    const category: NearbyMosque['category'] =
      /mescit|masjid/i.test(rawName) ? 'Mescit' : 'Cami';
    const name = getMosqueName(tags, category);
    const distanceKm = calculateDistanceKm(origin, coordinates);
    if (distanceKm * 1000 > radiusMeters * 1.08) {
      continue;
    }

    const coordinateKey = `${coordinates.latitude.toFixed(5)}:${coordinates.longitude.toFixed(5)}`;
    const nameKey = name.toLocaleLowerCase('tr-TR');
    const duplicateKey = `${nameKey}:${coordinateKey}`;
    if (seen.has(duplicateKey)) {
      continue;
    }
    seen.add(duplicateKey);

    mosques.push({
      id: `${element.type}/${element.id}`,
      name,
      category,
      ...coordinates,
      distanceKm,
      bearing: calculateBearing(origin, coordinates),
      address: getAddress(tags),
      operator: tags.operator?.trim() || null,
      openingHours: tags.opening_hours?.trim() || null,
      wheelchair: parseWheelchair(tags.wheelchair),
      osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
    });
  }

  return mosques
    .sort((left, right) => left.distanceKm - right.distanceKm)
    .slice(0, MAX_RESULTS);
}

async function fetchOverpass(
  latitude: number,
  longitude: number,
  radiusMeters: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    if (Platform.OS === 'web') {
      const query = new URLSearchParams({
        lat: String(latitude),
        lon: String(longitude),
        radius: String(radiusMeters),
      });
      const response = await fetch(`/api/mosques?${query.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error('Cami verisi alınamadı.');
      }
      return (await response.json()) as OverpassPayload;
    }

    const body = new URLSearchParams({
      data: buildOverpassQuery(latitude, longitude, radiusMeters),
    }).toString();
    let lastStatus = 0;

    for (const url of OVERPASS_URLS) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'MIHRAB/1.0 nearby-mosques',
        },
        body,
        signal: controller.signal,
      });

      if (response.ok) {
        return (await response.json()) as OverpassPayload;
      }

      lastStatus = response.status;
    }

    throw new Error(`Cami veri servisi ${lastStatus} yanıtını verdi.`);
  } finally {
    clearTimeout(timeout);
  }
}

export async function getNearbyMosques(
  origin: NearbyMosquesSnapshot['origin'],
  radiusMeters: number,
): Promise<NearbyMosquesSnapshot> {
  try {
    const payload = await fetchOverpass(
      origin.latitude,
      origin.longitude,
      radiusMeters,
    );

    return {
      origin,
      radiusMeters,
      mosques: parseNearbyMosques(payload, origin, radiusMeters),
      fetchedAt: new Date().toISOString(),
      isCached: false,
    };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Cami araması zaman aşımına uğradı. Tekrar deneyin.');
    }
    throw error;
  }
}

export function formatMosqueDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.max(10, Math.round((distanceKm * 1000) / 10) * 10)} m`;
  }
  return `${distanceKm.toLocaleString('tr-TR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: distanceKm < 10 ? 1 : 0,
  })} km`;
}
