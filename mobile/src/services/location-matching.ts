import type { DiyanetCity, DiyanetDistrict } from '../types/prayer';

export function normalizeLocationName(value?: string | null) {
  return (value ?? '')
    .toLocaleUpperCase('tr-TR')
    .replace(/İ/g, 'I')
    .replace(/Ç/g, 'C')
    .replace(/Ğ/g, 'G')
    .replace(/Ö/g, 'O')
    .replace(/Ş/g, 'S')
    .replace(/Ü/g, 'U')
    .replace(/\b(ILI|ILCESI|PROVINCE|DISTRICT)\b/g, '')
    .replace(/[^A-Z0-9]/g, '');
}

function findByCandidates<T extends { name: string }>(items: T[], candidates: (string | null)[]) {
  const normalizedCandidates = candidates.map(normalizeLocationName).filter(Boolean);

  return items.find((item) => {
    const itemName = normalizeLocationName(item.name);
    return normalizedCandidates.some(
      (candidate) =>
        candidate === itemName ||
        (candidate.length >= 5 && (candidate.includes(itemName) || itemName.includes(candidate))),
    );
  });
}

export function findDiyanetCity(cities: DiyanetCity[], candidates: (string | null)[]) {
  return findByCandidates(cities, candidates);
}

export function findDiyanetDistrict(
  districts: DiyanetDistrict[],
  city: DiyanetCity,
  candidates: (string | null)[],
) {
  const detected = findByCandidates(districts, candidates);

  if (detected) {
    return { district: detected, usedCityCenterFallback: false };
  }

  const cityCenter =
    findByCandidates(districts, [city.name]) ??
    districts.find((district) => normalizeLocationName(district.name).includes('MERKEZ')) ??
    districts[0];

  return { district: cityCenter, usedCityCenterFallback: true };
}
