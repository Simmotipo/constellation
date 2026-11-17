import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

async function checkTargetUrl(url: string) {
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
        'User-Agent': 'Constellation-Launcher-HealthProbe/1.0',
      },
    });
    clearTimeout(timer);

    const latencyMs = Date.now() - start;
    const code = response.status;
    const location = response.headers.get('location') || '';

    // Cloudflare Access redirects (302 to *.cloudflareaccess.com) or 401/403 mean the tunnel is online & protected
    const isAccessProtected =
      (code >= 300 && code < 400 && location.includes('cloudflareaccess.com')) ||
      code === 401 ||
      code === 403;

    // Cloudflare Tunnel down errors are typically 502, 503, 521, 522, 523, 524, 530
    const isUp = (code >= 200 && code < 400) || isAccessProtected || code === 405;
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

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'local-cloudflare-health-function',
      configureServer(server) {
        server.middlewares.use('/api/health', async (req, res) => {
          if (req.method === 'POST') {
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body || '{}');
                const urls: string[] = Array.isArray(payload.urls)
                  ? payload.urls.slice(0, 50)
                  : payload.url
                  ? [payload.url]
                  : [];
                const results = await Promise.all(urls.map(checkTargetUrl));
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ results, checkedAt: new Date().toISOString() }));
              } catch {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              }
            });
            return;
          }

          const urlObj = new URL(req.url || '', 'http://localhost');
          const target = urlObj.searchParams.get('url');
          if (!target) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing ?url= parameter or POST body' }));
            return;
          }
          const result = await checkTargetUrl(target);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ results: [result], checkedAt: new Date().toISOString() }));
        });
      },
    },
  ],
});
