const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
] as const;
const REQUEST_TIMEOUT_MS = 18000;

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function parseCoordinate(value: string | null, min: number, max: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max
    ? parsed
    : null;
}

function buildQuery(latitude: number, longitude: number, radiusMeters: number) {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;
  return `[out:json][timeout:16];
(
  nwr["amenity"="place_of_worship"]["religion"="muslim"]${around};
  nwr["building"="mosque"]${around};
);
out center tags;`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = parseCoordinate(searchParams.get('lat'), -90, 90);
  const longitude = parseCoordinate(searchParams.get('lon'), -180, 180);
  const radiusMeters = Number(searchParams.get('radius'));

  if (
    latitude === null ||
    longitude === null ||
    !Number.isInteger(radiusMeters) ||
    radiusMeters < 500 ||
    radiusMeters > 15000
  ) {
    return errorResponse('Geçerli konum ve arama yarıçapı gerekli.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const body = new URLSearchParams({
      data: buildQuery(latitude, longitude, radiusMeters),
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
        return new Response(await response.text(), {
          headers: {
            'Cache-Control': 'public, max-age=300',
            'Content-Type': 'application/json; charset=utf-8',
          },
        });
      }

      lastStatus = response.status;
    }

    return errorResponse(
      `OpenStreetMap cami verisine ulaşılamadı. Kod: ${lastStatus}`,
      502,
    );
  } catch {
    return errorResponse('Cami veri servisine bağlanılamadı.', 502);
  } finally {
    clearTimeout(timeout);
  }
}
