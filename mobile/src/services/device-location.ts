import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { getDistricts, getTurkeyCities } from '@/services/diyanet';
import {
  findDiyanetCity,
  findDiyanetDistrict,
  normalizeLocationName,
} from '@/services/location-matching';
import type { PrayerLocation } from '@/types/prayer';

export class LocationPermissionError extends Error {}
export class OutsideTurkeyError extends Error {}

const WEB_REVERSE_GEOCODE_URL =
  'https://api.bigdatacloud.net/data/reverse-geocode-client';

type AdministrativeArea = {
  adminLevel?: number;
  name?: string;
};

type DetectedAddress = {
  isoCountryCode: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  district: string | null;
  subregion: string | null;
  name: string | null;
};

type WebReverseGeocodePayload = {
  countryCode?: string;
  countryName?: string;
  principalSubdivision?: string;
  city?: string;
  locality?: string;
  localityInfo?: {
    administrative?: AdministrativeArea[];
  };
};

async function reverseGeocode(latitude: number, longitude: number): Promise<DetectedAddress | null> {
  if (Platform.OS !== 'web') {
    const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
    return addresses[0] ?? null;
  }

  const query = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    localityLanguage: 'tr',
  });
  const response = await fetch(`${WEB_REVERSE_GEOCODE_URL}?${query.toString()}`);

  if (!response.ok) {
    throw new Error('Telefon konumu şehir bilgisine dönüştürülemedi.');
  }

  const payload = (await response.json()) as WebReverseGeocodePayload;
  const administrative = payload.localityInfo?.administrative ?? [];
  const district =
    administrative.find((area) => area.adminLevel === 6)?.name ??
    administrative.find((area) => area.adminLevel === 5)?.name ??
    payload.locality;

  return {
    isoCountryCode: payload.countryCode ?? null,
    country: payload.countryName ?? null,
    region: payload.principalSubdivision ?? null,
    city: payload.city ?? payload.principalSubdivision ?? null,
    district: district ?? null,
    subregion: district ?? payload.locality ?? null,
    name: payload.locality ?? null,
  };
}

export async function detectDiyanetLocation(): Promise<PrayerLocation> {
  const permission = await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    throw new LocationPermissionError(
      'Konum izni verilmedi. Şehir ve ilçeyi elle seçebilirsiniz.',
    );
  }

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  const address = await reverseGeocode(position.coords.latitude, position.coords.longitude);

  if (!address) {
    throw new Error('Telefon konumu şehir bilgisine dönüştürülemedi.');
  }

  const country = normalizeLocationName(address.isoCountryCode || address.country);
  if (country !== 'TR' && country !== 'TURKIYE' && country !== 'TURKEY') {
    throw new OutsideTurkeyError('MIHRAB şu anda Diyanet Türkiye bölgelerini destekliyor.');
  }

  const cities = await getTurkeyCities();
  const city = findDiyanetCity(cities, [address.region, address.city, address.subregion]);

  if (!city) {
    throw new Error('Bulunduğunuz il Diyanet listesiyle eşleştirilemedi.');
  }

  const districts = await getDistricts(city.id);
  const match = findDiyanetDistrict(districts, city, [
    address.district,
    address.subregion,
    address.city,
    address.name,
  ]);

  return {
    city,
    district: match.district,
    detectedDistrict: address.district ?? address.subregion ?? undefined,
    usedCityCenterFallback: match.usedCityCenterFallback,
  };
}
