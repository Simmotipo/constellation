/**
 * Cloudflare Pages Function: /api/health
 * Performs server-side reachability checks for Constellation endpoints
 * without triggering browser CORS or Cloudflare Access redirect errors.
 */

interface HealthResult {
  url: string;
  status: 'online' | 'degraded' | 'offline';
  code: number;
  latencyMs: number;
  protectedByAccess?: boolean;
  note?: string;
}

async function probeUrl(url: string): Promise<HealthResult> {
  const start = Date.now();
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { url, status: 'offline', code: 0, latencyMs: 0, note: 'Invalid protocol' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Constellation-CloudflarePages-HealthProbe/1.0',
      },
    });
    clearTimeout(timer);

    const latencyMs = Date.now() - start;
    const code = response.status;
    const location = response.headers.get('location') || '';

    // Cloudflare Access login redirects or 401/403 responses confirm the tunnel is live & reachable
    const isAccessProtected =
      (code >= 300 && code < 400 && location.includes('cloudflareaccess.com')) ||
      code === 401 ||
      code === 403;

    // 2xx, 3xx, 405 (Method Not Allowed on HEAD), or Access challenge means the service is online
    const isUp = (code >= 200 && code < 400) || isAccessProtected || code === 405;
    // 4xx (other than 401/403/405) indicates degraded/misconfigured route, while 5xx/530 means tunnel offline
    const isDegraded = code >= 400 && code < 500 && !isAccessProtected && code !== 405;

    return {
      url,
      status: isUp ? 'online' : isDegraded ? 'degraded' : 'offline',
      code,
      latencyMs,
      protectedByAccess: isAccessProtected,
    };
  } catch (err: any) {
    return {
      url,
      status: 'offline',
      code: 0,
      latencyMs: Date.now() - start,
      note: err?.name === 'AbortError' ? 'Timeout' : 'Unreachable',
    };
  }
}

export const onRequestGet = async (context: { request: Request }) => {
  const urlObj = new URL(context.request.url);
  const target = urlObj.searchParams.get('url');

  if (!target) {
    return new Response(JSON.stringify({ error: 'Missing ?url= query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await probeUrl(target);
  return new Response(
    JSON.stringify({
      results: [result],
      checkedAt: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    }
  );
};

export const onRequestPost = async (context: { request: Request }) => {
  try {
    const payload = (await context.request.json()) as { url?: string; urls?: string[] };
    const urls = Array.isArray(payload.urls)
      ? payload.urls.slice(0, 50)
      : payload.url
      ? [payload.url]
      : [];

    const results = await Promise.all(urls.map(probeUrl));

    return new Response(
      JSON.stringify({
        results,
        checkedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
