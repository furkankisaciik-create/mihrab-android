export const KAABA_COORDINATES = {
  latitude: 21.422487,
  longitude: 39.826206,
} as const;

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function toDegrees(value: number) {
  return (value * 180) / Math.PI;
}

export function normalizeDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

export function normalizeSignedDegrees(value: number) {
  const normalized = normalizeDegrees(value);
  return normalized > 180 ? normalized - 360 : normalized;
}

export function calculateQiblaBearing(latitude: number, longitude: number) {
  const latitudeRad = toRadians(latitude);
  const kaabaLatitudeRad = toRadians(KAABA_COORDINATES.latitude);
  const longitudeDelta = toRadians(KAABA_COORDINATES.longitude - longitude);

  const y = Math.sin(longitudeDelta) * Math.cos(kaabaLatitudeRad);
  const x =
    Math.cos(latitudeRad) * Math.sin(kaabaLatitudeRad) -
    Math.sin(latitudeRad) * Math.cos(kaabaLatitudeRad) * Math.cos(longitudeDelta);

  return normalizeDegrees(toDegrees(Math.atan2(y, x)));
}

export function calculateDistanceToKaaba(latitude: number, longitude: number) {
  const latitudeDelta = toRadians(KAABA_COORDINATES.latitude - latitude);
  const longitudeDelta = toRadians(KAABA_COORDINATES.longitude - longitude);
  const latitudeRad = toRadians(latitude);
  const kaabaLatitudeRad = toRadians(KAABA_COORDINATES.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitudeRad) *
      Math.cos(kaabaLatitudeRad) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(haversine));
}

export function calculateTurnAngle(qiblaBearing: number, deviceHeading: number) {
  return normalizeSignedDegrees(qiblaBearing - deviceHeading);
}

export function smoothHeading(previous: number | null, next: number, factor = 0.22) {
  if (previous === null) {
    return normalizeDegrees(next);
  }
  const delta = normalizeSignedDegrees(next - previous);
  return normalizeDegrees(previous + delta * factor);
}

export function getCompassDirection(bearing: number) {
  const directions = [
    'K',
    'KKD',
    'KD',
    'DKD',
    'D',
    'DGD',
    'GD',
    'GGD',
    'G',
    'GGB',
    'GB',
    'BGB',
    'B',
    'BKB',
    'KB',
    'KKB',
  ];
  return directions[Math.round(normalizeDegrees(bearing) / 22.5) % directions.length];
}
