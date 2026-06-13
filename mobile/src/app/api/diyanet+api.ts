const DIYANET_BASE_URL = 'https://namazvakitleri.diyanet.gov.tr';
const TURKEY_ID = '2';
const REQUEST_TIMEOUT_MS = 15000;

async function fetchUpstreamOnce(url: string, accept: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: { Accept: accept },
      signal: controller.signal,
    });

    if (!response.ok) {
      const error = new Error(`Upstream service returned ${response.status}.`);
      Object.assign(error, { status: response.status });
      throw error;
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchUpstream(url: string, accept: string) {
  try {
    return await fetchUpstreamOnce(url, accept);
  } catch (error) {
    const status =
      error instanceof Error && 'status' in error
        ? Number((error as Error & { status: number }).status)
        : 0;

    if (status >= 400 && status < 500 && status !== 429) {
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, 350));
    return fetchUpstreamOnce(url, accept);
  }
}

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function proxiedResponse(body: string, contentType: string, maxAge: number) {
  return new Response(body, {
    headers: {
      'Cache-Control': `public, max-age=${maxAge}`,
      'Content-Type': contentType,
    },
  });
}

async function proxyDiyanetRegions(searchParams: URLSearchParams, action: string) {
  const query = new URLSearchParams({
    ChangeType: action === 'cities' ? 'country' : 'state',
    CountryId: TURKEY_ID,
    Culture: 'tr-TR',
  });

  if (action === 'districts') {
    const cityId = searchParams.get('cityId') ?? '';
    if (!/^\d+$/.test(cityId)) {
      return errorResponse('Gecerli bir il kimligi gerekli.');
    }
    query.set('StateId', cityId);
  }

  const response = await fetchUpstream(
    `${DIYANET_BASE_URL}/tr-TR/home/GetRegList?${query.toString()}`,
    'application/json',
  );
  return proxiedResponse(await response.text(), 'application/json; charset=utf-8', 86400);
}

async function proxyPrayerPage(searchParams: URLSearchParams) {
  const path = searchParams.get('path') ?? '';
  const validPath = /^\/tr-TR\/\d+\/[a-z0-9-]+-icin-namaz-vakti$/i;

  if (!validPath.test(path)) {
    return errorResponse('Gecerli bir Diyanet vakit yolu gerekli.');
  }

  const response = await fetchUpstream(`${DIYANET_BASE_URL}${path}`, 'text/html');
  return proxiedResponse(await response.text(), 'text/html; charset=utf-8', 900);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    if (action === 'cities' || action === 'districts') {
      return await proxyDiyanetRegions(searchParams, action);
    }
    if (action === 'prayer') {
      return await proxyPrayerPage(searchParams);
    }
    return errorResponse('Desteklenmeyen istek.');
  } catch (error) {
    const message =
      error instanceof Error && error.name === 'AbortError'
        ? 'Kaynak servise baglanma zaman asimina ugradi.'
        : 'Kaynak servise baglanilamadi.';
    return errorResponse(message, 502);
  }
}
