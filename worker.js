// Sorell — SoundCloud API Proxy
// Deploy this to Cloudflare Workers (free tier, 100k req/day)
// Your app calls https://YOUR-WORKER.workers.dev/api/... instead of api-v2.soundcloud.com/...

const SC_CLIENT_ID = 'xNt8bvz9YLecDp6ujjONhKy8iqWsP6wo';
const ALLOWED_ORIGIN = 'https://kingcreeper531.github.io'; // your site

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const url = new URL(request.url);

    // Strip /api prefix and proxy to SoundCloud v2
    const scPath = url.pathname.replace(/^\/api/, '');
    const scUrl = new URL('https://api-v2.soundcloud.com' + scPath);

    // Forward all query params, inject client_id
    url.searchParams.forEach((v, k) => scUrl.searchParams.set(k, v));
    scUrl.searchParams.set('client_id', SC_CLIENT_ID);
    scUrl.searchParams.set('app_version', '1731589474');
    scUrl.searchParams.set('app_locale', 'en');

    try {
      const scRes = await fetch(scUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://soundcloud.com',
          'Referer': 'https://soundcloud.com/',
        },
      });

      const body = await scRes.text();

      return new Response(body, {
        status: scRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Cache-Control': 'public, max-age=60',
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
        },
      });
    }
  },
};